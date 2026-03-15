import { useState } from "react";
import { NavLink } from "react-router";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { OperationsPageHeader } from "../components/OperationsPageHeader";
import { AppPagination } from "../../../app/shared/components/AppPagination";
import {
  useInventoryOutboundRecords,
  useInventoryOutboundDetail,
  type InventoryOutboundRecordItem,
} from "../../../lib/hooks/useOperationsInventory";

function shortenRecordId(id: string) {
  if (!id) return "—";
  if (id.length <= 14) return id;
  return `${id.slice(0, 8)}...${id.slice(-4)}`;
}

function OutboundRecordRow({ record }: { record: InventoryOutboundRecordItem }) {
  const [expanded, setExpanded] = useState(false);
  const { data: detail, isLoading } = useInventoryOutboundDetail(expanded ? record.orderId : undefined);
  const copyOrderId = () => {
    navigator.clipboard.writeText(record.orderId);
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
          <Tooltip title={record.orderId} placement="top" arrow>
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
              {shortenRecordId(record.orderId)}
              <IconButton
                size="small"
                onClick={copyOrderId}
                sx={{
                  width: 20,
                  height: 20,
                  color: "#8A8A8A",
                  "&:hover": { color: "#171717", bgcolor: "rgba(0,0,0,0.04)" },
                }}
                aria-label="Copy order ID"
              >
                <ContentCopyIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Box>
          </Tooltip>
        </TableCell>
        <TableCell sx={{ color: "#6B6B6B" }}>{record.orderNumber || "—"}</TableCell>
        <TableCell sx={{ color: "#6B6B6B" }}>{record.orderStatus || "—"}</TableCell>
        <TableCell sx={{ color: "#6B6B6B" }}>{record.customerName || "—"}</TableCell>
        <TableCell align="right" sx={{ color: "#171717", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {record.totalItems}
        </TableCell>
        <TableCell align="right" sx={{ color: "#171717", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {record.totalQuantity}
        </TableCell>
        <TableCell sx={{ color: "#6B6B6B" }}>{record.recordedByName || "—"}</TableCell>
        <TableCell sx={{ color: "#8A8A8A", whiteSpace: "nowrap", fontSize: 13 }}>
          {record.recordedAt ? new Date(record.recordedAt).toLocaleString() : "—"}
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
        <TableCell colSpan={9} sx={{ p: 0, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
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
                        Order
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
                        {detail.orderId}
                      </Box>
                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                        Number: {detail.orderNumber || "—"}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                        Customer: {detail.customerName || "—"}
                      </Typography>
                    </Stack>

                    <Stack spacing={0.8}>
                      <Typography sx={{ fontSize: 12, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: 0.8 }}>
                        Timeline
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                        Recorded at: {detail.recordedAt ? new Date(detail.recordedAt).toLocaleString() : "—"}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                        Status: {detail.orderStatus || "—"}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                        Recorded by: {detail.recordedByName || "—"}
                      </Typography>
                    </Stack>
                  </Box>

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

export function OutboundInventoryScreen() {
  const [recordsPageNumber, setRecordsPageNumber] = useState(1);
  const {
    data: outboundRecordsData,
    isLoading: isOutboundRecordsLoading,
    isFetching: isOutboundRecordsFetching,
  } = useInventoryOutboundRecords({
    pageNumber: recordsPageNumber,
    pageSize: 10,
  });

  const outboundRecords = outboundRecordsData?.items ?? [];
  const outboundRecordsTotalPages = outboundRecordsData?.totalPages ?? 1;
  const outboundRecordsTotalCount = outboundRecordsData?.totalCount ?? 0;

  return (
    <>
      <OperationsPageHeader
        title="Outbound inventory"
        subtitle="Monitor stock and record warehouse issues."
        eyebrow="OPERATIONS CENTER"
        count={outboundRecordsTotalCount}
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
              bgcolor: "transparent",
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
              bgcolor: "transparent",
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#171717" }}>
                  Outbound records
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
                  {outboundRecordsTotalCount} record(s)
                </Box>
              </Box>
            </Box>

            <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.06)" }} />

            {isOutboundRecordsLoading || isOutboundRecordsFetching ? (
              <LinearProgress sx={{ borderRadius: 999, mx: { xs: 2, md: 3 }, my: 2 }} />
            ) : null}

            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#FAFAF8" }}>
                    <TableCell sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Order ID
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Order Number
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Customer
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Items
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Qty
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Recorded by
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Recorded at
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: "#8A8A8A", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.6 }}>
                      Detail
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {outboundRecords.map((record) => (
                    <OutboundRecordRow key={record.orderId} record={record} />
                  ))}
                  {outboundRecords.length === 0 && !isOutboundRecordsLoading && (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ textAlign: "center", py: 4, color: "#8A8A8A" }}>
                        No outbound records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
              <AppPagination
                page={recordsPageNumber}
                totalPages={outboundRecordsTotalPages}
                onChange={setRecordsPageNumber}
                totalItems={outboundRecordsTotalCount}
                pageSize={10}
                unitLabel="records"
                align="flex-end"
              />
            </Box>
          </Stack>
        </Paper>
      </Box>
    </>
  );
}
