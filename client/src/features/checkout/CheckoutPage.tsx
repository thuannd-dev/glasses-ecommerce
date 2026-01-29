import { Observer } from "mobx-react-lite";
import {
    Box,
    Typography,
    Grid,
    Paper,
    Divider,
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    Chip,
} from "@mui/material";
import { useMemo, useState } from "react";
import { cartStore } from "../../lib/stores/cartStore";
import { useNavigate } from "react-router-dom";

/* ================== utils ================== */
function money(v: number) {
    return v.toLocaleString("vi-VN") + "₫";
}

function generateOrderCode() {
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `ORD-${new Date().getFullYear()}-${rand}`;
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

interface PlainOrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

/* ================== PAGE ================== */
export default function CheckoutPage() {
    const navigate = useNavigate();

    /* ===== Order ===== */
    const orderCode = useMemo(() => generateOrderCode(), []);
    const orderStatus = "PENDING";

    /* ===== Address ===== */
    const [address, setAddress] = useState<ShippingAddress>({
        recipientName: "",
        recipientPhone: "",
        venue: "",
        ward: "",
        district: "",
        city: "",
        postalCode: "",
    });

    /* ===== Payment ===== */
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod>("COD");

    /* ===== Derived ===== */
    const totalAmount = cartStore.totalPrice;

    /* ================== submit ================== */
    const handlePlaceOrder = () => {
        if (
            !address.recipientName ||
            !address.recipientPhone ||
            !address.venue
        ) {
            alert("Please fill all required shipping information");
            return;
        }

        /* ===== CONVERT MOBX → PLAIN JS (CỰC QUAN TRỌNG) ===== */
        const plainItems: PlainOrderItem[] = cartStore.items.map(
            (item) => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
            })
        );

        /* ===== DATA GỬI SANG ORDER SUCCESS ===== */
        const orderData = {
            orderCode,
            orderStatus,
            totalAmount,
            paymentMethod,
            address,
            items: plainItems, // ✅ plain array
            createdAt: new Date().toISOString(),
        };

        // TODO: API create order
        // await api.createOrder(orderData)

        cartStore.clear();

        navigate("/order-success", {
            state: orderData, // ✅ cloneable
        });
    };

    return (
        <Observer>
            {() => (
                <Box
                    sx={{
                        maxWidth: 1200,
                        mx: "auto",
                        mt: 10,
                        px: { xs: 2, md: 3 },
                        pb: 8,
                    }}
                >
                    {/* ===== HEADER ===== */}
                    <Typography fontWeight={900} fontSize={26}>
                        Checkout
                    </Typography>

                    <Typography
                        fontSize={14}
                        color="rgba(17,24,39,0.65)"
                        mt={0.5}
                    >
                        Order Code
                        <Chip
                            label={orderCode}
                            size="small"
                            sx={{ fontWeight: 700, ml: 1 }}
                        />
                    </Typography>

                    <Grid container spacing={4} mt={2}>
                        {/* ===== LEFT ===== */}
                        <Grid item xs={12} md={7}>
                            {/* SHIPPING ADDRESS */}
                            <Paper
                                elevation={0}
                                sx={{
                                    border: "1px solid rgba(17,24,39,0.12)",
                                    borderRadius: 3,
                                    p: 3,
                                    mb: 3,
                                }}
                            >
                                <Typography
                                    fontWeight={900}
                                    fontSize={18}
                                    mb={2}
                                >
                                    Shipping Address
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Recipient name"
                                            fullWidth
                                            required
                                            value={address.recipientName}
                                            onChange={(e) =>
                                                setAddress({
                                                    ...address,
                                                    recipientName:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            label="Phone number"
                                            fullWidth
                                            required
                                            value={address.recipientPhone}
                                            onChange={(e) =>
                                                setAddress({
                                                    ...address,
                                                    recipientPhone:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            label="Street / Venue"
                                            fullWidth
                                            required
                                            value={address.venue}
                                            onChange={(e) =>
                                                setAddress({
                                                    ...address,
                                                    venue: e.target.value,
                                                })
                                            }
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            label="Ward"
                                            fullWidth
                                            value={address.ward}
                                            onChange={(e) =>
                                                setAddress({
                                                    ...address,
                                                    ward: e.target.value,
                                                })
                                            }
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            label="District"
                                            fullWidth
                                            value={address.district}
                                            onChange={(e) =>
                                                setAddress({
                                                    ...address,
                                                    district: e.target.value,
                                                })
                                            }
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            label="City"
                                            fullWidth
                                            value={address.city}
                                            onChange={(e) =>
                                                setAddress({
                                                    ...address,
                                                    city: e.target.value,
                                                })
                                            }
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* PAYMENT METHOD */}
                            <Paper
                                elevation={0}
                                sx={{
                                    border: "1px solid rgba(17,24,39,0.12)",
                                    borderRadius: 3,
                                    p: 3,
                                }}
                            >
                                <Typography
                                    fontWeight={900}
                                    fontSize={18}
                                    mb={2}
                                >
                                    Payment Method
                                </Typography>

                                <RadioGroup
                                    value={paymentMethod}
                                    onChange={(e) =>
                                        setPaymentMethod(
                                            e.target.value as PaymentMethod
                                        )
                                    }
                                >
                                    <FormControlLabel
                                        value="COD"
                                        control={<Radio />}
                                        label="Cash on Delivery (COD)"
                                    />
                                    <FormControlLabel
                                        value="BANK"
                                        control={<Radio />}
                                        label="Bank Transfer"
                                    />
                                    <FormControlLabel
                                        value="MOMO"
                                        control={<Radio />}
                                        label="MoMo / E-Wallet"
                                    />
                                </RadioGroup>
                            </Paper>
                        </Grid>

                        {/* ===== RIGHT ===== */}
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

                                {cartStore.items.map((item) => (
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

                                <Typography
                                    fontWeight={900}
                                    fontSize={20}
                                >
                                    Total: {money(totalAmount)}
                                </Typography>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{
                                        mt: 2,
                                        bgcolor: "#111827",
                                        fontWeight: 900,
                                        py: 1.2,
                                        "&:hover": {
                                            bgcolor: "#0b1220",
                                        },
                                    }}
                                    onClick={handlePlaceOrder}
                                >
                                    Place Order
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </Observer>
    );
}
