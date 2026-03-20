import { Box, MenuItem, Select, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Dispatch, SetStateAction } from "react";
import type { CategoryOption } from "./FiltersSidebar";
import type { FiltersState, GlassesType, SortKey } from "../../../../lib/types";

type PriceValue = "any" | "under50" | "under100" | "under200" | "above200";
type TypeValue = "all" | GlassesType;
type BrandValue = "all" | string;

const FALLBACK_TYPES: { label: string; value: GlassesType }[] = [
  { label: "Eyeglasses", value: "eyeglasses" },
  { label: "Sunglasses", value: "sunglasses" },
];

const PRICE_OPTIONS: {
  value: Exclude<PriceValue, "any">;
  label: string;
  min: number | null;
  max: number | null;
}[] = [
  { value: "under50", label: "Under $50", min: null, max: 50 },
  { value: "under100", label: "Under $100", min: null, max: 100 },
  { value: "under200", label: "Under $200", min: null, max: 200 },
  { value: "above200", label: "Above $200", min: 200, max: null },
];

function selectSx(active: boolean, minWidth: number) {
  return {
    height: 38,
    minWidth,
    borderRadius: 999,
    flexShrink: 0,
    bgcolor: "#FFFFFF",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: active ? "rgba(182,140,90,0.65)" : "#ECECEC",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: active ? "rgba(182,140,90,0.75)" : "#E2E2E2",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: active ? "rgba(182,140,90,0.9)" : "#B68C5A",
    },
    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
      py: 0,
      fontSize: 14,
      color: "#171717",
    },
    "& .MuiSvgIcon-root": {
      color: active ? "rgba(182,140,90,0.95)" : "#8A8A8A",
    },
    "&.Mui-focused": {
      boxShadow: active ? "0 0 0 1px rgba(182,140,90,0.22)" : "0 0 0 1px rgba(182,140,90,0.16)",
    },
  };
}

function priceValueFromFilters(filters: FiltersState): PriceValue {
  if (filters.minPrice == null && filters.maxPrice == null) return "any";
  const matched = PRICE_OPTIONS.find(
    (o) => (filters.minPrice ?? null) === o.min && (filters.maxPrice ?? null) === o.max
  );
  return matched?.value ?? "any";
}

export function CollectionTopBar({
  sort,
  setSort,
  filters,
  setFilters,
  categories,
  brands,
}: {
  sort: SortKey;
  setSort: (v: SortKey) => void;
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
  categories?: CategoryOption[];
  brands?: string[];
}) {
  const navigate = useNavigate();

  const priceValue = priceValueFromFilters(filters);
  const priceActive = priceValue !== "any";

  const typeValue: TypeValue =
    filters.glassesTypes.includes("eyeglasses")
      ? "eyeglasses"
      : filters.glassesTypes.includes("sunglasses")
        ? "sunglasses"
        : "all";
  const typeActive = typeValue !== "all";

  const brandValue: BrandValue = filters.brand ?? "all";
  const brandActive = brandValue !== "all";

  const typeOptions = (() => {
    if (Array.isArray(categories) && categories.length > 0) {
      const normalized = new Set(["eyeglasses", "sunglasses"]);
      const matched = categories.filter((c) => normalized.has(String(c.slug).toLowerCase()));
      const mapped = matched.map((c) => ({
        label: c.name,
        value: String(c.slug).toLowerCase() as GlassesType,
      }));
      if (mapped.length > 0) return mapped;
    }
    return FALLBACK_TYPES;
  })();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        justifyContent: "flex-end",
        flexWrap: { xs: "wrap", md: "nowrap" },
      }}
    >
      {/* Left cluster: Price / Type / Brand (kept compact with Sort by) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: { xs: "wrap", sm: "nowrap" },
        }}
      >
        {/* Price */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          <Typography sx={{ fontSize: 13, color: "#8A8A8A" }}>Price</Typography>
          <Select
            value={priceValue}
            onChange={(e) => {
              const v = e.target.value as PriceValue;
              if (v === "any") {
                setFilters((prev) => ({ ...prev, minPrice: null, maxPrice: null }));
                return;
              }
              const opt = PRICE_OPTIONS.find((o) => o.value === v);
              if (!opt) return;
              setFilters((prev) => ({ ...prev, minPrice: opt.min, maxPrice: opt.max }));
            }}
            size="small"
            MenuProps={{
              disableScrollLock: true,
            }}
            sx={selectSx(priceActive, 150)}
          >
            <MenuItem value="any">Any</MenuItem>
            {PRICE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Type */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          <Typography sx={{ fontSize: 13, color: "#8A8A8A" }}>Type</Typography>
          <Select
            value={typeValue}
            onChange={(e) => {
              const v = e.target.value as TypeValue;
              if (v === "all") {
                setFilters((prev) => ({ ...prev, glassesTypes: [] }));
                navigate("/collections/all");
                return;
              }
              setFilters((prev) => ({ ...prev, glassesTypes: [v] }));
              navigate(`/collections/${v}`);
            }}
            size="small"
            MenuProps={{
              disableScrollLock: true,
            }}
            sx={selectSx(typeActive, 170)}
          >
            <MenuItem value="all">All</MenuItem>
            {typeOptions.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          <Typography sx={{ fontSize: 13, color: "#8A8A8A" }}>Brand</Typography>
          <Select
            value={brandValue}
            onChange={(e) => {
              const v = e.target.value as BrandValue;
              setFilters((prev) => ({
                ...prev,
                brand: v === "all" ? null : v,
              }));
            }}
            size="small"
            MenuProps={{
              disableScrollLock: true,
            }}
            sx={selectSx(brandActive, 170)}
          >
            <MenuItem value="all">All</MenuItem>
            {(brands ?? []).map((b) => (
              <MenuItem key={b} value={b}>
                {b}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Sort */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 13, color: "#8A8A8A" }}>Sort by</Typography>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          size="small"
          MenuProps={{
            disableScrollLock: true,
          }}
          sx={selectSx(sort !== "featured", 210)}
        >
          <MenuItem value="featured">Featured</MenuItem>
          <MenuItem value="priceAsc">Price: Low → High</MenuItem>
          <MenuItem value="priceDesc">Price: High → Low</MenuItem>
        </Select>
      </Box>
    </Box>
  );
}
