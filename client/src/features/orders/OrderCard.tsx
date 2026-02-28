import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Skeleton,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { useOrder } from "../../lib/hooks/useOrders";
import type { MyOrderSummaryDto } from "../../lib/types/order";
import { formatMoney } from "../../lib/utils/format";
import { OrderItemRow, type OrderItemRowProps } from "./OrderItemRow";

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
        border: "1px solid rgba(17,24,39,0.1)",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          px: 2,
          py: 1.5,
          bgcolor: "rgba(17,24,39,0.03)",
          borderBottom: "1px solid rgba(17,24,39,0.08)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1, color: "text.secondary" }}>
            Order
          </Typography>
          <Typography component="code" sx={{ fontSize: 13, fontWeight: 600 }}>
            {orderId.slice(0, 8)}…
          </Typography>
          <Chip
            label={orderSummary.orderType}
            size="small"
            sx={{ fontWeight: 600, textTransform: "none" }}
            variant="outlined"
          />
          <Chip
            label={orderSummary.orderStatus}
            size="small"
            color="primary"
            sx={{ fontWeight: 600, textTransform: "capitalize" }}
            variant="filled"
          />
        </Box>
        <Typography fontSize={14} color="text.secondary">
          {new Date(orderSummary.createdAt).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      </Box>

      <Box sx={{ px: 2, py: 2 }}>
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
          <Typography fontSize={14} color="text.secondary">
            No items.
          </Typography>
        ) : (
          <Box
            sx={{
              borderRadius: 2,
              border: "1px solid rgba(17,24,39,0.08)",
              overflow: "hidden",
            }}
          >
            {items.map((item, idx) => (
              <Box
                key={item.id}
                sx={{
                  bgcolor: idx % 2 === 0 ? "transparent" : "rgba(17,24,39,0.02)",
                  borderBottom: idx < items.length - 1 ? "1px solid rgba(17,24,39,0.06)" : "none",
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
            borderTop: "1px solid rgba(17,24,39,0.1)",
          }}
        >
          <Typography fontSize={18} fontWeight={800}>
            Total: {formatMoney(displayTotal)}
          </Typography>
          <Button
            component={NavLink}
            to={`/orders/${orderId}`}
            variant="contained"
            size="medium"
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              px: 2,
              textTransform: "none",
              bgcolor: "#111827",
              "&:hover": { bgcolor: "#0f172a" },
            }}
          >
            View order details
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
