import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { observer, Observer } from "mobx-react-lite";
import {
  FavoriteBorder,
  LocalMallOutlined,
  PersonOutline,
  Search,
} from "@mui/icons-material";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  InputBase,
  LinearProgress,
  Toolbar,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import { useStore } from "../../lib/hooks/useStore";
import { useAccount } from "../../lib/hooks/useAccount";
import UserMenu from "./UserMenu";
import CartDropdown from "../components/cart/CartDropdown";
import { cartStore } from "../../lib/stores/cartStore";

// ===== Styles =====
const NAV_BTN_SX = {
  textTransform: "none",
  fontWeight: 600,
  fontSize: 13.5,
  color: "rgba(17,24,39,0.85)",
  px: 1.2,
  "&:hover": { backgroundColor: "transparent", color: "#111827" },
  "&.active": { color: "#111827" },
} as const;

const APP_BAR_SX = {
  top: 0,
  backgroundColor: "#fff",
  color: "#111827",
  borderBottom: "1px solid rgba(17,24,39,0.10)",
  zIndex: 3000,
} as const;

const SEARCH_BOX_SX = {
  width: { xs: "100%", sm: 420, md: 520 },
  maxWidth: 640,
  display: "flex",
  alignItems: "center",
  gap: 1,
  px: 1.5,
  height: 36,
  borderRadius: 999,
  border: "1px solid rgba(17,24,39,0.12)",
  backgroundColor: alpha("#fff", 1),
} as const;

const ICON_SX = { color: "rgba(17,24,39,0.75)" } as const;

const MENU_ITEMS = [
  { label: "Eyeglasses", to: "/collections/glasses" },
  { label: "Sunglasses", to: "/collections/fashion" },
  { label: "Lens", to: "/collections/lens" },
] as const;

// ================= COMPONENT =================
const NavBar = observer(function NavBar() {
  const { uiStore } = useStore();
  const { currentUser } = useAccount();

  const menu = useMemo(
    () =>
      MENU_ITEMS.map((item) => (
        <Button
          key={item.to}
          component={NavLink}
          to={item.to}
          sx={NAV_BTN_SX}
        >
          {item.label}
        </Button>
      )),
    []
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" elevation={0} sx={APP_BAR_SX}>
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: 56,
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: { xs: 1, md: 0 },
            }}
          >
            {/* Logo */}
            <Box
              component={NavLink}
              to="/collections"
              sx={{ display: "flex", alignItems: "center", mr: 1, textDecoration: "none" }}
            >
              <Typography
                sx={{
                  fontWeight: 900,
                  letterSpacing: 1.2,
                  fontSize: 18,
                  color: "#111827",
                }}
              >
                EYEWEAR
              </Typography>
            </Box>

            {/* Menu */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5 }}>
              {menu}
            </Box>

            {/* Search */}
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <Box sx={SEARCH_BOX_SX}>
                <Search sx={{ fontSize: 18, color: "rgba(17,24,39,0.55)" }} />
                <InputBase
                  placeholder="Search eyeglasses, sunglasses, lens..."
                  sx={{ flex: 1, fontSize: 13.5 }}
                />
              </Box>
            </Box>

            {/* Right icons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton sx={ICON_SX}>
                <FavoriteBorder />
              </IconButton>

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

              {currentUser ? (
                <UserMenu />
              ) : (
                <IconButton component={NavLink} to="/login" sx={ICON_SX}>
                  <PersonOutline />
                </IconButton>
              )}

              {/* CART */}
              <Box sx={{ position: "relative" }}>
                <IconButton
                  sx={ICON_SX}
                  onClick={() => uiStore.toggleCart()}
                >
                  <Badge
                    badgeContent={cartStore.totalQuantity}
                    color="primary"
                  >
                    <LocalMallOutlined />
                  </Badge>
                </IconButton>

                {uiStore.isCartOpen && <CartDropdown />}
              </Box>
            </Box>
          </Toolbar>
        </Container>

        {/* Loading bar */}
        <Observer>
          {() =>
            uiStore.isLoading ? (
              <LinearProgress
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                }}
              />
            ) : null
          }
        </Observer>
      </AppBar>
    </Box>
  );
});

export default NavBar;
