import { Box, Typography, Grid, Paper } from "@mui/material";
import { useAccount } from "../../lib/hooks/useAccount";

export default function AdminDashboard() {
  const { currentUser } = useAccount();

  return (
    <>
      {/* Header Section */}
      <Box 
        sx={{ 
          mb: 6,
          background: "linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)",
          py: 3.5,
          px: 3.5,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "rgba(25, 118, 210, 0.1)",
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "primary.main",
            fontWeight: 700,
            opacity: 0.8,
          }}
        >
          Admin Console
        </Typography>
        <Typography sx={{ mt: 1.5, fontSize: 32, fontWeight: 900, color: "text.primary", letterSpacing: -0.5 }}>
          Welcome{currentUser?.displayName ? `, ${currentUser.displayName}` : ""}.
        </Typography>
        <Typography sx={{ mt: 1.5, color: "text.secondary", maxWidth: 700, fontSize: 15, lineHeight: 1.6 }}>
          Manage users, roles, policies, and platform health for the eyewear store.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: 2,
              bgcolor: "#ffffff",
              border: "1.5px solid",
              borderColor: "rgba(0,0,0,0.06)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                borderColor: "rgba(33, 150, 243, 0.2)",
              },
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
              📊 Active Users
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 900, mt: 1.5, color: "text.primary" }}>
              1,248
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 1.5, lineHeight: 1.5 }}>
              42 online now · 218 new this month
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: 2,
              bgcolor: "#ffffff",
              border: "1.5px solid",
              borderColor: "rgba(0,0,0,0.06)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                borderColor: "rgba(33, 150, 243, 0.2)",
              },
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
              👥 Roles & Access
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 900, mt: 1.5, color: "text.primary" }}>
              5
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 1.5, lineHeight: 1.5 }}>
              Customer · Sales · Operations · Manager · Admin
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: 2,
              bgcolor: "#ffffff",
              border: "1.5px solid",
              borderColor: "rgba(0,0,0,0.06)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                borderColor: "rgba(76, 175, 80, 0.2)",
              },
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
              ✅ System Status
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 900, mt: 1.5, color: "#2e7d32" }}>
              All Green
            </Typography>
            <Box
              sx={{
                display: "inline-flex",
                mt: 2,
                px: 2,
                py: 0.75,
                bgcolor: "rgba(76, 175, 80, 0.1)",
                color: "#2e7d32",
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "rgba(76, 175, 80, 0.3)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              99.97% uptime
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              bgcolor: "#ffffff",
              border: "1.5px solid",
              borderColor: "rgba(0,0,0,0.06)",
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              },
            }}
          >
            <Box sx={{ 
              p: 3, 
              borderBottom: "1px solid",
              borderColor: "rgba(0,0,0,0.06)",
              background: "linear-gradient(135deg, rgba(33, 150, 243, 0.04) 0%, rgba(33, 150, 243, 0.02) 100%)",
            }}>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                📋 Pending Approvals
              </Typography>
            </Box>
            {["New Sales user: sales@test.com", "Role change: operations → manager", "New brand: Horizon Frames"].map(
              (item, _idx) => (
                <Box
                  key={item}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 3,
                    py: 1.75,
                    borderTop: "1px solid",
                    borderColor: "rgba(0,0,0,0.04)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "rgba(33, 150, 243, 0.02)",
                    },
                  }}
                >
                  <Typography sx={{ fontSize: 14, color: "text.primary", fontWeight: 500 }}>{item}</Typography>
                  <Box
                    sx={{
                      px: 2,
                      py: 0.5,
                      bgcolor: "rgba(33, 150, 243, 0.1)",
                      color: "primary.main",
                      borderRadius: 1,
                      fontSize: 12,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Review
                  </Box>
                </Box>
              ),
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              bgcolor: "#ffffff",
              border: "1.5px solid",
              borderColor: "rgba(0,0,0,0.06)",
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              },
            }}
          >
            <Box sx={{ 
              p: 3, 
              borderBottom: "1px solid",
              borderColor: "rgba(0,0,0,0.06)",
              background: "linear-gradient(135deg, rgba(211, 47, 47, 0.04) 0%, rgba(211, 47, 47, 0.02) 100%)",
            }}>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                🔐 Security & Logs
              </Typography>
            </Box>
            {["New login from unknown device", "3 failed login attempts - admin@test.com", "API key rotated"].map(
              (log, idx) => (
                <Box
                  key={log}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 3,
                    py: 1.75,
                    borderTop: "1px solid",
                    borderColor: "rgba(0,0,0,0.04)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: idx === 1 ? "rgba(211, 47, 47, 0.02)" : "rgba(33, 150, 243, 0.02)",
                    },
                  }}
                >
                  <Typography sx={{ fontSize: 14, color: "text.primary", fontWeight: 500 }}>{log}</Typography>
                  <Box
                    sx={{
                      px: 2,
                      py: 0.5,
                      bgcolor: idx === 1 ? "rgba(211, 47, 47, 0.1)" : "rgba(33, 150, 243, 0.1)",
                      color: idx === 1 ? "#c62828" : "primary.main",
                      borderRadius: 1,
                      fontSize: 12,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {idx === 1 ? "Alert" : "Info"}
                  </Box>
                </Box>
              ),
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}

