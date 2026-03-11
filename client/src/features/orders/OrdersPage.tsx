import { useState } from "react";
import { Box, Typography, Paper, Button, Skeleton, Chip } from "@mui/material";
import { NavLink } from "react-router-dom";
import { useMyOrders } from "../../lib/hooks/useOrders";
import { OrderCard } from "./OrderCard";
import { AppPagination } from "../../app/shared/components/AppPagination";

const PALETTE = {
  textMain: "#171717",
  textSecondary: "#6B6B6B",
  textMuted: "#8A8A8A",
  accent: "#B68C5A",
  accentHover: "#9E7748",
  border: "#ECECEC",
  divider: "#F1F1F1",
};

const FILTERS = ["All", "Pending", "Shipped", "Cancelled"] as const;
type FilterValue = (typeof FILTERS)[number];

export default function OrdersPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const { data: page, isLoading, isError, error } = useMyOrders(pageNumber);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("All");

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

  const list = page?.items ?? [];
  const totalCount = page?.totalCount ?? list.length;
  const totalPages = page?.totalPages ?? 1;
  const currentPage = page?.pageNumber ?? pageNumber;
  const pageSize = page?.pageSize ?? (list.length || 10);

  const filteredList = list.filter((order) => {
    if (activeFilter === "All") return true;
    const status = (order.orderStatus ?? "").toString().toLowerCase();

    if (activeFilter === "Pending") {
      return status.includes("pending");
    }

    if (activeFilter === "Shipped") {
      return status.includes("shipped");
    }

    // Cancelled: gom các trạng thái cancel/refund
    if (activeFilter === "Cancelled") {
      return status.includes("cancel") || status.includes("refund");
    }

    return true;
  });

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
          {totalCount} order{totalCount !== 1 ? "s" : ""}
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

      {/* Filter row (UI-only) */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          mb: 3,
          overflowX: "auto",
        }}
      >
        {FILTERS.map((f) => {
          const active = activeFilter === f;
          return (
            <Chip
              key={f}
              label={f}
              onClick={() => setActiveFilter(f)}
              clickable
              sx={{
                borderRadius: 999,
                px: 1.5,
                fontSize: 13,
                fontWeight: 500,
                bgcolor: active ? "#171717" : "#FFFFFF",
                color: active ? "#FFFFFF" : PALETTE.textSecondary,
                border: active ? "none" : `1px solid ${PALETTE.border}`,
                boxShadow: active ? "0 4px 14px rgba(0,0,0,0.16)" : "none",
                transition:
                  "background-color 180ms ease, color 180ms ease, box-shadow 180ms ease",
                "&:hover": {
                  bgcolor: active ? "#111111" : "#FAFAFA",
                },
              }}
            />
          );
        })}
      </Box>

      {filteredList.length === 0 ? (
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
            {filteredList.map((order) => (
              <OrderCard key={order.id} orderSummary={order} />
            ))}
          </Box>

          {/* Pagination controls — same style as Collections */}
          {totalPages > 1 && (
            <AppPagination
              page={currentPage}
              totalPages={totalPages}
              onChange={setPageNumber}
              totalItems={totalCount}
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
