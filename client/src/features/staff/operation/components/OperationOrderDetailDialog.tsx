import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Card,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import { useGetOrderDetail, useSelectLensForPrescription } from "../../../../lib/orderApi";

interface OperationOrderDetailDialogProps {
  readonly orderId: string;
  readonly open: boolean;
  readonly onClose: () => void;
}

export default function OperationOrderDetailDialog({
  orderId,
  open,
  onClose,
}: Readonly<OperationOrderDetailDialogProps>) {
  const { data: orderDetail, isLoading } = useGetOrderDetail(orderId);
  const [selectedLensVariantId, setSelectedLensVariantId] = useState("");
  const [lensQuantity, setLensQuantity] = useState(1);
  const [showLensSelection, setShowLensSelection] = useState(false);

  const selectLensMutation = useSelectLensForPrescription();

  const handleSelectLens = async () => {
    if (!selectedLensVariantId) return;
    await selectLensMutation.mutateAsync({
      orderId,
      lensProductVariantId: selectedLensVariantId,
      quantity: lensQuantity,
    });
    setShowLensSelection(false);
    setSelectedLensVariantId("");
    setLensQuantity(1);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Order Details - {orderDetail?.orderNumber}</DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {!isLoading && !orderDetail && (
          <Typography>Order not found</Typography>
        )}
        {!isLoading && orderDetail && (
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Customer Info */}
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Customer Information
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Name</Typography>
                    <Typography variant="body2">{orderDetail.customerName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Email</Typography>
                    <Typography variant="body2">{orderDetail.customerEmail}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Phone</Typography>
                    <Typography variant="body2">{orderDetail.customerPhone}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Total Amount</Typography>
                    <Typography variant="body2">${orderDetail.totalAmount.toFixed(2)}</Typography>
                  </Box>
                </Box>
              </Stack>
            </Card>

            {/* Order Items */}
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Order Items
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderDetail.orderItems?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2">{item.productName}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {item.glassModel} - {item.lensType}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Prescription Info for Prescription Orders */}
            {orderDetail.orderType === "Prescription" && orderDetail.prescription && (
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Prescription Details
                </Typography>
                {orderDetail.prescription.details?.map((detail: any) => (
                  <Box key={detail.eye} sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {detail.eye} Eye
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, ml: 1 }}>
                      <Typography variant="caption">SPH: {detail.sph || "-"}</Typography>
                      <Typography variant="caption">CYL: {detail.cyl || "-"}</Typography>
                      <Typography variant="caption">AXIS: {detail.axis || "-"}</Typography>
                      <Typography variant="caption">PD: {detail.pd || "-"}</Typography>
                      <Typography variant="caption">ADD: {detail.add || "-"}</Typography>
                    </Box>
                  </Box>
                ))}

                {!showLensSelection && (
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => setShowLensSelection(true)}
                  >
                    Select Lens
                  </Button>
                )}

                {showLensSelection && (
                  <Box sx={{ p: 2, mt: 2, bgcolor: "#f9f9f9", borderRadius: 1 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Select lens type and quantity from inventory. This will update inventory and move order to "In Production".
                    </Alert>
                    <Stack spacing={2}>
                      <TextField
                        label="Lens Product Variant"
                        select
                        fullWidth
                        value={selectedLensVariantId}
                        onChange={(e) => setSelectedLensVariantId(e.target.value)}
                        slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
                        helperText="Select from available lens inventory"
                      >
                        <option value="">-- Select Lens --</option>
                        <option value="lens-1">UV Protection Lens (High Index)</option>
                        <option value="lens-2">Anti-glare Coating Lens</option>
                        <option value="lens-3">Ready Stock Lens</option>
                      </TextField>
                      <TextField
                        label="Quantity"
                        type="number"
                        fullWidth
                        value={lensQuantity}
                        onChange={(e) => setLensQuantity(Number.parseInt(e.target.value) || 1)}
                        slotProps={{ htmlInput: { min: 1 } }}
                      />
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          onClick={handleSelectLens}
                          disabled={!selectedLensVariantId || selectLensMutation.isPending}
                        >
                          {selectLensMutation.isPending ? "Saving..." : "Confirm Lens"}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => setShowLensSelection(false)}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                )}
              </Card>
            )}

            {/* Packing Info */}
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Packing Slip
              </Typography>
              <Box sx={{ bgcolor: "#f9f9f9", p: 2, borderRadius: 1, fontFamily: "monospace", fontSize: "0.85rem" }}>
                <Typography variant="caption">
                  <Box>Order: {orderDetail.orderNumber}</Box>
                  <Box>Customer: {orderDetail.customerName}</Box>
                  <Box>Items picked and ready to pack</Box>
                </Typography>
              </Box>
            </Card>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
