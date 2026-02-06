import { Box, Typography, Grid, Paper, Chip, LinearProgress } from "@mui/material";
import { People, ShoppingCart, AttachMoney, PendingActions, Inventory } from "@mui/icons-material";
import { useAccount } from "../../lib/hooks/useAccount";

const RISK_ITEMS: { label: string; severity: "High" | "Medium" | "Low" }[] = [
  { label: "Lens supplier delay", severity: "High" },
  { label: 'Spike in returns for "Studio Round"', severity: "Medium" },
  { label: "Carrier SLA breach - local", severity: "Low" },
];

const SEVERITY_STYLES = {
  High: { bgcolor: "rgba(211,47,47,0.12)", color: "#c62828" },
  Medium: { bgcolor: "rgba(245,124,0,0.15)", color: "#e65100" },
  Low: { bgcolor: "rgba(46,125,50,0.12)", color: "#2e7d32" },
} as const;

export default function ManagerDashboard() {
  const { currentUser } = useAccount();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 6, lg: 10 },
        py: 6,
        bgcolor: "#fafafa",
        color: "rgba(0,0,0,0.87)",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography
          sx={{
            fontSize: 12,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          Management Overview
        </Typography>

        <Typography
          sx={{ mt: 1, fontSize: 30, fontWeight: 900 }}
          color="text.primary"
        >
          Good to see you
          {currentUser?.displayName ? `, ${currentUser.displayName}` : ""}.
        </Typography>

        <Typography
          sx={{ mt: 1, color: "text.secondary", maxWidth: 520, fontSize: 14 }}
        >
          High-level KPIs for sales, operations and customer experience in one
          place.
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Total Users */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography fontSize={12} color="text.secondary" fontWeight={500}>
                Total Users
              </Typography>
              <Typography fontSize={24} fontWeight={900} mt={0.5} color="text.primary">
                $1.2K
              </Typography>
              <Typography
                fontSize={11}
                color="#2e7d32"
                fontWeight={600}
                mt={0.5}
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                ↑ 12% from last month
              </Typography>
            </Box>
            <People sx={{ fontSize: 32, color: "#6c63ff", opacity: 0.8 }} />
          </Paper>
        </Grid>

        {/* Total Orders */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography fontSize={12} color="text.secondary" fontWeight={500}>
                Total Orders
              </Typography>
              <Typography fontSize={24} fontWeight={900} mt={0.5} color="text.primary">
                $3.5K
              </Typography>
              <Typography
                fontSize={11}
                color="#2e7d32"
                fontWeight={600}
                mt={0.5}
              >
                ↑ 8% from last month
              </Typography>
            </Box>
            <ShoppingCart sx={{ fontSize: 32, color: "#d4a574", opacity: 0.8 }} />
          </Paper>
        </Grid>

        {/* Revenue */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography fontSize={12} color="text.secondary" fontWeight={500}>
                Revenue
              </Typography>
              <Typography fontSize={24} fontWeight={900} mt={0.5} color="text.primary">
                $145.2K
              </Typography>
              <Typography
                fontSize={11}
                color="#2e7d32"
                fontWeight={600}
                mt={0.5}
              >
                ↑ 15% from last month
              </Typography>
            </Box>
            <AttachMoney sx={{ fontSize: 32, color: "#ffa500", opacity: 0.8 }} />
          </Paper>
        </Grid>

        {/* Pending Requests */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography fontSize={12} color="text.secondary" fontWeight={500}>
                Pending Requests
              </Typography>
              <Typography fontSize={24} fontWeight={900} mt={0.5} color="text.primary">
                42
              </Typography>
              <Typography
                fontSize={11}
                color="#c62828"
                fontWeight={600}
                mt={0.5}
              >
                ↓ 5% from last month
              </Typography>
            </Box>
            <PendingActions sx={{ fontSize: 32, color: "#ffd700", opacity: 0.8 }} />
          </Paper>
        </Grid>

        {/* Total Products */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography fontSize={12} color="text.secondary" fontWeight={500}>
                Total Products
              </Typography>
              <Typography fontSize={24} fontWeight={900} mt={0.5} color="text.primary">
                156
              </Typography>
              <Typography
                fontSize={11}
                color="#2e7d32"
                fontWeight={600}
                mt={0.5}
              >
                ↑ 3% from last month
              </Typography>
            </Box>
            <Inventory sx={{ fontSize: 32, color: "#4caf50", opacity: 0.8 }} />
          </Paper>
        </Grid>
      </Grid>

      {/* Top KPIs */}
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
              Monthly revenue
            </Typography>

            <Typography
              fontSize={26}
              fontWeight={900}
              mt={1}
              color="text.primary"
            >
              $248,900
            </Typography>

            <Typography fontSize={12} color="text.secondary" mt={1}>
              Target: $270,000 · 7 reporting days left.
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
              Team performance
            </Typography>

            <Typography fontSize={12} color="text.secondary" mt={1}>
              Average close rate per sales rep.
            </Typography>

            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={76}
                sx={{
                  height: 6,
                  borderRadius: 999,
                  bgcolor: "rgba(239,108,0,0.2)",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: "#ef6c00",
                  },
                }}
              />
              <Typography fontSize={12} color="text.secondary" mt={0.5}>
                76% · top 10% in region
              </Typography>
            </Box>
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
              Customer satisfaction
            </Typography>

            <Typography
              fontSize={26}
              fontWeight={900}
              mt={1}
              color="text.primary"
            >
              4.8 / 5
            </Typography>

            <Chip
              label="124 new reviews"
              size="small"
              sx={{
                mt: 1.5,
                bgcolor: "rgba(46,125,50,0.12)",
                color: "#2e7d32",
                fontWeight: 600,
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom section */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Key initiatives */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography
              fontSize={14}
              fontWeight={800}
              mb={1.5}
              color="text.primary"
            >
              Key initiatives
            </Typography>

            {[
              "Launch premium sunglasses line",
              "Optimize warehouse picking route",
              "Refine returns policy",
            ].map((item, idx) => (
              <Box
                key={item}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1,
                  borderTop:
                    idx === 0
                      ? "1px solid rgba(0,0,0,0.08)"
                      : "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <Typography fontSize={13.5} color="text.primary">
                  {item}
                </Typography>

                <Chip
                  label={
                    idx === 0
                      ? "In progress"
                      : idx === 1
                        ? "Planned"
                        : "Review"
                  }
                  size="small"
                  sx={{
                    bgcolor: "rgba(25,118,210,0.12)",
                    color: "primary.main",
                    fontWeight: 600,
                  }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Risks */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography
              fontSize={14}
              fontWeight={800}
              mb={1.5}
              color="text.primary"
            >
              Risk & alerts
            </Typography>

            {RISK_ITEMS.map((risk, idx) => (
              <Box
                key={risk.label}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1,
                  borderTop:
                    idx === 0
                      ? "1px solid rgba(0,0,0,0.08)"
                      : "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <Typography fontSize={13.5} color="text.primary">
                  {risk.label}
                </Typography>

                <Chip
                  label={risk.severity}
                  size="small"
                  sx={{
                    ...SEVERITY_STYLES[risk.severity],
                    fontWeight: 600,
                  }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}