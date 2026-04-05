import { useState, useMemo, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    Button,
    Box,
    Container,
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
import type { LensSelectionOption, LensUsagePick } from "../../../../lib/types/lensSelection";
import { LensUsageSelector } from "./lensSelection/LensUsageSelector";
import { NonPrescriptionLensPanel } from "./lensSelection/NonPrescriptionLensPanel";
import { PrescriptionFlowEntryPanel } from "./lensSelection/PrescriptionFlowEntryPanel";
import { SingleVisionPrescriptionPanel } from "./lensSelection/SingleVisionPrescriptionPanel";
import { LensProgressNav } from "./lensSelection/LensProgressNav";
import { LENS_WIZARD_STEPS } from "./lensSelection/lensFlowSteps";
import {
    LENS_FLOW_ACCENT,
    LENS_FLOW_ACCENT_HOVER,
    LENS_FLOW_DISABLED_FILL,
    LENS_FLOW_ON_ACCENT,
} from "./lensSelection/lensFlowTheme";
import {
    LENS_CONFIGURATOR_MAX_WIDTH_PX,
    lensEmbeddedGridSx,
} from "./lensSelection/lensConfiguratorLayout";

const INITIAL_DETAILS: PrescriptionDetailRow[] = [
    { eye: 1, sph: null, cyl: null, axis: null, pd: null, add: null },
    { eye: 2, sph: null, cyl: null, axis: null, pd: null, add: null },
];

type Step = "form" | "confirm";

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

const NAV_OFFSET_PT = "calc(56px + 24px)";

type Props = {
    open: boolean;
    onClose: () => void;
    fullPage?: boolean;
    /** When true, render as page content under the app NavBar (no fullscreen dialog). */
    embeddedInPage?: boolean;
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
    embeddedInPage,
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
    const [usagePick, setUsagePick] = useState<LensUsagePick | null>(null);
    const [rxUsageLabel, setRxUsageLabel] = useState("Single Vision");
    const [hasEnteredPrescriptionFlow, setHasEnteredPrescriptionFlow] = useState(false);
    const [nonRxSubmitting, setNonRxSubmitting] = useState(false);
    const [rxConfirming, setRxConfirming] = useState(false);

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
            setUsagePick(null);
            setHasEnteredPrescriptionFlow(false);
            setNonRxSubmitting(false);
            setRxConfirming(false);
            setStep("form");
            setRxUsageLabel("Single Vision");
            setDetails(INITIAL_DETAILS.map((d) => ({ ...d })));
            setPdSingle("");
            setPdLeft("");
            setPdRight("");
            setTwoPdNumbers(false);
        }
    }, [open]);

    const handleUsagePick = useCallback((pick: LensUsagePick) => {
        if (pick === "non-prescription") {
            setUsagePick(null);
            setSelectedOption("non-prescription");
            return;
        }
        setUsagePick(pick);
        setSelectedOption("prescription");
        const labels: Record<Exclude<LensUsagePick, "non-prescription">, string> = {
            "single-vision": "Single Vision",
            "bifocal-progressive": "Bifocal & Progressive",
            reading: "Reading",
        };
        setRxUsageLabel(labels[pick]);
    }, []);

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
        if (rxConfirming) return;
        setRxConfirming(true);
        try {
            const ok = await onPrescriptionConfirm(prescription);
            if (ok) onClose();
        } finally {
            setRxConfirming(false);
        }
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
        setUsagePick(null);
        setHasEnteredPrescriptionFlow(false);
        setStep("form");
        setRxUsageLabel("Single Vision");
    }, []);

    const formatNum = (n: number | null) =>
        n == null ? "—" : Number.isInteger(n) ? String(n) : n.toFixed(2);

    const usageLabel = rxUsageLabel;

    const rxTableCellSx = embeddedInPage
        ? {
              "& .MuiTableCell-head": {
                  bgcolor: "rgba(17,24,39,0.04)",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#374151",
                  borderBottom: "1px solid rgba(17,24,39,0.08)",
                  px: { xs: 2, md: 2.5 },
                  py: 2,
              },
              "& .MuiTableCell-body": {
                  borderBottom: "1px solid rgba(17,24,39,0.06)",
                  verticalAlign: "middle",
                  px: { xs: 2, md: 2.5 },
                  py: 2,
              },
          }
        : {
              "& .MuiTableCell-head": {
                  bgcolor: "rgba(17,24,39,0.04)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#374151",
                  borderBottom: "1px solid rgba(17,24,39,0.08)",
              },
              "& .MuiTableCell-body": {
                  borderBottom: "1px solid rgba(17,24,39,0.06)",
                  verticalAlign: "middle",
                  py: 1.5,
              },
          };

    const mainGrid = (
                <Box
                    sx={{
                        minHeight: embeddedInPage
                            ? "min(680px, calc(100vh - 56px - 100px))"
                            : fullPage
                              ? "100vh"
                              : 520,
                        width: "100%",
                        ...(embeddedInPage
                            ? lensEmbeddedGridSx
                            : {
                                  display: "flex",
                                  flexDirection: { xs: "column", md: "row" },
                                  boxSizing: "border-box",
                                  px: { xs: 2, md: 4 },
                                  py: { xs: 2, md: 3 },
                                  columnGap: { xs: 2, md: 6 },
                                  alignItems: "flex-start",
                              }),
                    }}
                >
                    <Box
                        sx={{
                            minWidth: 0,
                            width: "100%",
                            pr: embeddedInPage ? 0 : { xs: 0, md: 3 },
                            pl: 0,
                            py: 0,
                            borderRight: { md: "none" },
                            bgcolor: embeddedInPage ? "transparent" : "rgba(17,24,39,0.02)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "stretch",
                            ...(embeddedInPage
                                ? {
                                      position: { md: "sticky" },
                                      top: { md: 24 },
                                      alignSelf: "start",
                                  }
                                : {}),
                        }}
                    >
                        {!embeddedInPage && (
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
                        )}
                        {!embeddedInPage && (
                        <Typography
                            component="button"
                            type="button"
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
                                fontFamily: "inherit",
                                "&:hover": { textDecoration: "underline" },
                            }}
                        >
                            ← Back to Frame
                        </Typography>
                        )}
                        <Box
                            sx={
                                embeddedInPage
                                    ? {
                                          width: "100%",
                                          p: { xs: 2.5, md: 3 },
                                          borderRadius: 2,
                                          border: "1px solid rgba(17,24,39,0.08)",
                                          bgcolor: "rgba(17,24,39,0.03)",
                                      }
                                    : { width: "100%" }
                            }
                        >
                            <Box
                                component="img"
                                src={productImageUrl}
                                alt={productName}
                                sx={{
                                    width: "100%",
                                    maxWidth: embeddedInPage ? "100%" : 520,
                                    mx: "auto",
                                    display: "block",
                                    aspectRatio: "4/3",
                                    objectFit: "cover",
                                    borderRadius: 1.5,
                                    bgcolor: "#f3f4f6",
                                    mb: embeddedInPage ? 2.5 : 2,
                                }}
                            />
                            <Typography
                                fontWeight={900}
                                fontSize={embeddedInPage ? { xs: 22, md: 26 } : 22}
                                sx={{
                                    mt: 1,
                                    textAlign: embeddedInPage ? "left" : "center",
                                    letterSpacing: embeddedInPage ? "-0.02em" : undefined,
                                }}
                            >
                                {productName}
                            </Typography>
                            {variantLabel ? (
                                <Typography
                                    sx={{
                                        mt: 1,
                                        textAlign: embeddedInPage ? "left" : "center",
                                        fontSize: embeddedInPage ? { xs: 15, md: 16 } : 15,
                                        color: "text.secondary",
                                        fontWeight: 500,
                                    }}
                                >
                                    {variantLabel}
                                </Typography>
                            ) : null}
                            <Typography
                                fontWeight={800}
                                fontSize={embeddedInPage ? { xs: 20, md: 24 } : 24}
                                sx={{ mt: embeddedInPage ? 2.5 : 2, textAlign: embeddedInPage ? "left" : "center" }}
                            >
                                {embeddedInPage ? "Total: " : ""}${price.toFixed(2)}
                            </Typography>
                            {!embeddedInPage && (
                                <>
                                    <Typography fontSize={12} color="text.secondary" sx={{ textAlign: "center" }}>
                                        Price (USD)
                                    </Typography>
                                    <Typography
                                        fontSize={12}
                                        color="text.secondary"
                                        sx={{ mt: 2, textAlign: "center" }}
                                    >
                                        Shipping & handling calculated at checkout
                                    </Typography>
                                </>
                            )}
                            {embeddedInPage && (
                                <Typography
                                    fontSize={{ xs: 13, md: 14 }}
                                    color="text.secondary"
                                    sx={{ mt: 2, textAlign: "left", lineHeight: 1.55, maxWidth: 420 }}
                                >
                                    Shipping & handling calculated at checkout
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            flexBasis: embeddedInPage ? undefined : { xs: "auto", md: "55%" },
                            maxWidth: embeddedInPage ? undefined : { md: "55%" },
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "stretch",
                            minWidth: 0,
                            width: "100%",
                        }}
                    >
                        {showLegacyPrescriptionFlow ? (
                            <Box
                                sx={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    minWidth: 0,
                                    width: "100%",
                                    p: embeddedInPage ? { xs: 0, md: 0 } : { xs: 2, md: 3 },
                                    overflow: "auto",
                                }}
                            >
                                <Typography
                                    component="h2"
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: embeddedInPage
                                            ? { xs: 22, sm: 26, md: 28 }
                                            : { xs: 22, sm: 26 },
                                        textAlign: embeddedInPage ? "left" : "center",
                                        color: "#111827",
                                        letterSpacing: "-0.02em",
                                        mb: isPreOrder ? 1 : 0.5,
                                    }}
                                >
                                    Your Prescription
                                </Typography>
                                {isPreOrder ? (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: embeddedInPage ? "flex-start" : "center",
                                            mb: 2,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                height: 22,
                                                px: 1,
                                                borderRadius: 999,
                                                bgcolor: "#FEF3C7",
                                                border: "1px solid #FCD34D",
                                                color: "#92400E",
                                                fontSize: 11,
                                                fontWeight: 600,
                                            }}
                                        >
                                            Pre-Order
                                        </Box>
                                    </Box>
                                ) : (
                                    <Typography
                                        textAlign={embeddedInPage ? "left" : "center"}
                                        color="text.secondary"
                                        sx={{
                                            fontSize: embeddedInPage ? { xs: 14, md: 15 } : 14,
                                            mb: 2,
                                            maxWidth: embeddedInPage ? "none" : 420,
                                            mx: embeddedInPage ? 0 : "auto",
                                            lineHeight: 1.55,
                                        }}
                                    >
                                        Enter the values from your prescription below.
                                    </Typography>
                                )}
                                <Box
                                    sx={{
                                        mb: embeddedInPage ? 3.5 : 3,
                                        width: "100%",
                                        maxWidth: embeddedInPage ? "100%" : 480,
                                        mx: embeddedInPage ? 0 : "auto",
                                    }}
                                >
                                    <LensProgressNav
                                        steps={LENS_WIZARD_STEPS}
                                        currentStepIndex={1}
                                        railVariant="circles"
                                        onPrevious={
                                            step === "form"
                                                ? () => setHasEnteredPrescriptionFlow(false)
                                                : handleEdit
                                        }
                                    />
                                </Box>

                                {step === "form" && (
                                    <Box
                                        sx={{
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "stretch",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                border: "1px solid rgba(17,24,39,0.1)",
                                                borderRadius: 2,
                                                overflow: "hidden",
                                                bgcolor: "#fff",
                                                mb: 2,
                                                boxShadow: embeddedInPage
                                                    ? "0 1px 2px rgba(17,24,39,0.04)"
                                                    : undefined,
                                            }}
                                        >
                                            <Table size="small" sx={rxTableCellSx}>
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
                                                    <TableRow>
                                                        <TableCell
                                                            sx={{
                                                                fontWeight: 600,
                                                                verticalAlign: "top",
                                                            }}
                                                        >
                                                            <Typography component="span" sx={{ fontWeight: 600 }}>
                                                                <Typography component="span" color="error">
                                                                    *
                                                                </Typography>{" "}
                                                                PD (Pupillary Distance)
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell
                                                            colSpan={3}
                                                            sx={{
                                                                verticalAlign: "top",
                                                                ...(embeddedInPage
                                                                    ? { pt: 2.5, pb: 2.5 }
                                                                    : {}),
                                                            }}
                                                        >
                                                            <TextField
                                                                select
                                                                size="small"
                                                                placeholder="Enter your PD"
                                                                value={twoPdNumbers ? "" : pdSingle}
                                                                onChange={(e) => setPdSingle(e.target.value)}
                                                                disabled={twoPdNumbers}
                                                                sx={{ maxWidth: 220, mb: 1 }}
                                                                SelectProps={{
                                                                    displayEmpty: true,
                                                                    renderValue: (selected: unknown) =>
                                                                        selected === ""
                                                                            ? "Select PD"
                                                                            : (selected as string),
                                                                    MenuProps: {
                                                                        PaperProps: { sx: { maxHeight: 280 } },
                                                                    },
                                                                }}
                                                            >
                                                                <MenuItem value="">Select PD</MenuItem>
                                                                {PD_OPTIONS.map((opt) => (
                                                                    <MenuItem key={opt} value={opt}>
                                                                        {opt}
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={twoPdNumbers}
                                                                        onChange={(e) =>
                                                                            setTwoPdNumbers(e.target.checked)
                                                                        }
                                                                        sx={{
                                                                            color: LENS_FLOW_ACCENT,
                                                                            "&.Mui-checked": {
                                                                                color: LENS_FLOW_ACCENT,
                                                                            },
                                                                        }}
                                                                    />
                                                                }
                                                                label="I have 2 PD numbers."
                                                                sx={{ display: "block", mb: 1 }}
                                                            />
                                                            {twoPdNumbers ? (
                                                                <Box
                                                                    sx={{
                                                                        display: "flex",
                                                                        gap: 2,
                                                                        flexWrap: "wrap",
                                                                        mb: 1,
                                                                    }}
                                                                >
                                                                    <TextField
                                                                        select
                                                                        size="small"
                                                                        label="OD (Right)"
                                                                        value={pdRight}
                                                                        onChange={(e) =>
                                                                            setPdRight(e.target.value)
                                                                        }
                                                                        sx={{ flex: 1, minWidth: 120 }}
                                                                        SelectProps={{
                                                                            MenuProps: {
                                                                                PaperProps: {
                                                                                    sx: { maxHeight: 280 },
                                                                                },
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
                                                                        onChange={(e) =>
                                                                            setPdLeft(e.target.value)
                                                                        }
                                                                        sx={{ flex: 1, minWidth: 120 }}
                                                                        SelectProps={{
                                                                            MenuProps: {
                                                                                PaperProps: {
                                                                                    sx: { maxHeight: 280 },
                                                                                },
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
                                                            ) : null}
                                                            <Button
                                                                type="button"
                                                                variant="text"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                }}
                                                                sx={{
                                                                    color: LENS_FLOW_ACCENT,
                                                                    fontSize: 14,
                                                                    display: "block",
                                                                    px: 0,
                                                                    minWidth: 0,
                                                                    textTransform: "none",
                                                                    fontWeight: 600,
                                                                    "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                                                                }}
                                                            >
                                                                Help me find my PD
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </Box>
                                        <Button
                                            variant="contained"
                                            disabled={!isPrescriptionFormValid}
                                            fullWidth={embeddedInPage}
                                            sx={{
                                                alignSelf: embeddedInPage ? "stretch" : "flex-end",
                                                mt: embeddedInPage ? 2 : 1,
                                                width: embeddedInPage ? "100%" : "auto",
                                                px: 4,
                                                py: 1.25,
                                                fontWeight: 800,
                                                textTransform: "none",
                                                fontSize: 16,
                                                borderRadius: 1,
                                                bgcolor: LENS_FLOW_ACCENT,
                                                color: LENS_FLOW_ON_ACCENT,
                                                boxShadow: "none",
                                                "&:hover": {
                                                    bgcolor: LENS_FLOW_ACCENT_HOVER,
                                                    boxShadow: "none",
                                                },
                                                "&.Mui-disabled": {
                                                    bgcolor: LENS_FLOW_DISABLED_FILL,
                                                    color: LENS_FLOW_ON_ACCENT,
                                                },
                                            }}
                                            onClick={handleFormContinue}
                                        >
                                            Continue
                                        </Button>
                                    </Box>
                                )}

                                {step === "confirm" && (
                                    <Box sx={{ width: "100%" }}>
                                        <Typography
                                            textAlign={embeddedInPage ? "left" : "center"}
                                            color="text.secondary"
                                            sx={{
                                                fontSize: 14,
                                                mb: 2,
                                                maxWidth: embeddedInPage ? "none" : 440,
                                                mx: embeddedInPage ? 0 : "auto",
                                                lineHeight: 1.55,
                                            }}
                                        >
                                            Review your entries before confirming. Use the arrow above to edit the
                                            form.
                                        </Typography>
                                        <Typography
                                            fontWeight={600}
                                            sx={{ mb: 1, fontSize: embeddedInPage ? 15 : 14 }}
                                        >
                                            Type: {usageLabel}
                                        </Typography>
                                        <Typography
                                            fontSize={embeddedInPage ? 15 : 14}
                                            sx={{ mb: 2, color: "text.secondary" }}
                                        >
                                            PD:{" "}
                                            {twoPdNumbers
                                                ? `OD ${pdRight || "—"} / OS ${pdLeft || "—"}`
                                                : pdSingle || "—"}
                                        </Typography>
                                        <Box
                                            sx={{
                                                border: "1px solid rgba(17,24,39,0.1)",
                                                borderRadius: 2,
                                                overflow: "hidden",
                                                bgcolor: "#fff",
                                                mb: 3,
                                                boxShadow: embeddedInPage
                                                    ? "0 1px 2px rgba(17,24,39,0.04)"
                                                    : undefined,
                                            }}
                                        >
                                            <Table size="small" sx={rxTableCellSx}>
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
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: 2,
                                                width: "100%",
                                                flexDirection: embeddedInPage
                                                    ? { xs: "column", sm: "row" }
                                                    : "row",
                                                justifyContent: embeddedInPage ? "stretch" : "flex-end",
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <Button
                                                variant="outlined"
                                                onClick={handleEdit}
                                                sx={{
                                                    minWidth: embeddedInPage ? 0 : 140,
                                                    width: embeddedInPage ? { xs: "100%", sm: "auto" } : "auto",
                                                    flex: embeddedInPage ? { sm: 1 } : undefined,
                                                    fontWeight: 700,
                                                    textTransform: "none",
                                                    borderColor: "rgba(17,24,39,0.2)",
                                                    color: "#111827",
                                                    py: 1.25,
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="contained"
                                                disabled={rxConfirming}
                                                onClick={handleYes}
                                                sx={{
                                                    minWidth: embeddedInPage ? 0 : 160,
                                                    width: embeddedInPage ? { xs: "100%", sm: "auto" } : "auto",
                                                    flex: embeddedInPage ? { sm: 1 } : undefined,
                                                    fontWeight: 800,
                                                    textTransform: "none",
                                                    bgcolor: LENS_FLOW_ACCENT,
                                                    color: LENS_FLOW_ON_ACCENT,
                                                    boxShadow: "none",
                                                    py: 1.25,
                                                    "&:hover": {
                                                        bgcolor: LENS_FLOW_ACCENT_HOVER,
                                                        boxShadow: "none",
                                                    },
                                                }}
                                            >
                                                {rxConfirming ? "Adding…" : "Confirm"}
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    flex: 1,
                                    p: embeddedInPage ? { xs: 0, md: 0 } : { xs: 2, md: 3 },
                                    overflow: "auto",
                                    width: "100%",
                                    minWidth: 0,
                                }}
                            >
                                {selectedOption === null && (
                                    <LensUsageSelector
                                        onPick={handleUsagePick}
                                        embedConfiguratorLayout={embeddedInPage}
                                    />
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
                                    usagePick === "single-vision" ? (
                                        <SingleVisionPrescriptionPanel
                                            onBack={resetToOptionStep}
                                            onFillManually={() => setHasEnteredPrescriptionFlow(true)}
                                            embedConfiguratorLayout={embeddedInPage}
                                        />
                                    ) : (
                                        <PrescriptionFlowEntryPanel
                                            onContinue={() => setHasEnteredPrescriptionFlow(true)}
                                            onChangeOption={resetToOptionStep}
                                            isPreOrder={isPreOrder}
                                        />
                                    )
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>
    );

    if (embeddedInPage) {
        if (!open) return null;
        return (
            <Box
                component="main"
                sx={{
                    bgcolor: "#fff",
                    minHeight: "calc(100vh - 56px)",
                }}
            >
                <Container
                    maxWidth={false}
                    sx={{
                        maxWidth: LENS_CONFIGURATOR_MAX_WIDTH_PX,
                        mx: "auto",
                        px: { xs: 2, sm: 3, md: 4 },
                        pt: NAV_OFFSET_PT,
                        pb: { xs: 4, md: 6 },
                    }}
                >
                    <Typography
                        component="button"
                        type="button"
                        onClick={onClose}
                        sx={{
                            display: "block",
                            mb: { xs: 2, md: 3 },
                            color: "#111827",
                            fontSize: { xs: 14, md: 15 },
                            fontWeight: 600,
                            cursor: "pointer",
                            border: "none",
                            background: "none",
                            textAlign: "left",
                            fontFamily: "inherit",
                            "&:hover": { textDecoration: "underline", color: LENS_FLOW_ACCENT },
                            "&:focus-visible": {
                                outline: `2px solid ${LENS_FLOW_ACCENT}`,
                                outlineOffset: 2,
                            },
                        }}
                    >
                        {"< Back to Frame Description"}
                    </Typography>
                    {mainGrid}
                </Container>
            </Box>
        );
    }

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
            <DialogContent sx={{ p: 0, overflow: "hidden" }}>{mainGrid}</DialogContent>
        </Dialog>
    );
}
