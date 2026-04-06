import {
    Box,
    Typography,
    Divider,
    Button,
    IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { NavLink } from "react-router-dom";
import { useCart } from "../../../lib/hooks/useCart";
import { formatMoney } from "../../../lib/utils/format";
import { COLORS } from "../../theme/colors";

export default function CartDropdown() {
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
                position: "absolute",
                top: "100%",
                right: 0,
                mt: 1.5,
                width: 360,
                maxWidth: "90vw",
                bgcolor: COLORS.bgSurface,
                border: `1px solid ${COLORS.borderSoft}`,
                borderRadius: 2.5,
                boxShadow: "0 18px 40px rgba(0,0,0,0.10)",
                zIndex: 4000,
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    px: 2,
                    pt: 2,
                    pb: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                        sx={{ fontWeight: 700, fontSize: 15, color: COLORS.textPrimary }}
                    >
                        Cart
                    </Typography>
                    <Box
                        sx={{
                            px: 1,
                            py: 0.25,
                            borderRadius: 999,
                            bgcolor: COLORS.bgMuted,
                            border: `1px solid ${COLORS.borderSoft}`,
                            fontSize: 11,
                            fontWeight: 600,
                            color: COLORS.textPrimary,
                        }}
                    >
                        {totalQuantity} item{totalQuantity === 1 ? "" : "s"}
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ borderColor: COLORS.borderSofter }} />

            {/* Body */}
            {isLoading ? (
                <Box sx={{ p: 2 }}>
                    <Typography sx={{ color: COLORS.textSecondary, fontSize: 13.5 }}>
                        Loading cart...
                    </Typography>
                </Box>
            ) : items.length === 0 ? (
                <Box sx={{ p: 2 }}>
                    <Typography sx={{ color: COLORS.textSecondary, fontSize: 13.5 }}>
                        Your cart is empty.
                    </Typography>
                </Box>
            ) : (
                <>
                    {items.map((item) => (
                        <Box
                            key={item.id}
                            sx={{
                                display: "flex",
                                gap: 1.5,
                                px: 2,
                                py: 1.5,
                                alignItems: "center",
                                transition: "background-color 150ms ease",
                                "&:hover": { bgcolor: COLORS.bgSubtle },
                            }}
                        >
                            {/* Thumbnail */}
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    bgcolor: COLORS.bgMuted,
                                    overflow: "hidden",
                                    flexShrink: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {item.productImageUrl ? (
                                    <Box
                                        component="img"
                                        src={item.productImageUrl}
                                        alt={item.productName}
                                        sx={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : null}
                            </Box>

                            {/* Info */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: 13,
                                        color: COLORS.textPrimary,
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    }}
                                >
                                    {item.productName}
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: COLORS.textSecondary, mt: 0.25 }}>
                                    {formatMoney(item.price)}
                                </Typography>
                            </Box>

                            {/* Quantity pill */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    borderRadius: 999,
                                    border: `1px solid ${COLORS.borderSoft}`,
                                    height: 32,
                                    px: 0.5,
                                }}
                            >
                                <IconButton
                                    size="small"
                                    onClick={() => handleDecrease(item.id, item.quantity)}
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "999px",
                                        color: COLORS.textPrimary,
                                        "&:hover": { bgcolor: COLORS.bgSubtle },
                                    }}
                                >
                                    <RemoveIcon fontSize="small" />
                                </IconButton>
                                <Typography
                                    sx={{
                                        minWidth: 24,
                                        textAlign: "center",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: COLORS.textPrimary,
                                    }}
                                >
                                    {item.quantity}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => handleIncrease(item.id, item.quantity)}
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "999px",
                                        color: "#171717",
                                        "&:hover": { bgcolor: "#FAFAFA" },
                                    }}
                                >
                                    <AddIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    ))}
                </>
            )}

            <Divider sx={{ borderColor: COLORS.borderSofter }} />

            {/* Footer */}
            <Box sx={{ px: 2, pt: 1.5, pb: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1.5,
                    }}
                >
                    <Typography sx={{ fontSize: 13, color: COLORS.textSecondary }}>
                        Total
                    </Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: COLORS.textPrimary }}>
                        {formatMoney(totalAmount)}
                    </Typography>
                </Box>

                <Button
                    component={NavLink}
                    to="/cart"
                    fullWidth
                    variant="contained"
                    sx={{
                        mt: 0.5,
                        height: 46,
                        borderRadius: 1.75,
                        bgcolor: COLORS.accentNavy,
                        fontWeight: 800,
                        fontSize: 13,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        boxShadow: "0 8px 22px rgba(0,0,0,0.16)",
                        "&:hover": {
                            bgcolor: COLORS.accentNavySoft,
                            boxShadow: "0 10px 26px rgba(0,0,0,0.18)",
                            border: `1px solid ${COLORS.accentGold}`,
                        },
                        "&:focus-visible": {
                            outline: "2px solid rgba(184,146,90,0.5)",
                            outlineOffset: 3,
                        },
                    }}
                >
                    View cart
                </Button>
            </Box>
        </Box>
    );
}
