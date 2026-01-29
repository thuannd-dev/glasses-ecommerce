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
import { cartStore } from "../../lib/stores/cartStore"; // ✅ ADD

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

    // ================= ADD TO CART =================
    const handleAddToCart = () => {
        if (!product) return;

        cartStore.addItem({
            productId: product.id,
            name: product.name,
            image: product.image,
            price: product.price,
        });
    };
    // =================================================

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
            {/* Back + breadcrumb */}
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
                    <Box component={NavLink} to="/collections" sx={{ textDecoration: "none", color: "inherit" }}>
                        Collections
                    </Box>{" "}
                    /{" "}
                    <Box
                        component={NavLink}
                        to={`/collections/${product.category}`}
                        sx={{ textDecoration: "none", color: "inherit" }}
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
                {/* Gallery */}
                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            border: "1px solid rgba(17,24,39,0.10)",
                            bgcolor: "#f3f4f6",
                        }}
                    >
                        <Box
                            component="img"
                            src={images[activeImg]}
                            alt={product.name}
                            sx={{
                                width: "100%",
                                aspectRatio: "4 / 3",
                                objectFit: "cover",
                            }}
                        />
                    </Box>

                    <Box sx={{ display: "flex", gap: 1.2, mt: 1.5 }}>
                        {images.map((src, idx) => (
                            <Box
                                key={src}
                                onClick={() => setActiveImg(idx)}
                                sx={{
                                    width: 86,
                                    height: 66,
                                    border:
                                        idx === activeImg
                                            ? "2px solid #111827"
                                            : "1px solid rgba(17,24,39,0.12)",
                                    cursor: "pointer",
                                }}
                            >
                                <Box
                                    component="img"
                                    src={src}
                                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            </Box>
                        ))}
                    </Box>
                </Grid>

                {/* Info */}
                <Grid item xs={12} md={6}>
                    <Typography fontWeight={900}>{product.brand}</Typography>
                    <Typography fontWeight={900} fontSize={22} mt={0.6}>
                        {product.name}
                    </Typography>
                    <Typography fontSize={13.5} color="rgba(17,24,39,0.65)" mt={0.8}>
                        {product.code}
                    </Typography>

                    <Typography fontWeight={900} fontSize={20} mt={2}>
                        {moneyVND(product.price)}
                    </Typography>

                    <Divider sx={{ my: 2.5 }} />

                    {/* Colors */}
                    {product.colors?.length ? (
                        <Box mb={2}>
                            <Typography fontWeight={900} mb={1}>
                                Colour
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1 }}>
                                {product.colors.map((c) => (
                                    <Box
                                        key={c}
                                        onClick={() => setActiveColor(c)}
                                        sx={{
                                            width: 22,
                                            height: 22,
                                            borderRadius: "50%",
                                            bgcolor: c,
                                            outline:
                                                activeColor === c
                                                    ? "2px solid #111827"
                                                    : "1px solid rgba(17,24,39,0.18)",
                                            outlineOffset: 2,
                                            cursor: "pointer",
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    ) : null}

                    {/* Actions */}
                    <Box sx={{ display: "flex", gap: 1.2, mt: 1 }}>
                        <Button
                            variant="contained"
                            onClick={handleAddToCart}
                            sx={{
                                bgcolor: "#111827",
                                borderRadius: 2,
                                height: 46,
                                px: 3,
                                fontWeight: 900,
                                "&:hover": { bgcolor: "#0b1220" },
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
                            }}
                        >
                            Wishlist
                        </Button>
                    </Box>

                    <Divider sx={{ my: 2.5 }} />

                    {/* Accordions */}
                    <Accordion defaultExpanded disableGutters elevation={0}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={900}>Description</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography fontSize={14} color="rgba(17,24,39,0.75)">
                                Premium daily-wear design with clean lines and comfortable fit.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            </Grid>

            {/* Related */}
            {related.length ? (
                <Box mt={6}>
                    <Typography fontWeight={900} fontSize={18}>
                        You may also like
                    </Typography>

                    <Grid container spacing={3} mt={1}>
                        {related.map((p) => (
                            <Grid key={p.id} item xs={12} sm={6} md={3}>
                                <Box
                                    component={NavLink}
                                    to={`/product/${p.id}`}
                                    sx={{
                                        display: "block",
                                        border: "1px solid rgba(17,24,39,0.10)",
                                        textDecoration: "none",
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={p.image}
                                        sx={{
                                            width: "100%",
                                            aspectRatio: "4 / 3",
                                            objectFit: "cover",
                                            bgcolor: "#f3f4f6",
                                        }}
                                    />
                                    <Box p={2}>
                                        <Typography fontWeight={900}>{p.brand}</Typography>
                                        <Typography fontSize={12} color="rgba(17,24,39,0.65)">
                                            {p.code}
                                        </Typography>
                                        <Typography fontWeight={900} mt={1}>
                                            {moneyVND(p.price)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            ) : null}
        </Box>
    );
}
