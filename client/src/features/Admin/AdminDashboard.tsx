import { Box, Typography, Grid, Paper, Chip } from "@mui/material";
import { useAccount } from "../../lib/hooks/useAccount";

export default function AdminDashboard() {
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
          Admin Control
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 30, fontWeight: 900 }} color="text.primary">
          System overview
          {currentUser?.displayName ? `, ${currentUser.displayName}` : ""}.
        </Typography>
        <Typography sx={{ mt: 1, color: "text.secondary", maxWidth: 520, fontSize: 14 }}>
          Manage users, roles and platform health for the eyewear store.
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
              Active users
            </Typography>
            <Typography fontSize={26} fontWeight={900} mt={1} color="text.primary">
              1,248
            </Typography>
            <Typography fontSize={12} color="text.secondary" mt={1}>
              42 online right now · 218 new this month.
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
              Roles & access
            </Typography>
            <Typography fontSize={26} fontWeight={900} mt={1} color="text.primary">
              5
            </Typography>
            <Typography fontSize={12} color="text.secondary" mt={1}>
              Customer · Sales · Operations · Manager · Admin.
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
              System status
            </Typography>
            <Typography fontSize={26} fontWeight={900} mt={1} color="text.primary">
              All green
            </Typography>
            <Chip
              label="99.97% uptime"
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
              Pending approvals
            </Typography>
            {["New Sales user: sales@test.com", "Role change: operations → manager", "New brand: Horizon Frames"].map(
              (item, idx) => (
                <Box
                  key={item}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                    borderTop: idx === 0 ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Typography fontSize={13.5} color="text.primary">{item}</Typography>
                  <Chip
                    label="Review"
                    size="small"
                    sx={{
                      bgcolor: "rgba(25,118,210,0.12)",
                      color: "primary.main",
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
              Security & logs
            </Typography>
            {["New login from unknown device", "3 failed login attempts - admin@test.com", "API key rotated"].map(
              (log, idx) => (
                <Box
                  key={log}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                    borderTop: idx === 0 ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Typography fontSize={13.5} color="text.primary">{log}</Typography>
                  <Chip
                    label={idx === 1 ? "Alert" : "Info"}
                    size="small"
                    sx={{
                      bgcolor:
                        idx === 1
                          ? "rgba(211,47,47,0.12)"
                          : "rgba(25,118,210,0.12)",
                      color: idx === 1 ? "#c62828" : "primary.main",
                      fontWeight: 600,
                    }}
                  />
                </Box>
              ),
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

