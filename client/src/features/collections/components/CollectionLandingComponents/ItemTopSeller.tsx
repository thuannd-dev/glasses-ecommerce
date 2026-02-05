import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router";
import { useProducts } from "../../../../lib/hooks/useProducts";
import type { Product } from "../../types";

export default function ItemTopSeller() {
  const navigate = useNavigate();

  // Lấy một vài sản phẩm nổi bật để trưng ở landing (Our Products)
  const { products, isLoading } = useProducts({
    pageNumber: 1,
    pageSize: 6,
    sortBy: 0,
    sortOrder: 0,
  });

  const visible = (Array.isArray(products) ? products : []).slice(0, 10);
  const items: (Product | undefined)[] = isLoading
    ? Array.from({ length: 10 })
    : [...visible, ...visible];

  return (
    <Box
      sx={{
        py: 10,
        width: "100vw",
        position: "relative",
        left: "50%",
        right: "50%",
        ml: "-50vw",
        mr: "-50vw",
        bgcolor: "#f9fafb",
      }}
    >
      <Box sx={{ width: "100%", px: { xs: 2, md: 6, lg: 10 } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            mb: 4,
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 12,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "rgba(15,23,42,0.6)",
              }}
            >
              Our products
            </Typography>
            <Typography
              sx={{
                mt: 1,
                fontSize: { xs: 24, md: 28 },
                fontWeight: 900,
                letterSpacing: -0.8,
                color: "rgba(15,23,42,0.95)",
              }}
            >
              Frames customers keep reaching for.
            </Typography>
          </Box>

          <Button
            variant="text"
            onClick={() => navigate("/collections/glasses")}
            sx={{
              textTransform: "none",
              fontSize: 14,
              fontWeight: 700,
              color: "rgba(15,23,42,0.8)",
              "&:hover": { color: "rgba(15,23,42,1)" },
            }}
          >
            View all products →
          </Button>
        </Box>

        {/* Products marquee (băng chuyền chạy ngang như LED) */}
        <Box
          sx={{
            mt: 4,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              gap: 2.5,
              animation: "ourProductsMarquee 35s linear infinite",
              "@keyframes ourProductsMarquee": {
                "0%": { transform: "translateX(0)" },
                "100%": { transform: "translateX(-50%)" },
              },
              "&:hover": {
                animationPlayState: "paused",
              },
            }}
          >
            {items.map((p, idx) => {
              if (!p) {
                return (
                  <Box
                    key={idx}
                    sx={{
                      flex: "0 0 260px",
                      borderRadius: 3,
                      bgcolor: "#e5e7eb",
                      height: 200,
                      opacity: 0.6,
                    }}
                  />
                );
              }

              const product: Product = p;
                return (
                  <Box
                    key={product.id + "-" + idx}
                    onClick={() => navigate(`/product/${product.id}`)}
                    sx={{
                      flex: "0 0 260px",
                      cursor: "pointer",
                      borderRadius: 3,
                      bgcolor: "#ffffff",
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                      boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
                      transition: "transform 150ms ease, box-shadow 150ms ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 18px 45px rgba(15,23,42,0.12)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: 2,
                        overflow: "hidden",
                        bgcolor: "#f3f4f6",
                        height: 140,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
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
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "rgba(107,114,128,0.9)",
                          }}
                        >
                          Image coming soon
                        </Typography>
                      )}
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: 2,
                          color: "rgba(148,163,184,1)",
                        }}
                      >
                        {product.brand || "Eyewear"}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.5,
                          fontSize: 14,
                          fontWeight: 700,
                          color: "rgba(15,23,42,0.95)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.5,
                          fontSize: 13,
                          color: "rgba(55,65,81,0.9)",
                          fontWeight: 600,
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
                );
              })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

