import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Typography,
    Divider,
    Button,
    Paper,
    IconButton,
    Checkbox,
    FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { NavLink, useNavigate } from "react-router-dom";
import { usePreOrders } from "../../lib/hooks/usePreOrders";
import { useCart } from "../../lib/hooks/useCart";
import { formatMoney } from "../../lib/utils/format";
import { getCartItemPrescriptions } from "../cart/prescriptionCache";
import { PrescriptionDisplay } from "../../app/shared/components/PrescriptionDisplay";
import type { CartItemDto } from "../../lib/types/cart";
import type { PrescriptionData } from "../../lib/types/prescription";

function PreOrderItemRow({
    item,
    selected,
    prescription,
    onToggle,
    onIncrease,
    onDecrease,
    formatMoney: fmt,
}: {
    item: CartItemDto;
    selected: boolean;
    prescription?: PrescriptionData;
    onToggle: () => void;
    onIncrease: () => void;
    onDecrease: () => void;
    formatMoney: (n: number) => string;
}) {
    return (
        <Box
            sx={{
                display: "flex",
                gap: 2,
                alignItems: "flex-start",
                py: 2,
            }}
        >
            <Checkbox
                checked={selected}
                onChange={onToggle}
                size="small"
                sx={{ mt: 0.5 }}
            />

            <Box
                component="img"
                src={item.productImageUrl ?? ""}
                sx={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    bgcolor: "#f3f4f6",
                    borderRadius: 1,
                }}
            />

            <Box sx={{ flex: 1 }}>
                <Typography fontWeight={700} fontSize={15}>
                    {item.productName}
                </Typography>
                <Typography fontSize={13} color="text.secondary" mt={0.5}>
                    {fmt(item.price)} / item
                </Typography>

                {prescription && (
                    <Box sx={{ mt: 1 }}>
                        <PrescriptionDisplay prescription={prescription} />
                    </Box>
                )}

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                    <IconButton
                        size="small"
                        onClick={onDecrease}
                        sx={{
                            border: "1px solid rgba(17,24,39,0.15)",
                            width: 28,
                            height: 28,
                        }}
                    >
                        <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography
                        fontSize={13}
                        fontWeight={700}
                        sx={{ minWidth: 30, textAlign: "center" }}
                    >
                        {item.quantity}
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={onIncrease}
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

            <Box sx={{ textAlign: "right" }}>
                <Typography fontWeight={700} fontSize={15}>
                    {fmt(item.subtotal ?? item.price * item.quantity)}
                </Typography>
                <Typography fontSize={12} color="text.secondary" mt={0.5}>
                    {item.quantity} item(s)
                </Typography>
            </Box>
        </Box>
    );
}

export default function PreOrdersPage() {
    const navigate = useNavigate();
    const { preOrderItems } = usePreOrders();
    const { isLoading, updateItem, removeItem } = useCart();

    // Get prescriptions for pre-order items
    const itemPrescriptions = useMemo(
        () => getCartItemPrescriptions(preOrderItems),
        [preOrderItems],
    );

    const itemIds = useMemo(() => preOrderItems.map((i) => i.id), [preOrderItems]);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(itemIds));
    useEffect(() => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            itemIds.forEach((id) => next.add(id));
            preOrderItems.forEach((i) => {
                if (!itemIds.includes(i.id)) next.delete(i.id);
            });
            return next;
        });
    }, [itemIds, preOrderItems]);

    const selectedItems = useMemo(
        () => preOrderItems.filter((i) => selectedIds.has(i.id)),
        [preOrderItems, selectedIds],
    );
    const totalQuantity = selectedItems.reduce((s, i) => s + i.quantity, 0);
    const totalAmount = selectedItems.reduce(
        (s, i) => s + (i.subtotal ?? i.price * i.quantity),
        0,
    );

    const allSelected =
        preOrderItems.length > 0 &&
        preOrderItems.every((i) => selectedIds.has(i.id));
    const handleSelectAll = () => {
        const ids = preOrderItems.map((i) => i.id);
        if (allSelected) {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                ids.forEach((id) => next.delete(id));
                return next;
            });
        } else {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                ids.forEach((id) => next.add(id));
                return next;
            });
        }
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
                Pre-Orders
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
                    <Typography>Loading pre-orders...</Typography>
                </Paper>
            ) : preOrderItems.length === 0 ? (
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
                    <FavoriteBorderIcon
                        sx={{
                            fontSize: 48,
                            color: "rgba(17,24,39,0.2)",
                            mb: 2,
                        }}
                    />
                    <Typography fontWeight={600} mb={1}>
                        No pre-orders yet
                    </Typography>
                    <Typography color="text.secondary" fontSize={14} mb={2}>
                        Pre-order items for products currently out of stock
                    </Typography>
                    <Button
                        component={NavLink}
                        to="/collections"
                        variant="contained"
                        sx={{ bgcolor: "#111827" }}
                    >
                        Browse collections
                    </Button>
                </Paper>
            ) : (
                // ===== PRE-ORDERS LIST =====
                <>
                    {preOrderItems.length > 0 && (
                        <Paper elevation={0} sx={{ border: "1px solid rgba(17,24,39,0.1)", borderRadius: 2, mb: 3 }}>
                            <Box sx={{ p: 3 }}>
                                {/* Select all */}
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={allSelected}
                                                indeterminate={
                                                    selectedIds.size > 0 &&
                                                    selectedIds.size < preOrderItems.length
                                                }
                                                onChange={handleSelectAll}
                                            />
                                        }
                                        label={
                                            <Typography fontWeight={600}>
                                                Select all pre-orders ({preOrderItems.length})
                                            </Typography>
                                        }
                                    />
                                </Box>
                                <Divider />

                                {/* Items */}
                                {preOrderItems.map((item: CartItemDto) => (
                                    <Box key={item.id}>
                                        <PreOrderItemRow
                                            item={item}
                                            selected={selectedIds.has(item.id)}
                                            prescription={itemPrescriptions[item.id]}
                                            onToggle={() => handleToggleItem(item.id)}
                                            onIncrease={() =>
                                                handleIncrease(item.id, item.quantity)
                                            }
                                            onDecrease={() =>
                                                handleDecrease(item.id, item.quantity)
                                            }
                                            formatMoney={formatMoney}
                                        />
                                        <Divider sx={{ my: 1 }} />
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    )}

                    {/* ===== CHECKOUT SECTION ===== */}
                    <Paper
                        elevation={0}
                        sx={{
                            border: "1px solid rgba(17,24,39,0.1)",
                            borderRadius: 2,
                            p: 3,
                            position: "sticky",
                            bottom: 20,
                        }}
                    >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Box>
                                <Typography color="text.secondary" fontSize={13}>
                                    Selected items: {totalQuantity}
                                </Typography>
                                <Typography fontWeight={900} fontSize={20}>
                                    {formatMoney(totalAmount)}
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                size="large"
                                disabled={selectedItems.length === 0}
                                onClick={handleProceedToCheckout}
                                sx={{
                                    bgcolor: "#111827",
                                    fontWeight: 700,
                                    px: 4,
                                    py: 1.5,
                                    "&:disabled": {
                                        bgcolor: "rgba(17,24,39,0.2)",
                                        color: "rgba(17,24,39,0.3)",
                                    },
                                }}
                            >
                                Pre-Order Now
                            </Button>
                        </Box>
                    </Paper>
                </>
            )}
        </Box>
    );
}
