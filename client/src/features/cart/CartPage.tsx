import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Typography,
    Divider,
    Button,
    Grid,
    Paper,
    IconButton,
    Checkbox,
    FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { NavLink, useNavigate } from "react-router-dom";

import { useCart } from "../../lib/hooks/useCart";
import { formatMoney } from "../../lib/utils/format";

export default function CartPage() {
    const navigate = useNavigate();
    const { cart, isLoading, updateItem, removeItem } = useCart();

    const items = cart?.items ?? [];
    const itemIds = useMemo(() => items.map((i) => i.id), [items]);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(itemIds));
    useEffect(() => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            itemIds.forEach((id) => next.add(id));
            itemIds.forEach((id) => {
                if (!items.some((i) => i.id === id)) next.delete(id);
            });
            return next;
        });
    }, [itemIds, items]);

    const selectedItems = useMemo(
        () => items.filter((i) => selectedIds.has(i.id)),
        [items, selectedIds],
    );
    const totalQuantity = selectedItems.reduce((s, i) => s + i.quantity, 0);
    const totalAmount = selectedItems.reduce((s, i) => s + (i.subtotal ?? i.price * i.quantity), 0);

    const allSelected = items.length > 0 && selectedIds.size >= items.length;
    const handleSelectAll = () => {
        if (allSelected) setSelectedIds(new Set());
        else setSelectedIds(new Set(itemIds));
    };
    const handleToggleItem = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

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

    const handleProceedToCheckout = () => {
        const ids = selectedItems.map((i) => i.id);
        if (ids.length === 0) return;
        navigate("/checkout", { state: { selectedCartItemIds: ids } });
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
                            <Box sx={{ pb: 2, borderBottom: "1px solid rgba(17,24,39,0.08)" }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={allSelected}
                                            indeterminate={selectedIds.size > 0 && selectedIds.size < items.length}
                                            onChange={handleSelectAll}
                                        />
                                    }
                                    label="Select all"
                                    sx={{ fontWeight: 600 }}
                                />
                            </Box>
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
                                    <Checkbox
                                        checked={selectedIds.has(item.id)}
                                        onChange={() => handleToggleItem(item.id)}
                                    />
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
                                            {formatMoney(item.price)}
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
                                <Typography fontSize={14}>Selected</Typography>
                                <Typography fontWeight={700}>
                                    {selectedItems.length} item(s) · {totalQuantity} pcs
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
                                    {formatMoney(totalAmount)}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography
                                fontWeight={900}
                                fontSize={20}
                                mb={2}
                            >
                                Total: {formatMoney(totalAmount)}
                            </Typography>

                            <Button
                                fullWidth
                                variant="contained"
                                disabled={selectedItems.length === 0}
                                onClick={handleProceedToCheckout}
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
