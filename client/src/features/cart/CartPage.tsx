import { Observer } from "mobx-react-lite";
import {
    Box,
    Typography,
    Divider,
    Button,
    Grid,
    Paper,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { NavLink } from "react-router-dom";

import { cartStore } from "../../lib/stores/cartStore";

function money(v: number) {
    return v.toLocaleString("vi-VN") + "₫";
}

export default function CartPage() {
    return (
        <Observer>
            {() => {
                const isEmpty = cartStore.items.length === 0;

                return (
                    <Box
                        sx={{
                            maxWidth: 1200,
                            mx: "auto",
                            mt: 10,
                            px: { xs: 2, md: 3 },
                            pb: 8,
                        }}
                    >
                        {/* ===== PAGE TITLE ===== */}
                        <Typography fontWeight={900} fontSize={26} mb={3}>
                            Shopping Cart
                        </Typography>

                        {/* ===== EMPTY STATE ===== */}
                        {isEmpty ? (
                            <Paper
                                elevation={0}
                                sx={{
                                    border: "1px dashed rgba(17,24,39,0.2)",
                                    borderRadius: 3,
                                    py: 8,
                                    textAlign: "center",
                                }}
                            >
                                <ShoppingCartOutlinedIcon
                                    sx={{
                                        fontSize: 56,
                                        color: "rgba(17,24,39,0.4)",
                                    }}
                                />

                                <Typography
                                    fontWeight={900}
                                    fontSize={20}
                                    mt={2}
                                >
                                    Your cart is empty
                                </Typography>

                                <Typography
                                    color="rgba(17,24,39,0.65)"
                                    fontSize={14}
                                    mt={1}
                                >
                                    Looks like you haven’t added anything yet.
                                </Typography>

                                <Button
                                    component={NavLink}
                                    to="/collections"
                                    variant="contained"
                                    sx={{
                                        mt: 3,
                                        bgcolor: "#111827",
                                        fontWeight: 900,
                                        px: 4,
                                        "&:hover": { bgcolor: "#0b1220" },
                                    }}
                                >
                                    Continue shopping
                                </Button>
                            </Paper>
                        ) : (
                            /* ===== CART CONTENT ===== */
                            <Grid container spacing={4}>
                                {/* ===== LEFT: CART ITEMS ===== */}
                                <Grid item xs={12} md={8}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            border: "1px solid rgba(17,24,39,0.1)",
                                            borderRadius: 3,
                                            p: 3,
                                        }}
                                    >
                                        {cartStore.items.map((item) => (
                                            <Box
                                                key={item.productId}
                                                sx={{
                                                    display: "flex",
                                                    gap: 2,
                                                    alignItems: "center",
                                                    py: 2,
                                                }}
                                            >
                                                <Box
                                                    component="img"
                                                    src={item.image}
                                                    sx={{
                                                        width: 120,
                                                        height: 90,
                                                        objectFit: "cover",
                                                        bgcolor: "#f3f4f6",
                                                        borderRadius: 2,
                                                    }}
                                                />

                                                <Box sx={{ flex: 1 }}>
                                                    <Typography
                                                        fontWeight={800}
                                                    >
                                                        {item.name}
                                                    </Typography>

                                                    <Typography
                                                        fontSize={13.5}
                                                        color="rgba(17,24,39,0.65)"
                                                        mt={0.5}
                                                    >
                                                        Quantity:{" "}
                                                        <b>{item.quantity}</b>
                                                    </Typography>

                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight={700}
                                                        mt={0.5}
                                                    >
                                                        {money(item.price)}
                                                    </Typography>
                                                </Box>

                                                <Button
                                                    color="error"
                                                    onClick={() =>
                                                        cartStore.removeItem(
                                                            item.productId
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </Button>
                                            </Box>
                                        ))}
                                    </Paper>
                                </Grid>

                                {/* ===== RIGHT: SUMMARY ===== */}
                                <Grid item xs={12} md={4}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            border: "1px solid rgba(17,24,39,0.1)",
                                            borderRadius: 3,
                                            p: 3,
                                        }}
                                    >
                                        <Typography
                                            fontWeight={900}
                                            fontSize={18}
                                        >
                                            Order Summary
                                        </Typography>

                                        <Divider sx={{ my: 2 }} />

                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",
                                                mb: 1,
                                            }}
                                        >
                                            <Typography fontSize={14}>
                                                Items
                                            </Typography>
                                            <Typography fontWeight={700}>
                                                {cartStore.totalQuantity}
                                            </Typography>
                                        </Box>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",
                                                mb: 2,
                                            }}
                                        >
                                            <Typography fontSize={14}>
                                                Subtotal
                                            </Typography>
                                            <Typography fontWeight={700}>
                                                {money(
                                                    cartStore.totalPrice
                                                )}
                                            </Typography>
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography
                                            fontWeight={900}
                                            fontSize={20}
                                            mb={2}
                                        >
                                            Total:{" "}
                                            {money(cartStore.totalPrice)}
                                        </Typography>

                                        <Button
                                            component={NavLink}
                                            to="/checkout"
                                            fullWidth
                                            variant="contained"
                                            sx={{
                                                bgcolor: "#111827",
                                                fontWeight: 900,
                                                py: 1.2,
                                                "&:hover": {
                                                    bgcolor: "#0b1220",
                                                },
                                            }}
                                        >
                                            Proceed to checkout
                                        </Button>
                                    </Paper>
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                );
            }}
        </Observer>
    );
}
