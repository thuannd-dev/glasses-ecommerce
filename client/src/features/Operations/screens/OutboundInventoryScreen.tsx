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
  Divider,
  InputAdornment,
  LinearProgress,
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
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

import { OperationsPageHeader } from "../components/OperationsPageHeader";
import { useOutboundInventoryScreen } from "../hooks/useOutboundInventoryScreen";
import { AppPagination } from "../../../app/shared/components/AppPagination";

function getStockChipStyles(stock: number) {
  if (stock >= 200) {
    return { bg: "#EEF5EE", color: "#466A4A" };
  }
  if (stock >= 50) {
    return { bg: "#F3EBDD", color: "#7A5A33" };
  }
  return { bg: "#F6EAEA", color: "#8E3B3B" };
}

export function OutboundInventoryScreen() {
  const {
    inventorySearch,
    setInventorySearch,
    pageNumber,
    setPageNumber,
    dialogOpen,
    setDialogOpen,
    orderId,
    setOrderId,
    notes,
    setNotes,
    inventoryItems,
    totalPages,
    totalCount,
    isInventoryLoading,
    isInventoryFetching,
    outboundMutation,
    filteredOrders,
    selectedOrderOption,
    isOrdersLoading,
    normalizedOrderId,
    selectedOrderDetail,
    isOrderDetailLoading,
    isFormValid,
    handleSubmit,
  } = useOutboundInventoryScreen();

  return (
    <>
      <OperationsPageHeader
        title="Outbound inventory"
        subtitle="Monitor stock and record warehouse issues."
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
                startIcon={<RemoveCircleOutlineIcon />}
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
                New outbound
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
              <Box sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
                <AppPagination
                  page={pageNumber}
                  totalPages={totalPages}
                  onChange={setPageNumber}
                  totalItems={totalCount}
                  pageSize={10}
                  unitLabel="products"
                  align="flex-end"
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
        <DialogTitle sx={{ fontWeight: 700, color: "#171717" }}>Create outbound transaction</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              label="Order ID"
              placeholder="Enter customer order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              fullWidth
              sx={{ display: "none" }}
            />
            <Autocomplete
              options={filteredOrders}
              value={selectedOrderOption}
              onChange={(_, value) => {
                if (value == null) setOrderId("");
                else if (typeof value === "string") setOrderId(value);
                else setOrderId(value.id);
              }}
              onInputChange={(_, value) => {
                // order search state is handled inside the logic hook
                setOrderId(value);
              }}
              getOptionLabel={(option) =>
                typeof option === "string"
                  ? option
                  : `${option.id}${option.walkInCustomerName ? ` · ${option.walkInCustomerName}` : ""}`
              }
              isOptionEqualToValue={(option, value) =>
                typeof option === "string" && typeof value === "string"
                  ? option === value
                  : typeof option === "object" && option != null && typeof value === "object" && value != null && "id" in option && "id" in value
                    ? option.id === value.id
                    : false
              }
              loading={isOrdersLoading}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Order ID"
                  placeholder="Search or paste customer order ID"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isOrdersLoading ? <CircularProgress color="inherit" size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            {normalizedOrderId && (
              <Box
                sx={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 2.5,
                  p: 1.5,
                  bgcolor: "#FAFAF8",
                }}
              >
                {isOrderDetailLoading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#6B6B6B", fontSize: 13 }}>
                    <CircularProgress size={16} />
                    Loading order information...
                  </Box>
                ) : selectedOrderDetail ? (
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontWeight: 700, color: "#171717", fontSize: 14 }}>
                        Order preview
                      </Typography>
                      <Chip
                        size="small"
                        label={selectedOrderDetail.orderStatus}
                        sx={{
                          height: 22,
                          fontSize: 11,
                          fontWeight: 600,
                          borderRadius: 999,
                          bgcolor: "#F6F6F6",
                          color: "#4B4B4B",
                          border: "1px solid #EAEAEA",
                        }}
                      />
                    </Box>
                    <Typography sx={{ color: "#6B6B6B", fontSize: 13 }}>
                      ID: {selectedOrderDetail.id}
                    </Typography>
                    <Typography sx={{ color: "#6B6B6B", fontSize: 13 }}>
                      Customer: {selectedOrderDetail.walkInCustomerName || "Walk-in / N/A"}
                    </Typography>
                    <Typography sx={{ color: "#6B6B6B", fontSize: 13 }}>
                      Created: {new Date(selectedOrderDetail.createdAt).toLocaleString()}
                    </Typography>
                    <Typography sx={{ color: "#171717", fontSize: 13, fontWeight: 700 }}>
                      Total: {selectedOrderDetail.finalAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </Typography>
                    <Divider sx={{ borderColor: "rgba(0,0,0,0.06)" }} />
                    <Typography sx={{ color: "#6B6B6B", fontSize: 12.5 }}>
                      Items: {selectedOrderDetail.items.length}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography sx={{ color: "#8A8A8A", fontSize: 13 }}>
                    No order information found for this Order ID.
                  </Typography>
                )}
              </Box>
            )}

            <TextField
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />

            {outboundMutation.isError && (
              <Alert severity="error">
                Failed to create outbound transaction. Please check input and try again.
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
            disabled={!isFormValid || outboundMutation.isPending}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "#171717",
              "&:hover": { bgcolor: "#000000" },
            }}
          >
            {outboundMutation.isPending ? "Submitting..." : "Record outbound"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
