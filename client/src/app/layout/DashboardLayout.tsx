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
import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import MoveToInboxOutlinedIcon from "@mui/icons-material/MoveToInboxOutlined";
import OutboxOutlined from "@mui/icons-material/OutboxOutlined";
import HistoryOutlined from "@mui/icons-material/HistoryOutlined";
import SecurityIcon from "@mui/icons-material/Security";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import StorefrontOutlined from "@mui/icons-material/StorefrontOutlined";
import MoveToInboxOutlined from "@mui/icons-material/MoveToInboxOutlined";
import LocalOfferOutlined from "@mui/icons-material/LocalOfferOutlined";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useAccount } from "../../lib/hooks/useAccount";

const SIDEBAR_WIDTH = 272;

const DASHBOARD_LINKS: { path: string; label: string; role: string; icon: React.ReactNode }[] = [
  { path: "/sales", label: "Sales", role: "Sales", icon: <PointOfSaleIcon /> },
  { path: "/operations", label: "Operations", role: "Operations", icon: <LocalShippingIcon /> },
  { path: "/manager", label: "Manager", role: "Manager", icon: <ManageAccountsIcon /> },
  { path: "/admin", label: "Admin", role: "Admin", icon: <AdminPanelSettingsIcon /> },
];

const SALES_SUB_LINKS: { path: string; label: string; icon: React.ReactNode }[] = [
  { path: "/sales", label: "Overview", icon: <PointOfSaleIcon /> },
  { path: "/sales/orders", label: "Orders", icon: <Inventory2Outlined /> },
  { path: "/sales/tickets", label: "Tickets", icon: <HistoryOutlined /> },
];

const MANAGER_SUB_LINKS: { path: string; label: string; icon: React.ReactNode }[] = [
  { path: "/manager", label: "Dashboard", icon: <DashboardOutlined /> },
  { path: "/manager/products", label: "Products", icon: <StorefrontOutlined /> },
  { path: "/manager/inbound", label: "Inbound", icon: <MoveToInboxOutlined /> },
  { path: "/manager/promotions", label: "Promotions", icon: <LocalOfferOutlined /> },
];

const ADMIN_SUB_LINKS: { path: string; label: string; icon: React.ReactNode }[] = [
  { path: "/admin", label: "Dashboard", icon: <AdminPanelSettingsIcon /> },
  { path: "/admin/roles", label: "Role Management", icon: <SecurityIcon /> },
  { path: "/admin/policies", label: "Policies", icon: <SecurityIcon /> },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [salesOrdersOpen, setSalesOrdersOpen] = useState(true);
  const [operationsOpen, setOperationsOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);
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
          bgcolor: "#ffffff",
          borderRight: sidebarOpen ? "1px solid rgba(0,0,0,0.08)" : "none",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <List sx={{ pt: 2, px: 1, flex: 1, overflowY: "auto", overflowX: "hidden" }}>
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
                      const isActive = location.pathname === "/sales";
                      return (
                        <ListItemButton
                          key={sub.path}
                          component={NavLink}
                          to={sub.path}
                          end
                          sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            color: isActive ? "#171717" : "rgba(0,0,0,0.7)",
                            borderLeft: "3px solid transparent",
                            pl: 1.5,
                            ...(isActive
                              ? {
                                  bgcolor: "rgba(182,140,90,0.12)",
                                  color: "#171717",
                                  borderLeftColor: "#B68C5A",
                                }
                              : {}),
                            "&:hover": {
                              bgcolor: "rgba(0,0,0,0.04)",
                              color: "#171717",
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 40,
                              color: isActive ? "#B68C5A" : "inherit",
                            }}
                          >
                            {sub.icon}
                          </ListItemIcon>
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
                                  color: "#8A8A8A",
                                  borderLeft: "3px solid transparent",
                                  pl: 1.5,
                                  "&:hover": {
                                    bgcolor: "rgba(0,0,0,0.04)",
                                    color: "#171717",
                                  },
                                } as const;

                                const activeStyles = {
                                  bgcolor: "rgba(182,140,90,0.12)",
                                  color: "#171717",
                                  borderLeftColor: "#B68C5A",
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

                    if (sub.path === "/sales/tickets") {
                      return (
                        <ListItemButton
                          key={sub.path}
                          component={NavLink}
                          to={sub.path}
                          sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            color: "rgba(0,0,0,0.7)",
                            borderLeft: "3px solid transparent",
                            pl: 1.5,
                            "&.active": {
                              bgcolor: "rgba(182,140,90,0.12)",
                              color: "#171717",
                              borderLeftColor: "#B68C5A",
                            },
                            "&:hover": {
                              bgcolor: "rgba(0,0,0,0.04)",
                              color: "#171717",
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>{sub.icon}</ListItemIcon>
                          <ListItemText primary={sub.label} primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
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
                      {/* Order type group */}
                      <Typography
                        sx={{
                          fontSize: 11,
                          letterSpacing: 2,
                          textTransform: "uppercase",
                          color: "text.secondary",
                          px: 1.5,
                          pt: 1.5,
                          pb: 0.5,
                        }}
                      >
                        Order type
                      </Typography>
                      {[
                        { path: "/operations/order-types", label: "All", icon: <DashboardOutlined /> },
                        { path: "/operations/standard", label: "Standard", icon: <StorefrontOutlined /> },
                        { path: "/operations/pre-order", label: "Pre-order", icon: <ScheduleOutlined /> },
                        { path: "/operations/prescription", label: "Prescription", icon: <VisibilityOutlined /> },
                      ].map((sub) => {
                        const isActive = location.pathname === sub.path;
                        return (
                          <ListItemButton
                            key={sub.path}
                            component={NavLink}
                            to={sub.path}
                            sx={{
                              borderRadius: 2,
                              mb: 0.25,
                              color: isActive ? "#171717" : "#8A8A8A",
                              borderLeft: "3px solid transparent",
                              pl: 1.5,
                              "&.active": {
                                bgcolor: "rgba(182,140,90,0.12)",
                                color: "#171717",
                                borderLeftColor: "#B68C5A",
                              },
                              "&:hover": {
                                bgcolor: "rgba(0,0,0,0.04)",
                                color: "#171717",
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 32,
                                color: isActive ? "#B68C5A" : "inherit",
                              }}
                            >
                              {sub.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={sub.label}
                              primaryTypographyProps={{ fontWeight: 600 }}
                            />
                          </ListItemButton>
                        );
                      })}

                      {/* After-sales group */}
                      <Typography
                        sx={{
                          fontSize: 11,
                          letterSpacing: 2,
                          textTransform: "uppercase",
                          color: "text.secondary",
                          px: 1.5,
                          pt: 1.5,
                          pb: 0.5,
                        }}
                      >
                        After-sales
                      </Typography>
                      {[
                        { path: "/operations/tickets", label: "Tickets", icon: <HistoryOutlined /> },
                      ].map((sub) => {
                        const isActive = location.pathname === sub.path;
                        return (
                          <ListItemButton
                            key={sub.path}
                            component={NavLink}
                            to={sub.path}
                            sx={{
                              borderRadius: 2,
                              mb: 0.25,
                              color: isActive ? "#171717" : "#8A8A8A",
                              borderLeft: "3px solid transparent",
                              pl: 1.5,
                              "&.active": {
                                bgcolor: "rgba(182,140,90,0.12)",
                                color: "#171717",
                                borderLeftColor: "#B68C5A",
                              },
                              "&:hover": {
                                bgcolor: "rgba(0,0,0,0.04)",
                                color: "#171717",
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 32,
                                color: isActive ? "#B68C5A" : "inherit",
                              }}
                            >
                              {sub.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={sub.label}
                              primaryTypographyProps={{ fontWeight: 600 }}
                            />
                          </ListItemButton>
                        );
                      })}

                      {/* Inventory group */}
                      <Typography
                        sx={{
                          fontSize: 11,
                          letterSpacing: 2,
                          textTransform: "uppercase",
                          color: "text.secondary",
                          px: 1.5,
                          pt: 1.5,
                          pb: 0.5,
                        }}
                      >
                        Inventory
                      </Typography>
                      {[
                        { path: "/operations/stock", label: "Stock", icon: <Inventory2Outlined /> },
                        { path: "/operations/inbound", label: "Inbound", icon: <MoveToInboxOutlinedIcon /> },
                        { path: "/operations/outbound", label: "Outbound", icon: <OutboxOutlined /> },
                        { path: "/operations/inventory-transactions", label: "History", icon: <HistoryOutlined /> },
                      ].map((sub) => {
                        const isActive = location.pathname === sub.path;
                        return (
                          <ListItemButton
                            key={sub.path}
                            component={NavLink}
                            to={sub.path}
                            sx={{
                              borderRadius: 2,
                              mb: 0.25,
                              color: isActive ? "#171717" : "#8A8A8A",
                              borderLeft: "3px solid transparent",
                              pl: 1.5,
                              "&.active": {
                                bgcolor: "rgba(182,140,90,0.12)",
                                color: "#171717",
                                borderLeftColor: "#B68C5A",
                              },
                              "&:hover": {
                                bgcolor: "rgba(0,0,0,0.04)",
                                color: "#171717",
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 32,
                                color: isActive ? "#B68C5A" : "inherit",
                              }}
                            >
                              {sub.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={sub.label}
                              primaryTypographyProps={{ fontWeight: 600 }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </Fragment>
              );
            }

            if (path === "/manager") {
              return (
                <Fragment key="manager">
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
                    Manager
                  </Typography>
                  {MANAGER_SUB_LINKS.map((sub) => {
                    const isActive = sub.path === "/manager"
                      ? location.pathname === "/manager"
                      : location.pathname.startsWith(sub.path);
                    return (
                      <ListItemButton
                        key={sub.path}
                        component={NavLink}
                        to={sub.path}
                        end={sub.path === "/manager"}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          color: "rgba(0,0,0,0.7)",
                          borderLeft: "3px solid transparent",
                          pl: 1.5,
                          ...(isActive
                            ? {
                                bgcolor: "rgba(182,140,90,0.12)",
                                color: "#171717",
                                borderLeftColor: "#B68C5A",
                              }
                            : {}),
                          "&:hover": {
                            bgcolor: "rgba(0,0,0,0.04)",
                            color: "#171717",
                          },
                        }}
                      >
                        
                        <ListItemIcon
                          sx={{
                            minWidth: 40,
                            color: isActive ? "#B68C5A" : "inherit",
                          }}
                        >
                          {sub.icon}
                        </ListItemIcon>
                        <ListItemText primary={sub.label} primaryTypographyProps={{ fontWeight: 600 }} />
                      </ListItemButton>
                    );
                  })}
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

                  {/* Parent Settings group for Admin */}
                  <ListItemButton
                    onClick={() => setAdminOpen((open) => !open)}
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
                      <AdminPanelSettingsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Settings"
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    {adminOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>

                  <Collapse in={adminOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 4 }}>
                      {ADMIN_SUB_LINKS.map((sub) => {
                        const isActive = sub.path === "/admin"
                          ? location.pathname === "/admin"
                          : location.pathname.startsWith(sub.path);
                        return (
                          <ListItemButton
                            key={sub.path}
                            component={NavLink}
                            to={sub.path}
                            end={sub.path === "/admin"}
                            sx={{
                              borderRadius: 2,
                              mb: 0.25,
                              color: isActive ? "#171717" : "#8A8A8A",
                              borderLeft: "3px solid transparent",
                              pl: 1.5,
                              ...(isActive
                                ? {
                                    bgcolor: "rgba(182,140,90,0.12)",
                                    color: "#171717",
                                    borderLeftColor: "#B68C5A",
                                  }
                                : {}),
                              "&:hover": {
                                bgcolor: "rgba(0,0,0,0.04)",
                                color: "#171717",
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 32,
                                color: isActive ? "#B68C5A" : "inherit",
                              }}
                            >
                              {sub.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={sub.label}
                              primaryTypographyProps={{ fontWeight: 600 }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
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

        <List sx={{ px: 1, pb: 2, borderTop: "1px solid rgba(0,0,0,0.06)", pt: 1.5, mt: 1 }}>
          <ListItemButton
            onClick={handleLogout}
            disabled={logoutUser.isPending}
            sx={{
              borderRadius: 2,
              color: "#6B6B6B",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.04)",
                color: "#171717",
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
