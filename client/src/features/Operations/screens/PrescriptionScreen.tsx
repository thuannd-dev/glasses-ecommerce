import { useMemo, useState } from "react";
import { Box, Grid, InputAdornment, LinearProgress, Paper, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { isSameDay } from "date-fns";

import { useOperations } from "../context/OperationsContext";
import { OrderCard, SummaryCard } from "../components";
import type { OrderDto } from "../types";

function filterAndSortOrders(
  list: OrderDto[],
  searchQuery: string,
  dateFilter: Date | null
): OrderDto[] {
  let filtered = list;
  const q = searchQuery.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q)
    );
  }
  if (dateFilter) {
    filtered = filtered.filter((o) => isSameDay(new Date(o.createdAt), dateFilter));
  }
  return [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function PrescriptionScreen() {
  const { orders, ordersLoading, updateStatus, openCreateShipment, expandedOrderId, setExpandedOrderId } = useOperations();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  const prescriptionOrders = orders.filter((o) => o.orderType === "prescription");
  const filteredOrders = useMemo(
    () => filterAndSortOrders(prescriptionOrders, searchQuery, dateFilter),
    [prescriptionOrders, searchQuery, dateFilter]
  );

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 12, letterSpacing: 5, textTransform: "uppercase", color: "text.secondary" }}>
          Operations Center
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 26, fontWeight: 900 }} color="text.primary">
          Prescription
        </Typography>
        <Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: 14 }}>
          Handle prescription orders: fabrication, lens fitting, ship.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="Prescription" value={ordersLoading ? "—" : prescriptionOrders.length} />
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <VisibilityOutlined sx={{ color: "text.secondary" }} />
            <Typography fontSize={16} fontWeight={800}>
              Prescription list
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
            <TextField
              size="small"
              placeholder="Order # or customer name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 220 }}
            />
            <DatePicker
              label="Date"
              value={dateFilter}
              onChange={(d) => setDateFilter(d ?? null)}
              slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }}
            />
          </Box>
        </Box>
        {ordersLoading ? (
          <LinearProgress sx={{ borderRadius: 1 }} />
        ) : filteredOrders.length === 0 ? (
          <Typography color="text.secondary">No prescription orders yet.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                expanded={expandedOrderId === order.id}
                onToggleExpand={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                onUpdateStatus={(status) => updateStatus.mutate({ orderId: order.id, status })}
                onCreateShipment={() => openCreateShipment(order.id)}
                canCreateShipment={order.status === "ready_to_ship" && !order.shipmentId}
              />
            ))}
          </Box>
        )}
      </Paper>
    </>
  );
}
