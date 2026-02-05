import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert
} from "@mui/material";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";

interface Order {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  totalAmount: number;
  totalItems: number;
  items: OrderItem[];
}

interface OrderItem {
  orderItemId: string;
  productName: string;
  variantName: string;
  requiredQuantity: number;
  availableStock: number;
}

const PickingListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter] = useState("Confirmed");

  // Fetch picking orders
  const { data: orders = [], isLoading, error } = useQuery<Order[]>({
    queryKey: ["picking-orders", statusFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (searchTerm) params.append("searchTerm", searchTerm);

      const response = await fetch(`/api/orders/picking/list?${params}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      const result = await response.json();
      return result.value || [];
    },
  });

  const handleViewOrder = (orderId: string) => {
    navigate(`/operations/picking/${orderId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        📦 Picking List
      </Typography>

      {/* Search and Filter */}
      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <TextField
          placeholder="Search by Order ID or Customer Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1 }}
          size="small"
        />
      </Box>

      {/* Error State */}
      {error && <Alert severity="error">Failed to load orders</Alert>}

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Orders Table */}
      {!isLoading && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Order Number</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Order Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Customer</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Total Items
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Total Amount
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.orderId} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {order.orderNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${order.totalItems} items`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      ${order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleViewOrder(order.orderId)}
                      >
                        Pick Items
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No orders available for picking
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PickingListPage;
