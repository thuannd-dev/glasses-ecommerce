import { Box, Container, Grid, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";

/* Navbar height (trừ khi full viewport) */
const NAV_H = 56;

const CATEGORIES = [
    {
        title: "SUNGLASSES",
        to: "/collections/fashion",
        image:
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1400&q=80",
    },
    {
        title: "EYEGLASSES",
        to: "/collections/glasses",
        image:
            "https://images.unsplash.com/photo-1646083774155-2a40b675641d?auto=format&fit=crop&w=1400&q=80",
    },
    {
        title: "LENS",
        to: "/collections/lens",
        image:
            "https://images.unsplash.com/photo-1744939823654-23b357f842e0?auto=format&fit=crop&w=1400&q=80",
    },
] as const;

const SECTION_SX = {
    position: "relative",
    left: "50%",
    right: "50%",
    ml: "-50vw",
    mr: "-50vw",
    width: "100vw",
    // mobile: 100vh đôi khi gây “nhảy” do address bar
    minHeight: { xs: "calc(100svh - 56px)", md: `calc(100vh - ${NAV_H}px)` },
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
} as const;

const CARD_SX = {
    display: "block",
    height: { xs: 200, md: 260 },
    borderRadius: 3,
    overflow: "hidden",
    position: "relative",
    textDecoration: "none",
    boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
    transition: "transform .4s ease, box-shadow .4s ease",
    outline: "none",

    "&:hover": {
        transform: "translateY(-8px)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.18)",
    },

    // keyboard accessibility
    "&:focus-visible": {
        boxShadow: "0 0 0 3px rgba(17,24,39,0.25), 0 20px 60px rgba(0,0,0,0.12)",
    },

    // overlay: giảm DOM
    "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        bgcolor: "rgba(255,255,255,0.55)",
        transition: "background-color .35s ease",
    },

    "&:hover::after": {
        bgcolor: "rgba(255,255,255,0.42)",
    },

    // hover ảnh đúng cách
    "& img": {
        transform: "scale(1.02)",
        transition: "transform .6s ease",
    },

    "&:hover img": {
        transform: "scale(1.08)",
    },
} as const;

export default function CategoryCards() {
    return (
        <Box component="section" sx={SECTION_SX}>
            <Container maxWidth="xl">
                {/* TITLE */}
                <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
                    <Typography
                        sx={{
                            fontSize: "0.75rem",
                            letterSpacing: "0.35em",
                            fontWeight: 600,
                            color: "#6B7280",
                            textTransform: "uppercase",
                            mb: 2,
                        }}
                    >
                        Shop by Category
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: { xs: "1.6rem", md: "2.1rem" },
                            fontWeight: 800,
                            color: "#111827",
                        }}
                    >
                        Find Your Perfect Eyewear
                    </Typography>
                </Box>

                {/* CARDS */}
                <Grid container spacing={4}>
                    {CATEGORIES.map((c) => (
                        <Grid key={c.title} item xs={12} md={4}>
                            <Box
                                component={NavLink}
                                to={c.to}
                                sx={CARD_SX}
                                aria-label={`Go to ${c.title}`}
                            >
                                <Box
                                    component="img"
                                    src={c.image}
                                    alt={c.title}
                                    loading="lazy"
                                    decoding="async"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />

                                <Typography
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 900,
                                        letterSpacing: "0.18em",
                                        textTransform: "uppercase",
                                        color: "#111827",
                                        fontSize: "1rem",
                                        zIndex: 1, // trên overlay ::after
                                        pointerEvents: "none",
                                    }}
                                >
                                    {c.title}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
