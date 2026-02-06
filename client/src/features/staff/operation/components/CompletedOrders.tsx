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
  TablePagination,
  Button,
  Chip,
  CircularProgress,
  Stack,
  TextField,
} from "@mui/material";
import { useGetCompletedOrders } from "../../../../lib/orderApi";
import OperationOrderDetailDialog from "./OperationOrderDetailDialog";

export default function CompletedOrders() {
  const [pageNumber, setPageNumber] = useState(1);
  const [filters, setFilters] = useState({
    email: "",
    type: "",
    fromDate: "",
    toDate: "",
  });
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: ordersData, isLoading } = useGetCompletedOrders(pageNumber, 10, {
    customerEmail: filters.email || undefined,
    type: filters.type || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
  });

  const handleClearFilters = () => {
    setFilters({ email: "", type: "", fromDate: "", toDate: "" });
    setPageNumber(1);
  };

  const statusColorMap: Record<string, "success" | "error" | "warning" | "info" | "primary"> = {
    Completed: "success",
    Delivered: "success",
    Cancelled: "error",
    Refunded: "warning",
  };

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Filter Bar */}
      <Card sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
            <TextField
              label="Customer Email"
              size="small"
              fullWidth
              value={filters.email}
              onChange={(e) => {
                setFilters({ ...filters, email: e.target.value });
                setPageNumber(1);
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Order Type"
              select
              size="small"
              fullWidth
              value={filters.type}
              onChange={(e) => {
                setFilters({ ...filters, type: e.target.value });
                setPageNumber(1);
              }}
              slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
            >
              <option value="">All Types</option>
              <option value="ReadyStock">Ready Stock</option>
              <option value="Prescription">Prescription</option>
              <option value="PreOrder">Pre Order</option>
            </TextField>
            <TextField
              label="From Date"
              type="date"
              size="small"
              fullWidth
              value={filters.fromDate}
              onChange={(e) => {
                setFilters({ ...filters, fromDate: e.target.value });
                setPageNumber(1);
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="To Date"
              type="date"
              size="small"
              fullWidth
              value={filters.toDate}
              onChange={(e) => {
                setFilters({ ...filters, toDate: e.target.value });
                setPageNumber(1);
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
          <Button variant="outlined" size="small" onClick={handleClearFilters} sx={{ alignSelf: "flex-end" }}>
            Clear Filters
          </Button>
        </Stack>
      </Card>

      {/* Orders Table */}
      <TableContainer component={Card}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>Order Number</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Customer Email</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordersData?.items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell sx={{ fontWeight: 500 }}>{order.orderNumber}</TableCell>
                  <TableCell>{order.orderType}</TableCell>
                  <TableCell>{order.customerEmail}</TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.orderStatus}
                      size="small"
                      color={statusColorMap[order.orderStatus] || "default"}
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSelectedOrder(order.id);
                        setDetailOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {ordersData?.items.length === 0 && !isLoading && (
          <Box sx={{ p: 2, textAlign: "center" }}>No completed orders</Box>
        )}
      </TableContainer>

      {/* Pagination */}
      {ordersData && (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            Total: {ordersData.totalCount} orders | Page {ordersData.pageNumber} of {ordersData.totalPages}
          </Box>
          <TablePagination
            component="div"
            count={ordersData.totalCount}
            page={pageNumber - 1}
            onPageChange={(_, newPage) => setPageNumber(newPage + 1)}
            rowsPerPage={10}
            rowsPerPageOptions={[10]}
          />
        </Box>
      )}

      {/* Detail Dialog */}
      {selectedOrder && (
        <OperationOrderDetailDialog
          orderId={selectedOrder}
          open={detailOpen}
          onClose={() => {
            setDetailOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </Box>
  );
}
