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
    Snackbar,
    Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddressAutocomplete from "../../app/shared/components/AddressAutocomplete";
import { formatMoney } from "../../lib/utils/format";
import { useCheckoutPage } from "./hooks/useCheckoutPage";
import { isValidVietnamPhone } from "./utils";

export default function CheckoutPage() {
    const navigate = useNavigate();
    const {
        items,
        totalAmount,
        isEmptyCart,
        cartLoading,
        address,
        setAddress,
        addressSearch,
        setAddressSearch,
        paymentMethod,
        setPaymentMethod,
        submitting,
        snackbar,
        setSnackbar,
        handlePlaceOrder,
    } = useCheckoutPage();

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
                    {/* ===== HEADER ===== */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                        <Box>
                            <Typography fontWeight={900} fontSize={26}>
                                Checkout
                            </Typography>
                            <Typography fontSize={14} color="rgba(17,24,39,0.65)" mt={0.5}>
                                {items.length > 0 && `${items.length} item(s) · ${formatMoney(totalAmount)}`}
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
                                            e.target.value as "COD" | "BANK" | "MOMO"
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

                                {cartLoading ? (
                                    <Typography color="text.secondary">Loading cart...</Typography>
                                ) : items.length === 0 ? (
                                    <Typography color="text.secondary">Your cart is empty.</Typography>
                                ) : (
                                    <>
                                        {items.map((item) => (
                                            <Box
                                                key={item.id}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1.5,
                                                    mb: 1.5,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: 1.5,
                                                        bgcolor: "rgba(17,24,39,0.06)",
                                                        overflow: "hidden",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {item.productImageUrl ? (
                                                        <Box
                                                            component="img"
                                                            src={item.productImageUrl}
                                                            alt=""
                                                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                        />
                                                    ) : (
                                                        <Box
                                                            sx={{
                                                                width: "100%",
                                                                height: "100%",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                            }}
                                                        >
                                                            <Typography fontSize={10} color="text.secondary">
                                                                —
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography fontSize={14}>
                                                        {item.productName} × {item.quantity}
                                                    </Typography>
                                                </Box>
                                                <Typography fontWeight={700}>
                                                    {formatMoney(item.subtotal)}
                                                </Typography>
                                            </Box>
                                        ))}

                                        <Divider sx={{ my: 2 }} />

                                        <Typography
                                            fontWeight={900}
                                            fontSize={20}
                                        >
                                            Total: {formatMoney(totalAmount)}
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
                                    </>
                                )}
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
    );
}
