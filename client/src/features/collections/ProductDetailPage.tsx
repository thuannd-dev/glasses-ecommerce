import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Chip,
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

import { useProductDetail } from "../../lib/hooks/useProducts";
import { cartStore } from "../../lib/stores/cartStore";
import { useCart } from "../../lib/hooks/useCart";
import { RelatedProductsCarousel } from "./components/ProductDetailPageComponents/RelatedProductsCarousel";

const NAV_H = 56;
const GAP_TOP = 24;
const GAP_BOTTOM = 56;
const FOOT_H = 0;

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const { product, isLoading } = useProductDetail(id);
    const { addItem } = useCart();

    const [activeVariantId, setActiveVariantId] = useState<string | null>(null);
    const [activeImg, setActiveImg] = useState(0);

    const currentVariant = useMemo(() => {
        if (!product?.variants?.length) return null;
        const found = product.variants.find((v) => v.id === activeVariantId);
        return found ?? product.variants[0];
    }, [product, activeVariantId]);

    const images = useMemo(() => {
        if (currentVariant?.images?.length) {
            return currentVariant.images.slice(0, 3);
        }
        const src = product?.images ?? [];
        return src.slice(0, 3);
    }, [currentVariant, product]);

    // ================= ADD TO CART =================
    const handleAddToCart = () => {
        if (!product) return;

        const variantId = currentVariant?.id ?? product.variants?.[0]?.id;
        if (!variantId) return;

        // 1) Cập nhật cart local (MobX) để UI phản hồi ngay
        cartStore.addItem({
            productId: product.id,
            name: product.name,
            image: images[0],
            price: currentVariant?.price ?? product.price,
        });

        // 2) Gọi API cart để lưu trên server (sử dụng cookie session)
        // API báo thiếu 'productVariantId' trên AddCartItemDto
        // → gửi thẳng DTO: { productVariantId, quantity }
        addItem({
            productVariantId: variantId,
            quantity: 1,
        });
    };
    // =================================================

    if (isLoading) {
        return (
            <Box
                sx={{
                    bgcolor: "#fff",
                    pt: `calc(${NAV_H}px + ${GAP_TOP}px)`,
                    pb: `calc(${FOOT_H}px + ${GAP_BOTTOM}px)`,
                    minHeight: `calc(100vh - ${NAV_H}px - ${FOOT_H}px)`,
                    px: { xs: 2, md: 4, lg: 6 },
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Typography>Loading product...</Typography>
            </Box>
        );
    }

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
                        to={`/collections/${product.categorySlug}`}
                        sx={{ textDecoration: "none", color: "inherit" }}
                    >
                        {product.categoryName}
                    </Box>{" "}
                    /{" "}
                    <Box component="span" sx={{ color: "#111827", fontWeight: 800 }}>
                        {product.name}
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

                    {/* Price + compareAtPrice */}
                    <Box sx={{ mt: 2, display: "flex", alignItems: "baseline", gap: 1.5 }}>
                        <Typography fontWeight={900} fontSize={20}>
                            {(currentVariant?.price ?? product.price).toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </Typography>
                        {currentVariant?.compareAtPrice &&
                            currentVariant.compareAtPrice > (currentVariant.price ?? product.price) && (
                                <Typography
                                    fontSize={14}
                                    sx={{
                                        textDecoration: "line-through",
                                        color: "rgba(17,24,39,0.5)",
                                    }}
                                >
                                    {currentVariant.compareAtPrice.toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </Typography>
                            )}
                    </Box>

                    {/* Status + sku */}
                    <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Chip
                            label={product.status}
                            size="small"
                            sx={{
                                borderRadius: 999,
                                fontWeight: 700,
                                bgcolor:
                                    product.status.toLowerCase() === "active"
                                        ? "rgba(22,163,74,0.12)"
                                        : "rgba(148,163,184,0.18)",
                                color:
                                    product.status.toLowerCase() === "active"
                                        ? "rgba(22,163,74,0.95)"
                                        : "rgba(71,85,105,0.95)",
                            }}
                        />
                        {product.sku && (
                            <Typography
                                fontSize={13}
                                sx={{ color: "rgba(17,24,39,0.65)" }}
                            >
                                SKU: {product.sku}
                            </Typography>
                        )}
                    </Box>

                    <Divider sx={{ my: 2.5 }} />

                    {/* Variants (color) - bubble màu (kể cả chỉ có 1 màu cũng hiển thị) */}
                    {!!product.variants?.length && (
                        <Box mb={2} mt={2}>
                            <Typography fontWeight={900} mb={1}>
                                Colour options
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 2, // cách nhau ra 1 xíu cho đẹp
                                }}
                            >
                                {product.variants.map((v) => {
                                    const isActive = currentVariant?.id === v.id;
                                    const colorName = (v.color ?? v.variantName ?? "").toLowerCase();
                                    const bgColor =
                                        colorName === "black" || colorName.includes("black")
                                            ? "#111827"
                                            : colorName === "red" || colorName.includes("red")
                                                ? "#dc2626"
                                                : colorName.includes("ivory")
                                                    ? "#f5f5f4"
                                                    : colorName.includes("gold")
                                                        ? "#facc15"
                                                        : "rgba(148,163,184,0.5)";
                                    return (
                                        <Box
                                            key={v.id}
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: 0.5,
                                            }}
                                        >
                                            <Box
                                                onClick={() => {
                                                    setActiveVariantId(v.id);
                                                    setActiveImg(0);
                                                }}
                                                sx={{
                                                    width: 26,
                                                    height: 26,
                                                    borderRadius: "999px",
                                                    bgcolor: bgColor,
                                                    border: isActive
                                                        ? "2px solid #111827"
                                                        : "1px solid rgba(17,24,39,0.18)",
                                                    boxShadow: isActive
                                                        ? "0 0 0 2px rgba(17,24,39,0.25)"
                                                        : "none",
                                                    cursor: "pointer",
                                                }}
                                            />
                                            <Typography
                                                sx={{
                                                    fontSize: 11,
                                                    color: isActive
                                                        ? "#111827"
                                                        : "rgba(17,24,39,0.65)",
                                                }}
                                            >
                                                {v.variantName ?? v.color}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    )}

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
                                {product.description ??
                                    product.categoryDescription ??
                                    "No description available."}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    {/* Specs */}
                    <Accordion disableGutters elevation={0}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={900}>Specifications</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ display: "grid", rowGap: 0.5, fontSize: 13.5 }}>
                                {currentVariant?.color && (
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography color="rgba(15,23,42,0.6)">
                                            Color
                                        </Typography>
                                        <Typography fontWeight={600}>
                                            {currentVariant.color}
                                        </Typography>
                                    </Box>
                                )}
                                {currentVariant?.size && (
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography color="rgba(15,23,42,0.6)">
                                            Size
                                        </Typography>
                                        <Typography fontWeight={600}>
                                            {currentVariant.size}
                                        </Typography>
                                    </Box>
                                )}
                                {currentVariant?.material && (
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography color="rgba(15,23,42,0.6)">
                                            Material
                                        </Typography>
                                        <Typography fontWeight={600}>
                                            {currentVariant.material}
                                        </Typography>
                                    </Box>
                                )}
                                {currentVariant?.frameWidth != null && (
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography color="rgba(15,23,42,0.6)">
                                            Frame width
                                        </Typography>
                                        <Typography fontWeight={600}>
                                            {currentVariant.frameWidth} mm
                                        </Typography>
                                    </Box>
                                )}
                                {currentVariant?.lensWidth != null && (
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography color="rgba(15,23,42,0.6)">
                                            Lens width
                                        </Typography>
                                        <Typography fontWeight={600}>
                                            {currentVariant.lensWidth} mm
                                        </Typography>
                                    </Box>
                                )}
                                {currentVariant?.bridgeWidth != null && (
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography color="rgba(15,23,42,0.6)">
                                            Bridge width
                                        </Typography>
                                        <Typography fontWeight={600}>
                                            {currentVariant.bridgeWidth} mm
                                        </Typography>
                                    </Box>
                                )}
                                {currentVariant?.templeLength != null && (
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography color="rgba(15,23,42,0.6)">
                                            Temple length
                                        </Typography>
                                        <Typography fontWeight={600}>
                                            {currentVariant.templeLength} mm
                                        </Typography>
                                    </Box>
                                )}
                                {currentVariant?.quantityAvailable && currentVariant.quantityAvailable > 0 && (
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography color="rgba(15,23,42,0.6)">
                                            In stock
                                        </Typography>
                                        <Typography fontWeight={600}>
                                            {currentVariant.quantityAvailable} units
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            </Grid>

            {/* Related products carousel */}
            <RelatedProductsCarousel
                categorySlug={product.categorySlug}
                currentProductId={product.id}
            />
        </Box>
    );
}
