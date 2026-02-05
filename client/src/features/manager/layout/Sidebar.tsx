import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  useTheme,
  useMediaQuery,
  Chip,
} from "@mui/material";
import {
  Dashboard,
  ShoppingCart,
  LocalShipping,
  AssignmentReturn,
  Inventory,
  Settings,
  Logout,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  {
    label: "Dashboard",
    icon: Dashboard,
    path: "/manager",
  },
  {
    label: "Inbound Approval",
    icon: LocalShipping,
    path: "/inbound-approval",
  },
  {
    label: "Return Approval",
    icon: AssignmentReturn,
    path: "/after-sales-approval",
  },
  {
    label: "Products",
    icon: Inventory,
    path: "/products",
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    path: "/orders",
  },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const sidebarContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "linear-gradient(135deg, #1a2332 0%, #222d3d 100%)",
      }}
    >
      {/* Logo/Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: "1px solid rgba(46, 204, 113, 0.2)",
          background: "rgba(46, 204, 113, 0.05)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 900,
              color: "white",
              letterSpacing: -0.5,
            }}
          >
            ⚙️
          </Typography>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 900,
              color: "white",
              letterSpacing: -0.5,
            }}
          >
            Manager
          </Typography>
        </Box>
        <Chip
          label="Control Hub"
          size="small"
          sx={{
            backgroundColor: "rgba(46, 204, 113, 0.2)",
            color: "#2ecc71",
            fontSize: 11,
            fontWeight: 600,
          }}
        />
      </Box>

      {/* Menu Items */}
      <List sx={{ flex: 1, pt: 2, px: 1 }}>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <ListItem
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              sx={{
                cursor: "pointer",
                mx: 1,
                mb: 0.8,
                px: 2,
                py: 1.5,
                borderRadius: 1.2,
                backgroundColor: active
                  ? "rgba(46, 204, 113, 0.15)"
                  : "transparent",
                borderLeft: active ? "3px solid #2ecc71" : "3px solid transparent",
                transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(46, 204, 113, 0.05)",
                  transition: "left 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                  zIndex: 0,
                },
                "&:hover": {
                  backgroundColor: active
                    ? "rgba(46, 204, 113, 0.25)"
                    : "rgba(46, 204, 113, 0.08)",
                  transform: "translateX(4px)",
                  borderLeftColor: "#2ecc71",
                  "&::before": {
                    left: "100%",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: active ? "#2ecc71" : "rgba(255,255,255,0.6)",
                  transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: active ? "scale(1.1)" : "scale(1)",
                }}
              >
                <Icon />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  sx: {
                    fontSize: 14,
                    fontWeight: active ? 700 : 500,
                    color: active ? "#2ecc71" : "rgba(255,255,255,0.8)",
                    transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                    letterSpacing: active ? 0.3 : 0,
                  },
                }}
              />
            </ListItem>
          );
        })}
      </List>

      {/* Divider */}
      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      {/* Bottom Menu */}
      <List sx={{ pt: 2, pb: 2 }}>
        <ListItem
          sx={{
            cursor: "pointer",
            mx: 1.5,
            px: 2,
            py: 1.5,
            borderRadius: 1,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: "rgba(46, 204, 113, 0.1)",
              transform: "translateX(2px)",
              "& svg": {
                color: "rgba(255,255,255,0.9)",
              },
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              color: "rgba(255,255,255,0.6)",
              transition: "all 0.3s ease",
            }}
          >
            <Settings />
          </ListItemIcon>
          <ListItemText
            primary="Settings"
            primaryTypographyProps={{
              sx: {
                fontSize: 14,
                color: "rgba(255,255,255,0.8)",
                transition: "all 0.3s ease",
              },
            }}
          />
        </ListItem>
        <ListItem
          sx={{
            cursor: "pointer",
            mx: 1.5,
            px: 2,
            py: 1.5,
            borderRadius: 1,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: "rgba(231, 76, 60, 0.15)",
              transform: "translateX(2px)",
              "& svg": {
                color: "#e74c3c",
              },
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              color: "rgba(255,255,255,0.6)",
              transition: "all 0.3s ease",
            }}
          >
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              sx: {
                fontSize: 14,
                color: "rgba(255,255,255,0.8)",
                transition: "all 0.3s ease",
              },
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          width: 280,
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          borderRight: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          zIndex: 1000,
        }}
      >
        {sidebarContent}
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        sx={{
          display: { xs: "block", md: "none" },
        }}
      >
        <Box sx={{ width: 250 }}>{sidebarContent}</Box>
      </Drawer>
    </>
  );
}
