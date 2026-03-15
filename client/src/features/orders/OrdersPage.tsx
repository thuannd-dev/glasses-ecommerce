import { useMemo, useState } from "react";
import { Box, Typography, Paper, Button, Skeleton } from "@mui/material";
import { NavLink } from "react-router-dom";
import { useMyOrders } from "../../lib/hooks/useOrders";
import { OrderCard } from "./OrderCard";
import { AppPagination } from "../../app/shared/components/AppPagination";
import { OrderStatusFilter } from "./OrderStatusFilter";
import { getStatusQueryString, type OrderStatusFilterKey } from "../../lib/constants/orderStatusFilters";

const PALETTE = {
  textMain: "#171717",
  textSecondary: "#6B6B6B",
  textMuted: "#8A8A8A",
  accent: "#B68C5A",
  accentHover: "#9E7748",
  border: "#ECECEC",
  divider: "#F1F1F1",
};
export default function OrdersPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilterKey>("All");

  const statusQueryString = getStatusQueryString(statusFilter);
  const { data: page, isLoading, isError, error } = useMyOrders(pageNumber, statusQueryString);

  // Reset to page 1 when filter changes
  const handleFilterChange = (filter: OrderStatusFilterKey) => {
    setStatusFilter(filter);
    setPageNumber(1);
  };

  const list = page?.items ?? [];
  const effectiveTotalCount = page?.totalCount ?? list.length;
  const effectiveTotalPages = page?.totalPages ?? 1;
  const currentPage = page?.pageNumber ?? pageNumber;
  const pageSize = page?.pageSize ?? (list.length || 10);

  const groupedByDate = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        dateLabel: string;
        orders: typeof list;
      }
    >();

    list.forEach((order) => {
      const d = new Date(order.createdAt);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });

      if (!map.has(key)) {
        map.set(key, { key, dateLabel: label, orders: [] as typeof list });
      }
      map.get(key)!.orders.push(order);
    });

    // Giữ nguyên thứ tự theo backend (mới nhất trước)
    return Array.from(map.values());
  }, [list]);

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 720, mx: "auto", mt: 10, px: { xs: 2, md: 3 }, pb: 8 }}>
        <Skeleton variant="text" width={220} height={42} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={120} height={24} sx={{ mb: 3 }} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ maxWidth: 720, mx: "auto", mt: 10, px: 2 }}>
        <Typography color="error" fontWeight={600}>
          {error instanceof Error ? error.message : "Failed to load orders."}
        </Typography>
        <Button component={NavLink} to="/collections" variant="outlined" sx={{ mt: 2 }}>
          Continue shopping
        </Button>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        maxWidth: 720,
        mx: "auto",
        mt: 10,
        px: { xs: 2, md: 3 },
        pb: 8,
        bgcolor: "#FFFFFF",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: { xs: 26, md: 30 },
            fontWeight: 900,
            color: PALETTE.textMain,
            lineHeight: 1.1,
          }}
        >
          My orders
        </Typography>
        <Typography
          sx={{
            fontSize: 14,
            color: PALETTE.textSecondary,
            mt: 0.5,
          }}
        >
          {effectiveTotalCount} order{effectiveTotalCount === 1 ? "" : "s"}
        </Typography>
        <Box
          sx={{
            mt: 1.5,
            height: 2,
            width: 64,
            borderRadius: 999,
            bgcolor: "rgba(182,140,90,0.25)",
          }}
        />
      </Box>

      {/* Status Filter */}
      {list.length > 0 || statusFilter !== "All" ? (
        <OrderStatusFilter activeFilter={statusFilter} onFilterChange={handleFilterChange} />
      ) : null}

      {list.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${PALETTE.border}`,
            borderRadius: 3,
            p: 5,
            textAlign: "center",
            bgcolor: "#FFFFFF",
          }}
        >
          <Typography sx={{ color: PALETTE.textSecondary, mb: 2, fontSize: 16 }}>
            You have not placed any orders yet.
          </Typography>
          <Button
            component={NavLink}
            to="/collections"
            variant="contained"
            sx={{
              fontWeight: 700,
              borderRadius: 999,
              px: 3,
              py: 1,
              textTransform: "none",
              bgcolor: "#171717",
              "&:hover": { bgcolor: "#111111" },
            }}
          >
            Start shopping
          </Button>
        </Paper>
      ) : (
        <>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 3 }}>
            {groupedByDate.map((group) => (
              <Box key={group.key} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: PALETTE.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: 1.6,
                  }}
                >
                  {group.dateLabel}
                </Typography>
                {group.orders.map((order) => (
                  <OrderCard key={order.id} orderSummary={order} />
                ))}
              </Box>
            ))}
          </Box>

          {/* Pagination controls — same style as Collections */}
          {effectiveTotalPages > 1 && (
            <AppPagination
              page={currentPage}
              totalPages={effectiveTotalPages}
              onChange={setPageNumber}
              totalItems={effectiveTotalCount}
              pageSize={pageSize}
              unitLabel="orders"
              align="space-between"
            />
          )}
        </>
      )}
    </Box>
  );
}
