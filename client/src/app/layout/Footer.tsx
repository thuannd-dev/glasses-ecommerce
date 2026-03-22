import {
    Box,
    Button,
    Container,
    Grid,
    Link as MuiLink,
    Stack,
    Typography,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
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
            { label: "Customer Guarantees", to: "/policies" },
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
                // Giữ nền footer đồng nhất với banner để tránh lộ "strip" màu nhạt
                // khi chỉ render banner footer.
                bgcolor: "#0B0B0B",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                // Banner footer tự set padding riêng; wrapper pt/pb lớn sẽ tạo khoảng trắng
                // khi các section bên dưới đang bị ẩn.
                pt: 0,
                pb: 0,
                position: "relative",
            }}
        >
            <Container maxWidth={false} disableGutters>
                {/* ===== Banner Footer (fashion editorial) ===== */}
                <Box
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        py: { xs: 6, md: 8 },
                        borderTop: `1px solid rgba(255,255,255,0.06)`,
                        bgcolor: "#0B0B0B",
                        overflow: "hidden",
                    }}
                >
                    <Box
                        aria-hidden
                        sx={{
                            position: "absolute",
                            inset: 0,
                            background:
                                "radial-gradient(90% 70% at 50% 35%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 40%, transparent 70%), linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)",
                        }}
                    />

                    <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", px: { xs: 2, md: 4 } }}>
                        <Typography
                            sx={{
                                fontFamily: '"Playfair Display","Times New Roman",Times,serif',
                                fontSize: { xs: 28, md: 44 },
                                lineHeight: 1.05,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                color: "rgba(255,255,255,0.92)",
                                mb: 3,
                                whiteSpace: "pre-line",
                            }}
                        >
                            “LUXURY AESTHETICS. PHYSICIAN EXPERTISE.”
                        </Typography>

                        <Button
                            variant="outlined"
                            endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                            sx={{
                                borderRadius: 999,
                                border: "1px solid rgba(255,255,255,0.55)",
                                color: "rgba(255,255,255,0.92)",
                                px: { xs: 2.5, md: 4 },
                                py: 1.1,
                                fontWeight: 800,
                                textTransform: "none",
                                letterSpacing: "0.01em",
                                bgcolor: "rgba(0,0,0,0.12)",
                                "&:hover": {
                                    borderColor: COLORS.accentGold,
                                    color: "rgba(255,255,255,0.96)",
                                    bgcolor: "rgba(0,0,0,0.18)",
                                },
                            }}
                        >
                            Book Consultation
                        </Button>

                        <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 2.5 }}>
                            <MuiLink
                                href="#"
                                aria-label="Instagram"
                                sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 40,
                                    height: 40,
                                    borderRadius: "999px",
                                    border: "1px solid rgba(255,255,255,0.18)",
                                    color: "rgba(255,255,255,0.90)",
                                    transition: "all 160ms ease",
                                    "&:hover": { borderColor: COLORS.accentGold, color: COLORS.accentGold },
                                }}
                            >
                                <InstagramIcon fontSize="small" />
                            </MuiLink>

                            <MuiLink
                                href="#"
                                aria-label="Email"
                                sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 40,
                                    height: 40,
                                    borderRadius: "999px",
                                    border: "1px solid rgba(255,255,255,0.18)",
                                    color: "rgba(255,255,255,0.90)",
                                    transition: "all 160ms ease",
                                    "&:hover": { borderColor: COLORS.accentGold, color: COLORS.accentGold },
                                }}
                            >
                                <MailOutlineIcon fontSize="small" />
                            </MuiLink>

                            <MuiLink
                                href="#"
                                aria-label="Facebook"
                                sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 40,
                                    height: 40,
                                    borderRadius: "999px",
                                    border: "1px solid rgba(255,255,255,0.18)",
                                    color: "rgba(255,255,255,0.90)",
                                    transition: "all 160ms ease",
                                    "&:hover": { borderColor: COLORS.accentGold, color: COLORS.accentGold },
                                }}
                            >
                                <FacebookIcon fontSize="small" />
                            </MuiLink>

                            <MuiLink
                                href="#"
                                aria-label="TikTok"
                                sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 40,
                                    height: 40,
                                    borderRadius: "999px",
                                    border: "1px solid rgba(255,255,255,0.18)",
                                    color: "rgba(255,255,255,0.90)",
                                    transition: "all 160ms ease",
                                    "&:hover": { borderColor: COLORS.accentGold, color: COLORS.accentGold },
                                }}
                            >
                                <MusicNoteIcon fontSize="small" />
                            </MuiLink>
                        </Stack>

                        <Typography
                            sx={{
                                mt: 4.5,
                                fontSize: 11,
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                color: "rgba(255,255,255,0.52)",
                                lineHeight: 1.6,
                                px: { xs: 1, md: 0 },
                            }}
                        >
                            LINE ERASER MD, 79 W MT PLEASANT AVE, LIVINGSTON, NJ 07039, USA
                        </Typography>
                    </Box>
                </Box>

                {/* ===== TOP AREA ===== */}
                <Grid container spacing={6} sx={{ display: "none" }}>
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
                        display: "none",
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
                        display: "none",
                        position: "absolute",
                        right: { xs: 16, md: 28 },
                        bottom: { xs: 18, md: 24 },
                        cursor: "pointer",
                        userSelect: "none",
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
