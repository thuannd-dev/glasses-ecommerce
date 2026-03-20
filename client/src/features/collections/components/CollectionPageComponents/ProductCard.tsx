import { Box, Button, Card, CardActionArea, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import type { Product } from "../../../../lib/types";
import { formatMoney } from "../../../../lib/utils/format";

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

                {/* Text: brand, tên sản phẩm, giá */}
                <Box
                    sx={{
                        px: 2,
                        pt: 1.3,
                        pb: 2,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Typography
                        sx={{
                            color: "#8A8A8A",
                            fontSize: 12.5,
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            lineHeight: 1.1,
                        }}
                    >
                        {p.brand}
                    </Typography>

                    <Typography
                        className="ProductCard-name"
                        sx={{
                            color: "#171717",
                        fontSize: 13.5,
                        mt: 0.5,
                        fontWeight: 800,
                        lineHeight: 1.25,
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        }}
                    >
                        {p.name}
                    </Typography>

                    <Typography
                        sx={{
                            mt: 1.0,
                            fontWeight: 700,
                            fontSize: 16,
                            color: "#171717",
                        }}
                    >
                        {formatMoney(p.price)}
                    </Typography>

                    <Button
                        fullWidth
                        variant="outlined"
                        disableElevation
                        sx={{
                            mt: "auto",
                            height: 38,
                            borderRadius: 1,
                            borderColor: "rgba(0,0,0,0.15)",
                            color: "#171717",
                            fontWeight: 900,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            "&:hover": {
                                borderColor: "rgba(182,140,90,0.7)",
                                bgcolor: "rgba(182,140,90,0.08)",
                            },
                        }}
                    >
                        ADD TO CART
                    </Button>
                </Box>
            </CardActionArea>
        </Card>
    );
}
