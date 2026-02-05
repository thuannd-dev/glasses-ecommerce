import {
    Box,
    Typography,
    Divider,
    Button,
    Grid,
    Paper,
    IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { NavLink } from "react-router-dom";

import { useCart } from "../../lib/hooks/useCart";

function money(v: number) {
    return v.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export default function CartPage() {
    const { cart, isLoading, updateItem, removeItem } = useCart();

    const items = cart?.items ?? [];
    const totalQuantity = cart?.totalQuantity ?? 0;
    const totalAmount = cart?.totalAmount ?? 0;

    const handleIncrease = (id: string, currentQty: number) => {
        updateItem({ id, quantity: currentQty + 1 });
    };

    const handleDecrease = (id: string, currentQty: number) => {
        const next = currentQty - 1;
        if (next <= 0) {
            removeItem(id);
        } else {
            updateItem({ id, quantity: next });
        }
    };

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

            {/* ===== LOADING ===== */}
            {isLoading ? (
                <Paper
                    elevation={0}
                    sx={{
                        border: "1px dashed rgba(17,24,39,0.2)",
                        borderRadius: 3,
                        py: 8,
                        textAlign: "center",
                    }}
                >
                    <Typography>Loading cart...</Typography>
                </Paper>
            ) : items.length === 0 ? (
                // ===== EMPTY STATE =====
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

                    <Typography fontWeight={900} fontSize={20} mt={2}>
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
                            {items.map((item) => (
                                <Box
                                    key={item.id}
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                        alignItems: "center",
                                        py: 2,
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={item.productImageUrl ?? ""}
                                        sx={{
                                            width: 120,
                                            height: 90,
                                            objectFit: "cover",
                                            bgcolor: "#f3f4f6",
                                            borderRadius: 2,
                                        }}
                                    />

                                    <Box sx={{ flex: 1 }}>
                                        <Typography fontWeight={800}>
                                            {item.productName}
                                        </Typography>

                                        <Typography
                                            fontSize={14}
                                            fontWeight={700}
                                            mt={0.5}
                                        >
                                            {money(item.price)}
                                        </Typography>

                                        {/* Quantity controls dưới giá */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                mt: 1,
                                            }}
                                        >
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleDecrease(
                                                        item.id,
                                                        item.quantity,
                                                    )
                                                }
                                                sx={{
                                                    border: "1px solid rgba(17,24,39,0.15)",
                                                    width: 28,
                                                    height: 28,
                                                }}
                                            >
                                                <RemoveIcon fontSize="small" />
                                            </IconButton>

                                            <Typography
                                                fontSize={14}
                                                fontWeight={700}
                                                sx={{ minWidth: 24, textAlign: "center" }}
                                            >
                                                {item.quantity}
                                            </Typography>

                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleIncrease(
                                                        item.id,
                                                        item.quantity,
                                                    )
                                                }
                                                sx={{
                                                    border: "1px solid rgba(17,24,39,0.15)",
                                                    width: 28,
                                                    height: 28,
                                                }}
                                            >
                                                <AddIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
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
                            <Typography fontWeight={900} fontSize={18}>
                                Order Summary
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 1,
                                }}
                            >
                                <Typography fontSize={14}>Items</Typography>
                                <Typography fontWeight={700}>
                                    {totalQuantity}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 2,
                                }}
                            >
                                <Typography fontSize={14}>Subtotal</Typography>
                                <Typography fontWeight={700}>
                                    {money(totalAmount)}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography
                                fontWeight={900}
                                fontSize={20}
                                mb={2}
                            >
                                Total: {money(totalAmount)}
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
}
