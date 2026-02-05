import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Grid,
} from "@mui/material";
import { ArrowBack, CheckCircle, Cancel } from "@mui/icons-material";
import { toast } from "react-toastify";
import { afterSalesApprovalService } from "../../../services/afterSalesApproval.mock";
import type {
  AfterSalesTicket,
  ApproveReturnPayload,
  RejectReturnPayload,
} from "../../../services/afterSales.types";
import ApproveDialog, { type ApproveFormData } from "./ApproveDialog";
import RejectDialog from "./RejectDialog";

interface AfterSalesDetailPageProps {
  ticketId: string;
  onBack: () => void;
}

export default function AfterSalesDetailPage({
  ticketId,
  onBack,
}: AfterSalesDetailPageProps) {
  const [ticket, setTicket] = useState<AfterSalesTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  useEffect(() => {
    loadTicket();
  }, []);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await afterSalesApprovalService.getAfterSalesTicketById(ticketId);
      if (data) {
        setTicket(data);
      } else {
        toast.error("Ticket not found");
        onBack();
      }
    } catch (err) {
      toast.error("Failed to load ticket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveConfirm = async (data: ApproveFormData) => {
    if (!ticket) return;

    try {
      setProcessing(true);
      const now = new Date().toISOString();
      const payload: ApproveReturnPayload = {
        ticketId: ticket.id,
        approvedAt: now,
        approvedBy: "user-manager-001",
        itemUpdates: data.items,
      };

      const result = await afterSalesApprovalService.approveReturn(payload, {
        id: "user-manager-001",
        displayName: "Sarah Manager",
        email: "sarah@example.com",
      });

      if (result.success && result.ticket) {
        setTicket(result.ticket);
        setApproveOpen(false);
        toast.success("Return approved successfully");
        setTimeout(() => onBack(), 1500);
      } else {
        toast.error(result.error || "Failed to approve return");
      }
    } catch (err) {
      toast.error("An error occurred");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!ticket) return;

    try {
      setProcessing(true);
      const now = new Date().toISOString();
      const payload: RejectReturnPayload = {
        ticketId: ticket.id,
        rejectionReason: reason,
        rejectedAt: now,
        rejectedBy: "user-manager-001",
      };

      const result = await afterSalesApprovalService.rejectReturn(payload, {
        id: "user-manager-001",
        displayName: "Sarah Manager",
        email: "sarah@example.com",
      });

      if (result.success && result.ticket) {
        setTicket(result.ticket);
        setRejectOpen(false);
        toast.success("Return rejected successfully");
        setTimeout(() => onBack(), 1500);
      } else {
        toast.error(result.error || "Failed to reject return");
      }
    } catch (err) {
      toast.error("An error occurred");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "#FAFAF8", py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "#FAFAF8", py: 4 }}>
        <Container maxWidth="lg">
          <Alert severity="error">Ticket not found</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#FAFAF8", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={onBack}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "rgba(15,23,42,0.75)",
            }}
          >
            Back
          </Button>
          <Typography
            sx={{
              fontSize: 28,
              fontWeight: 900,
              color: "rgba(15,23,42,0.92)",
              letterSpacing: -0.5,
            }}
          >
            Ticket #{ticket.id.substring(7, 13)}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column - Ticket Info */}
          <Grid item xs={12} md={8}>
            {/* Customer Info */}
            <Paper sx={{ p: 3, mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>
                CUSTOMER INFORMATION
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: 12, color: "rgba(15,23,42,0.60)" }}>
                    Name
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    {ticket.customer?.displayName}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: "rgba(15,23,42,0.60)" }}>
                    Email
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    {ticket.customer?.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: "rgba(15,23,42,0.60)" }}>
                    Order
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    #{ticket.orderId.substring(6, 12)}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: "rgba(15,23,42,0.60)" }}>
                    Submitted
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Return Reason */}
            <Paper sx={{ p: 3, mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>
                RETURN REASON
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 12, color: "rgba(15,23,42,0.60)", mb: 0.5 }}>
                  Reason
                </Typography>
                <Typography sx={{ fontSize: 14 }}>{ticket.reason}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: "rgba(15,23,42,0.60)", mb: 0.5 }}>
                  Requested Action
                </Typography>
                <Typography sx={{ fontSize: 14 }}>{ticket.requestedAction}</Typography>
              </Box>
            </Paper>

            {/* Returned Items */}
            <Paper sx={{ p: 3, mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>
                RETURNED ITEMS
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#FAFAF8" }}>
                      <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Product</TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 600 }} align="right">
                        Qty
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Condition</TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 600 }} align="center">
                        Restock
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ticket.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell sx={{ fontSize: 13 }}>
                          {item.orderItem?.product?.productName}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13 }} align="right">
                          {item.returnedQuantity}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13 }}>
                          {item.condition}
                          {item.notes && (
                            <Typography sx={{ fontSize: 11, color: "rgba(15,23,42,0.60)" }}>
                              {item.notes}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {item.canRestock ? (
                            <Typography sx={{ fontSize: 13, color: "green", fontWeight: 600 }}>
                              ✓ Yes
                            </Typography>
                          ) : (
                            <Chip
                              label="Cannot Restock"
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Right Column - Decision Panel */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", position: "sticky", top: 20 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>
                MANAGER DECISION
              </Typography>

              {/* Refund Info */}
              <Box sx={{ p: 2, backgroundColor: "rgba(46,204,113,0.10)", borderRadius: 1, mb: 2 }}>
                <Typography sx={{ fontSize: 12, color: "rgba(15,23,42,0.60)" }}>
                  Refund Amount
                </Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#2ecc71" }}>
                  ${ticket.refundAmount?.toFixed(2)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Action Buttons */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CheckCircle />}
                  onClick={() => setApproveOpen(true)}
                  disabled={processing}
                  sx={{
                    backgroundColor: "#2ecc71",
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.2,
                  }}
                >
                  {processing ? "Processing..." : "Approve & Refund"}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => setRejectOpen(true)}
                  disabled={processing}
                  sx={{
                    borderColor: "#e74c3c",
                    color: "#e74c3c",
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.2,
                    "&:hover": {
                      borderColor: "#c0392b",
                      backgroundColor: "rgba(231,76,60,0.05)",
                    },
                  }}
                >
                  Reject
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Legend */}
              <Box sx={{ backgroundColor: "#FAFAF8", p: 2, borderRadius: 1 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, mb: 1 }}>
                  ℹ️ LEGEND
                </Typography>
                <Typography sx={{ fontSize: 11, color: "rgba(15,23,42,0.60)" }}>
                  • <strong>Restock Yes</strong>: Item can be returned to inventory
                </Typography>
                <Typography sx={{ fontSize: 11, color: "rgba(15,23,42,0.60)", mt: 0.5 }}>
                  • <strong>Cannot Restock</strong>: Prescription/customized items
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Dialogs */}
        <ApproveDialog
          open={approveOpen}
          ticket={ticket}
          onConfirm={handleApproveConfirm}
          onCancel={() => setApproveOpen(false)}
          isLoading={processing}
        />
        <RejectDialog
          open={rejectOpen}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectOpen(false)}
          isLoading={processing}
        />
      </Container>
    </Box>
  );
}
