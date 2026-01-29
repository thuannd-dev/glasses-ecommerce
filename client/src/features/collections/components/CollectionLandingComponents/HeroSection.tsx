import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

const NAV_H = 56;
const CHIN_OFFSET = 20;

// NOTE: sau này gắn API thì thay IMAGES bằng props/data từ store
const IMAGES = [
    "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1920&q=80",
] as const;

const ROOT_SX = {
    position: "relative",
    left: "50%",
    right: "50%",
    ml: "-50vw",
    mr: "-50vw",
    width: "100vw",
    overflow: "hidden",
} as const;

const CTA_SX = {
    bgcolor: "#fff",
    color: "#000",
    px: 4.5,
    py: 1.4,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    borderRadius: "999px",
    border: "2px solid #000",
    boxShadow: "none",
    transition: "all .35s ease",
    "& .MuiButton-endIcon": {
        ml: 1,
        transition: "transform .3s ease",
    },
    "&:hover": {
        bgcolor: "#000",
        color: "#fff",
        boxShadow: "none",
        "& .MuiButton-endIcon": {
            transform: "translateX(6px)",
        },
    },
} as const;

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
        if (!mq) return;

        const onChange = () => setReduced(mq.matches);
        onChange();

        // Safari cũ dùng addListener/removeListener
        if (mq.addEventListener) mq.addEventListener("change", onChange);
        else mq.addListener(onChange);

        return () => {
            if (mq.removeEventListener) mq.removeEventListener("change", onChange);
            else mq.removeListener(onChange);
        };
    }, []);

    return reduced;
}

export default function HeroSection() {
    const total = IMAGES.length;
    const [index, setIndex] = useState(0);

    const prefersReducedMotion = usePrefersReducedMotion();

    // UX: user click dot xong mà interval nhảy liền -> khó chịu
    const pauseUntilRef = useRef<number>(0);
    const hoveredRef = useRef(false);

    const goTo = useCallback(
        (i: number) => {
            pauseUntilRef.current = Date.now() + 4000; // pause 4s sau tương tác
            const next = ((i % total) + total) % total;
            setIndex(next);
        },
        [total]
    );

    useEffect(() => {
        if (prefersReducedMotion) return;

        const id = window.setInterval(() => {
            const now = Date.now();
            if (hoveredRef.current) return;
            if (now < pauseUntilRef.current) return;

            setIndex((prev) => (prev + 1) % total);
        }, 4500);

        return () => window.clearInterval(id);
    }, [prefersReducedMotion, total]);

    const slides = useMemo(
        () =>
            IMAGES.map((src, i) => (
                <Box
                    key={src}
                    component="img"
                    src={src}
                    alt={`slide-${i + 1}`}
                    sx={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: i === index ? 1 : 0,
                        transition: prefersReducedMotion ? "none" : "opacity 0.9s ease",
                    }}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                />
            )),
        [index, prefersReducedMotion]
    );

    return (
        <Box sx={ROOT_SX}>
            <Grid container sx={{ height: `calc(100vh - ${NAV_H}px)` }}>
                {/* LEFT */}
                <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                        position: "relative",
                        px: { xs: 3, md: 8 },
                    }}
                >
                    {/* anchor + đẩy lên ngang cằm */}
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: `translate(-50%, calc(-50% - ${CHIN_OFFSET}px))`,
                            width: "100%",
                            maxWidth: 560,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 12,
                                fontWeight: 800,
                                letterSpacing: 1.3,
                                color: "rgba(17,24,39,0.55)",
                                mb: 1,
                            }}
                        >
                            ESSENCE EYEWEAR
                        </Typography>

                        <Typography
                            sx={{
                                fontWeight: 950,
                                fontSize: { xs: 38, md: 56 },
                                lineHeight: 1.02,
                                color: "#111827",
                                mb: 2,
                            }}
                        >
                            New Products
                        </Typography>

                        <Typography
                            sx={{
                                color: "rgba(17,24,39,0.65)",
                                fontWeight: 600,
                                mb: 3.5,
                                maxWidth: 520,
                            }}
                        >
                            Minimal frames. Premium lenses. Designed for modern identity.
                        </Typography>

                        <Button
                            component={NavLink}
                            to="/collections/glasses"
                            endIcon={<ArrowForwardIcon />}
                            sx={CTA_SX}
                        >
                            View Shop
                        </Button>
                    </Box>
                </Grid>

                {/* RIGHT – CAROUSEL */}
                <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{ position: "relative" }}
                    onMouseEnter={() => {
                        hoveredRef.current = true;
                    }}
                    onMouseLeave={() => {
                        hoveredRef.current = false;
                    }}
                >
                    {/* Slides */}
                    {slides}

                    {/* DOTS */}
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: 32,
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            gap: 1.5,
                        }}
                    >
                        {IMAGES.map((_, i) => (
                            <Box
                                key={i}
                                component="button"
                                type="button"
                                onClick={() => goTo(i)}
                                aria-label={`Go to slide ${i + 1}`}
                                aria-current={i === index ? "true" : undefined}
                                style={{
                                    border: "none",
                                    padding: 0,
                                    background: "transparent",
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: "50%",
                                        cursor: "pointer",
                                        bgcolor:
                                            i === index
                                                ? "rgba(255,255,255,0.95)"
                                                : "rgba(255,255,255,0.45)",
                                        transition: prefersReducedMotion ? "none" : "all .25s ease",
                                    }}
                                />
                            </Box>
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
