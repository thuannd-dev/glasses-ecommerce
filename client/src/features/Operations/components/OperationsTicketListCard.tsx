import { useState } from "react";
import { Box, Chip, Collapse, IconButton, Paper, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { AfterSalesTicketDto } from "../../../lib/types/afterSales";
import { useOperationsAfterSalesTicket, useReceiveAfterSalesTicket, useInspectAfterSalesTicket } from "../../../lib/hooks/useOperationsAfterSalesTickets";
import { OperationsTicketDetailExpanded } from "./OperationsTicketDetailExpanded";
import { RejectReasonDialog } from "./RejectReasonDialog";

function getStatusChipColors(status: string, receivedAt?: string | null) {
  const s = (status || "").toString();
  switch (s) {
    case "Pending":
      return { border: "#EAEAEA", bg: "#F6F6F6", color: "#4B4B4B", label: "Pending" };
    case "InProgress":
      return {
        border: "rgba(249,115,22,0.4)",
        bg: "rgba(249,115,22,0.12)",
        color: "#c2410c",
        label: receivedAt ? "Inspecting" : "Awaiting",
      };
    case "Resolved":
      return { border: "#D4E5D5", bg: "#EEF5EE", color: "#466A4A", label: "Accepted" };
    case "Rejected":
      return { border: "#E8CFCF", bg: "#F6EAEA", color: "#8E3B3B", label: "Rejected" };
    case "Closed":
      return { border: "#E8CFCF", bg: "#F6EAEA", color: "#8E3B3B", label: "Closed" };
    default:
      return { border: "#EAEAEA", bg: "#F6F6F6", color: "#4B4B4B", label: s || "—" };
  }
}

function getTicketTypeChipColors(type: string) {
  const t = (type || "").toLowerCase();
  switch (t) {
    case "return":
      return { border: "#DBEAFE", bg: "#EFF6FF", color: "#0369A1" };
    case "refund":
      return { border: "#F3E8FF", bg: "#FAF5FF", color: "#6D28D9" };
    case "warranty":
      return { border: "#DCFCE7", bg: "#F0FDF4", color: "#16A34A" };
    default:
      return { border: "#E5E7EB", bg: "#F9FAFB", color: "#374151" };
  }
}

export interface OperationsTicketListCardProps {
  readonly summary: AfterSalesTicketDto;
}

export function OperationsTicketListCard({ summary }: OperationsTicketListCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const { data: detail, isLoading: isLoadingDetail } = useOperationsAfterSalesTicket(
    expanded ? summary.id : undefined,
  );
  const { mutateAsync: markAsReceivedAsync, isPending: isReceiving } = useReceiveAfterSalesTicket();
  const { mutateAsync: inspectAsync, isPending: isInspecting } = useInspectAfterSalesTicket();

  const status = (summary.status ?? summary.ticketStatus ?? "").toString();
  const { border, bg, color, label } = getStatusChipColors(status, summary.receivedAt);
  const createdAt = summary.createdAt ? new Date(summary.createdAt) : null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleReceive = async () => {
    try {
      console.log("🔘 Marking ticket as received:", summary.id);
      await markAsReceivedAsync(summary.id);
      console.log("✅ Success! Ticket marked as received. Refetch in progress...");
      // Wait for refetch to complete and UI to update
      await new Promise((resolve) => setTimeout(resolve, 500));
      setExpanded(false);
    } catch (error: unknown) {
      console.error("❌ Error marking ticket as received:", error);
      const message = 
        (error as any)?.response?.data?.message || 
        (error as any)?.message || 
        "Failed to mark ticket as received. Please check the console for details.";
      alert(message);
    }
  };

  const handleAccept = async () => {
    try {
      console.log("✅ Accepting ticket:", summary.id);
      
      // Determine staff notes based on resolution type
      let notes = "Inspection passed. Item accepted.";
      if (detail?.resolutionType === "WarrantyReplace") {
        notes = "Inspection passed. Warranty replacement is/are on route";
      } else if (detail?.resolutionType === "ReturnAndRefund") {
        notes = "Inspection passed. Return accepted";
      } else if (detail?.resolutionType === "WarrantyRepair") {
        notes = "Inspection passed. Warranty repaired is/are on route";
      }
      
      await inspectAsync({
        id: summary.id,
        decision: {
          isAccepted: true,
          notes,
        },
      });
      console.log("✅ Ticket accepted successfully");
      await new Promise((resolve) => setTimeout(resolve, 500));
      setExpanded(false);
    } catch (error: unknown) {
      console.error("❌ Error accepting ticket:", error);
      const message = 
        (error as any)?.response?.data?.message || 
        (error as any)?.message || 
        "Failed to accept ticket. Please check the console for details.";
      alert(message);
    }
  };

  const handleRejectWithReason = async (reason: string) => {
    try {
      console.log("❌ Rejecting ticket:", summary.id);
      await inspectAsync({
        id: summary.id,
        decision: {
          isAccepted: false,
          notes: reason,
        },
      });
      console.log("✅ Ticket rejected successfully");
      await new Promise((resolve) => setTimeout(resolve, 500));
      setShowRejectDialog(false);
      setExpanded(false);
    } catch (error: unknown) {
      console.error("❌ Error rejecting ticket:", error);
      const message = 
        (error as any)?.response?.data?.message || 
        (error as any)?.message || 
        "Failed to reject ticket. Please check the console for details.";
      alert(message);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "#FFFFFF",
        boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
        px: 2.75,
        py: 2.25,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 16px 36px rgba(0,0,0,0.08)",
          borderColor: "rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* Row 1: Ticket ID pill + status + actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
          <Typography component="span" sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600 }}>
            Ticket
          </Typography>
          <Box
            component="button"
            type="button"
            onClick={() => handleCopy(summary.id)}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.08)",
              bgcolor: "#F7F7F7",
              fontFamily: "monospace",
              fontSize: 13,
              fontWeight: 600,
              color: "#171717",
              cursor: "pointer",
              "&:hover": { bgcolor: "#EFEFEF" },
            }}
          >
            {summary.id}
            <ContentCopyIcon sx={{ fontSize: 14, color: "#8A8A8A" }} />
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
          {/* Current status chip */}
          <Chip
            label={label}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: 12,
              border: `1px solid ${border}`,
              bgcolor: bg,
              color,
              borderRadius: 999,
              height: 26,
              px: 1.25,
            }}
          />

          <IconButton
            size="small"
            onClick={() => setExpanded((e) => !e)}
            sx={{ color: "#6B6B6B" }}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      {/* Row 2: meta */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          fontSize: 13,
          color: "#6B6B6B",
        }}
      >
        <Typography component="span" sx={{ fontSize: 13, color: "#6B6B6B" }}>
          {createdAt ? createdAt.toLocaleString() : "—"}
        </Typography>

        {/* Ticket Type Badge */}
        {summary.ticketType && (
          <>
            <Typography component="span" sx={{ color: "rgba(0,0,0,0.3)", mx: 0.25 }}>
              •
            </Typography>
            {(() => {
              const typeColors = getTicketTypeChipColors(summary.ticketType);
              return (
                <Chip
                  label={summary.ticketType}
                  size="small"
                  sx={{
                    height: 22,
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 600,
                    bgcolor: typeColors.bg,
                    color: typeColors.color,
                  }}
                />
              );
            })()}
          </>
        )}

        {/* Order ID */}
        {summary.orderId && (
          <>
            <Typography component="span" sx={{ color: "rgba(0,0,0,0.3)", mx: 0.25 }}>
              •
            </Typography>
            <Box
              component="button"
              type="button"
              onClick={() => handleCopy(summary.orderId!)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                fontFamily: "monospace",
                fontSize: 11,
                fontWeight: 600,
                color: "#0369A1",
                bgcolor: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                "&:hover": { color: "#025aa2" },
              }}
            >
              Order: {summary.orderId}
            </Box>
          </>
        )}
      </Box>

      {/* Row 3: subject/reason + amount */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ flex: 1, minWidth: 200 }}>
          {summary.reason && (
            <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
              <Typography component="span" sx={{ fontWeight: 600, color: "#171717" }}>
                Reason:{" "}
              </Typography>
              {summary.reason}
            </Typography>
          )}
        </Box>
        {summary.refundAmount !== null && summary.refundAmount !== undefined && (
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontSize: 13, color: "#8A8A8A", mb: 0.5 }}>Refund Amount</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#171717" }}>
              ${summary.refundAmount.toFixed(2)}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Expanded Detail Section */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          {detail ? (
            <>
              <OperationsTicketDetailExpanded
                detail={detail}
                isLoading={isLoadingDetail}
                isReceiving={isReceiving}
                isInspecting={isInspecting}
                onReceive={handleReceive}
                onAccept={handleAccept}
                onReject={() => setShowRejectDialog(true)}
              />
              <RejectReasonDialog
                open={showRejectDialog}
                onClose={() => setShowRejectDialog(false)}
                onSubmit={handleRejectWithReason}
                isLoading={isInspecting}
              />
            </>
          ) : (
            <Typography sx={{ fontSize: 12, color: "#6B6B6B" }}>Loading details...</Typography>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
