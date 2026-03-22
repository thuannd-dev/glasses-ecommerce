import { useState, useMemo, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    Button,
    Box,
    Typography,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableHead,
    FormControlLabel,
    Checkbox,
    MenuItem,
} from "@mui/material";
import type { PrescriptionData, PrescriptionDetailRow } from "../../../../lib/types/prescription";
import { EYE_LABELS } from "../../../../lib/types/prescription";
import type { LensSelectionOption } from "../../../../lib/types/lensSelection";
import { PrescriptionModeSelector } from "./lensSelection/PrescriptionModeSelector";
import { NonPrescriptionLensPanel } from "./lensSelection/NonPrescriptionLensPanel";
import { PrescriptionFlowEntryPanel } from "./lensSelection/PrescriptionFlowEntryPanel";

const INITIAL_DETAILS: PrescriptionDetailRow[] = [
    { eye: 1, sph: null, cyl: null, axis: null, pd: null, add: null },
    { eye: 2, sph: null, cyl: null, axis: null, pd: null, add: null },
];

type Step = "form" | "confirm";

const STEP_LABELS: { key: Step | "lens" | "addons"; label: string }[] = [
    { key: "form", label: "Prescription" },
    { key: "lens", label: "Lens" },
    { key: "addons", label: "Add-Ons" },
];

function buildSphOptions(): string[] {
    const out: string[] = [];
    for (let i = -80; i <= 48; i++) {
        out.push((i * 0.25).toFixed(2));
    }
    return out;
}

function buildCylOptions(): string[] {
    const out: string[] = [];
    for (let i = -24; i <= 24; i++) {
        out.push((i * 0.25).toFixed(2));
    }
    return out;
}

const AXIS_OPTIONS = Array.from({ length: 181 }, (_, i) => String(i));
const PD_OPTIONS = Array.from({ length: 128 }, (_, i) => String(i + 53));

const SPH_OPTIONS = buildSphOptions();
const CYL_OPTIONS = buildCylOptions();

type Props = {
    open: boolean;
    onClose: () => void;
    fullPage?: boolean;
    isPreOrder?: boolean;
    productName: string;
    variantLabel: string;
    productImageUrl: string;
    price: number;
    onNonPrescriptionAddToCart: () => Promise<boolean>;
    canAddToCart: boolean;
    /** Return `true` when add-to-cart ran (caller may close); `false` if blocked (e.g. sign-in required). */
    onPrescriptionConfirm: (prescription: PrescriptionData) => Promise<boolean>;
    onLogoClick?: () => void;
};

export function SelectLensesDialog({
    open,
    onClose,
    fullPage,
    isPreOrder,
    productName,
    variantLabel,
    productImageUrl,
    price,
    onNonPrescriptionAddToCart,
    canAddToCart,
    onPrescriptionConfirm,
    onLogoClick,
}: Props) {
    const [selectedOption, setSelectedOption] = useState<LensSelectionOption | null>(null);
    const [hasEnteredPrescriptionFlow, setHasEnteredPrescriptionFlow] = useState(false);
    const [nonRxSubmitting, setNonRxSubmitting] = useState(false);

    const [step, setStep] = useState<Step>("form");
    const [details, setDetails] = useState<PrescriptionDetailRow[]>(() =>
        INITIAL_DETAILS.map((d) => ({ ...d }))
    );
    const [pdSingle, setPdSingle] = useState<string>("");
    const [twoPdNumbers, setTwoPdNumbers] = useState(false);
    const [pdLeft, setPdLeft] = useState<string>("");
    const [pdRight, setPdRight] = useState<string>("");

    const prescription: PrescriptionData = useMemo(() => {
        const rows = details.map((row) => {
            const pdVal = twoPdNumbers
                ? row.eye === 1
                    ? pdRight
                    : pdLeft
                : pdSingle;
            const pdNum = pdVal === "" ? null : Number(pdVal);
            return {
                ...row,
                pd: pdNum === undefined || Number.isNaN(pdNum) ? null : pdNum,
            };
        });
        return { details: rows };
    }, [details, pdSingle, pdLeft, pdRight, twoPdNumbers]);

    useEffect(() => {
        if (open) {
            setSelectedOption(null);
            setHasEnteredPrescriptionFlow(false);
            setNonRxSubmitting(false);
            setStep("form");
            setDetails(INITIAL_DETAILS.map((d) => ({ ...d })));
            setPdSingle("");
            setPdLeft("");
            setPdRight("");
            setTwoPdNumbers(false);
        }
    }, [open]);

    const showLegacyPrescriptionFlow =
        selectedOption === "prescription" && hasEnteredPrescriptionFlow;

    const updateDetail = (eye: 1 | 2, field: keyof PrescriptionDetailRow, value: number | null) => {
        setDetails((prev) =>
            prev.map((row) => (row.eye === eye ? { ...row, [field]: value } : row))
        );
    };

    const isPrescriptionFormValid = useMemo(() => {
        const bothEyesFilled = details.every(
            (row) => row.sph != null && row.cyl != null && row.axis != null
        );
        const pdFilled = twoPdNumbers ? pdRight !== "" && pdLeft !== "" : pdSingle !== "";
        return bothEyesFilled && pdFilled;
    }, [details, twoPdNumbers, pdSingle, pdRight, pdLeft]);

    const handleFormContinue = () => setStep("confirm");
    const handleEdit = () => setStep("form");
    const handleYes = async () => {
        const ok = await onPrescriptionConfirm(prescription);
        if (ok) onClose();
    };

    const handleNonPrescriptionAdd = useCallback(async () => {
        if (!canAddToCart || nonRxSubmitting) return;
        setNonRxSubmitting(true);
        try {
            const ok = await onNonPrescriptionAddToCart();
            if (ok) onClose();
        } finally {
            setNonRxSubmitting(false);
        }
    }, [canAddToCart, nonRxSubmitting, onNonPrescriptionAddToCart, onClose]);

    const resetToOptionStep = useCallback(() => {
        setSelectedOption(null);
        setHasEnteredPrescriptionFlow(false);
        setStep("form");
    }, []);

    const formatNum = (n: number | null) =>
        n == null ? "—" : Number.isInteger(n) ? String(n) : n.toFixed(2);

    const usageLabel = "Single Vision";

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={!!fullPage}
            hideBackdrop={!!fullPage}
            maxWidth={fullPage ? false : "lg"}
            fullWidth={!fullPage}
            PaperProps={{
                sx: fullPage
                    ? { borderRadius: 0, width: "100%", height: "100%", maxWidth: "100%", m: 0 }
                    : { borderRadius: 2 },
            }}
        >
            <DialogContent sx={{ p: 0, overflow: "hidden" }}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        minHeight: fullPage ? "100vh" : 520,
                        width: "100%",
                        boxSizing: "border-box",
                        px: { xs: 2, md: 4 },
                        py: { xs: 2, md: 3 },
                        columnGap: { xs: 2, md: 6 },
                        alignItems: "flex-start",
                    }}
                >
                    <Box
                        sx={{
                            flexBasis: { xs: "auto", md: "45%" },
                            maxWidth: { md: "45%" },
                            pr: { xs: 0, md: 3 },
                            pl: { xs: 0, md: 0 },
                            py: 0,
                            borderRight: { md: "none" },
                            bgcolor: "rgba(17,24,39,0.02)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "stretch",
                        }}
                    >
                        <Typography
                            onClick={onLogoClick}
                            sx={{
                                fontWeight: 900,
                                letterSpacing: 2,
                                fontSize: 26,
                                color: "#111827",
                                textTransform: "uppercase",
                                mb: 0.75,
                                cursor: onLogoClick ? "pointer" : "default",
                            }}
                        >
                            EYEWEAR
                        </Typography>
                        <Typography
                            component="button"
                            onClick={onClose}
                            sx={{
                                display: "inline-block",
                                mb: 1.5,
                                color: "#111827",
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: "pointer",
                                border: "none",
                                background: "none",
                                textAlign: "left",
                                "&:hover": { textDecoration: "underline" },
                            }}
                        >
                            ← Back to Frame
                        </Typography>
                        <Box
                            component="img"
                            src={productImageUrl}
                            alt={productName}
                            sx={{
                                width: "100%",
                                maxWidth: 520,
                                mx: "auto",
                                aspectRatio: "4/3",
                                objectFit: "cover",
                                borderRadius: 2,
                                bgcolor: "#f3f4f6",
                                mb: 2,
                            }}
                        />
                        <Typography fontWeight={900} fontSize={22} sx={{ mt: 1, textAlign: "center" }}>
                            {productName}
                        </Typography>
                        <Typography fontWeight={900} fontSize={24} sx={{ mt: 2, textAlign: "center" }}>
                            ${price.toFixed(2)}
                        </Typography>
                        <Typography fontSize={12} color="text.secondary" sx={{ textAlign: "center" }}>
                            Price (USD)
                        </Typography>
                        <Typography fontSize={12} color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
                            Shipping & handling calculated at checkout
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            flexBasis: { xs: "auto", md: "55%" },
                            maxWidth: { md: "55%" },
                            display: "flex",
                            flexDirection: "column",
                            minWidth: 0,
                        }}
                    >
                        {showLegacyPrescriptionFlow ? (
                            <>
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                        px: 3,
                                        pt: 2,
                                        pb: 1,
                                        borderBottom: "1px solid rgba(17,24,39,0.1)",
                                    }}
                                >
                                    {STEP_LABELS.map(({ key, label }) => {
                                        const isActive =
                                            key === "form" && (step === "form" || step === "confirm");
                                        const isDisabled = key === "lens" || key === "addons";
                                        return (
                                            <Typography
                                                key={key}
                                                component="button"
                                                type="button"
                                                onClick={() => !isDisabled && setStep("form")}
                                                sx={{
                                                    border: "none",
                                                    background: "none",
                                                    cursor: isDisabled ? "default" : "pointer",
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    color: isDisabled
                                                        ? "text.disabled"
                                                        : isActive
                                                          ? "#111827"
                                                          : "text.secondary",
                                                    borderBottom: isActive
                                                        ? "2px solid #111827"
                                                        : "2px solid transparent",
                                                    pb: 0.5,
                                                    "&:hover": isDisabled ? {} : { color: "#111827" },
                                                }}
                                            >
                                                {label}
                                            </Typography>
                                        );
                                    })}
                                </Box>

                                <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: "auto" }}>
                                    {step === "form" && (
                                        <Box sx={{ width: "100%" }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                                <Typography fontWeight={700}>
                                                    {isPreOrder
                                                        ? "Pre-Order Prescription Details"
                                                        : "Fill in your prescription details"}
                                                </Typography>
                                                {isPreOrder && (
                                                    <Box
                                                        sx={{
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            height: 20,
                                                            px: 0.75,
                                                            borderRadius: 999,
                                                            bgcolor: "#FEF3C7",
                                                            border: "1px solid #FCD34D",
                                                            color: "#92400E",
                                                            fontSize: 11,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        📦 Pre-Order
                                                    </Box>
                                                )}
                                            </Box>
                                            <Table size="small" sx={{ mb: 2 }}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 700 }}></TableCell>
                                                        <TableCell sx={{ fontWeight: 700 }}>SPH</TableCell>
                                                        <TableCell sx={{ fontWeight: 700 }}>CYL</TableCell>
                                                        <TableCell sx={{ fontWeight: 700 }}>Axis</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {details.map((row) => (
                                                        <TableRow key={row.eye}>
                                                            <TableCell sx={{ fontWeight: 600 }}>
                                                                {EYE_LABELS[row.eye]}
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    select
                                                                    size="small"
                                                                    value={
                                                                        row.sph != null
                                                                            ? row.sph.toFixed(2)
                                                                            : "0.00"
                                                                    }
                                                                    onChange={(e) =>
                                                                        updateDetail(
                                                                            row.eye,
                                                                            "sph",
                                                                            parseFloat(e.target.value)
                                                                        )
                                                                    }
                                                                    sx={{ minWidth: 100 }}
                                                                    SelectProps={{
                                                                        MenuProps: {
                                                                            PaperProps: {
                                                                                sx: { maxHeight: 280 },
                                                                            },
                                                                        },
                                                                    }}
                                                                >
                                                                    {SPH_OPTIONS.map((opt) => (
                                                                        <MenuItem key={opt} value={opt}>
                                                                            {opt}
                                                                        </MenuItem>
                                                                    ))}
                                                                </TextField>
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    select
                                                                    size="small"
                                                                    value={
                                                                        row.cyl != null
                                                                            ? row.cyl.toFixed(2)
                                                                            : "0.00"
                                                                    }
                                                                    onChange={(e) =>
                                                                        updateDetail(
                                                                            row.eye,
                                                                            "cyl",
                                                                            parseFloat(e.target.value)
                                                                        )
                                                                    }
                                                                    sx={{ minWidth: 100 }}
                                                                    SelectProps={{
                                                                        MenuProps: {
                                                                            PaperProps: {
                                                                                sx: { maxHeight: 280 },
                                                                            },
                                                                        },
                                                                    }}
                                                                >
                                                                    {CYL_OPTIONS.map((opt) => (
                                                                        <MenuItem key={opt} value={opt}>
                                                                            {opt}
                                                                        </MenuItem>
                                                                    ))}
                                                                </TextField>
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    select
                                                                    size="small"
                                                                    value={
                                                                        row.axis != null
                                                                            ? String(row.axis)
                                                                            : "0"
                                                                    }
                                                                    onChange={(e) =>
                                                                        updateDetail(
                                                                            row.eye,
                                                                            "axis",
                                                                            parseInt(e.target.value, 10)
                                                                        )
                                                                    }
                                                                    disabled={row.sph == null || row.cyl == null}
                                                                    sx={{ minWidth: 72 }}
                                                                    SelectProps={{
                                                                        MenuProps: {
                                                                            PaperProps: {
                                                                                sx: { maxHeight: 280 },
                                                                            },
                                                                        },
                                                                    }}
                                                                >
                                                                    {AXIS_OPTIONS.map((opt) => (
                                                                        <MenuItem key={opt} value={opt}>
                                                                            {opt}
                                                                        </MenuItem>
                                                                    ))}
                                                                </TextField>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                            <Typography fontWeight={700} sx={{ mb: 1 }}>
                                                PD (Pupillary Distance){" "}
                                                <Typography component="span" color="error">
                                                    *
                                                </Typography>
                                            </Typography>
                                            <TextField
                                                select
                                                size="small"
                                                fullWidth
                                                placeholder="Enter your PD"
                                                value={twoPdNumbers ? "" : pdSingle}
                                                onChange={(e) => setPdSingle(e.target.value)}
                                                disabled={twoPdNumbers}
                                                sx={{ maxWidth: 200 }}
                                                SelectProps={{
                                                    displayEmpty: true,
                                                    renderValue: (selected: unknown) =>
                                                        selected === "" ? "Select PD" : (selected as string),
                                                    MenuProps: { PaperProps: { sx: { maxHeight: 280 } } },
                                                }}
                                            >
                                                <MenuItem value="">Select PD</MenuItem>
                                                {PD_OPTIONS.map((opt) => (
                                                    <MenuItem key={opt} value={opt}>
                                                        {opt}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                            <Box sx={{ display: "block", mt: 2 }}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={twoPdNumbers}
                                                            onChange={(e) => setTwoPdNumbers(e.target.checked)}
                                                        />
                                                    }
                                                    label="I have 2 PD numbers."
                                                />
                                            </Box>
                                            {twoPdNumbers && (
                                                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                                                    <TextField
                                                        select
                                                        size="small"
                                                        label="OD (Right)"
                                                        value={pdRight}
                                                        onChange={(e) => setPdRight(e.target.value)}
                                                        sx={{ flex: 1 }}
                                                        SelectProps={{
                                                            MenuProps: {
                                                                PaperProps: { sx: { maxHeight: 280 } },
                                                            },
                                                        }}
                                                    >
                                                        {PD_OPTIONS.map((opt) => (
                                                            <MenuItem key={opt} value={opt}>
                                                                {opt}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                    <TextField
                                                        select
                                                        size="small"
                                                        label="OS (Left)"
                                                        value={pdLeft}
                                                        onChange={(e) => setPdLeft(e.target.value)}
                                                        sx={{ flex: 1 }}
                                                        SelectProps={{
                                                            MenuProps: {
                                                                PaperProps: { sx: { maxHeight: 280 } },
                                                            },
                                                        }}
                                                    >
                                                        {PD_OPTIONS.map((opt) => (
                                                            <MenuItem key={opt} value={opt}>
                                                                {opt}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </Box>
                                            )}
                                            <Typography
                                                component="a"
                                                href="#"
                                                sx={{
                                                    color: "primary.main",
                                                    fontSize: 14,
                                                    display: "block",
                                                    mt: 1,
                                                }}
                                            >
                                                Help me find my PD
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                disabled={!isPrescriptionFormValid}
                                                sx={{
                                                    mt: 3,
                                                    py: 1.2,
                                                    fontWeight: 900,
                                                    bgcolor: "#111827",
                                                    "&:hover": { bgcolor: "#0b1220" },
                                                }}
                                                onClick={handleFormContinue}
                                            >
                                                Continue
                                            </Button>
                                        </Box>
                                    )}

                                    {step === "confirm" && (
                                        <Box>
                                            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                                                <Box
                                                    component="img"
                                                    src={productImageUrl}
                                                    alt={productName}
                                                    sx={{
                                                        width: 100,
                                                        height: 80,
                                                        objectFit: "cover",
                                                        borderRadius: 1,
                                                    }}
                                                />
                                                <Box>
                                                    <Typography fontWeight={900}>{productName}</Typography>
                                                    <Typography fontSize={14} color="text.secondary">
                                                        {variantLabel}
                                                    </Typography>
                                                    <Typography fontWeight={700}>${price.toFixed(2)}</Typography>
                                                </Box>
                                            </Box>
                                            <Typography fontWeight={900} sx={{ mb: 1 }}>
                                                Confirm Your Prescription
                                            </Typography>
                                            <Typography fontSize={14} color="text.secondary" sx={{ mb: 2 }}>
                                                Make sure your prescription matches the information below. To edit,
                                                go back.
                                            </Typography>
                                            <Typography fontWeight={600} sx={{ mb: 1 }}>
                                                Prescription: {usageLabel}
                                            </Typography>
                                            <Typography fontSize={14} sx={{ mb: 2 }}>
                                                PD:{" "}
                                                {twoPdNumbers
                                                    ? `OD ${pdRight || "—"} / OS ${pdLeft || "—"}`
                                                    : pdSingle || "—"}
                                            </Typography>
                                            <Table size="small" sx={{ mb: 2 }}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 700 }}></TableCell>
                                                        <TableCell sx={{ fontWeight: 700 }}>SPH</TableCell>
                                                        <TableCell sx={{ fontWeight: 700 }}>CYL</TableCell>
                                                        <TableCell sx={{ fontWeight: 700 }}>Axis</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {prescription.details.map((row) => (
                                                        <TableRow key={row.eye}>
                                                            <TableCell sx={{ fontWeight: 600 }}>
                                                                {EYE_LABELS[row.eye]}
                                                            </TableCell>
                                                            <TableCell>{formatNum(row.sph)}</TableCell>
                                                            <TableCell>{formatNum(row.cyl)}</TableCell>
                                                            <TableCell>{formatNum(row.axis)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                            <Typography fontWeight={700} sx={{ mb: 2 }}>
                                                ARE YOU SURE?
                                            </Typography>
                                            <Box sx={{ display: "flex", gap: 2 }}>
                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    sx={{ fontWeight: 700 }}
                                                    onClick={handleEdit}
                                                >
                                                    EDIT
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    sx={{
                                                        fontWeight: 700,
                                                        bgcolor: "#111827",
                                                        "&:hover": { bgcolor: "#0b1220" },
                                                    }}
                                                    onClick={handleYes}
                                                >
                                                    YES
                                                </Button>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: "auto" }}>
                                {selectedOption === null && (
                                    <PrescriptionModeSelector onSelect={setSelectedOption} />
                                )}
                                {selectedOption === "non-prescription" && (
                                    <NonPrescriptionLensPanel
                                        onAddToCart={handleNonPrescriptionAdd}
                                        onChangeOption={resetToOptionStep}
                                        disabled={!canAddToCart}
                                        submitting={nonRxSubmitting}
                                    />
                                )}
                                {selectedOption === "prescription" && !hasEnteredPrescriptionFlow && (
                                    <PrescriptionFlowEntryPanel
                                        onContinue={() => setHasEnteredPrescriptionFlow(true)}
                                        onChangeOption={resetToOptionStep}
                                        isPreOrder={isPreOrder}
                                    />
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
