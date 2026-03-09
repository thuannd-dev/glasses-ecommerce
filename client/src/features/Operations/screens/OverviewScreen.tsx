import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { useOperations } from "../context/OperationsContext";
import { SummaryCard } from "../components";
import { ORDER_TYPE_LABEL, ORDER_STATUS_LABEL, formatDate } from "../constants";
import type { OrderStatus } from "../../../lib/types";

const STATUS_COLORS: Record<OrderStatus, { bg: string; color: string }> = {
  Pending: { bg: "rgba(25,118,210,0.08)", color: "#1565c0" },
  Confirmed: { bg: "rgba(25,118,210,0.08)", color: "#1565c0" },
  Processing: { bg: "rgba(255,152,0,0.12)", color: "#ef6c00" },
  Shipped: { bg: "rgba(2,136,209,0.12)", color: "#0277bd" },
  Delivered: { bg: "rgba(46,125,50,0.12)", color: "#2e7d32" },
  Completed: { bg: "rgba(46,125,50,0.12)", color: "#2e7d32" },
  Cancelled: { bg: "rgba(211,47,47,0.10)", color: "#c62828" },
  Refunded: { bg: "rgba(211,47,47,0.10)", color: "#c62828" },
};

export function OverviewScreen() {
  const { orders, ordersLoading, shipments, shipmentsLoading } = useOperations();

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeShipments = Array.isArray(shipments) ? shipments : [];

  const pendingCount = safeOrders.filter(
    (o) => ((o as any).orderStatus || o.status) === "Pending" || ((o as any).orderStatus || o.status) === "Processing" || ((o as any).orderStatus || o.status) === "Shipped"
  ).length;
  const shippedCount = safeOrders.filter(
    (o) => ((o as any).orderStatus || o.status) === "Shipped" || ((o as any).orderStatus || o.status) === "Delivered"
  ).length;
  const inTransitCount = safeShipments.filter(
    (s) => s.status === "in_transit" || s.status === "picked"
  ).length;
  const preOrderCount = safeOrders.filter((o) => o.orderType === "PreOrder").length;
  const prescriptionCount = safeOrders.filter((o) => o.orderType === "Prescription").length;

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 12, letterSpacing: 5, textTransform: "uppercase", color: "text.secondary" }}>
          Operations Center
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 3, mt: 1, mb: 2 }}>
          <Typography sx={{ fontSize: 26, fontWeight: 900 }} color="text.primary">
            OVERVIEW
          </Typography>
          <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1, minWidth: 0, flex: 1, justifyContent: "flex-end", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
            <Box sx={{ display: "flex", gap: 2, whiteSpace: "nowrap" }}>
              <Box sx={{ minWidth: 180 }}>
                <SummaryCard label="Orders to process" value={ordersLoading ? "—" : pendingCount} />
              </Box>
              <Box sx={{ minWidth: 180 }}>
                <SummaryCard label="Orders shipped" value={ordersLoading ? "—" : shippedCount} />
              </Box>
              <Box sx={{ minWidth: 180 }}>
                <SummaryCard label="In transit" value={shipmentsLoading ? "—" : inTransitCount} />
              </Box>
              <Box sx={{ minWidth: 180 }}>
                <SummaryCard label="Pre-order" value={ordersLoading ? "—" : preOrderCount} />
              </Box>
              <Box sx={{ minWidth: 180 }}>
                <SummaryCard label="Prescription" value={ordersLoading ? "—" : prescriptionCount} />
              </Box>
            </Box>
          </Box>
        </Box>
        <Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: 14 }}>
          Summary and order list.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <Typography sx={{ fontWeight: 800, fontSize: 16 }} color="text.primary">
            Orders
          </Typography>
        </Box>
        {ordersLoading ? (
          <Box sx={{ px: 3, py: 2 }}>
            <LinearProgress sx={{ borderRadius: 1 }} />
          </Box>
        ) : safeOrders.length === 0 ? (
          <Box sx={{ px: 3, py: 4 }}>
            <Typography color="text.secondary">No orders yet.</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table stickyHeader sx={{ minWidth: 640 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "text.secondary",
                      bgcolor: "rgba(0,0,0,0.02)",
                      borderBottom: "1px solid rgba(0,0,0,0.08)",
                      py: 2,
                      px: 3,
                    }}
                  >
                    Order #
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "text.secondary",
                      bgcolor: "rgba(0,0,0,0.02)",
                      borderBottom: "1px solid rgba(0,0,0,0.08)",
                      py: 2,
                      px: 3,
                    }}
                  >
                    Type
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "text.secondary",
                      bgcolor: "rgba(0,0,0,0.02)",
                      borderBottom: "1px solid rgba(0,0,0,0.08)",
                      py: 2,
                      px: 3,
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "text.secondary",
                      bgcolor: "rgba(0,0,0,0.02)",
                      borderBottom: "1px solid rgba(0,0,0,0.08)",
                      py: 2,
                      px: 3,
                    }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "text.secondary",
                      bgcolor: "rgba(0,0,0,0.02)",
                      borderBottom: "1px solid rgba(0,0,0,0.08)",
                      py: 2,
                      px: 3,
                    }}
                  >
                    Customer
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 700,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "text.secondary",
                      bgcolor: "rgba(0,0,0,0.02)",
                      borderBottom: "1px solid rgba(0,0,0,0.08)",
                      py: 2,
                      px: 3,
                    }}
                  >
                    Amount
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {safeOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    hover
                    sx={{
                      "&:last-child td": { borderBottom: 0 },
                      "& td": {
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                        py: 2,
                        px: 3,
                        fontSize: 14,
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{order.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <Chip
                        label={ORDER_TYPE_LABEL[order.orderType]}
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: 1, height: 24 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ORDER_STATUS_LABEL[((order as any).orderStatus || order.status) as OrderStatus]}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          textTransform: "capitalize",
                          borderRadius: 1,
                          border: `1px solid ${STATUS_COLORS[((order as any).orderStatus || order.status) as OrderStatus].color}`,
                          bgcolor: STATUS_COLORS[((order as any).orderStatus || order.status) as OrderStatus].bg,
                          color: STATUS_COLORS[((order as any).orderStatus || order.status) as OrderStatus].color,
                          flexShrink: 0,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {order.totalAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </>
  );
}

