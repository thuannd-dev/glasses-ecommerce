import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Card,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Stack,
  Divider,
  Alert,
  Chip,
} from "@mui/material";
import { useGetTicketDetail, useUpdateTicketStatus } from "../../../../lib/ticketApi";

interface TicketDetailDialogProps {
  readonly ticketId: string;
  readonly open: boolean;
  readonly onClose: () => void;
}

export default function TicketDetailDialog({
  ticketId,
  open,
  onClose,
}: Readonly<TicketDetailDialogProps>) {
  const [newStatus, setNewStatus] = useState<string>("");
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const { data: ticketDetail, isLoading } = useGetTicketDetail(ticketId);
  const updateStatusMutation = useUpdateTicketStatus();

  React.useEffect(() => {
    if (ticketDetail && open) {
      setNewStatus(ticketDetail.ticketStatus);
      setRefundAmount(ticketDetail.refundAmount?.toString() || "");
      setNotes("");
    }
  }, [ticketDetail, open]);

  const handleUpdateStatus = async () => {
    await updateStatusMutation.mutateAsync({
      ticketId,
      data: {
        newStatus,
        notes,
        refundAmount: refundAmount ? Number.parseFloat(refundAmount) : undefined,
      },
    });
    onClose();
  };

  const getTypeColor = (type: string): any => {
    const typeMap: Record<string, any> = {
      Return: "warning",
      Warranty: "info",
      Refund: "error",
    };
    return typeMap[type] || "default";
  };

  const getStatusColor = (status: string): any => {
    const statusMap: Record<string, any> = {
      Pending: "warning",
      InProgress: "info",
      Resolved: "success",
      Rejected: "error",
      Closed: "default",
    };
    return statusMap[status] || "default";
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Ticket Details</DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {!isLoading && !ticketDetail && (
          <Typography>Ticket not found</Typography>
        )}
        {!isLoading && ticketDetail && (
          <Box sx={{ mt: 2 }}>
            {/* Header Info */}
            <Card sx={{ p: 2, mb: 2, bgcolor: "#f9f9f9" }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Ticket Number
                  </Typography>
                  <Typography variant="h6">{ticketDetail.ticketNumber}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Order Number
                  </Typography>
                  <Typography variant="h6">{ticketDetail.orderNumber}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Ticket Type
                  </Typography>
                  <Chip
                    label={ticketDetail.ticketType}
                    color={getTypeColor(ticketDetail.ticketType)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={ticketDetail.ticketStatus}
                    color={getStatusColor(ticketDetail.ticketStatus)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>
            </Card>

            {/* Policy Violation Alert */}
            {ticketDetail.policyViolation && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <strong>⚠️ Policy Violation Detected:</strong>
                <br />
                {ticketDetail.policyViolation}
                <br />
                This ticket will be automatically REJECTED due to policy constraints.
              </Alert>
            )}

            {/* Customer Info */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Customer Information
            </Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              <TextField
                label="Customer Name"
                fullWidth
                value={ticketDetail.customerName}
                disabled
                size="small"
              />
              <TextField
                label="Customer Email"
                fullWidth
                value={ticketDetail.customerEmail}
                disabled
                size="small"
              />
              <TextField
                label="Customer Phone"
                fullWidth
                value={ticketDetail.customerPhone}
                disabled
                size="small"
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Ticket Details */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Ticket Information
            </Typography>
            <Stack spacing={2} sx={{ mb: 2 }}>
              <TextField
                label="Reason"
                fullWidth
                value={ticketDetail.reason}
                disabled
                multiline
                rows={2}
                size="small"
              />
              <TextField
                label="Requested Action"
                fullWidth
                value={ticketDetail.requestedAction || "N/A"}
                disabled
                size="small"
              />
              <TextField
                label="Created Date"
                fullWidth
                value={new Date(ticketDetail.createdAt).toLocaleString()}
                disabled
                size="small"
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Order Summary */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Order Summary
            </Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1 }}>
                <Box>
                  <TextField
                    label="Order Date"
                    fullWidth
                    value={new Date(ticketDetail.orderSummary.createdAt).toLocaleDateString()}
                    disabled
                    size="small"
                  />
                </Box>
                <Box>
                  <TextField
                    label="Total Amount"
                    fullWidth
                    value={`$${ticketDetail.orderSummary.totalAmount.toFixed(2)}`}
                    disabled
                    size="small"
                  />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Items:
              </Typography>
              {ticketDetail.orderSummary.items.map((item: any) => (
                <Box key={`item-${item.orderItemIdm.orderItemId}`} sx={{ ml: 2, p: 1, bgcolor: "#f9f9f9", borderRadius: 1 }}>
                  <Typography variant="body2">
                    {item.productName} ({item.glassModel})
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Status Update */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Update Ticket Status
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="New Status"
                select
                fullWidth
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                disabled={!!ticketDetail.policyViolation}
                slotProps={{ select: { native: true } }}
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="InProgress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </TextField>

              {ticketDetail.ticketType === "Refund" && (
                <TextField
                  label="Refund Amount"
                  type="number"
                  fullWidth
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Enter refund amount"
                  slotProps={{ htmlInput: { step: "0.01" } }}
                />
              )}

              <TextField
                label="Notes"
                multiline
                rows={3}
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          onClick={handleUpdateStatus}
          variant="contained"
          color="primary"
          disabled={updateStatusMutation.isPending || !!ticketDetail?.policyViolation}
        >
          {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
