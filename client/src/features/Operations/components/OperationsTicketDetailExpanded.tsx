import { Box, Button, Chip, CircularProgress, Typography, Link, Avatar } from "@mui/material";
import type { TicketDetailDto } from "../../../lib/types/afterSales";

interface OperationsTicketDetailExpandedProps {
  readonly detail: TicketDetailDto;
  readonly isLoading?: boolean;
  readonly isReceiving?: boolean;
  readonly isInspecting?: boolean;
  readonly onReceive?: () => void;
  readonly onAccept?: () => void;
  readonly onReject?: () => void;
}

export function OperationsTicketDetailExpanded({
  detail,
  isLoading,
  isReceiving,
  isInspecting,
  onReceive,
  onAccept,
  onReject,
}: OperationsTicketDetailExpandedProps) {
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString();
  };

  const getResolutionTypeLabel = (type: string | undefined) => {
    switch (type) {
      case "ReturnAndRefund":
        return "Return & Refund";
      case "WarrantyRepair":
        return "Warranty Repair";
      case "WarrantyReplace":
        return "Warranty Replace";
      case "RefundOnly":
        return "Refund Only";
      default:
        return type || "—";
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Row 1: Resolution Type & Receipt Status */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr" }, gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, mb: 0.75 }}>
            RESOLUTION TYPE
          </Typography>
          <Chip
            label={getResolutionTypeLabel(detail.resolutionType)}
            size="small"
            sx={{
              borderRadius: 1,
              height: 28,
              bgcolor: "#EEF5EE",
              color: "#466A4A",
              fontSize: 12,
              fontWeight: 600,
            }}
          />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, mb: 0.75 }}>
            RECEIVED AT
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#171717" }}>
            {detail.receivedAt ? formatDate(detail.receivedAt) : "Not yet received"}
          </Typography>
        </Box>
      </Box>

      {/* Row 2: Dates */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr" }, gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, mb: 0.75 }}>
            CREATED
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#171717" }}>{formatDate(detail.createdAt)}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, mb: 0.75 }}>
            RESOLVED
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#171717" }}>
            {detail.resolvedAt ? formatDate(detail.resolvedAt) : "—"}
          </Typography>
        </Box>
      </Box>

      {/* Staff Notes */}
      {detail.staffNotes && (
        <Box sx={{ bgcolor: "#F6F6F6", p: 1.5, borderRadius: 1 }}>
          <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, mb: 0.75 }}>
            STAFF NOTES
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#171717", lineHeight: 1.5 }}>
            {detail.staffNotes}
          </Typography>
        </Box>
      )}

      {/* Policy Violation */}
      {detail.policyViolation && (
        <Box sx={{ bgcolor: "#FEF3F2", p: 1.5, borderRadius: 1, borderLeft: "3px solid #F04438" }}>
          <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, mb: 0.75 }}>
            POLICY VIOLATION
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#D42817", lineHeight: 1.5 }}>
            {detail.policyViolation}
          </Typography>
        </Box>
      )}

      {/* Attachments */}
      {detail.attachments && detail.attachments.length > 0 && (
        <Box sx={{ bgcolor: "#F6F6F6", p: 1.5, borderRadius: 1 }}>
          <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, mb: 1 }}>
            ATTACHMENTS ({detail.attachments.length})
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {detail.attachments.map((attachment) => (
              <Link
                key={attachment.id}
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  fontSize: 13,
                  color: "#0369A1",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                📎 {attachment.fileName}
              </Link>
            ))}
          </Box>
        </Box>
      )}

      {/* Refund Amount (if applicable) */}
      {detail.refundAmount !== undefined && detail.refundAmount !== null && (
        <Box
          sx={{
            bgcolor: "#F0FDF4",
            p: 1.5,
            borderRadius: 1,
            borderLeft: "3px solid #16A34A",
          }}
        >
          <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, mb: 0.75 }}>
            REFUND AMOUNT
          </Typography>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#16A34A" }}>
            ${detail.refundAmount.toFixed(2)}
          </Typography>
        </Box>
      )}

      {/* Ticket Items */}
      {detail.items && detail.items.length > 0 && (
        <Box sx={{ bgcolor: "#F6F6F6", p: 1.5, borderRadius: 1 }}>
          <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, mb: 1 }}>
            ITEMS ({detail.items.length})
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {detail.items.map((item) => (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  gap: 1,
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  p: 1,
                  bgcolor: "#FFFFFF",
                  borderRadius: 0.75,
                  border: "1px solid #E5E7EB",
                }}
              >
                <Box sx={{ display: "flex", gap: 1, flex: 1, minWidth: 0 }}>
                  {item.productImageUrl && (
                    <Avatar
                      variant="rounded"
                      src={item.productImageUrl}
                      sx={{ width: 48, height: 48, flexShrink: 0 }}
                    />
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#171717" }}>
                      {item.productName}
                    </Typography>
                    {item.variantName && (
                      <Typography sx={{ fontSize: 11, color: "#6B6B6B", mt: 0.25 }}>
                        {item.variantName}
                      </Typography>
                    )}
                    {item.sku && (
                      <Typography sx={{ fontSize: 10, color: "#999999", mt: 0.25, fontFamily: "monospace" }}>
                        SKU: {item.sku}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box sx={{ textAlign: "right", ml: 1, flexShrink: 0 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#171717" }}>
                    Qty: {item.quantity}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#6B6B6B", mt: 0.25 }}>
                    ${item.unitPrice.toFixed(2)} each
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Received Button - Show only when awaiting */}
      {!detail.receivedAt && (
        <Button
          onClick={onReceive}
          disabled={isReceiving}
          variant="contained"
          sx={{
            mt: 2,
            py: 1.2,
            bgcolor: "#16A34A",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 14,
            textTransform: "uppercase",
            borderRadius: 1,
            "&:hover": { bgcolor: "#15803D" },
            "&:disabled": { bgcolor: "#D1D5DB", color: "#9CA3AF" },
          }}
        >
          {isReceiving ? "Marking Received..." : "Received"}
        </Button>
      )}

      {/* Accept/Reject Buttons - Show only when inspecting (received but not resolved) */}
      {detail.receivedAt && !detail.resolvedAt && (
        <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
          <Button
            onClick={onAccept}
            disabled={isInspecting}
            variant="contained"
            fullWidth
            sx={{
              py: 1.2,
              bgcolor: "#16A34A",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 14,
              textTransform: "uppercase",
              borderRadius: 1,
              "&:hover": { bgcolor: "#15803D" },
              "&:disabled": { bgcolor: "#D1D5DB", color: "#9CA3AF" },
            }}
          >
            {isInspecting ? "Processing..." : "Accept"}
          </Button>
          <Button
            onClick={onReject}
            disabled={isInspecting}
            variant="outlined"
            fullWidth
            sx={{
              py: 1.2,
              color: "#DC2626",
              fontWeight: 700,
              fontSize: 14,
              textTransform: "uppercase",
              borderRadius: 1,
              borderColor: "#DC2626",
              "&:hover": { bgcolor: "rgba(220, 38, 38, 0.04)", borderColor: "#991B1B" },
              "&:disabled": { color: "#9CA3AF", borderColor: "#D1D5DB" },
            }}
          >
            Reject
          </Button>
        </Box>
      )}
    </Box>
  );
}
