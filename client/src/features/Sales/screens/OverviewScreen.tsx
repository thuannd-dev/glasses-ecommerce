import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  LinearProgress,
} from "@mui/material";
import { useAccount } from "../../../lib/hooks/useAccount";
import { useSales } from "../context/SalesContext";

export function OverviewScreen() {
  const { currentUser } = useAccount();
  const { orders, ordersLoading } = useSales();

  const safeOrders = Array.isArray(orders) ? orders : [];
  const totalRevenue = safeOrders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4, lg: 6 },
        py: 4,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography sx={{ fontSize: 12, letterSpacing: 6, textTransform: "uppercase", color: "text.secondary" }}>
          Sales Console
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 30, fontWeight: 900, color: "text.primary" }}>
          Welcome{currentUser?.displayName ? `, ${currentUser.displayName}` : ""}.
        </Typography>
        <Typography sx={{ mt: 1, color: "text.secondary", maxWidth: 520, fontSize: 14 }}>
          Track revenue, orders, and top performing products at a glance.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography fontSize={13} color="text.secondary">
              Total revenue
            </Typography>
            <Typography fontSize={26} fontWeight={900} mt={1} color="text.primary">
              {totalRevenue.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </Typography>
            {ordersLoading && (
              <LinearProgress sx={{ mt: 1.5, borderRadius: 1 }} />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography fontSize={13} color="text.secondary">
              Orders
            </Typography>
            <Typography fontSize={26} fontWeight={900} mt={1} color="text.primary">
              {ordersLoading ? "—" : safeOrders.length}
            </Typography>
            <Typography fontSize={12} color="text.secondary" mt={1}>
              Based on /api/staff/orders
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography fontSize={13} color="text.secondary">
              Sample metric
            </Typography>
            <Typography fontSize={26} fontWeight={900} mt={1} color="text.primary">
              0
            </Typography>
            <Chip
              label="Coming soon"
              size="small"
              sx={{
                mt: 1.5,
                bgcolor: "rgba(25,118,210,0.08)",
                color: "primary.main",
                fontWeight: 700,
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

