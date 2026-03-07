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
  TextField,
  Alert,
} from "@mui/material";
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import { useStaffAfterSalesTicketDetail, useUpdateTicketStatus } from "../../../lib/hooks/useStaffAfterSalesTickets";
import {
  AfterSalesTicketStatusValues,
  AfterSalesTicketTypeValues,
  type AfterSalesTicketStatus,
  type AfterSalesTicketType,
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

function getTypeLabel(type: AfterSalesTicketType): string {
  if (type === AfterSalesTicketTypeValues.Return) {
    return "Return";
  }
  if (type === AfterSalesTicketTypeValues.Warranty) {
    return "Warranty";
  }
  return "Refund";
}

export function TicketDetailScreen() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Extract navPrefix from URL path (return-refund or warranty)
  const navPrefix = location.pathname.includes("return-refund") ? "return-refund" : "warranty";
  const backUrl = `/sales/${navPrefix}?${searchParams.toString()}`;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"confirm" | "reject">("confirm");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const { data: ticket, isLoading } = useStaffAfterSalesTicketDetail(
    ticketId || ""
  );
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateTicketStatus();

  const handleOpenDialog = (type: "confirm" | "reject") => {
    setActionType(type);
    setNotes("");
    setError("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    if (!ticketId) return;

    updateStatus(
      {
        ticketId,
        actionType: actionType === "confirm" ? "approve" : "reject",
        reason: notes || undefined,
      },
      {
        onSuccess: () => {
          navigate(`/sales/${navPrefix}`);
        },
        onError: (err: Error | unknown) => {
          setError(err instanceof Error ? err.message : "Failed to update ticket");
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

  const canTakeAction =
    ticket.ticketStatus === AfterSalesTicketStatusValues.Pending ||
    ticket.ticketStatus === AfterSalesTicketStatusValues.InProgress;

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
              Ticket Details
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
          </Box>
          {canTakeAction && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  bgcolor: "#10b981",
                  "&:hover": { bgcolor: "#059669" },
                }}
                onClick={() => handleOpenDialog("confirm")}
              >
                Confirm
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  borderColor: "#ef4444",
                  color: "#ef4444",
                  "&:hover": { bgcolor: "rgba(239, 68, 68, 0.04)" },
                }}
                onClick={() => handleOpenDialog("reject")}
              >
                Reject
              </Button>
            </Box>
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
              {getTypeLabel(ticket.ticketType)}
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

        {ticket.requestedAction && (
          <Box
            sx={{
              pt: 2,
              borderTop: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.75 }}>
              Requested Action
            </Typography>
            <Typography sx={{ lineHeight: 1.6 }}>
              {ticket.requestedAction}
            </Typography>
          </Box>
        )}

        {ticket.orderItem && (
          <Box
            sx={{
              pt: 2,
              borderTop: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 1 }}>
              Product Details
            </Typography>
            <Box
              sx={{
                bgcolor: "rgba(0,0,0,0.02)",
                borderRadius: 2,
                p: 2,
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "flex-start" }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 1.5,
                    bgcolor: "rgba(0,0,0,0.05)",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {ticket.orderItem.productImageUrl ? (
                    <Box
                      component="img"
                      src={ticket.orderItem.productImageUrl}
                      alt=""
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "text.secondary",
                        fontSize: 12,
                      }}
                    >
                      —
                    </Box>
                  )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.5, color: "#1f2937" }}>
                    {ticket.orderItem.productName || "Unknown Product"}
                  </Typography>
                  {ticket.orderItem.variantName && (
                    <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
                      {ticket.orderItem.variantName}
                    </Typography>
                  )}
                  <Box sx={{ display: "flex", gap: 2, fontSize: 12 }}>
                    <Box>
                      <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                        Qty
                      </Typography>
                      <Typography sx={{ fontWeight: 600, color: "rgba(0,0,0,0.7)" }}>
                        {ticket.orderItem.quantity}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                        Unit Price
                      </Typography>
                      <Typography sx={{ fontWeight: 600, color: "#059669" }}>
                        ${ticket.orderItem.unitPrice.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.5,
                  borderTop: "1px solid rgba(0,0,0,0.08)",
                  pt: 1.5,
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
                    SKU
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#1f2937", wordBreak: "break-word" }}>
                    {ticket.orderItem.sku || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
                    Total Price
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: "rgba(0,0,0,0.7)" }}>
                    ${ticket.orderItem.totalPrice.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {!ticket.orderItem && (
          <Box
            sx={{
              pt: 2,
              borderTop: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Box
              sx={{
                bgcolor: "rgba(59, 130, 246, 0.05)",
                borderRadius: 2,
                p: 2,
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              <Typography sx={{ fontSize: 13, color: "rgb(59, 130, 246)", fontStyle: "italic" }}>
                📦 This ticket is not linked to a specific product. It applies to the entire order.
              </Typography>
            </Box>
          </Box>
        )}

        {ticket.staffNotes && (
          <Box
            sx={{
              pt: 2,
              borderTop: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.75 }}>
              Staff Notes
            </Typography>
            <Typography sx={{ lineHeight: 1.6 }}>
              {ticket.staffNotes}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            pt: 2,
            borderTop: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Typography sx={{ fontWeight: 700, mb: 1.5, fontSize: 13 }}>
            Status History
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                Pending
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Ticket created · {new Date(ticket.createdAt).toLocaleString()}
              </Typography>
            </Box>

            {ticket.ticketStatus !== AfterSalesTicketStatusValues.Pending && (
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                  {STATUS_LABELS[ticket.ticketStatus]}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  {ticket.resolvedAt
                    ? new Date(ticket.resolvedAt).toLocaleString()
                    : "—"}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === "confirm" ? "Resolve Ticket" : "Reject Ticket"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Notes (optional)"
              multiline
              minRows={4}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isUpdating}
            sx={{
              bgcolor: actionType === "confirm" ? "#10b981" : "#ef4444",
              "&:hover": {
                bgcolor:
                  actionType === "confirm" ? "#059669" : "#dc2626",
              },
            }}
          >
            {isUpdating ? "Updating..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
