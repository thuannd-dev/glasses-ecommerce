import { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { toast } from "react-toastify";
import { afterSalesApprovalService } from "../../services/afterSalesApproval.mock";
import type { AfterSalesTicket } from "../../services/afterSales.types";
import AfterSalesListTable from "./components/AfterSalesListTable";
import AfterSalesDetailPage from "./components/AfterSalesDetailPage";

type ViewMode = "list" | "detail";

export default function AfterSalesApprovalPage() {
  const [tickets, setTickets] = useState<AfterSalesTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await afterSalesApprovalService.getPendingAfterSalesTickets();
      setTickets(data);
    } catch (err) {
      const errorMsg = "Failed to load after-sales tickets";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleViewDetail = (id: string) => {
    setSelectedTicketId(id);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedTicketId(null);
    loadTickets();
  };

  if (viewMode === "detail" && selectedTicketId) {
    return <AfterSalesDetailPage ticketId={selectedTicketId} onBack={handleBackToList} />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography
              sx={{
                fontSize: { xs: 28, md: 36 },
                fontWeight: 900,
                color: "rgba(15,23,42,0.92)",
                letterSpacing: -0.5,
              }}
            >
              Return Approval
            </Typography>
            <Typography sx={{ fontSize: 14, color: "rgba(15,23,42,0.60)", mt: 0.5 }}>
              Review and process customer return requests
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh sx={{ fontSize: 16 }} />}
            onClick={loadTickets}
            disabled={loading}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderColor: "rgba(15,23,42,0.2)",
              color: "rgba(15,23,42,0.75)",
              "&:hover": {
                borderColor: "rgba(15,23,42,0.4)",
                backgroundColor: "rgba(15,23,42,0.02)",
              },
            }}
          >
            Refresh
          </Button>
        </Box>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <AfterSalesListTable
            tickets={tickets}
            onViewDetail={handleViewDetail}
            isLoading={loading}
          />
        )}

        {/* Empty State */}
        {!loading && !error && tickets.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              px: 3,
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>
              No Pending Returns
            </Typography>
            <Typography sx={{ fontSize: 14, color: "rgba(15,23,42,0.60)" }}>
              All return requests have been processed or there are no pending approvals.
            </Typography>
          </Box>
        )}
    </Box>
  );
}
