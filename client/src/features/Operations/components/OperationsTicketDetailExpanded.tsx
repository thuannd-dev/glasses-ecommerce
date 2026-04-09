
import React from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Typography,
  Link,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
} from "@mui/material";
import type { TicketDetailDto } from "../../../lib/types/afterSales";

interface OperationsTicketDetailExpandedProps {
  readonly detail: TicketDetailDto;
  readonly isLoading?: boolean;
  readonly isReceiving?: boolean;
  readonly isInspecting?: boolean;
  readonly onReceive?: () => void;
  readonly onAccept?: (refundAmount?: number) => void;
  readonly onRequestRefundAmount?: () => void; // New: callback to show refund dialog
  readonly onReject?: () => void;
}

export function OperationsTicketDetailExpanded({
  detail,
  isLoading,
  isReceiving,
  isInspecting,
  onReceive,
  onAccept,
  onRequestRefundAmount,
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

  const handleAcceptClick = () => {
    // For ReturnAndRefund, show refund dialog
    if (detail.resolutionType === "ReturnAndRefund") {
      onRequestRefundAmount?.();
    } else {
      // For other resolution types, accept directly
      onAccept?.();
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
                    Discount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#16A34A" }} align="right">
                    Final Price
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detail.items.map((item) => (
                  <React.Fragment key={item.id}>
                    <TableRow>
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
                      <TableCell sx={{ fontSize: 12, color: item.discountApplied && item.discountApplied > 0 ? "#DC2626" : "#6B6B6B" }} align="right">
                        {item.discountApplied && item.discountApplied > 0 ? `-$${item.discountApplied.toFixed(2)}` : "—"}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#16A34A" }} align="right">
                        ${(item.totalPrice - (item.discountApplied || 0)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    {/* Prescription Details Row */}
                    {item.prescriptionDetails && item.prescriptionDetails.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ p: 2, bgcolor: "#FAFAF8" }}>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: "0.14em" }}>
                              📋 Prescription Details
                            </Typography>
                            <Box sx={{ overflowX: "auto" }}>
                              <Table size="small" sx={{ width: "100%" }}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11, color: "#6B6B6B", p: 0.75 }}>Eye</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11, color: "#6B6B6B", p: 0.75 }} align="right">SPH</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11, color: "#6B6B6B", p: 0.75 }} align="right">CYL</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11, color: "#6B6B6B", p: 0.75 }} align="right">Axis</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11, color: "#6B6B6B", p: 0.75 }} align="right">ADD</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11, color: "#6B6B6B", p: 0.75 }} align="right">PD</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {item.prescriptionDetails.map((detail, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell sx={{ fontSize: 11, color: "#171717", p: 0.75 }}>
                                        {detail.eye === "Left" ? "OS (Left)" : detail.eye === "Right" ? "OD (Right)" : detail.eye}
                                      </TableCell>
                                      <TableCell sx={{ fontSize: 11, color: "#171717", p: 0.75 }} align="right">
                                        {detail.sph ?? "—"}
                                      </TableCell>
                                      <TableCell sx={{ fontSize: 11, color: "#171717", p: 0.75 }} align="right">
                                        {detail.cyl ?? "—"}
                                      </TableCell>
                                      <TableCell sx={{ fontSize: 11, color: "#171717", p: 0.75 }} align="right">
                                        {detail.axis ?? "—"}
                                      </TableCell>
                                      <TableCell sx={{ fontSize: 11, color: "#171717", p: 0.75 }} align="right">
                                        {detail.add ?? "—"}
                                      </TableCell>
                                      <TableCell sx={{ fontSize: 11, color: "#171717", p: 0.75 }} align="right">
                                        {detail.pd ?? "—"}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                            {item.lensVariantName && (
                              <Box sx={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 1, mt: 1 }}>
                                <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600 }}>Lens:</Typography>
                                <Typography sx={{ fontSize: 12, color: "#171717" }}>{item.lensVariantName} (${item.lensUnitPrice?.toFixed(2)})</Typography>
                              </Box>
                            )}
                            {item.coatingExtraPrice && item.coatingExtraPrice > 0 && (
                              <Box sx={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 1 }}>
                                <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600 }}>Coating:</Typography>
                                <Typography sx={{ fontSize: 12, color: "#171717" }}>+${item.coatingExtraPrice.toFixed(2)}</Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </Box>

          {/* Pricing Breakdown Section */}
          {detail.items && detail.items.length > 0 && (
            <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: "0.14em", mb: 1.5 }}>
                Pricing Breakdown
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {detail.items.map((item, idx) => (
                  <Box key={`${item.productVariantId}-${idx}`} sx={{ p: 1.5, bgcolor: "#FAFAF8", borderRadius: 1, border: "1px solid rgba(0,0,0,0.06)" }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#171717", mb: 1 }}>
                      {item.productName} {item.quantity > 1 ? `(Qty: ${item.quantity})` : ""}
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 1, fontSize: 12, color: "#6B6B6B" }}>
                      <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 500 }}>Frame:</Typography>
                      <Typography sx={{ fontSize: 12, color: "#171717" }}>${item.unitPrice.toFixed(2)}</Typography>

                      {item.lensVariantName && (
                        <>
                          <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 500 }}>Lens:</Typography>
                          <Typography sx={{ fontSize: 12, color: "#171717" }}>
                            {item.lensVariantName} — ${item.lensUnitPrice?.toFixed(2) || "0.00"}
                          </Typography>
                        </>
                      )}

                      {item.coatings && item.coatings.length > 0 ? (
                        <>
                          <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 500 }}>Options:</Typography>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            {item.coatings.map((coating) => (
                              <Typography key={coating.id} sx={{ fontSize: 12, color: "#171717" }}>
                                {coating.coatingName} +${coating.price.toFixed(2)}
                              </Typography>
                            ))}
                          </Box>
                        </>
                      ) : item.coatingExtraPrice && item.coatingExtraPrice > 0 ? (
                        <>
                          <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 500 }}>Options:</Typography>
                          <Typography sx={{ fontSize: 12, color: "#171717" }}>+${item.coatingExtraPrice.toFixed(2)}</Typography>
                        </>
                      ) : null}

                      <Divider sx={{ gridColumn: "1 / -1", my: 0.5 }} />

                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#171717" }}>Item Total:</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#16A34A" }}>
                        ${(item.unitPrice + (item.lensUnitPrice || 0) + (item.coatingExtraPrice || 0)).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
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
            onClick={handleAcceptClick}
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
