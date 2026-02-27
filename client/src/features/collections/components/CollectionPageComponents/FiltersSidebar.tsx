import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Divider,
    Slider,
    Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import type { FiltersState, GlassesType } from "../../types";

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

const CHIP_SX = {
    px: 1.4,
    py: 0.7,
    borderRadius: 2,
    border: "1px solid rgba(17,24,39,0.18)",
    fontWeight: 900,
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

    const [priceRange, setPriceRange] = useState<[number, number]>([
        filters.minPrice ?? 0,
        filters.maxPrice ?? 2000,
    ]);

    useEffect(() => {
        setPriceRange([filters.minPrice ?? 0, filters.maxPrice ?? 2000]);
    }, [filters.minPrice, filters.maxPrice]);

    return (
        <Box
            sx={{
                position: stickyTop !== undefined ? { md: "sticky" } : "static",
                top: stickyTop !== undefined ? { md: stickyTop } : undefined,
                px: 2.5,
                pt: 2,
                pb: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                height: "100%",
            }}
        >
            <Typography sx={{ fontWeight: 900, mb: 0.5, color: "#111827" }}>
                Filters
            </Typography>

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

                {/* Price (range 0 → 2000 USD) */}
                <Accordion
                    disableGutters
                    elevation={0}
                    sx={{ "&:before": { display: "none" } }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 900 }}>Price (USD)</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                        <Box sx={{ px: 0.5, pb: 1 }}>
                            <Slider
                                value={priceRange}
                                onChange={(_, value) => {
                                    setPriceRange(value as [number, number]);
                                }}
                                onChangeCommitted={(_, value) => {
                                    const [min, max] = value as [number, number];
                                    setFilters((prev) => ({
                                        ...prev,
                                        minPrice: min === 0 ? null : min,
                                        maxPrice: max === 2000 ? null : max,
                                    }));
                                }}
                                min={0}
                                max={2000}
                                step={10}
                                valueLabelDisplay="auto"
                                getAriaLabel={() => "Price range"}
                                getAriaValueText={(v) => `$${v}`}
                            />
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mt: 0.5,
                                    fontSize: 12,
                                    color: "rgba(17,24,39,0.7)",
                                }}
                            >
                                <span>${filters.minPrice ?? 0}</span>
                                <span>${filters.maxPrice ?? 2000}</span>
                            </Box>
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
                                    bgcolor: isAllActive ? "#111827" : "#fff",
                                    color: isAllActive ? "#fff" : "#111827",
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
                                            handleChipKeyDown(e, () =>
                                                handleTypeSelect(value),
                                            )
                                        }
                                        sx={{
                                            ...CHIP_SX,
                                            bgcolor: active ? "#111827" : "#fff",
                                            color: active ? "#fff" : "#111827",
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
                                            bgcolor: active ? "#111827" : "#fff",
                                            color: active ? "#fff" : "#111827",
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
                        bgcolor: "#111827",
                        borderRadius: 2,
                        height: 44,
                        fontWeight: 900,
                        boxShadow: "none",
                        "&:hover": { bgcolor: "#0b1220", boxShadow: "none" },
                    }}
                >
                    NARROW DOWN
                </Button>

                <Button
                    onClick={onReset}
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        height: 44,
                        fontWeight: 900,
                        borderColor: "rgba(17,24,39,0.25)",
                        color: "#111827",
                    }}
                >
                    RESET
                </Button>
            </Box>
        </Box>
    );
}
