import { useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import { useProducts, useCategories } from "../../../../lib/hooks/useProducts";
import type { Product } from "../../types";
import { ProductCard } from "../CollectionPageComponents/ProductCard";

type Props = {
  categorySlug: string;
  currentProductId: string;
};

export function RelatedProductsCarousel({ categorySlug, currentProductId }: Props) {
  const { categories } = useCategories();

  const categoryId = categories.find(
    (c) =>
      c.slug.toLowerCase() === categorySlug.toLowerCase() ||
      c.name.toLowerCase() === categorySlug.toLowerCase(),
  )?.id;

  const { products } = useProducts({
    pageNumber: 1,
    pageSize: 12,
    categoryIds: categoryId ? [categoryId] : undefined,
  });

  const items: Product[] = products.filter((p) => p.id !== currentProductId);
  const [activeIndex, setActiveIndex] = useState(0); // index slide
  const itemsPerSlide = 6; // mỗi slide 6 sản phẩm
  const slideCount = Math.max(1, Math.ceil(items.length / itemsPerSlide));

  useEffect(() => {
    if (!items.length) return;
    setActiveIndex(0);
  }, [categorySlug, currentProductId, items.length]);

  useEffect(() => {
    if (slideCount <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, 7000);
    return () => clearInterval(id);
  }, [slideCount]);

  if (!items.length) return null;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % slideCount);
  };

  return (
    <Box mt={6}>
      <Typography fontWeight={900} fontSize={18} mb={2}>
        You may also like
      </Typography>

      {/* Slide area */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Nút trái/phải nằm trong slide */}
        <IconButton
          size="small"
          onClick={handlePrev}
          sx={{
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "rgba(255,255,255,0.9)",
            borderRadius: "999px",
            boxShadow: "0 6px 18px rgba(15,23,42,0.18)",
            "&:hover": {
              bgcolor: "rgba(15,23,42,0.95)",
              color: "#fff",
            },
          }}
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={handleNext}
          sx={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "rgba(255,255,255,0.9)",
            borderRadius: "999px",
            boxShadow: "0 6px 18px rgba(15,23,42,0.18)",
            "&:hover": {
              bgcolor: "rgba(15,23,42,0.95)",
              color: "#fff",
            },
          }}
        >
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>

        <Box
          sx={{
            display: "flex",
            transition: "transform 0.6s ease",
            transform: `translateX(-${activeIndex * 100}%)`,
          }}
        >
          {Array.from({ length: slideCount }).map((_, slideIdx) => {
            const start = slideIdx * itemsPerSlide;
            const slice = items.slice(start, start + itemsPerSlide);

            return (
              <Box
                key={slideIdx}
                sx={{
                  minWidth: "100%",
                  maxWidth: "100%",
                  px: 0,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between", // dàn đều full chiều ngang
                    gap: 0.5, // gap nhỏ hơn để card to hơn
                  }}
                >
                  {slice.map((p) => (
                    <Box
                      key={p.id}
                      sx={{
                        // 6 card + 5 gap (4px) → mỗi card rộng hơn
                        flex: "0 0 calc((100% - 5 * 4px) / 6)",
                        maxWidth: 260,
                      }}
                    >
                      <ProductCard p={p} />
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Dots */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 1,
          mt: 2,
        }}
      >
        {Array.from({ length: slideCount }).map((_, idx) => (
          <Box
            key={idx}
            onClick={() => setActiveIndex(idx)}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "999px",
              bgcolor: idx === activeIndex ? "#111827" : "rgba(15,23,42,0.3)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
