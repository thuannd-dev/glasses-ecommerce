import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useAccount } from "../../lib/hooks/useAccount";
import { useProfile } from "../../lib/hooks/useProfile";
import { useStore } from "../../lib/hooks/useStore";
import { avatarImageSrcFromPhotos } from "../../lib/utils/profileAvatarFromPhotos";
import { Link } from "react-router";
import { Dashboard, Logout, Person, ShoppingBag } from "@mui/icons-material";
import { useLocation } from "react-router-dom";

const UserMenu = observer(function UserMenu() {
  const { uiStore } = useStore();
  const { currentUser, logoutUser } = useAccount();
  const { photos } = useProfile(currentUser?.id);
  const location = useLocation();

  const navAvatarSrc = React.useMemo(
    () => avatarImageSrcFromPhotos(photos, currentUser?.imageUrl),
    [photos, currentUser?.imageUrl],
  );
  const anchorEl = uiStore.userMenuAnchor;
  const open = Boolean(anchorEl);
  const userRoles = Array.isArray(currentUser?.roles) ? currentUser.roles : [];
  const isCustomerOnly = userRoles.includes("Customer");

  const dashboardTarget = React.useMemo(() => {
    if (userRoles.includes("Admin")) return { label: "Admin dashboard", to: "/admin" };
    if (userRoles.includes("Manager")) return { label: "Manager dashboard", to: "/manager" };
    if (userRoles.includes("Operations")) return { label: "Operations dashboard", to: "/operations" };
    if (userRoles.includes("Sales")) return { label: "Sales dashboard", to: "/sales" };
    return null;
  }, [userRoles]);

  const isOnDashboardArea =
    location.pathname.startsWith("/sales") ||
    location.pathname.startsWith("/operations") ||
    location.pathname.startsWith("/manager") ||
    location.pathname.startsWith("/admin");

  const showDashboardMenuItem =
    !!dashboardTarget && !userRoles.includes("Customer") && !isOnDashboardArea;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (open) {
      uiStore.setUserMenuAnchor(null);
    } else {
      uiStore.closeCart();
      uiStore.setUserMenuAnchor(event.currentTarget);
    }
  };

  const handleClose = () => {
    uiStore.setUserMenuAnchor(null);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          p: 0,
          borderRadius: 999,
          border: "1px solid rgba(15,23,42,0.12)",
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: "#111827",
            fontSize: 14,
          }}
          src={navAvatarSrc}
          imgProps={{ referrerPolicy: "no-referrer" }}
        >
          {currentUser?.displayName?.[0]?.toUpperCase() ?? "?"}
        </Avatar>
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableScrollLock
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          elevation: 4,
          sx: {
            mt: 1.2,
            borderRadius: 2,
            minWidth: 190,
            overflow: "hidden",
            boxShadow:
              "0px 10px 35px rgba(15,23,42,0.18)",
            "& .MuiMenuItem-root": {
              fontSize: 14,
              py: 1.1,
            },
          },
        }}
        slotProps={{
          list: {
            "aria-labelledby": "basic-button",
          },
        }}
      >
        <MenuItem component={Link} to="/profile" onClick={handleClose}>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText>My profile</ListItemText>
        </MenuItem>
        {isCustomerOnly && (
          <MenuItem component={Link} to="/orders" onClick={handleClose}>
            <ListItemIcon>
              <ShoppingBag />
            </ListItemIcon>
            <ListItemText>View my orders</ListItemText>
          </MenuItem>
        )}
        {showDashboardMenuItem && dashboardTarget && (
          <MenuItem component={Link} to={dashboardTarget.to} onClick={handleClose}>
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText>{dashboardTarget.label}</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => {
            logoutUser.mutate();
            handleClose();
          }}
        >
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
});

export default UserMenu;
