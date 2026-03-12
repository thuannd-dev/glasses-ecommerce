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
  Grid,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { NavLink } from "react-router-dom";
import { useCancelOrder } from "../../lib/hooks/useOrders";
import { OrderItemRow, type OrderItemRowProps } from "./OrderItemRow";
import { useOrderDetailPage } from "./hooks/useOrderDetailPage";
import { formatMoney } from "./utils";
import { CANCEL_ORDER_REASONS, type CancelReasonValue } from "./cancelReasons";
import { SubmitAfterSalesTicketDialog } from "./SubmitAfterSalesTicketDialog";
import { OrderTicketsSection } from "./OrderTicketsSection";

const CANCELABLE_STATUSES = ["Pending", "pending"];

const PALETTE = {
  pageBg: "#FFFFFF",
  cardBg: "#FFFFFF",
  cardBorder: "#ECECEC",
  divider: "#F1F1F1",
  textMain: "#171717",
  textSecondary: "#6B6B6B",
  textMuted: "#8A8A8A",
  accent: "#B68C5A",
  accentHover: "#9E7748",
  status: {
    Shipped: {
      bg: "#F3EBDD",
      text: "#7A5A33",
      border: "#E7D6BA",
    },
    ReadyStock: {
      bg: "#EEF5EE",
      text: "#466A4A",
      border: "#D4E5D5",
    },
    Online: {
      bg: "#F3F1FB",
      text: "#5E4FA8",
      border: "#DFD8F6",
    },
  },
};

function getCustomerFacingStatusLabel(status: string | undefined): string {
  if (!status) return "Unknown";
  const lower = status.toLowerCase();

  // Pending → Pending
  if (lower.includes("pending")) return "Pending";

  // Confirmed or Processing → Processing
  if (lower.includes("confirmed") || lower.includes("processing")) return "Processing";

  // Shipped → In-transit
  if (lower.includes("shipped")) return "In-transit";

  // Delivered or Completed → Completed
  if (lower.includes("delivered") || lower.includes("completed")) return "Completed";

  // Cancelled or Refunded → Cancelled
  if (lower.includes("cancel") || lower.includes("refund")) return "Cancelled";

  return status; // Fallback to original status if no match
}

function getStatusChipStyle(status: string | undefined) {
  if (!status) return {};
  const lower = status.toLowerCase();

  // Muted red palette for cancel/refund statuses
  if (lower.includes("cancel") || lower.includes("refund")) {
    return {
      bgcolor: "#FDECEC",
      borderColor: "#F5C2C0",
      color: "#B3261E",
    };
  }

  // Pending: gray
  if (lower.includes("pending")) {
    return {
      bgcolor: PALETTE.status.Shipped.bg,
      borderColor: PALETTE.status.Shipped.border,
      color: PALETTE.status.Shipped.text,
    };
  }

  // Processing: orange/warning
  if (lower.includes("confirmed") || lower.includes("processing")) {
    return {
      bgcolor: "rgba(249,115,22,0.12)",
      borderColor: "rgba(249,115,22,0.3)",
      color: "#c2410c",
    };
  }

  // In-transit (Shipped): beige
  if (lower.includes("shipped")) {
    return {
      bgcolor: PALETTE.status.Shipped.bg,
      borderColor: PALETTE.status.Shipped.border,
      color: PALETTE.status.Shipped.text,
    };
  }

  // Completed (Delivered): green
  if (lower.includes("delivered") || lower.includes("completed")) {
    return {
      bgcolor: "rgba(34,197,94,0.12)",
      borderColor: "rgba(34,197,94,0.3)",
      color: "#15803d",
    };
  }

  // Fallback for other statuses
  const key = status as keyof typeof PALETTE.status;
  const config = PALETTE.status[key];
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
  const [afterSalesDialogOpen, setAfterSalesDialogOpen] = useState(false);

  const canCancel = order && CANCELABLE_STATUSES.includes(orderStatus);
  const canSubmitAfterSales = order && orderStatus === "Delivered";
  const isOtherReason = cancelReason === "other";

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setCancelReason("changed_mind");
    setCancelOtherText("");
  };

  const handleConfirmCancel = async () => {
    if (!orderId) return;
    const reasonText =
      isOtherReason
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
    <Box
      component="main"
      sx={{
        position: "relative",
        left: "50%",
        right: "50%",
        ml: "-50vw",
        mr: "-50vw",
        width: "100vw",
        background: "linear-gradient(180deg,#FFFFFF 0%,#FAFAF5 100%)",
        px: { xs: 2, md: 3 },
        pb: 8,
      }}
    >
      <Box
        sx={{
          maxWidth: 1120,
          mx: "auto",
          mt: 10,
        }}
      >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          <Button
            component={NavLink}
            to="/orders"
            size="small"
            sx={{
              textTransform: "none",
              alignSelf: "flex-start",
              color: PALETTE.accent,
              fontWeight: 600,
              px: 0,
              "&:hover": {
                color: PALETTE.accentHover,
                backgroundColor: "transparent",
              },
            }}
          >
            ← My orders
          </Button>
          <Typography
            fontWeight={900}
            fontSize={{ xs: 24, md: 28 }}
            sx={{ color: PALETTE.textMain, letterSpacing: 0.2 }}
          >
            Order {orderLabel}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              alignItems: "center",
              fontSize: 13,
              color: PALETTE.textMuted,
            }}
          >
            <Typography component="span">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Typography>
            <Box
              component="span"
              sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#D4D4D4" }}
            />
            <Typography component="span">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </Typography>
            {order.payment?.paymentMethod && (
              <>
                <Box
                  component="span"
                  sx={{
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    bgcolor: "#D4D4D4",
                  }}
                />
                <Typography component="span">
                  Payment: {order.payment.paymentMethod}
                </Typography>
              </>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <Chip
            size="small"
            label={getCustomerFacingStatusLabel(orderStatus)}
            sx={{
              textTransform: "capitalize",
              fontWeight: 600,
              borderRadius: 999,
              borderWidth: 1,
              borderStyle: "solid",
              fontSize: 12,
              px: 1.25,
              ...getStatusChipStyle(orderStatus),
            }}
          />
          <Box
            component="span"
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 999,
              border: `1px solid ${PALETTE.cardBorder}`,
              bgcolor: "#FAFAFA",
              color: PALETTE.textSecondary,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.2,
            }}
          >
            {order.orderType}
          </Box>
          {order.orderSource && (
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 999,
                  border: `1px solid ${PALETTE.cardBorder}`,
                  bgcolor: "#FAFAFA",
                  color: PALETTE.textMuted,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {order.orderSource}
            </Box>
          )}
        </Box>
      </Box>

      <Grid container spacing={3} alignItems="flex-start">
        {/* LEFT: items + shipping / timeline */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${PALETTE.cardBorder}`,
              borderRadius: 2.5,
              overflow: "hidden",
              bgcolor: PALETTE.cardBg,
              boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
            }}
          >
            {/* Items header */}
            <Box
              sx={{
                px: 3,
                pt: 2,
                pb: 1.5,
                borderBottom: `1px solid ${PALETTE.divider}`,
                bgcolor: "#FAFAFA",
              }}
            >
              <Typography
                fontWeight={700}
                fontSize={15}
                sx={{ color: PALETTE.textMain, letterSpacing: 0.2 }}
              >
                Items in this order
              </Typography>
              <Typography fontSize={12} sx={{ color: PALETTE.textMuted, mt: 0.5 }}>
                {items.length} item{items.length !== 1 ? "s" : ""} · ID{" "}
                <Typography
                  component="span"
                  fontFamily="monospace"
                  fontSize={12}
                  sx={{ wordBreak: "break-all" }}
                >
                  {order.id}
                </Typography>
              </Typography>
            </Box>

            {/* Items list */}
            <Box sx={{ borderTop: `1px solid ${PALETTE.divider}` }}>
              {items.map((item, idx) => (
                <Box
                  key={item.id}
                  sx={{
                    borderBottom:
                      idx < items.length - 1
                        ? `1px solid ${PALETTE.divider}`
                        : "none",
                    "&:hover": {
                      bgcolor: "#FAFAFA",
                      transition: "background-color 180ms ease",
                    },
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

            {/* Shipping / tracking / timeline / note */}
            <Box sx={{ px: 3, py: 2 }}>
              {(addressStr || order.trackingNumber) && (
                <>
                  <Divider sx={{ mb: 2, borderColor: PALETTE.divider }} />
                  <Grid container spacing={2}>
                    {addressStr && (
                      <Grid item xs={12} md={6}>
                        <Typography
                          fontSize={14}
                          fontWeight={600}
                          sx={{ mb: 0.5, color: PALETTE.textSecondary }}
                        >
                          Shipping address
                        </Typography>
                        <Typography
                          fontSize={14}
                          sx={{ whiteSpace: "pre-line", color: PALETTE.textMain, lineHeight: 1.6 }}
                        >
                          {addressStr}
                        </Typography>
                      </Grid>
                    )}
                    {order.trackingNumber && (
                      <Grid item xs={12} md={6}>
                        <Typography
                          fontSize={14}
                          fontWeight={600}
                          sx={{ mb: 0.5, color: PALETTE.textSecondary }}
                        >
                          Shipping & tracking
                        </Typography>
                        <Typography fontSize={14} sx={{ color: PALETTE.textMain }}>
                          <b>Tracking:</b> {order.trackingNumber}
                          {order.carrier ? ` (${order.carrier})` : ""}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}

              {order.statusHistories && order.statusHistories.length > 0 && (
                <>
                  <Divider sx={{ my: 2, borderColor: PALETTE.divider }} />
                  <Typography
                    fontSize={14}
                    fontWeight={600}
                    sx={{ mb: 1.5, color: PALETTE.textSecondary }}
                  >
                    Status timeline
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
                    {order.statusHistories.slice(0).map((h, i, arr) => {
                      const isLast = i === arr.length - 1;
                      return (
                        <Box
                          key={i}
                          sx={{
                            display: "flex",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              mt: 0.5,
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              border: isLast ? "none" : "1px solid #D4D4D4",
                              bgcolor: isLast ? PALETTE.accent : "#D4D4D4",
                              flexShrink: 0,
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              fontSize={14}
                              sx={{
                                color: PALETTE.textMain,
                                fontWeight: isLast ? 600 : 500,
                              }}
                            >
                              <b>{h.toStatus}</b>
                              {h.notes ? ` · ${h.notes}` : ""}
                            </Typography>
                            <Typography
                              fontSize={12}
                              sx={{ color: PALETTE.textMuted, mt: 0.25 }}
                            >
                              {h.createdAt ? new Date(h.createdAt).toLocaleString() : ""}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </>
              )}

              {/* Tracking your order section — when shipped */}
              {orderStatus?.toLowerCase() === "shipped" && order?.shipment && (
                <>
                  <Divider sx={{ my: 2, borderColor: PALETTE.divider }} />
                  <Typography
                    fontSize={14}
                    fontWeight={600}
                    sx={{ mb: 1.5, color: PALETTE.textSecondary }}
                  >
                    Tracking your order
                  </Typography>
                  <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                    {/* Carrier */}
                    {(order.shipment as any)?.carrierName && (
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography fontSize={11} sx={{ color: PALETTE.textMuted, mb: 0.25 }}>
                            Carrier
                          </Typography>
                          <Typography fontSize={13} sx={{ color: PALETTE.textMain, fontWeight: 500 }}>
                            {(order.shipment as any).carrierName}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {/* Tracking Code */}
                    {(order.shipment as any)?.trackingCode && (
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography fontSize={11} sx={{ color: PALETTE.textMuted, mb: 0.25 }}>
                            Tracking Code
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Typography
                              fontSize={13}
                              sx={{
                                color: PALETTE.textMain,
                                fontWeight: 600,
                                fontFamily: "monospace",
                              }}
                            >
                              {(order.shipment as any).trackingCode}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  (order.shipment as any).trackingCode || ""
                                )
                              }
                              sx={{
                                color: PALETTE.accent,
                                p: 0.25,
                                "&:hover": { bgcolor: "rgba(182,140,90,0.08)" },
                              }}
                            >
                              <ContentCopyIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Box>
                        </Box>
                      </Grid>
                    )}

                    {/* Shipped At */}
                    {(order.shipment as any)?.shippedAt && (
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography fontSize={11} sx={{ color: PALETTE.textMuted, mb: 0.25 }}>
                            Shipped At
                          </Typography>
                          <Typography fontSize={13} sx={{ color: PALETTE.textMain }}>
                            {new Date((order.shipment as any).shippedAt).toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {/* Estimated Delivery */}
                    {(order.shipment as any)?.estimatedDeliveryAt && (
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography fontSize={11} sx={{ color: PALETTE.textMuted, mb: 0.25 }}>
                            Est. Delivery
                          </Typography>
                          <Typography fontSize={13} sx={{ color: PALETTE.textMain }}>
                            {new Date(
                              (order.shipment as any).estimatedDeliveryAt
                            ).toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {/* Shipping Notes */}
                    {(order.shipment as any)?.shippingNotes && (
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography fontSize={11} sx={{ color: PALETTE.textMuted, mb: 0.25 }}>
                            Notes
                          </Typography>
                          <Typography
                            fontSize={13}
                            sx={{
                              color: PALETTE.textMain,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}
                          >
                            {(order.shipment as any).shippingNotes}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>

                  {/* Move to Tracking Page - Full width button */}
                  {(order.shipment as any)?.trackingUrl && (
                    <Button
                      href={(order.shipment as any).trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      fullWidth
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.75,
                        fontSize: 13,
                        fontWeight: 600,
                        color: PALETTE.accent,
                        textDecoration: "none",
                        py: 1,
                        borderRadius: 1,
                        border: `1px solid ${PALETTE.accent}`,
                        bgcolor: "rgba(182,140,90,0.05)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: PALETTE.accent,
                          color: PALETTE.cardBg,
                        },
                      }}
                    >
                      Move to Tracking Page →
                    </Button>
                  )}
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

          {canSubmitAfterSales && orderId && (
            <OrderTicketsSection orderId={orderId} />
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
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Cancel dialog */}
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
    </Box>
  );
}
