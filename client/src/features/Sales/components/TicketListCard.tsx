import { useState } from "react";
import { Box, Chip, Collapse, IconButton, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton, TextField } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  useStaffAfterSalesTicket,
  useApproveStaffAfterSalesTicket,
  useRejectStaffAfterSalesTicket,
} from "../../../lib/hooks/useAfterSalesTickets";
import type { AfterSalesTicketDto, TicketDetailDto } from "../../../lib/types/afterSales";
import { TicketDetailExpanded } from "./TicketDetailExpanded";

export interface TicketListCardProps {
  readonly summary: AfterSalesTicketDto;
}

function getStatusChipColors(status: string) {
  const s = (status || "").toString();
  switch (s) {
    case "Pending":
      return {
        label: "Pending",
        border: "#EAEAEA",
        bg: "#F6F6F6",
        color: "#4B4B4B",
      };
    case "InProgress":
      return {
        label: "In Progress",
        border: "rgba(249,115,22,0.4)",
        bg: "rgba(249,115,22,0.12)",
        color: "#c2410c",
      };
    case "Resolved":
      return {
        label: "Resolved",
        border: "#D4E5D5",
        bg: "#EEF5EE",
        color: "#466A4A",
      };
    case "Rejected":
      return {
        label: "Rejected",
        border: "#E8CFCF",
        bg: "#F6EAEA",
        color: "#8E3B3B",
      };
    case "Closed":
      return {
        label: "Closed",
        border: "#E8CFCF",
        bg: "#F6EAEA",
        color: "#8E3B3B",
      };
    default:
      return {
        label: s || "—",
        border: "#EAEAEA",
        bg: "#F6F6F6",
        color: "#4B4B4B",
      };
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

function getOrderTypeChipColors(orderType: string) {
  const t = (orderType || "").toLowerCase();
  if (t === "prescription") return { bg: "#EEF2FF", color: "#3730A3" };
  return { bg: "#ECFEFF", color: "#0369A1" };
}

export function TicketListCard({ summary }: TicketListCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approveData, setApproveData] = useState({
    resolutionType: "RefundOnly",
    staffNotes: "",
    refundAmount: "",
  });
  const [rejectReason, setRejectReason] = useState("");
  
  const { data, isLoading } = useStaffAfterSalesTicket(expanded ? summary.id : undefined);
  const detail = data as TicketDetailDto | undefined;

  const approveMutation = useApproveStaffAfterSalesTicket();
  const rejectMutation = useRejectStaffAfterSalesTicket();

  const status = (summary.status ?? summary.ticketStatus ?? "").toString();
  const { border, bg, color, label } = getStatusChipColors(status);
  const createdAt = summary.createdAt ? new Date(summary.createdAt) : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(summary.id);
  };

  const getAutoResolutionType = (ticketType: string | undefined): string => {
    const type = (ticketType ?? "").toLowerCase();
    if (type === "return") return "ReturnAndRefund";
    if (type === "refund") return "RefundOnly";
    if (type === "warranty") return "WarrantyReplace";
    return "RefundOnly"; // fallback
  };

  const handleApproveClick = () => {
    const autoResolutionType = getAutoResolutionType(summary.ticketType);
    setApproveData({
      resolutionType: autoResolutionType,
      staffNotes: "",
      refundAmount: "",
    });
    setShowApproveDialog(true);
  };

  const handleApproveSubmit = () => {
    const refundAmount = approveData.refundAmount ? Number.parseFloat(approveData.refundAmount) : undefined;
    approveMutation.mutate(
      {
        ticketId: summary.id,
        resolutionType: approveData.resolutionType,
        staffNotes: approveData.staffNotes || undefined,
        refundAmount,
      },
      {
        onSuccess: () => {
          setShowApproveDialog(false);
          setApproveData({ resolutionType: "RefundOnly", staffNotes: "", refundAmount: "" });
        },
      }
    );
  };

  const handleRejectClick = () => {
    setShowRejectDialog(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) return;
    rejectMutation.mutate(
      { ticketId: summary.id, reason: rejectReason },
      {
        onSuccess: () => {
          setShowRejectDialog(false);
          setRejectReason("");
        },
      }
    );
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
            onClick={handleCopy}
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
        
        {/* Order Type Badge */}
        {summary.orderType && (
          <>
            <Typography component="span" sx={{ color: "rgba(0,0,0,0.3)", mx: 0.25 }}>
              •
            </Typography>
            {(() => {
              const typeColors = getOrderTypeChipColors(summary.orderType);
              return (
                <Chip
                  label={summary.orderType}
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
        <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {isLoading || !detail ? (
            <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>Loading detail...</Typography>
          ) : (
            <TicketDetailExpanded
              detail={detail}
              onApprove={handleApproveClick}
              onReject={handleRejectClick}
              isLoading={approveMutation.isPending || rejectMutation.isPending}
            />
          )}
        </Box>
      </Collapse>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onClose={() => setShowApproveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Ticket</DialogTitle>
        <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Resolution Type Display (Auto-determined) */}
          <Box>
            <Typography sx={{ fontSize: 12, color: "#6B6B6B", fontWeight: 600, mb: 0.5 }}>
              Resolution Type
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500, p: 1.5, bgcolor: "#F5F5F5", borderRadius: 1 }}>
              {approveData.resolutionType === "RefundOnly" && "Refund Only"}
              {approveData.resolutionType === "ReturnAndRefund" && "Return & Refund"}
              {approveData.resolutionType === "WarrantyRepair" && "Warranty Repair"}
              {approveData.resolutionType === "WarrantyReplace" && "Warranty Replace"}
            </Typography>
          </Box>

          {/* Refund Amount - Only for RefundOnly */}
          {approveData.resolutionType === "RefundOnly" && (
            <TextField
              label="Refund Amount"
              type="number"
              slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
              value={approveData.refundAmount}
              onChange={(e) => setApproveData({ ...approveData, refundAmount: e.target.value })}
              fullWidth
              required
            />
          )}

          {/* Staff Notes - Always Optional */}
          <TextField
            label="Staff Notes (Optional)"
            multiline
            rows={3}
            value={approveData.staffNotes}
            onChange={(e) => setApproveData({ ...approveData, staffNotes: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setShowApproveDialog(false)}>Cancel</MuiButton>
          <MuiButton
            onClick={handleApproveSubmit}
            variant="contained"
            disabled={
              approveMutation.isPending ||
              (approveData.resolutionType === "RefundOnly" && !approveData.refundAmount)
            }
          >
            Confirm
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Reject Ticket</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Rejection Reason"
            multiline
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            fullWidth
            placeholder="Explain why you're rejecting this ticket..."
          />
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setShowRejectDialog(false)}>Cancel</MuiButton>
          <MuiButton
            onClick={handleRejectSubmit}
            variant="contained"
            color="error"
            disabled={rejectMutation.isPending || !rejectReason.trim()}
          >
            Reject
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
