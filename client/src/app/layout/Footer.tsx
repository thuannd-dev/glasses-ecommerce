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
import { COLORS } from "../theme/colors";

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

const ACCENT = COLORS.accentGold;

const linkSx = {
    color: COLORS.textSecondary,
    textDecoration: "none",
    fontSize: "0.86rem",
    lineHeight: 2,
    transition: "color 160ms ease, border-color 160ms ease",
    borderBottom: "1px solid transparent",
    "&:hover": {
        color: COLORS.textPrimary,
        borderBottomColor: COLORS.borderSoft,
    },
};

export default function Footer() {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <Box
            component="footer"
            sx={{
                bgcolor: COLORS.bgSubtle,
                borderTop: `1px solid ${COLORS.borderSoft}`,
                pt: { xs: 6, md: 8 },
                pb: { xs: 5, md: 7 },
                position: "relative",
            }}
        >
            <Container maxWidth="xl">
                {/* ===== TOP AREA ===== */}
                <Grid container spacing={6}>
                    {/* Left: brand + tagline + socials */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: 18,
                                        fontWeight: 800,
                                        letterSpacing: "0.24em",
                                        textTransform: "uppercase",
                                        color: COLORS.textPrimary,
                                    }}
                                >
                                    EYEWEAR
                                </Typography>
                                <Typography
                                    sx={{
                                        mt: 1,
                                        fontSize: 13,
                                        color: COLORS.textSecondary,
                                        maxWidth: 260,
                                    }}
                                >
                                    Curated frames and lenses for everyday luxury vision.
                                </Typography>
                            </Box>

                            {/* Social icons */}
                            <Stack direction="row" spacing={1.5}>
                                <MuiLink
                                    href="#"
                                    aria-label="Facebook"
                                    sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 38,
                                        height: 38,
                                        borderRadius: "999px",
                                        border: `1px solid ${COLORS.borderSoft}`,
                                        color: COLORS.textPrimary,
                                        transition: "all 160ms ease",
                                        bgcolor: COLORS.bgSurface,
                                        "&:hover": {
                                            borderColor: ACCENT,
                                            bgcolor: COLORS.bgSurface,
                                            color: ACCENT,
                                        },
                                    }}
                                >
                                    <FacebookIcon fontSize="small" />
                                </MuiLink>
                                <MuiLink
                                    href="#"
                                    aria-label="Instagram"
                                    sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 38,
                                        height: 38,
                                        borderRadius: "999px",
                                        border: `1px solid ${COLORS.borderSoft}`,
                                        color: COLORS.textPrimary,
                                        transition: "all 160ms ease",
                                        bgcolor: COLORS.bgSurface,
                                        "&:hover": {
                                            borderColor: ACCENT,
                                            bgcolor: "#FFFFFF",
                                            color: ACCENT,
                                        },
                                    }}
                                >
                                    <InstagramIcon fontSize="small" />
                                </MuiLink>
                            </Stack>
                        </Box>
                    </Grid>

                    {/* Right: link columns + contact */}
                    <Grid item xs={12} md={8}>
                        <Grid
                            container
                            spacing={{ xs: 3, md: 4 }}
                            sx={{ justifyContent: { md: "flex-end" } }}
                        >
                            {COLS.map((col) => (
                                <Grid key={col.title} item xs={6} sm={3}>
                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            letterSpacing: "0.14em",
                                            fontSize: "0.8rem",
                                            color: "#171717",
                                            mb: 1.75,
                                            textTransform: "uppercase",
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

                            {/* Contact block */}
                            <Grid item xs={12} sm={4}>
                                <Box sx={{ mt: { xs: 2, sm: 0 } }}>
                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            letterSpacing: "0.14em",
                                            fontSize: "0.8rem",
                                            color: "#171717",
                                            mb: 1.75,
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        Contact
                                    </Typography>
                                    <MuiLink
                                        href="mailto:info@yourbrand.com"
                                        sx={{
                                            fontSize: { xs: "1rem", md: "1.1rem" },
                                            fontWeight: 600,
                                            color: "#171717",
                                            textDecoration: "none",
                                            borderBottom: "1px solid transparent",
                                            transition: "color 160ms ease, border-color 160ms ease",
                                            "&:hover": {
                                                color: ACCENT,
                                                borderBottomColor: ACCENT,
                                            },
                                        }}
                                    >
                                        info@yourbrand.com
                                    </MuiLink>
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                {/* ===== BOTTOM AREA ===== */}
                <Box
                    sx={{
                        mt: { xs: 5, md: 6 },
                        pt: { xs: 3, md: 4 },
                        borderTop: "1px solid rgba(0,0,0,0.06)",
                    }}
                >
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={{ xs: 2, md: 2 }}
                        sx={{
                            alignItems: { xs: "flex-start", md: "center" },
                            justifyContent: "space-between",
                        }}
                    >
                        {/* Left: copyright */}
                                <Typography sx={{ color: COLORS.textMuted, fontSize: "0.82rem" }}>
                            COPYRIGHT (C) YOURBRAND co., ltd. ALL RIGHTS RESERVED.
                        </Typography>

                        {/* Middle: policy links */}
                        <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{ flexWrap: "wrap", alignItems: "center" }}
                        >
                            <MuiLink component={NavLink} to="/privacy" sx={linkSx}>
                                Privacy Policy
                            </MuiLink>
                            <Typography sx={{ color: "#D1D5DB", fontSize: "0.82rem" }}>
                                |
                            </Typography>
                            <MuiLink component={NavLink} to="/payment" sx={linkSx}>
                                Payment
                            </MuiLink>
                        </Stack>

                        {/* Right: locale/language */}
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ flexWrap: "wrap", alignItems: "center" }}
                        >
                            <Typography sx={{ color: COLORS.textMuted, fontSize: "0.82rem" }}>
                                Vietnam
                            </Typography>
                            <Typography sx={{ color: "#D1D5DB", fontSize: "0.82rem" }}>
                                |
                            </Typography>
                            <Stack direction="row" spacing={0.75}>
                                <MuiLink
                                    href="#"
                                    sx={{
                                        fontSize: "0.82rem",
                                        color: "#6B6B6B",
                                        textDecoration: "none",
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: 999,
                                        border: "1px solid transparent",
                                        "&:hover": {
                                            borderColor: "rgba(0,0,0,0.12)",
                                            color: "#171717",
                                        },
                                    }}
                                >
                                    Vietnamese
                                </MuiLink>
                                <MuiLink
                                    href="#"
                                    sx={{
                                        fontSize: "0.82rem",
                                        color: "#6B6B6B",
                                        textDecoration: "none",
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: 999,
                                        border: "1px solid transparent",
                                        "&:hover": {
                                            borderColor: "rgba(0,0,0,0.12)",
                                            color: "#171717",
                                        },
                                    }}
                                >
                                    English
                                </MuiLink>
                            </Stack>
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
