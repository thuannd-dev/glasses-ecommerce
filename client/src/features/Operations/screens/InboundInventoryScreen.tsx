import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { toast } from "react-toastify";

import { OperationsPageHeader } from "../components/OperationsPageHeader";
import {
  useCreateInventoryInbound,
  useInventoryCatalog,
  useInventoryInboundRecords,
  useInventoryRecordDetail,
  type InventoryInboundRecordItem,
} from "../../../lib/hooks/useOperationsInventory";
import { useProducts, useProductDetail } from "../../../lib/hooks/useProducts";
import { useDebouncedValue } from "../../../lib/hooks/useDebouncedValue";
import { useLookups } from "../../../lib/hooks/useLookups";
import type { Product } from "../../../lib/types/collections";

function getStockChipStyles(stock: number) {
  if (stock >= 200) {
    return { bg: "#EEF5EE", color: "#466A4A" };
  }
  if (stock >= 50) {
    return { bg: "#F3EBDD", color: "#7A5A33" };
  }
  return { bg: "#F6EAEA", color: "#8E3B3B" };
}

function getInboundStatusStyles(status: string | null) {
  if (status === "PendingApproval") {
    return { bg: "#F6F6F6", color: "#4B4B4B", border: "#EAEAEA" };
  }
  if (status === "Approved") {
    return { bg: "#EEF5EE", color: "#466A4A", border: "#D4E5D5" };
  }
  if (status === "Rejected") {
    return { bg: "#F6EAEA", color: "#8E3B3B", border: "#E8CFCF" };
  }
  return { bg: "#F6F6F6", color: "#4B4B4B", border: "#EAEAEA" };
}

function shortenRecordId(id: string) {
  if (!id) return "—";
  if (id.length <= 14) return id;
  return `${id.slice(0, 8)}...${id.slice(-4)}`;
}

function InboundRecordRow({ record }: { record: InventoryInboundRecordItem }) {
  const [expanded, setExpanded] = useState(false);
  const { data: detail, isLoading } = useInventoryRecordDetail(expanded ? record.id : undefined);
  const statusStyles = getInboundStatusStyles(record.status);
  const copyRecordId = () => {
    navigator.clipboard.writeText(record.id);
  };

  return (
    <>
      <TableRow
        hover
        sx={{
          "& .MuiTableCell-root": {
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            py: 1.85,
          },
          transition: "background-color 0.18s ease",
          "&:hover": {
            bgcolor: "#FAFAFA",
          },
        }}
      >
        <TableCell>
          <Tooltip title={record.id} placement="top" arrow>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.2,
                py: 0.5,
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,0.08)",
                bgcolor: "#F7F7F7",
                fontFamily: "monospace",
                fontSize: 12,
                color: "#171717",
              }}
            >
              {shortenRecordId(record.id)}
              <IconButton
                size="small"
                onClick={copyRecordId}
                sx={{
                  width: 20,
                  height: 20,
                  color: "#8A8A8A",
                  "&:hover": { color: "#171717", bgcolor: "rgba(0,0,0,0.04)" },
                }}
                aria-label="Copy record ID"
              >
                <ContentCopyIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Box>
          </Tooltip>
        </TableCell>
        <TableCell sx={{ color: "#6B6B6B" }}>{record.sourceType || "—"}</TableCell>
        <TableCell>
          <Chip
            size="small"
            label={record.status || "—"}
            sx={{
              height: 24,
              fontWeight: 600,
              fontSize: 12.5,
              bgcolor: statusStyles.bg,
              color: statusStyles.color,
              border: `1px solid ${statusStyles.border}`,
              borderRadius: 999,
            }}
          />
        </TableCell>
        <TableCell align="right" sx={{ color: "#171717", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {record.totalItems}
        </TableCell>
        <TableCell sx={{ color: "#6B6B6B" }}>{record.createdByName || "—"}</TableCell>
        <TableCell sx={{ color: "#8A8A8A", whiteSpace: "nowrap", fontSize: 13 }}>
          {record.createdAt ? new Date(record.createdAt).toLocaleString() : "—"}
        </TableCell>
        <TableCell align="right">
          <IconButton
            size="small"
            onClick={() => setExpanded((v) => !v)}
            sx={{
              width: 36,
              height: 36,
              borderRadius: 999,
              color: expanded ? "#B68C5A" : "#6B6B6B",
              transition: "all 0.18s ease",
              "&:hover": { bgcolor: "#FAFAFA", color: "#171717" },
            }}
            aria-label={expanded ? "Hide detail" : "Show detail"}
          >
            <KeyboardArrowDownRoundedIcon
              sx={{
                transition: "transform 0.18s ease",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </IconButton>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={7} sx={{ p: 0, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          {expanded && (
            <Box
              sx={{
                px: 2.25,
                py: 1.5,
                bgcolor: "#FFFFFF",
              }}
            >
              {isLoading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#6B6B6B" }}>
                  <CircularProgress size={16} />
                  Loading detail...
                </Box>
              ) : !detail ? (
                <Typography sx={{ color: "#8A8A8A", fontSize: 13 }}>No detail available.</Typography>
              ) : (
                <Box
                  sx={{
                    bgcolor: "#FAFAF8",
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: "14px",
                    p: { xs: 2, md: 2.25 },
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <Stack spacing={0.8}>
                      <Typography sx={{ fontSize: 12, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: 0.8 }}>
                        Record
                      </Typography>
                      <Box
                        component="span"
                        sx={{
                          display: "inline-flex",
                          width: "fit-content",
                          px: 1.2,
                          py: 0.4,
                          borderRadius: 999,
                          border: "1px solid rgba(0,0,0,0.08)",
                          bgcolor: "#FFFFFF",
                          fontFamily: "monospace",
                          fontSize: 12,
                          color: "#171717",
                        }}
                      >
                        {detail.id}
                      </Box>
                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                        Source: {detail.sourceType || "—"}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                        Created by: {detail.createdByName || "—"}
                      </Typography>
                    </Stack>

                    <Stack spacing={0.8}>
                      <Typography sx={{ fontSize: 12, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: 0.8 }}>
                        Timeline
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                        Created at: {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : "—"}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                        Status: {detail.status || "—"}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                        Reference: {detail.sourceReference || "—"}
                      </Typography>
                    </Stack>
                  </Box>

                  {detail.notes && (
                    <Typography sx={{ mt: 1.5, color: "#6B6B6B", fontSize: 13 }}>
                      Notes: {detail.notes}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      mt: 1.75,
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.08)",
                      bgcolor: "#FFFFFF",
                      overflow: "hidden",
                    }}
                  >
                    <Box sx={{ px: 1.5, py: 1.1, fontSize: 12, letterSpacing: 0.8, color: "#8A8A8A", textTransform: "uppercase", bgcolor: "#FAFAF8" }}>
                      Line items
                    </Box>
                    {detail.items?.map((item, index) => (
                      <Box key={item.id}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            px: 1.5,
                            py: 1.1,
                            gap: 1,
                          }}
                        >
                          <Box sx={{ color: "#171717", fontSize: 13, fontWeight: 600 }}>
                            {item.variantName || item.sku || item.productVariantId}
                          </Box>
                          <Box sx={{ color: "#6B6B6B", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                            Qty {item.quantity}
                          </Box>
                        </Box>
                        {index < (detail.items?.length ?? 0) - 1 && (
                          <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.06)" }} />
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </TableCell>
      </TableRow>
    </>
  );
}

export function InboundInventoryScreen() {
  const [inventorySearch, setInventorySearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [recordsPageNumber, setRecordsPageNumber] = useState(1);
  const [recordStatus, setRecordStatus] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [sourceType, setSourceType] = useState("Supplier");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const debouncedInventorySearch = useDebouncedValue(inventorySearch, 250);
  const debouncedSearch = useDebouncedValue(productSearch, 300);

  const inboundMutation = useCreateInventoryInbound();
  const { data: inventoryData, isLoading: isInventoryLoading, isFetching: isInventoryFetching } =
    useInventoryCatalog({
      pageNumber,
      pageSize: 12,
      search: debouncedInventorySearch,
    });
  const { products, isFetching: isProductsLoading } = useProducts({
    pageNumber: 1,
    pageSize: 50,
    search: debouncedSearch || null,
  });
  const { product: selectedProductDetail, isLoading: isVariantLoading } = useProductDetail(
    selectedProduct?.id,
  );
  const { data: lookups } = useLookups();
  const {
    data: inboundRecordsData,
    isLoading: isInboundRecordsLoading,
    isFetching: isInboundRecordsFetching,
  } = useInventoryInboundRecords({
    pageNumber: recordsPageNumber,
    pageSize: 10,
    status: recordStatus || undefined,
  });

  const variantOptions = selectedProductDetail?.variants ?? [];
  const selectedVariant = variantOptions.find((v) => v.id === selectedVariantId) ?? null;
  const inventoryItems = inventoryData?.items ?? [];
  const totalPages = inventoryData?.totalPages ?? 1;
  const totalCount = inventoryData?.totalCount ?? 0;
  const sourceTypeOptions = (lookups?.sourceType ?? []).filter(Boolean);
  const inboundStatusOptions = (lookups?.inboundRecordStatus ?? []).filter(Boolean);
  const resolvedSourceTypeOptions = sourceTypeOptions.length > 0
    ? sourceTypeOptions
    : ["Supplier", "Return", "Adjustment"];
  const defaultSourceType = resolvedSourceTypeOptions.includes("Supplier")
    ? "Supplier"
    : resolvedSourceTypeOptions[0];

  useEffect(() => {
    if (!resolvedSourceTypeOptions.includes(sourceType)) {
      setSourceType(defaultSourceType);
    }
  }, [defaultSourceType, resolvedSourceTypeOptions, sourceType]);

  const quantityValue = Number(quantity);
  const isFormValid = !!selectedVariantId && Number.isFinite(quantityValue) && quantityValue > 0;
  const selectedVariantLabel = useMemo(
    () =>
      selectedVariant
        ? `${selectedVariant.variantName || selectedVariant.sku || selectedVariant.id} · SKU ${
            selectedVariant.sku || "N/A"
          }`
        : "",
    [selectedVariant],
  );
  const inboundRecords = inboundRecordsData?.items ?? [];
  const inboundRecordsTotalPages = inboundRecordsData?.totalPages ?? 1;
  const inboundRecordsTotalCount = inboundRecordsData?.totalCount ?? 0;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    try {
      await inboundMutation.mutateAsync({
        productVariantId: selectedVariantId,
        quantity: Math.floor(quantityValue),
        notes,
        sourceType,
      });

      toast.success("Inbound recorded successfully.");
      setQuantity("");
      setNotes("");
      setSelectedVariantId("");
      setSelectedProduct(null);
      setSourceType(defaultSourceType);
      setDialogOpen(false);
    } catch {
      // handled by mutation state + global interceptor
    }
  };

  return (
    <>
      <OperationsPageHeader
        title="Inbound inventory"
        subtitle="Monitor stock and record received goods."
        eyebrow="OPERATIONS CENTER"
        count={totalCount}
        countLabel="products"
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box
          sx={{
            display: "inline-flex",
            gap: 0.5,
            p: 0.5,
            borderRadius: 999,
            bgcolor: "#F7F7F7",
            border: "1px solid rgba(0,0,0,0.08)",
            alignSelf: "flex-start",
          }}
        >
          <Button
            component={NavLink}
            to="/operations/inbound"
            variant="text"
            sx={{
              borderRadius: 999,
              px: 2.5,
              py: 0.9,
              fontWeight: 600,
              textTransform: "none",
              position: "relative",
              bgcolor: "#FFFFFF",
              boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
              border: "1px solid rgba(182,140,90,0.4)",
              color: "#171717",
              "&::after": {
                content: '""',
                display: "block",
                width: "60%",
                height: 2,
                borderRadius: 2,
                bgcolor: "#B68C5A",
                position: "absolute",
                bottom: 6,
                left: "20%",
              },
            }}
          >
            Inbound
          </Button>
          <Button
            component={NavLink}
            to="/operations/outbound"
            variant="text"
            sx={{
              borderRadius: 999,
              px: 2.5,
              py: 0.9,
              fontWeight: 600,
              textTransform: "none",
              color: "#6B6B6B",
              bgcolor: "transparent",
            }}
          >
            Outbound
          </Button>
          <Button
            component={NavLink}
            to="/operations/inventory-transactions"
            variant="text"
            sx={{
              borderRadius: 999,
              px: 2.5,
              py: 0.9,
              fontWeight: 600,
              textTransform: "none",
              color: "#6B6B6B",
              bgcolor: "transparent",
            }}
            startIcon={<HistoryOutlinedIcon sx={{ fontSize: 18 }} />}
          >
            History
          </Button>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 0,
            borderRadius: "20px",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
            bgcolor: "#FFFFFF",
            overflow: "hidden",
          }}
        >
          <Stack spacing={0}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
                px: { xs: 2, md: 3 },
                py: 2,
              }}
            >
              <TextField
                size="small"
                value={inventorySearch}
                onChange={(e) => {
                  setInventorySearch(e.target.value);
                  setPageNumber(1);
                }}
                placeholder="Search products..."
                sx={{
                  width: { xs: "100%", sm: 360 },
                  "& .MuiOutlinedInput-root": {
                    height: 42,
                    borderRadius: 999,
                    bgcolor: "#FFFFFF",
                    "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
                    "&:hover fieldset": { borderColor: "rgba(0,0,0,0.12)" },
                    "&.Mui-focused fieldset": { borderColor: "#B68C5A", borderWidth: 1 },
                    "&.Mui-focused": {
                      boxShadow: "0 0 0 4px rgba(182,140,90,0.16)",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#8A8A8A", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setDialogOpen(true)}
                sx={{
                  height: 42,
                  px: 2.25,
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.12)",
                  bgcolor: "#111827",
                  "&:hover": {
                    bgcolor: "#0b1220",
                    transform: "translateY(-1px)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.16)",
                  },
                }}
              >
                New inbound
              </Button>
            </Box>

            <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.06)" }} />

            {isInventoryLoading || isInventoryFetching ? (
              <LinearProgress sx={{ borderRadius: 999, mx: { xs: 2, md: 3 }, my: 2 }} />
            ) : null}

            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#FAFAF8" }}>
                    <TableCell
                      sx={{
                        fontSize: 11,
                        letterSpacing: 1.2,
                        textTransform: "uppercase",
                        fontWeight: 700,
                        color: "#8A8A8A",
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                        py: 1.6,
                      }}
                    >
                      Product
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: 11,
                        letterSpacing: 1.2,
                        textTransform: "uppercase",
                        fontWeight: 700,
                        color: "#8A8A8A",
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                        py: 1.6,
                      }}
                    >
                      Brand
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: 11,
                        letterSpacing: 1.2,
                        textTransform: "uppercase",
                        fontWeight: 700,
                        color: "#8A8A8A",
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                        py: 1.6,
                      }}
                    >
                      Stock
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontSize: 11,
                        letterSpacing: 1.2,
                        textTransform: "uppercase",
                        fontWeight: 700,
                        color: "#8A8A8A",
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                        py: 1.6,
                      }}
                    >
                      Price range
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryItems.map((item) => (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{
                        "& .MuiTableCell-root": {
                          borderBottom: "1px solid rgba(0,0,0,0.06)",
                          py: 1.7,
                        },
                        "&:hover": {
                          bgcolor: "#FAFAFA",
                        },
                      }}
                    >
                      <TableCell sx={{ color: "#171717", fontWeight: 700, fontSize: 15 }}>
                        {item.productName}
                      </TableCell>
                      <TableCell sx={{ color: "#6B6B6B", fontSize: 14 }}>{item.brand || "—"}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={item.totalQuantityAvailable}
                          sx={{
                            height: 24,
                            fontWeight: 700,
                            fontSize: 12,
                            bgcolor: getStockChipStyles(item.totalQuantityAvailable).bg,
                            color: getStockChipStyles(item.totalQuantityAvailable).color,
                            borderRadius: 999,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: "#6B6B6B", fontVariantNumeric: "tabular-nums", fontSize: 14 }}
                      >
                        {item.minPrice.toLocaleString("en-US", { style: "currency", currency: "USD" })} -{" "}
                        {item.maxPrice.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {inventoryItems.length === 0 && !isInventoryLoading && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: "center", py: 4, color: "#8A8A8A" }}>
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", px: { xs: 2, md: 3 }, py: 2 }}>
                <Pagination
                  count={totalPages}
                  page={pageNumber}
                  onChange={(_, p) => setPageNumber(p)}
                  size="small"
                  sx={{
                    "& .Mui-selected": {
                      bgcolor: "rgba(182,140,90,0.2)",
                      color: "#171717",
                    },
                  }}
                />
              </Box>
            )}
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 0,
            borderRadius: "20px",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
            bgcolor: "#FFFFFF",
            overflow: "hidden",
          }}
        >
          <Stack spacing={0}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
                px: { xs: 2, md: 3 },
                py: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#171717" }}>
                  Inbound records
                </Typography>
                <Box
                  component="span"
                  sx={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#6B6B6B",
                    bgcolor: "#F7F7F7",
                    border: "1px solid rgba(0,0,0,0.08)",
                    px: 1.2,
                    py: 0.25,
                    borderRadius: 999,
                  }}
                >
                  {inboundRecordsTotalCount} record(s)
                </Box>
              </Box>
              <TextField
                select
                size="small"
                label="Status"
                value={recordStatus}
                onChange={(e) => {
                  setRecordStatus(e.target.value);
                  setRecordsPageNumber(1);
                }}
                sx={{
                  minWidth: 220,
                  "& .MuiOutlinedInput-root": {
                    height: 42,
                    borderRadius: 999,
                    bgcolor: "#FFFFFF",
                    "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
                    "&:hover fieldset": { borderColor: "rgba(0,0,0,0.12)" },
                    "&.Mui-focused fieldset": { borderColor: "#B68C5A", borderWidth: 1 },
                    "&.Mui-focused": {
                      boxShadow: "0 0 0 4px rgba(182,140,90,0.16)",
                    },
                  },
                }}
              >
                <MenuItem value="">All status</MenuItem>
                {inboundStatusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.06)" }} />

            {isInboundRecordsLoading || isInboundRecordsFetching ? (
              <LinearProgress sx={{ borderRadius: 999, mx: { xs: 2, md: 3 }, my: 2 }} />
            ) : null}

            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#FAFAF8" }}>
                    <TableCell sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Record ID
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Source
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Status
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Items
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Created by
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Created at
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Detail
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inboundRecords.map((record) => (
                    <InboundRecordRow key={record.id} record={record} />
                  ))}
                  {inboundRecords.length === 0 && !isInboundRecordsLoading && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: "center", py: 4, color: "#8A8A8A" }}>
                        No inbound records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            {inboundRecordsTotalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", px: { xs: 2, md: 3 }, py: 2 }}>
                <Pagination
                  count={inboundRecordsTotalPages}
                  page={recordsPageNumber}
                  onChange={(_, p) => setRecordsPageNumber(p)}
                  size="small"
                  sx={{
                    "& .Mui-selected": {
                      bgcolor: "rgba(182,140,90,0.2)",
                      color: "#171717",
                    },
                  }}
                />
              </Box>
            )}
          </Stack>
        </Paper>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#171717" }}>Create inbound transaction</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <Autocomplete
              options={products}
              value={selectedProduct}
              loading={isProductsLoading}
              onChange={(_, value) => {
                setSelectedProduct(value);
                setSelectedVariantId("");
              }}
              onInputChange={(_, value) => setProductSearch(value)}
              getOptionLabel={(option) => `${option.name} (${option.brand})`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Product"
                  placeholder="Search product name..."
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isProductsLoading ? <CircularProgress color="inherit" size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <Autocomplete
              options={variantOptions}
              value={selectedVariant}
              loading={isVariantLoading}
              onChange={(_, value) => setSelectedVariantId(value?.id ?? "")}
              getOptionLabel={(option) =>
                `${option.variantName || option.sku || option.id} · SKU ${option.sku || "N/A"}`
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              disabled={!selectedProduct}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Variant"
                  placeholder={selectedProduct ? "Select a variant" : "Choose product first"}
                  fullWidth
                />
              )}
            />

            {selectedVariantLabel && (
              <Typography sx={{ color: "#6B6B6B", fontSize: 13 }}>{selectedVariantLabel}</Typography>
            )}

            <TextField
              select
              label="Source type"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              fullWidth
            >
              {resolvedSourceTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Quantity"
              type="number"
              inputProps={{ min: 1 }}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              fullWidth
            />

            {selectedVariant && (
              <Typography sx={{ color: "#6B6B6B", fontSize: 13 }}>
                Current stock: {selectedVariant.quantityAvailable}
              </Typography>
            )}

            <TextField
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />

            {inboundMutation.isError && (
              <Alert severity="error">
                Failed to create inbound transaction. Please check input and try again.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ borderRadius: 999, textTransform: "none", color: "#6B6B6B" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isFormValid || inboundMutation.isPending}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "#171717",
              "&:hover": { bgcolor: "#000000" },
            }}
          >
            {inboundMutation.isPending ? "Submitting..." : "Record inbound"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
