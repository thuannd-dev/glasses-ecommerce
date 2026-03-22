import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Box, Paper, Typography, LinearProgress, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { AppPagination } from "../../../app/shared/components/AppPagination";
import { useAfterSalesTickets } from "../../../lib/hooks/useAfterSalesTickets";
import { TicketStatusFilterTabs } from "../components/TicketStatusFilterTabs";
import { TicketListCard } from "../components/TicketListCard";
import type { TicketStatusFilterValue } from "../components/TicketStatusFilterTabs";

export function TicketsScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageNumber, setPageNumber] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");

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

  const allTickets = data?.items ?? [];

  // Apply search and date filters client-side
  const tickets = useMemo(() => {
    return allTickets.filter((t) => {
      // Search by ticket ID or phone number from customer name/order info
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const ticketId = (t.id ?? "").toString().toLowerCase();
        const customerName = (t.customerName ?? "").toString().toLowerCase();
        const phone = (t.customerPhone ?? (t as any).phone ?? "").toString().toLowerCase();
        if (!ticketId.includes(q) && !phone.includes(q) && !customerName.includes(q)) {
          return false;
        }
      }

      // Date filter by createdAt (yyyy-mm-dd)
      if (dateFilter) {
        const d = new Date(t.createdAt || "");
        const yyyy = String(d.getFullYear()).padStart(4, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const ymd = `${yyyy}-${mm}-${dd}`;
        if (ymd !== dateFilter) return false;
      }

      return true;
    });
  }, [allTickets, searchQuery, dateFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPageNumber(1);
  }, [searchQuery, dateFilter]);

  const meta = data && tickets.length > 0
    ? {
        totalPages: Math.max(1, Math.ceil(tickets.length / 10)),
        totalCount: tickets.length,
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
            {tickets.length || 0} tickets
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

            {/* Search and Date Filter */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 2,
                mb: 2,
                justifyContent: "flex-start",
                mt: 2,
              }}
            >
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search by ticket ID or phone"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    minWidth: 220,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 999,
                      bgcolor: "#FAFAF8",
                      fontSize: 13,
                      px: 1,
                      "& fieldset": { borderColor: "rgba(0,0,0,0.06)" },
                      "&:hover fieldset": { borderColor: "rgba(0,0,0,0.18)" },
                      "&.Mui-focused fieldset": { borderColor: "#B68C5A", borderWidth: 1 },
                    },
                    "& .MuiInputBase-input": {
                      py: 0.75,
                    },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" sx={{ color: "#9CA3AF" }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Ticket date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                  sx={{
                    minWidth: 160,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 999,
                      bgcolor: "#FAFAF8",
                      fontSize: 13,
                      px: 1.25,
                      "& fieldset": { borderColor: "rgba(0,0,0,0.06)" },
                      "&:hover fieldset": { borderColor: "rgba(0,0,0,0.18)" },
                      "&.Mui-focused fieldset": { borderColor: "#B68C5A", borderWidth: 1 },
                    },
                    "& .MuiInputBase-input": {
                      py: 0.75,
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      color: "#9CA3AF",
                    },
                  }}
                />
              </Box>
            </Box>

            {tickets.length === 0 ? (
              <Typography color="text.secondary">{searchQuery || dateFilter ? "No matching tickets found." : "No after‑sales tickets found."}</Typography>
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

