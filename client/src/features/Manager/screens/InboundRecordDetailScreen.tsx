import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { ArrowBack } from "@mui/icons-material";
import { toast } from "react-toastify";
import axios from "axios";

import agent from "../../../lib/api/agent";
import type { InboundRecordDto } from "../../../lib/types/inventory";
import { useApproveInbound, useRejectInbound } from "../../../lib/hooks/useManagerInboundActions";

function getStatusColor(
  status: string
): "default" | "success" | "error" | "warning" {
  switch (status) {
    case "Approved":
      return "success";
    case "Rejected":
      return "error";
    case "PendingApproval":
      return "warning";
    default:
      return "default";
  }
}

export default function InboundRecordDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const approveMutation = useApproveInbound();
  const rejectMutation = useRejectInbound();
  const isActioning = approveMutation.isPending || rejectMutation.isPending;

  if (!id) {
    return (
      <Box sx={{ px: 4, py: 4 }}>
        <Typography color="error">Inbound record ID not provided</Typography>
      </Box>
    );
  }

  const { data: record, isLoading, error } = useQuery<InboundRecordDto>({
    queryKey: ["manager-inbound-detail", id],
    queryFn: async () => {
      const res = await agent.get<InboundRecordDto>(`/manager/inventory/inbound/${id}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          px: 4,
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !record) {
    return (
      <Box sx={{ px: 4, py: 4 }}>
        <Stack spacing={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/manager/inbound")}
            variant="outlined"
            color="inherit"
          >
            Back
          </Button>
          <Typography color="error">Failed to load inbound record details</Typography>
        </Stack>
      </Box>
    );
  }

  const handleApprove = async (): Promise<void> => {
    if (record?.status !== "PendingApproval") {
      toast.error("Can only approve records with 'Pending Approval' status");
      return;
    }

    try {
      await approveMutation.mutateAsync(id);
      toast.success("Inbound record approved successfully");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as any;
        const message =
          (typeof data === "string" && data) ||
          data?.detail ||
          data?.title ||
          data?.message ||
          "Failed to approve record";
        toast.error(message);
      } else {
        toast.error("Failed to approve record");
      }
    }
  };

  const handleRejectConfirm = async (): Promise<void> => {
    if (record?.status !== "PendingApproval") {
      toast.error("Can only reject records with 'Pending Approval' status");
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await rejectMutation.mutateAsync({ id, rejectionReason: rejectionReason.trim() });
      toast.success("Inbound record rejected successfully");
      setRejectDialogOpen(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as any;
        const message =
          (typeof data === "string" && data) ||
          data?.detail ||
          data?.title ||
          data?.message ||
          "Failed to reject record";
        toast.error(message);
      } else {
        toast.error("Failed to reject record");
      }
    }
  };

  return (
    <Box sx={{ px: { xs: 2, md: 6, lg: 10 }, py: 4 }}>
      <Stack spacing={2} direction="row" alignItems="center" sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/manager/inbound")}
          variant="outlined"
          color="inherit"
        >
          Back
        </Button>
        <Typography sx={{ fontSize: 24, fontWeight: 900 }} color="text.primary">
          Inbound Record Details
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {/* Summary Card */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                    RECORD ID
                  </Typography>
                  <Typography
                    fontSize={13}
                    fontWeight={700}
                    sx={{ mt: 0.5, fontFamily: "monospace" }}
                  >
                    {record.id}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                    STATUS
                  </Typography>
                  <Chip
                    label={record.status}
                    color={getStatusColor(record.status)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                    SOURCE TYPE
                  </Typography>
                  <Typography fontSize={14} fontWeight={700} sx={{ mt: 0.5 }}>
                    {record.sourceType}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                    TOTAL ITEMS
                  </Typography>
                  <Typography fontSize={14} fontWeight={700} sx={{ mt: 0.5 }}>
                    {record.totalItems}
                  </Typography>
                </Box>
              </Grid>

              {record.sourceReference && (
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                      SOURCE REFERENCE
                    </Typography>
                    <Typography fontSize={13} fontWeight={700} sx={{ mt: 0.5 }}>
                      {record.sourceReference}
                    </Typography>
                  </Box>
                </Grid>
              )}

              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                    CREATED AT
                  </Typography>
                  <Typography fontSize={13} fontWeight={700} sx={{ mt: 0.5 }}>
                    {new Date(record.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                    CREATED BY
                  </Typography>
                  <Typography fontSize={13} fontWeight={700} sx={{ mt: 0.5 }}>
                    {record.createdByName ?? "—"}
                  </Typography>
                </Box>
              </Grid>

              {record.notes && (
                <Grid item xs={12}>
                  <Box>
                    <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                      NOTES
                    </Typography>
                    <Typography fontSize={13} sx={{ mt: 0.5 }}>
                      {record.notes}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Approval/Rejection Status */}
        {(record.approvedAt || record.rejectedAt) && (
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 2 }} color="text.primary">
                Decision History
              </Typography>

              {record.approvedAt && (
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Chip label="Approved" color="success" size="small" variant="outlined" />
                    <Box>
                      <Typography fontSize={13} fontWeight={700}>
                        Approved by {record.approvedByName ?? "—"}
                      </Typography>
                      <Typography fontSize={12} color="text.secondary">
                        {new Date(record.approvedAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}

              {record.rejectedAt && (
                <Box>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Chip label="Rejected" color="error" size="small" variant="outlined" />
                    <Box flex={1}>
                      <Typography fontSize={13} fontWeight={700}>
                        Rejected by {record.rejectedByName ?? "—"}
                      </Typography>
                      <Typography fontSize={12} color="text.secondary">
                        {new Date(record.rejectedAt).toLocaleString()}
                      </Typography>
                      {record.rejectionReason && (
                        <Box sx={{ mt: 1, p: 1.5, bgcolor: "rgba(211,47,47,0.08)", borderRadius: 1 }}>
                          <Typography fontSize={12} fontWeight={700}>
                            Reason
                          </Typography>
                          <Typography fontSize={13} sx={{ mt: 0.5 }}>
                            {record.rejectionReason}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Stack>
                </Box>
              )}
            </Paper>
          </Grid>
        )}

        {/* Items Table */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
            <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 2 }} color="text.primary">
              Items ({record.items.length})
            </Typography>

            <TableContainer sx={{ borderRadius: 2, border: "1px solid rgba(0,0,0,0.08)" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
                    <TableCell sx={{ fontWeight: 900 }}>SKU</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Variant Name</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Product Variant ID</TableCell>
                    <TableCell sx={{ fontWeight: 900 }} align="right">
                      Quantity
                    </TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {record.items.map((item: any) => (
                    <TableRow key={item.id} hover>
                      <TableCell sx={{ fontFamily: "monospace", fontWeight: 700 }}>
                        {item.sku}
                      </TableCell>
                      <TableCell>{item.variantName}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                        {item.productVariantId.slice(0, 8)}…
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {item.quantity}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, color: "text.secondary" }}>
                        {item.notes ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Action Buttons */}
        {record.status === "PendingApproval" && (
          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="success"
                disabled={isActioning}
                onClick={handleApprove}
              >
                {isActioning ? "Approving..." : "Approve Record"}
              </Button>
              <Button
                variant="contained"
                color="error"
                disabled={isActioning}
                onClick={() => {
                  setRejectionReason("");
                  setRejectDialogOpen(true);
                }}
              >
                Reject Record
              </Button>
            </Stack>
          </Grid>
        )}
      </Grid>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reject Inbound Record</DialogTitle>
        <DialogContent>
          <TextField
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            fullWidth
            multiline
            minRows={4}
            sx={{ mt: 1 }}
            placeholder="Enter the reason for rejecting this inbound record..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={isActioning}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleRejectConfirm}
            disabled={isActioning}
          >
            {isActioning ? "Rejecting..." : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
