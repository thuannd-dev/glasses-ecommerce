import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Card,
  TextField,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import { useGetOrderDetail, useUpdateOrder, useConfirmOrder } from "../../../../lib/orderApi";

interface OrderDetailDialogProps {
  readonly orderId: string;
  readonly open: boolean;
  readonly onClose: () => void;
}

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

function getOrderTypeLabel(orderType: string): string {
  if (orderType === "Prescription") return "Prescription";
  if (orderType === "PreOrder") return "Pre-Order";
  return "Ready Stock";
}

function getEyeLabel(eye: string): string {
  if (eye === "Left") return "Left Eye";
  if (eye === "Right") return "Right Eye";
  return "Unknown";
}

function CustomerInfoPanel({ orderDetail }: { readonly orderDetail: any }) {
  return (
    <Stack spacing={2}>
      <TextField
        label="Customer Name"
        fullWidth
        value={orderDetail.customerName}
        disabled
      />
      <TextField
        label="Customer Email"
        fullWidth
        value={orderDetail.customerEmail}
        disabled
      />
      <TextField
        label="Customer Phone"
        fullWidth
        value={orderDetail.customerPhone}
        disabled
      />
      <Divider />
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Shipping Address
      </Typography>
      <TextField
        label="Recipient Name"
        fullWidth
        value={orderDetail.shippingAddress.recipientName}
        disabled
        size="small"
      />
      <TextField
        label="Address"
        fullWidth
        value={`${orderDetail.shippingAddress.venue}, ${orderDetail.shippingAddress.ward}, ${orderDetail.shippingAddress.district}, ${orderDetail.shippingAddress.city}`}
        disabled
        size="small"
        multiline
        rows={2}
      />
    </Stack>
  );
}

function OrderItemsPanel({
  orderDetail,
  editMode,
  editData,
  onQuantityChange,
}: Readonly<{
  orderDetail: any;
  editMode: boolean;
  editData: any;
  onQuantityChange: (id: string, qty: number) => void;
}>) {
  return (
    <Stack spacing={2}>
      {editMode ? (
        editData?.orderItems?.map((item: any, idx: number) => (
          <Card key={`order-item-edit-${item.orderItemId}`} sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {orderDetail.orderItems[idx]?.productName}
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Glasses Model"
                fullWidth
                value={orderDetail.orderItems[idx]?.glassModel}
                disabled
                size="small"
              />
              <TextField
                label="Lens Type"
                fullWidth
                value={orderDetail.orderItems[idx]?.lensType}
                disabled
                size="small"
              />
              <TextField
                label="Unit Price"
                fullWidth
                type="number"
                value={orderDetail.orderItems[idx]?.unitPrice}
                disabled
                size="small"
              />
              <TextField
                label="Quantity"
                fullWidth
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  onQuantityChange(
                    item.orderItemId,
                    Number.parseInt(e.target.value) || 1
                  )
                }
                size="small"
                slotProps={{ htmlInput: { min: 1 } }}
              />
            </Box>
          </Card>
        ))
      ) : (
        orderDetail.orderItems.map((item: any) => (
          <Card key={`order-item-view-${item.orderItemId}`} sx={{ p: 2 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1 }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>
                  {item.productName}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Glasses Model: {item.glassModel}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Lens Type: {item.lensType}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Qty: {item.quantity}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Unit Price: ${item.unitPrice.toFixed(2)}
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                ${item.totalPrice.toFixed(2)}
              </Typography>
            </Box>
          </Card>
        ))
      )}
    </Stack>
  );
}

function PrescriptionPanel({
  orderDetail,
  editMode,
  editData,
  onDetailChange,
}: Readonly<{
  orderDetail: any;
  editMode: boolean;
  editData: any;
  onDetailChange: (idx: number, field: string, value: any) => void;
}>) {
  return (
    <Stack spacing={2}>
      {editMode ? (
        editData?.prescription?.details?.map((detail: any, idx: number) => (
          <Card key={`prescription-edit-${detail.eye}`} sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {getEyeLabel(detail.eye)}
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
              <TextField
                label="SPH"
                type="number"
                value={detail.sph || ""}
                onChange={(e) =>
                  onDetailChange(
                    idx,
                    "sph",
                    e.target.value ? Number.parseFloat(e.target.value) : null
                  )
                }
                size="small"
                fullWidth
                slotProps={{ htmlInput: { step: "0.25" } }}
              />
              <TextField
                label="CYL"
                type="number"
                value={detail.cyl || ""}
                onChange={(e) =>
                  onDetailChange(
                    idx,
                    "cyl",
                    e.target.value ? Number.parseFloat(e.target.value) : null
                  )
                }
                size="small"
                fullWidth
                slotProps={{ htmlInput: { step: "0.25" } }}
              />
              <TextField
                label="AXIS"
                type="number"
                value={detail.axis || ""}
                onChange={(e) =>
                  onDetailChange(
                    idx,
                    "axis",
                    e.target.value ? Number.parseInt(e.target.value) : null
                  )
                }
                size="small"
                fullWidth
              />
              <TextField
                label="PD"
                type="number"
                value={detail.pd || ""}
                onChange={(e) =>
                  onDetailChange(
                    idx,
                    "pd",
                    e.target.value ? Number.parseFloat(e.target.value) : null
                  )
                }
                size="small"
                fullWidth
                slotProps={{ htmlInput: { step: "0.5" } }}
              />
              <TextField
                label="ADD"
                type="number"
                value={detail.add || ""}
                onChange={(e) =>
                  onDetailChange(
                    idx,
                    "add",
                    e.target.value ? Number.parseFloat(e.target.value) : null
                  )
                }
                size="small"
                fullWidth
                slotProps={{ htmlInput: { step: "0.25" } }}
              />
            </Box>
          </Card>
        ))
      ) : (
        orderDetail.prescription.details.map((detail: any) => (
          <Card key={`prescription-view-${detail.eye}`} sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {getEyeLabel(detail.eye)}
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 1 }}>
              <Typography variant="body2">SPH: {detail.sph || "-"}</Typography>
              <Typography variant="body2">CYL: {detail.cyl || "-"}</Typography>
              <Typography variant="body2">AXIS: {detail.axis || "-"}</Typography>
              <Typography variant="body2">PD: {detail.pd || "-"}</Typography>
              <Typography variant="body2">ADD: {detail.add || "-"}</Typography>
            </Box>
          </Card>
        ))
      )}
    </Stack>
  );
}

export default function OrderDetailDialog({
  orderId,
  open,
  onClose,
}: Readonly<OrderDetailDialogProps>) {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const { data: orderDetail, isLoading } = useGetOrderDetail(orderId);
  const updateOrderMutation = useUpdateOrder();
  const confirmOrderMutation = useConfirmOrder();

  if (!open) return null;

  const handleSaveChanges = async () => {
    if (editData) {
      await updateOrderMutation.mutateAsync({
        orderId,
        data: editData,
      });
      setEditMode(false);
    }
  };

  const handleEditModeToggle = () => {
    if (!editMode) {
      // Initialize editData when entering edit mode
      setEditData({
        orderItems: orderDetail.orderItems.map((item: any) => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
        })),
        prescription: orderDetail.prescription
          ? {
              details: orderDetail.prescription.details.map((d: any) => ({
                eye: d.eye,
                sph: d.sph,
                cyl: d.cyl,
                axis: d.axis,
                pd: d.pd,
                add: d.add,
              })),
            }
          : null,
      });
    }
    setEditMode(!editMode);
  };

  const handleConfirmOrder = async () => {
    if (
      globalThis.confirm(
        "Confirm this order? It will be queued to the Operation tab."
      )
    ) {
      await confirmOrderMutation.mutateAsync(orderId);
      onClose();
    }
  };

  const handleQuantityChange = (orderItemId: string, newQuantity: number) => {
    if (editData) {
      setEditData((prev: any) => ({
        ...prev,
        orderItems: prev.orderItems.map((item: any) =>
          item.orderItemId === orderItemId
            ? { ...item, quantity: newQuantity }
            : item
        ),
      }));
    }
  };

  const handlePrescriptionDetailChange = (
    index: number,
    field: string,
    value: any
  ) => {
    if (editData?.prescription) {
      setEditData((prev: any) => ({
        ...prev,
        prescription: {
          ...prev.prescription,
          details: prev.prescription.details.map((d: any, i: number) =>
            i === index ? { ...d, [field]: value } : d
          ),
        },
      }));
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!orderDetail) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          <Typography>Order not found</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Order Details</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Header Info */}
          <Card sx={{ p: 2, mb: 2, bgcolor: "#f9f9f9" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Order Number
                </Typography>
                <Typography variant="h6">{orderDetail.orderNumber}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Total Amount
                </Typography>
                <Typography variant="h6">
                  ${orderDetail.totalAmount.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Order Type
                </Typography>
                <Typography>
                  {orderDetail.orderType === "Prescription"
                    ? "Prescription"
                    : getOrderTypeLabel(orderDetail.orderType)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Status
                </Typography>
                <Typography>{orderDetail.orderStatus}</Typography>
              </Box>
            </Box>
          </Card>

          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="Customer Info" />
            <Tab label="Order Items" />
            {orderDetail.prescription && <Tab label="Prescription" />}
          </Tabs>

          {/* Customer Info */}
          <TabPanel value={tabValue} index={0}>
            <CustomerInfoPanel orderDetail={orderDetail} />
          </TabPanel>

          {/* Order Items */}
          <TabPanel value={tabValue} index={1}>
            <OrderItemsPanel
              orderDetail={orderDetail}
              editMode={editMode}
              editData={editData}
              onQuantityChange={handleQuantityChange}
            />
          </TabPanel>

          {/* Prescription */}
          {orderDetail.prescription && (
            <TabPanel value={tabValue} index={2}>
              <PrescriptionPanel
                orderDetail={orderDetail}
                editMode={editMode}
                editData={editData}
                onDetailChange={handlePrescriptionDetailChange}
              />
            </TabPanel>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {editMode ? (
          <>
            <Button onClick={() => setEditMode(false)}>Cancel</Button>
            <Button
              onClick={handleSaveChanges}
              variant="contained"
              color="primary"
              disabled={updateOrderMutation.isPending}
            >
              {updateOrderMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose}>Close</Button>
            {orderDetail?.orderStatus === "Pending" && (
              <>
                <Button onClick={handleEditModeToggle} variant="outlined">
                  Edit Order
                </Button>
                <Button
                  onClick={handleConfirmOrder}
                  variant="contained"
                  color="success"
                  disabled={confirmOrderMutation.isPending}
                >
                  {confirmOrderMutation.isPending ? "Confirming..." : "Confirm Order"}
                </Button>
              </>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
