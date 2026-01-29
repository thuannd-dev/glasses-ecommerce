import {
    Box,
    Container,
    Grid,
    Link as MuiLink,
    Stack,
    Typography,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";

/**
 * Footer fashion: sạch, nhiều khoảng trắng, chữ nhỏ, tối giản.
 * Dùng NavLink (react-router) cho link nội bộ.
 */

const COLS = [
    {
        title: "PRODUCTS",
        links: [
            { label: "Frames", to: "/collections/glasses" },
            { label: "Sunglasses", to: "/collections/fashion" },
            { label: "LENS", to: "/collections/lens" },
        ],
    },
    {
        title: "PURCHASE",
        links: [
            { label: "Customer Guarantees", to: "/policies/guarantee" },
            { label: "Lens Replacement", to: "/policies/lens-replacement" },
        ],
    },
    {
        title: "ABOUT",
        links: [
            { label: "Shops", to: "/shops" },
            { label: "Service", to: "/service" },
            { label: "Corporate Information", to: "/about" },
        ],
    },
    {
        title: "SUPPORT",
        links: [
            { label: "FAQs", to: "/faqs" },
            { label: "System Requirements", to: "/system-requirements" },
            { label: "Site Map", to: "/sitemap" },
        ],
    },
];

const linkSx = {
    color: "#9CA3AF",
    textDecoration: "none",
    fontSize: "0.86rem",
    lineHeight: 2,
    "&:hover": { color: "#111827" },
};

export default function Footer() {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <Box
            component="footer"
            sx={{
                bgcolor: "#fff",
                borderTop: "1px solid #E5E7EB",
                pt: { xs: 6, md: 9 },
                pb: { xs: 5, md: 7 },
                position: "relative",
            }}
        >
            <Container maxWidth="xl">
                {/* ===== TOP AREA ===== */}
                <Grid container spacing={4}>
                    {/* Left columns */}
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={{ xs: 3, md: 4 }}>
                            {COLS.map((col) => (
                                <Grid key={col.title} item xs={6} sm={3}>
                                    <Typography
                                        sx={{
                                            fontWeight: 800,
                                            letterSpacing: "0.08em",
                                            fontSize: "0.9rem",
                                            color: "#111827",
                                            mb: 2,
                                        }}
                                    >
                                        {col.title}
                                    </Typography>

                                    <Stack spacing={0.5}>
                                        {col.links.map((l) => (
                                            <MuiLink
                                                key={l.label}
                                                component={NavLink}
                                                to={l.to}
                                                sx={linkSx}
                                            >
                                                {l.label}
                                            </MuiLink>
                                        ))}
                                    </Stack>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Social icons (gần giống ảnh: nằm dưới phần cột) */}
                        <Stack direction="row" spacing={2} sx={{ mt: { xs: 4, md: 5 } }}>
                            <MuiLink
                                href="#"
                                aria-label="Facebook"
                                sx={{ color: "#111827", display: "inline-flex" }}
                            >
                                <FacebookIcon />
                            </MuiLink>
                            <MuiLink
                                href="#"
                                aria-label="Instagram"
                                sx={{ color: "#111827", display: "inline-flex" }}
                            >
                                <InstagramIcon />
                            </MuiLink>
                        </Stack>
                    </Grid>

                    {/* Right contact */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                            <Typography
                                sx={{
                                    fontWeight: 800,
                                    letterSpacing: "0.08em",
                                    fontSize: "0.9rem",
                                    color: "#111827",
                                    mb: 2,
                                }}
                            >
                                CONTACT US
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: { xs: "1.1rem", md: "1.35rem" },
                                    fontWeight: 800,
                                    color: "#111827",
                                }}
                            >
                                info@yourbrand.com
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* ===== BOTTOM AREA ===== */}
                <Box
                    sx={{
                        mt: { xs: 5, md: 6 },
                        pt: { xs: 3, md: 4 },
                        borderTop: "1px solid #F3F4F6",
                    }}
                >
                    <Typography sx={{ color: "#9CA3AF", fontSize: "0.82rem", mb: 1.2 }}>
                        COPYRIGHT (C) YOURBRAND co., ltd. ALL RIGHTS RESERVED.
                    </Typography>

                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={{ xs: 1, md: 2 }}
                        sx={{
                            alignItems: { md: "center" },
                            justifyContent: "space-between",
                        }}
                    >
                        {/* Left: policy links */}
                        <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
                            <MuiLink component={NavLink} to="/privacy" sx={linkSx}>
                                PRIVACY POLICY
                            </MuiLink>
                            <Typography sx={{ color: "#D1D5DB" }}>|</Typography>
                            <MuiLink component={NavLink} to="/payment" sx={linkSx}>
                                Payment
                            </MuiLink>
                        </Stack>

                        {/* Right: locale/language (mock) */}
                        <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
                            <Typography sx={{ color: "#9CA3AF", fontSize: "0.86rem" }}>
                                Vietnam
                            </Typography>
                            <Typography sx={{ color: "#D1D5DB" }}>|</Typography>
                            <MuiLink href="#" sx={linkSx}>
                                Vietnamese
                            </MuiLink>
                            <Typography sx={{ color: "#D1D5DB" }}>|</Typography>
                            <MuiLink href="#" sx={linkSx}>
                                English
                            </MuiLink>
                        </Stack>
                    </Stack>
                </Box>

                {/* ===== TOP BUTTON (góc phải dưới) ===== */}
                <Box
                    onClick={scrollToTop}
                    role="button"
                    tabIndex={0}
                    sx={{
                        position: "absolute",
                        right: { xs: 16, md: 28 },
                        bottom: { xs: 18, md: 24 },
                        cursor: "pointer",
                        userSelect: "none",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        color: "#6B7280",
                        "&:hover": { color: "#111827" },
                    }}
                >
                </Box>
            </Container>
        </Box>
    );
}
