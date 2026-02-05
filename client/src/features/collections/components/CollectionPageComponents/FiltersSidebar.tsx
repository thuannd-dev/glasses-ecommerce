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
import type { Dispatch, SetStateAction } from "react";
import type { FiltersState } from "../../types";

// Các brand và type lấy từ dữ liệu mẫu API
const BRANDS = ["Ray-Ban", "Oakley", "Warby Parker", "Mykita"];
const TYPES = [
    { label: "Eyeglasses", value: "eyeglasses" },
    { label: "Sunglasses", value: "sunglasses" },
] as const;

export function FiltersSidebar({
    filters,
    setFilters,
    onReset,
    stickyTop = 88,
}: {
    filters: FiltersState;
    setFilters: Dispatch<SetStateAction<FiltersState>>;
    onReset: () => void;
    stickyTop?: number;
}) {
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
                                value={[
                                    filters.minPrice ?? 0,
                                    filters.maxPrice ?? 2000,
                                ]}
                                onChange={(_, value) => {
                                    const [min, max] = value as number[];
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
                            {TYPES.map((t) => {
                                const active = filters.glassesTypes.includes(t.value);
                                return (
                                    <Box
                                        key={t.value}
                                        onClick={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                glassesTypes: active ? [] : [t.value],
                                            }))
                                        }
                                        sx={{
                                            px: 1.4,
                                            py: 0.7,
                                            borderRadius: 2,
                                            border:
                                                "1px solid rgba(17,24,39,0.18)",
                                            bgcolor: active ? "#111827" : "#fff",
                                            color: active ? "#fff" : "#111827",
                                            fontWeight: 900,
                                            cursor: "pointer",
                                            userSelect: "none",
                                            fontSize: 13,
                                        }}
                                    >
                                        {t.label}
                                    </Box>
                                );
                            })}
                        </Box>
                    </AccordionDetails>
                </Accordion>

                {/* Brand (từ data API) */}
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
                            {BRANDS.map((b) => {
                                const active = filters.brand === b;
                                return (
                                    <Box
                                        key={b}
                                        onClick={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                brand: prev.brand === b ? null : b,
                                            }))
                                        }
                                        sx={{
                                            px: 1.4,
                                            py: 0.7,
                                            borderRadius: 2,
                                            border:
                                                "1px solid rgba(17,24,39,0.18)",
                                            bgcolor: active ? "#111827" : "#fff",
                                            color: active ? "#fff" : "#111827",
                                            fontWeight: 900,
                                            cursor: "pointer",
                                            userSelect: "none",
                                            fontSize: 13,
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
