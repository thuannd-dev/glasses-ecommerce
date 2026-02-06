import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  TextField,
  TablePagination,
} from "@mui/material";
import { Refresh, Menu as MenuIcon } from "@mui/icons-material";
import { toast } from "react-toastify";
import { afterSalesApprovalService } from "../../services/afterSalesApproval.mock";
import type { AfterSalesTicket } from "../../services/afterSales.types";
import AfterSalesListTable from "./components/AfterSalesListTable";
import AfterSalesDetailPage from "./components/AfterSalesDetailPage";
import Sidebar from "../manager copy/layout/Sidebar";

type ViewMode = "list" | "detail";
type TabType = "pending" | "approved";

export default function AfterSalesApprovalPage() {
  const [tickets, setTickets] = useState<AfterSalesTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<TabType>("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = tab === "pending"
        ? await afterSalesApprovalService.getPendingAfterSalesTickets()
        : await afterSalesApprovalService.getApprovedAfterSalesTickets();
      setTickets(data);
      setPageNumber(0);
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
  }, [tab]);

  const filteredTickets = tickets.filter((t) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      t.customer?.displayName.toLowerCase().includes(searchLower) ||
      t.customer?.email.toLowerCase().includes(searchLower)
    );
  });

  const totalCount = filteredTickets.length;
  const startIndex = pageNumber * pageSize;
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + pageSize);

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
    <Box sx={{ display: "flex" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ flex: 1, pt: 4, px: 3 }}>
        {isMobile && (
          <Box sx={{ mb: 2 }}>
            <Button
              onClick={() => setSidebarOpen(true)}
              startIcon={<MenuIcon />}
              sx={{ color: "#3498db" }}
            >
              Menu
            </Button>
          </Box>
        )}
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

        {/* Tabs */}
        <Box sx={{ mb: 3, borderBottom: "1px solid rgba(15,23,42,0.1)" }}>
          <Tabs 
            value={tab}
            onChange={(_, newTab) => setTab(newTab as TabType)}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: 14,
                color: "rgba(15,23,42,0.6)",
                "&.Mui-selected": {
                  color: "#3498db",
                },
              },
            }}
          >
            <Tab label="Pending" value="pending" />
            <Tab label="Approved / Closed" value="approved" />
          </Tabs>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search by customer name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPageNumber(0);
            }}
            fullWidth
            size="small"
            sx={{
              backgroundColor: "white",
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#3498db" },
                "&.Mui-focused fieldset": { borderColor: "#3498db" },
              },
            }}
          />
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
          <>
            <AfterSalesListTable
              tickets={paginatedTickets}
              onViewDetail={handleViewDetail}
              isLoading={loading}
            />
            {/* Pagination */}
            {filteredTickets.length > 0 && (
              <TablePagination
                component="div"
                count={totalCount}
                page={pageNumber}
                onPageChange={(_, newPage) => setPageNumber(newPage)}
                rowsPerPage={pageSize}
                onRowsPerPageChange={(event) => {
                  setPageSize(parseInt(event.target.value, 10));
                  setPageNumber(0);
                }}
                sx={{ mt: 2 }}
              />
            )}
          </>
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
    </Box>
  );
}
