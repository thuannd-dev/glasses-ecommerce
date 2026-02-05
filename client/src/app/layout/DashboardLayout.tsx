import { useState } from "react";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { NavLink, Outlet } from "react-router";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import LogoutIcon from "@mui/icons-material/Logout";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useAccount } from "../../lib/hooks/useAccount";

const SIDEBAR_WIDTH = 260;

const DASHBOARD_LINKS: { path: string; label: string; role: string; icon: React.ReactNode }[] = [
  { path: "/sales", label: "Sales", role: "Sales", icon: <PointOfSaleIcon /> },
  { path: "/operations", label: "Operations", role: "Operations", icon: <LocalShippingIcon /> },
  { path: "/manager", label: "Manager", role: "Manager", icon: <ManageAccountsIcon /> },
  { path: "/admin", label: "Admin", role: "Admin", icon: <AdminPanelSettingsIcon /> },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, logoutUser } = useAccount();
  const roles = currentUser?.roles ?? [];

  const visibleLinks = DASHBOARD_LINKS.filter((link) => roles.includes(link.role));

  const handleLogout = () => {
    logoutUser.mutate();
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#fafafa" }}>
      {/* Top bar: toggle button when sidebar closed */}
      <Box
        component="header"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          display: "flex",
          alignItems: "center",
          px: 1,
          bgcolor: "#ffffff",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <IconButton
          onClick={() => setSidebarOpen((o) => !o)}
          sx={{ color: "rgba(0,0,0,0.7)" }}
          aria-label={sidebarOpen ? "Đóng sidebar" : "Mở sidebar"}
        >
          {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
        <Typography variant="h6" sx={{ color: "rgba(0,0,0,0.6)", fontWeight: 600, ml: 1 }}>
          Dashboard
        </Typography>
      </Box>

      <Box
        component="aside"
        sx={{
          width: sidebarOpen ? SIDEBAR_WIDTH : 0,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 56px)",
          mt: 7,
          overflow: "hidden",
          bgcolor: "#ffffff",
          borderRight: sidebarOpen ? "1px solid rgba(0,0,0,0.08)" : "none",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <List sx={{ pt: 2, px: 1 }}>
          {visibleLinks.map(({ path, label, icon }) => (
            <ListItemButton
              key={path}
              component={NavLink}
              to={path}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: "rgba(0,0,0,0.7)",
                "&.active": {
                  bgcolor: "rgba(25,118,210,0.12)",
                  color: "primary.main",
                },
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.04)",
                  color: "rgba(0,0,0,0.9)",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>{icon}</ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ flex: 1 }} />

        <List sx={{ px: 1, pb: 2 }}>
          <ListItemButton
            onClick={handleLogout}
            disabled={logoutUser.isPending}
            sx={{
              borderRadius: 2,
              color: "#d32f2f",
              "&:hover": {
                bgcolor: "rgba(211,47,47,0.08)",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary={logoutUser.isPending ? "Đang đăng xuất…" : "Đăng xuất"}
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItemButton>
        </List>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          mt: 7,
          minHeight: "calc(100vh - 56px)",
          overflow: "auto",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
