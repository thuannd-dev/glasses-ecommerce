import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { useProducts } from "../../../../lib/hooks/useProducts";
import type { Product } from "../../../../lib/types";

export default function ItemTopSeller() {
  const navigate = useNavigate();

  // Lấy một vài sản phẩm nổi bật để trưng ở landing (Our Products)
  const { products, isLoading } = useProducts({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 0,
    sortOrder: 0,
  });

  const visible = (Array.isArray(products) ? products : []).slice(0, 10);
  const items: (Product | undefined)[] = isLoading ? Array.from({ length: 10 }) : visible;

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
        {/* Intro tile */}
        <Box
          sx={{
            gridColumn: {
              xs: "span 2",
              sm: "span 2",
              md: "span 2",
            },
            gridRow: {
              xs: "span 1",
              sm: "span 1",
              md: "span 1",
            },
            aspectRatio: "2 / 1",
            bgcolor: "#0D0D0E",
            color: "rgba(255,255,255,0.92)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            px: { xs: 2.25, sm: 2.75, md: 3.25 },
            py: { xs: 2.25, sm: 2.75, md: 3.25 },
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Corner CTA (lightweight) */}
          <Box
            onClick={() => navigate("/collections/all")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/collections/all");
            }}
            sx={{
              position: "absolute",
              bottom: { xs: 14, sm: 16, md: 18 },
              right: { xs: 14, sm: 16, md: 18 },
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              outline: "none",
              px: 0.75,
              py: 0.25,
              color: "rgba(255,255,255,0.78)",
              textTransform: "uppercase",
              letterSpacing: "0.24em",
              fontSize: 10.5,
              fontWeight: 800,
              transformOrigin: "right bottom",
              transition:
                "transform .35s cubic-bezier(.22,1,.36,1), color .25s cubic-bezier(.22,1,.36,1)",
              "&:focus-visible": { boxShadow: "0 0 0 2px rgba(255,255,255,0.22)" },
              "&:hover": { color: "rgba(255,255,255,0.92)", transform: "scale(1.04)" },
            }}
          >
            View all
            <Box component="span" sx={{ fontSize: 14, lineHeight: 0.8 }}>
              →
            </Box>
          </Box>

          <Box sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Typography
              sx={{
                fontSize: 11,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.70)",
              }}
            >
              Best sellers
            </Typography>
            <Typography
              sx={{
                mt: 1.1,
                fontSize: { xs: 22, sm: 26, md: 30 },
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1.06,
                fontFamily: '"Playfair Display","Times New Roman",Times,serif',
              }}
            >
              Frames customers keep reaching for.
            </Typography>
            <Typography
              sx={{
                mt: 1.4,
                fontSize: 13.5,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.64)",
                maxWidth: 340,
              }}
            >
              A curated selection of best‑selling frames with premium silhouettes and elevated finishes.
            </Typography>
          </Box>
        </Box>

        {/* Product tiles */}
        {items.map((p, idx) => {
          if (!p) {
            return (
              <Box
                key={`sk-${idx}`}
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
                    bgcolor: "#F6F4F1",
                    borderRight: "1px solid rgba(0,0,0,0.14)",
                    borderBottom: "1px solid rgba(0,0,0,0.14)",
                  }}
                />
              </Box>
            );
          }

          const product: Product = p;

          return (
            <Box
              key={product.id + "-" + idx}
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
                  if (e.key === "Enter" || e.key === " ") navigate(`/product/${product.id}`);
                }}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 0,
                  borderRight: "1px solid rgba(0,0,0,0.14)",
                  borderBottom: "1px solid rgba(0,0,0,0.14)",
                  bgcolor: "#F8F6F1",
                  overflow: "hidden",
                  cursor: "pointer",
                  outline: "none",
                  transition: "background-color 160ms ease",
                  "&:hover": {
                    bgcolor: "#F3F0EA",
                  },
                  "&:focus-visible": { boxShadow: "0 0 0 2px rgba(17,24,39,0.25)" },
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
                    bgcolor: "#000000",
                    mixBlendMode: "multiply",
                    opacity: 0.10,
                  }}
                />
                <Box
                  sx={{
                    pointerEvents: "none",
                    position: "absolute",
                    inset: 0,
                    zIndex: 2,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.14) 55%, rgba(0,0,0,0.24) 100%)",
                  }}
                />

                {/* Image area */}
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    bgcolor: "#F6F4F2",
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
                      <Typography sx={{ fontSize: 12, color: "rgba(107,114,128,0.9)" }}>
                        Image coming soon
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Info area */}
                <Box sx={{ px: 2.2, pt: 1.4, pb: 2, position: "relative", zIndex: 3 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      fontSize: 10.5,
                      textTransform: "uppercase",
                      color: "#8A8A8A",
                    }}
                  >
                    {product.brand || "Eyewear"}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.55,
                      fontSize: 13.5,
                      fontWeight: 600,
                      lineHeight: 1.35,
                      color: "#171717",
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
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#171717",
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
        })}
      </Box>
    </Box>
  );
}

