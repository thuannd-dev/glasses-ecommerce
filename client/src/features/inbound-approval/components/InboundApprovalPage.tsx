import { useEffect, useState } from "react";
import { Box, Container, Typography, Button, CircularProgress, Alert } from "@mui/material";
import { RefreshCw } from "@mui/icons-material";
import { toast } from "react-toastify";
import { inboundApprovalService } from "../../services/inboundApproval.mock";
import { InboundRecord } from "../../services/inbound.types";
import InboundListTable from "./components/InboundListTable";
import InboundDetailPage from "./components/InboundDetailPage";

type ViewMode = "list" | "detail";

export default function InboundApprovalPage() {
  const [records, setRecords] = useState<InboundRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inboundApprovalService.getPendingInboundRecords();
      setRecords(data);
    } catch (err) {
      const errorMsg = "Failed to load inbound records";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleViewDetail = (id: string) => {
    setSelectedRecordId(id);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedRecordId(null);
    loadRecords();
  };

  if (viewMode === "detail" && selectedRecordId) {
    return <InboundDetailPage recordId={selectedRecordId} onBack={handleBackToList} />;
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#FAFAF8", py: 4 }}>
      <Container maxWidth="lg">
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
              Inbound Approval
            </Typography>
            <Typography sx={{ fontSize: 14, color: "rgba(15,23,42,0.60)", mt: 0.5 }}>
              Review and approve warehouse inbound records
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshCw sx={{ fontSize: 16 }} />}
            onClick={loadRecords}
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
          <InboundListTable
            records={records}
            onViewDetail={handleViewDetail}
            isLoading={loading}
          />
        )}

        {/* Empty State */}
        {!loading && !error && records.length === 0 && (
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
              No Pending Records
            </Typography>
            <Typography sx={{ fontSize: 14, color: "rgba(15,23,42,0.60)" }}>
              All inbound records have been processed or there are no pending approvals.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
