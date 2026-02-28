import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { useCancelOrder } from "../../lib/hooks/useOrders";
import { OrderItemRow, type OrderItemRowProps } from "./OrderItemRow";
import { useOrderDetailPage } from "./hooks/useOrderDetailPage";
import { formatMoney } from "./utils";
import { CANCEL_ORDER_REASONS, type CancelReasonValue } from "./cancelReasons";

const CANCELABLE_STATUSES = ["Pending", "pending"];

export default function OrderDetailPage() {
  const {
    orderId,
    order,
    isLoading,
    isError,
    error,
    orderLabel,
    orderStatus,
    items,
    addressStr,
  } = useOrderDetailPage();
  const cancelOrder = useCancelOrder();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<CancelReasonValue>("changed_mind");
  const [cancelOtherText, setCancelOtherText] = useState("");

  const canCancel = order && CANCELABLE_STATUSES.includes(orderStatus);
  const isOtherReason = cancelReason === "other";

  const handleOpenCancelDialog = () => setCancelDialogOpen(true);
  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setCancelReason("changed_mind");
    setCancelOtherText("");
  };

  const handleConfirmCancel = async () => {
    if (!orderId) return;
    const reasonText = isOtherReason
      ? cancelOtherText.trim() || null
      : CANCEL_ORDER_REASONS.find((r) => r.value === cancelReason)?.label ?? null;
    try {
      await cancelOrder.mutateAsync({ orderId, reason: reasonText });
      handleCloseCancelDialog();
    } catch {
      // Error shown by agent / toast
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 10, px: 2, textAlign: "center" }}>
        <Typography color="text.secondary">Loading order...</Typography>
      </Box>
    );
  }

  if (isError || !order) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 10, px: 2 }}>
        <Typography color="error">
          {error instanceof Error ? error.message : "Order not found."}
        </Typography>
        <Button component={NavLink} to="/orders" variant="outlined" sx={{ mt: 2 }}>
          Back to my orders
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 10, px: { xs: 2, md: 3 }, pb: 8 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button component={NavLink} to="/orders" size="small" sx={{ textTransform: "none" }}>
          ← My orders
        </Button>
        <Chip label={orderLabel} sx={{ fontWeight: 700 }} />
        <Chip size="small" label={order.orderType} sx={{ textTransform: "none" }} variant="outlined" />
        <Chip size="small" label={orderStatus} sx={{ textTransform: "capitalize" }} color="primary" />
        {order.orderSource && (
          <Chip size="small" label={order.orderSource} variant="outlined" sx={{ textTransform: "none" }} />
        )}
      </Box>

      <Typography fontWeight={900} fontSize={20} mb={2}>
        Order details
      </Typography>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid rgba(17,24,39,0.12)",
          borderRadius: 3,
          overflow: "hidden",
          mb: 3,
        }}
      >
        {/* 1. General info */}
        <Box sx={{ p: 3 }}>
          <Typography fontWeight={700} fontSize={16} mb={2}>
            General info
          </Typography>
          <Box sx={{ display: "grid", gap: 1.5 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
              <Typography fontSize={14}><b>Order ID:</b></Typography>
              <Typography fontSize={14} component="span" sx={{ wordBreak: "break-all" }}>{order.id}</Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
              <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1, border: "1px solid #0ea5e9", bgcolor: "rgba(14,165,233,0.12)", color: "#0369a1" }}>
                <Typography fontSize={13} fontWeight={600}>Type: {order.orderType ?? "—"}</Typography>
              </Box>
              <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1, border: "1px solid #8b5cf6", bgcolor: "rgba(139,92,246,0.12)", color: "#5b21b6" }}>
                <Typography fontSize={13} fontWeight={600}>Status: {orderStatus}</Typography>
              </Box>
              {order.orderSource && (
                <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1, border: "1px solid #22c55e", bgcolor: "rgba(34,197,94,0.12)", color: "#15803d" }}>
                  <Typography fontSize={13} fontWeight={600}>Source: {order.orderSource}</Typography>
                </Box>
              )}
            </Box>
            <Typography fontSize={14}>
              <b>Created:</b> {new Date(order.createdAt).toLocaleString()}
            </Typography>
            {order.updatedAt != null && (
              <Typography fontSize={14}>
                <b>Updated:</b> {new Date(order.updatedAt).toLocaleString()}
              </Typography>
            )}
            {order.customerNote != null && order.customerNote !== "" && (
              <Typography fontSize={14}>
                <b>Note:</b> {order.customerNote}
              </Typography>
            )}

            {order.payment && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography fontSize={14} fontWeight={600} color="text.secondary">Payment</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <Typography fontSize={14}><b>Method:</b> {order.payment.paymentMethod}</Typography>
                  <Typography fontSize={14}><b>Status:</b> {order.payment.paymentStatus}</Typography>
                  {order.payment.paymentAt != null && (
                    <Typography fontSize={14}><b>Paid at:</b> {new Date(order.payment.paymentAt).toLocaleString()}</Typography>
                  )}
                </Box>
              </>
            )}

            {order.trackingNumber && (
              <Typography fontSize={14}>
                <b>Tracking:</b> {order.trackingNumber}
                {order.carrier ? ` (${order.carrier})` : ""}
              </Typography>
            )}

            {addressStr && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography fontSize={14} fontWeight={600} color="text.secondary">Shipping address</Typography>
                <Typography fontSize={14} sx={{ whiteSpace: "pre-line" }}>{addressStr}</Typography>
              </>
            )}

            {order.statusHistories && order.statusHistories.length > 0 && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography fontSize={14} fontWeight={600} color="text.secondary">Status history</Typography>
                {order.statusHistories.map((h, i) => (
                  <Box key={i}>
                    <Typography fontSize={14}>
                      {h.fromStatus ?? "—"} → <b>{h.toStatus}</b>
                      {h.notes ? ` · ${h.notes}` : ""}
                    </Typography>
                    <Typography fontSize={12} color="text.secondary">
                      {h.createdAt ? new Date(h.createdAt).toLocaleString() : ""}
                    </Typography>
                  </Box>
                ))}
              </>
            )}
          </Box>
        </Box>

        {/* 2. Items */}
        <Divider />
        <Typography fontWeight={700} fontSize={16} sx={{ px: 3, pt: 2, pb: 1 }}>
          Items
        </Typography>
        <Box sx={{ borderTop: "1px solid rgba(17,24,39,0.08)" }}>
          {items.map((item, idx) => (
            <Box
              key={item.id}
              sx={{
                borderBottom: idx < items.length - 1 ? "1px solid rgba(17,24,39,0.06)" : "none",
              }}
            >
              <OrderItemRow item={item as OrderItemRowProps["item"]} orderId={orderId} />
            </Box>
          ))}
        </Box>

        {/* 3. Total */}
        <Box sx={{ px: 3, py: 2, bgcolor: "rgba(17,24,39,0.04)", borderTop: "1px solid rgba(17,24,39,0.1)" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography fontSize={14}>Subtotal</Typography>
            <Typography fontSize={14}>{formatMoney(order.totalAmount)}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography fontSize={14}>Shipping</Typography>
            <Typography fontSize={14}>{formatMoney(order.shippingFee)}</Typography>
          </Box>
          {order.discountApplied != null && order.discountApplied !== 0 && (
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography fontSize={14}>Discount</Typography>
              <Typography fontSize={14}>- {formatMoney(order.discountApplied)}</Typography>
            </Box>
          )}
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography fontWeight={700} fontSize={16}>Total</Typography>
            <Typography fontWeight={800} fontSize={18}>{formatMoney(order.finalAmount)}</Typography>
          </Box>
        </Box>
      </Paper>

      {canCancel && (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid rgba(17,24,39,0.12)",
            borderRadius: 3,
            overflow: "hidden",
            mb: 3,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            color="error"
            size="large"
            sx={{
              py: 1.5,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 16,
              borderWidth: 2,
              "&:hover": { borderWidth: 2 },
            }}
            onClick={handleOpenCancelDialog}
            disabled={cancelOrder.isPending}
          >
            Cancel order
          </Button>
        </Paper>
      )}

      <Dialog open={cancelDialogOpen} onClose={handleCloseCancelDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel order</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Please select a reason for cancellation (optional).
          </Typography>
          <RadioGroup
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value as CancelReasonValue)}
          >
            {CANCEL_ORDER_REASONS.map((r) => (
              <FormControlLabel
                key={r.value}
                value={r.value}
                control={<Radio />}
                label={r.label}
              />
            ))}
          </RadioGroup>
          {isOtherReason && (
            <TextField
              label="Please specify"
              fullWidth
              multiline
              rows={2}
              value={cancelOtherText}
              onChange={(e) => setCancelOtherText(e.target.value)}
              placeholder="Your reason..."
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseCancelDialog} sx={{ textTransform: "none" }}>
            Back
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmCancel}
            disabled={cancelOrder.isPending}
            sx={{ textTransform: "none" }}
          >
            {cancelOrder.isPending ? "Cancelling..." : "Confirm cancel"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
