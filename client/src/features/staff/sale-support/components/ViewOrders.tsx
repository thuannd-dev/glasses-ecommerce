import { useState } from "react";
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Stack,
  Chip,
  CircularProgress,
  Pagination,
} from "@mui/material";
import { useGetOrders } from "../../../../lib/orderApi";
import OrderDetailDialog from "./OrderDetailDialog";

interface OrderFilters {
  customerEmail: string;
  status: string;
  type: string;
  source: string;
  fromDate: string;
  toDate: string;
}

export default function ViewOrders() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState<OrderFilters>({
    customerEmail: "",
    status: "",
    type: "",
    source: "",
    fromDate: "",
    toDate: "",
  });
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const { data, isLoading, error } = useGetOrders(pageNumber, pageSize, {
    customerEmail: filters.customerEmail || undefined,
    status: filters.status || undefined,
    type: filters.type || undefined,
    source: filters.source || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
  });

  const handleFilterChange = (field: keyof OrderFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPageNumber(1);
  };

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setOpenDetail(true);
  };

  const getStatusColor = (status: string): any => {
    const statusMap: Record<string, any> = {
      Pending: "warning",
      Confirmed: "info",
      Processing: "primary",
      Shipped: "info",
      Delivered: "success",
      Completed: "success",
      Cancelled: "error",
      Refunded: "error",
    };
    return statusMap[status] || "default";
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      ReadyStock: "Ready Stock",
      PreOrder: "Pre Order",
      Prescription: "Prescription",
    };
    return typeMap[type] || type;
  };

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Card sx={{ p: 2, bgcolor: "#ffebee" }}>
          Error loading orders: {error.message}
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
            <TextField
              label="Customer Email"
              size="small"
              fullWidth
              value={filters.customerEmail}
              onChange={(e) => handleFilterChange("customerEmail", e.target.value)}
              placeholder="Search by email..."
            />
            <TextField
              label="Order Status"
              select
              size="small"
              fullWidth
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Refunded">Refunded</option>
            </TextField>
            <TextField
              label="Order Type"
              select
              size="small"
              fullWidth
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
            >
              <option value="">All Types</option>
              <option value="ReadyStock">Ready Stock</option>
              <option value="PreOrder">Pre Order</option>
              <option value="Prescription">Prescription</option>
            </TextField>
            <TextField
              label="Order Source"
              select
              size="small"
              fullWidth
              value={filters.source}
              onChange={(e) => handleFilterChange("source", e.target.value)}
              slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
            >
              <option value="">All Sources</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </TextField>
            <TextField
              label="From Date"
              type="date"
              size="small"
              fullWidth
              value={filters.fromDate}
              onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="To Date"
              type="date"
              size="small"
              fullWidth
              value={filters.toDate}
              onChange={(e) => handleFilterChange("toDate", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
          <Button
            variant="outlined"
            onClick={() =>
              setFilters({
                customerEmail: "",
                status: "",
                type: "",
                source: "",
                fromDate: "",
                toDate: "",
              })
            }
          >
            Clear Filters
          </Button>
        </Stack>
      </Card>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Customer Email</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Items</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.items && data.items.length > 0 ? (
                  data.items.map((order: any) => (
                    <TableRow key={order.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{order.orderNumber}</TableCell>
                      <TableCell>{order.customerEmail}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell align="right">${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{getTypeLabel(order.orderType)}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.orderStatus}
                          size="small"
                          color={getStatusColor(order.orderStatus)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">{order.itemCount}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(order.id)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {data && data.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={data.totalPages}
                page={pageNumber}
                onChange={(_, page) => setPageNumber(page)}
              />
            </Box>
          )}
        </>
      )}

      {selectedOrderId && (
        <OrderDetailDialog
          orderId={selectedOrderId}
          open={openDetail}
          onClose={() => {
            setOpenDetail(false);
            setSelectedOrderId(null);
          }}
        />
      )}
    </Box>
  );
}
