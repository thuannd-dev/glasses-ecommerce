import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
import { useCart } from "../../lib/hooks/useCart";
import { useCategories } from "../../lib/hooks/useProducts";
import UserMenu from "./UserMenu";
import CartDropdown from "../components/cart/CartDropdown";
import { COLORS } from "../theme/colors";

// ===== Styles =====
const ACCENT = COLORS.accentGold;

const NAV_BTN_SX = {
  textTransform: "none",
  fontWeight: 600,
  fontSize: 13.5,
  color: COLORS.textPrimary,
  px: 1.4,
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    left: "20%",
    right: "20%",
    bottom: 0,
    height: 2,
    borderRadius: 999,
    backgroundColor: ACCENT,
    opacity: 0,
    transform: "scaleX(0.6)",
    transition: "opacity 160ms ease, transform 160ms ease",
  },
  "&:hover": {
    backgroundColor: "transparent",
    color: "#171717",
    "&::after": {
      opacity: 0.4,
      transform: "scaleX(1)",
    },
  },
  "&.active": {
    color: "#171717",
    fontWeight: 700,
    "&::after": {
      opacity: 1,
      transform: "scaleX(1)",
    },
  },
} as const;

const APP_BAR_SX = {
  top: 0,
  backgroundColor: "rgba(250,248,244,0.92)",
  color: COLORS.textPrimary,
  borderBottom: `1px solid ${COLORS.borderSoft}`,
  zIndex: 3000,
  backdropFilter: "blur(8px)",
} as const;

const SEARCH_BOX_SX = {
  width: { xs: "100%", sm: 420, md: 520 },
  maxWidth: 640,
  display: "flex",
  alignItems: "center",
  gap: 1,
  px: 1.5,
  height: 40,
  borderRadius: 999,
  border: `1px solid ${COLORS.borderSoft}`,
  backgroundColor: COLORS.bgSubtle,
  transition: "border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
  "&:focus-within": {
    borderColor: ACCENT,
    boxShadow: `0 0 0 1px ${alpha(ACCENT, 0.18)}`,
    backgroundColor: COLORS.bgSurface,
  },
} as const;

const ICON_BUTTON_SX = {
  color: COLORS.textSecondary,
  width: 40,
  height: 40,
  borderRadius: "999px",
  border: "1px solid transparent",
  transition: "background-color 160ms ease, border-color 160ms ease, transform 160ms ease, color 160ms ease",
  "&:hover": {
    backgroundColor: COLORS.bgSubtle,
    borderColor: COLORS.borderSoft,
    transform: "translateY(-1px)",
  },
} as const;

const FALLBACK_MENU_ITEMS = [
  { label: "Eyeglasses", to: "/collections/eyeglasses" },
  { label: "Sunglasses", to: "/collections/sunglasses" },
  { label: "Lens", to: "/collections/lens" },
] as const;

// ================= COMPONENT =================
const NavBar = observer(function NavBar() {
  const { uiStore } = useStore();
  const { currentUser } = useAccount();
  const { cart } = useCart();
  const { categories } = useCategories();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const menuItems = useMemo(() => {
    if (categories.length > 0) {
      return categories.map((c) => ({
        label: c.name,
        to: `/collections/${c.slug}`,
      }));
    }
    return FALLBACK_MENU_ITEMS.map((m) => ({ label: m.label, to: m.to }));
  }, [categories]);

  // Sync navbar search with current URL query (?search=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlSearch = params.get("search") ?? "";
    setSearchTerm(urlSearch);
  }, [location.search]);

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = searchTerm.trim();

    // If not on collections, go to /collections with search param
    if (!location.pathname.startsWith("/collections")) {
      const target = trimmed ? `/collections?search=${encodeURIComponent(trimmed)}` : "/collections";
      navigate(target);
      return;
    }

    // If already on collections, update search param but keep path
    const params = new URLSearchParams(location.search);
    if (trimmed) {
      params.set("search", trimmed);
    } else {
      params.delete("search");
    }
    navigate(`${location.pathname}?${params.toString()}`, { replace: false });
  };

  const menu = useMemo(
    () =>
      menuItems.map((item) => (
        <Button
          key={item.to}
          component={NavLink}
          to={item.to}
          sx={NAV_BTN_SX}
        >
          {item.label}
        </Button>
      )),
    [menuItems]
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" elevation={0} sx={APP_BAR_SX}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
          <Toolbar
            disableGutters
            sx={{
              minHeight: 72,
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, md: 3 },
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
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  fontSize: 18,
                  color: COLORS.textPrimary,
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
              <Box
                component="form"
                onSubmit={handleSubmitSearch}
                sx={SEARCH_BOX_SX}
              >
                <Search sx={{ fontSize: 18, color: COLORS.textMuted }} />
                <InputBase
                  placeholder="Search by brand or product name..."
                  sx={{
                    flex: 1,
                    fontSize: 13.5,
                    "& input::placeholder": {
                      color: COLORS.textMuted,
                    },
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Box>
            </Box>

            {/* Right icons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton sx={ICON_BUTTON_SX}>
                <FavoriteBorder />
              </IconButton>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 0.75, borderColor: "rgba(0,0,0,0.08)" }}
              />

              {currentUser ? (
                <UserMenu />
              ) : (
                <IconButton component={NavLink} to="/login" sx={ICON_BUTTON_SX}>
                  <PersonOutline />
                </IconButton>
              )}

              {/* CART */}
              <Box sx={{ position: "relative" }}>
                <IconButton
                  sx={ICON_BUTTON_SX}
                  onClick={() => {
                    uiStore.closeUserMenu();
                    uiStore.toggleCart();
                  }}
                >
                  <Badge
                    badgeContent={cart?.totalQuantity ?? 0}
                    sx={{
                      "& .MuiBadge-badge": {
                        bgcolor: "#111827",
                        color: "#FFFFFF",
                        fontSize: 11,
                        minWidth: 18,
                        height: 18,
                        px: 0.5,
                      },
                    }}
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
