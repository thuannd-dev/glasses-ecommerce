import { Box, Typography, Grid, Paper, Chip, LinearProgress } from "@mui/material";
import { useAccount } from "../../lib/hooks/useAccount";

export default function OperationsDashboard() {
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
          Operations Center
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 30, fontWeight: 900 }} color="text.primary">
          Hello{currentUser?.displayName ? `, ${currentUser.displayName}` : ""}.
        </Typography>
        <Typography sx={{ mt: 1, color: "text.secondary", maxWidth: 520, fontSize: 14 }}>
          Monitor inventory, fulfillment and logistics for all eyewear products.
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
              Units in stock
            </Typography>
            <Typography fontSize={26} fontWeight={900} mt={1} color="text.primary">
              3,482
            </Typography>
            <Typography fontSize={12} color="text.secondary" mt={1.5}>
              24 SKUs below safety stock level.
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
              Open fulfillments
            </Typography>
            <Typography fontSize={26} fontWeight={900} mt={1} color="text.primary">
              41
            </Typography>
            <Typography fontSize={12} color="text.secondary" mt={1}>
              9 same-day · 18 express · 14 standard.
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
              SLA compliance
            </Typography>
            <Typography fontSize={12} color="text.secondary" mt={1}>
              Orders shipped within promised time.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography fontSize={11} color="text.secondary">
                Last 7 days
              </Typography>
              <LinearProgress
                variant="determinate"
                value={92}
                sx={{
                  mt: 0.5,
                  height: 6,
                  borderRadius: 999,
                  bgcolor: "rgba(0,150,136,0.2)",
                  "& .MuiLinearProgress-bar": { bgcolor: "#009688" },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Lists */}
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
              Low stock alerts
            </Typography>
            {["Studio Round - Gold", "Midnight Square - Black", "Classic Rimless"].map(
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
                      8 units left · reorder recommended
                    </Typography>
                  </Box>
                  <Chip
                    label="Reorder"
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,152,0,0.12)",
                      color: "#e65100",
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
              Shipments
            </Typography>
            {["DHL - EU", "UPS - US", "Local courier"].map((name, idx) => (
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
                    14 in transit · ETA today
                  </Typography>
                </Box>
                <Chip
                  label="On time"
                  size="small"
                  sx={{
                    bgcolor: "rgba(46,125,50,0.12)",
                    color: "#2e7d32",
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

