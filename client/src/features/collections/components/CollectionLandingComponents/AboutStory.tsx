import { Box, IconButton, LinearProgress, Typography } from "@mui/material";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

type StorySlide = {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  stats?: Array<{ value: string; label: string }>;
};

// Chuyển slide đúng nhịp: ~6s/lần
const AUTOPLAY_MS = 6000;

const ROOT_SX = {
  position: "relative",
  left: "50%",
  right: "50%",
  ml: "-50vw",
  mr: "-50vw",
  width: "100vw",
  // Seamless continuation
  mt: "-1px",
} as const;

const SLIDES: StorySlide[] = [
  {
    id: "01",
    image: "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1773944649/z7638177981253_1c235eb3269584c60bbf71e2a0dc452c_xrnejp.jpg",
    eyebrow: "ABOUT EYEWEAR STUDIO",
    title: "Glasses that frame your life,\nnot hide it.",
    description:
      "Designed for real faces and real days—screen time, city rides, late‑night reading, changing light. Our frames are tuned to feel effortless and look precise.",
    stats: [
      { value: "15k+", label: "prescriptions & fashion frames" },
      { value: "4.8", label: "average rating from eyewear lovers" },
    ],
  },
  {
    id: "02",
    image: "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770195404/glasses/natrtu1emsrgfbxtyfgq.jpg",
    eyebrow: "CRAFT • FIT • FINISH",
    title: "Studio‑made details.\nStreet‑tested comfort.",
    description:
      "From hinge tension to nose‑pad geometry, every detail is dialed in. Premium materials, refined edges, and a fit that disappears the moment you wear it.",
  },
  {
    id: "03",
    image: "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1773944656/vooglam-eyewear-QSb7IMnUoGo-unsplash_gs2eo6.jpg",
    eyebrow: "MATERIALS WITH INTENT",
    title: "Lightweight metals.\nPlant‑based acetate.",
    description:
      "Cleaner materials, better balance, and a finish that feels elevated. Pair with blue‑light options or prescription lenses—built for clarity and style.",
  },
];

function clampIndex(i: number, total: number) {
  return ((i % total) + total) % total;
}

export default function AboutStory() {
  const reduce = useReducedMotion();
  const total = SLIDES.length;
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const interactedUntilRef = useRef<number>(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(true);
  // Throttle rapid user clicks to prevent heavy AnimatePresence re-mount stutter.
  const transitionUntilRef = useRef<number>(0);

  const active = SLIDES[index];

  const easeEditorial = useMemo(() => [0.22, 1, 0.36, 1] as const, []);

  const goTo = useCallback(
    (next: number, markInteract = true) => {
      if (markInteract && Date.now() < transitionUntilRef.current) return;
      const clamped = clampIndex(next, total);
      indexRef.current = clamped;
      setIndex(clamped);
      if (markInteract) {
        // Khi user tương tác: chờ đến nhịp autoplay tiếp theo (~6s) để không “nhảy gấp”.
        interactedUntilRef.current = Date.now() + AUTOPLAY_MS;
        transitionUntilRef.current = Date.now() + 1200;
      }
    },
    [total],
  );

  const next = useCallback(() => goTo(indexRef.current + 1, false), [goTo]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // Preload slide images to reduce jank when switching.
  useEffect(() => {
    const imgs = SLIDES.map((s) => {
      const img = new Image();
      img.src = s.image;
      return img;
    });
    return () => {
      // Nothing to cleanup; keep for potential cache.
      void imgs;
    };
  }, []);

  // Pause autoplay when carousel is not visible (major perf win on long pages).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInView(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.25 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduce) return;
    if (!isInView) return;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      if (Date.now() < interactedUntilRef.current) return;
      next();
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [next, reduce, isInView]);

  const progress = useMemo(() => ((index + 1) / total) * 100, [index, total]);

  const textWrapV = useMemo(
    () => ({
      initial: { opacity: 1 },
      animate: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
      exit: { opacity: 0, y: 10, transition: { duration: 0.3, ease: easeEditorial } },
    }),
    [easeEditorial],
  );

  const eyebrowV = useMemo(
    () => ({
      initial: { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeEditorial } },
      exit: { opacity: 0, y: 10, transition: { duration: 0.25, ease: easeEditorial } },
    }),
    [easeEditorial],
  );

  const titleV = useMemo(
    () => ({
      initial: { opacity: 0, y: 26 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.12, ease: easeEditorial } },
      exit: { opacity: 0, y: 12, transition: { duration: 0.25, ease: easeEditorial } },
    }),
    [easeEditorial],
  );

  const descV = useMemo(
    () => ({
      initial: { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.62, delay: 0.24, ease: easeEditorial } },
      exit: { opacity: 0, y: 10, transition: { duration: 0.22, ease: easeEditorial } },
    }),
    [easeEditorial],
  );

  const statsV = useMemo(
    () => ({
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.55, delay: 0.34, ease: easeEditorial } },
      exit: { opacity: 0, y: 8, transition: { duration: 0.22, ease: easeEditorial } },
    }),
    [easeEditorial],
  );

  return (
    <Box sx={ROOT_SX}>
      <Box
        component={motion.section}
        ref={(node: HTMLElement | null) => {
          sectionRef.current = node;
        }}
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: "78vh", md: "86vh" },
          minHeight: { xs: 560, md: 640 },
          overflow: "hidden",
          bgcolor: "#0B0B0B",
        }}
      >
        {/* Background dissolve */}
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={active.id}
            style={{ position: "absolute", inset: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.65, ease: "easeOut" } }}
            exit={{ opacity: 0, transition: { duration: 0.55, ease: "easeOut" } }}
          >
            <motion.div
              style={{ position: "absolute", inset: 0 }}
              initial={reduce ? { scale: 1 } : { scale: 1.06 }}
              animate={reduce ? { scale: 1 } : { scale: 1, transition: { duration: 1.55, ease: "easeOut" } }}
            >
              <Box
                component="img"
                src={active.image}
                alt=""
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: { xs: "center 48%", md: "center 40%" },
                  display: "block",
                }}
              />
            </motion.div>

            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.42) 46%, rgba(0,0,0,0.12) 100%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.75, ease: "easeOut" } }}
              exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
            />
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.42) 100%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.85, ease: "easeOut" } }}
              exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            px: { xs: 2.5, sm: 4, md: 6, lg: 10 },
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 560 }}>
            {/* slide index line */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 2.5, color: "rgba(255,255,255,0.68)" }}>
              <Box sx={{ width: 40, height: "1px", bgcolor: "rgba(255,255,255,0.28)" }} />
              <Typography sx={{ fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", fontWeight: 700 }}>
                {active.id} / {String(total).padStart(2, "0")}
              </Typography>
            </Box>

            <AnimatePresence mode="wait" initial={false}>
              <Box
                key={active.id}
                component={motion.div}
                variants={textWrapV}
                initial={reduce ? false : "initial"}
                animate="animate"
                exit="exit"
              >
                <Typography
                  component={motion.p}
                  variants={eyebrowV}
                  sx={{
                    fontSize: 11,
                    letterSpacing: "0.34em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.72)",
                  }}
                >
                  {active.eyebrow}
                </Typography>

                <Typography
                  component={motion.h2}
                  variants={titleV}
                  sx={{
                    mt: 1.5,
                    fontSize: { xs: 34, sm: 42, md: 54 },
                    lineHeight: 1.03,
                    letterSpacing: "-0.02em",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.94)",
                    whiteSpace: "pre-line",
                    fontFamily: '"Playfair Display","Times New Roman",Times,serif',
                  }}
                >
                  {active.title}
                </Typography>

                <Typography
                  component={motion.p}
                  variants={descV}
                  sx={{
                    mt: 3,
                    fontSize: { xs: 13.5, sm: 14.5 },
                    lineHeight: 1.75,
                    color: "rgba(255,255,255,0.72)",
                    maxWidth: 520,
                  }}
                >
                  {active.description}
                </Typography>

                {active.stats?.length ? (
                  <Box component={motion.div} variants={statsV} sx={{ mt: 4, display: "flex", gap: 4 }}>
                    {active.stats.map((s) => (
                      <Box key={s.value}>
                        <Typography sx={{ fontSize: 22, fontWeight: 900, color: "rgba(255,255,255,0.92)" }}>
                          {s.value}
                        </Typography>
                        <Typography sx={{ mt: 0.5, fontSize: 11, color: "rgba(255,255,255,0.66)", maxWidth: 180 }}>
                          {s.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : null}
              </Box>
            </AnimatePresence>
          </Box>
        </Box>

        {/* Controls */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            pointerEvents: "none",
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "space-between",
            px: { md: 3, lg: 4 },
          }}
        >
          <IconButton
            onClick={() => {
              goTo(indexRef.current - 1, true);
            }}
            sx={{
              pointerEvents: "auto",
              width: 44,
              height: 44,
              borderRadius: 999,
              bgcolor: "rgba(0,0,0,0.20)",
              border: "1px solid rgba(255,255,255,0.20)",
              color: "rgba(255,255,255,0.80)",
              backdropFilter: "blur(8px)",
              transition: "background-color .25s ease, color .25s ease",
              "&:hover": { bgcolor: "rgba(0,0,0,0.30)", color: "rgba(255,255,255,0.94)" },
              "& .arrow": {
                transform: "translateX(-1px)",
                transition: "transform .25s ease",
              },
              "&:hover .arrow": { transform: "translateX(-2px)" },
            }}
            aria-label="Previous story slide"
          >
            <Box component="span" className="arrow" sx={{ display: "inline-flex" }}>
              <ChevronLeft />
            </Box>
          </IconButton>
          <IconButton
            onClick={() => {
              goTo(indexRef.current + 1, true);
            }}
            sx={{
              pointerEvents: "auto",
              width: 44,
              height: 44,
              borderRadius: 999,
              bgcolor: "rgba(0,0,0,0.20)",
              border: "1px solid rgba(255,255,255,0.20)",
              color: "rgba(255,255,255,0.80)",
              backdropFilter: "blur(8px)",
              transition: "background-color .25s ease, color .25s ease",
              "&:hover": { bgcolor: "rgba(0,0,0,0.30)", color: "rgba(255,255,255,0.94)" },
              "& .arrow": {
                transform: "translateX(1px)",
                transition: "transform .25s ease",
              },
              "&:hover .arrow": { transform: "translateX(2px)" },
            }}
            aria-label="Next story slide"
          >
            <Box component="span" className="arrow" sx={{ display: "inline-flex" }}>
              <ChevronRight />
            </Box>
          </IconButton>
        </Box>

        {/* Dots + progress */}
        <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 4, px: { xs: 2.5, sm: 4, md: 6, lg: 10 }, pb: 2.25 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
              {SLIDES.map((s, i) => (
                <Box
                  key={s.id}
                  onClick={() => goTo(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") goTo(i);
                  }}
                  sx={{
                    width: 22,
                    height: 22,
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                    outline: "none",
                    "&:focus-visible": { boxShadow: "0 0 0 2px rgba(255,255,255,0.25)" },
                  }}
                  aria-label={`Go to story slide ${i + 1}`}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      bgcolor: i === index ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.32)",
                      transition: "background-color .3s ease",
                    }}
                  />
                </Box>
              ))}
            </Box>
            <Box sx={{ width: 200, maxWidth: "45vw" }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 2,
                  bgcolor: "rgba(255,255,255,0.18)",
                  "& .MuiLinearProgress-bar": { bgcolor: "rgba(255,255,255,0.72)" },
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
