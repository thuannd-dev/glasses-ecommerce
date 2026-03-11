import { useMemo, useState } from "react";
import { Box, Grid, InputAdornment, LinearProgress, Paper, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { isSameDay } from "date-fns";

<<<<<<< Updated upstream
import { useOperations } from "../context/OperationsContext";
import { OrderCard, SummaryCard } from "../components";
import type { OrderDto } from "../../../lib/types";

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
=======
import { AppPagination } from "../../../app/shared/components/AppPagination";
import { useOperationsOrders, useUpdateOrderStatus } from "../../../lib/hooks/useOperationsOrders";
import { useOperations } from "../context/OperationsContext";
import type { StaffOrderDto } from "../../../lib/types/staffOrders";
import type { OrderStatus, OrderType } from "../../../lib/types/operations";
import { OperationsPageHeader } from "../components/OperationsPageHeader";
import { OrderListCard, StatusFilterTabs } from "../components";
>>>>>>> Stashed changes

export function PrescriptionScreen() {
  const { orders, ordersLoading, updateStatus, openCreateShipment, expandedOrderId, setExpandedOrderId } = useOperations();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

<<<<<<< Updated upstream
  const prescriptionOrders = orders.filter((o) => o.orderType === "Prescription");
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
=======
  const { data, isLoading } = useOperationsOrders({
    pageNumber,
    pageSize,
    orderType: "Prescription" as OrderType,
    status: statusFilter === "All" ? undefined : (statusFilter as OrderStatus | string),
  });

  const safeOrders: StaffOrderDto[] = Array.isArray(data?.items)
    ? (data!.items as unknown as StaffOrderDto[])
    : [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? safeOrders.length;

  const updateStatus = useUpdateOrderStatus();
  const { openCreateShipment } = useOperations();

  return (
    <>
      <OperationsPageHeader
        title="Prescription"
        subtitle="Handle prescription orders: fabrication, lens fitting, ship."
        count={totalCount}
        countLabel="orders"
      />

      <Box
        sx={{
          px: { xs: 0, md: 0 },
          height: "calc(100vh - 56px)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.08)",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {isLoading ? (
            <LinearProgress sx={{ borderRadius: 1 }} />
          ) : (
            <>
              <StatusFilterTabs value={statusFilter} onChange={setStatusFilter} hideAll />
              {safeOrders.length === 0 ? (
                <Typography color="text.secondary">No prescription orders yet.</Typography>
              ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  mt: 1,
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  pr: { md: 1 },
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
              >
                {safeOrders
                  .filter((o) => {
                    const s = String(o.orderStatus).toLowerCase();
                    if (statusFilter === "All") return true;
                    if (statusFilter === "Confirmed") return s === "confirmed";
                    if (statusFilter === "Processing") return s === "processing";
                    if (statusFilter === "Shipped") return s === "shipped";
                    if (statusFilter === "Delivered") return s === "delivered";
                    return true;
                  })
                  .map((o) => (
                    <OrderListCard
                      key={o.id}
                      mode="confirmed"
                      summary={o}
                      primaryActionLabel={
                        String(o.orderStatus).toLowerCase() === "confirmed"
                          ? "Processing"
                          : String(o.orderStatus).toLowerCase() === "processing"
                          ? "Mark shipped"
                          : undefined
                      }
                      onPrimaryActionClick={(orderId) => {
                        const s = String(o.orderStatus).toLowerCase();
                        if (s === "confirmed") {
                          updateStatus.mutate({
                            orderId,
                            status: "Processing" as OrderStatus,
                          });
                        } else if (s === "processing") {
                          openCreateShipment(orderId);
                        }
                      }}
                      onUpdateStatus={(status) => {
                        updateStatus.mutate({
                          orderId: o.id,
                          status: status as OrderStatus,
                        });
                      }}
                    />
                  ))}
              </Box>
              )}

              {totalPages > 1 && (
                <AppPagination
                  page={pageNumber}
                  totalPages={totalPages}
                  onChange={setPageNumber}
                  totalItems={data?.totalCount}
                  pageSize={pageSize}
                  unitLabel="orders"
                  align="flex-end"
                />
              )}
            </>
          )}
        </Paper>
>>>>>>> Stashed changes
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
                canCreateShipment={order.status === "Shipped" && !order.shipmentId}
              />
            ))}
          </Box>
        )}
      </Paper>
    </>
  );
}
