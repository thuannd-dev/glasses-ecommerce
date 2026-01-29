import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";

const NAV_H = 56;

const SECTION_SX = {
    position: "relative",
    left: "50%",
    right: "50%",
    ml: "-50vw",
    mr: "-50vw",
    width: "100vw",
} as const;

const WRAP_SX = {
    // mobile: dùng svh cho đỡ nhảy
    minHeight: { xs: "calc(100svh - 56px)", md: `calc(100vh - ${NAV_H}px)` },
    display: "flex",
    alignItems: "center",
    py: { xs: 6, md: 0 },
} as const;

const CTA_SX = {
    bgcolor: "#111827",
    borderRadius: 0,
    px: 3,
    py: 1.25,
    fontWeight: 800,
    letterSpacing: "0.08em",
    boxShadow: "none",
    "&:hover": {
        bgcolor: "#0b1220",
        boxShadow: "none",
    },
} as const;

const IMG_SX = {
    width: "100%",
    height: { xs: 240, md: 360 },
    borderRadius: 2,
    objectFit: "cover",
} as const;

const SERVICES = ["Prescription Glasses", "Blue Light Protection", "Premium Lenses"] as const;

export default function ServicesSection() {
    return (
        <Box component="section" sx={SECTION_SX}>
            <Box sx={WRAP_SX}>
                <Container maxWidth="xl">
                    <Grid container spacing={{ xs: 5, md: 6 }} alignItems="center">
                        {/* LEFT */}
                        <Grid item xs={12} md={4}>
                            <Typography sx={{ fontWeight: 900, fontSize: { xs: 34, md: 44 }, lineHeight: 1.05 }}>
                                We Care About
                                <br />
                                Your Vision
                            </Typography>

                            <Typography sx={{ color: "rgba(0,0,0,0.65)", mt: 2, mb: 3 }}>
                                Professional eyewear services focused on comfort, accuracy and modern lifestyle.
                            </Typography>

                            <Button component={NavLink} to="/collections/glasses" variant="contained" sx={CTA_SX}>
                                BOOK EYE TEST
                            </Button>
                        </Grid>

                        {/* MIDDLE */}
                        <Grid item xs={12} md={4}>
                            <Typography sx={{ fontWeight: 800, mb: 2, letterSpacing: "0.06em" }}>
                                Our Services
                            </Typography>

                            <Box
                                component="ul"
                                sx={{
                                    m: 0,
                                    pl: 2,
                                    color: "rgba(0,0,0,0.75)",
                                    "& li": { mb: 1 },
                                }}
                            >
                                {SERVICES.map((s) => (
                                    <li key={s}>
                                        <Typography sx={{ fontWeight: 600 }}>{s}</Typography>
                                    </li>
                                ))}
                            </Box>
                        </Grid>

                        {/* RIGHT */}
                        <Grid item xs={12} md={4}>
                            <Box
                                component="img"
                                src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80"
                                alt="Eyewear service"
                                loading="lazy"
                                decoding="async"
                                sx={IMG_SX}
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}
