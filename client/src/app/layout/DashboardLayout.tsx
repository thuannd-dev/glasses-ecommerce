import { Fragment, useState } from "react";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
} from "@mui/material";
import { NavLink, Outlet, useLocation } from "react-router";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import LogoutIcon from "@mui/icons-material/Logout";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import AddBoxOutlined from "@mui/icons-material/AddBoxOutlined";
import TrackChangesOutlined from "@mui/icons-material/TrackChangesOutlined";
import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";

import SecurityIcon from "@mui/icons-material/Security";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useAccount } from "../../lib/hooks/useAccount";

const SIDEBAR_WIDTH = 260;

const DASHBOARD_LINKS: { path: string; label: string; role: string; icon: React.ReactNode }[] = [
  { path: "/sales", label: "Sales", role: "Sales", icon: <PointOfSaleIcon /> },
  { path: "/operations", label: "Operations", role: "Operations", icon: <LocalShippingIcon /> },
  { path: "/manager", label: "Manager", role: "Manager", icon: <ManageAccountsIcon /> },
  { path: "/admin", label: "Admin", role: "Admin", icon: <AdminPanelSettingsIcon /> },
];

const SALES_SUB_LINKS: { path: string; label: string; icon: React.ReactNode }[] = [
  { path: "/sales", label: "Overview", icon: <PointOfSaleIcon /> },
  { path: "/sales/orders", label: "Orders", icon: <Inventory2Outlined /> },
];

const OPERATIONS_SUB_LINKS: { path: string; label: string; icon: React.ReactNode }[] = [
  { path: "/operations/pack", label: "Confirmed orders", icon: <Inventory2Outlined /> },
  { path: "/operations/create-shipment", label: "Packing orders", icon: <AddBoxOutlined /> },
  { path: "/operations/tracking", label: "Shipped", icon: <TrackChangesOutlined /> },
  { path: "/operations/pre-order", label: "Pre-order", icon: <ScheduleOutlined /> },
  { path: "/operations/prescription", label: "Prescription", icon: <VisibilityOutlined /> },
];

const ADMIN_SUB_LINKS: { path: string; label: string; icon: React.ReactNode }[] = [
  { path: "/admin", label: "Dashboard", icon: <AdminPanelSettingsIcon /> },
  { path: "/admin/roles", label: "Role Management", icon: <SecurityIcon /> },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [salesOrdersOpen, setSalesOrdersOpen] = useState(true);
  const [operationsOpen, setOperationsOpen] = useState(true);
  const { currentUser, logoutUser } = useAccount();
  const roles = Array.isArray(currentUser?.roles) ? currentUser.roles : [];
  const location = useLocation();

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
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
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
          position: "sticky",
          top: 56,
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
          {visibleLinks.map(({ path, label, icon }) => {
            if (path === "/sales") {
              return (
                <Fragment key="sales">
                  <Typography
                    sx={{
                      fontSize: 11,
                      letterSpacing: 4,
                      textTransform: "uppercase",
                      color: "text.secondary",
                      px: 2,
                      py: 1,
                      mt: 1,
                    }}
                  >
                    Sales
                  </Typography>
                  {SALES_SUB_LINKS.map((sub) => {
                    if (sub.path === "/sales") {
                      return (
                        <ListItemButton
                          key={sub.path}
                          component={NavLink}
                          to={sub.path}
                          end
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
                          <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>{sub.icon}</ListItemIcon>
                          <ListItemText primary={sub.label} primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                      );
                    }

                    // Orders parent + dropdown children
                    if (sub.path === "/sales/orders") {
                      return (
                        <Fragment key="sales-orders-group">
                          <ListItemButton
                            onClick={() => setSalesOrdersOpen((open) => !open)}
                            sx={{
                              borderRadius: 2,
                              mb: 0.25,
                              color: "rgba(0,0,0,0.7)",
                              "&:hover": {
                                bgcolor: "rgba(0,0,0,0.04)",
                                color: "rgba(0,0,0,0.9)",
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                              {sub.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary="Orders"
                              primaryTypographyProps={{ fontWeight: 600 }}
                            />
                            {salesOrdersOpen ? <ExpandLess /> : <ExpandMore />}
                          </ListItemButton>

                          <Collapse in={salesOrdersOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ pl: 4 }}>
                              {(() => {
                                const searchParams = new URLSearchParams(location.search);
                                const currentStatus =
                                  location.pathname.startsWith("/sales/orders")
                                    ? searchParams.get("status") ?? "Pending"
                                    : null;

                                const baseStyles = {
                                  borderRadius: 2,
                                  mb: 0.25,
                                  color: "rgba(0,0,0,0.7)",
                                  "&:hover": {
                                    bgcolor: "rgba(0,0,0,0.04)",
                                    color: "rgba(0,0,0,0.9)",
                                  },
                                } as const;

                                const activeStyles = {
                                  bgcolor: "rgba(25,118,210,0.12)",
                                  color: "primary.main",
                                } as const;

                                const isOrdersRoute = location.pathname.startsWith("/sales/orders");

                                return (
                                  <>
                                    <ListItemButton
                                      component={NavLink}
                                      to="/sales/orders?status=Pending"
                                      sx={{
                                        ...baseStyles,
                                        ...(isOrdersRoute && currentStatus === "Pending" ? activeStyles : {}),
                                      }}
                                    >
                                      <ListItemText
                                        primary="Pending"
                                        primaryTypographyProps={{ fontWeight: 500 }}
                                      />
                                    </ListItemButton>

                                    <ListItemButton
                                      component={NavLink}
                                      to="/sales/orders?status=Confirmed"
                                      sx={{
                                        ...baseStyles,
                                        ...(isOrdersRoute && currentStatus === "Confirmed" ? activeStyles : {}),
                                      }}
                                    >
                                      <ListItemText
                                        primary="Confirmed"
                                        primaryTypographyProps={{ fontWeight: 500 }}
                                      />
                                    </ListItemButton>

                                    <ListItemButton
                                      component={NavLink}
                                      to="/sales/orders?status=Cancelled"
                                      sx={{
                                        ...baseStyles,
                                        ...(isOrdersRoute && currentStatus === "Cancelled" ? activeStyles : {}),
                                      }}
                                    >
                                      <ListItemText
                                        primary="Rejected"
                                        primaryTypographyProps={{ fontWeight: 500 }}
                                      />
                                    </ListItemButton>
                                  </>
                                );
                              })()}
                            </List>
                          </Collapse>
                        </Fragment>
                      );
                    }

                    return null;
                  })}
                </Fragment>
              );
            }

            if (path === "/operations") {
              return (
                <Fragment key="operations">
                  <Typography
                    sx={{
                      fontSize: 11,
                      letterSpacing: 4,
                      textTransform: "uppercase",
                      color: "text.secondary",
                      px: 2,
                      py: 1,
                      mt: 1,
                    }}
                  >
                    Operations
                  </Typography>

                  {/* Parent Orders group for Operations, giống Sales */}
                  <ListItemButton
                    onClick={() => setOperationsOpen((open) => !open)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.25,
                      color: "rgba(0,0,0,0.7)",
                      "&:hover": {
                        bgcolor: "rgba(0,0,0,0.04)",
                        color: "rgba(0,0,0,0.9)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                      <LocalShippingIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Orders"
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    {operationsOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>

                  <Collapse in={operationsOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 4 }}>
                      {OPERATIONS_SUB_LINKS.map((sub) => (
                        <ListItemButton
                          key={sub.path}
                          component={NavLink}
                          to={sub.path}
                          sx={{
                            borderRadius: 2,
                            mb: 0.25,
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
                          <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
                            {sub.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={sub.label}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </Fragment>
              );
            }

            if (path === "/admin") {
              return (
                <Fragment key="admin">
                  <Typography
                    sx={{
                      fontSize: 11,
                      letterSpacing: 4,
                      textTransform: "uppercase",
                      color: "text.secondary",
                      px: 2,
                      py: 1,
                      mt: 1,
                    }}
                  >
                    Admin
                  </Typography>
                  {ADMIN_SUB_LINKS.map((sub) => (
                    <ListItemButton
                      key={sub.path}
                      component={NavLink}
                      to={sub.path}
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
                      <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>{sub.icon}</ListItemIcon>
                      <ListItemText primary={sub.label} primaryTypographyProps={{ fontWeight: 600 }} />
                    </ListItemButton>
                  ))}
                </Fragment>
              );
            }

            return (
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
            );
          })}
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
              primary={
                logoutUser.isPending ? "Signing out…" : "Sign out"
              }
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
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
