import { Box, Typography } from "@mui/material";
import { useProductDetail } from "../../lib/hooks/useProducts";
import { formatMoney } from "../../lib/utils/format";
import { PrescriptionDisplay } from "../../app/shared/components/PrescriptionDisplay";
import { getOrderItemImage } from "./orderImageCache";
import { getOrderPrescription } from "./orderPrescriptionCache";
import type { PrescriptionData } from "../../lib/types/prescription";
import { getTrustedPrescriptionImageUrl } from "../../lib/utils/getTrustedPrescriptionImageUrl";
import type { OrderRxLineSnapshot } from "./orderRxLineCache";
import { RxMergedPricingTable } from "../checkout/components/RxMergedPricingTable";

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

const RX_THUMB_PX = 48;
const RX_GAP_PX = 12;

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
  /** Prescription resolved from API order detail (preferred source). */
  prescription?: PrescriptionData;
  /** When true (Order Detail page), show full prescription details instead of label only. */
  showPrescriptionDetails?: boolean;
  /** FE-only snapshot from checkout — PRESCRIPTION & PRICING table */
  rxLineSnapshot?: OrderRxLineSnapshot | null;
}

/** Renders one order item with thumbnail (item / cache / GET /products/:id), name, price */
export function OrderItemRow({
  item,
  compact,
  orderId,
  prescription: prescriptionFromProps,
  showPrescriptionDetails,
  rxLineSnapshot,
}: OrderItemRowProps) {
  const imageFromItem =
    (item as { imageUrl?: string }).imageUrl ??
    (item as { productImageUrl?: string }).productImageUrl;
  const productId = (item as { productId?: string }).productId;
  const productVariantId = (item as { productVariantId?: string }).productVariantId;
  const cachedImage = getOrderItemImage(orderId, productVariantId);
  const hasImage = imageFromItem ?? cachedImage;
  const { product } = useProductDetail(hasImage ? undefined : productId ?? undefined);
  const firstProductImage = product?.images?.[0];
  const imageUrl = imageFromItem ?? cachedImage ?? (typeof firstProductImage === "string" ? firstProductImage : firstProductImage?.url) ?? "";

  const name =
    (item as { productName?: string }).productName ??
    (item as { name?: string }).name ??
    "Product";
  const variantName = (item as { variantName?: string }).variantName;
  const qty = item.quantity ?? 1;
  const price = getItemPrice(item as Parameters<typeof getItemPrice>[0]);
  const unitPrice =
    (item as { unitPrice?: number }).unitPrice ?? (item as { price?: number }).price ?? 0;
  const perEa = qty > 0 ? price / qty : unitPrice;

  const prescription =
    prescriptionFromProps ?? (orderId && item.id ? getOrderPrescription(orderId, item.id) : undefined);
  const trustedPrescriptionImageUrl = getTrustedPrescriptionImageUrl(
    prescription?.imageUrl
  );

  const thumbSize = compact ? 40 : 56;

  const thumbBox = (size: number) => (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 2.5,
        bgcolor: "#F7F7F7",
        border: "1px solid #ECECEC",
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
  );

  if (rxLineSnapshot) {
    const rxThumb = compact ? 44 : RX_THUMB_PX;
    return (
      <Box sx={{ py: compact ? 0.75 : 1.5, px: compact ? 1.5 : 2 }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          {thumbBox(rxThumb)}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 1,
                mb: 1,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  fontSize={compact ? 14 : 15}
                  fontWeight={700}
                  sx={{ color: "#171717", lineHeight: 1.3 }}
                >
                  {name}
                </Typography>
                <Typography fontSize={12} sx={{ color: "#A1A1AA", mt: 0.25 }}>
                  Qty {qty}
                  {variantName ? (
                    <Box component="span" sx={{ color: "#8A8A8A" }}>
                      {" "}
                      · {variantName}
                    </Box>
                  ) : null}
                </Typography>
              </Box>
              <Typography
                fontSize={compact ? 14 : 15}
                fontWeight={800}
                sx={{ flexShrink: 0, color: "#171717", fontVariantNumeric: "tabular-nums" }}
              >
                {formatMoney(price)}
              </Typography>
            </Box>
            <RxMergedPricingTable
              framePrice={rxLineSnapshot.framePrice}
              lensPrice={rxLineSnapshot.lensPrice}
              coatingExtraPrice={rxLineSnapshot.coatingExtraPrice}
              perUnitPrice={perEa}
              lensDisplay={rxLineSnapshot.lensDisplay ?? undefined}
              lensVariantName={rxLineSnapshot.lensVariantName}
              coatingOptionLabel={rxLineSnapshot.coatingOptionLabel}
              formatMoney={formatMoney}
              showPerUnit={false}
            />
          </Box>
        </Box>
        {prescription && showPrescriptionDetails ? (
          <Box
            sx={{
              mt: 1,
              pl: `${rxThumb + RX_GAP_PX}px`,
            }}
          >
            {trustedPrescriptionImageUrl ? (
              <Box sx={{ mb: 0.75 }}>
                <Typography
                  component="a"
                  href={trustedPrescriptionImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  fontSize={12}
                  fontWeight={700}
                  sx={{ color: "#B68C5A", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                >
                  View uploaded prescription
                </Typography>
              </Box>
            ) : null}
            <PrescriptionDisplay prescription={prescription} variant="block" />
          </Box>
        ) : null}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: compact ? 0.75 : 1.5,
        px: compact ? 1.5 : 2,
        transition: "background-color 180ms ease",
        "@media (hover: hover)": {
          "&:hover": {
            bgcolor: "#FAFAFA",
          },
        },
      }}
    >
      {thumbBox(thumbSize)}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          fontSize={compact ? 14 : 15}
          fontWeight={compact ? 600 : 700}
          noWrap
          sx={{ color: "#171717" }}
        >
          {name}
        </Typography>
        <Typography fontSize={13} sx={{ color: "#8A8A8A" }}>
          {variantName ? `${variantName} · Qty ${qty}` : `Qty ${qty}`}
        </Typography>
        {prescription &&
          (showPrescriptionDetails ? (
            <Box sx={{ mt: 0.5 }}>
              {trustedPrescriptionImageUrl ? (
                <Box sx={{ mb: 0.75 }}>
                  <Typography
                    component="a"
                    href={trustedPrescriptionImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    fontSize={12}
                    fontWeight={700}
                    sx={{ color: "#B68C5A", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                  >
                    View uploaded prescription
                  </Typography>
                </Box>
              ) : null}
              <PrescriptionDisplay prescription={prescription} variant="inline" />
            </Box>
          ) : (
            <Typography
              fontSize={12}
              fontWeight={700}
              sx={{ mt: 0.25, color: "#B68C5A" }}
            >
              Prescription
            </Typography>
          ))}
      </Box>

      <Typography
        fontSize={compact ? 14 : 15}
        fontWeight={700}
        sx={{ flexShrink: 0, color: "#171717" }}
      >
        {formatMoney(price)}
      </Typography>
    </Box>
  );
}
