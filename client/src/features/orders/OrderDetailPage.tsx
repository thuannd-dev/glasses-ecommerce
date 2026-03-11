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
<<<<<<< Updated upstream
import {
  AfterSalesTicketStatusValues,
  AfterSalesTicketTypeValues,
  type TicketListDto,
} from "../../lib/types/afterSales";
=======
import { SubmitAfterSalesTicketDialog } from "./SubmitAfterSalesTicketDialog";
>>>>>>> Stashed changes

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
    case AfterSalesTicketStatusValues.Replacing:
      return { border: "#a855f7", bg: "rgba(168,85,247,0.12)", color: "#7c3aed" };
    case 4:
    case AfterSalesTicketStatusValues.Resolved:
      return { border: "#22c55e", bg: "rgba(34,197,94,0.12)", color: "#15803d" };
    case 5:
    case AfterSalesTicketStatusValues.Rejected:
      return { border: "#ef4444", bg: "rgba(239,68,68,0.12)", color: "#b91c1c" };
    case 6:
    case AfterSalesTicketStatusValues.Closed:
      return { border: "#8b5cf6", bg: "rgba(139,92,246,0.12)", color: "#5b21b6" };
    case 7:
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
    case AfterSalesTicketStatusValues.Replacing:
      return "Replacing";
    case 4:
    case AfterSalesTicketStatusValues.Resolved:
      return "Resolved";
    case 5:
    case AfterSalesTicketStatusValues.Rejected:
      return "Rejected";
    case 6:
    case AfterSalesTicketStatusValues.Closed:
      return "Closed";
    case 7:
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
<<<<<<< Updated upstream
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [ticketToCancelId, setTicketToCancelId] = useState<string | null>(null);
  const [cancelTicketDialogOpen, setCancelTicketDialogOpen] = useState(false);

  const canCancel = order && CANCELABLE_STATUSES.has(orderStatus);
  const canSubmitAfterSales = order && ["Delivered", "Completed"].some(
    (status) => status.toLowerCase() === orderStatus.toLowerCase()
  );
=======
  const [afterSalesDialogOpen, setAfterSalesDialogOpen] = useState(false);

  const canCancel = order && CANCELABLE_STATUSES.includes(orderStatus);
  const canSubmitAfterSales = order && orderStatus === "Delivered";
>>>>>>> Stashed changes
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
                      {ticket.ticketStatus === AfterSalesTicketStatusValues.Pending && (
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
<<<<<<< Updated upstream
                      )}
                    </Paper>
                  );
                })}
              </Box>
=======
                      );
                    })}
                  </Box>
                </>
              )}

              {order.customerNote != null && order.customerNote !== "" && (
                <>
                  <Divider sx={{ my: 2, borderColor: PALETTE.divider }} />
                  <Typography
                    fontSize={14}
                    fontWeight={600}
                    sx={{ mb: 0.5, color: PALETTE.textSecondary }}
                  >
                    Your note
                  </Typography>
                  <Typography fontSize={14} sx={{ color: PALETTE.textMain, lineHeight: 1.6 }}>
                    {order.customerNote}
                  </Typography>
                </>
              )}
            </Box>
          </Paper>

          {canCancel && (
          <Paper
            elevation={0}
            sx={{
              border: "1px solid rgba(248,113,113,0.35)",
              borderRadius: 2.5,
              overflow: "hidden",
              mt: 3,
              bgcolor: "#FFF8F4",
              boxShadow: "0 8px 22px rgba(248,113,113,0.08)",
            }}
          >
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Typography
                  fontWeight={700}
                  fontSize={15}
                  sx={{ color: PALETTE.textMain }}
                >
                  Need to cancel this order?
                </Typography>
                <Typography fontSize={13} sx={{ color: PALETTE.textSecondary }}>
                  You can cancel while the order is still pending. Once it moves
                  into processing or shipped, cancellation may not be available.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  sx={{
                    mt: 0.5,
                    textTransform: "none",
                    fontWeight: 700,
                    borderWidth: 2,
                    borderColor: "rgba(248,113,113,0.7)",
                    color: "#b91c1c",
                    "&:hover": {
                      borderWidth: 2,
                      borderColor: "rgba(248,113,113,0.9)",
                      backgroundColor: "rgba(248,113,113,0.06)",
                    },
                  }}
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={cancelOrder.isPending}
                >
                  {cancelOrder.isPending ? "Cancelling..." : "Cancel order"}
                </Button>
              </Box>
            </Paper>
          )}

          {canSubmitAfterSales && (
            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${PALETTE.cardBorder}`,
                borderRadius: 2.5,
                overflow: "hidden",
                mt: 3,
                bgcolor: "#F9F7F4",
                boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Typography
                  fontWeight={700}
                  fontSize={15}
                  sx={{ color: PALETTE.textMain }}
                >
                  Product issue or warranty claim?
                </Typography>
                <Typography fontSize={13} sx={{ color: PALETTE.textSecondary }}>
                  Submit a return, refund, or warranty ticket. Our team will
                  review and assist you.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    mt: 0.5,
                    textTransform: "none",
                    fontWeight: 700,
                    backgroundColor: PALETTE.accent,
                    color: "white",
                    "&:hover": {
                      backgroundColor: PALETTE.accentHover,
                    },
                  }}
                  onClick={() => setAfterSalesDialogOpen(true)}
                >
                  Submit Ticket
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* RIGHT: sticky summary card */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              position: { md: "sticky" },
              top: { md: 88 },
            }}
          >
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${PALETTE.cardBorder}`,
              borderRadius: 2.5,
              mb: 2,
              overflow: "hidden",
              bgcolor: PALETTE.cardBg,
              boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
            }}
          >
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: "rgba(17,24,39,0.03)",
                }}
              >
                <Typography
                  fontWeight={800}
                  fontSize={16}
                  sx={{ color: PALETTE.textMain, letterSpacing: 0.3 }}
                >
                  Order summary
                </Typography>
              </Box>
              <Box sx={{ px: 3, py: 2 }}>
                <Box
                  sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}
                >
                  <Typography fontSize={14} sx={{ color: PALETTE.textSecondary }}>
                    Subtotal
                  </Typography>
                  <Typography fontSize={14} sx={{ color: PALETTE.textMain }}>
                    {formatMoney(order.totalAmount)}
                  </Typography>
                </Box>
                <Box
                  sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}
                >
                  <Typography fontSize={14} sx={{ color: PALETTE.textSecondary }}>
                    Shipping
                  </Typography>
                  <Typography fontSize={14} sx={{ color: PALETTE.textMain }}>
                    {formatMoney(order.shippingFee)}
                  </Typography>
                </Box>
                {order.discountApplied != null && order.discountApplied !== 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.75,
                    }}
                  >
                    <Typography
                      fontSize={14}
                      sx={{ color: PALETTE.textSecondary }}
                    >
                      Discount
                    </Typography>
                    <Typography fontSize={14} sx={{ color: PALETTE.textMain }}>
                      - {formatMoney(order.discountApplied)}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1.5, borderColor: PALETTE.divider }} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    fontWeight={700}
                    fontSize={16}
                    sx={{ color: PALETTE.textMain }}
                  >
                    Total
                  </Typography>
                  <Typography
                    fontWeight={800}
                    fontSize={18}
                    sx={{
                      color: PALETTE.textMain,
                      borderBottom: `2px solid ${PALETTE.accent}`,
                      pb: 0.25,
                    }}
                  >
                    {formatMoney(order.finalAmount)}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {order.payment && (
              <Paper
                elevation={0}
                sx={{
                  border: `1px solid ${PALETTE.cardBorder}`,
                  borderRadius: 2.5,
                  overflow: "hidden",
                  bgcolor: PALETTE.cardBg,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.03)",
                }}
              >
                <Box sx={{ px: 3, py: 2 }}>
                  <Typography
                    fontSize={14}
                    fontWeight={600}
                    sx={{ mb: 1, color: PALETTE.textSecondary }}
                  >
                    Payment
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography
                        fontSize={13}
                        sx={{ color: PALETTE.textMuted, mr: 1 }}
                      >
                        Method
                      </Typography>
                      <Typography
                        fontSize={14}
                        sx={{ color: PALETTE.textMain, fontWeight: 500 }}
                      >
                        {order.payment.paymentMethod}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography
                        fontSize={13}
                        sx={{ color: PALETTE.textMuted, mr: 1 }}
                      >
                        Status
                      </Typography>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: 999,
                          border: "1px solid #E5E5E5",
                          fontSize: 12,
                          fontWeight: 500,
                          bgcolor:
                            order.payment.paymentStatus?.toLowerCase() === "pending"
                              ? "#FFF7ED"
                              : "#F4F4F5",
                          color:
                            order.payment.paymentStatus?.toLowerCase() === "pending"
                              ? "#92400E"
                              : PALETTE.textSecondary,
                        }}
                      >
                        {order.payment.paymentStatus}
                      </Box>
                    </Box>
                    {order.payment.paymentAt != null && (
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography
                          fontSize={13}
                          sx={{ color: PALETTE.textMuted, mr: 1 }}
                        >
                          Paid at
                        </Typography>
                        <Typography
                          fontSize={13}
                          sx={{ color: PALETTE.textMain }}
                        >
                          {new Date(order.payment.paymentAt).toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Paper>
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
=======
      {/* After-Sales Ticket Dialog */}
      <SubmitAfterSalesTicketDialog
        open={afterSalesDialogOpen}
        onClose={() => setAfterSalesDialogOpen(false)}
        order={order}
        onSuccess={() => {
          // Optionally refresh order data or navigate
        }}
      />
      </Box>
>>>>>>> Stashed changes
    </Box>
  );
}
