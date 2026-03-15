import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  List,
  ListItemButton,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import { useStore } from "../../lib/hooks/useStore";
import { useAccount } from "../../lib/hooks/useAccount";
import { useCart } from "../../lib/hooks/useCart";
import { useDebouncedValue } from "../../lib/hooks/useDebouncedValue";
import { useCategories, useProducts } from "../../lib/hooks/useProducts";
import UserMenu from "./UserMenu";
import CartDropdown from "../components/cart/CartDropdown";
import { COLORS } from "../theme/colors";
import { normalizeForSearch } from "../../lib/utils/searchUtils";

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

/** Format price as USD for premium display (assumes API may return VND; convert if > 1000) */
function formatPriceUsd(price: number): string {
  const value = typeof price !== "number" || Number.isNaN(price) ? 0 : price;
  const usd = value > 1000 ? Math.round(value / 25000) : value;
  return `$${usd}`;
}

const SEARCH_DROPDOWN_PAPER_SX = {
  position: "absolute",
  top: "100%",
  left: 0,
  width: { xs: "100%", sm: 420, md: 520 },
  maxWidth: 640,
  mt: 1,
  maxHeight: 460,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  borderRadius: "18px",
  boxShadow: "0 12px 40px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.04)",
  border: `1px solid ${COLORS.borderSofter}`,
  backgroundColor: "#FFFFFF",
  zIndex: 3100,
  "& .search-dropdown-scroll": {
    overflowY: "auto",
    overflowX: "hidden",
    padding: "12px 0",
    maxHeight: 420,
    scrollBehavior: "smooth",
    // Ẩn scrollbar, vẫn cuộn được
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": { display: "none" },
  },
} as const;

const SEARCH_ITEM_SX = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  boxSizing: "border-box",
  gap: 2,
  py: 1.5,
  px: 2,
  borderRadius: "12px",
  transition: "all 0.15s ease",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#f7f7f7",
  },
} as const;

const SEARCH_ITEM_PRODUCT_INFO_SX = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  minWidth: 0,
  flex: "1 1 auto",
} as const;

const SEARCH_ITEM_THUMB_SX = {
  width: 44,
  height: 44,
  flexShrink: 0,
  borderRadius: "8px",
  backgroundColor: COLORS.bgMuted,
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
} as const;

const SEARCH_ITEM_PRICE_SX = {
  fontWeight: 600,
  fontSize: 14,
  color: COLORS.textPrimary,
  flexShrink: 0,
} as const;

const VIEW_ALL_ROW_SX = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 0.75,
  py: 1.5,
  px: 2,
  mx: 1.5,
  mb: 1,
  borderRadius: "12px",
  borderTop: `1px solid ${COLORS.borderSofter}`,
  pt: 1.5,
  mt: 0.5,
  transition: "background-color 0.2s ease",
  "&:hover": {
    backgroundColor: alpha(COLORS.bgSubtle, 0.6),
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
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [searchFocusedIndex, setSearchFocusedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchDropdownScrollRef = useRef<HTMLDivElement>(null);
  const searchItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);

  // Gửi API từ ngắn để có superset, rồi lọc client theo full keyword (để "ray ban" / "rayban" đều ra Ray-Ban)
  const searchForApi = (() => {
    if (!debouncedSearch) return undefined;
    if (debouncedSearch.includes(" "))
      return debouncedSearch.trim().split(/\s+/)[0] || undefined;
    if (debouncedSearch.length >= 3) return debouncedSearch.slice(0, 3);
    return debouncedSearch;
  })();

  const { products: searchProducts, isFetching: isSearchLoading } = useProducts(
    {
      search: searchForApi,
      pageSize: 10,
    },
    { enabled: debouncedSearch.length > 0 },
  );

  // Chỉ hiển thị sản phẩm có từ khóa trong tên hoặc brand (bỏ qua dấu, ký tự đặc biệt), so sánh theo chuẩn hóa
  const filteredSearchProducts = useMemo(() => {
    const q = normalizeForSearch(debouncedSearch);
    if (!q) return searchProducts;
    return searchProducts.filter(
      (p) =>
        normalizeForSearch(p.name).includes(q) ||
        normalizeForSearch(p.brand).includes(q),
    );
  }, [searchProducts, debouncedSearch]);

  const hasSearchTerm = searchTerm.trim().length > 0;
  const showDropdown = searchDropdownOpen;
  const viewAllIndex = filteredSearchProducts.length; // index for "View all results" row
  const maxFocusIndex = filteredSearchProducts.length; // 0..length-1 = products, length = view all

  const closeDropdown = useCallback(() => {
    setSearchDropdownOpen(false);
    setSearchFocusedIndex(-1);
  }, []);

  // Reset focused index when results change
  useEffect(() => {
    if (showDropdown) setSearchFocusedIndex(-1);
  }, [debouncedSearch, showDropdown]);

  // Keyboard navigation in search dropdown
  useEffect(() => {
    if (!showDropdown) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDropdown();
        return;
      }
      if (!searchContainerRef.current?.contains(document.activeElement)) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSearchFocusedIndex((i) => (i < maxFocusIndex ? i + 1 : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSearchFocusedIndex((i) => (i > -1 ? i - 1 : maxFocusIndex));
        return;
      }
      if (e.key === "Enter" && searchFocusedIndex >= 0) {
        e.preventDefault();
        if (searchFocusedIndex < filteredSearchProducts.length) {
          navigate(`/product/${filteredSearchProducts[searchFocusedIndex].id}`);
          closeDropdown();
        } else {
          const trimmed = searchTerm.trim();
          const target = trimmed
            ? `/collections/all?search=${encodeURIComponent(trimmed)}`
            : "/collections/all";
          navigate(target);
          closeDropdown();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    showDropdown,
    searchFocusedIndex,
    maxFocusIndex,
    filteredSearchProducts,
    searchTerm,
    navigate,
    closeDropdown,
  ]);

  // Scroll focused item into view (only for product items inside the scroll area)
  useEffect(() => {
    if (
      searchFocusedIndex < 0 ||
      searchFocusedIndex >= filteredSearchProducts.length ||
      !searchItemRefs.current[searchFocusedIndex]
    )
      return;
    searchItemRefs.current[searchFocusedIndex]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [searchFocusedIndex, filteredSearchProducts.length]);

  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown, closeDropdown]);

  const menuItems = useMemo(() => {
    if (categories.length > 0) {
      return categories.map((c) => ({
        label: c.name,
        to: `/collections/${c.slug}`,
      }));
    }
    return FALLBACK_MENU_ITEMS.map((m) => ({ label: m.label, to: m.to }));
  }, [categories]);

  // Sync navbar search với URL khi dropdown đóng (không auto-mở dropdown để tránh mở lại sau khi ấn View all)
  useEffect(() => {
    if (searchDropdownOpen) return;
    const params = new URLSearchParams(location.search);
    const urlSearch = params.get("search") ?? "";
    setSearchTerm(urlSearch);
  }, [location.search, searchDropdownOpen]);

  // Khi đang ở trang collections, cập nhật URL theo nội dung ô search (debounced)
  // để URL và thanh search luôn khớp nhau
  useEffect(() => {
    if (!location.pathname.startsWith("/collections")) return;
    const trimmed = debouncedSearch.trim();
    const params = new URLSearchParams(location.search);
    const currentSearch = params.get("search") ?? "";
    if (trimmed === currentSearch) return;
    if (trimmed) params.set("search", trimmed);
    else params.delete("search");
    const newSearch = params.toString();
    navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ""}`, { replace: true });
  }, [debouncedSearch, location.pathname, location.search, navigate]);

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = searchTerm.trim();

    // Luôn qua trang danh sách (CollectionPage) tại /collections/all, có search thì thêm ?search=
    if (!location.pathname.startsWith("/collections") || location.pathname === "/collections") {
      const target = trimmed ? `/collections/all?search=${encodeURIComponent(trimmed)}` : "/collections/all";
      navigate(target);
      return;
    }

    // Đã ở /collections/:category thì chỉ cập nhật param search
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
                ref={searchContainerRef}
                sx={{ position: "relative", width: "100%", maxWidth: 640 }}
              >
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
                    onFocus={() => setSearchDropdownOpen(true)}
                    onBlur={(e) => {
                    const next = e.relatedTarget as Node | null;
                    if (next && searchContainerRef.current?.contains(next)) return;
                    setTimeout(closeDropdown, 200);
                  }}
                  />
                </Box>

                {showDropdown && (
                  <Paper sx={SEARCH_DROPDOWN_PAPER_SX} elevation={0}>
                    {!hasSearchTerm ? (
                      <Box
                        sx={{
                          py: 4,
                          px: 3,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: COLORS.textMuted,
                            fontWeight: 500,
                            letterSpacing: "0.02em",
                          }}
                        >
                          Type to search by brand or product name
                        </Typography>
                      </Box>
                    ) : isSearchLoading ? (
                      <Box
                        sx={{
                          py: 4,
                          px: 2,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: COLORS.textMuted,
                            fontWeight: 500,
                            letterSpacing: "0.02em",
                          }}
                        >
                          Searching...
                        </Typography>
                      </Box>
                    ) : filteredSearchProducts.length === 0 ? (
                      <Box
                        sx={{
                          py: 5,
                          px: 3,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: COLORS.textPrimary,
                            fontWeight: 600,
                            mb: 0.5,
                          }}
                        >
                          No products found
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: COLORS.textMuted,
                            fontWeight: 400,
                            letterSpacing: "0.01em",
                          }}
                        >
                          Try searching by brand or model
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <div
                          ref={searchDropdownScrollRef}
                          className="search-dropdown-scroll"
                        >
                          <List disablePadding sx={{ width: "100%" }}>
                            {filteredSearchProducts.map((p, idx) => (
                              <ListItemButton
                                key={p.id}
                                ref={(el) => {
                                  searchItemRefs.current[idx] = el;
                                }}
                                component="button"
                                type="button"
                                onClick={() => {
                                  navigate(`/product/${p.id}`);
                                  closeDropdown();
                                }}
                                onMouseEnter={() => setSearchFocusedIndex(idx)}
                                sx={{
                                  ...SEARCH_ITEM_SX,
                                  backgroundColor:
                                    searchFocusedIndex === idx
                                      ? alpha(COLORS.bgSubtle, 0.8)
                                      : "transparent",
                                }}
                              >
                                <Box sx={SEARCH_ITEM_PRODUCT_INFO_SX} className="product-info">
                                  <Box sx={SEARCH_ITEM_THUMB_SX}>
                                    <Box
                                      component="img"
                                      src={p.image || ""}
                                      alt={p.name}
                                    />
                                  </Box>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                      variant="body1"
                                      sx={{
                                        fontWeight: 600,
                                        color: COLORS.textPrimary,
                                        fontSize: 14,
                                        lineHeight: 1.35,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {p.name}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: COLORS.textMuted,
                                        fontSize: 12,
                                        fontWeight: 500,
                                        letterSpacing: "0.02em",
                                        mt: 0.25,
                                      }}
                                    >
                                      {p.brand}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box sx={{ flexShrink: 0, textAlign: "right" }} className="product-price">
                                  <Typography
                                    component="span"
                                    sx={SEARCH_ITEM_PRICE_SX}
                                  >
                                    {formatPriceUsd(
                                      typeof p.price === "number" ? p.price : 0,
                                    )}
                                  </Typography>
                                </Box>
                              </ListItemButton>
                            ))}
                          </List>
                        </div>
                        <Box
                          component="button"
                          type="button"
                          ref={(el) => {
                            searchItemRefs.current[viewAllIndex] = el as HTMLButtonElement | null;
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const trimmed = searchTerm.trim();
                            const target = trimmed
                              ? `/collections/all?search=${encodeURIComponent(trimmed)}`
                              : "/collections/all";
                            closeDropdown();
                            navigate(target);
                          }}
                          onMouseEnter={() => setSearchFocusedIndex(viewAllIndex)}
                          sx={{
                            ...VIEW_ALL_ROW_SX,
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            width: "calc(100% - 24px)",
                            alignSelf: "center",
                            font: "inherit",
                            backgroundColor:
                              searchFocusedIndex === viewAllIndex
                                ? alpha(COLORS.bgSubtle, 0.6)
                                : "transparent",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: COLORS.textPrimary,
                              letterSpacing: "0.03em",
                            }}
                          >
                            View all results
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Paper>
                )}
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
