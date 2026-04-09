import { Box, Typography } from "@mui/material";
import { CartSelectedLensLines } from "../../cart/CartSelectedLensLines";
import type { CartItemDto } from "../../../lib/types/cart";
import type { CartLensLineDisplayMeta } from "../../../lib/types/lensSelection";
import { cartItemPerUnitEa, showRxLensPriceSplit } from "../orderSummaryItemUtils";
import { RxMergedPricingTable } from "./RxMergedPricingTable";

type Props = {
  item: CartItemDto;
  hasRx: boolean;
  lensDisplay?: CartLensLineDisplayMeta;
  formatMoney: (n: number) => string;
};

export function CheckoutOrderSummaryItem({ item, hasRx, lensDisplay, formatMoney }: Props) {
  const splitLens = showRxLensPriceSplit(item, hasRx);
  const perEa = cartItemPerUnitEa(item);

  if (splitLens) {
    return (
      <Box
        sx={{
          mb: 2,
          pb: 2,
          borderBottom: "1px solid #F1F1F1",
          "&:last-of-type": { borderBottom: "none", pb: 0, mb: 0 },
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: "#F4F4F5",
              overflow: "hidden",
              flexShrink: 0,
              border: "1px solid #ECECEC",
            }}
          >
            {item.productImageUrl ? (
              <Box
                component="img"
                src={item.productImageUrl}
                alt=""
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : null}
          </Box>

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
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#171717",
                    lineHeight: 1.3,
                  }}
                >
                  {item.productName}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#A1A1AA", mt: 0.25 }}>
                  Qty {item.quantity}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#171717",
                  fontVariantNumeric: "tabular-nums",
                  flexShrink: 0,
                }}
              >
                {formatMoney(item.subtotal ?? item.price * item.quantity)}
              </Typography>
            </Box>

            <RxMergedPricingTable
              framePrice={item.price}
              lensPrice={item.lensPrice ?? 0}
              coatingExtraPrice={item.coatingExtraPrice ?? 0}
              perUnitPrice={perEa}
              lensDisplay={lensDisplay}
              lensVariantName={item.lensVariantName}
              formatMoney={formatMoney}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        mb: 1.25,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 1.5,
          bgcolor: "#F7F7F7",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {item.productImageUrl ? (
          <Box
            component="img"
            src={item.productImageUrl}
            alt=""
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : null}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 14,
            color: "#171717",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.productName}
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#8A8A8A" }}>
          × {item.quantity}
          <Box component="span" sx={{ color: "#BDBDBD", mx: 0.5 }}>
            ·
          </Box>
          {formatMoney(perEa)} each
        </Typography>
        {hasRx ? (
          <Typography fontSize={12} fontWeight={700} sx={{ mt: 0.25, color: "#B68C5A" }}>
            Prescription
          </Typography>
        ) : null}
        {hasRx ? (
          <CartSelectedLensLines
            item={item}
            lensDisplay={lensDisplay}
            formatMoney={formatMoney}
            dense
            summaryVariant="checkout"
          />
        ) : null}
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#171717", flexShrink: 0 }}>
        {formatMoney(item.subtotal ?? item.price * item.quantity)}
      </Typography>
    </Box>
  );
}
