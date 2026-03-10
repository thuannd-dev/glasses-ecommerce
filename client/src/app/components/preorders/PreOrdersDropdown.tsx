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
import { usePreOrders } from "../../../lib/hooks/usePreOrders";
import { useCart } from "../../../lib/hooks/useCart";
import { formatMoney } from "../../../lib/utils/format";
import type { CartItemDto } from "../../../lib/types/cart";

export default function PreOrdersDropdown() {
    const { preOrderItems, totalQuantity, totalAmount } = usePreOrders();
    const { isLoading, updateItem, removeItem } = useCart();

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
                mt: 1,
                width: 320,
                bgcolor: "#fff",
                border: "1px solid rgba(17,24,39,0.12)",
                boxShadow: "0 10px 30px rgba(0,0,0,.08)",
                zIndex: 4000,
            }}
        >
            <Box sx={{ p: 2 }}>
                <Typography fontWeight={900}>
                    Pre-Orders ({totalQuantity})
                </Typography>
            </Box>

            <Divider />

            {isLoading ? (
                <Box sx={{ p: 2 }}>
                    <Typography color="text.secondary" fontSize={13.5}>
                        Loading pre-orders...
                    </Typography>
                </Box>
            ) : preOrderItems.length === 0 ? (
                <Box sx={{ p: 2 }}>
                    <Typography color="text.secondary" fontSize={13.5}>
                        No pre-orders yet
                    </Typography>
                </Box>
            ) : (
                <>
                    {preOrderItems.map((item: CartItemDto) => (
                        <Box
                            key={item.id}
                            sx={{ display: "flex", gap: 1.5, p: 2 }}
                        >
                            <Box
                                component="img"
                                src={item.productImageUrl ?? ""}
                                sx={{
                                    width: 56,
                                    height: 42,
                                    objectFit: "cover",
                                    bgcolor: "#f3f4f6",
                                }}
                            />

                            <Box sx={{ flex: 1 }}>
                                <Typography fontWeight={700} fontSize={13}>
                                    {item.productName}
                                </Typography>
                                <Typography fontSize={12} color="text.secondary">
                                    {formatMoney(item.price)}
                                </Typography>

                                {/* Quantity controls */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.75,
                                        mt: 0.5,
                                    }}
                                >
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            handleDecrease(item.id, item.quantity)
                                        }
                                        sx={{
                                            border: "1px solid rgba(17,24,39,0.15)",
                                            width: 24,
                                            height: 24,
                                        }}
                                    >
                                        <RemoveIcon fontSize="inherit" />
                                    </IconButton>
                                    <Typography
                                        fontSize={12}
                                        fontWeight={700}
                                        sx={{ minWidth: 20, textAlign: "center" }}
                                    >
                                        {item.quantity}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            handleIncrease(item.id, item.quantity)
                                        }
                                        sx={{
                                            border: "1px solid rgba(17,24,39,0.15)",
                                            width: 24,
                                            height: 24,
                                        }}
                                    >
                                        <AddIcon fontSize="inherit" />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </>
            )}

            <Divider />

            <Box sx={{ p: 2 }}>
                <Typography fontWeight={900} mb={1}>
                    Total: {formatMoney(totalAmount)}
                </Typography>

                <Button
                    component={NavLink}
                    to="/pre-orders"
                    fullWidth
                    variant="contained"
                    sx={{
                        bgcolor: "#111827",
                        fontWeight: 900,
                    }}
                >
                    View pre-orders
                </Button>
            </Box>
        </Box>
    );
}
