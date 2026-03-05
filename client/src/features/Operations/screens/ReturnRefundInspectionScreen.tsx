import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Pagination,
  Grid,
  Button,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import { useStaffAfterSalesTickets } from "../../../lib/hooks/useStaffAfterSalesTickets";
import { SummaryCard } from "../components";
import {
  AfterSalesTicketStatusValues,
  AfterSalesTicketTypeValues,
  type AfterSalesTicketStatus,
} from "../../../lib/types/afterSales";
import { formatDate } from "../constants";

const STATUS_LABELS: Record<AfterSalesTicketStatus, string> = {
  [AfterSalesTicketStatusValues.Pending]: "Pending",
  [AfterSalesTicketStatusValues.InProgress]: "Approved",
  [AfterSalesTicketStatusValues.Resolved]: "Resolved",
  [AfterSalesTicketStatusValues.Rejected]: "Rejected",
  [AfterSalesTicketStatusValues.Closed]: "Closed",
};

const STATUS_COLORS: Record<AfterSalesTicketStatus, { bg: string; border: string; color: string }> = {
  [AfterSalesTicketStatusValues.Pending]: { bg: "#fbbf2422", border: "#fbbf24", color: "#92400e" },
  [AfterSalesTicketStatusValues.InProgress]: { bg: "#3b82f622", border: "#3b82f6", color: "#1e40af" },
  [AfterSalesTicketStatusValues.Resolved]: { bg: "#10b98122", border: "#10b981", color: "#065f46" },
  [AfterSalesTicketStatusValues.Rejected]: { bg: "#ef444422", border: "#ef4444", color: "#7f1d1d" },
  [AfterSalesTicketStatusValues.Closed]: { bg: "#6b728022", border: "#6b7280", color: "#374151" },
};

const TYPE_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  Return: { bg: "#f59e0b22", border: "#f59e0b", color: "#92400e" },
  Warranty: { bg: "#3b82f622", border: "#3b82f6", color: "#1e40af" },
  Refund: { bg: "#10b98122", border: "#10b981", color: "#065f46" },
};

export function ReturnRefundInspectionScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const rawStatus = searchParams.get("status") ?? "Pending";
  const allowedStatuses = ["Pending", "Approved", "Rejected"];

  const statusMap: Record<string, AfterSalesTicketStatus> = {
    Pending: AfterSalesTicketStatusValues.Pending,
    Approved: AfterSalesTicketStatusValues.InProgress,
    Rejected: AfterSalesTicketStatusValues.Rejected,
  };

  const statusFilter = allowedStatuses.includes(rawStatus)
    ? statusMap[rawStatus]
    : AfterSalesTicketStatusValues.Pending;

  useEffect(() => {
    setPageNumber(1);
  }, [statusFilter]);

  const { data, isLoading } = useStaffAfterSalesTickets({
    pageNumber,
    pageSize,
    status: statusFilter,
    ticketType: AfterSalesTicketTypeValues.Return,
  });

  const safeTickets = Array.isArray(data?.items) ? data.items : [];
  const meta = data ? { totalPages: Math.ceil(data.totalCount / pageSize) } : null;

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPageNumber(value);
  };

  const handleViewTicket = (ticketId: string) => {
    navigate(`/operations/return-refund/${ticketId}?status=${rawStatus}`);
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4, lg: 6 },
        py: 4,
        height: "calc(100vh - 56px)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <AssignmentReturnIcon sx={{ fontSize: 32, color: "#f59e0b" }} />
        <Typography sx={{ fontSize: 24, fontWeight: 900 }}>
          Return/Refund Inspection
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="Return/Refund" value={isLoading ? "—" : safeTickets.length} />
        </Grid>
      </Grid>

      {isLoading && (
        <Box sx={{ maxWidth: 720, mx: "auto", mt: 2 }}>
          <LinearProgress sx={{ borderRadius: 1 }} />
        </Box>
      )}

      {!isLoading && safeTickets.length === 0 && (
        <Box sx={{ maxWidth: 720, mx: "auto", mt: 3 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(0,0,0,0.08)",
              px: 3,
              py: 4,
              textAlign: "center",
            }}
          >
            <Typography color="text.secondary">No tickets found.</Typography>
          </Paper>
        </Box>
      )}

      {!isLoading && safeTickets.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              pr: { md: 1 },
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {safeTickets.map((ticket) => (
              <Paper
                key={ticket.id}
                elevation={0}
                sx={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 3,
                  px: 3,
                  py: 2.5,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.03)",
                  },
                }}
                onClick={() => handleViewTicket(ticket.id)}
              >
                {/* Header row: ID + Status chip */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, wordBreak: "break-all" }}>
                      Ticket ID: {ticket.id}
                    </Typography>
                  </Box>
                  <Chip
                    label={STATUS_LABELS[ticket.ticketStatus]}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      textTransform: "capitalize",
                      border: `1px solid ${STATUS_COLORS[ticket.ticketStatus].border}`,
                      bgcolor: `${STATUS_COLORS[ticket.ticketStatus].bg}`,
                      color: STATUS_COLORS[ticket.ticketStatus].color,
                      flexShrink: 0,
                    }}
                  />
                </Box>

                {/* Metadata row: Type + Created date */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    fontSize: 13,
                    color: "text.secondary",
                    mb: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: "rgba(0,0,0,0.7)" }}>
                      Type:
                    </Typography>
                    <Chip
                      label="Return"
                      size="small"
                      sx={{
                        fontWeight: 600,
                        borderRadius: 1,
                        height: 24,
                        bgcolor: TYPE_COLORS.Return.bg,
                        color: TYPE_COLORS.Return.color,
                        border: `1px solid ${TYPE_COLORS.Return.border}`,
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: "rgba(0,0,0,0.7)" }}>
                    Created: {formatDate(ticket.createdAt)}
                  </Typography>
                </Box>

                {/* Reason section */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>
                      Reason
                    </Typography>
                    <Typography sx={{ fontWeight: 600, color: "rgba(0,0,0,0.7)" }}>
                      {ticket.reason}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 2,
                      bgcolor: "#1f2937",
                      "&:hover": { bgcolor: "#111827" },
                      ml: 2,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTicket(ticket.id);
                    }}
                  >
                    View detail
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>

          {meta && meta.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3, pt: 2, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
              <Pagination
                count={meta.totalPages}
                page={pageNumber}
                onChange={handlePageChange}
                size="small"
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
