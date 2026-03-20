import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { Box } from "@mui/material";

type HeroSlide = {
  id: string;
  image: string;
  subtitle: string; // uppercase label
  title: string; // allow \n
  description: string;
  ctaLabel: string;
  ctaTo: string;
};

const AUTOPLAY_MS = 5600;

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "01",
    image:
      "https://images.unsplash.com/photo-1755519024831-6833a37098ad?q=80&w=1920&auto=format&fit=crop",
    subtitle: "Find your look",
    title: "Compare new frames",
    description: "Match your face shape, style and personality.",
    ctaLabel: "Shop now",
    ctaTo: "/collections/all",
  },
  {
    id: "02",
    image:
      "https://images.unsplash.com/photo-1711878502624-5a65b38eec5c?q=80&w=1920&auto=format&fit=crop",
    subtitle: "Want to look your best?",
    title: "Find must-have styles\nfor this spring",
    description: "New spring colors and styles.",
    ctaLabel: "Shop now",
    ctaTo: "/collections/all",
  },
  {
    id: "03",
    image:
      "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1773944651/viktor-hesse-Wib4Rp4UJNE-unsplash_qge1rr.jpg",
    subtitle: "Fit and style guarantee",
    title: "Prescription glasses at\nremarkable prices",
    description: "Find your perfect pair.",
    ctaLabel: "Shop now",
    ctaTo: "/collections/all",
  },
];

function clampIndex(i: number, total: number) {
  return ((i % total) + total) % total;
}

export default function HeroSection() {
  const reduce = useReducedMotion();
  const slides = HERO_SLIDES;
  const total = slides.length;

  const [index, setIndex] = useState(0);
  const [bgScale, setBgScale] = useState(1.06);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const interactedUntilRef = useRef<number>(0);

  const active = slides[index];

  // Slightly reduce zoom on larger screens to ease cropping
  useEffect(() => {
    const mq = window.matchMedia?.("(min-width: 768px)");
    if (!mq) return;

    const apply = () => setBgScale(mq.matches ? 1.05 : 1.06);
    apply();

    if (mq.addEventListener) mq.addEventListener("change", apply);
    else (mq as MediaQueryList & { addListener: (cb: () => void) => void }).addListener(apply);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", apply);
      else
        (mq as MediaQueryList & { removeListener: (cb: () => void) => void }).removeListener(
          apply,
        );
    };
  }, []);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const goTo = useCallback(
    (next: number) => {
      interactedUntilRef.current = Date.now() + 2000;
      setIndex(clampIndex(next, total));
    },
    [total],
  );

  const next = useCallback(() => goTo(indexRef.current + 1), [goTo]);
  const prev = useCallback(() => goTo(indexRef.current - 1), [goTo]);

  useEffect(() => {
    if (reduce) return;

    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      if (Date.now() < interactedUntilRef.current) return;
      setIndex((p) => clampIndex(p + 1, total));
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [reduce, total]);

  // keyboard nav
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev]);

  const progressKey = `${active.id}-${index}`;
  const easeEditorial = useMemo(() => [0.22, 1, 0.36, 1] as const, []);

  const textContainer = useMemo(
    () => ({
      initial: { opacity: 1 },
      animate: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.02 },
      },
      exit: { opacity: 0, y: 12, transition: { duration: 0.35, ease: easeEditorial } },
    }),
    [easeEditorial],
  );

  const subtitleV = useMemo(
    () => ({
      // Cross-fade in-place (no noticeable translate)
      initial: { opacity: 0, filter: "blur(2px)" },
      animate: {
        opacity: 1,
        filter: "blur(0px)",
        transition: { duration: 0.42, ease: easeEditorial },
      },
      exit: { opacity: 0, filter: "blur(2px)", transition: { duration: 0.38, ease: easeEditorial } },
    }),
    [easeEditorial],
  );

  const titleV = useMemo(
    () => ({
      // Drop-in from top
      initial: { opacity: 0, y: -72, filter: "blur(10px)" },
      animate: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.9, delay: 0.18, ease: easeEditorial },
      },
      exit: {
        opacity: 0,
        y: 18,
        filter: "blur(8px)",
        transition: { duration: 0.35, ease: easeEditorial },
      },
    }),
    [easeEditorial],
  );

  const descV = useMemo(
    () => ({
      // Slide from left to right
      initial: { opacity: 0, x: -56 },
      animate: { opacity: 1, x: 0, transition: { duration: 0.66, delay: 0.34, ease: easeEditorial } },
      exit: { opacity: 0, x: -26, transition: { duration: 0.3, ease: easeEditorial } },
    }),
    [easeEditorial],
  );

  const ctaV = useMemo(
    () => ({
      // Rise from bottom + subtle scale
      initial: { opacity: 0, y: 36, scale: 0.98 },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.56, delay: 0.52, ease: easeEditorial },
      },
      exit: { opacity: 0, y: 14, scale: 0.99, transition: { duration: 0.28, ease: easeEditorial } },
    }),
    [easeEditorial],
  );

  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden">
      <div
        className="relative w-full bg-neutral-950"
        style={{
          height: "100vh",
          boxSizing: "border-box",
        }}
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
      >
        {/* Background + dissolve */}
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={active.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }}
          >
            <motion.div
              className="absolute inset-0"
              initial={reduce ? { scale: 1 } : { scale: bgScale }}
              animate={
                reduce
                  ? { scale: 1 }
                  : { scale: 1, transition: { duration: 1.45, ease: "easeOut" } }
              }
            >
              <img
                src={active.image}
                alt=""
                className="h-full w-full object-cover object-[center_34%] md:object-[center_30%]"
                loading="eager"
                decoding="async"
              />
            </motion.div>

            {/* overlay gradient for readability */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 via-neutral-950/40 to-neutral-950/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.7, ease: "easeOut" } }}
              exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/15 to-black/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }}
              exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeOut" } }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Swipe layer (mobile) */}
        <motion.div
          className="absolute inset-0 z-[1] md:hidden"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          onDragStart={() => {
            pausedRef.current = true;
          }}
          onDragEnd={(_, info) => {
            pausedRef.current = false;
            const dx = info.offset.x;
            const vx = info.velocity.x;
            const swipe = Math.abs(dx) > 60 || Math.abs(vx) > 400;
            if (!swipe) return;
            if (dx < 0) next();
            else prev();
          }}
        />

        {/* Content */}
        <div className="relative z-[2] h-full">
          <div className="mx-auto h-full max-w-[1320px] px-6 sm:px-10 lg:px-16">
            <div className="flex h-full items-center">
              <div className="w-full max-w-[640px] pb-10 pt-28 md:pt-32 md:pb-0">
                {/* Editorial details */}
                <div className="mb-6 flex items-center gap-4 text-white/70">
                  <span className="h-px w-10 bg-white/30" />
                  <span className="text-[11px] font-medium tracking-[0.28em] uppercase">
                    {active.id} / {String(total).padStart(2, "0")}
                  </span>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active.id}
                    variants={textContainer}
                    initial={reduce ? false : "initial"}
                    animate="animate"
                    exit="exit"
                  >
                    <Box sx={{ minHeight: 18 }}>
                      <motion.p
                        variants={subtitleV}
                        className="text-[11px] sm:text-[12px] font-semibold tracking-[0.34em] uppercase text-white/80"
                      >
                        {active.subtitle}
                      </motion.p>
                    </Box>

                    <motion.h1
                      variants={titleV}
                      className="mt-4 whitespace-pre-line font-[600] leading-[1.02] tracking-[-0.02em] text-white text-[44px] sm:text-[56px] lg:text-[68px]"
                      style={{
                        fontFamily:
                          '"Playfair Display","Times New Roman",Times,serif',
                      }}
                    >
                      {active.title}
                    </motion.h1>

                    <motion.p
                      variants={descV}
                      className="mt-6 max-w-[520px] text-[14.5px] sm:text-[15.5px] leading-relaxed text-white/75"
                    >
                      {active.description}
                    </motion.p>

                    <motion.div variants={ctaV} className="mt-10 flex items-center gap-5">
                      <NavLink
                        to={active.ctaTo}
                        className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-3 text-[12px] font-semibold tracking-[0.22em] uppercase text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                      >
                        {active.ctaLabel}
                      </NavLink>
                      <span className="hidden sm:inline text-[12px] tracking-[0.18em] uppercase text-white/55">
                        Discover the editorial edit
                      </span>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal arrows */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[3] hidden -translate-y-1/2 md:block">
          <div className="flex w-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={prev}
              className="pointer-events-auto group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white/80 backdrop-blur-sm transition hover:bg-black/30 hover:text-white"
              aria-label="Previous slide"
            >
              <span className="block -translate-x-[1px] transition-transform group-hover:-translate-x-0.5">
                ‹
              </span>
            </button>
            <button
              type="button"
              onClick={next}
              className="pointer-events-auto group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white/80 backdrop-blur-sm transition hover:bg-black/30 hover:text-white"
              aria-label="Next slide"
            >
              <span className="block translate-x-[1px] transition-transform group-hover:translate-x-0.5">
                ›
              </span>
            </button>
          </div>
        </div>

        {/* Pagination + progress */}
        <div className="absolute inset-x-0 bottom-8 z-[3]">
          <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-16">
            <div className="flex items-center justify-between gap-6">
              {/* dots */}
              <div className="flex items-center gap-2.5">
                {slides.map((s, i) => {
                  const isActive = i === index;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => goTo(i)}
                      className="group relative h-6 w-6"
                      aria-label={`Go to slide ${i + 1}`}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <span
                        className={[
                          "absolute left-1/2 top-1/2 h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300",
                          isActive ? "bg-white" : "bg-white/45 group-hover:bg-white/65",
                        ].join(" ")}
                      />
                      {isActive ? (
                        <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {/* progress bar */}
              <div className="hidden sm:flex flex-1 items-center justify-end">
                <div className="w-[260px]">
                  <div className="h-px w-full bg-white/25" />
                  <motion.div
                    key={progressKey}
                    className="h-px bg-white/80"
                    initial={{ width: 0 }}
                    animate={{
                      width: "100%",
                      transition: reduce
                        ? { duration: 0 }
                        : { duration: AUTOPLAY_MS / 1000, ease: "linear" },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
