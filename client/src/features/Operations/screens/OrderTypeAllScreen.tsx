import { useState } from "react";
import { Box, LinearProgress, Paper, Typography, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import { AppPagination } from "../../../app/shared/components/AppPagination";
import { useOperationsOrders } from "../../../lib/hooks/useOperationsOrders";
import type { StaffOrderDto } from "../../../lib/types/staffOrders";
import { OperationsPageHeader } from "../components/OperationsPageHeader";
import { OrderListCard } from "../components";

export function OrderTypeAllScreen() {
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 5;
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");

  const { data, isLoading } = useOperationsOrders({
    pageNumber,
    pageSize,
  });

  const safeOrders: StaffOrderDto[] = Array.isArray(data?.items)
    ? (data!.items as unknown as StaffOrderDto[])
    : [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? safeOrders.length;

  return (
    <>
      <OperationsPageHeader
        title="All order types"
        subtitle="All Operations orders across Standard, Pre-order and Prescription."
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
          ) : safeOrders.length === 0 ? (
            <Typography color="text.secondary">No operations orders yet.</Typography>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                  justifyContent: "flex-start",
                }}
              >
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Search by phone or order ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                      minWidth: 220,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 999,
                        bgcolor: "#FAFAF8",
                        fontSize: 13,
                        px: 1,
                        "& fieldset": { borderColor: "rgba(0,0,0,0.06)" },
                        "&:hover fieldset": { borderColor: "rgba(0,0,0,0.18)" },
                        "&.Mui-focused fieldset": { borderColor: "#B68C5A", borderWidth: 1 },
                      },
                      "& .MuiInputBase-input": {
                        py: 0.75,
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" sx={{ color: "#9CA3AF" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    size="small"
                    type="date"
                    label="Order date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      minWidth: 160,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 999,
                        bgcolor: "#FAFAF8",
                        fontSize: 13,
                        px: 1.25,
                        "& fieldset": { borderColor: "rgba(0,0,0,0.06)" },
                        "&:hover fieldset": { borderColor: "rgba(0,0,0,0.18)" },
                        "&.Mui-focused fieldset": { borderColor: "#B68C5A", borderWidth: 1 },
                      },
                      "& .MuiInputBase-input": {
                        py: 0.75,
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        color: "#9CA3AF",
                      },
                    }}
                  />
                </Box>
              </Box>

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
                    // Search by customer phone or order id
                    const q = searchQuery.trim().toLowerCase();
                    if (q) {
                      const phone = (
                        (o as any).customerPhone ??
                        o.walkInCustomerPhone ??
                        ""
                      )
                        .toString()
                        .toLowerCase();
                      const orderId = (o.id ?? "").toString().toLowerCase();
                      if (!phone.includes(q) && !orderId.includes(q)) {
                        return false;
                      }
                    }

                    // Date filter by createdAt (yyyy-mm-dd)
                    if (dateFilter) {
                      const d = new Date(o.createdAt);
                      const yyyy = String(d.getFullYear()).padStart(4, "0");
                      const mm = String(d.getMonth() + 1).padStart(2, "0");
                      const dd = String(d.getDate()).padStart(2, "0");
                      const ymd = `${yyyy}-${mm}-${dd}`;
                      if (ymd !== dateFilter) return false;
                    }

                    return true;
                  })
                  .map((o) => (
                    <OrderListCard
                      key={o.id}
                      mode="confirmed"
                      summary={o}
                      // No primaryActionLabel / onPrimaryActionClick => read-only view
                    />
                  ))}
              </Box>

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
      </Box>
    </>
  );
}

