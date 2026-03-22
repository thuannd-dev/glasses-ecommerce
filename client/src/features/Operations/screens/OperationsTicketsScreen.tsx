import { useEffect, useState, useMemo } from "react";
import { Box, Paper, Typography, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useSearchParams } from "react-router";
import { AppPagination } from "../../../app/shared/components/AppPagination";
import { useOperationsTickets } from "../../../lib/hooks/useOperationsTickets";
import type { OperationsReturnStatusFilterValue } from "../components/OperationsReturnStatusFilterTabs";
import { OperationsReturnStatusFilterTabs } from "../components/OperationsReturnStatusFilterTabs";
import type { OperationsWarrantyStatusFilterValue } from "../components/OperationsWarrantyStatusFilterTabs";
import { OperationsWarrantyStatusFilterTabs } from "../components/OperationsWarrantyStatusFilterTabs";
import { OperationsTicketListCard } from "../components/OperationsTicketListCard";

export function OperationsTicketsScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const ticketType = searchParams.get("type") as "Return" | "Warranty" | null;
  const [status, setStatus] = useState<OperationsReturnStatusFilterValue | OperationsWarrantyStatusFilterValue>(
    (searchParams.get("status") as any) || "All",
  );
  const [pageNumber, setPageNumber] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Determine resolution type based on ticket type
  const resolutionType: "ReturnAndRefund" | "WarrantyReplace" | undefined = ticketType
    ? ticketType === "Return"
      ? "ReturnAndRefund"
      : "WarrantyReplace"
    : undefined;

  const { data, isLoading } = useOperationsTickets({
    resolutionType,
    status: status as "Awaiting" | "Inspecting" | "Accepted" | "Rejected" | "All",
    pageNumber,
    pageSize: 20,
  });

  const allTickets = data?.items || [];

  // Apply search and date filters client-side
  const tickets = useMemo(() => {
    return allTickets.filter((t) => {
      // Search by ticket ID or phone number
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const ticketId = (t.id ?? "").toString().toLowerCase();
        const phone = (t.customerPhone ?? (t as any).phone ?? "").toString().toLowerCase();
        if (!ticketId.includes(q) && !phone.includes(q)) {
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

  useEffect(() => {
    setSearchParams({ type: ticketType || "Return", status });
  }, [ticketType, status, setSearchParams]);

  const handleStatusChange = (newStatus: typeof status) => {
    setStatus(newStatus);
    setPageNumber(1);
  };

  if (!ticketType) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Please select a ticket type from the sidebar</Typography>
      </Box>
    );
  }

  const title = ticketType === "Return" ? "Return Tickets" : "Warranty Tickets";
  const FilterComponent =
    ticketType === "Return" ? OperationsReturnStatusFilterTabs : OperationsWarrantyStatusFilterTabs;
  const totalCount = tickets.length;
  const totalPages = Math.max(1, Math.ceil(tickets.length / 20));

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 0,
        bgcolor: "#FFFFFF",
        minHeight: "100%",
        px: 0,
        py: 4,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <>
        <Box sx={{ px: 3, mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#171717", mb: 0.5 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#6B6B6B", mb: 2 }}>
            Manage after-sales cases for {ticketType.toLowerCase()} tickets.
          </Typography>

          <Box sx={{ mb: 2 }}>
            <FilterComponent value={status} onChange={handleStatusChange} />
          </Box>

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

          {isLoading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography sx={{ color: "#6B6B6B" }}>Loading...</Typography>
            </Box>
          ) : tickets.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography sx={{ color: "#6B6B6B" }}>
                {searchQuery || dateFilter ? "No matching tickets found." : `No ${status.toLowerCase()} ${ticketType.toLowerCase()} tickets.`}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {tickets.map((ticket) => (
                <OperationsTicketListCard key={ticket.id} summary={ticket} />
              ))}
            </Box>
          )}
        </Box>

        {totalCount > 0 && (
          <Box sx={{ mt: "auto", pt: 2, px: 3 }}>
            <AppPagination
              page={pageNumber}
              pageSize={20}
              totalItems={totalCount}
              totalPages={totalPages}
              onChange={setPageNumber}
            />
          </Box>
        )}
      </>
    </Paper>
  );
}
