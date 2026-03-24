import { useState, useMemo } from "react";
import {
  Box,
  LinearProgress,
  Paper,
  Typography,
  InputAdornment,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import { useOperationsOrders } from "../../../lib/hooks/useOperationsOrders";
import { AppPagination } from "../../../app/shared/components/AppPagination";
import type { StaffOrderDto } from "../../../lib/types/staffOrders";
import { OperationsPageHeader } from "../components/OperationsPageHeader";
import { OrdersTabs } from "../components/OrdersTabs";
import { OrderListCard } from "../components/OrderListCard";

export function InTransitScreen() {
  const [pageNumber, setPageNumber] = useState(1);
  const [orderIdFilter, setOrderIdFilter] = useState("");
  const pageSize = 5;

  const { data, isLoading } = useOperationsOrders({
    pageNumber,
    pageSize,
    status: "Shipped",
  });

  const safeOrders: StaffOrderDto[] = Array.isArray(data?.items)
    ? (data!.items as unknown as StaffOrderDto[])
    : [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? safeOrders.length;

  const filteredOrders = useMemo(() => {
    if (!orderIdFilter.trim()) return safeOrders;
    const q = orderIdFilter.trim().toLowerCase();
    return safeOrders.filter((o) => o.id.toLowerCase().includes(q));
  }, [safeOrders, orderIdFilter]);

  return (
    <>
      <OperationsPageHeader
        eyebrow="OPERATIONS CENTER"
        title="In-transit orders"
        subtitle="Orders that are currently in transit to customers."
        count={totalCount}
        countLabel="orders"
      />
      <OrdersTabs active="in-transit" />

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
            bgcolor: "#FFFFFF",
            boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {isLoading ? (
            <LinearProgress sx={{ borderRadius: 1 }} />
          ) : safeOrders.length === 0 ? (
            <Typography sx={{ color: "#6B6B6B" }}>No in-transit orders yet.</Typography>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                  flexWrap: "wrap",
                }}
              >
                <TextField
                  size="small"
                  placeholder="Search by Order ID"
                  value={orderIdFilter}
                  onChange={(e) => setOrderIdFilter(e.target.value)}
                  sx={{
                    width: { xs: "100%", sm: 260 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#FAFAF8",
                      fontSize: 14,
                      "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
                      "&:hover fieldset": { borderColor: "rgba(0,0,0,0.12)" },
                      "&.Mui-focused fieldset": { borderColor: "#B68C5A", borderWidth: 1 },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 20, color: "#8A8A8A" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2.5,
                  mt: 0,
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
                {filteredOrders.map((o) => (
                  <OrderListCard 
                    key={o.id} 
                    mode="in-transit" 
                    summary={o}
                  />
                ))}
                {filteredOrders.length === 0 && orderIdFilter.trim() && (
                  <Typography sx={{ color: "#6B6B6B", py: 2 }}>
                    No orders match &quot;{orderIdFilter}&quot;.
                  </Typography>
                )}
              </Box>

              {totalPages > 1 && (
                <AppPagination
                  page={pageNumber}
                  totalPages={totalPages}
                  onChange={setPageNumber}
                  totalItems={totalCount}
                  pageSize={pageSize}
                  unitLabel="orders"
                  align="flex-end"
                />
              )}
            </>
          )}
        </Paper>
      </Box>
    </>
  );
}
