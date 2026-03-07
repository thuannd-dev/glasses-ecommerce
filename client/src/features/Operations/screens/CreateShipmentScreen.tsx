import { useState, useEffect } from "react";
import {
  Box,
  LinearProgress,
  Paper,
  Typography,
  Chip,
  Pagination,
  Collapse,
  Divider,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { SummaryCard } from "../components";
import { useOperationsOrders, useOperationsOrderDetail, useUpdateOrderStatus } from "../../../lib/hooks/useOperationsOrders";
import type { StaffOrderDetailDto } from "../../../lib/types/staffOrders";
import type { OrderStatus, OperationsOrderDto } from "../../../lib/types/operations";

export function CreateShipmentScreen() {
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useOperationsOrders({
    pageNumber,
    pageSize,
    status: "Processing",
  });

  const safeOrders: OperationsOrderDto[] = Array.isArray(data?.items)
    ? (data!.items as OperationsOrderDto[])
    : [];
  const totalPages = data?.totalPages ?? 1;

  const getStatusColors = (status: string) => {
    switch (status) {
      case "Pending":
        return {
          border: "#0ea5e9",
          bg: "rgba(14,165,233,0.12)",
          color: "#0369a1",
        };
      case "Confirmed":
        return {
          border: "#8b5cf6",
          bg: "rgba(139,92,246,0.12)",
          color: "#5b21b6",
        };
      case "Processing":
        return {
          border: "#f97316",
          bg: "rgba(249,115,22,0.12)",
          color: "#c2410c",
        };
      case "Shipped":
      case "Delivered":
      case "Completed":
        return {
          border: "#22c55e",
          bg: "rgba(34,197,94,0.12)",
          color: "#15803d",
        };
      case "Cancelled":
      case "Refunded":
        return {
          border: "#ef4444",
          bg: "rgba(239,68,68,0.12)",
          color: "#b91c1c",
        };
      default:
        return {
          border: "rgba(148,163,184,0.8)",
          bg: "rgba(148,163,184,0.18)",
          color: "#475569",
        };
    }
  };

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 12, letterSpacing: 5, textTransform: "uppercase", color: "text.secondary" }}>
          Operations Center
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mt: 1, mb: 2 }}>
          <Typography sx={{ fontSize: 26, fontWeight: 900 }} color="text.primary">
            PACKING
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 200 }}>
            <SummaryCard label="Total Order" value={isLoading ? "—" : data?.totalCount ?? 0} />
          </Box>
        </Box>
        <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
          View confirmed order list, pick and pack order, and manage shipping information
        </Typography>
      </Box>

      <Box
        sx={{
          px: { xs: 0, md: 0 },
          height: "calc(100vh - 56px)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.08)",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {isLoading ? (
            <LinearProgress sx={{ borderRadius: 1 }} />
          ) : safeOrders.length === 0 ? (
            <Typography color="text.secondary">No operations orders yet.</Typography>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  pr: { md: 1 },
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
              >
                {safeOrders.map((o) => (
                  <OperationsOrderRow
                    key={o.id}
                    summary={o}
                    getStatusColors={getStatusColors}
                  />
                ))}
              </Box>

              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, pt: 1 }}>
                  <Pagination
                    count={totalPages}
                    page={pageNumber}
                    onChange={(_, page) => setPageNumber(page)}
                    color="primary"
                    size="small"
                  />
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>
    </>
  );
}

function OperationsOrderRow({
  summary,
  getStatusColors,
}: {
  readonly summary: OperationsOrderDto;
  readonly getStatusColors: (status: string) => { border: string; bg: string; color: string };
}) {
  const [expanded, setExpanded] = useState(false);
  const [shipmentDialogOpen, setShipmentDialogOpen] = useState(false);
  const [carrierName, setCarrierName] = useState("GHN");
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("https://ghn.vn");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [shippingNotes, setShippingNotes] = useState("");
  const [shipmentError, setShipmentError] = useState<string | null>(null);

  const { data, isLoading } = useOperationsOrderDetail(summary.id);
  const detail = data as StaffOrderDetailDto | undefined;
  const updateStatus = useUpdateOrderStatus();

  // Auto-fill tracking URL based on carrier
  useEffect(() => {
    if (carrierName === "GHN") {
      setTrackingUrl("https://ghn.vn");
    } else if (carrierName === "GHTK") {
      setTrackingUrl("https://ghtk.vn");
    }
  }, [carrierName]);

  const { border, bg, color } = getStatusColors(summary.orderStatus);

  const handleOpenShipmentDialog = () => {
    setShipmentError(null);
    setShipmentDialogOpen(true);
  };

  const handleCloseShipmentDialog = () => {
    if (updateStatus.isPending) return;
    setShipmentDialogOpen(false);
    setShipmentError(null);
    // Reset form
    setCarrierName("GHN");
    setTrackingCode("");
    setTrackingUrl("https://ghn.vn");
    setEstimatedDelivery("");
    setShippingNotes("");
  };

  // Handle mutation success/error
  useEffect(() => {
    if (updateStatus.isSuccess) {
      setShipmentDialogOpen(false);
      setShipmentError(null);
      // Reset form
      setCarrierName("GHN");
      setTrackingCode("");
      setTrackingUrl("https://ghn.vn");
      setEstimatedDelivery("");
      setShippingNotes("");
    }
  }, [updateStatus.isSuccess]);

  useEffect(() => {
    if (updateStatus.isError) {
      setShipmentError(
        updateStatus.error instanceof Error
          ? updateStatus.error.message
          : "Failed to save shipping information. Please try again."
      );
    }
  }, [updateStatus.isError, updateStatus.error]);

  const handleConfirmShipped = () => {
    const trimmedCarrier = carrierName.trim();
    if (!trimmedCarrier) {
      setShipmentError("Shipping carrier is required");
      return;
    }

    setShipmentError(null);
    const isoEstimated =
      estimatedDelivery.trim().length > 0
        ? new Date(estimatedDelivery).toISOString()
        : null;

    updateStatus.mutate({
      orderId: summary.id,
      status: "shipped" as OrderStatus,
      shipmentCarrierName: trimmedCarrier,
      shipmentTrackingCode: trackingCode || null,
      shipmentTrackingUrl: trackingUrl || null,
      shipmentEstimatedDeliveryAt: isoEstimated,
      shipmentNotes: shippingNotes || null,
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.08)",
        px: 3,
        py: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography sx={{ fontWeight: 700 }}>
          Order ID: {summary.id}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Chip
            label={summary.orderStatus}
            size="small"
            sx={{
              fontWeight: 700,
              textTransform: "capitalize",
              border: `1px solid ${border}`,
              bgcolor: bg,
              color,
              flexShrink: 0,
            }}
          />
          <IconButton
            size="small"
            onClick={() => setExpanded((e) => !e)}
            sx={{ ml: 0.5 }}
          >
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          fontSize: 13,
          color: "text.secondary",
        }}
      >
        <Typography>
          <b>Source:</b> {summary.orderSource}
        </Typography>
        <Typography>
          <b>Type:</b> {summary.orderType}
        </Typography>
        <Typography>
          <b>Items:</b> {summary.itemCount}
        </Typography>
        <Typography>
          <b>Created:</b>{" "}
          {new Date(summary.createdAt).toLocaleString()}
        </Typography>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider sx={{ my: 1.5 }} />
        {isLoading || !detail ? (
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Loading detail...
          </Typography>
        ) : (
          <Box sx={{ fontSize: 13, color: "text.secondary", display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography sx={{ fontWeight: 700, color: "text.primary" }}>Items</Typography>
            {detail.items.map((item) => {
              const lineTotal =
                (item.totalPrice ?? item.unitPrice * item.quantity) || 0;
              return (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "flex-start",
                  }}
                >
                  {item.productImageUrl && (
                    <Box
                      component="img"
                      src={item.productImageUrl}
                      alt={item.productName}
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 1,
                        objectFit: "cover",
                        flexShrink: 0,
                        backgroundColor: "rgba(0,0,0,0.05)",
                      }}
                    />
                  )}
                  <Box sx={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: "text.primary", mb: 0.5 }}>
                        {item.productName}
                      </Typography>
                      <Typography sx={{ fontSize: 12 }}>
                        {item.variantName} · Qty {item.quantity}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {lineTotal.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </Typography>
                  </Box>
                </Box>
              );
            })}

            <Divider sx={{ my: 1.5 }} />
            
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                <Typography sx={{ color: "text.secondary" }}>Subtotal</Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {detail.totalAmount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </Typography>
              </Box>
              {detail.discountApplied && detail.discountApplied > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                  <Typography sx={{ color: "text.secondary" }}>Discount</Typography>
                  <Typography sx={{ fontWeight: 600, color: "#10b981" }}>
                    -{detail.discountApplied.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </Typography>
                </Box>
              )}
              {detail.shippingFee > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                  <Typography sx={{ color: "text.secondary" }}>Shipping</Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {detail.shippingFee.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "space-between", pt: 0.75, borderTop: "1px solid rgba(0,0,0,0.1)", mb: 1.5 }}>
                <Typography sx={{ fontWeight: 700, color: "text.primary" }}>Total</Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 900, color: "text.primary" }}>
                  {detail.finalAmount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </Typography>
              </Box>
              
              <Button
                size="small"
                variant="contained"
                onClick={handleOpenShipmentDialog}
                disabled={updateStatus.isPending}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 1,
                  bgcolor: "#10b981",
                  "&:hover": { bgcolor: "#059669" },
                  width: "100%",
                }}
              >
                Add Shipping Information
              </Button>
            </Box>

            {detail.payment && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography sx={{ fontWeight: 700, color: "text.primary" }}>Payment</Typography>
                <Typography>
                  <b>Method:</b> {detail.payment.paymentMethod}
                </Typography>
                <Typography>
                  <b>Status:</b> {detail.payment.paymentStatus}
                </Typography>
                <Typography>
                  <b>Amount:</b>{" "}
                  {detail.payment.amount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </Typography>
              </>
            )}

            {detail.statusHistories && detail.statusHistories.length > 0 && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography sx={{ fontWeight: 700, color: "text.primary" }}>Status history</Typography>
                {detail.statusHistories.map((h) => (
                  <Box key={`${h.fromStatus}-${h.toStatus}-${h.createdAt}`}>
                    <Typography>
                      <b>{h.toStatus}</b>
                    </Typography>
                    <Typography sx={{ fontSize: 12 }}>
                      {h.notes ? `${h.notes} · ` : ""}
                      {new Date(h.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </>
            )}
          </Box>
        )}
      </Collapse>

      <Dialog
        open={shipmentDialogOpen}
        onClose={handleCloseShipmentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Shipping information</DialogTitle>
        <DialogContent sx={{ pt: 1.5, display: "flex", flexDirection: "column", gap: 2 }}>
          {shipmentError && (
            <Alert severity="error" onClose={() => setShipmentError(null)}>
              {shipmentError}
            </Alert>
          )}
          {isLoading || !detail ? (
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Loading order details...</Typography>
          ) : (
            <Box sx={{ pb: 1.5, borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.75 }}>Order ID</Typography>
                  <Typography sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>{summary.id}</Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.25 }}>Source</Typography>
                      <Typography sx={{ fontWeight: 600 }}>{summary.orderSource}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.25 }}>Type</Typography>
                      <Typography sx={{ fontWeight: 600 }}>{summary.orderType}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.25 }}>Items</Typography>
                      <Typography sx={{ fontWeight: 600 }}>{summary.itemCount}</Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, minWidth: 130 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "text.secondary", fontSize: 12 }}>Subtotal</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: 12 }}>
                      {detail.totalAmount.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </Typography>
                  </Box>
                  {detail.discountApplied && detail.discountApplied > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography sx={{ color: "text.secondary", fontSize: 12 }}>Discount</Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: 12, color: "#10b981" }}>
                        -{detail.discountApplied.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </Typography>
                    </Box>
                  )}
                  {detail.shippingFee > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography sx={{ color: "text.secondary", fontSize: 12 }}>Shipping</Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: 12 }}>
                        {detail.shippingFee.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: "flex", justifyContent: "space-between", pt: 0.5, borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                    <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: 12 }}>Total</Typography>
                    <Typography sx={{ fontWeight: 900, fontSize: 13, color: "text.primary" }}>
                      {detail.finalAmount.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
          <FormControl fullWidth required>
            <InputLabel>Shipping carrier</InputLabel>
            <Select
              value={carrierName}
              onChange={(e) => setCarrierName(e.target.value)}
              label="Shipping carrier"
            >
              <MenuItem value="GHN">GHN (Giao Hàng Nhanh)</MenuItem>
              <MenuItem value="GHTK">GHTK (Giao Hàng Tiết Kiệm)</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Tracking code"
            fullWidth
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
          />
          <TextField
            label="Tracking URL"
            fullWidth
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            placeholder="https://example.com"
            helperText="Auto-filled based on carrier. You can edit if needed."
          />
          <TextField
            label="Estimated delivery date"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={estimatedDelivery}
            onChange={(e) => setEstimatedDelivery(e.target.value)}
          />
          <TextField
            label="Shipping notes"
            fullWidth
            multiline
            minRows={2}
            value={shippingNotes}
            onChange={(e) => setShippingNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseShipmentDialog}
            disabled={updateStatus.isPending}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmShipped}
            disabled={updateStatus.isPending || !carrierName.trim()}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              bgcolor: "#10b981",
              "&:hover": { bgcolor: "#059669" },
              px: 2.5,
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
