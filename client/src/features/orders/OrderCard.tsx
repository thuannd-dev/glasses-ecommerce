import { Box, Typography, Paper, Button, Chip, Skeleton } from "@mui/material";
import { NavLink } from "react-router-dom";
import { useOrder } from "../../lib/hooks/useOrders";
import type { MyOrderSummaryDto } from "../../lib/types/order";
import { formatMoney } from "../../lib/utils/format";
import { OrderItemRow, type OrderItemRowProps } from "./OrderItemRow";

const PALETTE = {
  cardBg: "#FFFFFF",
  border: "#ECECEC",
  divider: "#F1F1F1",
  textMain: "#171717",
  textSecondary: "#6B6B6B",
  textMuted: "#8A8A8A",
  accent: "#B68C5A",
  accentHover: "#9E7748",
  status: {
    Shipped: { bg: "#F3EBDD", text: "#7A5A33", border: "#E7D6BA" },
    Pending: { bg: "#F4F4F8", text: "#4A4A72", border: "#E0E0F0" },
    ReadyStock: { bg: "#F6F6F6", text: "#4B4B4B", border: "#EAEAEA" },
  },
} as const;

function getStatusChipStyle(status: string | undefined) {
  if (!status) return {};
  const lower = status.toLowerCase();

  // Muted red palette cho các trạng thái cancel/refund
  if (lower.includes("cancel") || lower.includes("refund")) {
    return {
      bgcolor: "#FDECEC",
      borderColor: "#F5C2C0",
      color: "#B3261E",
    };
  }

  // Pending: xám premium rõ ràng
  if (lower.includes("pending")) {
    return {
      bgcolor: PALETTE.status.Pending.bg,
      borderColor: PALETTE.status.Pending.border,
      color: PALETTE.status.Pending.text,
    };
  }

  // Chuẩn hoá mọi biến thể về 3 nhóm chính
  let key: keyof typeof PALETTE.status | undefined;
  if (lower.includes("shipped")) key = "Shipped";
  else if (lower.includes("ready")) key = "ReadyStock";

  const config = key !== undefined ? PALETTE.status[key] : undefined;
  if (!config) {
    return {
      bgcolor: "#F5F5F5",
      borderColor: "#E4E4E4",
      color: PALETTE.textSecondary,
    };
  }
  return {
    bgcolor: config.bg,
    borderColor: config.border,
    color: config.text,
  };
}

export interface OrderCardProps {
  orderSummary: MyOrderSummaryDto;
}

export function OrderCard({ orderSummary }: OrderCardProps) {
  const orderId = orderSummary.orderId ?? orderSummary.id;
  const { data: order, isLoading, isError } = useOrder(orderId);
  const items = order?.items ?? [];
  const displayTotal = orderSummary.finalAmount ?? orderSummary.totalAmount;

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 2.5,
        overflow: "hidden",
        bgcolor: PALETTE.cardBg,
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          px: 2.5,
          py: 1.5,
          bgcolor: "#FAFAFA",
          borderBottom: `1px solid ${PALETTE.divider}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography
            sx={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 1.4,
              color: PALETTE.textMuted,
              fontWeight: 600,
            }}
          >
            Order
          </Typography>
          <Typography
            component="span"
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: PALETTE.textMain,
              fontFamily: "monospace",
            }}
          >
            {orderId.slice(0, 8)}…
          </Typography>
          {orderSummary.orderType && orderSummary.orderType !== "ReadyStock" && (
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 999,
                border: `1px solid ${PALETTE.border}`,
                bgcolor: "#FFFFFF",
                color: PALETTE.textSecondary,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {orderSummary.orderType}
            </Box>
          )}
          <Chip
            label={orderSummary.orderStatus}
            size="small"
            sx={{
              textTransform: "capitalize",
              fontWeight: 600,
              borderRadius: 999,
              borderWidth: 1,
              borderStyle: "solid",
              fontSize: 12,
              px: 1.25,
              ...getStatusChipStyle(orderSummary.orderStatus),
            }}
          />
        </Box>
        <Typography fontSize={13} sx={{ color: PALETTE.textMuted }}>
          {new Date(orderSummary.createdAt).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      </Box>

      <Box sx={{ px: 2.5, py: 2.5 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {[1, 2].map((i) => (
              <Skeleton key={i} variant="rounded" height={48} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        ) : isError ? (
          <Typography fontSize={14} color="error">
            Could not load order items.
          </Typography>
        ) : items.length === 0 ? (
          <Typography fontSize={14} sx={{ color: PALETTE.textSecondary }}>
            No items.
          </Typography>
        ) : (
          <Box
            sx={{
              borderRadius: 2,
              border: `1px solid ${PALETTE.divider}`,
              overflow: "hidden",
            }}
          >
            {items.map((item, idx) => (
              <Box
                key={item.id}
                sx={{
                  borderBottom: idx < items.length - 1 ? `1px solid ${PALETTE.divider}` : "none",
                  "@media (hover: hover)": {
                    "&:hover": { bgcolor: "#FAFAFA" },
                  },
                }}
              >
                <OrderItemRow item={item as OrderItemRowProps["item"]} compact orderId={orderId} />
              </Box>
            ))}
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mt: 2,
            pt: 2,
            borderTop: `1px solid ${PALETTE.divider}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: PALETTE.accent,
              }}
            />
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography fontSize={12} sx={{ color: PALETTE.textMuted }}>
                Total
              </Typography>
              <Typography fontSize={18} fontWeight={800} sx={{ color: PALETTE.textMain }}>
                {formatMoney(displayTotal)}
              </Typography>
            </Box>
          </Box>
          <Button
            component={NavLink}
            to={`/orders/${orderId}`}
            variant="contained"
            size="medium"
            sx={{
              fontWeight: 700,
              borderRadius: 999,
              px: 2.75,
              py: 0.75,
              textTransform: "none",
              bgcolor: PALETTE.textMain,
              boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
              "&:hover": {
                bgcolor: "#111111",
              },
              "&:focus-visible": {
                outline: "2px solid #000",
                outlineOffset: 2,
              },
            }}
          >
            View detail
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
