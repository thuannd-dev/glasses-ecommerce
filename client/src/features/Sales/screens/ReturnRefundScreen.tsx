import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Pagination,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStaffAfterSalesTickets } from "../../../lib/hooks/useStaffAfterSalesTickets";
import {
  AfterSalesTicketStatus,
  AfterSalesTicketType,
} from "../../../lib/types/afterSales";

const STATUS_LABELS: Record<AfterSalesTicketStatus, string> = {
  [AfterSalesTicketStatus.Pending]: "Pending",
  [AfterSalesTicketStatus.InProgress]: "In Progress",
  [AfterSalesTicketStatus.Resolved]: "Resolved",
  [AfterSalesTicketStatus.Rejected]: "Rejected",
  [AfterSalesTicketStatus.Closed]: "Closed",
};

const STATUS_COLORS: Record<AfterSalesTicketStatus, string> = {
  [AfterSalesTicketStatus.Pending]: "warning",
  [AfterSalesTicketStatus.InProgress]: "info",
  [AfterSalesTicketStatus.Resolved]: "success",
  [AfterSalesTicketStatus.Rejected]: "error",
  [AfterSalesTicketStatus.Closed]: "default",
};

export function ReturnRefundScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const rawStatus = searchParams.get("status") ?? "Pending";
  const allowedStatuses = ["Pending", "InProgress", "Resolved", "Rejected", "Closed"];
  const statusFilter = allowedStatuses.includes(rawStatus) ? rawStatus : "Pending";

  useEffect(() => {
    setPageNumber(1);
  }, [statusFilter]);

  // Convert status string to enum
  const statusMap: Record<string, AfterSalesTicketStatus> = {
    Pending: AfterSalesTicketStatus.Pending,
    InProgress: AfterSalesTicketStatus.InProgress,
    Resolved: AfterSalesTicketStatus.Resolved,
    Rejected: AfterSalesTicketStatus.Rejected,
    Closed: AfterSalesTicketStatus.Closed,
  };

  const { data, isLoading } = useStaffAfterSalesTickets({
    pageNumber,
    pageSize,
    status: statusMap[statusFilter],
  });

  const safeTickets = Array.isArray(data?.items) ? data.items : [];
  // Filter for Return and Refund types only
  const filteredTickets = safeTickets.filter(
    (t) =>
      t.ticketType === AfterSalesTicketType.Return ||
      t.ticketType === AfterSalesTicketType.Refund
  );

  const meta = data ? { totalPages: Math.ceil(data.totalCount / pageSize) } : null;

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
      <Typography sx={{ fontSize: 24, fontWeight: 900, mb: 2 }}>
        Return / Refund Requests
      </Typography>

      {isLoading && (
        <Box sx={{ maxWidth: 720, mx: "auto", mt: 2 }}>
          <LinearProgress sx={{ borderRadius: 1 }} />
        </Box>
      )}

      {!isLoading && filteredTickets.length === 0 && (
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
            <Typography color="text.secondary">
              No return or refund requests yet.
            </Typography>
          </Paper>
        </Box>
      )}

      {!isLoading && filteredTickets.length > 0 && (
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
              mt: 2,
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
            {filteredTickets.map((ticket) => (
              <Paper
                key={ticket.id}
                elevation={0}
                sx={{
                  flex: "0 0 auto",
                  borderRadius: 2,
                  border: "1px solid rgba(0,0,0,0.08)",
                  px: 3,
                  py: 2,
                  "&:hover": {
                    boxShadow: 1,
                    cursor: "pointer",
                  },
                  transition: "all 0.2s",
                }}
                onClick={() =>
                  navigate(`/sales/return-refund/${ticket.id}`, {
                    state: { from: "return-refund" },
                  })
                }
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Ticket ID: {ticket.id.slice(0, 8)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Order ID: {ticket.orderId.slice(0, 8)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, color: "rgba(0,0,0,0.7)" }}
                    >
                      {ticket.reason}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Chip
                      label={STATUS_LABELS[ticket.ticketStatus]}
                      color={
                        STATUS_COLORS[
                          ticket.ticketStatus
                        ] as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
                      }
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </Typography>
                    {ticket.refundAmount !== null && ticket.refundAmount !== undefined && (
                      <Typography
                        variant="subtitle2"
                        sx={{ mt: 1, fontWeight: 600 }}
                      >
                        ${ticket.refundAmount.toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>

          {meta && meta.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={meta.totalPages}
                page={pageNumber}
                onChange={(_, value) => setPageNumber(value)}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
