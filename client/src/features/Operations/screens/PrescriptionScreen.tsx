import { useMemo, useState } from "react";
import { Box, Grid, InputAdornment, LinearProgress, Paper, TextField, Typography, Button, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";

import { useOperations } from "../context/OperationsContext";
import { SummaryCard } from "../components";
import { formatDate } from "../constants";

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

function filterAndSortOrders(
  list: OperationsOrder[],
  searchQuery: string,
  dateFilter: Date | null
): OperationsOrder[] {
  let filtered = list;
  const q = searchQuery.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q))
    );
  }
  if (dateFilter) {
    filtered = filtered.filter((o) => isSameDay(new Date(o.createdAt), dateFilter));
  }
  return [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

const ORDER_STATUS_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  Pending: { bg: "#fbbf2422", border: "#fbbf24", color: "#92400e" },
  Confirmed: { bg: "#3b82f622", border: "#3b82f6", color: "#1e40af" },
  Processing: { bg: "#3b82f622", border: "#3b82f6", color: "#1e40af" },
  Shipped: { bg: "#10b98122", border: "#10b981", color: "#065f46" },
  Delivered: { bg: "#10b98122", border: "#10b981", color: "#065f46" },
};

export function PrescriptionScreen() {
  const { orders, ordersLoading } = useOperations();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const navigate = useNavigate();

  const prescriptionOrders = orders.filter((o) => o.orderType === "Prescription" && o.orderStatus === "Confirmed");
  const filteredOrders = useMemo(
    () => filterAndSortOrders(prescriptionOrders, searchQuery, dateFilter),
    [prescriptionOrders, searchQuery, dateFilter]
  );

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4, lg: 6 },
        py: 4,
        height: "calc(100vh - 56px)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Typography sx={{ fontSize: 24, fontWeight: 900, mb: 2 }}>
        Prescription
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="Prescription" value={ordersLoading ? "—" : prescriptionOrders.length} />
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 3 }}>
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

      {ordersLoading && (
        <Box sx={{ maxWidth: 720, mx: "auto", mt: 2 }}>
          <LinearProgress sx={{ borderRadius: 1 }} />
        </Box>
      )}

      {!ordersLoading && filteredOrders.length === 0 && (
        <Box sx={{ maxWidth: 720, mx: "auto", mt: 3 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(0,0,0,0.08)",
              px: 3,
              py: 4,
              textAlign: "center",
            }}
          >
            <Typography color="text.secondary">No prescription orders yet.</Typography>
          </Paper>
        </Box>
      )}

      {!ordersLoading && filteredOrders.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
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
            {filteredOrders.map((order) => (
              <Paper
                key={order.id}
                elevation={0}
                sx={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 3,
                  px: 3,
                  py: 2.5,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.03)",
                  },
                }}
                onClick={() => navigate(`/operations/orders/${order.id}`)}
              >
                {/* Header row: Order # + Status chip */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, wordBreak: "break-all" }}>
                      Order ID: {order.id}
                    </Typography>
                  </Box>
                  <Chip
                    label={order.orderStatus}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      textTransform: "capitalize",
                      border: `1px solid ${ORDER_STATUS_COLORS[order.orderStatus]?.border || "#ddd"}`,
                      bgcolor: `${ORDER_STATUS_COLORS[order.orderStatus]?.bg || "#f0f0f0"}`,
                      color: ORDER_STATUS_COLORS[order.orderStatus]?.color || "#666",
                      flexShrink: 0,
                    }}
                  />
                </Box>

                {/* Metadata row: Type + Created date */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 1.5,
                    fontSize: 13,
                    color: "text.secondary",
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: "rgba(0,0,0,0.7)" }}>
                      Type:
                    </Typography>
                    <Chip
                      label="Prescription"
                      size="small"
                      sx={{
                        fontWeight: 600,
                        borderRadius: 1,
                        height: 24,
                        bgcolor: "#8b5cf622",
                        color: "#4c1d95",
                        border: "1px solid #8b5cf6",
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  </Box>
                  <Typography fontSize={13} color="text.secondary">
                    Created: {formatDate(order.createdAt)}
                  </Typography>
                </Box>

                {/* Customer + View button */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>
                      Customer
                    </Typography>
                    <Typography sx={{ fontWeight: 600, color: "rgba(0,0,0,0.7)" }}>
                      {order.customerName}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 2,
                      bgcolor: "#1f2937",
                      "&:hover": { bgcolor: "#111827" },
                      ml: 2,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/operations/orders/${order.id}`);
                    }}
                  >
                    View detail
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
