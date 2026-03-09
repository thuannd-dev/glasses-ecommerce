import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Chip,
  CircularProgress,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  type InboundRecordStatus,
  useManagerInboundRecords,
} from "../../lib/hooks/useManagerInboundRecords";
import { useApproveInbound } from "../../lib/hooks/useApproveInbound";
import { useRejectInbound } from "../../lib/hooks/useRejectInbound";

const STATUS_OPTIONS: Array<{ value: "" | InboundRecordStatus; label: string }> = [
  { value: "", label: "All" },
  { value: "PendingApproval", label: "Pending Approval" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

const STATUS_COLORS: Record<string, "default" | "success" | "warning" | "error"> = {
  Approved: "success",
  PendingApproval: "warning",
  Rejected: "error",
};

function statusChipColor(status: string | null): "default" | "success" | "warning" | "error" {
  return STATUS_COLORS[status || ""] ?? "default";
}

export default function InboundList() {
  const navigate = useNavigate();
  const [pageNumber, setPageNumber] = useState(1);
  const [status, setStatus] = useState<"" | InboundRecordStatus>("");

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");

  const { data, isLoading, error, refetch } = useManagerInboundRecords({
    pageNumber,
    pageSize: 10,
    status: status || undefined,
  });

  const approveInbound = useApproveInbound();
  const rejectInbound = useRejectInbound();

  const records = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handleApprove = async (id: string) => {
    try {
      await approveInbound.mutateAsync(id);
      toast.success("Inbound record approved successfully");
      await refetch();
    } catch (err) {
      toast.error("Failed to approve record");
      console.error(err);
    }
  };

  const handleRejectOpen = (id: string) => {
    setRejectingId(id);
    setRejectionReason("");
    setRejectionError("");
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectingId) return;
    if (!rejectionReason.trim()) {
      setRejectionError("Rejection reason is required");
      return;
    }
    if (rejectionReason.length > 500) {
      setRejectionError("Must not exceed 500 characters");
      return;
    }

    try {
      await rejectInbound.mutateAsync({
        inboundId: rejectingId,
        dto: { rejectionReason },
      });
      toast.success("Inbound record rejected successfully");
      setRejectDialogOpen(false);
      await refetch();
    } catch (err) {
      toast.error("Failed to reject record");
      console.error(err);
    }
  };

  const handleResetFilters = () => {
    setPageNumber(1);
    setStatus("");
    toast.info("Filters reset");
  };

  return (
    <Box sx={{ px: { xs: 2, md: 6, lg: 10 }, py: 4 }}>
      {/* Header */}
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 900 }} color="text.primary">
            Inbound Records
          </Typography>
          <Typography sx={{ mt: 0.5, color: "text.secondary" }} fontSize={13}>
            Review, approve, or reject inbound stock records.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleResetFilters}
            disabled={isLoading}
          >
            Reset
          </Button>
        </Stack>
      </Stack>

      {/* Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          bgcolor: "#ffffff",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as any);
                  setPageNumber(1);
                }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.label} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
              Total Records: {totalCount}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          bgcolor: "#ffffff",
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
                <TableCell sx={{ fontWeight: 900, fontSize: 12 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 12 }}>Source Type</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 12 }}>Source Ref</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, fontSize: 12 }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 12 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 12 }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 12 }}>Created By</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, fontSize: 12 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && error && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography color="error">Failed to load inbound records</Typography>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !error && records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ color: "text.secondary" }}>No inbound records found</Typography>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                !error &&
                records.map((record) => (
                  <TableRow
                    key={record.id}
                    hover
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell sx={{ fontFamily: "monospace", fontSize: 11 }}>
                      {record.id.slice(0, 8)}…
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>
                      {record.sourceType}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 12 }}>
                      {record.sourceReference ?? "—"}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                      {record.totalItems}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={record.status}
                        color={statusChipColor(record.status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {new Date(record.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>
                      {record.createdByName || "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => navigate(`/manager/inbound/${record.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={
                            record.status !== "PendingApproval" ||
                            approveInbound.isPending ||
                            rejectInbound.isPending
                          }
                          onClick={() => handleApprove(record.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          disabled={
                            record.status !== "PendingApproval" ||
                            approveInbound.isPending ||
                            rejectInbound.isPending
                          }
                          onClick={() => handleRejectOpen(record.id)}
                        >
                          Reject
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <Pagination
              count={totalPages}
              page={pageNumber}
              onChange={(_, value) => setPageNumber(value)}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reject Inbound Record</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {rejectionError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {rejectionError}
            </Alert>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            placeholder="Enter reason (max 500 characters)"
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              setRejectionError("");
            }}
            helperText={`${rejectionReason.length}/500`}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectConfirm}
            disabled={rejectInbound.isPending || !rejectionReason.trim()}
          >
            {rejectInbound.isPending ? "Rejecting..." : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
