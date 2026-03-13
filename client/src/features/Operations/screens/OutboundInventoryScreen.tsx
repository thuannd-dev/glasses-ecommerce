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
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MoveToInboxOutlinedIcon from "@mui/icons-material/MoveToInboxOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

import { OperationsPageHeader } from "../components/OperationsPageHeader";
import { useOutboundInventoryScreen } from "../hooks/useOutboundInventoryScreen";

export function OutboundInventoryScreen() {
  const {
    dialogOpen,
    setDialogOpen,
    orderId,
    setOrderId,
    notes,
    setNotes,
    totalCount,
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
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#171717" }}>
                Outbound overview
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                View outbound inventory records created when processing customer orders.
              </Typography>
            </Box>
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
                  <Stack spacing={1.5}>
                    {/* Header */}
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

                    {/* Top meta */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, fontSize: 13, color: "#6B6B6B" }}>
                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                        <strong>ID:</strong> {selectedOrderDetail.id}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                        <strong>Type:</strong> {selectedOrderDetail.orderType} ·{" "}
                        <strong>Source:</strong> {selectedOrderDetail.orderSource}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                        <strong>Created:</strong>{" "}
                        {new Date(selectedOrderDetail.createdAt).toLocaleString()}
                      </Typography>
                    </Box>

                    {/* Customer & shipping */}
                    <Box sx={{ mt: 0.5 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#171717", mb: 0.25 }}>
                        Customer
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                        {selectedOrderDetail.customerName ||
                          selectedOrderDetail.walkInCustomerName ||
                          "Walk‑in / N/A"}
                        {selectedOrderDetail.customerPhone || selectedOrderDetail.walkInCustomerPhone
                          ? ` · ${selectedOrderDetail.customerPhone ?? selectedOrderDetail.walkInCustomerPhone}`
                          : ""}
                      </Typography>
                      {selectedOrderDetail.shippingAddress && (
                        <Typography sx={{ fontSize: 12.5, color: "#8A8A8A", mt: 0.25 }}>
                          {[
                            selectedOrderDetail.shippingAddress.venue,
                            selectedOrderDetail.shippingAddress.ward,
                            selectedOrderDetail.shippingAddress.district,
                            selectedOrderDetail.shippingAddress.city,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </Typography>
                      )}
                    </Box>

                    {/* Amounts & payment */}
                    <Box sx={{ mt: 0.5 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#171717", mb: 0.25 }}>
                        Payment & totals
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                        <strong>Items:</strong> {selectedOrderDetail.items.length}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                        <strong>Subtotal:</strong>{" "}
                        {selectedOrderDetail.totalAmount.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                        {" · "}
                        <strong>Shipping:</strong>{" "}
                        {selectedOrderDetail.shippingFee.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                        <strong>Discount:</strong>{" "}
                        {selectedOrderDetail.discountApplied
                          ? `- ${selectedOrderDetail.discountApplied.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}`
                          : "None"}
                      </Typography>
                      <Typography sx={{ color: "#171717", fontSize: 13, fontWeight: 700 }}>
                        Final total:{" "}
                        {selectedOrderDetail.finalAmount.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </Typography>
                      {selectedOrderDetail.payment && (
                        <Typography sx={{ fontSize: 12.5, color: "#6B6B6B", mt: 0.25 }}>
                          <strong>Payment:</strong> {selectedOrderDetail.payment.paymentMethod} ·{" "}
                          {selectedOrderDetail.payment.paymentStatus}
                        </Typography>
                      )}
                    </Box>

                    {/* Items summary */}
                    {selectedOrderDetail.items && selectedOrderDetail.items.length > 0 && (
                      <Box sx={{ mt: 0.75 }}>
                        <Typography
                          sx={{ fontSize: 12, fontWeight: 600, color: "#171717", mb: 0.25 }}
                        >
                          Items in this order
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                          {selectedOrderDetail.items.map((it) => (
                            <Typography
                              key={it.id}
                              sx={{ fontSize: 12.5, color: "#4B4B4B" }}
                            >
                              {it.productName}
                              {it.variantName ? ` · ${it.variantName}` : ""} — Qty {it.quantity} ·{" "}
                              {it.totalPrice.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}
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
