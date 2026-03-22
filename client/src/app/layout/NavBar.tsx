import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { observer, Observer } from "mobx-react-lite";
import {
  LocalMallOutlined,
  PersonOutline,
} from "@mui/icons-material";
import {
  Alert,
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  LinearProgress,
  Toolbar,
  Typography,
} from "@mui/material";

import { useStore } from "../../lib/hooks/useStore";
import { useAccount } from "../../lib/hooks/useAccount";
import { useCart } from "../../lib/hooks/useCart";
import { useCategories } from "../../lib/hooks/useProducts";
import UserMenu from "./UserMenu";
import CartDropdown from "../components/cart/CartDropdown";
import { COLORS } from "../theme/colors";
import { COLLECTION_PRODUCT_FONT } from "../../features/collections/collectionFonts";

// ===== Styles =====
const ACCENT = COLORS.accentGold;
const NAV_HEIGHT = 56; // keep in sync with hero padding-top

type NavAppearance = "hero" | "scrolled";

function makeNavBtnSx(appearance: NavAppearance) {
  const hero = appearance === "hero";
  const color = hero ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.92)";
  const hoverColor = hero ? "#FFFFFF" : "#FFFFFF";
  const underline = hero ? "rgba(255,255,255,0.85)" : ACCENT;

  return {
    textTransform: "none",
    fontFamily: COLLECTION_PRODUCT_FONT,
    fontWeight: 600,
    fontSize: 16,
    color,
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
      backgroundColor: underline,
      opacity: 0,
      transform: "scaleX(0.6)",
      transition: "opacity 160ms ease, transform 160ms ease",
    },
    "&:hover": {
      backgroundColor: "transparent",
      color: hoverColor,
      "&::after": {
        opacity: hero ? 0.55 : 0.4,
        transform: "scaleX(1)",
      },
    },
    "&.active": {
      color: hoverColor,
      fontWeight: 700,
      "&::after": {
        opacity: 1,
        transform: "scaleX(1)",
      },
    },
  } as const;
}

function makeAppBarSx(appearance: NavAppearance) {
  const hero = appearance === "hero";
  const bg = hero ? "transparent" : "#0B0B0B";
  const border = hero ? "transparent" : "rgba(255,255,255,0.10)";
  const blur = hero ? 0 : 22;
  const shadow = hero ? "none" : "0 10px 30px rgba(0,0,0,0.35)";

  return {
    top: 0,
    backgroundColor: bg,
    color: hero ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.92)",
    borderBottom: `1px solid ${border}`,
    zIndex: 3000,
    backdropFilter: blur ? `blur(${blur}px)` : "none",
    WebkitBackdropFilter: blur ? `blur(${blur}px)` : "none",
    boxShadow: shadow,
    transition:
      "background-color 260ms ease, border-color 260ms ease, box-shadow 260ms ease, color 260ms ease, backdrop-filter 260ms ease",
  } as const;
}

function makeIconButtonSx(appearance: NavAppearance) {
  const hero = appearance === "hero";
  const color = hero ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.90)";
  const hoverBg = hero ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.10)";
  const hoverBorder = hero ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.14)";

  return {
    color,
    width: 40,
    height: 40,
    borderRadius: "999px",
    border: "1px solid transparent",
    transition:
      "background-color 200ms ease, border-color 200ms ease, transform 200ms ease, color 200ms ease",
    "&:hover": {
      backgroundColor: hoverBg,
      borderColor: hoverBorder,
      transform: "translateY(-1px)",
    },
  } as const;
}

const FALLBACK_MENU_ITEMS = [
  { label: "Eyeglasses", to: "/collections/eyeglasses" },
  { label: "Sunglasses", to: "/collections/sunglasses" },
  { label: "Lens", to: "/collections/lens" },
] as const;

// ================= COMPONENT =================
const NavBar = observer(function NavBar({
  collapsed,
  appearance,
}: {
  collapsed?: boolean;
  appearance?: NavAppearance;
}) {
  const { uiStore } = useStore();
  const navigate = useNavigate();
  const { currentUser } = useAccount();
  const { cart } = useCart();
  const { categories } = useCategories();
  const location = useLocation();
  const isLoggedIn = Boolean(currentUser?.id);
  const isHeroPage = location.pathname === "/";
  const [isPastHero, setIsPastHero] = useState(!isHeroPage);

  const menuItems = useMemo(() => {
    if (categories.length > 0) {
      return categories.map((c) => ({
        label: c.name,
        to: `/collections/${c.slug}`,
      }));
    }
    return FALLBACK_MENU_ITEMS.map((m) => ({ label: m.label, to: m.to }));
  }, [categories]);

  // Visual mode: single navbar, style switches by isPastHero (or forced appearance)
  const computedAppearance: NavAppearance =
    appearance ?? (isHeroPage ? (isPastHero ? "scrolled" : "hero") : "scrolled");

  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/register") {
      uiStore.clearSessionExpiredBanner();
    }
  }, [location.pathname, uiStore]);

  // Home-only: observe hero to switch appearance. Other pages: always scrolled.
  useEffect(() => {
    if (!isHeroPage || appearance) {
      setIsPastHero(true);
      return;
    }

    setIsPastHero(false);
    const hero = document.getElementById("home-hero");
    if (!hero) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsPastHero(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-56px 0px 0px 0px" },
    );

    io.observe(hero);
    return () => io.disconnect();
  }, [appearance, isHeroPage]);

  const APP_BAR_SX = useMemo(() => makeAppBarSx(computedAppearance), [computedAppearance]);
  const ICON_BUTTON_SX = useMemo(
    () => makeIconButtonSx(computedAppearance),
    [computedAppearance],
  );
  const hero = computedAppearance === "hero";
  const logoColor = "rgba(255,255,255,0.92)";
  const dividerColor = hero ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.16)";

  const menu = useMemo(
    () =>
      menuItems.map((item) => (
        <Button
          key={item.to}
          component={NavLink}
          to={item.to}
          sx={makeNavBtnSx(computedAppearance)}
        >
          {item.label}
        </Button>
      )),
    [menuItems, computedAppearance]
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          ...APP_BAR_SX,
          opacity: collapsed ? 0 : 1,
          // Khi scroll xuống: trượt navbar chính ra khỏi màn hình
          transform: collapsed ? `translateY(-${NAV_HEIGHT}px)` : "translateY(0px)",
          pointerEvents: collapsed ? "none" : "auto",
          transition:
            "opacity 220ms ease, transform 220ms ease, background-color 260ms ease, border-color 260ms ease, box-shadow 260ms ease, color 260ms ease, backdrop-filter 260ms ease",
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
          <Toolbar
            disableGutters
            sx={{
              minHeight: NAV_HEIGHT,
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, md: 3 },
            }}
          >
            {/* Logo */}
            <Box
              component={NavLink}
              to="/"
              sx={{ display: "flex", alignItems: "center", mr: 1, textDecoration: "none" }}
            >
              <Typography
                sx={{
                  fontFamily: COLLECTION_PRODUCT_FONT,
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  fontSize: 22,
                  color: logoColor,
                }}
              >
                EYEWEAR
              </Typography>
            </Box>

            {/* Menu */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, alignItems: "center" }}>
              {menu}
              <Button
                component={NavLink}
                to="/policies"
                sx={makeNavBtnSx(computedAppearance)}
              >
                Policies
              </Button>
            </Box>

            <Box sx={{ flex: 1 }} />

            {/* Right icons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isLoggedIn ? (
                <UserMenu />
              ) : (
                <IconButton component={NavLink} to="/login" sx={ICON_BUTTON_SX}>
                  <PersonOutline />
                </IconButton>
              )}

              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 0.75, borderColor: dividerColor }}
              />

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
                        bgcolor: hero ? "rgba(255,255,255,0.92)" : "#111827",
                        color: hero ? "#111827" : "#FFFFFF",
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

      {uiStore.sessionExpiredBanner && (
        <Alert
          severity="warning"
          variant="filled"
          sx={{
            position: "fixed",
            top: NAV_HEIGHT,
            left: 0,
            right: 0,
            zIndex: 2999,
            borderRadius: 0,
            py: 0.75,
            px: 2,
            alignItems: "center",
            "& .MuiAlert-message": { width: "100%" },
          }}
          action={
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 700,
                borderColor: "rgba(0,0,0,0.35)",
                color: "inherit",
                flexShrink: 0,
              }}
              onClick={() => {
                uiStore.clearSessionExpiredBanner();
                navigate("/login");
              }}
            >
              Đăng nhập lại
            </Button>
          }
        >
          <Typography component="span" sx={{ fontSize: 14, fontWeight: 600 }}>
            Phiên đăng nhập đã hết hạn — bạn đã được đăng xuất. Đăng nhập lại để dùng giỏ hàng và tài khoản.
          </Typography>
        </Alert>
      )}
    </Box>
  );
});

export default NavBar;
