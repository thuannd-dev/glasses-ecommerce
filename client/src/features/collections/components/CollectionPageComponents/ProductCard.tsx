import { Box, Card, CardActionArea, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import type { Product } from "../../../../lib/types";
import { formatMoney } from "../../../../lib/utils/format";
import { COLLECTION_PRODUCT_FONT } from "../../collectionFonts";

export function ProductCard({ p }: { p: Product }) {
    return (
        <Card
            sx={{
                borderRadius: 2,
                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow: "0 0 0 rgba(0,0,0,0)",
                bgcolor: "#FFFFFF",
                overflow: "hidden",
                transition: "all 180ms ease",
                "&:hover": {
                    borderColor: "rgba(182,140,90,0.55)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                },
            }}
        >
            <CardActionArea
                component={NavLink}
                to={`/product/${p.id}`}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                }}
            >
                {/* Image block */}
                <Box
                    sx={{
                        position: "relative",
                        bgcolor: "#F6F4F2",
                        px: 2.5,
                        pt: 2.5,
                        pb: 2,
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
                            objectFit: "contain",
                            transform: "scale(1.01)",
                            transition: "transform .4s ease",
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
                                bgcolor: "rgba(17,24,39,0.9)",
                                color: "#FFFFFF",
                                fontSize: 12,
                                fontWeight: 900,
                                letterSpacing: "0.06em",
                            }}
                        >
                            {p.tag}
                        </Box>
                    ) : null}
                </Box>

                {/* Text: brand, name, price, description — even vertical rhythm */}
                <Box
                    sx={{
                        px: 2,
                        pt: 2,
                        pb: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.25,
                        fontFamily: COLLECTION_PRODUCT_FONT,
                    }}
                >
                    <Typography
                        component="span"
                        sx={{
                            color: "#6B7280",
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            lineHeight: 1.2,
                        }}
                    >
                        {p.brand}
                    </Typography>

                    <Typography
                        className="ProductCard-name"
                        sx={{
                            color: "#111827",
                            fontSize: 14,
                            fontWeight: 700,
                            lineHeight: 1.35,
                            letterSpacing: "-0.01em",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {p.name}
                    </Typography>

                    <Typography
                        component="span"
                        sx={{
                            fontWeight: 700,
                            fontSize: 15,
                            lineHeight: 1.3,
                            color: "#111827",
                        }}
                    >
                        {formatMoney(p.price)}
                    </Typography>

                    {p.description ? (
                        <Typography
                            component="p"
                            sx={{
                                m: 0,
                                fontSize: 12,
                                lineHeight: 1.4,
                                fontWeight: 400,
                                color: "rgba(17,24,39,0.62)",
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {p.description}
                        </Typography>
                    ) : null}
                </Box>
            </CardActionArea>
        </Card>
    );
}
