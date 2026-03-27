import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router";
import { useProducts } from "../../../../lib/hooks/useProducts";
import type { Product } from "../../../../lib/types";

import { COLLECTION_PRODUCT_FONT } from "../../collectionFonts";
import InlineGlbViewer from "./InlineGlbViewer";

const TOP_SELLER_HERO_GLB =
  "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1774194218/glasses_rgcuyg.glb";

/**
 * Nền ô hero 3D — xám trắng → xám → đen (trung tính, không lệch màu).
 * WebGL clear = tông giữa gradient.
 */
const HERO_TILE_BACKGROUND =
  "linear-gradient(152deg, #FAFAFA 0%, #E5E5E5 20%, #D4D4D4 38%, #A3A3A3 58%, #6B6B6B 78%, #171717 100%)";
const HERO_CLEAR_COLOR = "#A3A3A3";
const HERO_LOADING_BACKDROP = "rgba(163, 163, 163, 0.92)";

/** Nền tile SP — xám trắng (cool neutral) */
const ITEM_TILE_GRADIENT =
  "linear-gradient(148deg, #FAFAFA 0%, #F4F4F5 22%, #ECECEE 52%, #E4E4E7 78%, #DDDDE2 100%)";
const ITEM_TILE_GRADIENT_HOVER =
  "linear-gradient(148deg, #F4F4F5 0%, #ECECEE 22%, #E4E4E7 52%, #DCDCE0 78%, #D4D4DA 100%)";
/** Viền xám nhạt (grid: phải + dưới) */
const ITEM_TILE_BORDER = "1px solid rgba(82, 82, 91, 0.22)";

/** Chữ góc trên hero (nền sáng): đậm */
const HERO_TITLE_DARK_MAIN = "#171717";
const HERO_TITLE_DARK_VEIN = "#262626";
const HERO_TITLE_DARK_GRADIENT = `linear-gradient(115deg, ${HERO_TITLE_DARK_MAIN} 0%, ${HERO_TITLE_DARK_VEIN} 10%, ${HERO_TITLE_DARK_MAIN} 24%, ${HERO_TITLE_DARK_VEIN} 38%, ${HERO_TITLE_DARK_MAIN} 52%, ${HERO_TITLE_DARK_VEIN} 66%, ${HERO_TITLE_DARK_MAIN} 82%, ${HERO_TITLE_DARK_VEIN} 92%, ${HERO_TITLE_DARK_MAIN} 100%)`;
const heroTitleDarkFillSx = {
  backgroundImage: HERO_TITLE_DARK_GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: HERO_TITLE_DARK_MAIN,
  filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.45))",
} as const;

/** Chữ góc dưới (View all, nền tối): sáng */
const HERO_TITLE_LIGHT_MAIN = "#F5F5F4";
const HERO_TITLE_LIGHT_VEIN = "#FFFFFF";
const HERO_TITLE_LIGHT_GRADIENT = `linear-gradient(115deg, ${HERO_TITLE_LIGHT_MAIN} 0%, ${HERO_TITLE_LIGHT_VEIN} 10%, ${HERO_TITLE_LIGHT_MAIN} 24%, ${HERO_TITLE_LIGHT_VEIN} 38%, ${HERO_TITLE_LIGHT_MAIN} 52%, ${HERO_TITLE_LIGHT_VEIN} 66%, ${HERO_TITLE_LIGHT_MAIN} 82%, ${HERO_TITLE_LIGHT_VEIN} 92%, ${HERO_TITLE_LIGHT_MAIN} 100%)`;
const heroTitleLightFillSx = {
  backgroundImage: HERO_TITLE_LIGHT_GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: HERO_TITLE_LIGHT_MAIN,
  filter:
    "drop-shadow(0 1px 0 rgba(0,0,0,0.55)) drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
} as const;

export default function ItemTopSeller() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  /** Số ô vuông đặt trước hero trên hàng 1: 4 (md 6 cột) / 2 (sm 4 cột, xs 2 cột) */
  const leadingTileCount = isMdUp ? 4 : 2;

  // Lấy một vài sản phẩm nổi bật để trưng ở landing (Our Products)
  const { products, isLoading } = useProducts({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 0,
    sortOrder: 0,
  });

  const visible = (Array.isArray(products) ? products : []).slice(0, 10);
  const items: (Product | undefined)[] = isLoading ? Array.from({ length: 10 }) : visible;
  const beforeHero = items.slice(0, leadingTileCount);
  const afterHero = items.slice(leadingTileCount);

  const renderProductTile = (p: Product | undefined, idx: number, keyPrefix: string) => {
    if (!p) {
      return (
        <Box
          key={`${keyPrefix}-sk-${idx}`}
          sx={{
            gridColumn: { xs: "span 1", sm: "span 1", md: "span 1" },
            gridRow: { xs: "span 1", sm: "span 1", md: "span 1" },
            aspectRatio: "1 / 1",
            display: "flex",
            alignItems: "stretch",
            justifyContent: "stretch",
          }}
        >
          <Box
            sx={{
              flex: 1,
              borderRadius: 0,
              background: ITEM_TILE_GRADIENT,
              borderRight: ITEM_TILE_BORDER,
              borderBottom: ITEM_TILE_BORDER,
            }}
          />
        </Box>
      );
    }

    const product: Product = p;

    return (
      <Box
        key={`${keyPrefix}-${product.id}-${idx}`}
        sx={{
          gridColumn: { xs: "span 1", sm: "span 1", md: "span 1" },
          gridRow: { xs: "span 1", sm: "span 1", md: "span 1" },
          aspectRatio: "1 / 1",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "stretch",
        }}
      >
        <Box
          onClick={() => navigate(`/product/${product.id}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate(`/product/${product.id}`);
            }
          }}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            borderRadius: 0,
            borderRight: ITEM_TILE_BORDER,
            borderBottom: ITEM_TILE_BORDER,
            background: ITEM_TILE_GRADIENT,
            overflow: "hidden",
            cursor: "pointer",
            outline: "none",
            transition: "background 200ms ease",
            "&:hover": {
              background: ITEM_TILE_GRADIENT_HOVER,
            },
            "&:focus-visible": { boxShadow: "0 0 0 2px rgba(113, 113, 122, 0.45)" },
            position: "relative",
          }}
        >
          {/* Glass film overlay (phủ cả ảnh + info), nhưng nằm dưới nội dung */}
          <Box
            sx={{
              pointerEvents: "none",
              position: "absolute",
              inset: 0,
              zIndex: 2,
              bgcolor: "#52525B",
              mixBlendMode: "multiply",
              opacity: 0.06,
            }}
          />
          <Box
            sx={{
              pointerEvents: "none",
              position: "absolute",
              inset: 0,
              zIndex: 2,
              background:
                "linear-gradient(180deg, rgba(24,24,27,0.04) 0%, rgba(24,24,27,0.08) 55%, rgba(24,24,27,0.14) 100%)",
            }}
          />

          {/* Image area */}
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              bgcolor: "transparent",
              px: 2.2,
              pt: 2.2,
              pb: 1.8,
              aspectRatio: "4 / 3",
              overflow: "hidden",
            }}
          >
            {product.image ? (
              <Box
                component="img"
                src={product.image}
                alt={product.name}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  transform: "scale(1.01)",
                  transition: "transform .45s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
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
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontFamily: COLLECTION_PRODUCT_FONT,
                    fontWeight: 500,
                    color: "rgba(82, 82, 91, 0.55)",
                  }}
                >
                  Image coming soon
                </Typography>
              </Box>
            )}
          </Box>

          {/* Info area */}
          <Box sx={{ px: 2.2, pt: 1.4, pb: 2, position: "relative", zIndex: 3 }}>
            <Typography
              sx={{
                fontFamily: COLLECTION_PRODUCT_FONT,
                fontWeight: 600,
                letterSpacing: "0.14em",
                fontSize: 10.5,
                textTransform: "uppercase",
                color: "rgba(63, 63, 70, 0.78)",
              }}
            >
              {product.brand || "Eyewear"}
            </Typography>

            <Typography
              sx={{
                mt: 0.55,
                fontFamily: COLLECTION_PRODUCT_FONT,
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1.4,
                color: "#27272A",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical" as const,
              }}
            >
              {product.name}
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontFamily: COLLECTION_PRODUCT_FONT,
                fontWeight: 600,
                fontSize: 15.5,
                color: "#3F3F46",
              }}
            >
              {product.price.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        // full-bleed continuation of hero + category panels
        width: "100vw",
        position: "relative",
        left: "50%",
        right: "50%",
        ml: "-50vw",
        mr: "-50vw",
        mt: "-1px",
        pt: 0,
        pb: 0,
        bgcolor: "transparent",
      }}
    >
      {/* Modular editorial grid (no autoplay, no gaps) */}
      <Box
        sx={{
          width: "100%",
          display: "grid",
          gap: 0,
          // Intro spans 2 columns; products are square tiles
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(4, minmax(0, 1fr))",
            md: "repeat(6, minmax(0, 1fr))",
          },
          bgcolor: "transparent",
        }}
      >
        {/* Hàng 1: sản phẩm trước, hero 2 cột ở cuối (sm/md); xs: 2 SP rồi hero full width hàng sau */}
        {beforeHero.map((p, idx) => renderProductTile(p, idx, "lead"))}

        {/* Hero tile: embedded 3D (Cloudinary glasses_rgcuyg.glb) — cuối hàng 1 trên sm+ */}
        <Box
          sx={{
            gridColumn: {
              xs: "1 / -1",
              sm: "3 / span 2",
              md: "5 / span 2",
            },
            gridRow: {
              xs: "auto",
              sm: "1",
              md: "1",
            },
            aspectRatio: "2 / 1",
            background: HERO_TILE_BACKGROUND,
            borderRight: ITEM_TILE_BORDER,
            borderBottom: ITEM_TILE_BORDER,
            position: "relative",
            overflow: "hidden",
            minHeight: { xs: 200, sm: 220 },
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 0 0 1px rgba(0, 0, 0, 0.22)",
          }}
        >
          <InlineGlbViewer
            modelUrl={TOP_SELLER_HERO_GLB}
            clearColor={HERO_CLEAR_COLOR}
            variant="light"
            loadingBackdropColor={HERO_LOADING_BACKDROP}
          />

          <Box
            sx={{
              position: "absolute",
              top: { xs: 12, sm: 14, md: 16 },
              left: { xs: 14, sm: 16, md: 18 },
              zIndex: 3,
              pointerEvents: "none",
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                ...heroTitleDarkFillSx,
              }}
            >
              Best sellers
            </Typography>
            <Typography
              sx={{
                mt: 0.75,
                fontSize: { xs: 15, sm: 16, md: 17 },
                fontWeight: 600,
                letterSpacing: "0.02em",
                maxWidth: { xs: 300, sm: 380 },
                lineHeight: 1.25,
                ...heroTitleDarkFillSx,
              }}
            >
              Drag to explore every detail of the frame in 3D
            </Typography>
          </Box>

          <Typography
            component="div"
            onClick={() => navigate("/collections/all")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/collections/all");
              }
            }}
            sx={{
              position: "absolute",
              bottom: { xs: 14, sm: 16, md: 18 },
              right: { xs: 14, sm: 16, md: 18 },
              zIndex: 3,
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              outline: "none",
              px: 0.75,
              py: 0.25,
              ...heroTitleLightFillSx,
              textTransform: "uppercase",
              letterSpacing: "0.24em",
              fontSize: 10.5,
              fontWeight: 800,
              transformOrigin: "right bottom",
              transition:
                "transform .35s cubic-bezier(.22,1,.36,1), filter .25s cubic-bezier(.22,1,.36,1)",
              "&:focus-visible": { boxShadow: "0 0 0 2px rgba(255,255,255,0.45)" },
              "&:hover": {
                transform: "scale(1.04)",
                filter:
                  "brightness(1.1) drop-shadow(0 1px 0 rgba(0,0,0,0.55)) drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
              },
            }}
          >
            View all
            <Box component="span" sx={{ fontSize: 14, lineHeight: 0.8 }}>
              →
            </Box>
          </Typography>
        </Box>

        {afterHero.map((p, idx) => renderProductTile(p, idx, "tail"))}
      </Box>
    </Box>
  );
}

