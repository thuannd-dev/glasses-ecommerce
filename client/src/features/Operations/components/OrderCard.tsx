import { Box, Button, Chip, Collapse, Paper, Typography } from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";

import { ORDER_STATUS_LABEL, ORDER_TYPE_LABEL, formatDate } from "../constants";
import type { OrderDto, OrderStatus } from "../../../lib/types";

export function OrderCard({
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
            {formatDate(order.createdAt)} · {order.items.length} items · {order.totalAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
          </Typography>
          {order.orderType === "pre-order" && order.expectedStockDate && (
            <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5 }}>
              Expected stock: {order.expectedStockDate}
            </Typography>
          )}
          {order.orderType === "prescription" && order.prescriptionStatus && (
            <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5 }}>
              Prescription: {order.prescriptionStatus}
            </Typography>
          )}
          <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {order.status === "pending" && (
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onUpdateStatus("confirmed"); }}>
                Confirm
              </Button>
            )}
            {(order.status === "confirmed" || order.status === "pending") && (
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onUpdateStatus("processing"); }}>
                Processing
              </Button>
            )}
            {order.status === "processing" && (
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onUpdateStatus("ready_to_ship"); }}>
                Ready to ship
              </Button>
            )}
            {order.orderType === "pre-order" && order.status === "pending" && (
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onUpdateStatus("received"); }}>
                Received at warehouse
              </Button>
            )}
            {order.orderType === "prescription" && order.status === "processing" && (
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onUpdateStatus("lens_fitting"); }}>
                Lens fitting
              </Button>
            )}
            {canCreateShipment && (
              <Button size="small" variant="contained" onClick={(e) => { e.stopPropagation(); onCreateShipment(); }}>
                Create shipment
              </Button>
            )}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}
