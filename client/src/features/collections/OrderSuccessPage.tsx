import {
    Box,
    Typography,
    Paper,
    Divider,
    Button,
    Grid,
    Chip,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useLocation, NavLink } from "react-router-dom";

/* ================== utils ================== */
function money(v: number) {
    return v.toLocaleString("vi-VN") + "₫";
}

/* ================== types ================== */
type PaymentMethod = "COD" | "BANK" | "MOMO";

interface ShippingAddress {
    recipientName: string;
    recipientPhone: string;
    venue: string;
    ward: string;
    district: string;
    city: string;
    postalCode?: string;
}

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

interface OrderSuccessState {
    orderCode: string;
    orderStatus: string;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    address: ShippingAddress;
    items: OrderItem[];
    createdAt: string;
}

export default function OrderSuccessPage() {
    const location = useLocation();
    const state = location.state as OrderSuccessState | null;

    // ===== SAFE GUARD (refresh trực tiếp) =====
    if (!state) {
        return (
            <Box sx={{ maxWidth: 800, mx: "auto", mt: 10, px: 2 }}>
                <Typography fontWeight={900} fontSize={22}>
                    Order not found
                </Typography>

                <Typography
                    color="rgba(17,24,39,0.65)"
                    mt={1}
                    mb={3}
                >
                    The order information is unavailable. Please return to shop.
                </Typography>

                <Button
                    component={NavLink}
                    to="/collections"
                    variant="contained"
                    sx={{ fontWeight: 900 }}
                >
                    Continue shopping
                </Button>
            </Box>
        );
    }

    const {
        orderCode,
        orderStatus,
        totalAmount,
        paymentMethod,
        address,
        items,
        createdAt,
    } = state;

    return (
        <Box
            sx={{
                maxWidth: 1000,
                mx: "auto",
                mt: 10,
                px: { xs: 2, md: 3 },
                pb: 8,
            }}
        >
            {/* ===== SUCCESS HEADER ===== */}
            <Paper
                elevation={0}
                sx={{
                    border: "1px solid rgba(17,24,39,0.12)",
                    borderRadius: 3,
                    p: 4,
                    textAlign: "center",
                    mb: 4,
                }}
            >
                <CheckCircleOutlineIcon
                    sx={{ fontSize: 64, color: "#16a34a" }}
                />

                <Typography fontWeight={900} fontSize={26} mt={2}>
                    Order placed successfully 
                </Typography>

                <Typography
                    color="rgba(17,24,39,0.65)"
                    mt={1}
                >
                    Thank you for your purchase. Your order has been received.
                </Typography>

                <Box mt={2}>
                    <Chip
                        label={orderCode}
                        sx={{ fontWeight: 900 }}
                    />
                </Box>
            </Paper>

            <Grid container spacing={4}>
                {/* ===== LEFT: ORDER INFO ===== */}
                <Grid item xs={12} md={7}>
                    <Paper
                        elevation={0}
                        sx={{
                            border: "1px solid rgba(17,24,39,0.12)",
                            borderRadius: 3,
                            p: 3,
                        }}
                    >
                        <Typography fontWeight={900} fontSize={18}>
                            Order Information
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography fontSize={14} mb={1}>
                            <b>Status:</b> {orderStatus}
                        </Typography>

                        <Typography fontSize={14} mb={1}>
                            <b>Payment Method:</b> {paymentMethod}
                        </Typography>

                        <Typography fontSize={14} mb={1}>
                            <b>Order Date:</b>{" "}
                            {new Date(createdAt).toLocaleString()}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography fontWeight={900} mb={1}>
                            Shipping Address
                        </Typography>

                        <Typography fontSize={14}>
                            {address.recipientName} –{" "}
                            {address.recipientPhone}
                        </Typography>

                        <Typography fontSize={14}>
                            {address.venue}, {address.ward},{" "}
                            {address.district}, {address.city}
                        </Typography>
                    </Paper>
                </Grid>

                {/* ===== RIGHT: ITEMS ===== */}
                <Grid item xs={12} md={5}>
                    <Paper
                        elevation={0}
                        sx={{
                            border: "1px solid rgba(17,24,39,0.12)",
                            borderRadius: 3,
                            p: 3,
                        }}
                    >
                        <Typography fontWeight={900} fontSize={18}>
                            Order Summary
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        {items.map((item) => (
                            <Box
                                key={item.productId}
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 1,
                                }}
                            >
                                <Typography fontSize={14}>
                                    {item.name} × {item.quantity}
                                </Typography>

                                <Typography fontWeight={700}>
                                    {money(
                                        item.price * item.quantity
                                    )}
                                </Typography>
                            </Box>
                        ))}

                        <Divider sx={{ my: 2 }} />

                        <Typography fontWeight={900} fontSize={20}>
                            Total: {money(totalAmount)}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* ===== ACTIONS ===== */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    mt: 5,
                }}
            >
                <Button
                    component={NavLink}
                    to="/collections"
                    variant="outlined"
                    sx={{ fontWeight: 900 }}
                >
                    Continue shopping
                </Button>

                <Button
                    component={NavLink}
                    to="/orders"
                    variant="contained"
                    sx={{ fontWeight: 900 }}
                >
                    View my orders
                </Button>
            </Box>
        </Box>
    );
}
