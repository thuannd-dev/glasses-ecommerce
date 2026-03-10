import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Dialog,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useState, lazy, Suspense } from "react";
import type { ProductListItem } from "../../../lib/hooks/useManagerProducts";
import { useProductDetail } from "../../../lib/hooks/useProductDetail";
import { formatMoney } from "../../../lib/utils/format";

const VirtualTryOn = lazy(() => import("./VirtualTryOn"));

interface ProductCardProps {
  product: ProductListItem;
  onViewDetails: (id: string) => void;
}

export default function ProductCard({ product, onViewDetails }: ProductCardProps) {
  return (
    <Card
      sx={{
        borderRadius: 0,
        border: "1px solid rgba(17,24,39,0.10)",
        boxShadow: "none",
        bgcolor: "#fff",
      }}
    >
      <CardActionArea
        onClick={() => onViewDetails(product.id)}
        sx={{ display: "block" }}
      >
        {/* Image block */}
        <Box
          sx={{
            position: "relative",
            bgcolor: "#f3f4f6",
            aspectRatio: "4 / 3",
            overflow: "hidden",
          }}
        >
          {product.firstImage ? (
            <Box
              component="img"
              src={product.firstImage.imageUrl}
              alt={product.productName}
              loading="lazy"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scale(1.01)",
                transition: "transform .5s ease",
                ".MuiCardActionArea-root:hover &": {
                  transform: "scale(1.06)",
                },
              }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(17,24,39,0.4)",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              No Image
            </Box>
          )}

          {/* Stock badge */}
          <Box
            sx={{
              position: "absolute",
              top: 14,
              left: 14,
              px: 1.2,
              py: 0.6,
              borderRadius: 999,
              bgcolor: "rgba(17,24,39,0.85)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.06em",
            }}
          >
            {product.totalQuantityAvailable} in stock
          </Box>

          {/* Quick-view icon */}
          <Box
            sx={{
              position: "absolute",
              right: 12,
              bottom: 12,
              display: "flex",
              gap: 1,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              size="small"
              onClick={() => onViewDetails(product.id)}
              sx={{
                width: 40,
                height: 40,
                bgcolor: "#fff",
                border: "1px solid rgba(17,24,39,0.12)",
                "&:hover": { bgcolor: "#fff" },
              }}
            >
              <SearchIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Text: brand, name, description, price */}
        <Box sx={{ px: 2, pt: 1.2, pb: 2 }}>
          <Typography sx={{ fontWeight: 900, letterSpacing: "0.02em" }}>
            {product.brand}
          </Typography>

          <Typography sx={{ color: "rgba(17,24,39,0.75)", fontSize: 14, mt: 0.4 }}>
            {product.productName}
          </Typography>

          {product.description && (
            <Typography
              sx={{
                color: "rgba(17,24,39,0.55)",
                fontSize: 12,
                mt: 0.2,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {product.description}
            </Typography>
          )}

          <Typography sx={{ mt: 1.2, fontWeight: 900, fontSize: 16 }}>
            {formatMoney(product.minPrice)}
            {product.maxPrice > product.minPrice && ` – ${formatMoney(product.maxPrice)}`}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
}

/* ──────────────────────────── DETAIL MODAL ──────────────────────────── */

interface ProductDetailModalProps {
  productId: string | null;
  onClose: () => void;
}

export function ProductDetailModal({ productId, onClose }: ProductDetailModalProps) {
  const { product, isLoading } = useProductDetail(productId || undefined);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [tryOnOpen, setTryOnOpen] = useState(false);

  if (!productId) return null;

  const currentVariant =
    product?.variants.find((v: any) => v.id === selectedVariantId) || product?.variants[0];

  // Build image list: if variant has images show only variant images, otherwise fall back to product images
  const images: string[] = [];
  if (currentVariant?.images?.length) {
    currentVariant.images.forEach((img: any) => {
      if (img.imageUrl) images.push(img.imageUrl);
    });
  } else if (product?.images?.length) {
    product.images.forEach((img: any) => {
      if (img.imageUrl) images.push(img.imageUrl);
    });
  }

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);
    setActiveImg(0);
  };

  return (<>
    <Dialog open={!!productId} onClose={onClose} maxWidth="lg" fullWidth>
      <Box
        sx={{
          position: "relative",
          bgcolor: "#fff",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            zIndex: 1,
            border: "1px solid rgba(17,24,39,0.12)",
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.9)",
            "&:hover": { bgcolor: "#ffffff" },
          }}
        >
          <CloseIcon />
        </IconButton>

        {isLoading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography>Loading product details...</Typography>
          </Box>
        ) : !product ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="error">Failed to load product</Typography>
          </Box>
        ) : (
          <Grid container spacing={4} sx={{ p: { xs: 2, md: 4 } }}>
            {/* === LEFT: Gallery === */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: "1px solid rgba(17,24,39,0.10)",
                  bgcolor: "#f3f4f6",
                  position: "relative",
                }}
              >
                <Box
                  component="img"
                  src={images[activeImg] || ""}
                  alt={product.productName}
                  sx={{
                    width: "100%",
                    aspectRatio: "4 / 3",
                    objectFit: "cover",
                  }}
                />

                {/* Try On button — overlaid on image */}
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
                  Try On
                </Button>
              </Box>

              {/* Thumbnails */}
              {images.length > 1 && (
                <Box sx={{ display: "flex", gap: 1.2, mt: 1.5, flexWrap: "wrap" }}>
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
              )}
            </Grid>

            {/* === RIGHT: Info === */}
            <Grid item xs={12} md={6}>
              <Typography fontWeight={900}>{product.brand}</Typography>
              <Typography fontWeight={900} fontSize={22} mt={0.6}>
                {product.productName}
              </Typography>

              {/* Price + compareAtPrice */}
              {currentVariant && (
                <Box sx={{ mt: 2, display: "flex", alignItems: "baseline", gap: 1.5 }}>
                  <Typography fontWeight={900} fontSize={20}>
                    {formatMoney(currentVariant.price)}
                  </Typography>
                  {currentVariant.compareAtPrice != null &&
                    currentVariant.compareAtPrice > currentVariant.price && (
                      <Typography
                        fontSize={14}
                        sx={{
                          textDecoration: "line-through",
                          color: "rgba(17,24,39,0.5)",
                        }}
                      >
                        {formatMoney(currentVariant.compareAtPrice)}
                      </Typography>
                    )}
                </Box>
              )}

              {/* Status + SKU */}
              <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                <Chip
                  label={currentVariant?.isActive ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    borderRadius: 999,
                    fontWeight: 700,
                    bgcolor: currentVariant?.isActive
                      ? "rgba(22,163,74,0.12)"
                      : "rgba(211,47,47,0.12)",
                    color: currentVariant?.isActive
                      ? "rgba(22,163,74,0.95)"
                      : "#c62828",
                  }}
                />
                {currentVariant?.isPreOrder && (
                  <Chip
                    label="Pre-Order"
                    size="small"
                    sx={{
                      borderRadius: 999,
                      fontWeight: 700,
                      bgcolor: "rgba(245,124,0,0.15)",
                      color: "#e65100",
                    }}
                  />
                )}
                {currentVariant?.sku && (
                  <Typography fontSize={13} sx={{ color: "rgba(17,24,39,0.65)" }}>
                    SKU: {currentVariant.sku}
                  </Typography>
                )}
                {currentVariant?.quantityAvailable != null && (
                  <Typography fontSize={13} sx={{ color: "rgba(17,24,39,0.65)" }}>
                    Stock: {currentVariant.quantityAvailable}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2.5 }} />

              {/* Colour options - bubble style like customer page */}
              {!!product.variants?.length && (
                <Box mb={2}>
                  <Typography fontWeight={900} mb={1}>
                    Colour options
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    {product.variants.map((v: any) => {
                      const isActive = currentVariant?.id === v.id;
                      const colorHex = v.color || "rgba(148,163,184,0.5)";
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
                              width: 26,
                              height: 26,
                              borderRadius: "999px",
                              bgcolor: colorHex,
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
                              color: isActive ? "#111827" : "rgba(17,24,39,0.65)",
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

              <Divider sx={{ my: 2.5 }} />

              {/* Accordions — same style as customer detail page */}
              <Accordion defaultExpanded disableGutters elevation={0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={900}>Description</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography fontSize={14} color="rgba(17,24,39,0.75)">
                    {product.description || "No description available."}
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion disableGutters elevation={0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={900}>Specifications</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: "grid", rowGap: 0.5, fontSize: 13.5 }}>
                    {currentVariant?.color && (
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="rgba(15,23,42,0.6)">Color</Typography>
                        <Typography fontWeight={600}>{currentVariant.color}</Typography>
                      </Box>
                    )}
                    {currentVariant?.size && (
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="rgba(15,23,42,0.6)">Size</Typography>
                        <Typography fontWeight={600}>{currentVariant.size}</Typography>
                      </Box>
                    )}
                    {currentVariant?.material && (
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="rgba(15,23,42,0.6)">Material</Typography>
                        <Typography fontWeight={600}>{currentVariant.material}</Typography>
                      </Box>
                    )}
                    {currentVariant?.frameWidth != null && (
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="rgba(15,23,42,0.6)">Frame width</Typography>
                        <Typography fontWeight={600}>{currentVariant.frameWidth} mm</Typography>
                      </Box>
                    )}
                    {currentVariant?.lensWidth != null && (
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="rgba(15,23,42,0.6)">Lens width</Typography>
                        <Typography fontWeight={600}>{currentVariant.lensWidth} mm</Typography>
                      </Box>
                    )}
                    {currentVariant?.bridgeWidth != null && (
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="rgba(15,23,42,0.6)">Bridge width</Typography>
                        <Typography fontWeight={600}>{currentVariant.bridgeWidth} mm</Typography>
                      </Box>
                    )}
                    {currentVariant?.templeLength != null && (
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="rgba(15,23,42,0.6)">Temple length</Typography>
                        <Typography fontWeight={600}>{currentVariant.templeLength} mm</Typography>
                      </Box>
                    )}
                    {currentVariant?.quantityAvailable != null && (
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="rgba(15,23,42,0.6)">In stock</Typography>
                        <Typography fontWeight={600}>{currentVariant.quantityAvailable} units</Typography>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion disableGutters elevation={0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={900}>Product Info</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: "grid", rowGap: 0.5, fontSize: 13.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography color="rgba(15,23,42,0.6)">Brand</Typography>
                      <Typography fontWeight={600}>{product.brand || "–"}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography color="rgba(15,23,42,0.6)">Type</Typography>
                      <Typography fontWeight={600}>{product.type || "–"}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography color="rgba(15,23,42,0.6)">Category</Typography>
                      <Typography fontWeight={600}>{product.category?.name || "–"}</Typography>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        )}
      </Box>
    </Dialog>

    {/* Virtual Try-On overlay */}
    {tryOnOpen && product && (
      <Suspense fallback={null}>
        <VirtualTryOn
          open={tryOnOpen}
          onClose={() => setTryOnOpen(false)}
          productName={product.productName}
          variantImages={
            (product.variants || [])
              .filter((v: any) => v.images?.length > 0)
              .map((v: any) => ({
                id: v.id,
                variantName: v.variantName,
                color: v.color,
                imageUrl: v.images[0].imageUrl,
              }))
          }
        />
      </Suspense>
    )}
  </>);
}
// trailing placeholder
