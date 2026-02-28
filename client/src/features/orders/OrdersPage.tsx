import {
  Box,
  Typography,
  Paper,
  Button,
  Skeleton,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { useMyOrders } from "../../lib/hooks/useOrders";
import { OrderCard } from "./OrderCard";

export default function OrdersPage() {
  const { data: page, isLoading, isError, error } = useMyOrders();

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 720, mx: "auto", mt: 10, px: { xs: 2, md: 3 }, pb: 8 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", mt: 10, px: { xs: 2, md: 3 }, pb: 8 }}>
      <Typography fontWeight={900} fontSize={28} mb={1}>
        My Orders
      </Typography>
      <Typography fontSize={15} color="text.secondary" mb={3}>
        {list.length} order{list.length !== 1 ? "s" : ""}
      </Typography>

      {list.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid rgba(17,24,39,0.12)",
            borderRadius: 3,
            p: 5,
            textAlign: "center",
          }}
        >
          <Typography color="text.secondary" mb={2} fontSize={16}>
            You have not placed any orders yet.
          </Typography>
          <Button
            component={NavLink}
            to="/collections"
            variant="contained"
            size="large"
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Start shopping
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {list.map((order) => (
            <OrderCard key={order.id} orderSummary={order} />
          ))}
        </Box>
      )}
    </Box>
  );
}
