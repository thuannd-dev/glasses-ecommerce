import { Box, List, ListItemButton, ListItemText, Divider, Typography } from "@mui/material";
import { Link, useLocation } from "react-router";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const ADMIN_MENU_ITEMS = [
  { label: "Dashboard", path: "/admin" },
  { label: "Role Management", path: "/admin/roles" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 250,
          bgcolor: "#ffffff",
          borderRight: "1px solid rgba(0,0,0,0.08)",
          p: 2,
          display: { xs: "none", md: "block" },
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "text.secondary",
            fontWeight: 700,
            mb: 3,
            px: 1,
          }}
        >
          Dashboard
        </Typography>

        <List sx={{ p: 0 }}>
          {ADMIN_MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: isActive ? "rgba(25, 118, 210, 0.12)" : "transparent",
                  color: isActive ? "primary.main" : "text.primary",
                  fontWeight: isActive ? 700 : 500,
                  "&:hover": {
                    bgcolor: "rgba(25, 118, 210, 0.08)",
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    sx: { fontSize: 13, fontWeight: "inherit" },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Divider sx={{ my: 3 }} />

        <Typography
          sx={{
            fontSize: 11,
            color: "text.secondary",
            px: 1,
            lineHeight: 1.6,
          }}
        >
          Admin version: 1.0.0
        </Typography>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          bgcolor: "#fafafa",
          overflowY: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
