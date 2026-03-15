import { useEffect, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
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
    (searchParams.get("status") as any) || "Awaiting",
  );
  const [pageNumber, setPageNumber] = useState(1);

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
  const tickets = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;

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

          {isLoading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography sx={{ color: "#6B6B6B" }}>Loading...</Typography>
            </Box>
          ) : tickets.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography sx={{ color: "#6B6B6B" }}>
                No {status.toLowerCase()} {ticketType.toLowerCase()} tickets.
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
              pageNumber={pageNumber}
              pageSize={20}
              totalCount={totalCount}
              totalPages={totalPages}
              onPageChange={setPageNumber}
            />
          </Box>
        )}
      </>
    </Paper>
  );
}
