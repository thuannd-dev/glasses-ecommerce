import { useState } from "react";
import {
  Box,
  Card,
  Stack,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useGetOperationQueueOrders, useUpdateOrderStatus } from "../../../../lib/orderApi";
import OperationOrderDetailDialog from "./OperationOrderDetailDialog";

interface FilterState {
  email: string;
  type: string;
  fromDate: string;
  toDate: string;
}

function getTypeColor(type: string): "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success" {
  switch (type) {
    case "ReadyStock":
      return "primary";
    case "PreOrder":
      return "warning";
    case "Prescription":
      return "info";
    default:
      return "default";
  }
}

export default function OrderQueue() {
  const [filters, setFilters] = useState<FilterState>({
    email: "",
    type: "",
    fromDate: "",
    toDate: "",
  });

  const [pageNumber, setPageNumber] = useState(1);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [openStatusUpdate, setOpenStatusUpdate] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("Packed");

  const { data: ordersData, isLoading } = useGetOperationQueueOrders(pageNumber, 10, "Confirmed", {
    customerEmail: filters.email,
    type: filters.type || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
  });

  const updateStatusMutation = useUpdateOrderStatus();

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPageNumber(1);
  };

  const handleOrderRowClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setOpenDetail(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrderForStatus) return;
    await updateStatusMutation.mutateAsync({
      orderId: selectedOrderForStatus,
      newStatus: newStatus,
    });
    setOpenStatusUpdate(false);
    setSelectedOrderForStatus(null);
  };

  const clearFilters = () => {
    setFilters({
      email: "",
      type: "",
      fromDate: "",
      toDate: "",
    });
    setPageNumber(1);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          <Stack
            spacing={2}
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 2,
            }}
          >
            <TextField
              label="Customer Email"
              size="small"
              fullWidth
              value={filters.email}
              onChange={(e) => handleFilterChange("email", e.target.value)}
              placeholder="Search by email"
            />
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
          </Stack>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={clearFilters}
          >
            CLEAR FILTERS
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
                  <TableCell>Type</TableCell>
                  <TableCell>Customer Email</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ordersData?.items?.map((order: any) => (
                  <TableRow
                    key={order.id}
                    hover
                    onClick={() => handleOrderRowClick(order.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.orderType}
                        color={getTypeColor(order.orderType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{order.customerEmail}</TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderRowClick(order.id);
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrderForStatus(order.id);
                            setOpenStatusUpdate(true);
                          }}
                        >
                          Update Status
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {selectedOrderId && (
            <OperationOrderDetailDialog
              orderId={selectedOrderId}
              open={openDetail}
              onClose={() => {
                setOpenDetail(false);
                setSelectedOrderId(null);
              }}
            />
          )}

          <Dialog open={openStatusUpdate} onClose={() => setOpenStatusUpdate(false)} maxWidth="xs" fullWidth>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <TextField
                  label="New Status"
                  select
                  fullWidth
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
                >
                  <option value="Packed">Packed</option>
                  <option value="HandedOverToCarrier">Handed Over to Shipping Carrier</option>
                </TextField>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenStatusUpdate(false)}>Cancel</Button>
              <Button
                onClick={handleStatusUpdate}
                variant="contained"
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}
