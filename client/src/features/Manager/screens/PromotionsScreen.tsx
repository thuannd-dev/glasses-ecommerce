import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";

import {
  useManagerPromotions,
  useManagerPromotionDetail,
  PromotionType,
  PROMOTION_TYPE_LABELS,
} from "../../../lib/hooks/useManagerPromotions";
import type {
  CreatePromotionDto,
  UpdatePromotionDto,
  PromotionListItem,
} from "../../../lib/hooks/useManagerPromotions";

// ── Helpers ──
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString();
const fmtDiscount = (type: string, value: number) => {
  if (type === PromotionType.Percentage) return `${value}%`;
  if (type === PromotionType.FixedAmount) return `$${value.toLocaleString()}`;
  return "Free Shipping";
};
const toLocalDatetimeInput = (iso: string) => {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60_000);
  return local.toISOString().slice(0, 16);
};

// ── Constants ──
const TYPE_OPTIONS = [
  { value: "", label: "All" },
  { value: "0", label: "Percentage" },
  { value: "1", label: "Fixed Amount" },
  { value: "2", label: "Free Shipping" },
];

const ACTIVE_OPTIONS = [
  { value: "", label: "All" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

// ── Create / Edit form state ──
interface PromotionFormState {
  promoCode: string;
  promoName: string;
  description: string;
  promotionType: string;
  discountValue: string;
  maxDiscountValue: string;
  usageLimit: string;
  usageLimitPerCustomer: string;
  validFrom: string;
  validTo: string;
  isPublic: boolean;
  isActive: boolean;
}

const emptyForm: PromotionFormState = {
  promoCode: "",
  promoName: "",
  description: "",
  promotionType: PromotionType.Percentage as string,
  discountValue: "",
  maxDiscountValue: "",
  usageLimit: "",
  usageLimitPerCustomer: "",
  validFrom: "",
  validTo: "",
  isPublic: false,
  isActive: true,
};

// ── Component ──
export default function PromotionsScreen() {
  // ── List state ──
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const params = useMemo(() => {
    const p: Record<string, unknown> = { pageNumber, pageSize };
    if (typeFilter !== "") p.promotionType = Number(typeFilter);
    if (activeFilter !== "") p.isActive = activeFilter === "true";
    return p;
  }, [pageNumber, pageSize, typeFilter, activeFilter]);

  const {
    promotions,
    totalCount,
    totalPages,
    isLoading,
    isFetching,
    error,
    refetch,
    createPromotion,
    isCreating,
    updatePromotion,
    isUpdating,
    deactivatePromotion,
    isDeactivating,
  } = useManagerPromotions(params as any);

  // ── Search / sort (client-side on current page) ──
  const [sortBy, setSortBy] = useState<"validFrom" | "promoCode" | "usedCount">("validFrom");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const visibleItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let result: PromotionListItem[] = promotions;
    if (term) {
      result = result.filter((p) =>
        [p.promoCode, p.promoName, PROMOTION_TYPE_LABELS[p.promotionType] ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "validFrom") cmp = new Date(a.validFrom).getTime() - new Date(b.validFrom).getTime();
      else if (sortBy === "promoCode") cmp = a.promoCode.localeCompare(b.promoCode);
      else cmp = a.usedCount - b.usedCount;
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return result;
  }, [promotions, searchTerm, sortBy, sortOrder]);

  // ── Create dialog ──
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<PromotionFormState>({ ...emptyForm });
  const [touchedCreate, setTouchedCreate] = useState<Record<string, boolean>>({});
  const touchCreateField = (f: string) => setTouchedCreate((p) => ({ ...p, [f]: true }));

  const openCreate = useCallback(() => {
    setForm({ ...emptyForm });
    setTouchedCreate({});
    setCreateOpen(true);
  }, []);

  const createErrors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.promoCode.trim()) e.promoCode = "Promo code is required";
    else if (form.promoCode.trim().length < 3) e.promoCode = "Min 3 characters";
    else if (!/^[A-Za-z0-9\-]+$/.test(form.promoCode.trim())) e.promoCode = "Only letters, digits, hyphens";
    if (!form.promoName.trim()) e.promoName = "Promo name is required";
    if (!form.discountValue && form.promotionType !== PromotionType.FreeShipping) e.discountValue = "Required";
    if (form.promotionType === PromotionType.Percentage) {
      const v = Number(form.discountValue);
      if (v <= 0 || v > 100) e.discountValue = "Must be 1–100";
    }
    if (form.promotionType === PromotionType.FixedAmount) {
      if (Number(form.discountValue) <= 0) e.discountValue = "Must be > 0";
    }
    if (!form.validFrom) e.validFrom = "Required";
    if (!form.validTo) e.validTo = "Required";
    if (form.validFrom && form.validTo && new Date(form.validTo) <= new Date(form.validFrom))
      e.validTo = "Must be after Valid From";
    if (form.usageLimit && form.usageLimitPerCustomer && Number(form.usageLimitPerCustomer) > Number(form.usageLimit))
      e.usageLimitPerCustomer = "Cannot exceed total usage limit";
    return e;
  }, [form]);

  const handleCreate = async () => {
    setTouchedCreate({ promoCode: true, promoName: true, discountValue: true, validFrom: true, validTo: true });
    if (Object.keys(createErrors).length > 0) {
      toast.error("Please fix validation errors");
      return;
    }
    try {
      const dto: CreatePromotionDto = {
        promoCode: form.promoCode.trim(),
        promoName: form.promoName.trim(),
        description: form.description.trim() || null,
        promotionType: form.promotionType,
        discountValue: form.promotionType === PromotionType.FreeShipping ? 0 : Number(form.discountValue),
        maxDiscountValue: form.maxDiscountValue ? Number(form.maxDiscountValue) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        usageLimitPerCustomer: form.usageLimitPerCustomer ? Number(form.usageLimitPerCustomer) : null,
        validFrom: new Date(form.validFrom).toISOString(),
        validTo: new Date(form.validTo).toISOString(),
        isPublic: form.isPublic,
      };
      await createPromotion(dto);
      toast.success("Promotion created");
      setCreateOpen(false);
    } catch (err: any) {
      const msg = Array.isArray(err) ? err.join(", ") : err?.response?.data ?? err?.message ?? "Failed to create";
      toast.error(String(msg));
    }
  };

  // ── Edit dialog ──
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [editForm, setEditForm] = useState<PromotionFormState>({ ...emptyForm });
  const [touchedEdit, setTouchedEdit] = useState<Record<string, boolean>>({});
  const touchEditField = (f: string) => setTouchedEdit((p) => ({ ...p, [f]: true }));

  const { data: editDetail, isLoading: isLoadingDetail } = useManagerPromotionDetail(editId);

  const openEdit = useCallback((item: PromotionListItem) => {
    setEditId(item.id);
    setTouchedEdit({});
    // Pre-populate from list data immediately so form is never empty
    setEditForm({
      promoCode: item.promoCode,
      promoName: item.promoName,
      description: "",
      promotionType: item.promotionType,
      discountValue: String(item.discountValue),
      maxDiscountValue: item.maxDiscountValue != null ? String(item.maxDiscountValue) : "",
      usageLimit: "",
      usageLimitPerCustomer: "",
      validFrom: toLocalDatetimeInput(item.validFrom),
      validTo: toLocalDatetimeInput(item.validTo),
      isPublic: item.isPublic,
      isActive: item.isActive,
    });
    setEditOpen(true);
  }, []);

  // Sync editForm when detail loads (detail has extra fields like description, usageLimit)
  useEffect(() => {
    if (editDetail && editOpen) {
      setEditForm({
        promoCode: editDetail.promoCode,
        promoName: editDetail.promoName,
        description: editDetail.description ?? "",
        promotionType: editDetail.promotionType,
        discountValue: String(editDetail.discountValue),
        maxDiscountValue: editDetail.maxDiscountValue != null ? String(editDetail.maxDiscountValue) : "",
        usageLimit: editDetail.usageLimit != null ? String(editDetail.usageLimit) : "",
        usageLimitPerCustomer: editDetail.usageLimitPerCustomer != null ? String(editDetail.usageLimitPerCustomer) : "",
        validFrom: toLocalDatetimeInput(editDetail.validFrom),
        validTo: toLocalDatetimeInput(editDetail.validTo),
        isPublic: editDetail.isPublic,
        isActive: editDetail.isActive,
      });
    }
  }, [editDetail, editOpen]);

  const editErrors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!editForm.promoName.trim()) e.promoName = "Promo name is required";
    if (!editForm.validFrom) e.validFrom = "Required";
    if (!editForm.validTo) e.validTo = "Required";
    if (editForm.validFrom && editForm.validTo && new Date(editForm.validTo) <= new Date(editForm.validFrom))
      e.validTo = "Must be after Valid From";
    if (editForm.usageLimit && editForm.usageLimitPerCustomer && Number(editForm.usageLimitPerCustomer) > Number(editForm.usageLimit))
      e.usageLimitPerCustomer = "Cannot exceed total usage limit";
    return e;
  }, [editForm]);

  const handleUpdate = async () => {
    setTouchedEdit({ promoName: true, validFrom: true, validTo: true });
    if (Object.keys(editErrors).length > 0) {
      toast.error("Please fix validation errors");
      return;
    }
    try {
      const dto: UpdatePromotionDto = {
        promoName: editForm.promoName.trim(),
        description: editForm.description.trim() || null,
        maxDiscountValue: editForm.maxDiscountValue ? Number(editForm.maxDiscountValue) : null,
        usageLimit: editForm.usageLimit ? Number(editForm.usageLimit) : null,
        usageLimitPerCustomer: editForm.usageLimitPerCustomer ? Number(editForm.usageLimitPerCustomer) : null,
        validFrom: new Date(editForm.validFrom).toISOString(),
        validTo: new Date(editForm.validTo).toISOString(),
        isActive: editForm.isActive,
        isPublic: editForm.isPublic,
      };
      await updatePromotion({ id: editId!, dto });
      toast.success("Promotion updated");
      setEditOpen(false);
      setEditId(undefined);
    } catch (err: any) {
      const msg = Array.isArray(err) ? err.join(", ") : err?.response?.data ?? err?.message ?? "Failed to update";
      toast.error(String(msg));
    }
  };

  // ── Deactivate ──
  const handleDeactivate = async (id: string) => {
    try {
      await deactivatePromotion(id);
      toast.success("Promotion deactivated");
    } catch (err: any) {
      const msg = Array.isArray(err) ? err.join(", ") : err?.response?.data ?? err?.message ?? "Failed to deactivate";
      toast.error(String(msg));
    }
  };

  // ── Reset ──
  const resetFilters = () => {
    setPageNumber(1);
    setPageSize(10);
    setTypeFilter("");
    setActiveFilter("");
    setSearchTerm("");
    setSortBy("validFrom");
    setSortOrder("desc");
    toast.info("Filters reset");
  };

  // ── Helper: error display ──
  const fieldErr = (touched: Record<string, boolean>, errors: Record<string, string>, field: string) =>
    touched[field] && errors[field] ? errors[field] : undefined;

  // ── Render ──
  return (
    <Box sx={{ px: { xs: 2, md: 4, lg: 6 }, py: 4 }}>
      {/* Header */}
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
        <Box>
          <Typography sx={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "#8A8A8A", mb: 1 }}>
            Marketing
          </Typography>
          <Typography sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800, color: "#171717" }}>
            Promotions
          </Typography>
          <Typography sx={{ mt: 0.5, color: "#6B6B6B" }} fontSize={13}>
            Create, edit, and manage promotional codes and discounts.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="contained" onClick={openCreate}>
            + New Promotion
          </Button>
          <Button variant="outlined" onClick={() => refetch()} disabled={isLoading || isFetching}>
            Refresh
          </Button>
          <Button variant="outlined" color="inherit" onClick={resetFilters} disabled={isLoading || isFetching}>
            Reset
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Paper elevation={0} sx={{ mt: 3, p: 2.5, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Code, name, type..."
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={typeFilter} onChange={(e) => { setPageNumber(1); setTypeFilter(String(e.target.value)); }}>
                {TYPE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={activeFilter} onChange={(e) => { setPageNumber(1); setActiveFilter(String(e.target.value)); }}>
                {ACTIVE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" label="Sort By" select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <MenuItem value="validFrom">Valid From</MenuItem>
              <MenuItem value="promoCode">Code</MenuItem>
              <MenuItem value="usedCount">Used</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={1}>
            <TextField fullWidth size="small" label="Order" select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}>
              <MenuItem value="asc">Asc</MenuItem>
              <MenuItem value="desc">Desc</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" label="Page Size" select value={pageSize} onChange={(e) => { setPageNumber(1); setPageSize(Number(e.target.value)); }}>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <Box sx={{ mt: 2 }}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }} align="right">Discount</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Valid From</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Valid To</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }} align="center">Status</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }} align="center">Public</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }} align="right">Used</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={26} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <Typography color="error">Failed to load promotions.</Typography>
                  </TableCell>
                </TableRow>
              ) : visibleItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary" fontSize={14}>No promotions found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visibleItems.map((p) => (
                  <TableRow key={p.id} hover sx={{ cursor: "pointer", "& td": { py: 1.8, fontSize: 14 } }} onClick={() => openEdit(p)}>
                    <TableCell sx={{ fontFamily: "monospace", fontWeight: 700 }}>{p.promoCode}</TableCell>
                    <TableCell>{p.promoName}</TableCell>
                    <TableCell>
                      <Chip label={PROMOTION_TYPE_LABELS[p.promotionType] ?? "Unknown"} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{fmtDiscount(p.promotionType, p.discountValue)}</TableCell>
                    <TableCell>{fmtDate(p.validFrom)}</TableCell>
                    <TableCell>{fmtDate(p.validTo)}</TableCell>
                    <TableCell align="center">
                      <Chip label={p.isActive ? "Active" : "Inactive"} color={p.isActive ? "success" : "default"} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={p.isPublic ? "Public" : "Private"} color={p.isPublic ? "info" : "default"} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{p.usedCount}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Button size="small" variant="text" onClick={(e) => { e.stopPropagation(); openEdit(p); }}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          disabled={isDeactivating || !p.isActive}
                          onClick={(e) => { e.stopPropagation(); handleDeactivate(p.id); }}
                        >
                          Deactivate
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button variant="outlined" disabled={isLoading || isFetching || pageNumber <= 1} onClick={() => setPageNumber((p) => Math.max(1, p - 1))}>
            Prev
          </Button>
          <Chip label={`Page ${pageNumber} / ${totalPages} · ${totalCount} items`} sx={{ bgcolor: "rgba(0,0,0,0.06)", fontWeight: 700 }} />
          <Button variant="outlined" disabled={isLoading || isFetching || pageNumber >= totalPages} onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}>
            Next
          </Button>
        </Stack>
      </Box>

      {/* ── CREATE DIALOG ── */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Promotion</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Promo Code"
              value={form.promoCode}
              onChange={(e) => setForm((f) => ({ ...f, promoCode: e.target.value.toUpperCase() }))}
              onBlur={() => touchCreateField("promoCode")}
              error={!!fieldErr(touchedCreate, createErrors, "promoCode")}
              helperText={fieldErr(touchedCreate, createErrors, "promoCode")}
              fullWidth
              placeholder="e.g. SUMMER2025"
            />
            <TextField
              label="Promo Name"
              value={form.promoName}
              onChange={(e) => setForm((f) => ({ ...f, promoName: e.target.value }))}
              onBlur={() => touchCreateField("promoName")}
              error={!!fieldErr(touchedCreate, createErrors, "promoName")}
              helperText={fieldErr(touchedCreate, createErrors, "promoName")}
              fullWidth
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Promotion Type</InputLabel>
              <Select
                label="Promotion Type"
                value={form.promotionType}
                onChange={(e) => setForm((f) => ({ ...f, promotionType: String(e.target.value), discountValue: "" }))}
              >
                <MenuItem value={PromotionType.Percentage}>Percentage</MenuItem>
                <MenuItem value={PromotionType.FixedAmount}>Fixed Amount</MenuItem>
                <MenuItem value={PromotionType.FreeShipping}>Free Shipping</MenuItem>
              </Select>
            </FormControl>

            {form.promotionType !== PromotionType.FreeShipping && (
              <TextField
                label={form.promotionType === PromotionType.Percentage ? "Discount (%)" : "Discount Amount ($)"}
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                onBlur={() => touchCreateField("discountValue")}
                error={!!fieldErr(touchedCreate, createErrors, "discountValue")}
                helperText={fieldErr(touchedCreate, createErrors, "discountValue")}
                fullWidth
              />
            )}

            {form.promotionType === PromotionType.Percentage && (
              <TextField
                label="Max Discount Value ($)"
                type="number"
                value={form.maxDiscountValue}
                onChange={(e) => setForm((f) => ({ ...f, maxDiscountValue: e.target.value }))}
                fullWidth
                placeholder="Optional cap"
              />
            )}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Usage Limit"
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                  fullWidth
                  placeholder="Optional"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Per Customer"
                  type="number"
                  value={form.usageLimitPerCustomer}
                  onChange={(e) => setForm((f) => ({ ...f, usageLimitPerCustomer: e.target.value }))}
                  onBlur={() => touchCreateField("usageLimitPerCustomer")}
                  error={!!fieldErr(touchedCreate, createErrors, "usageLimitPerCustomer")}
                  helperText={fieldErr(touchedCreate, createErrors, "usageLimitPerCustomer")}
                  fullWidth
                  placeholder="Optional"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Valid From"
                  type="datetime-local"
                  value={form.validFrom}
                  onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
                  onBlur={() => touchCreateField("validFrom")}
                  error={!!fieldErr(touchedCreate, createErrors, "validFrom")}
                  helperText={fieldErr(touchedCreate, createErrors, "validFrom")}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Valid To"
                  type="datetime-local"
                  value={form.validTo}
                  onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))}
                  onBlur={() => touchCreateField("validTo")}
                  error={!!fieldErr(touchedCreate, createErrors, "validTo")}
                  helperText={fieldErr(touchedCreate, createErrors, "validTo")}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={<Switch checked={form.isPublic} onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))} />}
              label="Public promotion (visible to all customers)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={isCreating}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── EDIT DIALOG ── */}
      <Dialog open={editOpen} onClose={() => { setEditOpen(false); setEditId(undefined); }} fullWidth maxWidth="sm">
        <DialogTitle>Edit Promotion</DialogTitle>
        <DialogContent>
          {isLoadingDetail ? (
            <Box sx={{ py: 4, textAlign: "center" }}><CircularProgress size={26} /></Box>
          ) : (
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField label="Promo Code" value={editForm.promoCode} fullWidth disabled />

              <TextField
                label="Promotion Type"
                value={PROMOTION_TYPE_LABELS[editForm.promotionType] ?? "Unknown"}
                fullWidth
                disabled
              />

              <TextField
                label="Discount Value"
                value={editForm.discountValue}
                fullWidth
                disabled
              />

              <TextField
                label="Promo Name"
                value={editForm.promoName}
                onChange={(e) => setEditForm((f) => ({ ...f, promoName: e.target.value }))}
                onBlur={() => touchEditField("promoName")}
                error={!!fieldErr(touchedEdit, editErrors, "promoName")}
                helperText={fieldErr(touchedEdit, editErrors, "promoName")}
                fullWidth
              />
              <TextField
                label="Description"
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                fullWidth
                multiline
                minRows={2}
              />

              {editForm.promotionType === PromotionType.Percentage && (
                <TextField
                  label="Max Discount Value ($)"
                  type="number"
                  value={editForm.maxDiscountValue}
                  onChange={(e) => setEditForm((f) => ({ ...f, maxDiscountValue: e.target.value }))}
                  fullWidth
                  placeholder="Optional cap"
                />
              )}

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Usage Limit"
                    type="number"
                    value={editForm.usageLimit}
                    onChange={(e) => setEditForm((f) => ({ ...f, usageLimit: e.target.value }))}
                    fullWidth
                    placeholder="Optional"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Per Customer"
                    type="number"
                    value={editForm.usageLimitPerCustomer}
                    onChange={(e) => setEditForm((f) => ({ ...f, usageLimitPerCustomer: e.target.value }))}
                    onBlur={() => touchEditField("usageLimitPerCustomer")}
                    error={!!fieldErr(touchedEdit, editErrors, "usageLimitPerCustomer")}
                    helperText={fieldErr(touchedEdit, editErrors, "usageLimitPerCustomer")}
                    fullWidth
                    placeholder="Optional"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Valid From"
                    type="datetime-local"
                    value={editForm.validFrom}
                    onChange={(e) => setEditForm((f) => ({ ...f, validFrom: e.target.value }))}
                    onBlur={() => touchEditField("validFrom")}
                    error={!!fieldErr(touchedEdit, editErrors, "validFrom")}
                    helperText={fieldErr(touchedEdit, editErrors, "validFrom")}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Valid To"
                    type="datetime-local"
                    value={editForm.validTo}
                    onChange={(e) => setEditForm((f) => ({ ...f, validTo: e.target.value }))}
                    onBlur={() => touchEditField("validTo")}
                    error={!!fieldErr(touchedEdit, editErrors, "validTo")}
                    helperText={fieldErr(touchedEdit, editErrors, "validTo")}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <FormControlLabel
                control={<Switch checked={editForm.isActive} onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))} />}
                label="Active"
              />
              <FormControlLabel
                control={<Switch checked={editForm.isPublic} onChange={(e) => setEditForm((f) => ({ ...f, isPublic: e.target.checked }))} />}
                label="Public promotion"
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setEditOpen(false); setEditId(undefined); }} disabled={isUpdating}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={isUpdating || isLoadingDetail}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
