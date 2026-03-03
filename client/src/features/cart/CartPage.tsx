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
import { getCartItemPrescriptions } from "./prescriptionCache";
import { PrescriptionDisplay } from "../../app/shared/components/PrescriptionDisplay";
import type { CartItemDto } from "../../lib/types/cart";
import type { PrescriptionData } from "../../lib/types/prescription";

function CartItemRow({
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
            <Checkbox checked={selected} onChange={onToggle} />
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
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={800}>{item.productName}</Typography>
                {prescription && (
                    <Typography
                        component="span"
                        fontSize={12}
                        fontWeight={700}
                        color="primary"
                        sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 0.5 }}
                    >
                        Prescription
                    </Typography>
                )}
                <Typography fontSize={14} fontWeight={700} mt={0.5}>
                    {fmt(item.price)}
                </Typography>
                {prescription && (
                    <PrescriptionDisplay prescription={prescription} variant="inline" />
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
                        fontSize={14}
                        fontWeight={700}
                        sx={{ minWidth: 24, textAlign: "center" }}
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
        </Box>
    );
}

export default function CartPage() {
    const navigate = useNavigate();
    const { cart, isLoading, updateItem, removeItem } = useCart();

    const items = cart?.items ?? [];
    const itemIds = useMemo(() => items.map((i) => i.id), [items]);

    /** Split items: ones with prescription (from prescriptionCache) are prescription orders, others are standard orders. */
    const itemPrescriptions = useMemo(
        () => getCartItemPrescriptions(items),
        [items],
    );
    const prescriptionItemIds = useMemo(
        () => new Set(Object.keys(itemPrescriptions)),
        [itemPrescriptions],
    );
    const normalItems = useMemo(
        () => items.filter((i) => !prescriptionItemIds.has(i.id)),
        [items, prescriptionItemIds],
    );
    const prescriptionItems = useMemo(
        () => items.filter((i) => prescriptionItemIds.has(i.id)),
        [items, prescriptionItemIds],
    );

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

    const allNormalSelected =
        normalItems.length > 0 &&
        normalItems.every((i) => selectedIds.has(i.id));
    const handleSelectAllNormal = () => {
        const normalIds = normalItems.map((i) => i.id);
        if (allNormalSelected) {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                normalIds.forEach((id) => next.delete(id));
                return next;
            });
        } else {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                normalIds.forEach((id) => next.add(id));
                return next;
            });
        }
    };
    const allPrescriptionSelected =
        prescriptionItems.length > 0 &&
        prescriptionItems.every((i) => selectedIds.has(i.id));
    const handleSelectAllPrescription = () => {
        const prescriptionIds = prescriptionItems.map((i) => i.id);
        if (allPrescriptionSelected) {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                prescriptionIds.forEach((id) => next.delete(id));
                return next;
            });
        } else {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                prescriptionIds.forEach((id) => next.add(id));
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
                    {/* ===== LEFT: CART ITEMS (split standard & prescription) ===== */}
                    <Grid item xs={12} md={8}>
                        <Paper
                            elevation={0}
                            sx={{
                                border: "1px solid rgba(17,24,39,0.1)",
                                borderRadius: 3,
                                p: 3,
                            }}
                        >
                            {/* --- Standard orders --- */}
                            {normalItems.length > 0 && (
                                <>
                                    <Box
                                        sx={{
                                            pb: 2,
                                            borderBottom: "1px solid rgba(17,24,39,0.08)",
                                        }}
                                    >
                                        <Typography
                                            fontWeight={800}
                                            fontSize={16}
                                            color="text.secondary"
                                            sx={{ mb: 1 }}
                                        >
                                            Standard orders
                                        </Typography>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={allNormalSelected}
                                                    indeterminate={
                                                        normalItems.some((i) =>
                                                            selectedIds.has(i.id),
                                                        ) &&
                                                        !allNormalSelected
                                                    }
                                                    onChange={handleSelectAllNormal}
                                                />
                                            }
                                            label="Select all standard orders"
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </Box>
                                    {normalItems.map((item) => (
                                        <CartItemRow
                                            key={item.id}
                                            item={item}
                                            selected={selectedIds.has(item.id)}
                                            onToggle={() => handleToggleItem(item.id)}
                                            onIncrease={() =>
                                                handleIncrease(item.id, item.quantity)
                                            }
                                            onDecrease={() =>
                                                handleDecrease(item.id, item.quantity)
                                            }
                                            formatMoney={formatMoney}
                                        />
                                    ))}
                                    {prescriptionItems.length > 0 && (
                                        <Divider sx={{ my: 3 }} />
                                    )}
                                </>
                            )}

                            {/* --- Prescription orders --- */}
                            {prescriptionItems.length > 0 && (
                                <>
                                    <Box
                                        sx={{
                                            pb: 2,
                                            borderBottom: "1px solid rgba(17,24,39,0.08)",
                                        }}
                                    >
                                        <Typography
                                            fontWeight={800}
                                            fontSize={16}
                                            color="text.secondary"
                                            sx={{ mb: 1 }}
                                        >
                                            Prescription orders
                                        </Typography>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={allPrescriptionSelected}
                                                    indeterminate={
                                                        prescriptionItems.some((i) =>
                                                            selectedIds.has(i.id),
                                                        ) &&
                                                        !allPrescriptionSelected
                                                    }
                                                    onChange={handleSelectAllPrescription}
                                                />
                                            }
                                            label="Select all prescription orders"
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </Box>
                                    {prescriptionItems.map((item) => (
                                        <CartItemRow
                                            key={item.id}
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
                                    ))}
                                </>
                            )}
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
