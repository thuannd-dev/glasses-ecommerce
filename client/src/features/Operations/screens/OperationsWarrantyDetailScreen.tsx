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
import { useStaffAfterSalesTicketDetail } from "../../../lib/hooks/useStaffAfterSalesTickets";
import { useReceiveWarrantyTicket, useSetTicketDestination } from "../../../lib/hooks/useOperationsAfterSales";
import {
  AfterSalesTicketStatusValues,
  TicketResolutionTypeValues,
  type AfterSalesTicketStatus,
} from "../../../lib/types/afterSales";

const STATUS_LABELS: Record<AfterSalesTicketStatus, string> = {
  [AfterSalesTicketStatusValues.Pending]: "Pending",
  [AfterSalesTicketStatusValues.InProgress]: "In Progress",
  [AfterSalesTicketStatusValues.Resolved]: "Resolved",
  [AfterSalesTicketStatusValues.Rejected]: "Rejected",
  [AfterSalesTicketStatusValues.Closed]: "Closed",
  [AfterSalesTicketStatusValues.Cancelled]: "Cancelled",
};

const STATUS_COLORS: Record<AfterSalesTicketStatus, string> = {
  [AfterSalesTicketStatusValues.Pending]: "#fbbf24",
  [AfterSalesTicketStatusValues.InProgress]: "#3b82f6",
  [AfterSalesTicketStatusValues.Resolved]: "#10b981",
  [AfterSalesTicketStatusValues.Rejected]: "#ef4444",
  [AfterSalesTicketStatusValues.Closed]: "#6b7280",
  [AfterSalesTicketStatusValues.Cancelled]: "#9ca3af",
};

export function OperationsWarrantyDetailScreen() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const backUrl = `/operations/warranty?${searchParams.toString()}`;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [chosenDestination, setChosenDestination] = useState<"Repair" | "Reject" | null>(null);
  const [error, setError] = useState("");

  const { data: ticket, isLoading } = useStaffAfterSalesTicketDetail(
    ticketId || ""
  );
  const { mutate: receiveTicket, isPending: isReceiving } = useReceiveWarrantyTicket();
  const { mutate: setDestinationMutation, isPending: isSettingDestination } = useSetTicketDestination();

  const handleOpenDialog = () => {
    setChosenDestination(null);
    setError("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleChoose = (choice: "Repair" | "Reject") => {
    setChosenDestination(choice);
  };

  const handleConfirmChoice = async () => {
    if (!ticketId || !chosenDestination) return;

    // First receive the ticket
    receiveTicket(
      { ticketId },
      {
        onSuccess: () => {
          // Then set the destination
          setDestinationMutation(
            {
              ticketId,
              destination: chosenDestination,
              notes: undefined,
            },
            {
              onSuccess: () => {
                navigate(backUrl);
              },
              onError: (err: Error | unknown) => {
                setError(err instanceof Error ? err.message : "Failed to set destination");
              },
            }
          );
        },
        onError: (err: Error | unknown) => {
          setError(err instanceof Error ? err.message : "Failed to receive ticket");
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

  const isPending = ticket.ticketStatus === AfterSalesTicketStatusValues.InProgress && !ticket.receivedAt;

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
              Warranty Details
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
          {isPending && (
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
              disabled={isReceiving || isSettingDestination}
            >
              {isReceiving || isSettingDestination ? "Processing..." : "Received"}
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
              Warranty
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
          {ticket.resolutionType && (
            <Box>
              <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
                Resolution Type
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {ticket.resolutionType === TicketResolutionTypeValues.WarrantyRepair
                  ? "Warranty Repair"
                  : "Unknown"}
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

        {/* Customer Information Section */}
        {(ticket.customerName || ticket.customerPhone || ticket.shippingAddress) && (
          <Box
            sx={{
              pt: 2,
              borderTop: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 1 }}>
              Customer Information
            </Typography>
            <Box
              sx={{
                bgcolor: "rgba(0,0,0,0.02)",
                borderRadius: 2,
                p: 2,
                border: "1px solid rgba(0,0,0,0.06)",
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              {ticket.customerName && (
                <Box>
                  <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                    Customer Name
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                    {ticket.customerName}
                  </Typography>
                </Box>
              )}
              {ticket.customerPhone && (
                <Box>
                  <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                    Phone
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                    {ticket.customerPhone}
                  </Typography>
                </Box>
              )}
              {ticket.shippingAddress && (
                <Box sx={{ gridColumn: { xs: "1fr", md: "1 / -1" } }}>
                  <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                    Delivery Address
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: 13, lineHeight: 1.5 }}>
                    {ticket.shippingAddress.venue && `${ticket.shippingAddress.venue}, `}
                    {ticket.shippingAddress.ward && `${ticket.shippingAddress.ward}, `}
                    {ticket.shippingAddress.district && `${ticket.shippingAddress.district}, `}
                    {ticket.shippingAddress.city}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Prescription Information Section */}
        {ticket.orderPrescription && (
          <Box
            sx={{
              pt: 2,
              borderTop: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 1 }}>
              Prescription Information
            </Typography>
            <Box
              sx={{
                bgcolor: "rgba(99, 182, 255, 0.05)",
                borderRadius: 2,
                p: 2,
                border: "1px solid rgba(99, 182, 255, 0.2)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 13 }}>👁️ Prescription Details</Typography>
                {ticket.orderPrescription.isVerified && (
                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: "#d1fae5",
                      border: "1px solid #6ee7b7",
                    }}
                  >
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#059669" }}>
                      VERIFIED
                    </Typography>
                  </Box>
                )}
              </Box>

              {ticket.orderPrescription.details && ticket.orderPrescription.details.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {ticket.orderPrescription.details.map((detail, idx) => (
                    <Box
                      key={`${detail.eye || 'both'}-${idx}`}
                      sx={{
                        p: 1.5,
                        bgcolor: "white",
                        borderRadius: 1,
                        border: "1px solid rgba(99, 182, 255, 0.1)",
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: 12, mb: 1 }}>
                        {detail.eye || "Both Eyes"}
                      </Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: 1 }}>
                        {detail.sph !== null && detail.sph !== undefined && (
                          <Box>
                            <Typography sx={{ fontSize: 10, color: "text.secondary" }}>SPH</Typography>
                            <Typography sx={{ fontWeight: 600, fontSize: 12 }}>{detail.sph}</Typography>
                          </Box>
                        )}
                        {detail.cyl !== null && detail.cyl !== undefined && (
                          <Box>
                            <Typography sx={{ fontSize: 10, color: "text.secondary" }}>CYL</Typography>
                            <Typography sx={{ fontWeight: 600, fontSize: 12 }}>{detail.cyl}</Typography>
                          </Box>
                        )}
                        {detail.axis !== null && detail.axis !== undefined && (
                          <Box>
                            <Typography sx={{ fontSize: 10, color: "text.secondary" }}>AXIS</Typography>
                            <Typography sx={{ fontWeight: 600, fontSize: 12 }}>{detail.axis}</Typography>
                          </Box>
                        )}
                        {detail.pd !== null && detail.pd !== undefined && (
                          <Box>
                            <Typography sx={{ fontSize: 10, color: "text.secondary" }}>PD</Typography>
                            <Typography sx={{ fontWeight: 600, fontSize: 12 }}>{detail.pd}</Typography>
                          </Box>
                        )}
                        {detail.add !== null && detail.add !== undefined && (
                          <Box>
                            <Typography sx={{ fontSize: 10, color: "text.secondary" }}>ADD</Typography>
                            <Typography sx={{ fontWeight: 600, fontSize: 12 }}>{detail.add}</Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ fontSize: 12, color: "text.secondary", fontStyle: "italic" }}>
                  No prescription details available
                </Typography>
              )}

              {ticket.orderPrescription.verificationNotes && (
                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid rgba(99, 182, 255, 0.1)" }}>
                  <Typography sx={{ fontSize: 10, color: "text.secondary" }}>Verification Notes</Typography>
                  <Typography sx={{ fontSize: 12, mt: 0.5 }}>{ticket.orderPrescription.verificationNotes}</Typography>
                </Box>
              )}
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
              Please choose the action for this warranty ticket:
            </Typography>

            {!chosenDestination ? (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleChoose("Repair")}
                  sx={{
                    bgcolor: "#3b82f6",
                    "&:hover": { bgcolor: "#1d4ed8" },
                  }}
                >
                  Repair
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
                  You have chosen: <strong>{chosenDestination}</strong>
                </Alert>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setChosenDestination(null)}
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
            disabled={isReceiving || isSettingDestination}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmChoice}
            disabled={!chosenDestination || isReceiving || isSettingDestination}
            sx={{ bgcolor: chosenDestination === "Repair" ? "#3b82f6" : "#ef4444" }}
          >
            {isReceiving || isSettingDestination ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
