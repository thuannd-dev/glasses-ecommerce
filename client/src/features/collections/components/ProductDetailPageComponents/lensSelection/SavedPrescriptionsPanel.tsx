import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
    useFetchMyPrescriptionDetail,
    useMyPrescriptionDetailsByIdMap,
    useMyPrescriptions,
} from "../../../../../lib/hooks/useMyPrescriptions";
import type { MyPrescriptionDto } from "../../../../../lib/types/myPrescriptions";
import { mapMyPrescriptionToFormSeed } from "../../../../../lib/utils/mapMyPrescriptionToFormSeed";
import type { PrescriptionFormOcrSeed } from "../../../../../lib/utils/mapPrescriptionOcrToFormSeed";
import { isPositiveAdd } from "../../../../../lib/utils/rxAdd";
import { LENS_FLOW_ACCENT, LENS_FLOW_ACCENT_HOVER, LENS_FLOW_ON_ACCENT } from "./lensFlowTheme";

type Props = {
    onBack: () => void;
    onPrescriptionLoaded: (seed: PrescriptionFormOcrSeed) => void;
    embedConfiguratorLayout?: boolean;
};

function formatRx(n: number | null | undefined): string {
    if (n == null) return "—";
    return Number.isInteger(n) ? String(n) : Number(n).toFixed(2);
}

function PrescriptionValuesTable({ detail }: { detail: MyPrescriptionDto }) {
    const rows = detail.details ?? [];
    return (
        <TableContainer sx={{ width: "100%", color: "#111827" }}>
            <Table
                size="small"
                sx={{
                    "& td, & th": { py: 0.75, px: 1.25, fontSize: 13, color: "#111827", borderColor: "rgba(17,24,39,0.12)" },
                }}
            >
                <TableHead>
                    <TableRow sx={{ bgcolor: "rgba(17,24,39,0.04)" }}>
                        <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: 12 }}>Eye</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: 12 }}>SPH</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: 12 }}>CYL</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: 12 }}>Axis</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: 12 }}>PD</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: 12 }}>ADD</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} sx={{ color: "#6b7280", fontSize: 13 }}>
                                No rows in this prescription.
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((r) => (
                            <TableRow key={r.id || `${r.eye}-${r.sph}`}>
                                <TableCell sx={{ fontWeight: 600 }}>{r.eye ?? "—"}</TableCell>
                                <TableCell>{formatRx(r.sph)}</TableCell>
                                <TableCell>{formatRx(r.cyl)}</TableCell>
                                <TableCell>{formatRx(r.axis)}</TableCell>
                                <TableCell>{formatRx(r.pd)}</TableCell>
                                <TableCell>{isPositiveAdd(r.add) ? formatRx(r.add) : "—"}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export function SavedPrescriptionsPanel({ onBack, onPrescriptionLoaded, embedConfiguratorLayout }: Props) {
    const page = Boolean(embedConfiguratorLayout);
    const { data, isLoading, isError } = useMyPrescriptions({ pageNumber: 1, pageSize: 50 });
    const fetchDetail = useFetchMyPrescriptionDetail();
    const [selectingId, setSelectingId] = useState<string | null>(null);

    const items = data?.items ?? [];
    const ids = useMemo(
        () => (data?.items ?? []).map((i) => i.id).filter(Boolean),
        [data?.items],
    );
    const { data: detailsById, isPending: detailsPending, isError: detailsError } = useMyPrescriptionDetailsByIdMap(ids);

    const handleUse = async (id: string) => {
        const cached = detailsById?.[id];
        if (cached) {
            onPrescriptionLoaded(mapMyPrescriptionToFormSeed(cached));
            toast.success("Saved prescription loaded — please review.");
            return;
        }
        setSelectingId(id);
        try {
            const dto = await fetchDetail.mutateAsync(id);
            onPrescriptionLoaded(mapMyPrescriptionToFormSeed(dto));
            toast.success("Saved prescription loaded — please review.");
        } catch {
            toast.error("Could not load this prescription. Try again or enter details manually.");
        } finally {
            setSelectingId(null);
        }
    };

    return (
        <Box sx={{ width: "100%", maxWidth: page ? "100%" : { xs: "100%", sm: 640 }, mx: page ? 0 : "auto" }}>
            <Typography
                component="h3"
                sx={{
                    fontWeight: 800,
                    fontSize: { xs: 18, sm: 20 },
                    color: "#111827",
                    mb: 0.5,
                }}
            >
                Your saved prescriptions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.55 }}>
                From orders you already placed with us. Review SPH, CYL, Axis, PD, ADD below, then tap{" "}
                <Box component="span" sx={{ fontWeight: 700, color: "#374151" }}>
                    Use this prescription
                </Box>{" "}
                to copy into the form (you can still edit before confirming).
            </Typography>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                    <CircularProgress size={32} />
                </Box>
            ) : isError ? (
                <Typography color="error" sx={{ fontSize: 14 }}>
                    Could not load your prescriptions. Sign in and try again.
                </Typography>
            ) : items.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid rgba(17,24,39,0.12)",
                        bgcolor: "#fafafa",
                    }}
                >
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        No saved prescriptions yet. After you place an order with a prescription, it will appear here.
                    </Typography>
                </Paper>
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        maxHeight: { xs: 480, sm: 560 },
                        overflowY: "auto",
                        pr: 0.5,
                    }}
                >
                    {detailsError && (
                        <Typography color="error" sx={{ fontSize: 13 }}>
                            Some prescription details could not be loaded. You can still try &quot;Use this prescription&quot;
                            — we will fetch again.
                        </Typography>
                    )}
                    {items.map((row) => {
                        const dto = detailsById?.[row.id];
                        const rowLoading = detailsPending && !detailsById;
                        const rowMissing = !detailsPending && detailsById && !dto;
                        const useBusy = selectingId === row.id && fetchDetail.isPending;

                        return (
                            <Paper
                                key={row.id}
                                elevation={0}
                                sx={{
                                    borderRadius: 2,
                                    border: "1px solid rgba(17,24,39,0.12)",
                                    overflow: "visible",
                                    bgcolor: "#fff",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 1.5,
                                        px: 2,
                                        py: 1.25,
                                        bgcolor: "#f9fafb",
                                        borderBottom: "1px solid rgba(17,24,39,0.08)",
                                    }}
                                >
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                                            {new Date(row.createdAt).toLocaleString()}
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: "block", color: "#6b7280" }}>
                                            {row.orderType ?? "Order"} · {row.isVerified ? "Verified" : "Not verified"} ·{" "}
                                            {row.detailCount} eye row{row.detailCount !== 1 ? "s" : ""}
                                        </Typography>
                                    </Box>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        disabled={rowLoading || useBusy || fetchDetail.isPending}
                                        onClick={() => void handleUse(row.id)}
                                        sx={{
                                            textTransform: "none",
                                            fontWeight: 700,
                                            fontSize: 13,
                                            bgcolor: LENS_FLOW_ACCENT,
                                            color: LENS_FLOW_ON_ACCENT,
                                            boxShadow: "none",
                                            "&:hover": { bgcolor: LENS_FLOW_ACCENT_HOVER, boxShadow: "none" },
                                        }}
                                    >
                                        {useBusy ? (
                                            <CircularProgress size={18} sx={{ color: LENS_FLOW_ON_ACCENT }} />
                                        ) : (
                                            "Use this prescription"
                                        )}
                                    </Button>
                                </Box>

                                <Box sx={{ px: 0, py: 1.5, minHeight: 56, bgcolor: "#fff" }}>
                                    {rowLoading ? (
                                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, py: 1 }}>
                                            <CircularProgress size={22} sx={{ color: LENS_FLOW_ACCENT }} />
                                            <Typography sx={{ fontSize: 13, color: "#6b7280" }}>Loading prescription…</Typography>
                                        </Box>
                                    ) : rowMissing ? (
                                        <Typography color="error" sx={{ fontSize: 13, px: 2 }}>
                                            Could not load details for this row.
                                        </Typography>
                                    ) : dto ? (
                                        <PrescriptionValuesTable detail={dto} />
                                    ) : (
                                        <Typography sx={{ fontSize: 13, px: 2, color: "#6b7280" }}>
                                            No prescription data loaded.
                                        </Typography>
                                    )}
                                </Box>
                            </Paper>
                        );
                    })}
                </Box>
            )}

            <Button
                fullWidth
                variant="outlined"
                onClick={onBack}
                sx={{ mt: 2, textTransform: "none", fontWeight: 700, borderColor: "rgba(17,24,39,0.2)", color: "#374151" }}
            >
                Back
            </Button>
        </Box>
    );
}
