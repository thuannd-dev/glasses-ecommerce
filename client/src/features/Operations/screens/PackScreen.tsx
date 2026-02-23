import { useMemo, useState } from "react";
import { Box, Grid, InputAdornment, LinearProgress, Paper, Tabs, Tab, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useOperations } from "../context/OperationsContext";
import { OrderCard, SummaryCard } from "../components";
import type { OrderType } from "../types";
import type { OrderDto } from "../types";
import { isSameDay } from "date-fns";

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

export function PackScreen() {
  const { orders, ordersLoading, updateStatus, expandedOrderId, setExpandedOrderId } = useOperations();
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "ready_to_ship" || o.status === "processing"
  ).length;
  const shippedCount = orders.filter((o) => o.status === "shipped" || o.status === "delivered").length;
  const ordersForPack = orders.filter(
    (o) =>
      (o.status === "pending" || o.status === "processing" || o.status === "ready_to_ship") &&
      (orderTypeFilter === "all" || o.orderType === orderTypeFilter)
  );
  const filteredOrders = useMemo(
    () => filterAndSortOrders(ordersForPack, searchQuery, dateFilter),
    [ordersForPack, searchQuery, dateFilter]
  );

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 12, letterSpacing: 5, textTransform: "uppercase", color: "text.secondary" }}>
          Operations Center
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 26, fontWeight: 900 }} color="text.primary">
          Packing
        </Typography>
        <Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: 14 }}>
          Orders to pack, confirm and move to ready to ship. Ready-to-ship orders appear on the Create shipment screen.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="Orders to process" value={ordersLoading ? "—" : pendingOrders} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="Orders shipped" value={ordersLoading ? "—" : shippedCount} />
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
        <Tabs value={orderTypeFilter} onChange={(_, v) => setOrderTypeFilter(v)} sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tab label="All" value="all" />
          <Tab label="Standard" value="standard" />
          <Tab label="Pre-order" value="pre-order" />
          <Tab label="Prescription" value="prescription" />
        </Tabs>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 2 }}>
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
        {ordersLoading ? (
          <LinearProgress sx={{ borderRadius: 1 }} />
        ) : filteredOrders.length === 0 ? (
          <Typography color="text.secondary">No orders to pack.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                expanded={expandedOrderId === order.id}
                onToggleExpand={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                onUpdateStatus={(status) => updateStatus.mutate({ orderId: order.id, status })}
                onCreateShipment={() => {}}
                canCreateShipment={false}
              />
            ))}
          </Box>
        )}
      </Paper>
    </>
  );
}
