import React from "react";
import {
  Box,
  Divider,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import type { TicketDetailDto } from "../../../lib/types/afterSales";

const TOKENS = {
  bgTint: "#FAFAF8",
  surface: "#FFFFFF",
  border: "rgba(0,0,0,0.08)",
  divider: "rgba(0,0,0,0.06)",
  textPrimary: "#171717",
  textSecondary: "#6B6B6B",
  muted: "#8A8A8A",
  accent: "#B68C5A",
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

function getTicketStatusPill(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "pending") return { border: "#EAEAEA", bg: "#F6F6F6", color: "#4B4B4B" };
  if (s === "inprogress") return { border: "rgba(249,115,22,0.4)", bg: "rgba(249,115,22,0.12)", color: "#c2410c" };
  if (s === "resolved" || s === "closed") return { border: "#D4E5D5", bg: "#EEF5EE", color: "#466A4A" };
  if (s === "rejected") return { border: "#E8CFCF", bg: "#F6EAEA", color: "#8E3B3B" };
  return { border: "#EAEAEA", bg: "#F6F6F6", color: "#4B4B4B" };
}

function getTicketTypePill(type: string) {
  const t = (type || "").toLowerCase();
  if (t === "return") return { border: "#DBEAFE", bg: "#EFF6FF", color: "#0369A1" };
  if (t === "refund") return { border: "#F3E8FF", bg: "#FAF5FF", color: "#6D28D9" };
  if (t === "warranty") return { border: "#DCFCE7", bg: "#F0FDF4", color: "#16A34A" };
  return { border: "#E5E7EB", bg: "#F9FAFB", color: "#374151" };
}

function getOrderTypeChipColors(orderType: string) {
  const t = (orderType || "").toLowerCase();
  if (t === "prescription") return { bg: "#EEF2FF", color: "#3730A3" };
  return { bg: "#ECFEFF", color: "#0369A1" };
}

interface TicketDetailExpandedProps {
  readonly detail: TicketDetailDto;
  readonly onApprove?: () => void;
  readonly onReject?: () => void;
  readonly isLoading?: boolean;
}

export function TicketDetailExpanded({ detail, onApprove, onReject, isLoading }: TicketDetailExpandedProps) {
  const statusPill = getTicketStatusPill(detail.ticketStatus);
  const typePill = getTicketTypePill(detail.ticketType);

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
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  );

  const createdAt = detail.createdAt ? new Date(detail.createdAt).toLocaleString() : "—";
  const resolvedAt = detail.resolvedAt ? new Date(detail.resolvedAt).toLocaleString() : "—";

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
      {/* Main info blocks */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gridTemplateRows: { xs: "auto auto auto", md: "1fr 1fr" },
          gap: `${GRID_GAP}px`,
          alignItems: "stretch",
          minHeight: { md: CARD_FIXED_HEIGHT * 2 + GRID_GAP },
        }}
      >
        {/* 1) Ticket Info */}
        <Box sx={cardStyle}>
          <Typography sx={cardTitleStyle}>Ticket Info</Typography>
          <Box sx={{ width: "100%" }}>
            {labelValueRow(
              "Type",
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: STATUS_PILL_HEIGHT,
                  px: "10px",
                  borderRadius: 999,
                  border: `1px solid ${typePill.border}`,
                  bgcolor: typePill.bg,
                  color: typePill.color,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {detail.ticketType}
              </Box>,
            )}
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
                  border: `1px solid ${statusPill.border}`,
                  bgcolor: statusPill.bg,
                  color: statusPill.color,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {detail.ticketStatus}
              </Box>,
            )}
            {labelValueRow("Created", createdAt)}
          </Box>
        </Box>

        {/* 2) Order & Evidence */}
        <Box sx={cardStyle}>
          <Typography sx={cardTitleStyle}>Reference</Typography>
          <Box sx={{ width: "100%" }}>
            {labelValueRow(
              "Order ID",
              detail.orderId ? (
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    fontFamily: "monospace",
                    fontSize: 12,
                    backgroundColor: "#F7F7F7",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#EFEFEF" },
                  }}
                  onClick={() => navigator.clipboard.writeText(detail.orderId)}
                >
                  {detail.orderId}
                  <ContentCopyIcon sx={{ fontSize: 12, color: "#8A8A8A" }} />
                </Box>
              ) : (
                "—"
              ),
            )}
            {detail.orderType && labelValueRow(
              "Order Type",
              (() => {
                const typeColors = getOrderTypeChipColors(detail.orderType);
                return (
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      height: STATUS_PILL_HEIGHT,
                      px: "10px",
                      borderRadius: 999,
                      bgcolor: typeColors.bg,
                      color: typeColors.color,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {detail.orderType}
                  </Box>
                );
              })(),
            )}
            {labelValueRow(
              "Evidence",
              detail.isRequiredEvidence ? (
                <Chip
                  label="Required"
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ height: 20, fontSize: 11 }}
                />
              ) : (
                <Typography sx={{ fontSize: 12, color: "#6B6B6B" }}>Not required</Typography>
              ),
            )}
          </Box>
        </Box>

        {/* 3) Resolution Details */}
        <Box sx={cardStyle}>
          <Typography sx={cardTitleStyle}>Resolution</Typography>
          <Box sx={{ width: "100%" }}>
            {labelValueRow("Type", detail.resolutionType || "—")}
            {labelValueRow(
              "Refund",
              detail.refundAmount ? `$${detail.refundAmount.toFixed(2)}` : "—",
            )}
            {labelValueRow("Resolved", resolvedAt)}
          </Box>
        </Box>

        {/* 4) Staff Notes */}
        <Box sx={cardStyle}>
          <Typography sx={cardTitleStyle}>Notes</Typography>
          <Box sx={{ width: "100%" }}>
            {labelValueRow(
              "Reason",
              <Typography
                sx={{
                  fontSize: VALUE_FONT_SIZE,
                  color: "#171717",
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                }}
              >
                {detail.reason || "—"}
              </Typography>,
            )}
            {detail.staffNotes && labelValueRow("Staff Notes", detail.staffNotes)}
          </Box>
        </Box>
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 1 }} />

      {/* Ticket Items */}
      {detail.items && detail.items.length > 0 && (
        <Box sx={{ width: "100%" }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#8A8A8A", mb: 1 }}>
            ITEMS
          </Typography>
          <Box sx={{ overflowX: "auto", borderRadius: 1, border: "1px solid rgba(0,0,0,0.08)" }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#F9FAFB" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B6B6B" }}>
                    Product
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B6B6B" }} align="right">
                    Quantity
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B6B6B" }} align="right">
                    Unit Price
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B6B6B" }} align="right">
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detail.items.map((item) => (
                  <TableRow key={`${item.productVariantId}-${item.quantity}`}>
                    <TableCell sx={{ fontSize: 12, color: "#171717" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {item.productImageUrl && (
                          <Avatar
                            variant="rounded"
                            src={item.productImageUrl}
                            sx={{ width: 40, height: 40, flexShrink: 0 }}
                          />
                        )}
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: 12 }}>
                            {item.productName}
                          </Typography>
                          {item.variantName && (
                            <Typography sx={{ fontSize: 11, color: "#6B6B6B" }}>
                              {item.variantName}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: "#171717" }} align="right">
                      {item.quantity}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: "#171717" }} align="right">
                      ${item.unitPrice.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#171717" }} align="right">
                      ${item.totalPrice.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
      )}

      {/* Attachments */}
      {detail.attachments && detail.attachments.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ width: "100%" }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#8A8A8A", mb: 1 }}>
              ATTACHMENTS
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {detail.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.12)",
                    backgroundColor: "#F7F7F7",
                    color: "#0369A1",
                    textDecoration: "none",
                    fontSize: "12px",
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLAnchorElement).style.backgroundColor = "#EFEFEF";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLAnchorElement).style.backgroundColor = "#F7F7F7";
                  }}
                >
                  📎 {att.fileName}
                </a>
              ))}
            </Box>
          </Box>
        </>
      )}

      {/* Action Buttons - Only show for Pending tickets */}
      {detail.ticketStatus?.toLowerCase() === "pending" && (onApprove || onReject) && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
              width: "100%",
              pt: 0.5,
            }}
          >
            {onApprove && (
              <Button
                variant="outlined"
                size="small"
                onClick={onApprove}
                disabled={isLoading}
                sx={{
                  borderColor: "#D4E5D5",
                  bgcolor: "#EEF5EE",
                  color: "#466A4A",
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "none",
                  py: 0.75,
                  "&:hover": {
                    borderColor: "#D4E5D5",
                    bgcolor: "#E0EDDF",
                  },
                  "&:disabled": {
                    borderColor: "#D4E5D5",
                    bgcolor: "#EEF5EE",
                    color: "#466A4A",
                    opacity: 0.6,
                  },
                }}
              >
                Confirm
              </Button>
            )}
            {onReject && (
              <Button
                variant="outlined"
                size="small"
                onClick={onReject}
                disabled={isLoading}
                sx={{
                  borderColor: "#E8CFCF",
                  bgcolor: "#F6EAEA",
                  color: "#8E3B3B",
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "none",
                  py: 0.75,
                  "&:hover": {
                    borderColor: "#E8CFCF",
                    bgcolor: "#EFD5D5",
                  },
                  "&:disabled": {
                    borderColor: "#E8CFCF",
                    bgcolor: "#F6EAEA",
                    color: "#8E3B3B",
                    opacity: 0.6,
                  },
                }}
              >
                Reject
              </Button>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
