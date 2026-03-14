import { Suspense, lazy, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { NavLink, useNavigate } from "react-router-dom";

import { useProductDetailPage } from "./hooks/useProductDetailPage";
import { RelatedProductsCarousel } from "./components/ProductDetailPageComponents/RelatedProductsCarousel";
import { usePreOrderButton } from "./components/ProductDetailPageComponents/PreOrderDialog";

const VirtualTryOn = lazy(() => import("../Manager/components/VirtualTryOn"));

const NAV_H = 56;
const GAP_TOP = 24;
const GAP_BOTTOM = 56;
const FOOT_H = 0;
const ACCENT = "#B68C5A";

export default function ProductDetailPage() {
    const nav = useNavigate();
    const { handlePreOrder } = usePreOrderButton();
    const {
        product,
        isLoading,
        currentVariant,
        images,
        activeImg,
        setActiveImg,
        handleAddToCart,
        handleVariantSelect,
        isEyeglasses,
    } = useProductDetailPage();
    const [tryOnOpen, setTryOnOpen] = useState(false);

    if (isLoading) {
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
                    background: "linear-gradient(180deg,#FFFFFF 0%,#FAFAF5 100%)",
                    pt: `calc(${NAV_H}px + ${GAP_TOP}px)`,
                    pb: `calc(${FOOT_H}px + ${GAP_BOTTOM}px)`,
                    minHeight: `calc(100vh - ${NAV_H}px - ${FOOT_H}px)`,
                    px: { xs: 2, md: 3 },
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
                component="main"
                sx={{
                    position: "relative",
                    left: "50%",
                    right: "50%",
                    ml: "-50vw",
                    mr: "-50vw",
                    width: "100vw",
                    background: "linear-gradient(180deg,#FFFFFF 0%,#FAFAF5 100%)",
                    pt: `calc(${NAV_H}px + ${GAP_TOP}px)`,
                    pb: `calc(${FOOT_H}px + ${GAP_BOTTOM}px)`,
                    minHeight: `calc(100vh - ${NAV_H}px - ${FOOT_H}px)`,
                    px: { xs: 2, md: 3 },
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
                background: "linear-gradient(180deg,#FFFFFF 0%,#FAFAF5 100%)",
                pt: `calc(${NAV_H}px + ${GAP_TOP}px)`,
                pb: `calc(${FOOT_H}px + ${GAP_BOTTOM}px)`,
                minHeight: `calc(100vh - ${NAV_H}px - ${FOOT_H}px)`,
                px: { xs: 2, md: 3 },
            }}
        >
            {/* Back + breadcrumb */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.75,
                    mb: 2.5,
                }}
            >
                <Button
                    onClick={() => nav(-1)}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                        alignSelf: "flex-start",
                        p: 0,
                        minWidth: "auto",
                        textTransform: "none",
                        fontSize: 13,
                        color: "#5B5B5B",
                        "&:hover": {
                            color: ACCENT,
                            backgroundColor: "transparent",
                            textDecoration: "underline",
                        },
                    }}
                >
                    Back to Eyewear
                </Button>
                <Typography sx={{ color: "#8A8A8A", fontSize: 12.5 }}>
                    <Box
                        component={NavLink}
                        to="/collections"
                        sx={{ textDecoration: "none", color: "inherit" }}
                    >
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
                    <Box component="span" sx={{ color: "#121212", fontWeight: 700 }}>
                        {product.name}
                    </Box>
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Gallery */}
                <Grid item xs={12} md={7}>
                    <Box
                        sx={{
                            borderRadius: 3,
                            border: "1px solid rgba(0,0,0,0.06)",
                            bgcolor: "#F6F4F2",
                            boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
                            px: { xs: 2.5, md: 3 },
                            pt: { xs: 2.5, md: 3 },
                            pb: { xs: 2.75, md: 3 },
                            position: "relative",
                        }}
                    >
                        <Box
                            sx={{
                                width: "100%",
                                aspectRatio: "4 / 3",
                                maxHeight: 420,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                            }}
                        >
                            <Box
                                component="img"
                                src={images[activeImg]}
                                alt={product.name}
                                sx={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        </Box>

                        {/* Virtual Try-On button */}
                        <Button
                            variant="contained"
                            startIcon={<CameraAltIcon />}
                            onClick={() => setTryOnOpen(true)}
                            sx={{
                                position: "absolute",
                                bottom: 14,
                                left: 14,
                                borderRadius: 999,
                                textTransform: "none",
                                fontWeight: 800,
                                fontSize: 13,
                                bgcolor: "rgba(17,24,39,0.85)",
                                backdropFilter: "blur(6px)",
                                "&:hover": { bgcolor: "rgba(17,24,39,0.95)" },
                                px: 2.5,
                                py: 1,
                                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                            }}
                        >
                            Virtual Try-On
                        </Button>

                    <Box
                        sx={{
                            mt: 1.75,
                            display: "flex",
                            gap: 1.5,
                            flexWrap: "wrap",
                        }}
                    >
                        {images.map((src, idx) => {
                                const isActive = idx === activeImg;
                                return (
                                    <Box
                                        key={src}
                                        onClick={() => setActiveImg(idx)}
                                        sx={{
                                            width: 70,
                                            height: 70,
                                            borderRadius: 2,
                                            overflow: "hidden",
                                            cursor: "pointer",
                                            border: isActive
                                                ? `2px solid ${ACCENT}`
                                                : "1px solid rgba(0,0,0,0.08)",
                                            boxShadow: isActive
                                                ? "0 0 0 1px rgba(182,140,90,0.35)"
                                                : "none",
                                            transition: "all 160ms ease",
                                            "&:hover": {
                                                borderColor: isActive
                                                    ? ACCENT
                                                    : "rgba(0,0,0,0.18)",
                                            },
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={src}
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "contain",
                                                backgroundColor: "#F6F6F6",
                                            }}
                                        />
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                </Grid>

                {/* Info */}
                <Grid item xs={12} md={5}>
                    <Typography
                        sx={{
                            fontSize: 11,
                            textTransform: "uppercase",
                            letterSpacing: "0.16em",
                            color: "#8A8A8A",
                            fontWeight: 600,
                        }}
                    >
                        {product.brand}
                    </Typography>
                    <Typography
                        sx={{
                            fontWeight: 800,
                            fontSize: 26,
                            mt: 0.6,
                            color: "#121212",
                            lineHeight: 1.1,
                        }}
                    >
                        {product.name}
                    </Typography>

                    {/* Price + compareAtPrice */}
                    <Box sx={{ mt: 2, display: "flex", alignItems: "baseline", gap: 1.5 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: 22, color: "#121212" }}>
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
                                        color: "#8A8A8A",
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

                    {/* Stock status (based on quantity) + Quantity + SKU */}
                    <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                        <Chip
                            label={(currentVariant?.quantityAvailable ?? 0) > 0 ? "In stock" : "Out of stock"}
                            size="small"
                            sx={{
                                borderRadius: 999,
                                fontWeight: 700,
                                bgcolor: (currentVariant?.quantityAvailable ?? 0) > 0
                                    ? "rgba(22,163,74,0.08)"
                                    : "rgba(248,113,113,0.08)",
                                color: (currentVariant?.quantityAvailable ?? 0) > 0
                                    ? "#166534"
                                    : "#b91c1c",
                                border: (currentVariant?.quantityAvailable ?? 0) > 0
                                    ? "1px solid rgba(22,163,74,0.35)"
                                    : "1px solid rgba(248,113,113,0.55)",
                            }}
                        />

                        {product.sku && (
                            <Typography
                                fontSize={12}
                                sx={{ color: "#8A8A8A" }}
                            >
                                SKU: {product.sku}
                            </Typography>
                        )}
                    </Box>

                    <Divider sx={{ my: 2.5 }} />

                    {/* Variants (color) */}
                    {!!product.variants?.length && (
                        <Box mb={2} mt={2}>
                            <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 1, color: "#5B5B5B" }}>
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

                                // Lấy đúng tên màu để tô: ưu tiên field `color`, fallback `variantName`.
                                const rawLabel = (v.color ?? v.variantName ?? "").trim();
                                // Nếu có nhiều từ (VD: "Glossy Black") thì lấy từ cuối cùng làm CSS color ("Black").
                                const lastWord =
                                    rawLabel.indexOf(" ") >= 0
                                        ? rawLabel.split(/\s+/).slice(-1)[0]
                                        : rawLabel;
                                const bgColor = lastWord || "rgba(148,163,184,0.6)";
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
                                                onClick={() => handleVariantSelect(v.id)}
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: "999px",
                                                    bgcolor: bgColor,
                                                    border: isActive
                                                        ? `2px solid ${ACCENT}`
                                                        : "1px solid rgba(15,23,42,0.2)",
                                                    boxShadow: isActive
                                                        ? "0 0 0 3px rgba(182,140,90,0.3)"
                                                        : "none",
                                                    cursor: "pointer",
                                                    position: "relative",
                                                    transition: "all 160ms ease",
                                                    "&:hover": {
                                                        boxShadow: isActive
                                                            ? "0 0 0 4px rgba(182,140,90,0.35)"
                                                            : "0 0 0 2px rgba(148,163,184,0.4)",
                                                    },
                                                }}
                                            >
                                                {isActive && (
                                                    <Box
                                                        sx={{
                                                            position: "absolute",
                                                            inset: 6,
                                                            borderRadius: "50%",
                                                            border: "2px solid #FFFFFF",
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                            <Typography
                                                sx={{
                                                    fontSize: 11,
                                                    color: isActive
                                                        ? "#121212"
                                                        : "#6B6B6B",
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
                    <Box sx={{ display: "flex", gap: 1.2, mt: 1, flexWrap: "wrap", flexDirection: "column" }}>
                        <Box sx={{ display: "flex", gap: 1.2, width: "100%", flexWrap: "wrap" }}>
                        {/* Show Add to Cart / Select Lenses only if in stock */}
                        {(currentVariant?.quantityAvailable ?? 0) > 0 && (
                            <>
                                {isEyeglasses ? (
                                    <>
                                        <Button
                                            variant="contained"
                                            onClick={() =>
                                                nav(`/product/${product.id}/lenses`, {
                                                    state: { variantId: currentVariant?.id ?? null },
                                                })
                                            }
                                            sx={{
                                                bgcolor: "#111827",
                                                borderRadius: 1.75,
                                                height: 46,
                                                px: 3,
                                                fontWeight: 900,
                                                "&:hover": { bgcolor: "#0b1220", boxShadow: "0 14px 36px rgba(0,0,0,0.2)" },
                                            }}
                                        >
                                            Select lenses
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={handleAddToCart}
                                        sx={{
                                            bgcolor: "#111827",
                                            borderRadius: 1.75,
                                            height: 46,
                                            px: 3,
                                            fontWeight: 900,
                                            "&:hover": { bgcolor: "#0b1220", boxShadow: "0 14px 36px rgba(0,0,0,0.2)" },
                                        }}
                                    >
                                        Add to cart
                                    </Button>
                                )}
                            </>
                        )}

                        {/* Show Pre-Order only if out of stock AND variant is enabled for pre-order */}
                        {(currentVariant?.quantityAvailable ?? 0) === 0 && currentVariant?.isPreOrder && (
                            <Button
                                variant="contained"
                                onClick={() => {
                                    if (isEyeglasses) {
                                        // For eyeglasses: navigate to select lenses with pre-order flag
                                        nav(`/product/${product.id}/lenses`, {
                                            state: { 
                                                variantId: currentVariant?.id ?? null,
                                                isPreOrder: true 
                                            },
                                        });
                                    } else {
                                        // For sunglasses: direct pre-order
                                        handlePreOrder({
                                            variant: currentVariant,
                                        });
                                    }
                                }}
                                sx={{
                                    bgcolor: "#111827",
                                    borderRadius: 1.75,
                                    height: 50,
                                    px: 3,
                                    fontWeight: 700,
                                    textTransform: "none",
                                    boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                                    "&:hover": {
                                        bgcolor: "#020617",
                                        boxShadow: "0 14px 36px rgba(0,0,0,0.2)",
                                    },
                                }}
                            >
                                Pre-Order
                            </Button>
                        )}

                        <Button
                            variant="outlined"
                            startIcon={<FavoriteBorderIcon />}
                            sx={{
                                borderRadius: 1.75,
                                height: 46,
                                px: 2.2,
                                fontWeight: 600,
                                textTransform: "none",
                                borderColor: "rgba(0,0,0,0.16)",
                                color: "#121212",
                                bgcolor: "#FFFFFF",
                                "&:hover": {
                                    bgcolor: "#FAFAFA",
                                    borderColor: ACCENT,
                                },
                            }}
                        >
                            Wishlist
                        </Button>
                        </Box>
                        <Typography sx={{ mt: 1.5, fontSize: 12, color: "#8A8A8A" }}>
                            Free returns • Secure checkout • 2-year warranty
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 2.75, borderColor: "rgba(0,0,0,0.06)" }} />

                    {/* Accordions */}
                    <Accordion
                        defaultExpanded
                        disableGutters
                        elevation={0}
                        sx={{
                            borderTop: "1px solid transparent",
                            borderBottom: "1px solid rgba(0,0,0,0.06)",
                        }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#121212" }}>
                                Description
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography fontSize={14} sx={{ color: "#5B5B5B", lineHeight: 1.7 }}>
                                {product.description ??
                                    product.categoryDescription ??
                                    "No description available."}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    {/* Specs */}
                    <Accordion
                        disableGutters
                        elevation={0}
                        sx={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#121212" }}>
                                Specifications
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ display: "grid", rowGap: 0.5, fontSize: 13.5 }}>
                                {(currentVariant?.variantName || currentVariant?.color) && (
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography color="rgba(15,23,42,0.6)">
                                            Color
                                        </Typography>
                                        <Typography fontWeight={600}>
                                            {currentVariant.variantName ?? currentVariant.color}
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
            {product && (
                <RelatedProductsCarousel
                    categorySlug={product.categorySlug}
                    currentProductId={product.id}
                />
            )}

            {/* Virtual Try-On overlay */}
            {tryOnOpen && product && (
                <Suspense fallback={null}>
                    <VirtualTryOn
                        open={tryOnOpen}
                        onClose={() => setTryOnOpen(false)}
                        productName={product!.name}
                        variantImages={
                            (product!.variants || [])
                                .filter((v) => v.images?.length > 0)
                                .map((v) => ({
                                    id: v.id,
                                    variantName: v.variantName ?? undefined,
                                    color: v.color ?? undefined,
                                    imageUrl: v.images[0],
                                }))
                        }
                    />
                </Suspense>
            )}
        </Box>
    );
}
