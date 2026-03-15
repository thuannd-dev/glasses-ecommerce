import { useState } from "react";
import { useSearchParams } from "react-router";
import { Box, Paper, Typography, LinearProgress } from "@mui/material";
import { AppPagination } from "../../../app/shared/components/AppPagination";
import { useAfterSalesTickets } from "../../../lib/hooks/useAfterSalesTickets";
import { TicketStatusFilterTabs } from "../components/TicketStatusFilterTabs";
import { TicketListCard } from "../components/TicketListCard";
import type { TicketStatusFilterValue } from "../components/TicketStatusFilterTabs";

export function TicketsScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageNumber, setPageNumber] = useState(1);

  // Get filters from URL query params
  const ticketType = searchParams.get("type") || null;
  const urlStatus = searchParams.get("status") || null;

  // Map URL status to filter value
  const statusFilterValue: TicketStatusFilterValue = urlStatus 
    ? (urlStatus as TicketStatusFilterValue)
    : "All";

  const pageSize = 10;

  // Map filter value to query param
  const queryStatus = statusFilterValue === "All" ? undefined : statusFilterValue;

  const { data, isLoading } = useAfterSalesTickets({
    pageNumber,
    pageSize,
    ticketType: ticketType || undefined,
    status: queryStatus,
  });

  const tickets = data?.items ?? [];

  const meta = data
    ? {
        totalPages: data.totalPages,
        totalCount: data.totalCount,
        pageSize: data.pageSize,
      }
    : null;

  const handleStatusChange = (newStatus: TicketStatusFilterValue) => {
    setPageNumber(1);

    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (newStatus === "All") {
      newParams.delete("status");
    } else {
      newParams.set("status", newStatus);
    }
    setSearchParams(newParams, { replace: true });
  };

  const getDisplayTitle = () => {
    if (ticketType) {
      return `${ticketType} Tickets`;
    }
    return "After‑sales Tickets";
  };

  return (
    <Box
      sx={{
        px: { xs: 0, md: 0 },
        height: "calc(100vh - 56px)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: { xs: 2, md: 3, lg: 4 },
          py: 3,
        }}
      >
        <Typography sx={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "#8A8A8A" }}>
          SALES CENTER
        </Typography>
        <Box sx={{ mt: 0.75, display: "flex", alignItems: "baseline", gap: 1.25, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800, color: "#171717" }}>
            {getDisplayTitle()}
          </Typography>
          <Typography
            component="span"
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: "#6B6B6B",
              bgcolor: "#F7F7F7",
              border: "1px solid rgba(0,0,0,0.08)",
              px: 1.2,
              py: 0.25,
              borderRadius: 999,
            }}
          >
            {tickets.length} tickets
          </Typography>
        </Box>
        <Typography sx={{ mt: 0.5, color: "#6B6B6B", fontSize: 14 }}>
          View customer after‑sales requests and their status.
        </Typography>
      </Box>

      {/* Main Content */}
      <Paper
        elevation={0}
        sx={{
          px: { xs: 2, md: 3, lg: 4 },
          py: 3,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          mx: { xs: 2, md: 3, lg: 4 },
          mb: { xs: 2, md: 3, lg: 4 },
        }}
      >
        {isLoading ? (
          <LinearProgress sx={{ borderRadius: 1 }} />
        ) : (
          <>
            <TicketStatusFilterTabs value={statusFilterValue} onChange={handleStatusChange} hideAll={false} />

            {tickets.length === 0 ? (
              <Typography color="text.secondary">No after‑sales tickets found.</Typography>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  mt: 1,
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
                {tickets.map((t) => (
                  <TicketListCard key={t.id} summary={t} />
                ))}
              </Box>
            )}

            {meta && meta.totalPages > 1 && (
              <AppPagination
                page={pageNumber}
                totalPages={meta.totalPages || 1}
                onChange={setPageNumber}
                totalItems={meta.totalCount}
                pageSize={meta.pageSize}
                unitLabel="tickets"
                align="flex-end"
              />
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}

