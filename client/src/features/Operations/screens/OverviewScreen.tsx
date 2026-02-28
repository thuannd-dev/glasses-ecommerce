import {
  Box,
  Chip,
  Grid,
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
import { ORDER_STATUS_LABEL, ORDER_TYPE_LABEL, formatDate } from "../constants";
import type { OrderStatus } from "../../../lib/types";

const STATUS_COLORS: Record<OrderStatus, { bg: string; color: string }> = {
  pending: { bg: "rgba(25,118,210,0.08)", color: "#1565c0" },
  confirmed: { bg: "rgba(25,118,210,0.08)", color: "#1565c0" },
  processing: { bg: "rgba(255,152,0,0.12)", color: "#ef6c00" },
  ready_to_ship: { bg: "rgba(2,136,209,0.12)", color: "#0277bd" },
  shipped: { bg: "rgba(46,125,50,0.12)", color: "#2e7d32" },
  delivered: { bg: "rgba(46,125,50,0.12)", color: "#2e7d32" },
  received: { bg: "rgba(63,81,181,0.10)", color: "#3949ab" },
  lens_ordered: { bg: "rgba(123,31,162,0.10)", color: "#7b1fa2" },
  lens_fitting: { bg: "rgba(94,53,177,0.12)", color: "#5e35b1" },
  cancelled: { bg: "rgba(211,47,47,0.10)", color: "#c62828" },
};

export function OverviewScreen() {
  const { orders, ordersLoading, shipments, shipmentsLoading } = useOperations();

  const pendingCount = orders.filter(
    (o) => o.status === "pending" || o.status === "processing" || o.status === "ready_to_ship"
  ).length;
  const shippedCount = orders.filter(
    (o) => o.status === "shipped" || o.status === "delivered"
  ).length;
  const inTransitCount = shipments.filter(
    (s) => s.status === "in_transit" || s.status === "picked"
  ).length;
  const preOrderCount = orders.filter((o) => o.orderType === "pre-order").length;
  const prescriptionCount = orders.filter((o) => o.orderType === "prescription").length;

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 12, letterSpacing: 5, textTransform: "uppercase", color: "text.secondary" }}>
          Operations Center
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 26, fontWeight: 900 }} color="text.primary">
          Overview
        </Typography>
        <Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: 14 }}>
          Summary and order list.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="Orders to process" value={ordersLoading ? "—" : pendingCount} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="Orders shipped" value={ordersLoading ? "—" : shippedCount} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="In transit" value={shipmentsLoading ? "—" : inTransitCount} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="Pre-order" value={ordersLoading ? "—" : preOrderCount} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="Prescription" value={ordersLoading ? "—" : prescriptionCount} />
        </Grid>
      </Grid>

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
        ) : orders.length === 0 ? (
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
                {orders.map((order) => (
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
                    <TableCell sx={{ fontWeight: 600 }}>{order.orderNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={ORDER_TYPE_LABEL[order.orderType]}
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ORDER_STATUS_LABEL[order.status]}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: 1,
                          bgcolor: STATUS_COLORS[order.status].bg,
                          color: STATUS_COLORS[order.status].color,
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

