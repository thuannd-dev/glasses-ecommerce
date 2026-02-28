import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Grid,
  Chip,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { NavLink } from "react-router-dom";
import { formatMoney } from "../../lib/utils/format";
import { useOrderSuccessPage } from "./hooks/useOrderSuccessPage";

export default function OrderSuccessPage() {
  const { order, address, hasState } = useOrderSuccessPage();

  if (!hasState) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 10, px: 2 }}>
        <Typography fontWeight={900} fontSize={22}>
          Order not found
        </Typography>
        <Typography color="rgba(17,24,39,0.65)" mt={1} mb={3}>
          The order information is unavailable. Please return to shop.
        </Typography>
        <Button
          component={NavLink}
          to="/collections"
          variant="contained"
          sx={{ fontWeight: 900 }}
        >
          Continue shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1000,
        mx: "auto",
        mt: 10,
        px: { xs: 2, md: 3 },
        pb: 8,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          border: "1px solid rgba(17,24,39,0.12)",
          borderRadius: 3,
          p: 4,
          textAlign: "center",
          mb: 4,
        }}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 64, color: "#16a34a" }} />
        <Typography fontWeight={900} fontSize={26} mt={2}>
          Order placed successfully
        </Typography>
        <Typography color="rgba(17,24,39,0.65)" mt={1}>
          Thank you for your purchase. Your order has been received.
        </Typography>
        <Box mt={2} display="flex" justifyContent="center" gap={1} flexWrap="wrap">
          <Chip label={order.id} sx={{ fontWeight: 900 }} />
          <Chip label={order.orderType} variant="outlined" />
          <Chip label={order.orderStatus} color="primary" variant="outlined" />
        </Box>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              border: "1px solid rgba(17,24,39,0.12)",
              borderRadius: 3,
              p: 3,
              mb: 3,
            }}
          >
            <Typography fontWeight={900} fontSize={18}>
              Order Information
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography fontSize={14} mb={1}>
              <b>Source:</b> {order.orderSource}
            </Typography>
            <Typography fontSize={14} mb={1}>
              <b>Type:</b> {order.orderType}
            </Typography>
            <Typography fontSize={14} mb={1}>
              <b>Status:</b> {order.orderStatus}
            </Typography>
            <Typography fontSize={14} mb={1}>
              <b>Order Date:</b> {new Date(order.createdAt).toLocaleString()}
            </Typography>
            {order.customerNote && (
              <Typography fontSize={14} mb={1}>
                <b>Customer note:</b> {order.customerNote}
              </Typography>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography fontWeight={900} mb={1}>
              Payment
            </Typography>
            {order.payment ? (
              <>
                <Typography fontSize={14} mb={0.5}>
                  <b>Method:</b> {order.payment.paymentMethod}
                </Typography>
                <Typography fontSize={14} mb={0.5}>
                  <b>Status:</b> {order.payment.paymentStatus}
                </Typography>
                <Typography fontSize={14} mb={0.5}>
                  <b>Amount:</b> {formatMoney(order.payment.amount)}
                </Typography>
              </>
            ) : (
              <Typography fontSize={14} color="text.secondary">
                Payment information is not available.
              </Typography>
            )}
            {order.statusHistories?.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography fontWeight={900} mb={1}>
                  Status history
                </Typography>
                {order.statusHistories.map((h, idx) => (
                  <Typography key={idx} fontSize={13} color="text.secondary">
                    {new Date(h.createdAt).toLocaleString()} — {h.notes ?? ""} ({h.toStatus})
                  </Typography>
                ))}
              </>
            )}
          </Paper>

          {address && (
            <Paper
              elevation={0}
              sx={{
                border: "1px solid rgba(17,24,39,0.12)",
                borderRadius: 3,
                p: 3,
              }}
            >
              <Typography fontWeight={900} fontSize={18} mb={1}>
                Shipping Address
              </Typography>
              <Typography fontSize={14}>
                {address.recipientName} – {address.recipientPhone}
              </Typography>
              <Typography fontSize={14}>
                {[address.venue, address.ward, address.district, address.city].filter(Boolean).join(", ")}
              </Typography>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              border: "1px solid rgba(17,24,39,0.12)",
              borderRadius: 3,
              p: 3,
            }}
          >
            <Typography fontWeight={900} fontSize={18}>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />
            {order.items.map((item) => (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    bgcolor: "rgba(17,24,39,0.06)",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {item.imageUrl ? (
                    <Box
                      component="img"
                      src={item.imageUrl}
                      alt=""
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography fontSize={10} color="text.secondary">
                        —
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontSize={14}>
                    {item.productName}
                    {item.variantName ? ` (${item.variantName})` : ""} × {item.quantity}
                  </Typography>
                </Box>
                <Typography fontWeight={700}>{formatMoney(item.totalPrice)}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography fontSize={14}>Subtotal</Typography>
              <Typography fontSize={14}>{formatMoney(order.totalAmount)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography fontSize={14}>Shipping fee</Typography>
              <Typography fontSize={14}>{formatMoney(order.shippingFee)}</Typography>
            </Box>
            {order.discountApplied != null && order.discountApplied !== 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography fontSize={14}>Discount</Typography>
                <Typography fontSize={14}>- {formatMoney(order.discountApplied)}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography fontWeight={900} fontSize={20}>
              Total: {formatMoney(order.finalAmount ?? order.totalAmount)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 5 }}>
        <Button component={NavLink} to="/collections" variant="outlined" sx={{ fontWeight: 900 }}>
          Continue shopping
        </Button>
        <Button component={NavLink} to="/orders" variant="contained" sx={{ fontWeight: 900 }}>
          View my orders
        </Button>
      </Box>
    </Box>
  );
}
