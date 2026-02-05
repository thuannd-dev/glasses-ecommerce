import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  LinearProgress,
} from "@mui/material";
import { useAccount } from "../../lib/hooks/useAccount";

export default function SalesDashboard() {
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

      {/* Top metrics */}
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
              Today&apos;s revenue
            </Typography>
            <Typography fontSize={26} fontWeight={900} mt={1} color="text.primary">
              $12,840
            </Typography>
            <Chip
              label="+18% vs yesterday"
              size="small"
              sx={{
                mt: 1.5,
                bgcolor: "rgba(46,125,50,0.12)",
                color: "#2e7d32",
                fontWeight: 700,
              }}
            />
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
              Orders in progress
            </Typography>
            <Typography fontSize={26} fontWeight={900} mt={1} color="text.primary">
              74
            </Typography>
            <Typography fontSize={12} color="text.secondary" mt={1}>
              12 awaiting payment · 9 awaiting shipment
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
              Conversion funnel
            </Typography>
            <Typography fontSize={12} color="text.secondary" mt={1}>
              Visitors → Added to cart → Purchased
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography fontSize={11} color="text.secondary">
                Cart conversion
              </Typography>
              <LinearProgress
                variant="determinate"
                value={68}
                sx={{
                  mt: 0.5,
                  height: 6,
                  borderRadius: 999,
                  bgcolor: "rgba(25,118,210,0.2)",
                  "& .MuiLinearProgress-bar": { bgcolor: "primary.main" },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom section: fake tables */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
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
            <Typography fontSize={14} fontWeight={800} mb={1.5} color="text.primary">
              Top products
            </Typography>
            {["Aviator Classic", "Studio Round", "Midnight Square"].map(
              (name, idx) => (
                <Box
                  key={name}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                    borderTop: idx === 0 ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Box>
                    <Typography fontSize={13.5} fontWeight={700} color="text.primary">
                      {name}
                    </Typography>
                    <Typography fontSize={12} color="text.secondary">
                      32 orders · $4,280
                    </Typography>
                  </Box>
                  <Chip
                    label="In stock"
                    size="small"
                    sx={{
                      bgcolor: "rgba(46,125,50,0.12)",
                      color: "#2e7d32",
                      fontWeight: 600,
                    }}
                  />
                </Box>
              ),
            )}
          </Paper>
        </Grid>

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
            <Typography fontSize={14} fontWeight={800} mb={1.5} color="text.primary">
              Recent orders
            </Typography>
            {["#1024", "#1023", "#1022"].map((code, idx) => (
              <Box
                key={code}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1,
                  borderTop: idx === 0 ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <Box>
                  <Typography fontSize={13.5} fontWeight={700} color="text.primary">
                    Order {code}
                  </Typography>
                  <Typography fontSize={12} color="text.secondary">
                    3 items · $289.00 · 5 min ago
                  </Typography>
                </Box>
                <Chip
                  label="Paid"
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
      </Grid>
    </Box>
  );
}
