import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    InputBase,
    Paper,
    Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import type { Dispatch, SetStateAction } from "react";
import type {
    FiltersState,
    FrameSize,
    Gender,
    GlassesType,
    Material,
    Shape,
} from "../../types";

const GLASSES_TYPES: { label: string; value: GlassesType }[] = [
    { label: "Eyeglasses", value: "eyeglasses" },
    { label: "Sunglasses", value: "sunglasses" },
];

const SHAPES: { label: string; value: Shape }[] = [
    { label: "Round", value: "round" },
    { label: "Square", value: "square" },
    { label: "Cat-eye", value: "cat-eye" },
    { label: "Aviator", value: "aviator" },
    { label: "Rectangle", value: "rectangle" },
];

const COLORS = ["#111827", "#6B7280", "#D4AF37", "#8B5E34", "#60A5FA", "#22C55E"];

const FRAME_SIZES: FrameSize[] = ["S", "M", "L"];

const MATERIALS: { label: string; value: Material }[] = [
    { label: "Acetate", value: "acetate" },
    { label: "Metal", value: "metal" },
    { label: "TR90", value: "tr90" },
    { label: "Titanium", value: "titanium" },
];

const GENDERS: { label: string; value: Gender }[] = [
    { label: "Unisex", value: "unisex" },
    { label: "Men", value: "men" },
    { label: "Women", value: "women" },
];

function toggleInArray<T>(arr: T[], v: T) {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

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
        <Box sx={{ position: { md: "sticky" }, top: { md: stickyTop } }}>
            <Typography sx={{ fontWeight: 900, mb: 1.5, color: "#111827" }}>
                Filters
            </Typography>

            {/* Search */}
            <Paper
                elevation={0}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 1.5,
                    height: 44,
                    borderRadius: 2,
                    border: "1px solid rgba(17,24,39,0.15)",
                }}
            >
                <InputBase
                    value={filters.keyword}
                    onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
                    placeholder="Enter brand name or product number"
                    sx={{ flex: 1, fontSize: 14, fontWeight: 600 }}
                />
                <SearchIcon sx={{ opacity: 0.6 }} />
            </Paper>

            <Divider sx={{ my: 2.5 }} />

            {/* Category */}
            <Accordion
                defaultExpanded
                disableGutters
                elevation={0}
                sx={{ "&:before": { display: "none" } }}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 900 }}>Category</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                    {GLASSES_TYPES.map((x) => (
                        <FormControlLabel
                            key={x.value}
                            control={
                                <Checkbox
                                    checked={filters.glassesTypes.includes(x.value)}
                                    onChange={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            glassesTypes: toggleInArray(prev.glassesTypes, x.value),
                                        }))
                                    }
                                />
                            }
                            label={x.label}
                        />
                    ))}
                </AccordionDetails>
            </Accordion>
            <Divider />

            {/* Shape */}
            <Accordion disableGutters elevation={0} sx={{ "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 900 }}>Shape</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 1 }}>
                        {SHAPES.map((x) => (
                            <FormControlLabel
                                key={x.value}
                                control={
                                    <Checkbox
                                        checked={filters.shapes.includes(x.value)}
                                        onChange={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                shapes: toggleInArray(prev.shapes, x.value),
                                            }))
                                        }
                                    />
                                }
                                label={x.label}
                            />
                        ))}
                    </Box>
                </AccordionDetails>
            </Accordion>
            <Divider />

            {/* Colour */}
            <Accordion disableGutters elevation={0} sx={{ "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 900 }}>Colour</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {COLORS.map((c) => {
                            const active = filters.colors.includes(c);
                            return (
                                <Box
                                    key={c}
                                    onClick={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            colors: toggleInArray(prev.colors, c),
                                        }))
                                    }
                                    role="button"
                                    tabIndex={0}
                                    sx={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: "999px",
                                        bgcolor: c,
                                        cursor: "pointer",
                                        outline: active
                                            ? "2px solid #111827"
                                            : "1px solid rgba(17,24,39,0.18)",
                                        outlineOffset: 2,
                                    }}
                                />
                            );
                        })}
                    </Box>
                </AccordionDetails>
            </Accordion>
            <Divider />

            {/* Frame size */}
            <Accordion disableGutters elevation={0} sx={{ "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 900 }}>Frame size</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {FRAME_SIZES.map((s) => {
                            const active = filters.frameSizes.includes(s);
                            return (
                                <Box
                                    key={s}
                                    onClick={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            frameSizes: toggleInArray(prev.frameSizes, s),
                                        }))
                                    }
                                    sx={{
                                        px: 1.4,
                                        py: 0.7,
                                        borderRadius: 2,
                                        border: "1px solid rgba(17,24,39,0.18)",
                                        bgcolor: active ? "#111827" : "#fff",
                                        color: active ? "#fff" : "#111827",
                                        fontWeight: 900,
                                        cursor: "pointer",
                                        userSelect: "none",
                                        fontSize: 13,
                                    }}
                                >
                                    {s}
                                </Box>
                            );
                        })}
                    </Box>
                </AccordionDetails>
            </Accordion>
            <Divider />

            {/* Materials */}
            <Accordion disableGutters elevation={0} sx={{ "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 900 }}>Materials</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 1 }}>
                        {MATERIALS.map((x) => (
                            <FormControlLabel
                                key={x.value}
                                control={
                                    <Checkbox
                                        checked={filters.materials.includes(x.value)}
                                        onChange={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                materials: toggleInArray(prev.materials, x.value),
                                            }))
                                        }
                                    />
                                }
                                label={x.label}
                            />
                        ))}
                    </Box>
                </AccordionDetails>
            </Accordion>
            <Divider />

            {/* Gender */}
            <Accordion disableGutters elevation={0} sx={{ "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 900 }}>Gender</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 1 }}>
                        {GENDERS.map((x) => (
                            <FormControlLabel
                                key={x.value}
                                control={
                                    <Checkbox
                                        checked={filters.genders.includes(x.value)}
                                        onChange={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                genders: toggleInArray(prev.genders, x.value),
                                            }))
                                        }
                                    />
                                }
                                label={x.label}
                            />
                        ))}
                    </Box>
                </AccordionDetails>
            </Accordion>

            <Box sx={{ mt: 2.5, display: "grid", gap: 1.2 }}>
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
