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
import SecurityIcon from "@mui/icons-material/Security";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
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
  { path: "/sales/return-refund", label: "Return / Refund", icon: <AssignmentReturnIcon /> },
  { path: "/sales/warranty", label: "Warranty", icon: <VerifiedUserIcon /> },
];

const OPERATIONS_SUB_LINKS: { path: string; label: string; icon: React.ReactNode }[] = [
  { path: "/operations/pack", label: "Confirmed orders", icon: <Inventory2Outlined /> },
  { path: "/operations/create-shipment", label: "Packing orders", icon: <AddBoxOutlined /> },
  { path: "/operations/tracking", label: "Shipped", icon: <TrackChangesOutlined /> },
];

const ADMIN_SUB_LINKS: { path: string; label: string; icon: React.ReactNode }[] = [
  { path: "/admin", label: "Dashboard", icon: <AdminPanelSettingsIcon /> },
  { path: "/admin/roles", label: "Role Management", icon: <SecurityIcon /> },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [salesOrdersOpen, setSalesOrdersOpen] = useState(true);
  const [returnRefundOpen, setReturnRefundOpen] = useState(true);
  const [warrantyOpen, setWarrantyOpen] = useState(true);
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
        <List
          sx={{
            pt: 2,
            px: 1,
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0,0,0,0.2) transparent",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(0,0,0,0.2)",
              borderRadius: "3px",
              "&:hover": {
                background: "rgba(0,0,0,0.3)",
              },
            },
          }}
        >
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
                                const rawTypes =
                                  location.pathname.startsWith("/sales/orders")
                                    ? searchParams.get("type") ?? "ReadyStock"
                                    : null;
                                const allowedTypes = ["ReadyStock", "PreOrder", "Prescription"];
                                const currentTypes = rawTypes
                                  ?.split(",")
                                  .filter((t) => allowedTypes.includes(t)) || ["ReadyStock"];

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
                                      to={`/sales/orders?status=Pending&type=${currentTypes.join(",")}`}
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
                                      to={`/sales/orders?status=Confirmed&type=${currentTypes.join(",")}`}
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
                                      to={`/sales/orders?status=Cancelled&type=${currentTypes.join(",")}`}
                                      sx={{
                                        ...baseStyles,
                                        ...(isOrdersRoute && currentStatus === "Cancelled" ? activeStyles : {}),
                                      }}
                                    >
                                      <ListItemText
                                        primary="Cancelled"
                                        primaryTypographyProps={{ fontWeight: 500 }}
                                      />
                                    </ListItemButton>

                                    <ListItemButton
                                      component={NavLink}
                                      to={`/sales/orders?status=Delivered&type=${currentTypes.join(",")}`}
                                      sx={{
                                        ...baseStyles,
                                        ...(isOrdersRoute && currentStatus === "Delivered" ? activeStyles : {}),
                                      }}
                                    >
                                      <ListItemText
                                        primary="Complete"
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

                    // Return/Refund parent + dropdown children
                    if (sub.path === "/sales/return-refund") {
                      return (
                        <Fragment key="sales-return-refund-group">
                          <ListItemButton
                            onClick={() => setReturnRefundOpen((open) => !open)}
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
                              <AssignmentReturnIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary="Return / Refund"
                              primaryTypographyProps={{ fontWeight: 600 }}
                            />
                            {returnRefundOpen ? <ExpandLess /> : <ExpandMore />}
                          </ListItemButton>

                          <Collapse in={returnRefundOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ pl: 4 }}>
                              {(() => {
                                const searchParams = new URLSearchParams(location.search);
                                const currentStatus =
                                  location.pathname.startsWith("/sales/return-refund")
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

                                const isReturnRefundRoute = location.pathname.startsWith(
                                  "/sales/return-refund"
                                );

                                return (
                                  <>
                                    <ListItemButton
                                      component={NavLink}
                                      to="/sales/return-refund?status=Pending"
                                      sx={{
                                        ...baseStyles,
                                        ...(isReturnRefundRoute && currentStatus === "Pending"
                                          ? activeStyles
                                          : {}),
                                      }}
                                    >
                                      <ListItemText
                                        primary="Pending"
                                        primaryTypographyProps={{ fontWeight: 500 }}
                                      />
                                    </ListItemButton>

                                    <ListItemButton
                                      component={NavLink}
                                      to="/sales/return-refund?status=InProgress"
                                      sx={{
                                        ...baseStyles,
                                        ...(isReturnRefundRoute && currentStatus === "InProgress"
                                          ? activeStyles
                                          : {}),
                                      }}
                                    >
                                      <ListItemText
                                        primary="In Progress"
                                        primaryTypographyProps={{ fontWeight: 500 }}
                                      />
                                    </ListItemButton>

                                    <ListItemButton
                                      component={NavLink}
                                      to="/sales/return-refund?status=Resolved"
                                      sx={{
                                        ...baseStyles,
                                        ...(isReturnRefundRoute && currentStatus === "Resolved"
                                          ? activeStyles
                                          : {}),
                                      }}
                                    >
                                      <ListItemText
                                        primary="Resolved"
                                        primaryTypographyProps={{ fontWeight: 500 }}
                                      />
                                    </ListItemButton>

                                    <ListItemButton
                                      component={NavLink}
                                      to="/sales/return-refund?status=Rejected"
                                      sx={{
                                        ...baseStyles,
                                        ...(isReturnRefundRoute && currentStatus === "Rejected"
                                          ? activeStyles
                                          : {}),
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

                    // Warranty parent + dropdown children
                    if (sub.path === "/sales/warranty") {
                      return (
                        <Fragment key="sales-warranty-group">
                          <ListItemButton
                            onClick={() => setWarrantyOpen((open) => !open)}
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
                              <VerifiedUserIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary="Warranty"
                              primaryTypographyProps={{ fontWeight: 600 }}
                            />
                            {warrantyOpen ? <ExpandLess /> : <ExpandMore />}
                          </ListItemButton>

                          <Collapse in={warrantyOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ pl: 4 }}>
                              {(() => {
                                const searchParams = new URLSearchParams(location.search);
                                const currentStatus =
                                  location.pathname.startsWith("/sales/warranty")
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

                                const isWarrantyRoute = location.pathname.startsWith(
                                  "/sales/warranty"
                                );

                                return (
                                  <>
                                    <ListItemButton
                                      component={NavLink}
                                      to="/sales/warranty?status=Pending"
                                      sx={{
                                        ...baseStyles,
                                        ...(isWarrantyRoute && currentStatus === "Pending"
                                          ? activeStyles
                                          : {}),
                                      }}
                                    >
                                      <ListItemText
                                        primary="Pending"
                                        primaryTypographyProps={{ fontWeight: 500 }}
                                      />
                                    </ListItemButton>

                                    <ListItemButton
                                      component={NavLink}
                                      to="/sales/warranty?status=InProgress"
                                      sx={{
                                        ...baseStyles,
                                        ...(isWarrantyRoute && currentStatus === "InProgress"
                                          ? activeStyles
                                          : {}),
                                      }}
                                    >
                                      <ListItemText
                                        primary="In Progress"
                                        primaryTypographyProps={{ fontWeight: 500 }}
                                      />
                                    </ListItemButton>

                                    <ListItemButton
                                      component={NavLink}
                                      to="/sales/warranty?status=Resolved"
                                      sx={{
                                        ...baseStyles,
                                        ...(isWarrantyRoute && currentStatus === "Resolved"
                                          ? activeStyles
                                          : {}),
                                      }}
                                    >
                                      <ListItemText
                                        primary="Resolved"
                                        primaryTypographyProps={{ fontWeight: 500 }}
                                      />
                                    </ListItemButton>

                                    <ListItemButton
                                      component={NavLink}
                                      to="/sales/warranty?status=Rejected"
                                      sx={{
                                        ...baseStyles,
                                        ...(isWarrantyRoute && currentStatus === "Rejected"
                                          ? activeStyles
                                          : {}),
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
                  <List component="div" disablePadding sx={{ pl: 0 }}>
                      {/* Orders parent + dropdown children */}
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
                          <Inventory2Outlined />
                        </ListItemIcon>
                        <ListItemText
                          primary="Orders"
                          primaryTypographyProps={{ fontWeight: 500 }}
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
                              <ListItemText
                                primary={sub.label}
                                primaryTypographyProps={{ fontWeight: 500 }}
                              />
                            </ListItemButton>
                          ))}
                        </List>
                      </Collapse>

                      {/* Return/Refund Inspection parent + dropdown children */}
                      <ListItemButton
                        onClick={() => setReturnRefundOpen((open) => !open)}
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
                          <AssignmentReturnIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Return/Refund Inspection"
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                        {returnRefundOpen ? <ExpandLess /> : <ExpandMore />}
                      </ListItemButton>

                      <Collapse in={returnRefundOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding sx={{ pl: 4 }}>
                          {(() => {
                            const searchParams = new URLSearchParams(location.search);
                            const currentStatus =
                              location.pathname.startsWith("/operations/return-refund")
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

                            const isReturnRoute = location.pathname.startsWith("/operations/return-refund");

                            return (
                              <>
                                <ListItemButton
                                  component={NavLink}
                                  to="/operations/return-refund?status=Pending"
                                  sx={{
                                    ...baseStyles,
                                    ...(isReturnRoute && currentStatus === "Pending" ? activeStyles : {}),
                                  }}
                                >
                                  <ListItemText
                                    primary="Pending"
                                    primaryTypographyProps={{ fontWeight: 500 }}
                                  />
                                </ListItemButton>

                                <ListItemButton
                                  component={NavLink}
                                  to="/operations/return-refund?status=Approved"
                                  sx={{
                                    ...baseStyles,
                                    ...(isReturnRoute && currentStatus === "Approved" ? activeStyles : {}),
                                  }}
                                >
                                  <ListItemText
                                    primary="Approved"
                                    primaryTypographyProps={{ fontWeight: 500 }}
                                  />
                                </ListItemButton>

                                <ListItemButton
                                  component={NavLink}
                                  to="/operations/return-refund?status=Rejected"
                                  sx={{
                                    ...baseStyles,
                                    ...(isReturnRoute && currentStatus === "Rejected" ? activeStyles : {}),
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

                      {/* Warranty parent + dropdown children */}
                      <ListItemButton
                        onClick={() => setWarrantyOpen((open) => !open)}
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
                          <VerifiedUserIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Warranty"
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                        {warrantyOpen ? <ExpandLess /> : <ExpandMore />}
                      </ListItemButton>

                      <Collapse in={warrantyOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding sx={{ pl: 4 }}>
                          {(() => {
                            const searchParams = new URLSearchParams(location.search);
                            const currentStatus =
                              location.pathname.startsWith("/operations/warranty")
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

                            const isWarrantyRoute = location.pathname.startsWith("/operations/warranty");

                            return (
                              <>
                                <ListItemButton
                                  component={NavLink}
                                  to="/operations/warranty?status=Pending"
                                  sx={{
                                    ...baseStyles,
                                    ...(isWarrantyRoute && currentStatus === "Pending" ? activeStyles : {}),
                                  }}
                                >
                                  <ListItemText
                                    primary="Pending"
                                    primaryTypographyProps={{ fontWeight: 500 }}
                                  />
                                </ListItemButton>

                                <ListItemButton
                                  component={NavLink}
                                  to="/operations/warranty?status=Repair"
                                  sx={{
                                    ...baseStyles,
                                    ...(isWarrantyRoute && currentStatus === "Repair" ? activeStyles : {}),
                                  }}
                                >
                                  <ListItemText
                                    primary="Repair"
                                    primaryTypographyProps={{ fontWeight: 500 }}
                                  />
                                </ListItemButton>

                                <ListItemButton
                                  component={NavLink}
                                  to="/operations/warranty?status=Replace"
                                  sx={{
                                    ...baseStyles,
                                    ...(isWarrantyRoute && currentStatus === "Replace" ? activeStyles : {}),
                                  }}
                                >
                                  <ListItemText
                                    primary="Replace"
                                    primaryTypographyProps={{ fontWeight: 500 }}
                                  />
                                </ListItemButton>

                                <ListItemButton
                                  component={NavLink}
                                  to="/operations/warranty?status=Rejected"
                                  sx={{
                                    ...baseStyles,
                                    ...(isWarrantyRoute && currentStatus === "Rejected" ? activeStyles : {}),
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
                    </List>
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

        {/* Logout section - fixed at bottom */}

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
