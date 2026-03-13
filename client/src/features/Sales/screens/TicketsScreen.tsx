import { useState } from "react";
import { Box, Paper, Typography, Chip, LinearProgress } from "@mui/material";
import { AppPagination } from "../../../app/shared/components/AppPagination";
import { useAfterSalesTickets } from "../../../lib/hooks/useAfterSalesTickets";
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
    case "Approved":
      return {
        label: "Approved",
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

export function TicketsScreen() {
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useAfterSalesTickets({ pageNumber, pageSize });
  const tickets: AfterSalesTicketDto[] = Array.isArray(data?.items)
    ? (data!.items as AfterSalesTicketDto[])
    : [];

  const meta = data
    ? {
        totalPages: data.totalPages,
        totalCount: data.totalCount,
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
          SALES CENTER
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
          View customer after‑sales requests and their status.
        </Typography>
      </Box>

      {isLoading && (
        <Box sx={{ px: 0.5, pt: 1 }}>
          <LinearProgress />
        </Box>
      )}

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
            <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
              No after‑sales tickets yet.
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

