import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useAccount } from "../../lib/hooks/useAccount";
import { Link } from "react-router";
import { Add, Logout, Person, StorefrontOutlined, BuildOutlined } from "@mui/icons-material";

export default function UserMenu() {
  const { currentUser, logoutUser } = useAccount();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Toggle: click avatar again to close dropdown
    if (open) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
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
          src={currentUser?.imageUrl || "/images/user.png"}
          slotProps={{ img: { referrerPolicy: "no-referrer" } }}
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
        slotProps={{
          paper: {
            sx: {
              mt: 1.2,
              borderRadius: 2,
              minWidth: 190,
              overflow: "hidden",
              boxShadow: "0px 10px 35px rgba(15,23,42,0.18)",
              "& .MuiMenuItem-root": {
                fontSize: 14,
                py: 1.1,
              },
            },
          },
          list: {
            "aria-labelledby": "basic-button",
          },
        }}
      >
        <MenuItem component={Link} to="/createActivity" onClick={handleClose}>
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText>Create Activity</ListItemText>
        </MenuItem>
        <MenuItem component={Link} to="/profile" onClick={handleClose}>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText>My profile</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem component={Link} to="/staff/sale-support" onClick={handleClose}>
          <ListItemIcon>
            <StorefrontOutlined />
          </ListItemIcon>
          <ListItemText>Sale/Support</ListItemText>
        </MenuItem>
        <MenuItem component={Link} to="/staff/operation" onClick={handleClose}>
          <ListItemIcon>
            <BuildOutlined />
          </ListItemIcon>
          <ListItemText>Operation</ListItemText>
        </MenuItem>
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
}
