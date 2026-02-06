import { useState } from "react";
import { Box, AppBar, Toolbar, IconButton, useTheme, useMediaQuery } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";

export default function ManagerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#FAFAF8" }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          ml: { xs: 0, md: "280px" },
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Top Bar */}
        {isMobile && (
          <AppBar
            position="sticky"
            sx={{
              backgroundColor: "white",
              color: "rgba(15,23,42,0.92)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setSidebarOpen(true)}
                sx={{
                  mr: 2,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(15,23,42,0.05)",
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
              <Box sx={{ fontSize: 18, fontWeight: 900 }}>⚙️ Manager</Box>
            </Toolbar>
          </AppBar>
        )}

        {/* Page Content */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            overflow: "auto",
            animation: "fadeIn 0.3s ease-in",
            "@keyframes fadeIn": {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
