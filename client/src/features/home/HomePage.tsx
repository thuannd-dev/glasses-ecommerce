import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import summerImg from "../../app/assets/cord-allman-B11CqlzCJ_8-unsplash.jpg";
import dailyImg from "../../app/assets/joe-ciciarelli-BVNmFNShq6U-unsplash.jpg";
import opticalImg from "../../app/assets/felirbe-Ns0iGdiSx00-unsplash.jpg";
/**
 * ✅ OPTIONAL nếu bạn muốn dùng ảnh local dạng import (khuyên dùng khi build)
 * - đặt ảnh trong: src/assets/hero/
 * - rồi mở comment và sửa đường dẫn đúng
 */
// import summerImg from "../assets/hero/summer.jpg";
// import dailyImg from "../assets/hero/daily.jpg";
// import sunwearImg from "../assets/hero/sunwear.jpg";

type Slide = {
  id: string;
  tagline: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaTo: string;
  bg: { type: "image" | "gradient"; value: string };
};

export default function HomePage() {
  const slides: Slide[] = useMemo(
    () => [
      {
        id: "summer",
        tagline: "SUMMER COLLECTION 2026",
        title: "Eyewear is Identity.",
        subtitle: "Minimalist fashion glasses — flattering the face, matching outfits, great for photos.",
        ctaText: "Explore Collection",
        ctaTo: "/collections",
        bg: {
          /**
           * ✅ Bạn tự thêm ảnh ở đây:
           * Cách 1 (public): value: "/images/hero/summer.jpg"
           * Cách 2 (URL): value: "https://...."
           * Cách 3 (import): value: summerImg
           */
          type: "image",
          value: summerImg,
          // value: summerImg,
        },
      },
      {
        id: "daily",
        tagline: "DAILY FRAMES",
        title: "Minimal. Clean. Premium.",
        subtitle: "Lightweight frame, comfortable to wear all day — suitable for school or work.",
        ctaText: "Shop Best Sellers",
        ctaTo: "/activities",
        bg: {
          type: "image",
          value: dailyImg,
          // value: dailyImg,
        },
      },
      {
        id: "optical",
        tagline: "OPTICAL / PRESCRIPTION LENS",
        title: "Clear Vision. True Comfort.",
        subtitle: "Prescription lenses • blue light protection • lightweight • vision standard.",
        ctaText: "View Optical",
        ctaTo: "/activities",
        bg: {
          type: "image",
          value: opticalImg,
          // value: opticalImg,
        },
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const total = slides.length;

  const isAnimatingRef = useRef(false);
  const wheelAccRef = useRef(0);
  const homeRef = useRef<HTMLDivElement | null>(null);

  // ✅ stable function → satisfy exhaustive-deps, no stale closure
  const go = useCallback(
    (next: number) => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      const n = (next + total) % total;
      setIndex(n);

      window.setTimeout(() => {
        isAnimatingRef.current = false;
      }, 650);
    },
    [total]
  );

  // ✅ Auto slide
  useEffect(() => {
    const t = window.setInterval(() => go(index + 1), 7000);
    return () => window.clearInterval(t);
  }, [index, go]);

  const active = slides[index];

  /**
   * ✅ NỀN ẢNH + overlay tối để chữ nổi
   * - Nếu bạn muốn overlay đậm hơn/nhạt hơn: chỉnh rgba(0,0,0,.55)
   */
  const bgStyle =
    active.bg.type === "image"
      ? `linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,.55)), url(${active.bg.value})`
      : active.bg.value;

  // ✅ Wheel to change slides
  useEffect(() => {
    const el = homeRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      wheelAccRef.current += e.deltaY;

      const TH = 80;
      if (wheelAccRef.current > TH) {
        wheelAccRef.current = 0;
        go(index + 1);
      } else if (wheelAccRef.current < -TH) {
        wheelAccRef.current = 0;
        go(index - 1);
      }
    };

    const handler: EventListener = (ev) => onWheel(ev as WheelEvent);

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [index, go]);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Paper
        ref={homeRef}
        sx={{
          height: "100vh",
          color: "white",
          position: "relative",
          overflow: "hidden",
          borderRadius: 0,

          // ✅ background by slide
          backgroundImage: bgStyle,
          backgroundSize: "cover",
          backgroundPosition: "center",

          /**
           * NOTE: background-image transition thường không mượt hoàn hảo
           * Nếu bạn muốn fade nền siêu mượt, mình sẽ đổi sang layer Box + opacity
           */
          transition: "background-image 700ms ease",
        }}
      >
        {/* Overlay glow */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(900px 500px at 20% 10%, rgba(255,255,255,.10), transparent 60%), radial-gradient(900px 500px at 80% 30%, rgba(255,255,255,.06), transparent 60%)",
            pointerEvents: "none",
          }}
        />

        {/* CONTENT */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            px: { xs: 3, md: 10 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.05fr .95fr" },
            alignItems: "center",
            gap: { xs: 6, md: 3 },
          }}
        >
          {/* Left content */}
          <Box
            sx={{
              maxWidth: 720,
              transform: "translateY(0px)",
              animation: "slideUp .55s ease",
              "@keyframes slideUp": {
                from: { opacity: 0, transform: "translateY(16px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
            key={active.id}
          >
            <Typography
              sx={{
                display: "inline-block",
                fontWeight: 800,
                letterSpacing: 2,
                fontSize: 12,
                px: 1.5,
                py: 0.8,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.18)",
                backgroundColor: "rgba(0,0,0,.25)",
              }}
            >
              {active.tagline}
            </Typography>

            <Typography
              variant="h1"
              sx={{
                mt: 2,
                fontWeight: 900,
                lineHeight: 1.03,
                letterSpacing: "-0.8px",
                fontSize: { xs: 40, sm: 56, md: 72 },
              }}
            >
              {active.title}
            </Typography>

            <Typography
              sx={{
                mt: 2,
                color: "rgba(255,255,255,.78)",
                fontSize: { xs: 16, md: 18 },
                lineHeight: 1.7,
                maxWidth: 560,
              }}
            >
              {active.subtitle}
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5, mt: 3, flexWrap: "wrap" }}>
              <Button
                component={RouterLink}
                to={active.ctaTo}
                variant="contained"
                size="large"
                sx={{
                  px: 3,
                  py: 1.4,
                  borderRadius: 3,
                  fontWeight: 800,
                  textTransform: "none",
                }}
              >
                {active.ctaText}
              </Button>

              <Button
                component={RouterLink}
                to="/activities"
                variant="outlined"
                size="large"
                sx={{
                  px: 3,
                  py: 1.4,
                  borderRadius: 3,
                  fontWeight: 800,
                  textTransform: "none",
                  borderColor: "rgba(255,255,255,.35)",
                  color: "white",
                }}
              >
                See All Items
              </Button>
            </Box>

            {/* Mini stats */}
            <Box
              sx={{
                mt: 4,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 1.5,
                maxWidth: 720,
              }}
            >
              {[
                { k: "Try-on", v: "Lookbook vibe" },
                { k: "UV400", v: "Sunwear ready" },
                { k: "Daily", v: "Lightweight frames" },
              ].map((s) => (
                <Box
                  key={s.k}
                  sx={{
                    p: 1.8,
                    borderRadius: 3,
                    border: "1px solid rgba(255,255,255,.14)",
                    backgroundColor: "rgba(0,0,0,.22)",
                  }}
                >
                  <Typography sx={{ fontWeight: 900 }}>{s.k}</Typography>
                  <Typography
                    sx={{ color: "rgba(255,255,255,.7)", fontSize: 13 }}
                  >
                    {s.v}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right lookbook cards */}
          <Box
            sx={{
              display: { xs: "none", md: "grid" },
              gap: 2,
              justifySelf: "end",
              width: 420,
              animation: "fadeIn .55s ease",
              "@keyframes fadeIn": {
                from: { opacity: 0, transform: "translateY(10px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
            key={`cards-${active.id}`}
          >
            {[
              { title: "Daily Frame", desc: "Clean silhouette • easy fit" },
              { title: "Sunwear", desc: "Bold • street-ready" },
              { title: "Lens Pro", desc: "Bluecut • anti-glare" },
            ].map((c) => (
              <Box
                key={c.title}
                sx={{
                  p: 2.2,
                  borderRadius: 4,
                  border: "1px solid rgba(255,255,255,.14)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,.08), rgba(0,0,0,.18))",
                  boxShadow: "0 18px 60px rgba(0,0,0,.35)",
                }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: 18 }}>
                  {c.title}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,.72)", mt: 0.6 }}>
                  {c.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Vertical dots */}
        <Box
          sx={{
            position: "absolute",
            right: 18,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.2,
            zIndex: 3,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {slides.map((s, i) => (
              <Box
                key={s.id}
                onClick={() => go(i)}
                sx={{
                  width: 10,
                  height: i === index ? 28 : 10,
                  borderRadius: 999,
                  cursor: "pointer",
                  transition: "all 200ms ease",
                  backgroundColor:
                    i === index
                      ? "rgba(255,255,255,.92)"
                      : "rgba(255,255,255,.35)",
                }}
                title={`Go to ${s.id}`}
              />
            ))}
          </Box>
        </Box>

        {/* Hint bottom */}
        <Box
          sx={{
            position: "absolute",
            left: 18,
            bottom: 16,
            zIndex: 3,
            color: "rgba(255,255,255,.65)",
            fontWeight: 800,
            fontSize: 13,
            border: "1px solid rgba(255,255,255,.12)",
            backgroundColor: "rgba(0,0,0,.20)",
            px: 1.5,
            py: 0.8,
            borderRadius: 999,
          }}
        >
          Scroll ↑ ↓ to change slides
        </Box>
      </Paper>
    </Box>
  );
}
