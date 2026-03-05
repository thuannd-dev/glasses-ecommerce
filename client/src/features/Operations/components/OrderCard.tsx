import { Box, Button, Chip, Collapse, Paper, Typography } from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";

import { ORDER_STATUS_LABEL, ORDER_TYPE_LABEL, formatDate } from "../constants";
import type { OrderStatus } from "../../../lib/types";

type OperationsOrder = {
  id: string;
  orderSource: string;
  orderType: string;
  orderStatus: string;
  totalAmount: number;
  finalAmount: number;
  customerName: string | null;
  customerPhone: string | null;
  itemCount: number;
  createdAt: string;
};

export function OrderCard({
  order,
  expanded,
  onToggleExpand,
  onUpdateStatus,
  onCreateShipment,
  canCreateShipment,
}: {
  order: OperationsOrder;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdateStatus: (status: OrderStatus) => void;
  onCreateShipment: () => void;
  canCreateShipment: boolean;
}) {
  const statusLabel = ORDER_STATUS_LABEL[order.orderStatus as keyof typeof ORDER_STATUS_LABEL] || order.orderStatus;
  const typeLabel = ORDER_TYPE_LABEL[order.orderType as keyof typeof ORDER_TYPE_LABEL] || order.orderType;

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
            {order.id}
          </Typography>
          <Chip label={typeLabel} size="small" sx={{ fontWeight: 600 }} />
          <Chip
            label={statusLabel}
            size="small"
            sx={{
              bgcolor: order.orderStatus === "Shipped" || order.orderStatus === "Delivered" ? "rgba(46,125,50,0.12)" : "rgba(25,118,210,0.12)",
              color: order.orderStatus === "Shipped" || order.orderStatus === "Delivered" ? "#2e7d32" : "#1976d2",
              fontWeight: 600,
            }}
          />
        </Box>
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <Typography fontSize={12} color="text.secondary">
            {order.customerName} · {order.customerPhone}
          </Typography>
          <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5 }}>
            {formatDate(order.createdAt)} · {order.itemCount} items · {order.finalAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
          </Typography>
          <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {order.orderStatus === "Pending" && (
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onUpdateStatus("confirmed"); }}>
                Confirm
              </Button>
            )}
            {(order.orderStatus === "Confirmed" || order.orderStatus === "Pending") && (
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onUpdateStatus("processing"); }}>
                Processing
              </Button>
            )}
            {order.orderStatus === "Processing" && (
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onUpdateStatus("ready_to_ship"); }}>
                Ready to ship
              </Button>
            )}
            {order.orderType === "PreOrder" && order.orderStatus === "Pending" && (
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onUpdateStatus("received"); }}>
                Received at warehouse
              </Button>
            )}
            {order.orderType === "Prescription" && order.orderStatus === "Processing" && (
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
