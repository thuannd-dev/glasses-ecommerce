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
    Snackbar,
    Alert,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { cartStore } from "../../lib/stores/cartStore";
import { useNavigate } from "react-router-dom";
import AddressAutocomplete from "../../app/shared/components/AddressAutocomplete";

/* ================== utils ================== */
function money(v: number) {
    return v.toLocaleString("vi-VN") + "₫";
}

function generateOrderCode() {
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `ORD-${new Date().getFullYear()}-${rand}`;
}

/** Vietnam phone: 10 digits, optional +84 or 0 prefix */
function isValidVietnamPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, "");
    return /^(0|84)?[35789][0-9]{8}$/.test(cleaned) && cleaned.length >= 10;
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
    orderNote?: string;
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
        orderNote: "",
    });
    const [addressSearch, setAddressSearch] = useState("");

    /* ===== Payment ===== */
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod>("COD");

    /* ===== UI ===== */
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "error" | "info" | "success";
    }>({ open: false, message: "", severity: "error" });

    /* ===== Derived ===== */
    const totalAmount = cartStore.totalPrice;
    const isEmptyCart = cartStore.items.length === 0;

    /* ===== Empty cart guard ===== */
    useEffect(() => {
        if (isEmptyCart) {
            setSnackbar({
                open: true,
                message: "Your cart is empty. Add items before checkout.",
                severity: "info",
            });
        }
    }, [isEmptyCart]);

    /* ================== submit ================== */
    const handlePlaceOrder = async () => {
        if (isEmptyCart) {
            setSnackbar({
                open: true,
                message: "Your cart is empty.",
                severity: "error",
            });
            return;
        }
        if (!address.recipientName || !address.recipientPhone || !address.venue) {
            setSnackbar({
                open: true,
                message: "Please fill all required shipping information.",
                severity: "error",
            });
            return;
        }
        if (!isValidVietnamPhone(address.recipientPhone)) {
            setSnackbar({
                open: true,
                message: "Please enter a valid Vietnam phone number (10 digits).",
                severity: "error",
            });
            return;
        }

        setSubmitting(true);
        try {
            const plainItems: PlainOrderItem[] = cartStore.items.map(
                (item) => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })
            );

            const orderData = {
                orderCode,
                orderStatus,
                totalAmount,
                paymentMethod,
                address,
                items: plainItems,
                createdAt: new Date().toISOString(),
            };

            // TODO: API create order
            // await api.createOrder(orderData)

            cartStore.clear();

            navigate("/order-success", {
                state: orderData,
            });
        } catch {
            setSnackbar({
                open: true,
                message: "Failed to place order. Please try again.",
                severity: "error",
            });
        } finally {
            setSubmitting(false);
        }
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
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                        <Box>
                            <Typography fontWeight={900} fontSize={26}>
                                Checkout
                            </Typography>
                            <Typography
                        component="div" // tránh <div> nằm trong <p> gây hydration warning
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
                        </Box>
                        <Button
                            variant="outlined"
                            onClick={() => navigate("/cart")}
                            sx={{
                                color: "#111827",
                                borderColor: "#111827",
                                borderRadius: "9999px",
                                "&:hover": {
                                    borderColor: "#111827",
                                    bgcolor: "rgba(17,24,39,0.04)",
                                },
                            }}
                        >
                            Back to Cart
                        </Button>
                    </Box>

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
                                        <AddressAutocomplete
                                            value={addressSearch}
                                            onChange={setAddressSearch}
                                            onSelectAddress={(a) => {
                                                setAddress((prev) => ({
                                                    ...prev,
                                                    venue: a.venue,
                                                    ward: a.ward,
                                                    district: a.district,
                                                    city: a.city,
                                                    postalCode: a.postalCode ?? "",
                                                }));
                                            }}
                                            label="Search shipping address"
                                            placeholder="Enter house number, street, district, city..."
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            label="Recipient name"
                                            fullWidth
                                            required
                                            value={address.recipientName}
                                            onChange={(e) =>
                                                setAddress((prev) => ({
                                                    ...prev,
                                                    recipientName: e.target.value,
                                                }))
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
                                                setAddress((prev) => ({
                                                    ...prev,
                                                    recipientPhone: e.target.value,
                                                }))
                                            }
                                            placeholder="e.g. 0912345678"
                                            error={
                                                !!address.recipientPhone &&
                                                !isValidVietnamPhone(address.recipientPhone)
                                            }
                                            helperText={
                                                address.recipientPhone &&
                                                !isValidVietnamPhone(address.recipientPhone)
                                                    ? "Enter a valid Vietnam phone (10 digits)"
                                                    : undefined
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
                                                setAddress((prev) => ({
                                                    ...prev,
                                                    venue: e.target.value,
                                                }))
                                            }
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            label="Ward"
                                            fullWidth
                                            value={address.ward}
                                            onChange={(e) =>
                                                setAddress((prev) => ({
                                                    ...prev,
                                                    ward: e.target.value,
                                                }))
                                            }
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            label="District"
                                            fullWidth
                                            value={address.district}
                                            onChange={(e) =>
                                                setAddress((prev) => ({
                                                    ...prev,
                                                    district: e.target.value,
                                                }))
                                            }
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            label="City"
                                            fullWidth
                                            value={address.city}
                                            onChange={(e) =>
                                                setAddress((prev) => ({
                                                    ...prev,
                                                    city: e.target.value,
                                                }))
                                            }
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            label="Postal code"
                                            fullWidth
                                            value={address.postalCode ?? ""}
                                            onChange={(e) =>
                                                setAddress((prev) => ({
                                                    ...prev,
                                                    postalCode: e.target.value,
                                                }))
                                            }
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            label="Order note (optional)"
                                            fullWidth
                                            multiline
                                            rows={2}
                                            value={address.orderNote ?? ""}
                                            onChange={(e) =>
                                                setAddress((prev) => ({
                                                    ...prev,
                                                    orderNote: e.target.value,
                                                }))
                                            }
                                            placeholder="Delivery instructions, special requests..."
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
                                    disabled={submitting || isEmptyCart}
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
                                    {submitting ? "Placing order..." : "Place Order"}
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Snackbar
                        open={snackbar.open}
                        autoHideDuration={5000}
                        onClose={() =>
                            setSnackbar((prev) => ({ ...prev, open: false }))
                        }
                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                    >
                        <Alert
                            severity={snackbar.severity}
                            onClose={() =>
                                setSnackbar((prev) => ({ ...prev, open: false }))
                            }
                        >
                            {snackbar.message}
                        </Alert>
                    </Snackbar>
                </Box>
            )}
        </Observer>
    );
}
