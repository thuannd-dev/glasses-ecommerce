import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Divider,
    Grid,
    IconButton,
    Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";

import { MOCK_PRODUCTS } from "./data/mockProducts";
import type { Product } from "./types";

const NAV_H = 56;
const GAP_TOP = 24;
const GAP_BOTTOM = 56;
const FOOT_H = 0;

function moneyVND(v: number) {
    return `${v.toLocaleString("vi-VN")}₫`;
}

function labelCategory(cat: Product["category"]) {
    if (cat === "glasses") return "Glasses";
    if (cat === "lens") return "Lens";
    return "Fashion";
}

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();

    const product = useMemo(
        () => MOCK_PRODUCTS.find((p) => p.id === id),
        [id]
    );

    // gallery: nếu bạn có nhiều ảnh thì thay bằng array, tạm dùng image chính + 2 biến thể
    const images = useMemo(() => {
        if (!product) return [];
        return [
            product.image,
            product.image + "&sat=-20",
            product.image + "&con=10",
        ];
    }, [product]);

    const [activeImg, setActiveImg] = useState(0);
    const [activeColor, setActiveColor] = useState<string | null>(null);

    const related = useMemo(() => {
        if (!product) return [];
        return MOCK_PRODUCTS.filter(
            (p) => p.category === product.category && p.id !== product.id
        ).slice(0, 4);
    }, [product]);

    if (!product) {
        return (
            <Box
                sx={{
                    bgcolor: "#fff",
                    pt: `calc(${NAV_H}px + ${GAP_TOP}px)`,
                    pb: `calc(${FOOT_H}px + ${GAP_BOTTOM}px)`,
                    minHeight: `calc(100vh - ${NAV_H}px - ${FOOT_H}px)`,
                    px: { xs: 2, md: 4, lg: 6 },
                }}
            >
                <Typography sx={{ fontWeight: 900, fontSize: 18 }}>
                    Product not found
                </Typography>
                <Button
                    onClick={() => nav(-1)}
                    sx={{ mt: 2, fontWeight: 900 }}
                    startIcon={<ArrowBackIcon />}
                >
                    Back
                </Button>
            </Box>
        );
    }

    return (
        <Box
            component="main"
            sx={{
                position: "relative",
                left: "50%",
                right: "50%",
                ml: "-50vw",
                mr: "-50vw",
                width: "100vw",
                bgcolor: "#fff",
                pt: `calc(${NAV_H}px + ${GAP_TOP}px)`,
                pb: `calc(${FOOT_H}px + ${GAP_BOTTOM}px)`,
                minHeight: `calc(100vh - ${NAV_H}px - ${FOOT_H}px)`,
                px: { xs: 2, md: 4, lg: 6 },
            }}
        >
            {/* Top row: back + breadcrumb */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <IconButton
                    onClick={() => nav(-1)}
                    sx={{
                        border: "1px solid rgba(17,24,39,0.12)",
                        borderRadius: 2,
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>

                <Typography sx={{ color: "rgba(17,24,39,0.65)", fontSize: 13.5 }}>
                    <Box
                        component={NavLink}
                        to="/collections"
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        Collections
                    </Box>{" "}
                    /{" "}
                    <Box
                        component={NavLink}
                        to={`/collections/${product.category}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        {labelCategory(product.category)}
                    </Box>{" "}
                    /{" "}
                    <Box component="span" sx={{ color: "#111827", fontWeight: 800 }}>
                        {product.code}
                    </Box>
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* LEFT: Gallery */}
                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            border: "1px solid rgba(17,24,39,0.10)",
                            bgcolor: "#f3f4f6",
                            overflow: "hidden",
                        }}
                    >
                        <Box
                            component="img"
                            src={images[activeImg]}
                            alt={product.name}
                            sx={{
                                width: "100%",
                                display: "block",
                                aspectRatio: "4 / 3",
                                objectFit: "cover",
                            }}
                        />
                    </Box>

                    <Box sx={{ display: "flex", gap: 1.2, mt: 1.5 }}>
                        {images.map((src, idx) => {
                            const active = idx === activeImg;
                            return (
                                <Box
                                    key={src}
                                    onClick={() => setActiveImg(idx)}
                                    role="button"
                                    tabIndex={0}
                                    sx={{
                                        width: 86,
                                        height: 66,
                                        border: active
                                            ? "2px solid #111827"
                                            : "1px solid rgba(17,24,39,0.12)",
                                        overflow: "hidden",
                                        cursor: "pointer",
                                        bgcolor: "#f3f4f6",
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={src}
                                        alt=""
                                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                </Box>
                            );
                        })}
                    </Box>
                </Grid>

                {/* RIGHT: Info */}
                <Grid item xs={12} md={6}>
                    <Typography sx={{ fontWeight: 900, letterSpacing: "0.02em" }}>
                        {product.brand}
                    </Typography>

                    <Typography sx={{ mt: 0.6, fontWeight: 900, fontSize: 22 }}>
                        {product.name}
                    </Typography>

                    <Typography sx={{ mt: 0.8, color: "rgba(17,24,39,0.65)", fontSize: 13.5 }}>
                        {product.code}
                        {product.frameSize ? `  /  Size: ${product.frameSize}` : ""}
                    </Typography>

                    <Typography sx={{ mt: 2, fontWeight: 900, fontSize: 20 }}>
                        {moneyVND(product.price)}
                    </Typography>

                    <Divider sx={{ my: 2.5 }} />

                    {/* Color swatches */}
                    {product.colors?.length ? (
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={{ fontWeight: 900, mb: 1 }}>
                                Colour
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1 }}>
                                {product.colors.map((c) => {
                                    const active = activeColor === c;
                                    return (
                                        <Box
                                            key={c}
                                            onClick={() => setActiveColor(c)}
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
                        </Box>
                    ) : null}

                    {/* Actions */}
                    <Box sx={{ display: "flex", gap: 1.2, alignItems: "center", mt: 1 }}>
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: "#111827",
                                color: "#fff",
                                borderRadius: 2,
                                height: 46,
                                px: 3,
                                fontWeight: 900,
                                boxShadow: "none",
                                "&:hover": { bgcolor: "#0b1220", boxShadow: "none" },
                            }}
                        >
                            Add to cart
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<FavoriteBorderIcon />}
                            sx={{
                                borderRadius: 2,
                                height: 46,
                                px: 2.2,
                                fontWeight: 900,
                                borderColor: "rgba(17,24,39,0.25)",
                                color: "#111827",
                            }}
                        >
                            Wishlist
                        </Button>
                    </Box>

                    {/* Quick specs */}
                    <Box sx={{ mt: 3, display: "grid", gap: 0.7 }}>
                        {product.category === "glasses" ? (
                            <>
                                {product.glassesType ? (
                                    <Typography sx={{ color: "rgba(17,24,39,0.75)", fontSize: 13.5 }}>
                                        Type: <b>{product.glassesType}</b>
                                    </Typography>
                                ) : null}
                                {product.shape ? (
                                    <Typography sx={{ color: "rgba(17,24,39,0.75)", fontSize: 13.5 }}>
                                        Shape: <b>{product.shape}</b>
                                    </Typography>
                                ) : null}
                                {product.material ? (
                                    <Typography sx={{ color: "rgba(17,24,39,0.75)", fontSize: 13.5 }}>
                                        Material: <b>{product.material}</b>
                                    </Typography>
                                ) : null}
                                {product.gender ? (
                                    <Typography sx={{ color: "rgba(17,24,39,0.75)", fontSize: 13.5 }}>
                                        Gender: <b>{product.gender}</b>
                                    </Typography>
                                ) : null}
                            </>
                        ) : (
                            <Typography sx={{ color: "rgba(17,24,39,0.75)", fontSize: 13.5 }}>
                                Category: <b>{labelCategory(product.category)}</b>
                            </Typography>
                        )}
                    </Box>

                    <Divider sx={{ my: 2.5 }} />

                    {/* Info accordions */}
                    <Accordion defaultExpanded disableGutters elevation={0} sx={{ "&:before": { display: "none" } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography sx={{ fontWeight: 900 }}>Description</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 0 }}>
                            <Typography sx={{ color: "rgba(17,24,39,0.75)", fontSize: 14, lineHeight: 1.65 }}>
                                Premium daily-wear design with clean lines, comfortable fit, and a minimal aesthetic.
                                Perfect for office, streetwear, and everyday photos.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion disableGutters elevation={0} sx={{ "&:before": { display: "none" } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography sx={{ fontWeight: 900 }}>Shipping & Returns</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 0 }}>
                            <Typography sx={{ color: "rgba(17,24,39,0.75)", fontSize: 14, lineHeight: 1.65 }}>
                                Standard delivery 2–5 days. Free returns within 7 days if unused and in original packaging.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion disableGutters elevation={0} sx={{ "&:before": { display: "none" } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography sx={{ fontWeight: 900 }}>Care</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 0 }}>
                            <Typography sx={{ color: "rgba(17,24,39,0.75)", fontSize: 14, lineHeight: 1.65 }}>
                                Clean with microfiber cloth. Avoid harsh chemicals. Store in case when not in use.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            </Grid>

            {/* Related products */}
            {related.length ? (
                <Box sx={{ mt: 6 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: 18 }}>
                        You may also like
                    </Typography>
                    <Typography sx={{ mt: 0.5, color: "rgba(17,24,39,0.65)", fontSize: 13.5 }}>
                        Similar items in {labelCategory(product.category)}.
                    </Typography>

                    <Box sx={{ mt: 2.5 }}>
                        <Grid container spacing={3}>
                            {related.map((p) => (
                                <Grid key={p.id} item xs={12} sm={6} md={3}>
                                    <Box
                                        component={NavLink}
                                        to={`/product/${p.id}`}
                                        style={{ textDecoration: "none" }}
                                        sx={{
                                            display: "block",
                                            border: "1px solid rgba(17,24,39,0.10)",
                                            bgcolor: "#fff",
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={p.image}
                                            alt={p.name}
                                            sx={{
                                                width: "100%",
                                                aspectRatio: "4 / 3",
                                                objectFit: "cover",
                                                display: "block",
                                                bgcolor: "#f3f4f6",
                                            }}
                                        />

                                        <Box sx={{ p: 2 }}>
                                            <Typography sx={{ fontWeight: 900, color: "#111827" }}>
                                                {p.brand}
                                            </Typography>
                                            <Typography sx={{ color: "rgba(17,24,39,0.65)", fontSize: 12, mt: 0.4 }}>
                                                {p.code}
                                            </Typography>
                                            <Typography sx={{ mt: 1, fontWeight: 900 }}>
                                                {moneyVND(p.price)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Box>
            ) : null}
        </Box>
    );
}
