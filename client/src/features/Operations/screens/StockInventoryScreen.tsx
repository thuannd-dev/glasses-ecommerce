import { NavLink } from "react-router";
import { Box, Button, Chip, InputAdornment, LinearProgress, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import MoveToInboxOutlinedIcon from "@mui/icons-material/MoveToInboxOutlined";
import OutboxOutlined from "@mui/icons-material/OutboxOutlined";

import { OperationsPageHeader } from "../components/OperationsPageHeader";
import { AppPagination } from "../../../app/shared/components/AppPagination";
import { useInventoryCatalog } from "../../../lib/hooks/useOperationsInventory";
import { useDebouncedValue } from "../../../lib/hooks/useDebouncedValue";
import { useState } from "react";

function getStockChipStyles(stock: number) {
  if (stock >= 200) {
    return { bg: "#EEF5EE", color: "#466A4A" };
  }
  if (stock >= 50) {
    return { bg: "#F3EBDD", color: "#7A5A33" };
  }
  return { bg: "#F6EAEA", color: "#8E3B3B" };
}

export function StockInventoryScreen() {
  const [inventorySearch, setInventorySearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 12;
  const debouncedInventorySearch = useDebouncedValue(inventorySearch, 250);

  const { data, isLoading, isFetching } = useInventoryCatalog({
    pageNumber,
    pageSize,
    search: debouncedInventorySearch,
  });

  const inventoryItems = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  return (
    <>
      <OperationsPageHeader
        title="Product stock"
        subtitle="Monitor current product stock across the catalog."
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
            to="/operations/stock"
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
            startIcon={<MoveToInboxOutlinedIcon sx={{ fontSize: 18 }} />}
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
            startIcon={<OutboxOutlined sx={{ fontSize: 18 }} />}
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
            </Box>

            <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.06)" }} />

            {isLoading || isFetching ? (
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
                  {inventoryItems.length === 0 && !isLoading && !isFetching && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: "center", py: 4, color: "#8A8A8A" }}>
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
              <AppPagination
                page={pageNumber}
                totalPages={totalPages}
                onChange={setPageNumber}
                totalItems={totalCount}
                pageSize={pageSize}
                unitLabel="products"
                align="flex-end"
              />
            </Box>
          </Stack>
        </Paper>
      </Box>
    </>
  );
}

