import React from "react";
import {
  Box,
  Button,
  Divider,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import type {
  StaffOrderDetailDto,
  StaffOrderShippingAddressDto,
} from "../../../lib/types/staffOrders";

const TOKENS = {
  bgTint: "#FAFAF8",
  surface: "#FFFFFF",
  border: "rgba(0,0,0,0.08)",
  divider: "rgba(0,0,0,0.06)",
  textPrimary: "#171717",
  textSecondary: "#6B6B6B",
  muted: "#8A8A8A",
  accent: "#B68C5A",
  accentHover: "#9E7748",
  thumbnailBg: "#F6F4F2",
  cardShadow: "0 10px 24px rgba(0,0,0,0.04)",
} as const;

const CARD_PADDING = 8;
const LABEL_WIDTH = 120;
const CARD_BORDER_RADIUS = 10;
const CARD_FIXED_HEIGHT = 88;
const TITLE_FONT_SIZE = 12;
const TITLE_MARGIN_BOTTOM = 4;
const ROW_GAP_PX = 8;
const LABEL_FONT_SIZE = 13;
const VALUE_FONT_SIZE = 14;
const STATUS_PILL_HEIGHT = 22;
const GRID_GAP = 10;

function getPaymentStatusPill(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "pending") return { border: "#EAEAEA", bg: "#F6F6F6", color: "#4B4B4B" };
  if (s === "completed" || s === "approved" || s === "paid") return { border: "#D4E5D5", bg: "#EEF5EE", color: "#466A4A" };
  if (s === "rejected" || s === "failed" || s === "cancelled") return { border: "#E8CFCF", bg: "#F6EAEA", color: "#8E3B3B" };
  return { border: "#EAEAEA", bg: "#F6F6F6", color: "#4B4B4B" };
}

function formatAddressLine(addr: StaffOrderShippingAddressDto): string {
  const parts = [
    addr.venue,
    addr.ward,
    addr.district ? `District ${addr.district}` : null,
    addr.city,
  ].filter(Boolean);
  const line = parts.join(", ");
  return addr.postalCode ? `${line} · ${addr.postalCode}` : line;
}

function formatPrescriptionVal(n: number | null | undefined): string {
  if (n == null) return "—";
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

interface OrderDetailExpandedProps {
  detail: StaffOrderDetailDto;
  onProcessOrderClick?: (orderId: string) => void;
  showProcessButton?: boolean;
  onAddTrackingClick?: (orderId: string) => void;
  showAddTrackingButton?: boolean;
  onMarkDeliveredClick?: (orderId: string) => void;
}

export function OrderDetailExpanded({ detail, onProcessOrderClick, showProcessButton, onAddTrackingClick, showAddTrackingButton, onMarkDeliveredClick }: OrderDetailExpandedProps) {
  const paymentStatusPill = detail.payment ? getPaymentStatusPill(detail.payment.paymentStatus) : null;

  const copyAddress = () => {
    if (!detail.shippingAddress) return;
    const recipient = [detail.shippingAddress.recipientName, detail.shippingAddress.recipientPhone].filter(Boolean).join(" · ");
    const line2 = formatAddressLine(detail.shippingAddress);
    navigator.clipboard.writeText([recipient, line2].filter(Boolean).join("\n"));
  };

  const customerName = detail.customerName ?? detail.walkInCustomerName ?? "—";
  const customerPhone = detail.customerPhone ?? detail.walkInCustomerPhone ?? "—";

  const cardStyle = {
    bgcolor: "#FFFFFF",
    borderRadius: CARD_BORDER_RADIUS,
    border: "1px solid rgba(0,0,0,0.08)",
    p: CARD_PADDING,
    minHeight: CARD_FIXED_HEIGHT,
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    boxSizing: "border-box",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
    textAlign: "left",
    overflow: "auto",
  };

  const cardTitleStyle = {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: 700,
    color: "#8A8A8A",
    textTransform: "uppercase" as const,
    letterSpacing: "0.14em",
    mb: `${TITLE_MARGIN_BOTTOM}px`,
    lineHeight: 1.3,
  };

  const labelValueRow = (label: string, value: React.ReactNode, valueBold?: boolean) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `${LABEL_WIDTH}px 1fr`,
        gap: 1.25,
        mb: `${ROW_GAP_PX}px`,
        lineHeight: 1.5,
        "&:last-of-type": { mb: 0 },
      }}
    >
      <Typography sx={{ fontSize: LABEL_FONT_SIZE, color: "#8A8A8A", flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography
        component="span"
        sx={{
          fontSize: VALUE_FONT_SIZE,
          color: "#171717",
          fontWeight: valueBold ? 600 : 400,
          minWidth: 0,
          lineHeight: 1.5,
        }}
      >
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        bgcolor: TOKENS.bgTint,
        border: `1px solid ${TOKENS.divider}`,
        borderRadius: "12px",
        p: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      {/* Main info blocks: Customer | Payment | Shipping | More details */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gridTemplateRows: { xs: "auto auto auto auto", md: "1fr 1fr" },
          gap: `${GRID_GAP}px`,
          alignItems: "stretch",
          minHeight: { md: CARD_FIXED_HEIGHT * 2 + GRID_GAP },
        }}
      >
        {/* 1) Customer */}
        <Box sx={cardStyle}>
          <Typography sx={cardTitleStyle}>Customer</Typography>
          <Box sx={{ width: "100%" }}>
            {labelValueRow("Name", customerName, true)}
            {labelValueRow("Phone", customerPhone, false)}
          </Box>
        </Box>

        {/* 2) Payment */}
        <Box sx={cardStyle}>
          <Typography sx={cardTitleStyle}>Payment</Typography>
          {detail.payment ? (
            <Box sx={{ width: "100%" }}>
              {labelValueRow("Method", detail.payment.paymentMethod, false)}
              {labelValueRow(
                "Status",
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: STATUS_PILL_HEIGHT,
                    px: "10px",
                    borderRadius: 999,
                    border: `1px solid ${paymentStatusPill?.border}`,
                    bgcolor: paymentStatusPill?.bg,
                    color: paymentStatusPill?.color,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {detail.payment.paymentStatus}
                </Box>,
                false
              )}
              {labelValueRow(
                "Amount",
                detail.payment.amount.toLocaleString("en-US", { style: "currency", currency: "USD" }),
                true
              )}
              {detail.payment.paymentAt &&
                labelValueRow(
                  "Paid",
                  new Date(detail.payment.paymentAt).toLocaleString(),
                  false
                )}
            </Box>
          ) : (
            <Typography sx={{ fontSize: VALUE_FONT_SIZE, color: TOKENS.textSecondary }}>—</Typography>
          )}
        </Box>

        {/* 3) Shipping address */}
        <Box sx={cardStyle}>
          <Typography sx={cardTitleStyle}>Shipping address</Typography>
          {detail.shippingAddress ? (
            <Box sx={{ width: "100%" }}>
              {labelValueRow(
                "Recipient",
                `${detail.shippingAddress.recipientName || ""}${detail.shippingAddress.recipientPhone ? ` · ${detail.shippingAddress.recipientPhone}` : ""}`.trim() || "—",
                true
              )}
              {labelValueRow("Address", formatAddressLine(detail.shippingAddress), false)}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: `${LABEL_WIDTH}px 1fr`,
                  gap: 1.25,
                  mt: `${ROW_GAP_PX}px`,
                  alignItems: "flex-start",
                }}
              >
                <Box />
                <Box
                  component="button"
                  type="button"
                  onClick={copyAddress}
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: TOKENS.accent,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    p: 0,
                    textAlign: "left",
                    textDecoration: "underline",
                    textUnderlineOffset: 2,
                    lineHeight: 1.5,
                    "&:hover": { color: TOKENS.accentHover },
                  }}
                >
                  Copy address
                </Box>
              </Box>
            </Box>
          ) : (
            <Typography sx={{ fontSize: VALUE_FONT_SIZE, color: TOKENS.textSecondary }}>—</Typography>
          )}
        </Box>

        {/* 4) More details */}
        <Box sx={cardStyle}>
          <Typography sx={cardTitleStyle}>More details</Typography>
          <Box sx={{ width: "100%" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `${LABEL_WIDTH}px 1fr`,
                gap: 1.25,
                mb: `${ROW_GAP_PX}px`,
                alignItems: "flex-start",
              }}
            >
              <Typography sx={{ fontSize: LABEL_FONT_SIZE, color: "#8A8A8A" }}>Source / Type</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, minWidth: 0 }}>
                <Box component="span" sx={{ display: "inline-flex", alignItems: "center", height: 22, px: 1, py: 0, borderRadius: 999, border: "1px solid rgba(0,0,0,0.08)", bgcolor: "#F7F7F7", fontSize: 12, color: TOKENS.textSecondary }}>
                  Source: {detail.orderSource}
                </Box>
                <Box component="span" sx={{ display: "inline-flex", alignItems: "center", height: 22, px: 1, py: 0, borderRadius: 999, border: "1px solid rgba(0,0,0,0.08)", bgcolor: "#F7F7F7", fontSize: 12, color: TOKENS.textSecondary }}>
                  Type: {detail.orderType}
                </Box>
              </Box>
            </Box>
            {detail.salesStaffName && labelValueRow("Sales", detail.salesStaffName, false)}
          </Box>
        </Box>
      </Box>

      {/* 2.5) Prescription — for sales to view lens details */}
      {detail.prescription?.details?.length ? (
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: TOKENS.muted, textTransform: "uppercase", letterSpacing: 1, mb: 1.25 }}>
            Prescription
          </Typography>
          <Box
            sx={{
              bgcolor: TOKENS.surface,
              borderRadius: "12px",
              border: `1px solid ${TOKENS.divider}`,
              overflow: "hidden",
              p: 2,
            }}
          >
            {detail.prescription.isVerified != null && (
              <Typography sx={{ fontSize: 12, color: TOKENS.textSecondary, mb: 1.25 }}>
                Verified: {detail.prescription.isVerified ? "Yes" : "No"}
                {detail.prescription.verificationNotes && (
                  <> · {detail.prescription.verificationNotes}</>
                )}
              </Typography>
            )}
            <Table size="small" sx={{ "& td, & th": { py: 0.75, px: 1.5, fontSize: 13 } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: TOKENS.muted }}>Eye</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: TOKENS.muted }}>SPH</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: TOKENS.muted }}>CYL</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: TOKENS.muted }}>Axis</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: TOKENS.muted }}>PD</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: TOKENS.muted }}>ADD</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detail.prescription.details.map((row, idx) => (
                  <TableRow key={row.id ?? row.eye ?? idx}>
                    <TableCell sx={{ fontWeight: 600, color: TOKENS.textPrimary }}>{row.eye}</TableCell>
                    <TableCell>{formatPrescriptionVal(row.sph)}</TableCell>
                    <TableCell>{formatPrescriptionVal(row.cyl)}</TableCell>
                    <TableCell>{formatPrescriptionVal(row.axis)}</TableCell>
                    <TableCell>{formatPrescriptionVal(row.pd)}</TableCell>
                    <TableCell>{formatPrescriptionVal(row.add)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
      ) : null}

      {/* 3) Items section — e-commerce look with thumbnails */}
      <Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: TOKENS.muted, textTransform: "uppercase", letterSpacing: 1, mb: 1.25 }}>
          Items
        </Typography>
        <Box
          sx={{
            bgcolor: TOKENS.surface,
            borderRadius: "12px",
            border: `1px solid ${TOKENS.divider}`,
            overflow: "hidden",
          }}
        >
          {detail.items.map((item, idx) => {
            const lineTotal = item.totalPrice ?? item.unitPrice * item.quantity;
            return (
              <Box key={item.id}>
                {idx > 0 && <Divider sx={{ borderColor: TOKENS.divider }} />}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    "&:hover": { bgcolor: "#FAFAFA" },
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      flexShrink: 0,
                      borderRadius: "10px",
                      bgcolor: TOKENS.thumbnailBg,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.productImageUrl ? (
                      <Box
                        component="img"
                        src={item.productImageUrl}
                        alt=""
                        sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: 12, color: TOKENS.muted }}>No image</Typography>
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, color: TOKENS.textPrimary, fontSize: 15 }}>
                      {item.productName}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: TOKENS.textSecondary }}>
                      {item.variantName} · {item.sku} · Qty {item.quantity}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ fontWeight: 700, color: TOKENS.textPrimary, fontSize: 15 }}>
                      {lineTotal.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </Typography>
                    {item.quantity > 1 && (
                      <Typography sx={{ fontSize: 12, color: TOKENS.muted }}>
                        {item.unitPrice.toLocaleString("en-US", { style: "currency", currency: "USD" })} each
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* 3) Process Order Button — between Items and Tracking */}
      {showProcessButton && onProcessOrderClick && (
        <Button
          fullWidth
          variant="outlined"
          size="medium"
          sx={{
            height: 40,
            fontWeight: 600,
            fontSize: 13,
            textTransform: "capitalize",
            borderRadius: 1,
            borderColor: "#B68C5A",
            bgcolor: "rgba(182,140,90,0.05)",
            color: "#B68C5A",
            "&:hover": {
              borderColor: "#B68C5A",
              bgcolor: "#B68C5A",
              color: "#FFFFFF",
            },
          }}
          onClick={() => onProcessOrderClick(detail.id)}
        >
          Process the Order
        </Button>
      )}

      {/* 3.1) Add Tracking Detail Button — between Items and Status History */}
      {showAddTrackingButton && onAddTrackingClick && (
        <Button
          fullWidth
          variant="outlined"
          size="medium"
          sx={{
            height: 40,
            fontWeight: 600,
            fontSize: 13,
            textTransform: "capitalize",
            borderRadius: 1,
            borderColor: "#B68C5A",
            bgcolor: "rgba(182,140,90,0.05)",
            color: "#B68C5A",
            "&:hover": {
              borderColor: "#B68C5A",
              bgcolor: "#B68C5A",
              color: "#FFFFFF",
            },
          }}
          onClick={() => onAddTrackingClick(detail.id)}
        >
          Add Tracking Detail
        </Button>
      )}

      {/* 3.5) Tracking information — shipment tracking */}
      {detail.shipment && detail.shipment.trackingCode && (
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: TOKENS.muted, textTransform: "uppercase", letterSpacing: 1, mb: 1.25 }}>
            Tracking
          </Typography>
          <Box
            sx={{
              bgcolor: TOKENS.surface,
              borderRadius: "12px",
              border: `1px solid ${TOKENS.divider}`,
              p: 2,
            }}
          >
            <Box sx={{ width: "100%" }}>
              {/* Carrier with Make Delivered Button */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: `${LABEL_WIDTH}px 1fr`,
                  gap: 1.25,
                  mb: `${ROW_GAP_PX}px`,
                  alignItems: "center",
                  lineHeight: 1.5,
                }}
              >
                <Typography sx={{ fontSize: LABEL_FONT_SIZE, color: "#8A8A8A", flexShrink: 0 }}>
                  Carrier
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "space-between" }}>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: VALUE_FONT_SIZE,
                      color: "#171717",
                      fontWeight: 400,
                    }}
                  >
                    {detail.shipment.carrierName || "—"}
                  </Typography>
                </Box>
              </Box>

              {/* Tracking Code with Copy Button */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: `${LABEL_WIDTH}px 1fr`,
                  gap: 1.25,
                  mb: `${ROW_GAP_PX}px`,
                  alignItems: "center",
                  lineHeight: 1.5,
                }}
              >
                <Typography sx={{ fontSize: LABEL_FONT_SIZE, color: "#8A8A8A", flexShrink: 0 }}>
                  Tracking Code
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: VALUE_FONT_SIZE,
                      color: "#171717",
                      fontWeight: 600,
                      fontFamily: "monospace",
                    }}
                  >
                    {detail.shipment.trackingCode}
                  </Typography>
                  <Tooltip title="Copy tracking code" arrow>
                    <Box
                      component="button"
                      type="button"
                      onClick={() => navigator.clipboard.writeText(detail.shipment?.trackingCode || "")}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        p: 0.5,
                        borderRadius: 1,
                        border: "none",
                        bgcolor: "transparent",
                        cursor: "pointer",
                        color: TOKENS.muted,
                        "&:hover": { bgcolor: "rgba(0,0,0,0.04)", color: TOKENS.textPrimary },
                      }}
                    >
                      <ContentCopyIcon sx={{ fontSize: 16 }} />
                    </Box>
                  </Tooltip>
                </Box>
              </Box>

              {/* Tracking URL with Link Button */}
              {detail.shipment.trackingUrl && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: `${LABEL_WIDTH}px 1fr`,
                    gap: 1.25,
                    mb: `${ROW_GAP_PX}px`,
                    alignItems: "center",
                    lineHeight: 1.5,
                  }}
                >
                  <Typography sx={{ fontSize: LABEL_FONT_SIZE, color: "#8A8A8A", flexShrink: 0 }} />
                  <Box
                    component="a"
                    href={detail.shipment.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.75,
                      fontSize: 13,
                      fontWeight: 500,
                      color: TOKENS.accent,
                      textDecoration: "none",
                      px: 2,
                      py: 0.75,
                      borderRadius: 1,
                      border: `1px solid ${TOKENS.accent}`,
                      bgcolor: "rgba(182,140,90,0.05)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: TOKENS.accent,
                        color: TOKENS.surface,
                      },
                    }}
                  >
                    Move to Tracking Page
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        fontSize: 12,
                      }}
                    >
                      →
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Shipped At */}
              {detail.shipment.shippedAt &&
                labelValueRow(
                  "Shipped At",
                  new Date(detail.shipment.shippedAt).toLocaleString(),
                  false
                )}

              {/* Estimated Delivery */}
              {detail.shipment.estimatedDeliveryAt &&
                labelValueRow(
                  "Est. Delivery",
                  new Date(detail.shipment.estimatedDeliveryAt).toLocaleString(),
                  false
                )}

              {/* Actual Delivery */}
              {detail.shipment.actualDeliveryAt &&
                labelValueRow(
                  "Delivered At",
                  new Date(detail.shipment.actualDeliveryAt).toLocaleString(),
                  false
                )}

              {/* Shipping Notes */}
              {detail.shipment.shippingNotes && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: `${LABEL_WIDTH}px 1fr`,
                    gap: 1.25,
                    mt: `${ROW_GAP_PX}px`,
                    alignItems: "flex-start",
                    lineHeight: 1.5,
                  }}
                >
                  <Typography sx={{ fontSize: LABEL_FONT_SIZE, color: "#8A8A8A", flexShrink: 0 }}>
                    Notes
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: VALUE_FONT_SIZE,
                      color: "#171717",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {detail.shipment.shippingNotes}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* 3.9) Make Order Delivered Button — between Tracking and Status History */}
      {onMarkDeliveredClick && detail.orderStatus && String(detail.orderStatus).toLowerCase().includes("shipped") && (
        <Button
          fullWidth
          variant="outlined"
          size="medium"
          sx={{
            height: 40,
            fontWeight: 600,
            fontSize: 13,
            textTransform: "capitalize",
            borderRadius: 1,
            borderColor: "rgba(34,197,94,0.4)",
            bgcolor: "rgba(34,197,94,0.06)",
            color: "#15803d",
            "&:hover": {
              borderColor: "rgba(22,163,74,0.9)",
              bgcolor: "rgba(187,247,208,0.7)",
            },
          }}
          onClick={() => onMarkDeliveredClick(detail.id)}
        >
          Mark Order Delivered
        </Button>
      )}

      {/* 4) Status history — vertical timeline */}
      {detail.statusHistories && detail.statusHistories.length > 0 && (
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: TOKENS.muted, textTransform: "uppercase", letterSpacing: 1, mb: 1.25 }}>
            Status history
          </Typography>
          <Box sx={{ position: "relative", pl: 2.5 }}>
            <Box
              sx={{
                position: "absolute",
                left: 6,
                top: 8,
                bottom: 8,
                width: 2,
                borderRadius: 1,
                bgcolor: TOKENS.divider,
              }}
            />
            {detail.statusHistories.map((h, idx, arr) => {
              const isLatest = idx === arr.length - 1;
              return (
                <Box
                  key={idx}
                  sx={{
                    position: "relative",
                    pb: idx < arr.length - 1 ? 2 : 0,
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      left: -20,
                      top: 2,
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      bgcolor: TOKENS.surface,
                      border: `2px solid ${isLatest ? TOKENS.accent : TOKENS.divider}`,
                      boxShadow: isLatest ? `0 0 0 2px rgba(182,140,90,0.2)` : "none",
                      zIndex: 1,
                    }}
                  />
                  <Typography sx={{ fontWeight: 600, color: TOKENS.textPrimary, fontSize: 14 }}>
                    {h.toStatus}
                  </Typography>
                  {h.notes && (
                    <Typography sx={{ fontSize: 13, color: TOKENS.textSecondary, mt: 0.5 }}>
                      {h.notes}
                    </Typography>
                  )}
                  <Typography sx={{ fontSize: 12, color: TOKENS.muted, mt: 0.5 }}>
                    {new Date(h.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}
