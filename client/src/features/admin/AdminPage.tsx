import {
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Toolbar,
  Paper,
} from "@mui/material";
import { useState } from "react";
import { AdminPanelSettings, People } from "@mui/icons-material";
import UserManagement from "./components/UserManagement";

interface AdminMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    id: "users",
    label: "Users",
    icon: <People />,
    component: <UserManagement />,
  },
];

export default function AdminPage() {
  const [selectedMenuItem, setSelectedMenuItem] = useState("users");

  const currentMenu = ADMIN_MENU_ITEMS.find((item) => item.id === selectedMenuItem);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* ========== Sidebar Menu ========== */}
      <Drawer
        variant="permanent"
        sx={{
          width: 260,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 260,
            boxSizing: "border-box",
            borderRight: "1px solid rgba(0, 0, 0, 0.08)",
            backgroundColor: "#fff",
            paddingTop: 0,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <AdminPanelSettings sx={{ fontSize: 28, color: "#4f46e5" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Admin
            </Typography>
          </Box>
        </Box>

        <List>
          {ADMIN_MENU_ITEMS.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={selectedMenuItem === item.id}
                onClick={() => setSelectedMenuItem(item.id)}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "rgba(99, 102, 241, 0.1)",
                    borderLeft: "4px solid #6366f1",
                    pl: 1.85,
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* ========== Main Content ========== */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 3, flex: 1 }}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "none" }}>
            {currentMenu && currentMenu.component}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
