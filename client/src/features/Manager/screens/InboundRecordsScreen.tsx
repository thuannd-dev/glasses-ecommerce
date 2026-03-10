import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import { toast } from "react-toastify";

import agent from "../../../lib/api/agent";
import type {
  InboundRecordListDto,
  PagedResult,
} from "../../../lib/types/inventory";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "PendingApproval", label: "Pending Approval" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

const STATUS_COLORS: Record<string, "default" | "success" | "error" | "warning"> = {
  PendingApproval: "warning",
  Approved: "success",
  Rejected: "error",
};

export default function InboundRecordsScreen() {
  const navigate = useNavigate();

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "totalItems" | "status">("createdAt");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectingLoading, setIsRejectingLoading] = useState(false);

  const queryParams = useMemo(() => {
    const result: Record<string, unknown> = {
      pageNumber,
      pageSize,
    };
    if (statusFilter) {
      result.status = statusFilter;
    }
    return result;
  }, [pageNumber, pageSize, statusFilter]);

  const { data, isLoading, isFetching, refetch, error } = useQuery<PagedResult<InboundRecordListDto>>({
    queryKey: ["manager-inbound", queryParams],
    queryFn: async () => {
      const res = await agent.get<PagedResult<InboundRecordListDto>>("/manager/inventory/inbound", {
        params: queryParams,
      });
      return res.data;
    },
  });

  const items: InboundRecordListDto[] = data?.items ?? [];
  const totalCount: number = data?.totalCount ?? 0;
  const totalPages: number = data?.totalPages ?? 1;

  const visibleItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let result = items;

    if (term) {
      result = result.filter((r) => {
        const haystack = [
          r.id,
          r.sourceType,
          r.sourceReference ?? "",
          r.status,
          r.createdByName ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(term);
      });
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "createdAt") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "totalItems") {
        cmp = a.totalItems - b.totalItems;
      } else {
        cmp = String(a.status).localeCompare(String(b.status));
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [items, searchTerm, sortBy, sortOrder]);

  const handleApprove = async (id: string): Promise<void> => {
    setIsRejectingLoading(true);
    try {
      await agent.put(`/manager/inventory/inbound/${id}/approve`);
      toast.success("Inbound record approved successfully");
      await refetch();
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Failed to approve record"
      );
    } finally {
      setIsRejectingLoading(false);
    }
  };

  const openRejectDialog = (id: string): void => {
    setRejectingId(id);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async (): Promise<void> => {
    if (!rejectingId) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setIsRejectingLoading(true);
    try {
      await agent.put(`/manager/inventory/inbound/${rejectingId}/reject`, {
        rejectionReason: rejectionReason.trim(),
      });
      toast.success("Inbound record rejected successfully");
      setRejectDialogOpen(false);
      await refetch();
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Failed to reject record"
      );
    } finally {
      setIsRejectingLoading(false);
    }
  };

  const resetFilters = (): void => {
    setPageNumber(1);
    setPageSize(10);
    setStatusFilter("");
    setSearchTerm("");
    setSortBy("createdAt");
    setSortOrder("desc");
    toast.info("Filters reset");
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4, lg: 6 }, py: 4 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 900 }} color="text.primary">
            Inbound Records
          </Typography>
          <Typography sx={{ mt: 0.5, color: "text.secondary" }} fontSize={13}>
            Review, approve, or reject inbound stock records from the live API.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="outlined" onClick={() => refetch()} disabled={isLoading || isFetching}>
            Refresh
          </Button>
          <Button variant="outlined" color="inherit" onClick={resetFilters} disabled={isLoading || isFetching}>
            Reset
          </Button>
        </Stack>
      </Stack>

      <Paper elevation={0} sx={{ mt: 3, p: 2.5, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              placeholder="Search by ID, source, status, created by..."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => {
                  setPageNumber(1);
                  setStatusFilter(String(e.target.value));
                }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Sort By"
              select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
              }}
            >
              <MenuItem value="createdAt">Created At</MenuItem>
              <MenuItem value="totalItems">Items</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Order"
              select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as any);
              }}
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Page Size"
              select
              value={pageSize}
              onChange={(e) => {
                setPageNumber(1);
                setPageSize(Number(e.target.value));
              }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Source Type</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Source Ref</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }} align="right">
                  Items
                </TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Created By</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={26} />
                  </TableCell>
                </TableRow>
              ) : error || !data ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography color="error">
                      Failed to load records: {error?.message || "Unknown error"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : visibleItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary" fontSize={14}>
                      No records found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visibleItems.map((record) => (
                  <TableRow
                    key={record.id}
                    hover
                    onClick={() => navigate(`/manager/inbound/${record.id}`)}
                    sx={{ cursor: "pointer", "& td": { py: 1.8 } }}
                  >
                    <TableCell sx={{ fontFamily: "monospace", fontSize: 13.5 }}>
                      {record.id.slice(0, 8)}…
                    </TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{record.sourceType}</TableCell>
                    <TableCell sx={{ fontSize: 13.5, color: "text.secondary" }}>
                      {record.sourceReference ?? "—"}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, fontSize: 14 }}>
                      {record.totalItems}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.status}
                        color={STATUS_COLORS[record.status] ?? "default"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{new Date(record.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{record.createdByName ?? "—"}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="text"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/manager/inbound/${record.id}`);
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={isRejectingLoading || record.status !== "PendingApproval"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(record.id);
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          disabled={isRejectingLoading || record.status !== "PendingApproval"}
                          onClick={(e) => {
                            e.stopPropagation();
                            openRejectDialog(record.id);
                          }}
                        >
                          Reject
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            disabled={isLoading || isFetching || pageNumber <= 1}
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <Chip
            label={`Page ${pageNumber} / ${totalPages} · ${totalCount} items`}
            sx={{ bgcolor: "rgba(0,0,0,0.06)", fontWeight: 700 }}
          />
          <Button
            variant="outlined"
            disabled={isLoading || isFetching || pageNumber >= totalPages}
            onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </Stack>
      </Box>

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reject Inbound Record</DialogTitle>
        <DialogContent>
          <TextField
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            sx={{ mt: 1 }}
            placeholder="Enter reason for rejection..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={isRejectingLoading}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleRejectConfirm}
            disabled={isRejectingLoading}
          >
            {isRejectingLoading ? "Rejecting..." : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
