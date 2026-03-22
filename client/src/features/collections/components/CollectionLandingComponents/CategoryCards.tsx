import { Box, Button, Typography } from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";

import { COLLECTION_PRODUCT_FONT } from "../../collectionFonts";

type Category = {
    title: string;
    to: string;
    image: string;
};

const CATEGORIES: Category[] = [
    {
        title: "SUNGLASSES",
        to: "/collections/sunglasses",
        image:
            "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1774191682/photo-1760446032400-506ec8963e6a_zacy9w.jpg",
    },
    {
        title: "EYEGLASSES",
        to: "/collections/eyeglasses",
        image:
            "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1774191679/photo-1760446031723-e03702a3386d_dignyg.jpg",
    },
    {
        title: "ALL MY SHOP PRODUCT",
        to: "/collections/all",
        image:
            "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1773944645/istockphoto-2183222014-2048x2048_okqo6z.jpg",
    },
];

const SECTION_SX = {
    position: "relative",
    left: "50%",
    right: "50%",
    ml: "-50vw",
    mr: "-50vw",
    width: "100vw",
    // Seamless continuation from HeroSection (dark) to page background (light)
    mt: { xs: "-1px", md: "-2px" },
    pt: 0,
    pb: 0,
    background:
        "linear-gradient(180deg, rgba(10,10,10,1) 0%, rgba(10,10,10,0.92) 14%, rgba(255,255,255,0.00) 56%)",
    overflow: "hidden",
} as const;

const CARD_SX = {
    display: "block",
    borderRadius: 0,
    overflow: "hidden",
    position: "relative",
    textDecoration: "none",
    boxShadow: "none",
    border: 0,
    outline: "none",
    isolation: "isolate",

    // keyboard accessibility
    "&:focus-visible": {
        boxShadow: "0 0 0 2px rgba(255,255,255,0.35)",
    },
} as const;

export default function CategoryCards() {
    const navigate = useNavigate();
    const reduce = useReducedMotion();
    const easeEditorial = [0.22, 1, 0.36, 1] as const;
    const SMALL_H_MD = 380;

    const cardsWrap = {
        hidden: {},
        show: {
            transition: { staggerChildren: 0.14, delayChildren: 0.12 },
        },
    } as const;

    const cardV = {
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: easeEditorial } },
    } as const;

    const imgRevealV = {
        hidden: {
            clipPath: "inset(0 0 100% 0)",
            transform: "scale(1.06)",
        },
        show: {
            clipPath: "inset(0 0 0% 0)",
            transform: "scale(1)",
            transition: { duration: 0.9, ease: easeEditorial },
        },
    } as const;

    const labelV = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.55, ease: easeEditorial, delay: 0.18 } },
    } as const;

    const hoverCardV = {
        rest: {
            y: 0,
            boxShadow: "none",
            transition: { duration: 0.45, ease: easeEditorial },
        },
        hover: {
            y: 0,
            boxShadow: "none",
            transition: { duration: 0.45, ease: easeEditorial },
        },
    } as const;

    const hoverImgV = {
        rest: { scale: 1, transition: { duration: 0.6, ease: easeEditorial } },
        hover: { scale: 1.06, transition: { duration: 0.6, ease: easeEditorial } },
    } as const;

    const hoverOverlayV = {
        rest: { opacity: 0.16, transition: { duration: 0.45, ease: easeEditorial } },
        hover: { opacity: 0.24, transition: { duration: 0.45, ease: easeEditorial } },
    } as const;

    const hoverLabelV = {
        rest: { opacity: 0.92 },
        hover: { opacity: 1, transition: { duration: 0.25, ease: easeEditorial } },
    } as const;

    // Big featured card: keep CTA static (no hover animation)
    const hoverLabelBigV = {
        rest: { opacity: 1 },
        hover: { opacity: 1 },
    } as const;

    const hoverDiscoverV = {
        rest: { opacity: 0, y: 8 },
        hover: { opacity: 1, y: 0, transition: { duration: 0.28, ease: easeEditorial, delay: 0.06 } },
    } as const;

    const leftCards = [CATEGORIES[1], CATEGORIES[0]]; // Eyeglasses (top), Sunglasses (bottom)
    const bigCard = CATEGORIES[2]; // All products

    return (
        <Box component="section" sx={SECTION_SX}>
            <Box
                sx={{
                    width: "100%",
                    // full-bleed panels (no container-like gutters)
                    px: 0,
                    mx: "auto",
                }}
            >
                <Box
                    component={motion.div}
                    variants={cardsWrap}
                    initial={reduce ? false : "hidden"}
                    whileInView="show"
                    viewport={{ once: true, amount: 0.35 }}
                    sx={{
                        display: "grid",
                        gap: 0,
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, minmax(0, 1fr))",
                            md: "minmax(0, 1fr) minmax(0, 2fr)",
                        },
                        alignItems: "start",
                    }}
                >
                    {/* Big card (editorial feature) */}
                    <Box
                        component={motion.div}
                        variants={cardV}
                        sx={{
                            gridColumn: { xs: "1 / -1", sm: "1 / -1", md: 2 },
                            gridRow: { md: "1 / span 2" },
                            height: {
                                xs: 440,
                                sm: 520,
                                md: `calc(${SMALL_H_MD}px * 2)`,
                            },
                        }}
                    >
                        <Box
                            component={motion.div}
                            initial={false}
                            animate="rest"
                            whileHover={reduce ? undefined : "hover"}
                            variants={hoverCardV}
                            sx={{ borderRadius: 0, height: "100%" }}
                        >
                            <Box
                                component="div"
                                role="link"
                                tabIndex={0}
                                sx={{ ...CARD_SX, height: "100%" }}
                                aria-label={`Go to ${bigCard.title}`}
                                onClick={() => navigate(bigCard.to)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") navigate(bigCard.to);
                                }}
                            >
                                {/* Image wrapper (overflow hidden) */}
                                <Box sx={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                                    <Box
                                        component={motion.div}
                                        variants={hoverImgV}
                                        sx={{ position: "absolute", inset: 0, willChange: "transform" }}
                                    >
                                        <Box
                                            component={motion.img}
                                            variants={imgRevealV}
                                            src={bigCard.image}
                                            alt={bigCard.title}
                                            loading="lazy"
                                            decoding="async"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                objectPosition: "center 35%",
                                            }}
                                        />
                                    </Box>
                                </Box>

                                {/* Editorial overlay (stronger for featured card) */}
                                <Box
                                    component={motion.div}
                                    variants={hoverOverlayV}
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        bgcolor: "#000",
                                        opacity: 0.18,
                                        mixBlendMode: "multiply",
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        background:
                                            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.28) 46%, rgba(0,0,0,0.55) 100%)",
                                        zIndex: 0,
                                    }}
                                />

                                <Box
                                    component={motion.div}
                                    variants={hoverLabelBigV}
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        zIndex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        px: { xs: 3, md: 6 },
                                        pointerEvents: "none",
                                    }}
                                >
                                    <Box sx={{ maxWidth: 420 }}>
                                        <Typography
                                            component={motion.p}
                                            variants={labelV}
                                            sx={{
                                                fontWeight: 800,
                                                letterSpacing: "0.26em",
                                                textTransform: "uppercase",
                                                color: "rgba(255,255,255,0.78)",
                                                fontSize: 11,
                                                mb: 1.25,
                                            }}
                                        >
                                            Category
                                        </Typography>

                                        <Typography
                                            component={motion.h3}
                                            variants={labelV}
                                            sx={{
                                                fontWeight: 500,
                                                letterSpacing: "-0.02em",
                                                color: "rgba(255,255,255,0.94)",
                                                fontSize: { xs: 28, sm: 34, md: 42 },
                                                lineHeight: 1.04,
                                                mb: 1.5,
                                                textShadow: "0 2px 10px rgba(0,0,0,0.35)",
                                                fontFamily: COLLECTION_PRODUCT_FONT,
                                            }}
                                        >
                                            {bigCard.title}
                                        </Typography>

                                        <Typography
                                            component={motion.p}
                                            variants={labelV}
                                            sx={{
                                                color: "rgba(255,255,255,0.72)",
                                                fontSize: { xs: 13, sm: 14 },
                                                lineHeight: 1.7,
                                                maxWidth: 380,
                                                mb: 3,
                                            }}
                                        >
                                            Explore all collections in one curated edit — clean, premium, and made to fit
                                            your look.
                                        </Typography>

                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                                            <Button
                                                component={NavLink}
                                                to="/collections/all"
                                                variant="outlined"
                                                size="small"
                                                sx={{
                                                    pointerEvents: "auto",
                                                    borderRadius: 0,
                                                    px: 3,
                                                    py: 1.25,
                                                    borderColor: "rgba(255,255,255,0.42)",
                                                    color: "rgba(255,255,255,0.92)",
                                                    letterSpacing: "0.22em",
                                                    fontWeight: 800,
                                                    textTransform: "uppercase",
                                                    fontSize: 11,
                                                    bgcolor: "rgba(255,255,255,0.04)",
                                                    transition:
                                                        "transform .35s cubic-bezier(.22,1,.36,1), background-color .35s cubic-bezier(.22,1,.36,1), border-color .35s cubic-bezier(.22,1,.36,1)",
                                                    "&:hover": {
                                                        bgcolor: "rgba(255,255,255,0.08)",
                                                        borderColor: "rgba(255,255,255,0.60)",
                                                        transform: "translateY(-1px)",
                                                    },
                                                }}
                                            >
                                                Shop now
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* Left column (two stacked small cards) */}
                    <Box
                        sx={{
                            gridColumn: { xs: "1 / -1", sm: "1 / -1", md: 1 },
                            display: "grid",
                            gap: 0,
                            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "1fr" },
                            alignItems: "start",
                        }}
                    >
                        {leftCards.map((c) => (
                            <Box
                                key={c.title}
                                component={motion.div}
                                variants={cardV}
                                sx={{
                                    height: { xs: 300, sm: 320, md: SMALL_H_MD },
                                }}
                            >
                                <Box
                                    component={motion.div}
                                    initial={false}
                                    animate="rest"
                                    whileHover={reduce ? undefined : "hover"}
                                    variants={hoverCardV}
                                    sx={{ borderRadius: 0, height: "100%" }}
                                >
                                    <Box
                                        component="div"
                                        role="link"
                                        tabIndex={0}
                                        sx={{ ...CARD_SX, height: "100%" }}
                                        aria-label={`Go to ${c.title}`}
                                        onClick={() => navigate(c.to)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") navigate(c.to);
                                        }}
                                    >
                                        <Box sx={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                                            <Box
                                                component={motion.div}
                                                variants={hoverImgV}
                                                sx={{ position: "absolute", inset: 0, willChange: "transform" }}
                                            >
                                                <Box
                                                    component={motion.img}
                                                    variants={imgRevealV}
                                                    src={c.image}
                                                    alt={c.title}
                                                    loading="lazy"
                                                    decoding="async"
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        objectPosition: "center 35%",
                                                    }}
                                                />
                                            </Box>
                                        </Box>

                                        <Box
                                            component={motion.div}
                                            variants={hoverOverlayV}
                                            sx={{
                                                position: "absolute",
                                                inset: 0,
                                                bgcolor: "#000",
                                                mixBlendMode: "multiply",
                                            }}
                                        />

                                        <Box
                                            sx={{
                                                position: "absolute",
                                                inset: 0,
                                                background:
                                                    "linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.50) 100%)",
                                                zIndex: 0,
                                            }}
                                        />

                                        <Box
                                            component={motion.div}
                                            variants={hoverLabelV}
                                            sx={{
                                                position: "absolute",
                                                inset: 0,
                                                zIndex: 1,
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                textAlign: "center",
                                                px: 2,
                                                pointerEvents: "none",
                                            }}
                                        >
                                            <Typography
                                                component={motion.div}
                                                variants={labelV}
                                                sx={{
                                                    fontFamily: COLLECTION_PRODUCT_FONT,
                                                    fontWeight: 700,
                                                    letterSpacing: "0.2em",
                                                    textTransform: "uppercase",
                                                    color: "rgba(255,255,255,0.92)",
                                                    fontSize: { xs: 13, sm: 14 },
                                                    textShadow: "0 2px 10px rgba(0,0,0,0.35)",
                                                }}
                                            >
                                                {c.title}
                                            </Typography>

                                            <Box
                                                component={motion.div}
                                                variants={hoverDiscoverV}
                                                sx={{ mt: 1.25, pointerEvents: "auto" }}
                                            >
                                                <Button
                                                    component={NavLink}
                                                    to={c.to}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        borderRadius: 0,
                                                        px: 2.4,
                                                        py: 1,
                                                        borderColor: "rgba(255,255,255,0.42)",
                                                        color: "rgba(255,255,255,0.92)",
                                                        letterSpacing: "0.22em",
                                                        fontWeight: 800,
                                                        textTransform: "uppercase",
                                                        fontSize: 11,
                                                        bgcolor: "rgba(255,255,255,0.04)",
                                                        transition:
                                                            "transform .35s cubic-bezier(.22,1,.36,1), background-color .35s cubic-bezier(.22,1,.36,1), border-color .35s cubic-bezier(.22,1,.36,1)",
                                                        "&:hover": {
                                                            bgcolor: "rgba(255,255,255,0.08)",
                                                            borderColor: "rgba(255,255,255,0.60)",
                                                            transform: "translateY(-1px)",
                                                        },
                                                    }}
                                                >
                                                    Shop now
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
