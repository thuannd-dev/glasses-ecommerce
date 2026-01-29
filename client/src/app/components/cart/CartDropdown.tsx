import { Observer } from "mobx-react-lite";
import {
    Box,
    Typography,
    Divider,
    Button,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { cartStore } from "../../../lib/stores/cartStore";

function money(v: number) {
    return v.toLocaleString("vi-VN") + "₫";
}

export default function CartDropdown() {
    return (
        <Observer>
            {() => (
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
                            Cart ({cartStore.totalQuantity})
                        </Typography>
                    </Box>

                    <Divider />

                    {cartStore.items.length === 0 ? (
                        <Box sx={{ p: 2 }}>
                            <Typography color="text.secondary" fontSize={13.5}>
                                Your cart is empty
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {cartStore.items.map((item) => (
                                <Box
                                    key={item.productId}
                                    sx={{ display: "flex", gap: 1.5, p: 2 }}
                                >
                                    <Box
                                        component="img"
                                        src={item.image}
                                        sx={{
                                            width: 56,
                                            height: 42,
                                            objectFit: "cover",
                                            bgcolor: "#f3f4f6",
                                        }}
                                    />

                                    <Box sx={{ flex: 1 }}>
                                        <Typography fontWeight={700} fontSize={13}>
                                            {item.name}
                                        </Typography>
                                        <Typography fontSize={12} color="text.secondary">
                                            {item.quantity} × {money(item.price)}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </>
                    )}

                    <Divider />

                    <Box sx={{ p: 2 }}>
                        <Typography fontWeight={900} mb={1}>
                            Total: {money(cartStore.totalPrice)}
                        </Typography>

                        <Button
                            component={NavLink}
                            to="/cart"
                            fullWidth
                            variant="contained"
                            sx={{
                                bgcolor: "#111827",
                                fontWeight: 900,
                            }}
                        >
                            View cart
                        </Button>
                    </Box>
                </Box>
            )}
        </Observer>
    );
}
