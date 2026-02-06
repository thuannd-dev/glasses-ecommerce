import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Visibility as VisibilityIcon, Download, Menu as MenuIcon } from "@mui/icons-material";
import Sidebar from "../manager copy/layout/Sidebar";

interface Order {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
  items: number;
}

const mockOrders: Order[] = [
  {
    id: "ord-001",
    orderId: "ORD-2026-001",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    totalAmount: 299.98,
    status: "Pending",
    createdAt: "2026-02-01T10:30:00Z",
    items: 2,
  },
  {
    id: "ord-002",
    orderId: "ORD-2026-002",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    totalAmount: 129.99,
    status: "Processing",
    createdAt: "2026-02-02T14:15:00Z",
    items: 1,
  },
  {
    id: "ord-003",
    orderId: "ORD-2026-003",
    customerName: "Mike Johnson",
    customerEmail: "mike@example.com",
    totalAmount: 449.97,
    status: "Shipped",
    createdAt: "2026-02-03T09:45:00Z",
    items: 3,
  },
  {
    id: "ord-004",
    orderId: "ORD-2026-004",
    customerName: "Sarah Williams",
    customerEmail: "sarah@example.com",
    totalAmount: 199.99,
    status: "Delivered",
    createdAt: "2026-02-04T11:20:00Z",
    items: 1,
  },
  {
    id: "ord-005",
    orderId: "ORD-2026-005",
    customerName: "Robert Brown",
    customerEmail: "robert@example.com",
    totalAmount: 79.99,
    status: "Cancelled",
    createdAt: "2026-02-05T16:00:00Z",
    items: 1,
  },
  {
    id: "ord-006",
    orderId: "ORD-2026-006",
    customerName: "Emily Davis",
    customerEmail: "emily@example.com",
    totalAmount: 359.98,
    status: "Processing",
    createdAt: "2026-02-05T09:00:00Z",
    items: 2,
  },
  {
    id: "ord-007",
    orderId: "ORD-2026-007",
    customerName: "Chris Wilson",
    customerEmail: "chris@example.com",
    totalAmount: 249.99,
    status: "Shipped",
    createdAt: "2026-02-05T14:30:00Z",
    items: 1,
  },
  {
    id: "ord-008",
    orderId: "ORD-2026-008",
    customerName: "Lisa Anderson",
    customerEmail: "lisa@example.com",
    totalAmount: 589.97,
    status: "Delivered",
    createdAt: "2026-02-04T08:15:00Z",
    items: 4,
  },
  {
    id: "ord-009",
    orderId: "ORD-2026-009",
    customerName: "David Martinez",
    customerEmail: "david@example.com",
    totalAmount: 169.99,
    status: "Pending",
    createdAt: "2026-02-05T17:45:00Z",
    items: 1,
  },
  {
    id: "ord-010",
    orderId: "ORD-2026-010",
    customerName: "Jennifer Taylor",
    customerEmail: "jennifer@example.com",
    totalAmount: 429.96,
    status: "Processing",
    createdAt: "2026-02-05T13:20:00Z",
    items: 3,
  },
  {
    id: "ord-011",
    orderId: "ORD-2026-011",
    customerName: "Kevin Thomas",
    customerEmail: "kevin@example.com",
    totalAmount: 219.98,
    status: "Shipped",
    createdAt: "2026-02-04T10:00:00Z",
    items: 2,
  },
  {
    id: "ord-012",
    orderId: "ORD-2026-012",
    customerName: "Michelle Garcia",
    customerEmail: "michelle@example.com",
    totalAmount: 329.99,
    status: "Delivered",
    createdAt: "2026-02-03T15:30:00Z",
    items: 2,
  },
  {
    id: "ord-013",
    orderId: "ORD-2026-013",
    customerName: "James Rodriguez",
    customerEmail: "james@example.com",
    totalAmount: 89.99,
    status: "Pending",
    createdAt: "2026-02-05T18:00:00Z",
    items: 1,
  },
  {
    id: "ord-014",
    orderId: "ORD-2026-014",
    customerName: "Amanda Clark",
    customerEmail: "amanda@example.com",
    totalAmount: 549.97,
    status: "Processing",
    createdAt: "2026-02-05T12:45:00Z",
    items: 3,
  },
  {
    id: "ord-015",
    orderId: "ORD-2026-015",
    customerName: "Daniel Lee",
    customerEmail: "daniel@example.com",
    totalAmount: 299.99,
    status: "Shipped",
    createdAt: "2026-02-04T16:20:00Z",
    items: 2,
  },
];

const STATUS_COLORS = {
  Pending: { bgcolor: "rgba(245,124,0,0.15)", color: "#e65100" },
  Processing: { bgcolor: "rgba(25,118,210,0.15)", color: "#1976d2" },
  Shipped: { bgcolor: "rgba(56,142,60,0.15)", color: "#388e3c" },
  Delivered: { bgcolor: "rgba(46,125,50,0.15)", color: "#2e7d32" },
  Cancelled: { bgcolor: "rgba(211,47,47,0.15)", color: "#d32f2f" },
};

const ITEMS_PER_PAGE = 10;

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const filteredData = useMemo(() => {
    return mockOrders.filter((order) => {
      const matchesSearch =
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedOrder(null);
  };

  const handleExport = () => {
    console.log("Exporting orders...");
  };

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
        <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
          Orders Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage all customer orders
        </Typography>
      </Box>

      {/* Filter Bar */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <TextField
            placeholder="Search by Order ID, Customer name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            variant="outlined"
            size="small"
            sx={{ flex: 1 }}
          />
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            variant="outlined"
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Processing">Processing</MenuItem>
            <MenuItem value="Shipped">Shipped</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
            sx={{ textTransform: "none" }}
          >
            Export
          </Button>
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
              <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Items
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Amount
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{order.orderId}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {order.customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.customerEmail}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">{order.items}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    ${order.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      size="small"
                      sx={{
                        ...STATUS_COLORS[order.status],
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
                      onClick={() => handleViewDetail(order)}
                      sx={{ textTransform: "none" }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No orders found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      {/* Results Info */}
      <Typography
        sx={{
          fontSize: 12,
          color: "text.secondary",
          mt: 2,
          textAlign: "center",
        }}
      >
        Showing {paginatedData.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to{" "}
        {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} results
      </Typography>

      {/* Order Detail Dialog */}
      <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Order ID
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedOrder.orderId}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Customer
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedOrder.customerName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedOrder.customerEmail}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ${selectedOrder.totalAmount.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={selectedOrder.status}
                    sx={{
                      ...STATUS_COLORS[selectedOrder.status],
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Items
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedOrder.items} item(s)
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body2">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Close</Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
}
