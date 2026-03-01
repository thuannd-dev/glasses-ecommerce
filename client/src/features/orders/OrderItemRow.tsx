import { Box, Typography } from "@mui/material";
import { useProductDetail } from "../../lib/hooks/useProducts";
import { formatMoney } from "../../lib/utils/format";
import { PrescriptionDisplay } from "../../app/shared/components/PrescriptionDisplay";
import { getOrderItemImage } from "./orderImageCache";
import { getOrderPrescription } from "./orderPrescriptionCache";

function getItemPrice(item: {
  totalPrice?: number;
  subtotal?: number;
  unitPrice?: number;
  price?: number;
  quantity?: number;
}): number {
  const total = (item as { totalPrice?: number }).totalPrice ?? (item as { subtotal?: number }).subtotal;
  if (total != null) return total;
  const u = (item as { unitPrice?: number }).unitPrice ?? (item as { price?: number }).price;
  const q = item.quantity ?? 1;
  return (u ?? 0) * q;
}

export interface OrderItemRowProps {
  item: {
    id: string;
    productId?: string;
    productVariantId?: string;
    productName?: string;
    name?: string;
    variantName?: string | null;
    quantity?: number;
    totalPrice?: number;
    subtotal?: number;
    unitPrice?: number;
    price?: number;
    imageUrl?: string;
    productImageUrl?: string;
  };
  /** Compact = smaller thumb, single line on mobile */
  compact?: boolean;
  /** Order id for cache lookup (ảnh từ cart khi place order) */
  orderId?: string;
}

/** Renders one order item with thumbnail (item / cache / GET /products/:id), name, price */
export function OrderItemRow({ item, compact, orderId }: OrderItemRowProps) {
  const imageFromItem =
    (item as { imageUrl?: string }).imageUrl ??
    (item as { productImageUrl?: string }).productImageUrl;
  const productId = (item as { productId?: string }).productId;
  const productVariantId = (item as { productVariantId?: string }).productVariantId;
  const cachedImage = getOrderItemImage(orderId, productVariantId);
  const hasImage = imageFromItem ?? cachedImage;
  // Chỉ gọi GET /products/:id khi có productId — API không nhận productVariantId, gọi với variantId sẽ 404
  const { product } = useProductDetail(hasImage ? undefined : productId ?? undefined);
  const imageUrl = imageFromItem ?? cachedImage ?? (product?.images?.[0] ?? "");

  const name =
    (item as { productName?: string }).productName ??
    (item as { name?: string }).name ??
    "Product";
  const variantName = (item as { variantName?: string }).variantName;
  const qty = item.quantity ?? 1;
  const price = getItemPrice(item as Parameters<typeof getItemPrice>[0]);

  const thumbSize = compact ? 40 : 56;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: compact ? 0.75 : 1.5,
        px: compact ? 1.5 : 2,
      }}
    >
      <Box
        sx={{
          width: thumbSize,
          height: thumbSize,
          borderRadius: 2,
          bgcolor: "rgba(17,24,39,0.06)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt=""
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography fontSize={10} color="text.secondary">
              No image
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontSize={compact ? 14 : 15} fontWeight={600} noWrap>
          {name}
        </Typography>
        <Typography fontSize={13} color="text.secondary">
          {variantName ? `${variantName} · Qty ${qty}` : `Qty ${qty}`}
        </Typography>
        {orderId && productVariantId && (() => {
          const prescription = getOrderPrescription(orderId, productVariantId);
          return prescription ? (
            <PrescriptionDisplay prescription={prescription} variant="inline" />
          ) : null;
        })()}
      </Box>

      <Typography fontSize={compact ? 14 : 15} fontWeight={700} sx={{ flexShrink: 0 }}>
        {formatMoney(price)}
      </Typography>
    </Box>
  );
}
