import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Checkbox,
    Divider,
    Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type React from "react";
import { type Dispatch, type SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import type { FiltersState, GlassesType } from "../../../../lib/types";
import { COLORS } from "../../../../app/theme/colors";

/** Category trả về từ GET /api/categories – khớp với category trong response list sản phẩm */
export type CategoryOption = {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
};

const FALLBACK_TYPES: { label: string; value: GlassesType }[] = [
    { label: "Eyeglasses", value: "eyeglasses" },
    { label: "Sunglasses", value: "sunglasses" },
];

const ACCENT = COLORS.accentGold;

const PRICE_OPTIONS: { id: string; label: string; min: number | null; max: number | null }[] = [
    { id: "under50", label: "Under $50", min: null, max: 50 },
    { id: "under100", label: "Under $100", min: null, max: 100 },
    { id: "under200", label: "Under $200", min: null, max: 200 },
    { id: "above200", label: "Above $200", min: 200, max: null },
];

const CHIP_SX = {
    px: 1.4,
    py: 0.7,
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.08)",
    fontWeight: 600,
    cursor: "pointer",
    userSelect: "none" as const,
    fontSize: 13,
};

export function FiltersSidebar({
    filters,
    setFilters,
    onReset,
    onApply,
    categories,
    brands,
    stickyTop = 88,
}: {
    filters: FiltersState;
    setFilters: Dispatch<SetStateAction<FiltersState>>;
    onReset: () => void;
    /** Gọi khi bấm NARROW DOWN – đóng drawer / áp dụng lọc */
    onApply?: () => void;
    /** Categories từ GET /api/categories – dùng cho Type (Eyeglasses/Sunglasses) */
    categories?: CategoryOption[];
    /** Brands từ GET /api/brands – dùng cho bộ lọc Brand */
    brands?: string[];
    stickyTop?: number;
}) {
    const navigate = useNavigate();

    const typeOptions =
        categories && categories.length > 0
            ? categories.map((c) => ({
                  label: c.name,
                  value: c.slug.toLowerCase() as GlassesType,
              }))
            : FALLBACK_TYPES;

    const isAllActive = filters.glassesTypes.length === 0;

    const handleTypeSelect = (slug: string) => {
        const normalized = slug.toLowerCase() as GlassesType;
        const active = filters.glassesTypes.includes(normalized);
        const next = active ? [] : [normalized];
        setFilters((prev) => ({ ...prev, glassesTypes: next }));
        if (active) {
            navigate("/collections");
        } else {
            navigate(`/collections/${slug.toLowerCase()}`);
        }
    };

    const handleAllType = () => {
        setFilters((prev) => ({ ...prev, glassesTypes: [] }));
        navigate("/collections/all");
    };

    const handleChipKeyDown = (e: React.KeyboardEvent, onClick: () => void) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <Box
            sx={{
                position: stickyTop !== undefined ? { md: "sticky" } : "static",
                top: stickyTop !== undefined ? { md: stickyTop } : undefined,
                borderRadius: 2.5,
                border: `1px solid ${COLORS.borderSoft}`,
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                bgcolor: COLORS.bgSurface,
                px: 2.5,
                pt: 2.5,
                pb: 2.5,
                display: "flex",
                flexDirection: "column",
                gap: 2,
            }}
        >
            <Box sx={{ mb: 1 }}>
                <Typography
                    sx={{
                        fontWeight: 800,
                        fontSize: 16,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#121212",
                    }}
                >
                    Filters
                </Typography>
                <Box
                    sx={{
                        mt: 0.75,
                        width: 32,
                        height: 2,
                        borderRadius: 999,
                        bgcolor: ACCENT,
                    }}
                />
            </Box>

            {/* Phần nội dung có scroll riêng để khi mở dropdown UI không bị dịch chuyển */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    pr: 1,
                    mt: 1,
                }}
            >
                {/* Search removed: now using global navbar search */}
                <Divider sx={{ my: 1.5 }} />

                {/* Price presets */}
                <Accordion
                    disableGutters
                    elevation={0}
                    sx={{ "&:before": { display: "none" } }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 900 }}>Price (USD)</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, pb: 1 }}>
                            {PRICE_OPTIONS.map((opt) => {
                                const isActive =
                                    (filters.minPrice ?? null) === opt.min &&
                                    (filters.maxPrice ?? null) === opt.max;
                                return (
                                    <Box
                                        key={opt.id}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            px: 0.5,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                cursor: "pointer",
                                            }}
                                            onClick={() => {
                                                setFilters((prev) => {
                                                    const currentlyActive =
                                                        (prev.minPrice ?? null) === opt.min &&
                                                        (prev.maxPrice ?? null) === opt.max;
                                                    if (currentlyActive) {
                                                        // toggle off → clear price filter (Any price)
                                                        return { ...prev, minPrice: null, maxPrice: null };
                                                    }
                                                    return {
                                                        ...prev,
                                                        minPrice: opt.min,
                                                        maxPrice: opt.max,
                                                    };
                                                });
                                            }}
                                        >
                                            <Checkbox
                                                size="small"
                                                checked={isActive}
                                                sx={{
                                                    p: 0.4,
                                                    color: "#B0B0B0",
                                                    "&.Mui-checked": {
                                                        color: ACCENT,
                                                    },
                                                }}
                                            />
                                            <Typography
                                                sx={{
                                                    fontSize: 13,
                                                    color: isActive ? ACCENT : "#121212",
                                                    fontWeight: isActive ? 600 : 400,
                                                }}
                                            >
                                                {opt.label}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </AccordionDetails>
                </Accordion>

                {/* Type (Eyeglasses / Sunglasses) */}
                <Accordion
                    disableGutters
                    elevation={0}
                    sx={{ "&:before": { display: "none" } }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 900 }}>Type</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            <Box
                                role="button"
                                tabIndex={0}
                                onClick={handleAllType}
                                onKeyDown={(e) =>
                                    handleChipKeyDown(e, handleAllType)
                                }
                                sx={{
                                    ...CHIP_SX,
                                    bgcolor: isAllActive ? ACCENT : "#FFFFFF",
                                    color: isAllActive ? "#FFFFFF" : "#121212",
                                }}
                            >
                                All
                            </Box>
                            {typeOptions.map((t) => {
                                const { label, value } = t;
                                const active = filters.glassesTypes.includes(value);
                                return (
                                    <Box
                                        key={value}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleTypeSelect(value)}
                                        onKeyDown={(e) =>
                                            handleChipKeyDown(e, () => handleTypeSelect(value))
                                        }
                                        sx={{
                                            ...CHIP_SX,
                                            bgcolor: active ? "rgba(182,140,90,0.12)" : "#FFFFFF",
                                            borderColor: active ? ACCENT : "rgba(0,0,0,0.08)",
                                            color: active ? ACCENT : "#121212",
                                        }}
                                    >
                                        {label}
                                    </Box>
                                );
                            })}
                        </Box>
                    </AccordionDetails>
                </Accordion>

                {/* Brand */}
                <Accordion
                    disableGutters
                    elevation={0}
                    sx={{ "&:before": { display: "none" } }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 900 }}>Brand</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {(brands ?? []).map((b) => {
                                const active = filters.brand === b;
                                return (
                                    <Box
                                        key={b}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                brand: prev.brand === b ? null : b,
                                            }))
                                        }
                                        onKeyDown={(e) =>
                                            handleChipKeyDown(e, () =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    brand: prev.brand === b ? null : b,
                                                })),
                                            )
                                        }
                                        sx={{
                                            ...CHIP_SX,
                                            bgcolor: active ? "rgba(182,140,90,0.12)" : "#FFFFFF",
                                            borderColor: active ? ACCENT : "rgba(0,0,0,0.08)",
                                            color: active ? ACCENT : "#121212",
                                            "&:hover": {
                                                bgcolor: active
                                                    ? "rgba(182,140,90,0.18)"
                                                    : "#FAFAFA",
                                            },
                                        }}
                                    >
                                        {b}
                                    </Box>
                                );
                            })}
                        </Box>
                    </AccordionDetails>
                </Accordion>
            </Box>

            {/* Nút hành động luôn cố định, không bị đẩy khi dropdown mở/đóng */}
            <Box sx={{ mt: 1.5, display: "grid", gap: 1.2 }}>
                <Button
                    variant="contained"
                    onClick={onApply}
                    sx={{
                        bgcolor: ACCENT,
                        borderRadius: 1.75,
                        height: 44,
                        fontWeight: 700,
                        textTransform: "none",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                        "&:hover": { bgcolor: "#9E7448", boxShadow: "0 12px 34px rgba(0,0,0,0.1)" },
                    }}
                >
                    NARROW DOWN
                </Button>

                <Button
                    onClick={onReset}
                    variant="outlined"
                    sx={{
                        borderRadius: 1.75,
                        height: 44,
                        fontWeight: 600,
                        textTransform: "none",
                        borderColor: "rgba(0,0,0,0.12)",
                        color: "#121212",
                        bgcolor: "#FFFFFF",
                        "&:hover": {
                            borderColor: ACCENT,
                            bgcolor: "#FAFAFA",
                        },
                    }}
                >
                    RESET
                </Button>
            </Box>
        </Box>
    );
}
