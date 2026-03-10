import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
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

import type { InventoryTransactionDto } from "../../../lib/types/inventory";

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "Inbound", label: "Inbound" },
  { value: "Outbound", label: "Outbound" },
  { value: "Adjustment", label: "Adjustment" },
];

const REF_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "InboundRecord", label: "InboundRecord" },
  { value: "Order", label: "Order" },
  { value: "Manual", label: "Manual" },
];

const TYPE_COLORS: Record<string, { bgcolor: string; color: string }> = {
  Inbound: { bgcolor: "rgba(46,125,50,0.12)", color: "#2e7d32" },
  Outbound: { bgcolor: "rgba(25,118,210,0.12)", color: "#1565c0" },
  Adjustment: { bgcolor: "rgba(245,124,0,0.15)", color: "#e65100" },
};

export default function InventoryTransactionsScreen() {
  const [items, setItems] = useState<InventoryTransactionDto[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [typeFilter, setTypeFilter] = useState("");
  const [refFilter, setRefFilter] = useState("");
  const [productVariantId, setProductVariantId] = useState("");

  const normalizedVariantId = useMemo(() => productVariantId.trim() || undefined, [productVariantId]);

  const load = async () => {
    setLoading(true);
    try {
      // TODO: Implement inventory transactions API integration
      toast.info("Inventory transactions feature coming soon");
      setItems([]);
      setTotalPages(1);
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, typeFilter, refFilter, normalizedVariantId]);

  return (
    <Box sx={{ px: { xs: 2, md: 6, lg: 10 }, py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 22, fontWeight: 900 }} color="text.primary">
          Inventory Transactions
        </Typography>
        <Typography sx={{ mt: 0.5, color: "text.secondary" }} fontSize={13}>
          Full audit trail of inventory changes.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                value={typeFilter}
                onChange={(e) => {
                  setPage(1);
                  setTypeFilter(e.target.value);
                }}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Reference</InputLabel>
              <Select
                label="Reference"
                value={refFilter}
                onChange={(e) => {
                  setPage(1);
                  setRefFilter(e.target.value);
                }}
              >
                {REF_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="Product Variant ID (optional)"
              value={productVariantId}
              onChange={(e) => {
                setPage(1);
                setProductVariantId(e.target.value);
              }}
              fullWidth
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Stack direction="row" justifyContent={{ xs: "flex-start", md: "flex-end" }}>
              <Button variant="outlined" onClick={() => load()} disabled={loading}>
                Refresh
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>SKU</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">
                  Qty
                </TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Ref</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={26} />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary" fontSize={13}>
                      No transactions.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={t.transactionType}
                        size="small"
                        sx={
                          TYPE_COLORS[t.transactionType] ?? {
                            bgcolor: "rgba(0,0,0,0.06)",
                            color: "text.primary",
                          }
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={13} fontWeight={700}>
                        {t.productName ?? "—"}
                      </Typography>
                      <Typography fontSize={12} color="text.secondary">
                        {t.variantName ?? ""}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>{t.sku ?? "—"}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                      {t.quantity}
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={12} color="text.secondary">
                        {t.referenceType}
                      </Typography>
                      <Typography fontSize={12} sx={{ fontFamily: "monospace" }}>
                        {t.referenceId ? t.referenceId.slice(0, 8) + "…" : "—"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button variant="outlined" disabled={loading || page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Prev
          </Button>
          <Chip label={`Page ${page} / ${totalPages}`} sx={{ bgcolor: "rgba(0,0,0,0.06)", fontWeight: 700 }} />
          <Button variant="outlined" disabled={loading || page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
