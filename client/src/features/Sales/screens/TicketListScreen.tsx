import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Pagination,
  Grid,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStaffAfterSalesTickets } from "../../../lib/hooks/useStaffAfterSalesTickets";
import { SummaryCard } from "../components";
import {
  AfterSalesTicketStatusValues,
  AfterSalesTicketTypeValues,
  type AfterSalesTicketStatus,
  type AfterSalesTicketType,
  type TicketListDto,
} from "../../../lib/types/afterSales";

interface TicketListScreenProps {
  readonly title: string;
  readonly ticketTypes: readonly AfterSalesTicketType[];
  readonly navPrefix: string;
}

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

const TYPE_COLORS: Record<AfterSalesTicketType, string> = {
  [AfterSalesTicketTypeValues.Unknown]: "#9ca3af",
  [AfterSalesTicketTypeValues.Return]: "#f59e0b",
  [AfterSalesTicketTypeValues.Warranty]: "#3b82f6",
  [AfterSalesTicketTypeValues.Refund]: "#10b981",
};

export function TicketListScreen({ title, ticketTypes, navPrefix }: TicketListScreenProps) {
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

  const statusMap: Record<string, AfterSalesTicketStatus> = {
    Pending: AfterSalesTicketStatusValues.Pending,
    InProgress: AfterSalesTicketStatusValues.InProgress,
    Resolved: AfterSalesTicketStatusValues.Resolved,
    Rejected: AfterSalesTicketStatusValues.Rejected,
    Closed: AfterSalesTicketStatusValues.Closed,
  };

  const { data, isLoading } = useStaffAfterSalesTickets({
    pageNumber,
    pageSize,
    status: statusMap[statusFilter],
  });

  const safeTickets = Array.isArray(data?.items) ? data.items : [];
  const filteredTickets = safeTickets.filter((t) =>
    ticketTypes.includes(t.ticketType)
  );
  const meta = data ? { totalPages: Math.ceil(data.totalCount / pageSize) } : null;

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPageNumber(value);
  };

  const getTypeLabel = (type: AfterSalesTicketType): string => {
    if (type === AfterSalesTicketTypeValues.Return) {
      return "Return";
    }
    if (type === AfterSalesTicketTypeValues.Warranty) {
      return "Warranty";
    }
    return "Refund";
  };

  const hasTickets = filteredTickets.length > 0;
  const shouldShowContent = !isLoading && hasTickets;
  const shouldShowEmpty = !isLoading && !hasTickets;

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
        {title}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <SummaryCard label={title} value={isLoading ? "—" : filteredTickets.length} />
        </Grid>
      </Grid>

      {isLoading && (
        <Box sx={{ maxWidth: 720, mx: "auto", mt: 2 }}>
          <LinearProgress sx={{ borderRadius: 1 }} />
        </Box>
      )}

      {shouldShowEmpty && <NoTicketsFound />}

      {shouldShowContent && (
        <TicketListContent
          filteredTickets={filteredTickets}
          meta={meta}
          pageNumber={pageNumber}
          handlePageChange={handlePageChange}
          navigate={navigate}
          navPrefix={navPrefix}
          getTypeLabel={getTypeLabel}
        />
      )}
    </Box>
  );
}

interface NoTicketsFoundProps {}

function NoTicketsFound({}: NoTicketsFoundProps) {
  return (
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
  );
}

interface TicketListContentProps {
  readonly filteredTickets: readonly TicketListDto[];
  readonly meta: any;
  readonly pageNumber: number;
  readonly handlePageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  readonly navigate: any;
  readonly navPrefix: string;
  readonly getTypeLabel: (type: AfterSalesTicketType) => string;
}

function TicketListContent({
  filteredTickets,
  meta,
  pageNumber,
  handlePageChange,
  navigate,
  navPrefix,
  getTypeLabel,
}: TicketListContentProps) {
  return (
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
              borderRadius: 3,
              border: "1px solid rgba(0,0,0,0.08)",
              px: 3,
              py: 2.5,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
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
                  border: `1px solid ${STATUS_COLORS[ticket.ticketStatus]}`,
                  bgcolor: `${STATUS_COLORS[ticket.ticketStatus]}22`,
                  color: STATUS_COLORS[ticket.ticketStatus],
                  flexShrink: 0,
                }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                fontSize: 13,
                color: "text.secondary",
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontWeight: 600, color: "rgba(0,0,0,0.7)" }}>
                  Type:
                </Typography>
                <Chip
                  label={getTypeLabel(ticket.ticketType)}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    borderRadius: 1,
                    height: 24,
                    bgcolor: `${TYPE_COLORS[ticket.ticketType]}22`,
                    color: TYPE_COLORS[ticket.ticketType],
                    border: `1px solid ${TYPE_COLORS[ticket.ticketType]}`,
                    "& .MuiChip-label": {
                      px: 1,
                    },
                  }}
                />
              </Box>
              <Typography sx={{ fontWeight: 600, color: "rgba(0,0,0,0.7)" }}>
                Created: {new Date(ticket.createdAt).toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>
                  Reason
                </Typography>
                <Typography sx={{ fontWeight: 600, color: "rgba(0,0,0,0.7)" }}>
                  {ticket.reason}
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  bgcolor: "#1f2937",
                  "&:hover": { bgcolor: "#111827" },
                  ml: 2,
                }}
                onClick={() => navigate(`/sales/${navPrefix}/${ticket.id}`)}
              >
                View detail
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>

      {meta && meta.totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 3,
            pt: 2,
            borderTop: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Pagination
            count={meta.totalPages}
            page={pageNumber}
            onChange={handlePageChange}
            size="small"
          />
        </Box>
      )}
    </Box>
  );
}
