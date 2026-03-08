import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useOperationsTicketDetail } from "../../../lib/hooks/useStaffAfterSalesTickets";
import { useReceiveReturnRefundTicket, useInspectReturnRefund } from "../../../lib/hooks/useOperationsAfterSales";
import {
  AfterSalesTicketStatusValues,
  type AfterSalesTicketStatus,
} from "../../../lib/types/afterSales";

const STATUS_LABELS: Record<AfterSalesTicketStatus, string> = {
  [AfterSalesTicketStatusValues.Pending]: "Pending",
  [AfterSalesTicketStatusValues.InProgress]: "In Progress",
  [AfterSalesTicketStatusValues.Resolved]: "Resolved",
  [AfterSalesTicketStatusValues.Rejected]: "Rejected",
  [AfterSalesTicketStatusValues.Closed]: "Closed",
};

const STATUS_COLORS: Record<AfterSalesTicketStatus, string> = {
  [AfterSalesTicketStatusValues.Pending]: "#fbbf24",
  [AfterSalesTicketStatusValues.InProgress]: "#3b82f6",
  [AfterSalesTicketStatusValues.Resolved]: "#10b981",
  [AfterSalesTicketStatusValues.Rejected]: "#ef4444",
  [AfterSalesTicketStatusValues.Closed]: "#6b7280",
};

export function ReturnRefundDetailScreen() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const backUrl = `/operations/return-refund?${searchParams.toString()}`;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [chosenAction, setChosenAction] = useState<"Approve" | "Reject" | null>(null);
  const [error, setError] = useState("");

  const { data: ticket, isLoading } = useOperationsTicketDetail(ticketId || "");
  const { mutate: receiveTicket, isPending: isReceiving } = useReceiveReturnRefundTicket();
  const { mutate: inspectTicketMutation, isPending: isInspecting } = useInspectReturnRefund();

  const handleOpenDialog = () => {
    setChosenAction(null);
    setError("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleChoose = (action: "Approve" | "Reject") => {
    setChosenAction(action);
  };

  const handleConfirmChoice = async () => {
    if (!ticketId || !chosenAction) return;

    // First receive the ticket
    receiveTicket(
      { ticketId },
      {
        onSuccess: (_data) => {
          // Wait a moment for database to commit before inspecting
          setTimeout(() => {
            inspectTicketMutation(
              {
                ticketId,
                isAccepted: chosenAction === "Approve",
                notes: undefined,
              },
              {
                onSuccess: () => {
                  navigate(backUrl);
                },
                onError: (err: Error | unknown) => {
                  const errorMsg = err instanceof Error 
                    ? err.message 
                    : typeof err === 'object' && err !== null && 'message' in err
                      ? (err as any).message
                      : "Failed to inspect ticket";
                  setError(errorMsg);
                },
              }
            );
          }, 500); // Wait 500ms for ensure data is persisted
        },
        onError: (err: Error | unknown) => {
          const errorMsg = err instanceof Error 
            ? err.message 
            : typeof err === 'object' && err !== null && 'message' in err
              ? (err as any).message
              : "Failed to receive ticket";
          setError(errorMsg);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          px: { xs: 2, md: 4, lg: 6 },
          py: 4,
          display: "flex",
          alignItems: "center",
        }}
      >
        <LinearProgress sx={{ width: "100%", borderRadius: 1 }} />
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box
        sx={{
          px: { xs: 2, md: 4, lg: 6 },
          py: 4,
        }}
      >
        <Alert severity="error">Ticket not found</Alert>
        <Button
          onClick={() => navigate(backUrl)}
          sx={{ mt: 2 }}
        >
          Back
        </Button>
      </Box>
    );
  }

  const canReceive = 
    ticket.ticketStatus === AfterSalesTicketStatusValues.InProgress && 
    !ticket.receivedAt;

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4, lg: 6 },
        py: 4,
        maxWidth: 800,
        mx: "auto",
      }}
    >
      <Button
        onClick={() => navigate(backUrl)}
        sx={{
          mb: 2,
          textTransform: "none",
          color: "text.secondary",
        }}
      >
        ← Back
      </Button>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          px: 3,
          py: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
              Return/Refund Details
            </Typography>
            <Chip
              label={STATUS_LABELS[ticket.ticketStatus]}
              size="small"
              sx={{
                fontWeight: 700,
                textTransform: "capitalize",
                border: `1px solid ${STATUS_COLORS[ticket.ticketStatus]}`,
                bgcolor: `${STATUS_COLORS[ticket.ticketStatus]}22`,
                color: STATUS_COLORS[ticket.ticketStatus],
              }}
            />
            {ticket.receivedAt && (
              <Chip
                label="Received"
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: "#10b98122",
                  color: "#065f46",
                  border: "1px solid #10b981",
                  flexShrink: 0,
                }}
              />
            )}
          </Box>
          {canReceive && (
            <Button
              variant="contained"
              size="small"
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                bgcolor: "#3b82f6",
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
              onClick={handleOpenDialog}
              disabled={isReceiving || isInspecting}
            >
              {isReceiving || isInspecting ? "Processing..." : "Received"}
            </Button>
          )}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
            pt: 2,
            borderTop: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
              Ticket ID
            </Typography>
            <Typography sx={{ fontWeight: 700, wordBreak: "break-all" }}>
              {ticket.id}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
              Type
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>
              Return/Refund
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
              Reason
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>{ticket.reason}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
              Order ID
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>
              {ticket.orderId.substring(0, 12)}...
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
              Created At
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>
              {new Date(ticket.createdAt).toLocaleString()}
            </Typography>
          </Box>
          {ticket.receivedAt && (
            <Box>
              <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
                Received At
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {new Date(ticket.receivedAt).toLocaleString()}
              </Typography>
            </Box>
          )}
          {ticket.resolvedAt && (
            <Box>
              <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
                Resolved At
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {new Date(ticket.resolvedAt).toLocaleString()}
              </Typography>
            </Box>
          )}
        </Box>

        {ticket.staffNotes && (
          <Box
            sx={{
              pt: 2,
              borderTop: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.75 }}>
              Notes
            </Typography>
            <Typography sx={{ fontWeight: 500, color: "text.secondary" }}>
              {ticket.staffNotes}
            </Typography>
          </Box>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Ticket as Received</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography sx={{ mb: 2 }}>
              Please choose to approve or reject this return/refund:
            </Typography>

            {!chosenAction ? (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleChoose("Approve")}
                  sx={{
                    bgcolor: "#10b981",
                    "&:hover": { bgcolor: "#059669" },
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleChoose("Reject")}
                  sx={{
                    bgcolor: "#ef4444",
                    "&:hover": { bgcolor: "#dc2626" },
                  }}
                >
                  Reject
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Alert severity="info">
                  You have chosen: <strong>{chosenAction}</strong>
                </Alert>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setChosenAction(null)}
                  >
                    Change
                  </Button>
                </Box>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            disabled={isReceiving || isInspecting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmChoice}
            disabled={!chosenAction || isReceiving || isInspecting}
            sx={{ bgcolor: chosenAction === "Approve" ? "#10b981" : "#ef4444" }}
          >
            {isReceiving || isInspecting ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
