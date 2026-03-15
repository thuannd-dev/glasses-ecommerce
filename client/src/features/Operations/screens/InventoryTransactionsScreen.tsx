import { useState } from "react";
import { NavLink } from "react-router";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";

import { OperationsPageHeader } from "../components/OperationsPageHeader";
import {
  useInventoryRecordDetail,
  useInventoryTransactions,
  type InventoryTransactionItem,
} from "../../../lib/hooks/useOperationsInventory";
import { useDebouncedValue } from "../../../lib/hooks/useDebouncedValue";
import { useLookups } from "../../../lib/hooks/useLookups";
import { AppPagination } from "../../../app/shared/components/AppPagination";

function getTypeChipStyle(type: string) {
  if (type === "Inbound") return { bg: "#EEF5EE", color: "#466A4A", border: "#D4E5D5" };
  if (type === "Outbound") return { bg: "#F3EBDD", color: "#7A5A33", border: "#E7D6BA" };
  return { bg: "rgba(0,0,0,0.06)", color: "#6B6B6B", border: "rgba(0,0,0,0.08)" };
}

function getStatusChipStyle(status: string) {
  if (status === "Completed") return { bg: "#EEF5EE", color: "#466A4A" };
  if (status === "Approved") return { bg: "#F3F1FB", color: "#5E4FA8" };
  if (status === "PendingApproval" || status === "Pending") return { bg: "#F6F6F6", color: "#4B4B4B" };
  return { bg: "rgba(0,0,0,0.06)", color: "#6B6B6B" };
}

function TransactionRow({ row }: { row: InventoryTransactionItem }) {
  const [expanded, setExpanded] = useState(false);
  const detailId = row.referenceId || row.id;
  const isInboundRecordRef =
    row.transactionType === "Inbound" || row.referenceType === "Supplier" || row.referenceType === "Return" || row.referenceType === "Adjustment";
  const { data: detail, isLoading } = useInventoryRecordDetail(
    expanded && isInboundRecordRef ? detailId : undefined,
  );

  return (
    <>
      <TableRow
        hover
        sx={{
          "& .MuiTableCell-root": {
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            py: 1.5,
          },
          transition: "background-color 0.18s ease",
          "&:hover": { bgcolor: "#FAFAFA" },
        }}
      >
        <TableCell sx={{ color: "#6B6B6B", whiteSpace: "nowrap" }}>
          {new Date(row.createdAt).toLocaleString()}
        </TableCell>
        <TableCell>
          <Box sx={{ color: "#171717", fontWeight: 600, fontSize: 14 }}>
            {row.variantName || row.sku || row.productVariantId}
          </Box>
          <Box sx={{ color: "#8A8A8A", fontSize: 12, mt: 0.3 }}>
            {row.productVariantId}
          </Box>
        </TableCell>
        <TableCell>
          <Chip
            size="small"
            label={row.transactionType}
            sx={{
              height: 24,
              fontWeight: 700,
              fontSize: 12,
              bgcolor: getTypeChipStyle(row.transactionType).bg,
              color: getTypeChipStyle(row.transactionType).color,
              border: `1px solid ${getTypeChipStyle(row.transactionType).border}`,
              borderRadius: 999,
            }}
          />
        </TableCell>
        <TableCell align="right" sx={{ color: "#171717", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {row.quantity}
        </TableCell>
        <TableCell sx={{ color: "#6B6B6B" }}>
          {row.referenceType || "—"}
        </TableCell>
        <TableCell>
          <Chip
            size="small"
            label={row.status || "—"}
            sx={{
              height: 24,
              fontWeight: 600,
              fontSize: 12,
              bgcolor: getStatusChipStyle(row.status || "").bg,
              color: getStatusChipStyle(row.status || "").color,
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          />
        </TableCell>
        <TableCell align="right">
          <IconButton
            size="small"
            onClick={() => setExpanded((v) => !v)}
            sx={{
              color: "#6B6B6B",
              transition: "all 0.18s ease",
              "&:hover": { color: "#171717", bgcolor: "rgba(0,0,0,0.04)" },
            }}
            aria-label={expanded ? "Hide details" : "Show details"}
            disabled={!isInboundRecordRef}
          >
            {expanded ? <KeyboardArrowUpRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
          </IconButton>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={7} sx={{ p: 0, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          {expanded && (
            <Box sx={{ px: 2.25, py: 1.5, bgcolor: "#FFFFFF" }}>
              {isLoading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#6B6B6B" }}>
                  <CircularProgress size={16} />
                  Loading detail...
                </Box>
              ) : !detail ? (
                <Box sx={{ color: "#8A8A8A", fontSize: 13 }}>
                  Detail is available for inbound-record references only.
                </Box>
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
                        Reference: {detail.sourceReference || row.referenceType || "—"}
                      </Typography>
                    </Stack>
                  </Box>

                  {detail.notes && (
                    <Box sx={{ mt: 1.5, color: "#6B6B6B", fontSize: 13 }}>
                      Notes: {detail.notes}
                    </Box>
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
                        {index < (detail.items?.length ?? 0) - 1 && <Divider />}
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

export function InventoryTransactionsScreen() {
  const [pageNumber, setPageNumber] = useState(1);
  const [variantSearch, setVariantSearch] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [referenceType, setReferenceType] = useState("");

  const debouncedVariantSearch = useDebouncedValue(variantSearch, 250);
  const { data: lookups } = useLookups();
  const { data, isLoading, isFetching } = useInventoryTransactions({
    pageNumber,
    pageSize: 10,
    productVariantId: debouncedVariantSearch || undefined,
    transactionType: transactionType || undefined,
    referenceType: referenceType || undefined,
  });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;
  const transactionTypeOptions = lookups?.transactionType ?? ["Inbound", "Outbound", "Adjustment"];
  const referenceTypeOptions = lookups?.sourceType ?? ["Supplier", "Return", "Adjustment"];

  return (
    <>
      <OperationsPageHeader
        title="Inventory transactions"
        subtitle="Track inbound and outbound records created by operations."
        eyebrow="OPERATIONS CENTER"
        count={totalCount}
        countLabel="records"
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
            to="/operations/stock"
            variant="text"
            sx={{
              borderRadius: 999,
              px: 2.5,
              py: 0.9,
              fontWeight: 600,
              textTransform: "none",
              color: "#6B6B6B",
            }}
          >
            Stock
          </Button>
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
              color: "#6B6B6B",
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
                value={variantSearch}
                onChange={(e) => {
                  setVariantSearch(e.target.value);
                  setPageNumber(1);
                }}
                placeholder="Search by product variant ID..."
                sx={{
                  flex: 1,
                  minWidth: { xs: "100%", md: 320 },
                  "& .MuiOutlinedInput-root": {
                    height: 42,
                    borderRadius: 999,
                    bgcolor: "#FFFFFF",
                    "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
                    "&:hover fieldset": { borderColor: "rgba(0,0,0,0.12)" },
                    "&.Mui-focused fieldset": { borderColor: "#B68C5A", borderWidth: 1 },
                    "&.Mui-focused": { boxShadow: "0 0 0 4px rgba(182,140,90,0.16)" },
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

              <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
                <TextField
                  select
                  size="small"
                  label="Type"
                  value={transactionType}
                  onChange={(e) => {
                    setTransactionType(e.target.value);
                    setPageNumber(1);
                  }}
                  sx={{
                    minWidth: 170,
                    "& .MuiOutlinedInput-root": {
                      height: 42,
                      borderRadius: "14px",
                      "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
                      "&:hover fieldset": { borderColor: "rgba(0,0,0,0.12)" },
                      "&.Mui-focused fieldset": { borderColor: "#B68C5A", borderWidth: 1 },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 4px rgba(182,140,90,0.16)",
                      },
                    },
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {transactionTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  size="small"
                  label="Reference"
                  value={referenceType}
                  onChange={(e) => {
                    setReferenceType(e.target.value);
                    setPageNumber(1);
                  }}
                  sx={{
                    minWidth: 170,
                    "& .MuiOutlinedInput-root": {
                      height: 42,
                      borderRadius: "14px",
                      "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
                      "&:hover fieldset": { borderColor: "rgba(0,0,0,0.12)" },
                      "&.Mui-focused fieldset": { borderColor: "#B68C5A", borderWidth: 1 },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 4px rgba(182,140,90,0.16)",
                      },
                    },
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {referenceTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.06)" }} />

            {isLoading || isFetching ? (
              <LinearProgress sx={{ borderRadius: 999, mx: { xs: 2, md: 3 }, my: 2 }} />
            ) : null}

            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#FAFAF8" }}>
                    <TableCell sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Time
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Variant
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Type
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Qty
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Reference
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Status
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((row) => (
                    <TransactionRow key={row.id} row={row} />
                  ))}
                  {items.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: "center", py: 4, color: "#8A8A8A" }}>
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            {totalPages > 1 && (
              <Box sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
                <AppPagination
                  page={pageNumber}
                  totalPages={totalPages}
                  onChange={setPageNumber}
                  totalItems={totalCount}
                  pageSize={10}
                  unitLabel="records"
                  align="flex-end"
                />
              </Box>
            )}
          </Stack>
        </Paper>
      </Box>
    </>
  );
}
