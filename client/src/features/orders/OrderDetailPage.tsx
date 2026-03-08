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
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/WarningAmber";
import DeleteIcon from "@mui/icons-material/Delete";
import { NavLink } from "react-router-dom";
import { useCancelOrder } from "../../lib/hooks/useOrders";
import { useMyTickets, useCancelTicket } from "../../lib/hooks/useAfterSalesTickets";
import { SubmitTicketDialog } from "./SubmitTicketDialog";
import { OrderItemRow, type OrderItemRowProps } from "./OrderItemRow";
import { useOrderDetailPage } from "./hooks/useOrderDetailPage";
import { formatMoney } from "./utils";
import { CANCEL_ORDER_REASONS, type CancelReasonValue } from "./cancelReasons";
import {
  AfterSalesTicketStatusValues,
  AfterSalesTicketTypeValues,
  type TicketListDto,
} from "../../lib/types/afterSales";

const CANCELABLE_STATUSES = new Set(["Pending", "pending"]);

const getTicketStatusColor = (status: number | string) => {
  const numStatus = typeof status === "string" ? Number.parseInt(status, 10) : status;
  switch (numStatus) {
    case 1:
    case AfterSalesTicketStatusValues.Pending:
      return { border: "#0ea5e9", bg: "rgba(14,165,233,0.12)", color: "#0369a1" };
    case 2:
    case AfterSalesTicketStatusValues.InProgress:
      return { border: "#f97316", bg: "rgba(249,115,22,0.12)", color: "#c2410c" };
    case 3:
    case AfterSalesTicketStatusValues.Resolved:
      return { border: "#22c55e", bg: "rgba(34,197,94,0.12)", color: "#15803d" };
    case 4:
    case AfterSalesTicketStatusValues.Rejected:
      return { border: "#ef4444", bg: "rgba(239,68,68,0.12)", color: "#b91c1c" };
    case 5:
    case AfterSalesTicketStatusValues.Closed:
      return { border: "#8b5cf6", bg: "rgba(139,92,246,0.12)", color: "#5b21b6" };
    case 6:
    case AfterSalesTicketStatusValues.Cancelled:
      return { border: "#6b7280", bg: "rgba(107,114,128,0.12)", color: "#374151" };
    default:
      return { border: "#0ea5e9", bg: "rgba(14,165,233,0.12)", color: "#0369a1" };
  }
};

const getTicketStatusLabel = (status: number | string): string => {
  const numStatus = typeof status === "string" ? Number.parseInt(status, 10) : status;
  switch (numStatus) {
    case 1:
    case AfterSalesTicketStatusValues.Pending:
      return "Pending";
    case 2:
    case AfterSalesTicketStatusValues.InProgress:
      return "In Progress";
    case 3:
    case AfterSalesTicketStatusValues.Resolved:
      return "Resolved";
    case 4:
    case AfterSalesTicketStatusValues.Rejected:
      return "Rejected";
    case 5:
    case AfterSalesTicketStatusValues.Closed:
      return "Closed";
    case 6:
    case AfterSalesTicketStatusValues.Cancelled:
      return "Cancelled";
    default:
      return "Pending";
  }
};

const getTicketTypeLabel = (type: number): string => {
  switch (type) {
    case AfterSalesTicketTypeValues.Return:
      return "Return";
    case AfterSalesTicketTypeValues.Warranty:
      return "Warranty";
    case AfterSalesTicketTypeValues.Refund:
      return "Refund";
    default:
      return "Unknown";
  }
};

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
  const cancelTicket = useCancelTicket();
  const { data: ticketsData, isLoading: ticketsLoading } = useMyTickets(1, 100);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<CancelReasonValue>("changed_mind");
  const [cancelOtherText, setCancelOtherText] = useState("");
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [ticketToCancelId, setTicketToCancelId] = useState<string | null>(null);
  const [cancelTicketDialogOpen, setCancelTicketDialogOpen] = useState(false);

  const canCancel = order && CANCELABLE_STATUSES.has(orderStatus);
  const canSubmitAfterSales = order && ["Delivered", "Completed"].some(
    (status) => status.toLowerCase() === orderStatus.toLowerCase()
  );
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

  const handleOpenCancelTicketDialog = (ticketId: string) => {
    setTicketToCancelId(ticketId);
    setCancelTicketDialogOpen(true);
  };

  const handleCloseCancelTicketDialog = () => {
    setCancelTicketDialogOpen(false);
    setTicketToCancelId(null);
  };

  const handleConfirmCancelTicket = async () => {
    if (!ticketToCancelId) return;
    try {
      await cancelTicket.mutateAsync(ticketToCancelId);
      handleCloseCancelTicketDialog();
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
                <Typography fontSize={14} fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Status history</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {order.statusHistories.map((h) => (
                    <Box key={`${h.toStatus}-${h.createdAt}`}>
                      <Typography fontSize={14} fontWeight={600}>
                        {h.toStatus}
                      </Typography>
                      <Typography fontSize={12} color="text.secondary">
                        {h.notes}
                        {h.notes && " · "}
                        {h.createdAt ? new Date(h.createdAt).toLocaleString() : ""}
                      </Typography>
                    </Box>
                  ))}
                </Box>
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
              <OrderItemRow
                item={item as OrderItemRowProps["item"]}
                orderId={orderId}
                showPrescriptionDetails
              />
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

      {canSubmitAfterSales && (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid rgba(17,24,39,0.12)",
            borderRadius: 3,
            overflow: "hidden",
            mb: 3,
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <WarningIcon fontSize="small" color="info" />
            <Typography fontSize={14} color="text.secondary">
              Warranty, Return, or Refund?
            </Typography>
          </Box>
          <Button
            fullWidth
            variant="contained"
            size="medium"
            onClick={() => setTicketDialogOpen(true)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              py: 1.5,
            }}
          >
            Submit Warranty, Return, or Refund Request
          </Button>
        </Paper>
      )}

      {/* My Tickets Section */}
      {ticketsData && orderId && ticketsData.items.some(t => t.orderId === orderId) && (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid rgba(17,24,39,0.12)",
            borderRadius: 3,
            overflow: "hidden",
            mb: 3,
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography fontWeight={700} fontSize={16} mb={2}>
              My Tickets
            </Typography>

            {ticketsLoading ? (
              <LinearProgress sx={{ borderRadius: 1 }} />
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {ticketsData.items.filter(t => t.orderId === orderId).map((ticket: TicketListDto) => {
                  const statusColors = getTicketStatusColor(ticket.ticketStatus);
                  const statusLabel = getTicketStatusLabel(ticket.ticketStatus);
                  const productName = ticket.orderItem?.productName || "Order Item";

                  return (
                    <Paper
                      key={ticket.id}
                      elevation={0}
                      sx={{
                        border: "1px solid rgba(17,24,39,0.08)",
                        borderRadius: 2,
                        p: 2,
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: "rgba(17,24,39,0.02)",
                        },
                      }}
                    >
                      {/* Top row: Ticket ID, Type, and Status on far right */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", flex: 1 }}>
                          <Typography fontWeight={600} fontSize={14} sx={{ wordBreak: "break-all" }}>
                            Ticket ID: {ticket.id}
                          </Typography>
                          <Chip
                            label={getTicketTypeLabel(ticket.ticketType)}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight: 600,
                              textTransform: "capitalize",
                            }}
                          />
                        </Box>
                        <Chip
                          label={statusLabel}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            textTransform: "capitalize",
                            border: `1px solid ${statusColors.border}`,
                            bgcolor: statusColors.bg,
                            color: statusColors.color,
                            ml: 2,
                            flexShrink: 0,
                          }}
                        />
                      </Box>

                      {/* Product info section */}
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
                          {ticket.orderItem?.productImageUrl && (
                            <Box
                              component="img"
                              src={ticket.orderItem.productImageUrl}
                              alt={productName}
                              sx={{
                                width: 80,
                                height: 80,
                                borderRadius: 2,
                                objectFit: "cover",
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <Box sx={{ flex: 1 }}>
                            <Typography fontSize={14} fontWeight={600} sx={{ mb: 0.5 }}>
                              {productName}
                            </Typography>
                            {ticket.orderItem?.variantName && (
                              <Typography fontSize={13} color="text.secondary" sx={{ mb: 0.5 }}>
                                {ticket.orderItem.variantName}
                              </Typography>
                            )}
                            {ticket.orderItem?.sku && (
                              <Typography fontSize={13} color="text.secondary" sx={{ mb: 0.5 }}>
                                SKU: {ticket.orderItem.sku}
                              </Typography>
                            )}
                            <Typography fontSize={12} color="text.secondary">
                              Created: {new Date(ticket.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                      </Box>

                      {/* Delete button below status - only shown for pending tickets */}
                      {(ticket.ticketStatus === AfterSalesTicketStatusValues.Pending || 
                        ticket.ticketStatus === 1 || 
                        (typeof ticket.ticketStatus === 'string' && ticket.ticketStatus.toLowerCase() === 'pending')) && (
                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={cancelTicket.isPending && ticketToCancelId === ticket.id ? <CircularProgress size={16} /> : <DeleteIcon />}
                            onClick={() => handleOpenCancelTicketDialog(ticket.id)}
                            disabled={cancelTicket.isPending}
                          >
                            Delete
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>
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

      {order && (
        <SubmitTicketDialog
          open={ticketDialogOpen}
          onClose={() => setTicketDialogOpen(false)}
          order={order as unknown as any}
        />
      )}

      <Dialog open={cancelTicketDialogOpen} onClose={handleCloseCancelTicketDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Ticket</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Are you sure you want to delete this ticket? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseCancelTicketDialog} sx={{ textTransform: "none" }}>
            Keep Ticket
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmCancelTicket}
            disabled={cancelTicket.isPending}
            sx={{ textTransform: "none" }}
          >
            {cancelTicket.isPending ? "Deleting..." : "Delete Ticket"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
