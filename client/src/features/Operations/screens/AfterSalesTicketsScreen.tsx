import { useMemo, useState, useEffect } from "react";
import { Box, Paper, Typography, Chip, LinearProgress, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { AppPagination } from "../../../app/shared/components/AppPagination";
import { useOperationsAfterSalesTickets } from "../../../lib/hooks/useOperationsAfterSalesTickets";
import type { AfterSalesTicketDto } from "../../../lib/types/afterSales";

function getStatusChip(ticket: AfterSalesTicketDto) {
  const status = (ticket.status ?? "").toString();

  switch (status) {
    case "Pending":
      return {
        label: "Pending",
        border: "#EAEAEA",
        bg: "#F6F6F6",
        color: "#4B4B4B",
      };
    case "Received":
    case "Resolved":
      return {
        label: status,
        border: "#D4E5D5",
        bg: "#EEF5EE",
        color: "#466A4A",
      };
    case "Rejected":
      return {
        label: "Rejected",
        border: "#E8CFCF",
        bg: "#F6EAEA",
        color: "#8E3B3B",
      };
    default:
      return {
        label: status || "—",
        border: "#EAEAEA",
        bg: "#F6F6F6",
        color: "#4B4B4B",
      };
  }
}

function TicketRow({ ticket }: { ticket: AfterSalesTicketDto }) {
  const createdAt = ticket.createdAt ? new Date(ticket.createdAt) : null;
  const statusChip = getStatusChip(ticket);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "#FFFFFF",
        boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
        px: 2.75,
        py: 2.25,
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography
            sx={{ fontSize: 12, fontWeight: 600, color: "#8A8A8A", textTransform: "uppercase" }}
          >
            Ticket
          </Typography>
          <Typography
            sx={{
              fontFamily: "monospace",
              fontSize: 14,
              fontWeight: 700,
              color: "#171717",
            }}
          >
            {ticket.id}
          </Typography>
          {ticket.orderId && (
            <Typography sx={{ fontSize: 12, color: "#6B6B6B" }}>
              Order:{" "}
              <Typography component="span" sx={{ fontFamily: "monospace", fontSize: 12 }}>
                {ticket.orderId}
              </Typography>
            </Typography>
          )}
        </Box>

        <Chip
          label={statusChip.label}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: 12,
            borderRadius: 10,
            border: `1px solid ${statusChip.border}`,
            bgcolor: statusChip.bg,
            color: statusChip.color,
          }}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {ticket.subject && (
          <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "#171717" }}>
            {ticket.subject}
          </Typography>
        )}
        {ticket.reason && (
          <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>{ticket.reason}</Typography>
        )}
        {ticket.customerName && (
          <Typography sx={{ fontSize: 12, color: "#8A8A8A" }}>
            Customer: {ticket.customerName}
          </Typography>
        )}
        {createdAt && (
          <Typography sx={{ fontSize: 12, color: "#8A8A8A" }}>
            Created at: {createdAt.toLocaleString()}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

export function OperationsAfterSalesTicketsScreen() {
  const [pageNumber, setPageNumber] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const pageSize = 10;

  const { data, isLoading } = useOperationsAfterSalesTickets({ pageNumber, pageSize });
  const allTickets: AfterSalesTicketDto[] = Array.isArray(data?.items)
    ? (data!.items as AfterSalesTicketDto[])
    : [];

  // Apply search and date filters client-side
  const tickets = useMemo(() => {
    return allTickets.filter((t) => {
      // Search by ticket ID or phone number
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const ticketId = (t.id ?? "").toString().toLowerCase();
        const phone = (t.customerPhone ?? (t as any).phone ?? "").toString().toLowerCase();
        const customerName = (t.customerName ?? "").toString().toLowerCase();
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
        totalPages: Math.max(1, Math.ceil(tickets.length / pageSize)),
        totalCount: tickets.length,
        pageSize: data.pageSize,
      }
    : null;

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3, lg: 4 },
        py: 4,
        height: "calc(100vh - 56px)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "#8A8A8A" }}>
          OPERATIONS CENTER
        </Typography>
        <Box sx={{ mt: 0.75, display: "flex", alignItems: "baseline", gap: 1.25, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800, color: "#171717" }}>
            After‑sales tickets
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
          View and manage after‑sales cases handled by Operations.
        </Typography>
      </Box>

      {isLoading && (
        <Box sx={{ px: 0.5, pt: 1 }}>
          <LinearProgress />
        </Box>
      )}

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

      <Box
        sx={{
          mt: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            overflowY: "auto",
            pr: { md: 1 },
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {tickets.length === 0 && !isLoading ? (
            <Typography color="text.secondary">
              {searchQuery || dateFilter ? "No matching tickets found." : "No after‑sales tickets for Operations yet."}
            </Typography>
          ) : (
            tickets.map((t) => <TicketRow key={t.id} ticket={t} />)
          )}
        </Box>

        {meta && (
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
      </Box>
    </Box>
  );
}

