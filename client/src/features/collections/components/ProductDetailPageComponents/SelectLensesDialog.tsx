import { useState, useMemo, useEffect } from "react";
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
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import type { PrescriptionData, PrescriptionDetailRow } from "../../../../lib/types/prescription";
import { EYE_LABELS } from "../../../../lib/types/prescription";

const INITIAL_DETAILS: PrescriptionDetailRow[] = [
    { eye: 1, sph: null, cyl: null, axis: null, pd: null, add: null },
    { eye: 2, sph: null, cyl: null, axis: null, pd: null, add: null },
];

type Step = "usage" | "form" | "confirm";
type UsageType = "single_vision" | "non_prescription";

const USAGE_OPTIONS: { id: UsageType; label: string; description: string; Icon: React.ElementType }[] = [
    { id: "single_vision", label: "Single Vision", description: "Corrects for one distance (near or far). The most common prescription.", Icon: VisibilityOutlinedIcon },
    { id: "non_prescription", label: "Non-prescription", description: "Style and protection.", Icon: RemoveCircleOutlineIcon },
];

const STEP_LABELS: { key: Step | "lens" | "addons"; label: string }[] = [
    { key: "usage", label: "Usage" },
    { key: "form", label: "Prescription" },
    { key: "lens", label: "Lens" },
    { key: "addons", label: "Add-Ons" },
];

// SPH: -20.00 to +12.00 step 0.25 (giống hình 1)
function buildSphOptions(): string[] {
    const out: string[] = [];
    for (let i = -80; i <= 48; i++) {
        out.push((i * 0.25).toFixed(2));
    }
    return out;
}
// CYL: -6.00 to +6.00 step 0.25 (giống hình 2)
function buildCylOptions(): string[] {
    const out: string[] = [];
    for (let i = -24; i <= 24; i++) {
        out.push((i * 0.25).toFixed(2));
    }
    return out;
}
// Axis: 0 to 180 (sau khi chọn SPH/CYL)
const AXIS_OPTIONS = Array.from({ length: 181 }, (_, i) => String(i));
// PD: 53 to 180
const PD_OPTIONS = Array.from({ length: 128 }, (_, i) => String(i + 53));

const SPH_OPTIONS = buildSphOptions();
const CYL_OPTIONS = buildCylOptions();

type Props = {
    open: boolean;
    onClose: () => void;
    productName: string;
    variantLabel: string;
    productImageUrl: string;
    price: number;
    onNonPrescription: () => void;
    onPrescriptionConfirm: (prescription: PrescriptionData) => void;
};

export function SelectLensesDialog({
    open,
    onClose,
    productName,
    variantLabel,
    productImageUrl,
    price,
    onNonPrescription,
    onPrescriptionConfirm,
}: Props) {
    const [step, setStep] = useState<Step>("usage");
    const [usageType, setUsageType] = useState<UsageType | null>(null);
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
            setStep("usage");
            setUsageType(null);
            setDetails(INITIAL_DETAILS.map((d) => ({ ...d })));
            setPdSingle("");
            setPdLeft("");
            setPdRight("");
            setTwoPdNumbers(false);
        }
    }, [open]);

    const updateDetail = (eye: 1 | 2, field: keyof PrescriptionDetailRow, value: number | null) => {
        setDetails((prev) =>
            prev.map((row) =>
                row.eye === eye ? { ...row, [field]: value } : row
            )
        );
    };

    const handleUsageContinue = () => {
        if (usageType === "non_prescription") {
            onNonPrescription();
            onClose();
            return;
        }
        setStep("form");
    };

    const isPrescriptionFormValid = useMemo(() => {
        const bothEyesFilled = details.every(
            (row) => row.sph != null && row.cyl != null && row.axis != null
        );
        const pdFilled = twoPdNumbers
            ? pdRight !== "" && pdLeft !== ""
            : pdSingle !== "";
        return bothEyesFilled && pdFilled;
    }, [details, twoPdNumbers, pdSingle, pdRight, pdLeft]);

    const handleContinue = () => setStep("confirm");
    const handleEdit = () => setStep("form");
    const handleYes = () => {
        onPrescriptionConfirm(prescription);
        onClose();
    };

    const formatNum = (n: number | null) =>
        n == null ? "—" : Number.isInteger(n) ? String(n) : n.toFixed(2);

    const usageLabel = usageType ? USAGE_OPTIONS.find((o) => o.id === usageType)?.label ?? "Single Vision" : "Single Vision";

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogContent sx={{ p: 0, overflow: "hidden" }}>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: 480 }}>
                    {/* Left: Product */}
                    <Box
                        sx={{
                            width: { md: 340 },
                            flexShrink: 0,
                            p: 3,
                            borderRight: { md: "1px solid rgba(17,24,39,0.1)" },
                            bgcolor: "rgba(17,24,39,0.02)",
                        }}
                    >
                        <Typography
                            component="button"
                            onClick={onClose}
                            sx={{
                                display: "block",
                                mb: 2,
                                color: "primary.main",
                                fontSize: 14,
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
                                aspectRatio: "4/3",
                                objectFit: "cover",
                                borderRadius: 2,
                                bgcolor: "#f3f4f6",
                                mb: 2,
                            }}
                        />
                        <Typography fontWeight={900} fontSize={18}>
                            {productName}
                        </Typography>
                        <Typography fontSize={14} color="text.secondary" sx={{ mt: 0.5 }}>
                            {variantLabel}
                        </Typography>
                        <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5 }}>
                            Show details ⌄
                        </Typography>
                        <Typography fontWeight={900} fontSize={20} sx={{ mt: 2 }}>
                            ${price.toFixed(2)}
                        </Typography>
                        <Typography fontSize={12} color="text.secondary">
                            Price (USD)
                        </Typography>
                        <Typography fontSize={12} color="text.secondary" sx={{ mt: 2 }}>
                            Shipping & handling calculated at checkout
                        </Typography>
                    </Box>

                    {/* Right: Steps + content */}
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                        {/* Step tabs */}
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
                                    (key === "usage" && step === "usage") ||
                                    (key === "form" && (step === "form" || step === "confirm")) ||
                                    false;
                                const isDisabled = key === "lens" || key === "addons";
                                return (
                                    <Typography
                                        key={key}
                                        component="button"
                                        type="button"
                                        onClick={() => !isDisabled && (key === "usage" ? setStep("usage") : key === "form" ? setStep("form") : null)}
                                        sx={{
                                            border: "none",
                                            background: "none",
                                            cursor: isDisabled ? "default" : "pointer",
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: isDisabled ? "text.disabled" : isActive ? "#111827" : "text.secondary",
                                            borderBottom: isActive ? "2px solid #111827" : "2px solid transparent",
                                            pb: 0.5,
                                            "&:hover": isDisabled ? {} : { color: "#111827" },
                                        }}
                                    >
                                        {label}
                                    </Typography>
                                );
                            })}
                        </Box>

                        <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
                            {/* Step: Usage */}
                            {step === "usage" && (
                                <>
                                    <Typography fontWeight={900} fontSize={20} sx={{ mb: 2 }}>
                                        How will you use your glasses?
                                    </Typography>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                        {USAGE_OPTIONS.map((opt) => {
                                            const selected = usageType === opt.id;
                                            const Icon = opt.Icon;
                                            return (
                                                <Box
                                                    key={opt.id}
                                                    onClick={() => setUsageType(opt.id)}
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "flex-start",
                                                        gap: 2,
                                                        p: 2,
                                                        borderRadius: 2,
                                                        border: selected ? "2px solid #111827" : "1px solid rgba(17,24,39,0.12)",
                                                        bgcolor: selected ? "rgba(17,24,39,0.04)" : "transparent",
                                                        cursor: "pointer",
                                                        "&:hover": { bgcolor: "rgba(17,24,39,0.04)" },
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 44,
                                                            height: 44,
                                                            borderRadius: 2,
                                                            bgcolor: "rgba(17,24,39,0.08)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <Icon sx={{ fontSize: 26, color: "text.secondary" }} />
                                                    </Box>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography fontWeight={700}>{opt.label}</Typography>
                                                        <Typography fontSize={14} color="text.secondary">
                                                            {opt.description}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                    <Button
                                        variant="contained"
                                        disabled={!usageType}
                                        onClick={handleUsageContinue}
                                        sx={{
                                            mt: 3,
                                            py: 1.2,
                                            px: 3,
                                            fontWeight: 900,
                                            bgcolor: "#111827",
                                            "&:hover": { bgcolor: "#0b1220" },
                                        }}
                                    >
                                        Continue &gt;
                                    </Button>
                                </>
                            )}

                            {/* Step: Prescription form */}
                            {step === "form" && (
                                <Box>
                                    <Typography
                                        component="button"
                                        onClick={() => setStep("usage")}
                                        sx={{
                                            display: "block",
                                            mb: 2,
                                            color: "primary.main",
                                            fontSize: 14,
                                            cursor: "pointer",
                                            border: "none",
                                            background: "none",
                                            "&:hover": { textDecoration: "underline" },
                                        }}
                                    >
                                        ← Previous Step
                                    </Typography>
                                    <Typography fontWeight={700} sx={{ mb: 2 }}>
                                        Fill in your prescription details
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
                                            {details.map((row) => (
                                                <TableRow key={row.eye}>
                                                    <TableCell sx={{ fontWeight: 600 }}>{EYE_LABELS[row.eye]}</TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            select
                                                            size="small"
                                                            value={row.sph != null ? row.sph.toFixed(2) : "0.00"}
                                                            onChange={(e) =>
                                                                updateDetail(row.eye, "sph", parseFloat(e.target.value))
                                                            }
                                                            sx={{ minWidth: 100 }}
                                                            SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 280 } } } }}
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
                                                            value={row.cyl != null ? row.cyl.toFixed(2) : "0.00"}
                                                            onChange={(e) =>
                                                                updateDetail(row.eye, "cyl", parseFloat(e.target.value))
                                                            }
                                                            sx={{ minWidth: 100 }}
                                                            SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 280 } } } }}
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
                                                            value={row.axis != null ? String(row.axis) : "0"}
                                                            onChange={(e) =>
                                                                updateDetail(row.eye, "axis", parseInt(e.target.value, 10))
                                                            }
                                                            disabled={row.sph == null || row.cyl == null}
                                                            sx={{ minWidth: 72 }}
                                                            SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 280 } } } }}
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
                                        PD (Pupillary Distance) <Typography component="span" color="error">*</Typography>
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
                                            renderValue: (v) => (v === "" ? "Select PD" : v),
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
                                                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 280 } } } }}
                                            >
                                                {PD_OPTIONS.map((opt) => (
                                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                                ))}
                                            </TextField>
                                            <TextField
                                                select
                                                size="small"
                                                label="OS (Left)"
                                                value={pdLeft}
                                                onChange={(e) => setPdLeft(e.target.value)}
                                                sx={{ flex: 1 }}
                                                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 280 } } } }}
                                            >
                                                {PD_OPTIONS.map((opt) => (
                                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                                ))}
                                            </TextField>
                                        </Box>
                                    )}
                                    <Typography component="a" href="#" sx={{ color: "primary.main", fontSize: 14, display: "block", mt: 1 }}>
                                        Help me find my PD
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        disabled={!isPrescriptionFormValid}
                                        sx={{ mt: 3, py: 1.2, fontWeight: 900, bgcolor: "#111827", "&:hover": { bgcolor: "#0b1220" } }}
                                        onClick={handleContinue}
                                    >
                                        Continue
                                    </Button>
                                </Box>
                            )}

                            {/* Step: Confirm */}
                            {step === "confirm" && (
                                <Box>
                                    <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                                        <Box
                                            component="img"
                                            src={productImageUrl}
                                            alt={productName}
                                            sx={{ width: 100, height: 80, objectFit: "cover", borderRadius: 1 }}
                                        />
                                        <Box>
                                            <Typography fontWeight={900}>{productName}</Typography>
                                            <Typography fontSize={14} color="text.secondary">{variantLabel}</Typography>
                                            <Typography fontWeight={700}>${price.toFixed(2)}</Typography>
                                        </Box>
                                    </Box>
                                    <Typography fontWeight={900} sx={{ mb: 1 }}>Confirm Your Prescription</Typography>
                                    <Typography fontSize={14} color="text.secondary" sx={{ mb: 2 }}>
                                        Make sure your prescription matches the information below. To edit, go back.
                                    </Typography>
                                    <Typography fontWeight={600} sx={{ mb: 1 }}>Prescription: {usageLabel}</Typography>
                                    <Typography fontSize={14} sx={{ mb: 2 }}>
                                        PD: {twoPdNumbers ? `OD ${pdRight || "—"} / OS ${pdLeft || "—"}` : pdSingle || "—"}
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
                                                    <TableCell sx={{ fontWeight: 600 }}>{EYE_LABELS[row.eye]}</TableCell>
                                                    <TableCell>{formatNum(row.sph)}</TableCell>
                                                    <TableCell>{formatNum(row.cyl)}</TableCell>
                                                    <TableCell>{formatNum(row.axis)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <Typography fontWeight={700} sx={{ mb: 2 }}>ARE YOU SURE?</Typography>
                                    <Box sx={{ display: "flex", gap: 2 }}>
                                        <Button variant="outlined" fullWidth sx={{ fontWeight: 700 }} onClick={handleEdit}>
                                            EDIT
                                        </Button>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            sx={{ fontWeight: 700, bgcolor: "#111827", "&:hover": { bgcolor: "#0b1220" } }}
                                            onClick={handleYes}
                                        >
                                            YES
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
