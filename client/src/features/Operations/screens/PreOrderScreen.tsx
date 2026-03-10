import { useMemo, useState } from "react";
import { Box, Grid, InputAdornment, LinearProgress, Paper, TextField, Typography, Card, CardContent, Chip, Stack } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { isSameDay } from "date-fns";

import { useOperations } from "../context/OperationsContext";
import { SummaryCard } from "../components";
import type { OrderDto } from "../../../lib/types";
import { OperationsPageHeader } from "../components/OperationsPageHeader";

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

export function PreOrderScreen() {
  const { orders, ordersLoading, expandedOrderId, setExpandedOrderId } = useOperations();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  const preOrderOrders = orders.filter((o) => o.orderType === "PreOrder");
  const filteredOrders = useMemo(
    () => filterAndSortOrders(preOrderOrders, searchQuery, dateFilter),
    [preOrderOrders, searchQuery, dateFilter]
  );

  return (
    <>
      <OperationsPageHeader
        title="Pre-order"
        subtitle="Handle pre-orders: expected stock, receive at warehouse, pack."
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="Pre-order" value={ordersLoading ? "—" : preOrderOrders.length} />
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ScheduleOutlined sx={{ color: "text.secondary" }} />
            <Typography fontSize={16} fontWeight={800}>
              Pre-order list
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
            <TextField
              type="date"
              size="small"
              label="Date"
              value={dateFilter ? dateFilter.toISOString().slice(0, 10) : ""}
              onChange={(e) => setDateFilter(e.target.value ? new Date(e.target.value) : null)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
          </Box>
        </Box>
        {ordersLoading ? (
          <LinearProgress sx={{ borderRadius: 1 }} />
        ) : filteredOrders.length === 0 ? (
          <Typography color="text.secondary">No pre-orders yet.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {filteredOrders.map((order) => {
              const actualStatus = (order as any).orderStatus || order.status;
              const getStatusColor = (status: string) => {
                const lower = status?.toLowerCase();
                switch (lower) {
                  case "pending":
                    return { bg: "rgba(14,165,233,0.08)", text: "#0369a1", badge: "#0369a1" };
                  case "confirmed":
                    return { bg: "rgba(139,92,246,0.08)", text: "#5b21b6", badge: "#5b21b6" };
                  case "processing":
                    return { bg: "rgba(249,115,22,0.08)", text: "#c2410c", badge: "#c2410c" };
                  case "shipped":
                    return { bg: "rgba(46,125,50,0.08)", text: "#1b4332", badge: "#2e7d32" };
                  case "delivered":
                    return { bg: "rgba(46,125,50,0.08)", text: "#1b4332", badge: "#2e7d32" };
                  default:
                    return { bg: "rgba(148,163,184,0.08)", text: "#475569", badge: "#64748b" };
                }
              };
              const colors = getStatusColor(actualStatus);

              return (
                <Card
                  key={order.id}
                  sx={{
                    p: 0,
                    background: colors.bg,
                    border: `1px solid ${colors.badge}20`,
                    borderRadius: 2,
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      borderColor: colors.badge,
                    },
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2.5}>
                      {/* Header Row */}
                      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" fontWeight={800} fontSize={16} sx={{ color: colors.text }}>
                            {order.orderNumber}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: 13 }}>
                            {order.customerName}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <Chip
                            label="Pre-order"
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight: 600,
                              fontSize: 12,
                              borderColor: colors.badge,
                              color: colors.badge,
                            }}
                          />
                          <Chip
                            label={actualStatus}
                            size="small"
                            sx={{
                              background: colors.badge,
                              color: "white",
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          />
                        </Stack>
                      </Box>

                      {/* Info Row */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                          <CalendarTodayIcon sx={{ fontSize: 20, color: colors.badge, opacity: 0.7 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 12 }}>
                              Order Date
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color={colors.text} sx={{ fontSize: 14 }}>
                              {new Date(order.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </Typography>
                          </Box>
                        </Box>

                        {order.expectedStockDate && (
                          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                            <LocalShippingIcon sx={{ fontSize: 20, color: colors.badge, opacity: 0.7 }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 12 }}>
                                Expected Stock
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color={colors.text} sx={{ fontSize: 14 }}>
                                {new Date(order.expectedStockDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 12 }}>
                              Amount
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color={colors.text} sx={{ fontSize: 14 }}>
                              {order.totalAmount?.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Items Count */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pt: 1,
                          borderTop: `1px solid ${colors.badge}30`,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
                          {order.items?.length || 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                        </Typography>
                        <Typography variant="caption" color={colors.badge} sx={{ fontWeight: 600, fontSize: 12 }}>
                          {expandedOrderId === order.id ? "Click to collapse" : "Click to expand"}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>

                  {/* Expanded Content */}
                  {expandedOrderId === order.id && (
                    <>
                      <Box sx={{ px: 3, py: 0, borderTop: `1px solid ${colors.badge}30` }} />
                      <CardContent sx={{ p: 3, pt: 2 }}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={700} display="block" sx={{ mb: 1, fontSize: 11 }}>
                              Customer Details
                            </Typography>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 12 }}>
                                  Email
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: 13 }}>{order.customerEmail}</Typography>
                              </Box>
                              {order.shippingAddress && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 12 }}>
                                    Shipping Address
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontSize: 13 }}>{order.shippingAddress}</Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>

                          {order.items && order.items.length > 0 && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={700} display="block" sx={{ mb: 1, fontSize: 11 }}>
                                Items
                              </Typography>
                              <Stack spacing={1}>
                                {order.items.map((item, idx) => (
                                  <Box
                                    key={idx}
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      p: 1.5,
                                      bgcolor: "rgba(255,255,255,0.5)",
                                      borderRadius: 1,
                                    }}
                                  >
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
                                        {item.productName}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                                        SKU: {item.sku}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: "right", ml: 1 }}>
                                      <Typography variant="body2" fontWeight={700} color={colors.text} sx={{ fontSize: 13 }}>
                                        {item.quantity}x
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                                        ${item.price}
                                      </Typography>
                                    </Box>
                                  </Box>
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </>
                  )}
                </Card>
              );
            })}
          </Box>
        )}
      </Paper>
    </>
  );
}
