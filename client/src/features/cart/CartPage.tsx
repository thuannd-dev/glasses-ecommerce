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
    onRemove,
    formatMoney: fmt,
}: {
    item: CartItemDto;
    selected: boolean;
    prescription?: PrescriptionData;
    onToggle: () => void;
    onIncrease: () => void;
    onDecrease: () => void;
    onRemove?: () => void;
    formatMoney: (n: number) => string;
}) {
    return (
        <Box
            sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                py: 1.75,
                px: 1,
                borderBottom: "1px solid #F1F1F1",
                transition: "background-color 180ms ease",
                "&:last-of-type": {
                    borderBottom: "none",
                },
                "&:hover": {
                    bgcolor: "#FAFAFA",
                },
            }}
        >
            <Checkbox checked={selected} onChange={onToggle} color="default" />
            <Box
                sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 3,
                    bgcolor: "#F7F7F7",
                    overflow: "hidden",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {item.productImageUrl && (
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
                )}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    sx={{
                        fontWeight: 600,
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
                        mt: 0.25,
                        fontSize: 13,
                        color: "#8A8A8A",
                    }}
                >
                    Unit price · {fmt(item.price)}
                </Typography>
                {prescription && (
                    <PrescriptionDisplay prescription={prescription} variant="inline" />
                )}
            </Box>
            {/* quantity pill */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 999,
                    border: "1px solid #ECECEC",
                    height: 36,
                    px: 0.5,
                    gap: 0.5,
                    flexShrink: 0,
                }}
            >
                <IconButton
                    size="small"
                    onClick={onDecrease}
                    sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "999px",
                        color: "#171717",
                        "&:hover": { bgcolor: "#FAFAFA" },
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
                        color: "#171717",
                    }}
                >
                    {item.quantity}
                </Typography>
                <IconButton
                    size="small"
                    onClick={onIncrease}
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
            {/* line total + remove */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 0.5,
                    flexShrink: 0,
                    minWidth: 80,
                }}
            >
                <Typography
                    sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#171717",
                    }}
                >
                    {fmt(item.subtotal ?? item.price * item.quantity)}
                </Typography>
                {onRemove && (
                    <Button
                        onClick={onRemove}
                        size="small"
                        variant="text"
                        sx={{
                            p: 0,
                            minWidth: "auto",
                            fontSize: 11,
                            textTransform: "none",
                            color: "#8A8A8A",
                            "&:hover": { color: "#B68C5A", backgroundColor: "transparent" },
                        }}
                    >
                        Remove
                    </Button>
                )}
            </Box>
        </Box>
    );
}

export default function CartPage() {
    const navigate = useNavigate();
    const { cart, isLoading, updateItem, removeItem } = useCart();

    const items = cart?.items ?? [];
    const itemIds = useMemo(() => items.map((i) => i.id), [items]);

    /** Split items: pre-order takes priority, then prescription, then standard. */
    const itemPrescriptions = useMemo(
        () => getCartItemPrescriptions(items),
        [items],
    );
    const prescriptionItemIds = useMemo(
        () => new Set(Object.keys(itemPrescriptions)),
        [itemPrescriptions],
    );
    
    // Pre-order items (regardless of whether they have prescriptions)
    const preOrderItemIds = useMemo(
        () => new Set(items.filter((i) => i.isPreOrder).map((i) => i.id)),
        [items],
    );
    
    // Prescription items (only if NOT pre-order)
    const prescriptionOnlyItemIds = useMemo(
        () => new Set(
            items
                .filter((i) => !i.isPreOrder && prescriptionItemIds.has(i.id))
                .map((i) => i.id)
        ),
        [items, prescriptionItemIds],
    );
    
    // Normal items are neither pre-order nor have prescriptions
    const normalItems = useMemo(
        () => items.filter((i) => !preOrderItemIds.has(i.id) && !prescriptionOnlyItemIds.has(i.id)),
        [items, preOrderItemIds, prescriptionOnlyItemIds],
    );
    
    // Prescription items (only non-pre-order items with prescriptions)
    const prescriptionItems = useMemo(
        () => items.filter((i) => prescriptionOnlyItemIds.has(i.id)),
        [items, prescriptionOnlyItemIds],
    );
    
    // Pre-order items (includes pre-order items even if they have prescriptions)
    const preOrderItems = useMemo(
        () => items.filter((i) => preOrderItemIds.has(i.id)),
        [items, preOrderItemIds],
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
    const allPreOrderSelected =
        preOrderItems.length > 0 &&
        preOrderItems.every((i) => selectedIds.has(i.id));
    const handleSelectAllPreOrder = () => {
        const preOrderIds = preOrderItems.map((i) => i.id);
        if (allPreOrderSelected) {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                preOrderIds.forEach((id) => next.delete(id));
                return next;
            });
        } else {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                preOrderIds.forEach((id) => next.add(id));
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
            <Box sx={{ mb: 3 }}>
                <Typography
                    sx={{
                        fontWeight: 900,
                        fontSize: 30,
                        color: "#171717",
                        lineHeight: 1.1,
                    }}
                >
                    Shopping cart
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#6B6B6B", mt: 0.5 }}>
                    Review your pieces before checkout.
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
                                border: "1px solid #ECECEC",
                                borderRadius: 2.5,
                                p: 3,
                                boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
                            }}
                        >
                            {/* --- Standard orders --- */}
                            {normalItems.length > 0 && (
                                <>
                                    <Box
                                        sx={{
                                            pb: 2,
                                            borderBottom: "1px solid #F1F1F1",
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
                                                    color="default"
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
                                            onRemove={() => removeItem(item.id)}
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
                                            borderBottom: "1px solid #F1F1F1",
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
                                                    color="default"
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
                                            onRemove={() => removeItem(item.id)}
                                            formatMoney={formatMoney}
                                        />
                                    ))}
                                </>
                            )}

                            {/* --- Pre-order orders --- */}
                            {preOrderItems.length > 0 && (
                                <>
                                    {(normalItems.length > 0 || prescriptionItems.length > 0) && (
                                        <Divider sx={{ my: 3 }} />
                                    )}
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
                                            Pre-Order orders
                                        </Typography>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={allPreOrderSelected}
                                                    indeterminate={
                                                        preOrderItems.some((i) =>
                                                            selectedIds.has(i.id),
                                                        ) &&
                                                        !allPreOrderSelected
                                                    }
                                                    onChange={handleSelectAllPreOrder}
                                                />
                                            }
                                            label="Select all pre-order orders"
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </Box>
                                    {preOrderItems.map((item) => (
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
                                            onRemove={() => removeItem(item.id)}
                                            formatMoney={formatMoney}
                                        />
                                    ))}
                                </>
                            )}
                        </Paper>
                    </Grid>

                    {/* ===== RIGHT: SUMMARY ===== */}
                    <Grid item xs={12} md={4}>
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

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        mb: 1,
                                    }}
                                >
                                    <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                                        Selected
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: "#171717",
                                        }}
                                    >
                                        {selectedItems.length} item(s) · {totalQuantity} pcs
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        mb: 1.5,
                                    }}
                                >
                                    <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                                        Subtotal
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: "#171717",
                                        }}
                                    >
                                        {formatMoney(totalAmount)}
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 1.5, borderColor: "#F1F1F1" }} />

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: 2,
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                                            fontSize: 20,
                                            fontWeight: 800,
                                            color: "#171717",
                                        }}
                                    >
                                        {formatMoney(totalAmount)}
                                    </Typography>
                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    disabled={selectedItems.length === 0}
                                    onClick={handleProceedToCheckout}
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
                                            boxShadow: "0 10px 26px rgba(0,0,0,0.18)",
                                            border: "1px solid #B68C5A",
                                        },
                                        "&:focus-visible": {
                                            outline: "2px solid rgba(182,140,90,0.5)",
                                            outlineOffset: 3,
                                        },
                                    }}
                                >
                                    Proceed to checkout
                                </Button>
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}
