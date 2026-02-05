import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface OrderPickItem {
  orderItemId: string;
  productVariantId: string;
  productName: string;
  variantName: string;
  requiredQuantity: number;
  availableStock: number;
  pickedQuantity: number;
  notes?: string;
}

interface OrderPickingDetail {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  totalAmount: number;
  totalItems: number;
  items: OrderPickItem[];
}

const PickingDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [pickedItems, setPickedItems] = useState<Record<string, number>>({});
  const [openPackDialog, setOpenPackDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch order details for picking
  const { data: order, isLoading, error } = useQuery<OrderPickingDetail>({
    queryKey: ["order-picking", orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/picking/${orderId}`);
      if (!response.ok) throw new Error("Failed to fetch order");
      const result = await response.json();
      return result.value;
    },
    enabled: !!orderId,
  });

  // Update picked quantity
  const handlePickedQuantityChange = (itemId: string, quantity: number) => {
    setPickedItems((prev) => ({
      ...prev,
      [itemId]: Math.max(0, quantity),
    }));
  };

  // Validate picking
  const validatePicking = (): boolean => {
    if (!order?.items) return false;

    for (const item of order.items) {
      const picked = pickedItems[item.orderItemId] || 0;
      if (picked === 0) {
        toast.error(`Please enter picked quantity for ${item.productName}`);
        return false;
      }
      if (picked > item.requiredQuantity) {
        toast.error(
          `Picked quantity cannot exceed required quantity for ${item.productName}`
        );
        return false;
      }
    }
    return true;
  };

  // Mark as packed
  const markAsPacked = async () => {
    if (!validatePicking()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/mark-packed`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: "Order picked and ready for packing",
        }),
      });

      if (!response.ok) throw new Error("Failed to mark order as packed");

      toast.success("Order marked as packed!");
      setOpenPackDialog(false);
      navigate("/operations/packing-slip/" + orderId);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to mark order as packed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return <Alert severity="error">Failed to load order details</Alert>;
  }

  const allItemsPicked = order.items.every(
    (item) => (pickedItems[item.orderItemId] || 0) > 0
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        ✓ Picking Details
      </Typography>

      {/* Order Header */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Order Number
              </Typography>
              <Typography variant="h6">{order.orderNumber}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Customer
              </Typography>
              <Typography variant="h6">{order.customerName}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Items
              </Typography>
              <Typography variant="h6">{order.totalItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h6">${order.totalAmount.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Items Table */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Product</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Variant</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Required
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Available Stock
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Picked
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.items.map((item) => {
              const picked = pickedItems[item.orderItemId] || 0;
              const isComplete = picked === item.requiredQuantity;
              const isOver = picked > item.requiredQuantity;

              return (
                <TableRow key={item.orderItemId}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.variantName}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={item.requiredQuantity}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {item.availableStock >= item.requiredQuantity ? (
                      <Chip
                        label={item.availableStock}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        label={item.availableStock}
                        size="small"
                        color="warning"
                        variant="filled"
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="number"
                      inputProps={{ min: 0, max: item.requiredQuantity }}
                      value={picked}
                      onChange={(e) =>
                        handlePickedQuantityChange(
                          item.orderItemId,
                          parseInt(e.target.value) || 0
                        )
                      }
                      sx={{ width: 80 }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {isOver ? (
                      <Chip label="Over" size="small" color="error" />
                    ) : isComplete ? (
                      <Chip label="✓ Complete" size="small" color="success" />
                    ) : (
                      <Chip label="Incomplete" size="small" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/operations/picking")}
        >
          Back to List
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => setOpenPackDialog(true)}
          disabled={!allItemsPicked}
        >
          Confirm Picking & Go to Packing
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={openPackDialog} onClose={() => setOpenPackDialog(false)}>
        <DialogTitle>Confirm Picking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure all items have been correctly picked? This action will
            mark the order as ready for packing.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPackDialog(false)}>Cancel</Button>
          <Button
            onClick={markAsPacked}
            color="success"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Confirming..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PickingDetailPage;
