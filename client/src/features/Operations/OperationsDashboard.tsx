import { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Collapse,
} from "@mui/material";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";

import { useAccount } from "../../lib/hooks/useAccount";
import {
  useOperationsOrders,
  useOperationsShipments,
  useUpdateOrderStatus,
  useCreateShipment,
  useUpdateTracking,
} from "../../lib/hooks/useOperationsOrders";
import type { OrderDto, OrderType, OrderStatus, ShipmentDto } from "./types";

const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  standard: "Thường",
  "pre-order": "Pre-order",
  prescription: "Prescription",
};

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  ready_to_ship: "Sẵn sàng gửi",
  shipped: "Đã gửi",
  delivered: "Đã giao",
  received: "Đã nhận kho",
  lens_ordered: "Đã đặt tròng",
  lens_fitting: "Đang lắp tròng",
  cancelled: "Đã hủy",
};

const SHIPMENT_STATUS_LABEL: Record<ShipmentDto["status"], string> = {
  created: "Đã tạo",
  picked: "Đã lấy hàng",
  in_transit: "Đang giao",
  delivered: "Đã giao",
};

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

export default function OperationsDashboard() {
  const { currentUser } = useAccount();
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderType | "all">("all");
  const [createShipOrderId, setCreateShipOrderId] = useState<string | null>(null);
  const [createShipCarrier, setCreateShipCarrier] = useState("GHN");
  const [createShipTracking, setCreateShipTracking] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [trackingShipId, setTrackingShipId] = useState<string | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<ShipmentDto["status"]>("in_transit");

  const { data: orders = [], isLoading: ordersLoading } = useOperationsOrders(
    orderTypeFilter === "all" ? undefined : { orderType: orderTypeFilter }
  );
  const { data: shipments = [], isLoading: shipmentsLoading } = useOperationsShipments();
  const updateStatus = useUpdateOrderStatus();
  const createShipment = useCreateShipment();
  const updateTracking = useUpdateTracking();

  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "ready_to_ship" || o.status === "processing").length;
  const shippedCount = orders.filter((o) => o.status === "shipped" || o.status === "delivered").length;
  const inTransitCount = shipments.filter((s) => s.status === "in_transit" || s.status === "picked").length;

  const handleCreateShipment = () => {
    if (!createShipOrderId || !createShipTracking.trim()) return;
    createShipment.mutate(
      { orderId: createShipOrderId, carrier: createShipCarrier, trackingNumber: createShipTracking.trim() },
      {
        onSuccess: () => {
          setCreateShipOrderId(null);
          setCreateShipTracking("");
        },
      }
    );
  };

  const handleUpdateTracking = (shipmentId: string) => {
    updateTracking.mutate(
      { shipmentId, status: trackingStatus },
      { onSuccess: () => setTrackingShipId(null) }
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 6, lg: 10 },
        py: 6,
        bgcolor: "#fafafa",
        color: "rgba(0,0,0,0.87)",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography sx={{ fontSize: 12, letterSpacing: 6, textTransform: "uppercase", color: "text.secondary" }}>
          Operations Center
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 30, fontWeight: 900 }} color="text.primary">
          Hello{currentUser?.displayName ? `, ${currentUser.displayName}` : ""}.
        </Typography>
        <Typography sx={{ mt: 1, color: "text.secondary", maxWidth: 520, fontSize: 14 }}>
          Đóng gói, tạo vận đơn, cập nhật tracking. Xử lý đơn pre-order và prescription.
        </Typography>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography fontSize={13} color="text.secondary">
              Đơn cần xử lý
            </Typography>
            <Typography fontSize={26} fontWeight={900} mt={1} color="text.primary">
              {ordersLoading ? "—" : pendingOrders}
            </Typography>
            <Typography fontSize={12} color="text.secondary" mt={1.5}>
              Chờ đóng gói / sẵn sàng gửi / đang gia công
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography fontSize={13} color="text.secondary">
              Đơn đã gửi
            </Typography>
            <Typography fontSize={26} fontWeight={900} mt={1} color="text.primary">
              {ordersLoading ? "—" : shippedCount}
            </Typography>
            <Typography fontSize={12} color="text.secondary" mt={1}>
              Đã tạo vận đơn và gửi hàng
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography fontSize={13} color="text.secondary">
              Đang vận chuyển
            </Typography>
            <Typography fontSize={26} fontWeight={900} mt={1} color="text.primary">
              {shipmentsLoading ? "—" : inTransitCount}
            </Typography>
            <Typography fontSize={12} color="text.secondary" mt={1}>
              Vận đơn đang trên đường giao
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Orders list */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 3,
          bgcolor: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <AssignmentOutlined sx={{ color: "text.secondary" }} />
          <Typography fontSize={16} fontWeight={800} color="text.primary">
            Đơn hàng
          </Typography>
        </Box>
        <Tabs
          value={orderTypeFilter}
          onChange={(_, v) => setOrderTypeFilter(v)}
          sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
        >
          <Tab label="Tất cả" value="all" />
          <Tab label="Thường" value="standard" />
          <Tab label="Pre-order" value="pre-order" />
          <Tab label="Prescription" value="prescription" />
        </Tabs>
        {ordersLoading ? (
          <LinearProgress sx={{ borderRadius: 1 }} />
        ) : orders.length === 0 ? (
          <Typography color="text.secondary">Chưa có đơn nào.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                expanded={expandedOrderId === order.id}
                onToggleExpand={() => setExpandedOrderId((id) => (id === order.id ? null : order.id))}
                onUpdateStatus={(status) => updateStatus.mutate({ orderId: order.id, status })}
                onCreateShipment={() => setCreateShipOrderId(order.id)}
                canCreateShipment={order.status === "ready_to_ship" && !order.shipmentId}
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Shipments list */}
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 3,
          borderRadius: 3,
          bgcolor: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <LocalShippingOutlined sx={{ color: "text.secondary" }} />
          <Typography fontSize={16} fontWeight={800} color="text.primary">
            Vận đơn
          </Typography>
        </Box>
        {shipmentsLoading ? (
          <LinearProgress sx={{ borderRadius: 1 }} />
        ) : shipments.length === 0 ? (
          <Typography color="text.secondary">Chưa có vận đơn nào.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {shipments.map((ship) => (
              <ShipmentCard
                key={ship.id}
                shipment={ship}
                onUpdateTracking={() => setTrackingShipId(ship.id)}
                isUpdating={trackingShipId === ship.id}
                trackingStatus={trackingStatus}
                setTrackingStatus={setTrackingStatus}
                onConfirmTracking={() => handleUpdateTracking(ship.id)}
                onCloseTracking={() => setTrackingShipId(null)}
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Dialog: Tạo vận đơn */}
      <Dialog open={!!createShipOrderId} onClose={() => setCreateShipOrderId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo vận đơn</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Đơn vị vận chuyển"
            value={createShipCarrier}
            onChange={(e) => setCreateShipCarrier(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            label="Mã tracking"
            value={createShipTracking}
            onChange={(e) => setCreateShipTracking(e.target.value)}
            placeholder="VD: VN123456789"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateShipOrderId(null)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleCreateShipment}
            disabled={!createShipTracking.trim() || createShipment.isPending}
          >
            {createShipment.isPending ? "Đang tạo…" : "Tạo vận đơn"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function OrderCard({
  order,
  expanded,
  onToggleExpand,
  onUpdateStatus,
  onCreateShipment,
  canCreateShipment,
}: {
  order: OrderDto;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdateStatus: (status: OrderStatus) => void;
  onCreateShipment: () => void;
  canCreateShipment: boolean;
}) {
  const statusLabel = ORDER_STATUS_LABEL[order.status];
  const typeLabel = ORDER_TYPE_LABEL[order.orderType];

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          cursor: "pointer",
        }}
        onClick={onToggleExpand}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography fontWeight={800} fontSize={14}>
            {order.orderNumber}
          </Typography>
          <Chip label={typeLabel} size="small" sx={{ fontWeight: 600 }} />
          <Chip
            label={statusLabel}
            size="small"
            sx={{
              bgcolor: order.status === "shipped" || order.status === "delivered" ? "rgba(46,125,50,0.12)" : "rgba(25,118,210,0.12)",
              color: order.status === "shipped" || order.status === "delivered" ? "#2e7d32" : "#1976d2",
              fontWeight: 600,
            }}
          />
          {order.trackingNumber && (
            <Typography fontSize={12} color="text.secondary">
              {order.carrier} · {order.trackingNumber}
            </Typography>
          )}
        </Box>
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <Typography fontSize={12} color="text.secondary">
            {order.customerName} · {order.customerEmail}
          </Typography>
          <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5 }}>
            {order.shippingAddress}
          </Typography>
          <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5 }}>
            {formatDate(order.createdAt)} · {order.items.length} SP · {order.totalAmount.toLocaleString("vi-VN")}₫
          </Typography>
          {order.orderType === "pre-order" && order.expectedStockDate && (
            <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5 }}>
              Dự kiến có hàng: {order.expectedStockDate}
            </Typography>
          )}
          {order.orderType === "prescription" && order.prescriptionStatus && (
            <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5 }}>
              Gia công: {order.prescriptionStatus}
            </Typography>
          )}
          <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {order.status === "pending" && (
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onUpdateStatus("confirmed"); }}>
                Xác nhận
              </Button>
            )}
            {(order.status === "confirmed" || order.status === "pending") && (
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onUpdateStatus("processing"); }}>
                Đang xử lý
              </Button>
            )}
            {order.status === "processing" && (
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onUpdateStatus("ready_to_ship"); }}>
                Sẵn sàng gửi
              </Button>
            )}
            {order.orderType === "pre-order" && order.status === "pending" && (
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onUpdateStatus("received"); }}>
                Đã nhận hàng kho
              </Button>
            )}
            {order.orderType === "prescription" && order.status === "processing" && (
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onUpdateStatus("lens_fitting"); }}>
                Đang lắp tròng
              </Button>
            )}
            {canCreateShipment && (
              <Button size="small" variant="contained" onClick={(e) => { e.stopPropagation(); onCreateShipment(); }}>
                Tạo vận đơn
              </Button>
            )}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}

function ShipmentCard({
  shipment,
  onUpdateTracking,
  isUpdating,
  trackingStatus,
  setTrackingStatus,
  onConfirmTracking,
  onCloseTracking,
}: {
  shipment: ShipmentDto;
  onUpdateTracking: () => void;
  isUpdating: boolean;
  trackingStatus: ShipmentDto["status"];
  setTrackingStatus: (s: ShipmentDto["status"]) => void;
  onConfirmTracking: () => void;
  onCloseTracking: () => void;
}) {
  const statusLabel = SHIPMENT_STATUS_LABEL[shipment.status];
  const events = shipment.trackingEvents ?? [];

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <Box>
          <Typography fontWeight={800} fontSize={14}>
            {shipment.orderNumber}
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            {shipment.carrier} · {shipment.trackingNumber}
          </Typography>
          <Chip
            label={statusLabel}
            size="small"
            sx={{
              mt: 0.5,
              bgcolor: shipment.status === "delivered" ? "rgba(46,125,50,0.12)" : "rgba(25,118,210,0.12)",
              color: shipment.status === "delivered" ? "#2e7d32" : "#1976d2",
              fontWeight: 600,
            }}
          />
        </Box>
        {shipment.status !== "delivered" && (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {!isUpdating ? (
              <Button size="small" variant="outlined" onClick={onUpdateTracking}>
                Cập nhật tracking
              </Button>
            ) : (
              <>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={trackingStatus}
                    label="Trạng thái"
                    onChange={(e) => setTrackingStatus(e.target.value as ShipmentDto["status"])}
                  >
                    <MenuItem value="picked">Đã lấy hàng</MenuItem>
                    <MenuItem value="in_transit">Đang giao</MenuItem>
                    <MenuItem value="delivered">Đã giao</MenuItem>
                  </Select>
                </FormControl>
                <Button size="small" variant="contained" onClick={onConfirmTracking}>
                  Lưu
                </Button>
                <Button size="small" onClick={onCloseTracking}>
                  Hủy
                </Button>
              </>
            )}
          </Box>
        )}
      </Box>
      {events.length > 0 && (
        <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <Typography fontSize={11} color="text.secondary" sx={{ mb: 0.5 }}>
            Lịch sử
          </Typography>
          {events.map((ev, i) => (
            <Typography key={i} fontSize={12} color="text.secondary">
              {formatDate(ev.date)} — {ev.description}
              {ev.location ? ` (${ev.location})` : ""}
            </Typography>
          ))}
        </Box>
      )}
    </Paper>
  );
}
