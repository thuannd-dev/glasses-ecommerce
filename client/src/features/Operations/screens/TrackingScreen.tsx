import { useState } from "react";
import {
  Box,
  Chip,
  LinearProgress,
  Pagination,
  Paper,
  Typography,
  Collapse,
  Divider,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

import { useOperationsOrders, useOperationsOrderDetail } from "../../../lib/hooks/useOperationsOrders";
import { SummaryCard } from "../components";
import type { StaffOrderDetailDto, ShipmentInfoDto } from "../../../lib/types/staffOrders";
import type { OperationsOrderDto } from "../../../lib/types/operations";

export function TrackingScreen() {
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useOperationsOrders({
    pageNumber,
    pageSize,
    status: "Shipped",
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
            SHIPPED ORDERS
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
            <Typography color="text.secondary">No shipped orders yet.</Typography>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  mt: 1,
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
                  <ShippedOrderRow key={o.id} summary={o} getStatusColors={getStatusColors} />
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

function ShippedOrderRow({
  summary,
  getStatusColors,
}: {
  summary: OperationsOrderDto;
  getStatusColors: (status: string) => { border: string; bg: string; color: string };
}) {
  const [expanded, setExpanded] = useState(false);
  const [copiedTrackingCode, setCopiedTrackingCode] = useState(false);
  const { data, isLoading } = useOperationsOrderDetail(summary.id);
  const detail = data as StaffOrderDetailDto | undefined;

  const { border, bg, color } = getStatusColors(summary.orderStatus);

  const handleCopyTrackingCode = (trackingCode: string) => {
    navigator.clipboard.writeText(trackingCode);
    setCopiedTrackingCode(true);
    setTimeout(() => setCopiedTrackingCode(false), 2000);
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
                      }}
                    />
                  )}
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
                        {item.productName}
                      </Typography>
                      <Typography sx={{ fontSize: 12 }}>
                        {item.variantName} · Qty {item.quantity}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 600, whiteSpace: "nowrap", ml: 1 }}>
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
            <Typography sx={{ fontWeight: 700, color: "text.primary" }}>Pricing Breakdown</Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
              <Typography>Subtotal</Typography>
              <Typography fontWeight={600}>
                {(detail.totalAmount).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </Typography>
            </Box>
            {detail.shippingFee > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Typography>Shipping Fee</Typography>
                <Typography fontWeight={600}>
                  {detail.shippingFee.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </Typography>
              </Box>
            )}
            {detail.discountApplied && detail.discountApplied > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Typography>Discount</Typography>
                <Typography fontWeight={600} sx={{ color: "success.main" }}>
                  -{detail.discountApplied.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </Typography>
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                pt: 1,
                borderTop: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              <Typography sx={{ fontWeight: 700, color: "text.primary" }}>Total</Typography>
              <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
                {summary.finalAmount.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </Typography>
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
                {detail.statusHistories.map((h, idx) => (
                  <Box key={idx}>
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

            {detail.shipment && (
              <>
                <Divider sx={{ my: 1.5 }} />
                {(() => {
                  const shipment = detail.shipment as ShipmentInfoDto | null | undefined;
                  // Get tracking code from the shipment object
                  const trackingCode = shipment?.trackingCode;
                  
                  return (
                    <>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                        <Typography sx={{ fontWeight: 700, color: "text.primary" }}>Tracking the order</Typography>
                        {shipment?.estimatedDeliveryAt && (
                          <Typography fontWeight={600} sx={{ fontSize: 13 }}>
                            Est. Arrival: {new Date(shipment.estimatedDeliveryAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                      {trackingCode && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>Tracking Code</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography fontWeight={600} sx={{ fontFamily: "monospace", fontSize: 14 }}>
                                {trackingCode}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleCopyTrackingCode(trackingCode)}
                                sx={{
                                  p: 0.5,
                                  color: copiedTrackingCode ? "success.main" : "text.secondary",
                                  transition: "color 0.2s",
                                  "&:hover": {
                                    bgcolor: "rgba(0,0,0,0.04)",
                                  },
                                }}
                                title="Copy tracking code"
                              >
                                {copiedTrackingCode ? (
                                  <CheckIcon sx={{ fontSize: 18 }} />
                                ) : (
                                  <CopyIcon sx={{ fontSize: 18 }} />
                                )}
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      )}
                      {shipment?.trackingUrl && (
                        <Box sx={{ pt: 1 }}>
                          <Box
                            component="a"
                            href={shipment.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              textDecoration: "none",
                              display: "block",
                            }}
                          >
                            <Box
                              component="button"
                              onClick={(e) => {
                                e.preventDefault();
                                if (shipment?.trackingUrl) {
                                  window.open(shipment.trackingUrl, "_blank");
                                }
                              }}
                              sx={{
                                width: "100%",
                                px: 2,
                                py: 0.75,
                                borderRadius: 1,
                                border: "1px solid rgba(0,0,0,0.15)",
                                bgcolor: "primary.main",
                                color: "white",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                "&:hover": {
                                  bgcolor: "primary.dark",
                                },
                              }}
                            >
                              Move To Tracking Page
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </Box>
        )}
      </Collapse>
    </Paper>
  );
}
