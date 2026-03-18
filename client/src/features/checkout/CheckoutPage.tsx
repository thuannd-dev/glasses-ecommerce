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
import { SavedAddressPicker } from "./components/SavedAddressPicker";

export default function CheckoutPage() {
    const navigate = useNavigate();
    const {
        items,
        totalAmount,
        finalAmount,
        discountAmount,
        appliedPromo,
        isEmptyCart,
        itemPrescriptions,
        cartLoading,
        address,
        setAddress,
        addressSearch,
        setAddressSearch,
        paymentMethod,
        setPaymentMethod,
        activePromotions,
        privatePromoInput,
        setPrivatePromoInput,
        handleApplyActivePromo,
        handleApplyPrivatePromo,
        handleRemovePromo,
        isApplyingPromo,
        submitting,
        snackbar,
        setSnackbar,
        handlePlaceOrder,
        savedAddresses,
        defaultAddress,
    } = useCheckoutPage();

    return (
        <Box
            sx={{
                maxWidth: 1200,
                mx: "auto",
                mt: 10,
                px: { xs: 2, md: 3 },
                pb: 8,
                bgcolor: "#FFFFFF",
            }}
        >
            {/* ===== HEADER ===== */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1.5,
                }}
            >
                <Box>
                    <Typography
                        sx={{
                            fontWeight: 900,
                            fontSize: 30,
                            color: "#171717",
                            lineHeight: 1.1,
                        }}
                    >
                        Checkout
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "#6B6B6B", mt: 0.5 }}>
                        {items.length > 0 &&
                            `${items.length} item(s) · ${formatMoney(totalAmount)}`}
                    </Typography>
                    <Box
                        sx={{
                            mt: 1.5,
                            width: 72,
                            height: 2,
                            borderRadius: 999,
                            bgcolor: "rgba(182,140,90,0.35)",
                        }}
                    />
                </Box>
                <Button
                    variant="outlined"
                    onClick={() => navigate("/cart")}
                    sx={{
                        color: "#171717",
                        borderColor: "#ECECEC",
                        borderRadius: "999px",
                        px: 2.5,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: 13,
                        "&:hover": {
                            borderColor: "#ECECEC",
                            bgcolor: "#FAFAFA",
                        },
                        "&:focus-visible": {
                            outline: "2px solid rgba(182,140,90,0.4)",
                            outlineOffset: 3,
                        },
                    }}
                >
                    Back to cart
                </Button>
            </Box>

            <Grid container spacing={4} mt={3}>
                        {/* ===== LEFT ===== */}
                        <Grid item xs={12} md={7}>
                            {/* SHIPPING ADDRESS */}
                            <Paper
                                elevation={0}
                                sx={{
                                    border: "1px solid #ECECEC",
                                    borderRadius: 2.5,
                                    p: 3,
                                    mb: 3,
                                    boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
                                    bgcolor: "#FFFFFF",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: 17,
                                        color: "#171717",
                                        mb: 0.5,
                                    }}
                                >
                                    Shipping address
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: 13,
                                        color: "#8A8A8A",
                                        mb: 2,
                                    }}
                                >
                                    Where should we send your eyewear?{defaultAddress && " We've prefilled your default address — you can switch to another saved one below."}
                                </Typography>

                                {savedAddresses.length > 0 && (
                                    <SavedAddressPicker
                                        addresses={savedAddresses}
                                        selectedId={
                                            savedAddresses.find(
                                                (a) =>
                                                    a.recipientName === address.recipientName &&
                                                    a.recipientPhone === address.recipientPhone &&
                                                    a.venue === address.venue,
                                            )?.id ?? null
                                        }
                                        onSelect={(addr) =>
                                            setAddress((prev) => ({
                                                ...prev,
                                                recipientName: addr.recipientName,
                                                recipientPhone: addr.recipientPhone,
                                                venue: addr.venue,
                                                ward: addr.ward,
                                                district: addr.district,
                                                city: addr.city,
                                                postalCode: addr.postalCode ?? "",
                                            }))
                                        }
                                    />
                                )}

                                <Divider sx={{ my: 2, borderColor: "rgba(0,0,0,0.06)" }} />
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6B6B6B", mb: 1.5 }}>
                                    Address details
                                </Typography>

                                <Grid container spacing={1.5}>
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
                                            InputProps={{
                                                sx: {
                                                    height: 48,
                                                    borderRadius: 2,
                                                },
                                            }}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": { borderColor: "#E6E6E6" },
                                                    "&:hover fieldset": {
                                                        borderColor: "#B68C5A",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#B68C5A",
                                                        boxShadow:
                                                            "0 0 0 3px rgba(182,140,90,0.16)",
                                                    },
                                                },
                                            }}
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
                                                !isValidVietnamPhone(
                                                    address.recipientPhone,
                                                )
                                            }
                                            helperText={
                                                address.recipientPhone &&
                                                !isValidVietnamPhone(
                                                    address.recipientPhone,
                                                )
                                                    ? "Enter a valid Vietnam phone (10 digits)"
                                                    : undefined
                                            }
                                            InputProps={{
                                                sx: {
                                                    height: 48,
                                                    borderRadius: 2,
                                                },
                                            }}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": { borderColor: "#E6E6E6" },
                                                    "&:hover fieldset": {
                                                        borderColor: "#B68C5A",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#B68C5A",
                                                        boxShadow:
                                                            "0 0 0 3px rgba(182,140,90,0.16)",
                                                    },
                                                },
                                            }}
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
                                            InputProps={{
                                                sx: {
                                                    height: 48,
                                                    borderRadius: 2,
                                                },
                                            }}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": { borderColor: "#E6E6E6" },
                                                    "&:hover fieldset": {
                                                        borderColor: "#B68C5A",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#B68C5A",
                                                        boxShadow:
                                                            "0 0 0 3px rgba(182,140,90,0.16)",
                                                    },
                                                },
                                            }}
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
                                            InputProps={{
                                                sx: {
                                                    height: 48,
                                                    borderRadius: 2,
                                                },
                                            }}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": { borderColor: "#E6E6E6" },
                                                    "&:hover fieldset": {
                                                        borderColor: "#B68C5A",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#B68C5A",
                                                        boxShadow:
                                                            "0 0 0 3px rgba(182,140,90,0.16)",
                                                    },
                                                },
                                            }}
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
                                            InputProps={{
                                                sx: {
                                                    height: 48,
                                                    borderRadius: 2,
                                                },
                                            }}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": { borderColor: "#E6E6E6" },
                                                    "&:hover fieldset": {
                                                        borderColor: "#B68C5A",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#B68C5A",
                                                        boxShadow:
                                                            "0 0 0 3px rgba(182,140,90,0.16)",
                                                    },
                                                },
                                            }}
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
                                            InputProps={{
                                                sx: {
                                                    height: 48,
                                                    borderRadius: 2,
                                                },
                                            }}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": { borderColor: "#E6E6E6" },
                                                    "&:hover fieldset": {
                                                        borderColor: "#B68C5A",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#B68C5A",
                                                        boxShadow:
                                                            "0 0 0 3px rgba(182,140,90,0.16)",
                                                    },
                                                },
                                            }}
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
                                            InputProps={{
                                                sx: {
                                                    height: 48,
                                                    borderRadius: 2,
                                                },
                                            }}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": { borderColor: "#E6E6E6" },
                                                    "&:hover fieldset": {
                                                        borderColor: "#B68C5A",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#B68C5A",
                                                        boxShadow:
                                                            "0 0 0 3px rgba(182,140,90,0.16)",
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            label="Order note (optional)"
                                            fullWidth
                                            multiline
                                            minRows={3}
                                            value={address.orderNote ?? ""}
                                            onChange={(e) =>
                                                setAddress((prev) => ({
                                                    ...prev,
                                                    orderNote: e.target.value,
                                                }))
                                            }
                                            placeholder="Delivery instructions, special requests..."
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: 2,
                                                    "& fieldset": { borderColor: "#E6E6E6" },
                                                    "&:hover fieldset": {
                                                        borderColor: "#B68C5A",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#B68C5A",
                                                        boxShadow:
                                                            "0 0 0 3px rgba(182,140,90,0.16)",
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* PAYMENT METHOD */}
                            <Paper
                                elevation={0}
                                sx={{
                                    border: "1px solid #ECECEC",
                                    borderRadius: 2.5,
                                    p: 3,
                                    boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
                                    bgcolor: "#FFFFFF",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: 17,
                                        color: "#171717",
                                        mb: 0.5,
                                    }}
                                >
                                    Payment method
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: 13,
                                        color: "#8A8A8A",
                                        mb: 2,
                                    }}
                                >
                                    Choose how you’d like to pay.
                                </Typography>

                                <RadioGroup
                                    value={paymentMethod}
                                    onChange={(e) =>
                                        setPaymentMethod(
                                            e.target.value as "COD" | "BANK",
                                        )
                                    }
                                >
                                    {[
                                        {
                                            value: "COD",
                                            label: "Cash on Delivery (COD)",
                                            description: "Pay with cash when your order arrives.",
                                        },
                                        {
                                            value: "BANK",
                                            label: "Bank Transfer",
                                            description: "Complete your order via VNPay.",
                                        },
                                    ].map((opt) => (
                                        <Box
                                            key={opt.value}
                                            sx={{
                                                mb: 1.5,
                                                borderRadius: 2,
                                                border:
                                                    paymentMethod === opt.value
                                                        ? "1px solid #B68C5A"
                                                        : "1px solid #ECECEC",
                                                bgcolor:
                                                    paymentMethod === opt.value
                                                        ? "#FAFAF8"
                                                        : "#FFFFFF",
                                                transition:
                                                    "background-color 150ms ease, border-color 150ms ease",
                                                "&:hover": {
                                                    bgcolor: "#FAFAFA",
                                                },
                                            }}
                                        >
                                            <FormControlLabel
                                                value={opt.value}
                                                control={
                                                    <Radio
                                                        color="default"
                                                        sx={{
                                                            color: "#171717",
                                                            "&.Mui-checked": {
                                                                color: "#171717",
                                                            },
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                                                        <Typography
                                                            sx={{
                                                                fontSize: 14,
                                                                fontWeight: 600,
                                                                color: "#171717",
                                                            }}
                                                        >
                                                            {opt.label}
                                                        </Typography>
                                                        <Typography
                                                            sx={{
                                                                fontSize: 12,
                                                                color: "#8A8A8A",
                                                            }}
                                                        >
                                                            {opt.description}
                                                        </Typography>
                                                    </Box>
                                                }
                                                sx={{
                                                    m: 0,
                                                    px: 1.5,
                                                    py: 1,
                                                    alignItems: "flex-start",
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </RadioGroup>
                            </Paper>
                        </Grid>

                        {/* ===== RIGHT ===== */}
                        <Grid item xs={12} md={5}>
                            <Box
                                sx={{
                                    position: { md: "sticky" },
                                    top: { md: 96 },
                                }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        border: "1px solid #ECECEC",
                                        borderRadius: 2.5,
                                        p: 3,
                                        boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
                                        bgcolor: "#FFFFFF",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            pb: 1.5,
                                            mb: 1.5,
                                            borderBottom: "1px solid #F1F1F1",
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontWeight: 800,
                                                fontSize: 17,
                                                color: "#171717",
                                            }}
                                        >
                                            Order summary
                                        </Typography>
                                    </Box>

                                    {cartLoading ? (
                                        <Typography sx={{ color: "#6B6B6B" }}>
                                            Loading cart...
                                        </Typography>
                                    ) : items.length === 0 ? (
                                        <Typography sx={{ color: "#6B6B6B" }}>
                                            Your cart is empty.
                                        </Typography>
                                    ) : (
                                        <>
                                            {items.map((item) => (
                                                <Box
                                                    key={item.id}
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1.5,
                                                        mb: 1.25,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 44,
                                                            height: 44,
                                                            borderRadius: 1.5,
                                                            bgcolor: "#F7F7F7",
                                                            overflow: "hidden",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {item.productImageUrl ? (
                                                            <Box
                                                                component="img"
                                                                src={item.productImageUrl}
                                                                alt=""
                                                                sx={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit: "cover",
                                                                }}
                                                            />
                                                        ) : null}
                                                    </Box>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography
                                                            sx={{
                                                                fontSize: 14,
                                                                color: "#171717",
                                                                whiteSpace: "nowrap",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                            }}
                                                        >
                                                            {item.productName}
                                                        </Typography>
                                                        <Typography
                                                            sx={{
                                                                fontSize: 12,
                                                                color: "#8A8A8A",
                                                            }}
                                                        >
                                                            × {item.quantity}
                                                        </Typography>
                                                        {itemPrescriptions[item.id] && (
                                                            <Typography
                                                                fontSize={12}
                                                                fontWeight={700}
                                                                sx={{ mt: 0.25, color: "#B68C5A" }}
                                                            >
                                                                Prescription
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 700,
                                                            fontSize: 14,
                                                            color: "#171717",
                                                        }}
                                                    >
                                                        {formatMoney(item.subtotal)}
                                                    </Typography>
                                                </Box>
                                            ))}

                                            <Divider sx={{ my: 2, borderColor: "#F1F1F1" }} />

                                            {/* Promo code — click to preview discount immediately */}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#171717", mb: 1 }}>
                                                    Promo code
                                                </Typography>
                                                {activePromotions.length > 0 ? (
                                                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                                        {activePromotions.map((promo) => {
                                                            const selected = appliedPromo?.promoCode === promo.promoCode;

                                                            let estimatedDiscount = 0;
                                                            if (totalAmount > 0) {
                                                                if (promo.promotionType === "FixedAmount") {
                                                                    estimatedDiscount = Math.min(totalAmount, promo.discountValue);
                                                                } else if (promo.promotionType === "Percentage") {
                                                                    const raw = (totalAmount * promo.discountValue) / 100;
                                                                    const cap =
                                                                        promo.maxDiscountValue != null
                                                                            ? promo.maxDiscountValue
                                                                            : raw;
                                                                    estimatedDiscount = Math.min(raw, cap);
                                                                }
                                                            }
                                                            const estimatedTotal = Math.max(0, totalAmount - estimatedDiscount);

                                                            return (
                                                                <Button
                                                                    key={promo.id ?? promo.promoCode}
                                                                    variant={selected ? "contained" : "outlined"}
                                                                    size="small"
                                                                    onClick={() => handleApplyActivePromo(promo)}
                                                                    disabled={totalAmount <= 0}
                                                                    sx={{
                                                                        borderRadius: 1.5,
                                                                        textTransform: "none",
                                                                        fontWeight: 600,
                                                                        fontSize: 13,
                                                                        borderColor: "#B68C5A",
                                                                        bgcolor: selected ? "rgba(182,140,90,0.12)" : "transparent",
                                                                        color: selected ? "#171717" : "#B68C5A",
                                                                        "&:hover": {
                                                                            borderColor: "#9E7748",
                                                                            bgcolor: selected ? "rgba(182,140,90,0.18)" : "rgba(182,140,90,0.08)",
                                                                        },
                                                                    }}
                                                                >
                                                                    <Box
                                                                        sx={{
                                                                            display: "flex",
                                                                            flexDirection: "row",
                                                                            alignItems: "center",
                                                                            gap: 1,
                                                                        }}
                                                                    >
                                                                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                                                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                                                                                {promo.promoName || promo.promoCode}
                                                                            </Typography>
                                                                            <Typography sx={{ fontSize: 11, color: "#6B6B6B" }}>
                                                                                {estimatedDiscount > 0
                                                                                    ? `Save ${formatMoney(estimatedDiscount)} · New total ${formatMoney(
                                                                                          estimatedTotal,
                                                                                      )}`
                                                                                    : `New total ${formatMoney(estimatedTotal)}`}
                                                                            </Typography>
                                                                        </Box>
                                                                        {selected && (
                                                                            <Typography
                                                                                component="span"
                                                                                sx={{
                                                                                    fontSize: 14,
                                                                                    fontWeight: 700,
                                                                                    ml: 0.5,
                                                                                    cursor: "pointer",
                                                                                }}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleRemovePromo();
                                                                                }}
                                                                            >
                                                                                ×
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                </Button>
                                                            );
                                                        })}
                                                    </Box>
                                                ) : (
                                                    <Typography sx={{ fontSize: 12, color: "#9E9E9E" }}>
                                                        No promo codes available.
                                                    </Typography>
                                                )}
                                                <Box sx={{ mt: 1.5, display: "flex", gap: 1 }}>
                                                    <TextField
                                                        size="small"
                                                        placeholder="Have a private code? Enter here"
                                                        value={privatePromoInput}
                                                        onChange={(e) => setPrivatePromoInput(e.target.value)}
                                                        sx={{
                                                            flex: 1,
                                                            "& .MuiOutlinedInput-root": {
                                                                borderRadius: 1.5,
                                                                fontSize: 13,
                                                                "& fieldset": { borderColor: "#E6E6E6" },
                                                                "&:hover fieldset": { borderColor: "#B68C5A" },
                                                                "&.Mui-focused fieldset": { borderColor: "#B68C5A" },
                                                            },
                                                        }}
                                                    />
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => handleApplyPrivatePromo(privatePromoInput)}
                                                        disabled={isApplyingPromo || !privatePromoInput.trim() || totalAmount <= 0}
                                                        sx={{
                                                            borderRadius: 1.5,
                                                            textTransform: "none",
                                                            fontWeight: 600,
                                                            fontSize: 13,
                                                            borderColor: "#B68C5A",
                                                            color: "#B68C5A",
                                                            "&:hover": { borderColor: "#9E7748", bgcolor: "rgba(182,140,90,0.08)" },
                                                        }}
                                                    >
                                                        Apply
                                                    </Button>
                                                </Box>
                                                {appliedPromo && discountAmount > 0 && (
                                                    <Typography sx={{ fontSize: 12, color: "#466A4A", mt: 0.75 }}>
                                                        Discount {formatMoney(discountAmount)}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {discountAmount > 0 && (
                                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                                    <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                                                        Discount
                                                    </Typography>
                                                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#466A4A" }}>
                                                        - {formatMoney(discountAmount)}
                                                    </Typography>
                                                </Box>
                                            )}

                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    mb: 2,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius: "50%",
                                                            bgcolor: "#B68C5A",
                                                        }}
                                                    />
                                                    <Typography
                                                        sx={{ fontSize: 14, color: "#6B6B6B" }}
                                                    >
                                                        Total
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    sx={{
                                                        fontWeight: 800,
                                                        fontSize: 20,
                                                        color: "#171717",
                                                    }}
                                                >
                                                    {formatMoney(finalAmount)}
                                                </Typography>
                                            </Box>

                                            <Button
                                                fullWidth
                                                variant="contained"
                                                disabled={submitting || isEmptyCart}
                                                sx={{
                                                    mt: 0.5,
                                                    height: 48,
                                                    borderRadius: 1.75,
                                                    bgcolor: "#111827",
                                                    fontWeight: 800,
                                                    fontSize: 13,
                                                    letterSpacing: "0.12em",
                                                    textTransform: "uppercase",
                                                    boxShadow: "0 8px 22px rgba(0,0,0,0.16)",
                                                    "&:hover": {
                                                        bgcolor: "#151826",
                                                        boxShadow:
                                                            "0 10px 26px rgba(0,0,0,0.18)",
                                                        border: "1px solid #B68C5A",
                                                    },
                                                    "&:focus-visible": {
                                                        outline:
                                                            "2px solid rgba(182,140,90,0.5)",
                                                        outlineOffset: 3,
                                                    },
                                                }}
                                                onClick={handlePlaceOrder}
                                            >
                                                {submitting ? "Placing order..." : "Place order"}
                                            </Button>
                                        </>
                                    )}
                                </Paper>
                            </Box>
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
