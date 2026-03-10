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
  [AfterSalesTicketStatusValues.Replacing]: "Replacing",
  [AfterSalesTicketStatusValues.Resolved]: "Resolved",
  [AfterSalesTicketStatusValues.Rejected]: "Rejected",
  [AfterSalesTicketStatusValues.Closed]: "Closed",
  [AfterSalesTicketStatusValues.Cancelled]: "Cancelled",
};

// Helper function: For InProgress tickets, show "Approved" if they've been received
function getDisplayLabel(status: AfterSalesTicketStatus, receivedAt: string | null): string {
  if (status === AfterSalesTicketStatusValues.InProgress && receivedAt) {
    return "Approved";
  }
  return STATUS_LABELS[status];
}

const STATUS_COLORS: Record<AfterSalesTicketStatus, string> = {
  [AfterSalesTicketStatusValues.Pending]: "#fbbf24",
  [AfterSalesTicketStatusValues.InProgress]: "#3b82f6",
  [AfterSalesTicketStatusValues.Replacing]: "#8b5cf6",
  [AfterSalesTicketStatusValues.Resolved]: "#10b981",
  [AfterSalesTicketStatusValues.Rejected]: "#ef4444",
  [AfterSalesTicketStatusValues.Closed]: "#6b7280",
  [AfterSalesTicketStatusValues.Cancelled]: "#9ca3af",
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
                  // Show the resolved status for a moment before navigating back
                  setTimeout(() => {
                    navigate(backUrl);
                  }, 1000);
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
              label={getDisplayLabel(ticket.ticketStatus, ticket.receivedAt)}
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

        {/* Product Details Section */}
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

        {/* Attachments Section */}
        <Box
          sx={{
            pt: 2,
            borderTop: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 1.5 }}>
            Attachments
          </Typography>
          {ticket.attachments && ticket.attachments.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {ticket.attachments.map((attachment) => (
                <Box
                  key={attachment.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.5,
                    bgcolor: "rgba(59, 130, 246, 0.05)",
                    borderRadius: 1.5,
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                  }}
                >
                  <Box
                    sx={{
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    {attachment.fileExtension?.toLowerCase() === 'pdf' ? '📄' : '🖼️'}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "rgb(59, 130, 246)",
                        wordBreak: "break-word",
                        textDecoration: "none",
                      }}
                      component="a"
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {attachment.fileName}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.25 }}>
                      Uploaded · {new Date(attachment.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                p: 2,
                bgcolor: "rgba(0,0,0,0.02)",
                borderRadius: 1.5,
                border: "1px solid rgba(0,0,0,0.06)",
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                No attachment included
              </Typography>
            </Box>
          )}
        </Box>
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
