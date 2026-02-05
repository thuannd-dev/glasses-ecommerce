import {
    Box,
    Card,
    CardActionArea,
    IconButton,
    Typography,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SearchIcon from "@mui/icons-material/Search";
import { NavLink } from "react-router-dom";
import type { Product } from "../../types";

function formatMoneyUSD(v: number | undefined | null) {
    if (v == null || typeof v !== "number") return "$—";
    return v.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function ProductCard({ p }: { p: Product }) {
    return (
        <Card
            sx={{
                borderRadius: 0,
                border: "1px solid rgba(17,24,39,0.10)",
                boxShadow: "none",
                bgcolor: "#fff",
            }}
        >
            <CardActionArea
                component={NavLink}
                to={`/product/${p.id}`}
                sx={{ display: "block" }}
            >
                {/* Image block */}
                <Box
                    sx={{
                        position: "relative",
                        bgcolor: "#f3f4f6",
                        aspectRatio: "4 / 3",
                        overflow: "hidden",
                    }}
                >
                    <Box
                        component="img"
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transform: "scale(1.01)",
                            transition: "transform .5s ease",
                            ".MuiCardActionArea-root:hover &": {
                                transform: "scale(1.06)",
                            },
                        }}
                    />

                    {/* Tag */}
                    {p.tag ? (
                        <Box
                            sx={{
                                position: "absolute",
                                top: 14,
                                left: 14,
                                px: 1.2,
                                py: 0.6,
                                borderRadius: 999,
                                bgcolor: "rgba(17,24,39,0.85)",
                                color: "#fff",
                                fontSize: 12,
                                fontWeight: 900,
                                letterSpacing: "0.06em",
                            }}
                        >
                            {p.tag}
                        </Box>
                    ) : null}

                    {/* Action icons (bottom-right like ecommerce) */}
                    <Box
                        sx={{
                            position: "absolute",
                            right: 12,
                            bottom: 12,
                            display: "flex",
                            gap: 1,
                        }}
                        onClick={(e) => e.preventDefault()}
                    >
                        <IconButton
                            size="small"
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: "#fff",
                                border: "1px solid rgba(17,24,39,0.12)",
                                "&:hover": { bgcolor: "#fff" },
                            }}
                        >
                            <SearchIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: "#fff",
                                border: "1px solid rgba(17,24,39,0.12)",
                                "&:hover": { bgcolor: "#fff" },
                            }}
                        >
                            <FavoriteBorderIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                {/* Swatches */}
                {p.colors?.length ? (
                    <Box sx={{ display: "flex", gap: 1, px: 2, pt: 1.5 }}>
                        {p.colors.slice(0, 4).map((c) => (
                            <Box
                                key={c}
                                sx={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: "999px",
                                    bgcolor: c,
                                    border: "1px solid rgba(17,24,39,0.18)",
                                }}
                            />
                        ))}
                    </Box>
                ) : null}

                {/* Text: brand, tên sản phẩm, giá */}
                <Box sx={{ px: 2, pt: 1.2, pb: 2 }}>
                    <Typography sx={{ fontWeight: 900, letterSpacing: "0.02em" }}>
                        {p.brand}
                    </Typography>

                    <Typography sx={{ color: "rgba(17,24,39,0.75)", fontSize: 14, mt: 0.4 }}>
                        {p.name}
                    </Typography>
                    {p.code && p.code !== p.name ? (
                        <Typography sx={{ color: "rgba(17,24,39,0.55)", fontSize: 12, mt: 0.2 }}>
                            {p.code}
                            {p.frameSize ? `  /  Size: ${p.frameSize}` : ""}
                        </Typography>
                    ) : null}

                    <Typography sx={{ mt: 1.2, fontWeight: 900, fontSize: 16 }}>
                        {formatMoneyUSD(p.price)}
                    </Typography>
                </Box>
            </CardActionArea>
        </Card>
    );
}
