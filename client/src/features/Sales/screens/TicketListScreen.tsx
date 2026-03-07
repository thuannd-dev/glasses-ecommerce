import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Pagination,
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
  readonly description: string;
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

export function TicketListScreen({ title, description, ticketTypes, navPrefix }: TicketListScreenProps) {
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

  const apiStatus = statusMap[statusFilter];

  // Always call both hooks unconditionally - required by React rules of hooks
  const type1Result = useStaffAfterSalesTickets({
    pageNumber,
    pageSize,
    status: apiStatus,
    ticketType: ticketTypes[0],
  });

  const dummyTicketType = ticketTypes.length > 1
    ? ticketTypes[1]
    : ticketTypes[0]; // Use a valid type even for single-type screens

  const type2Result = useStaffAfterSalesTickets({
    pageNumber,
    pageSize,
    status: apiStatus,
    ticketType: dummyTicketType,
  });

  // Merge results based on type
  const isLoading = type1Result.isLoading || type2Result.isLoading;
  const allItems = ticketTypes.length === 1
    ? type1Result.data?.items ?? []
    : [...(type1Result.data?.items ?? []), ...(type2Result.data?.items ?? [])];
  const totalCountAcrossAllTypes = ticketTypes.length === 1
    ? type1Result.data?.totalCount ?? 0
    : (type1Result.data?.totalCount ?? 0) + (type2Result.data?.totalCount ?? 0);

  // For pagination display
  const displayedItems = allItems.slice(0, pageSize);
  const meta = { totalPages: Math.ceil(totalCountAcrossAllTypes / pageSize) };

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

  const hasTickets = displayedItems.length > 0;
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
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 12, letterSpacing: 6, textTransform: "uppercase", color: "text.secondary" }}>
          Sales Console
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mt: 1, mb: 2 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 900 }}>
            {title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 200 }}>
            <SummaryCard label="Total Ticket" value={isLoading ? "—" : totalCountAcrossAllTypes} />
          </Box>
        </Box>
        <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
          {description}
        </Typography>
      </Box>

      {isLoading && (
        <Box sx={{ maxWidth: 720, mx: "auto", mt: 2 }}>
          <LinearProgress sx={{ borderRadius: 1 }} />
        </Box>
      )}

      {shouldShowEmpty && <NoTicketsFound />}

      {shouldShowContent && (
        <TicketListContent
          filteredTickets={displayedItems}
          meta={meta}
          pageNumber={pageNumber}
          handlePageChange={handlePageChange}
          navigate={navigate}
          navPrefix={navPrefix}
          getTypeLabel={getTypeLabel}
          statusFilter={statusFilter}
        />
      )}
    </Box>
  );
}

function NoTicketsFound() {
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
  readonly meta: { totalPages: number };
  readonly pageNumber: number;
  readonly handlePageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  readonly navigate: ReturnType<typeof useNavigate>;
  readonly navPrefix: string;
  readonly getTypeLabel: (type: AfterSalesTicketType) => string;
  readonly statusFilter: string;
}

function TicketListContent({
  filteredTickets,
  meta,
  pageNumber,
  handlePageChange,
  navigate,
  navPrefix,
  getTypeLabel,
  statusFilter,
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

            {ticket.orderItem && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  bgcolor: "rgba(0,0,0,0.02)",
                  borderRadius: 1.5,
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1,
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
                        fontSize: 10,
                      }}
                    >
                      —
                    </Box>
                  )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 13, color: "rgba(0,0,0,0.8)" }}>
                    {ticket.orderItem.productName || "Unknown Product"}
                  </Typography>
                  {ticket.orderItem.variantName && (
                    <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>
                      {ticket.orderItem.variantName}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

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
                onClick={() => {
                  const url = `/sales/${navPrefix}/${ticket.id}?status=${statusFilter}`;
                  navigate(url);
                }}
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
