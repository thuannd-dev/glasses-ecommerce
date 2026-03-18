import { Box, Typography, Paper, Divider, Button, Grid, Chip } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { NavLink } from "react-router-dom";
import { formatMoney } from "../../lib/utils/format";
import { getOrderPrescription } from "../orders/orderPrescriptionCache";
import { PrescriptionDisplay } from "../../app/shared/components/PrescriptionDisplay";
import { useOrderSuccessPage } from "./hooks/useOrderSuccessPage";

const PALETTE = {
  cardBg: "#FFFFFF",
  border: "#ECECEC",
  divider: "#F1F1F1",
  textMain: "#171717",
  textSecondary: "#6B6B6B",
  textMuted: "#8A8A8A",
  accent: "#B68C5A",
};

function getStatusChipStyle(status: string | undefined) {
  if (!status) return {};
  const lower = status.toLowerCase();

  if (lower.includes("cancel") || lower.includes("refund")) {
    return {
      bgcolor: "#FDECEC",
      borderColor: "#F5C2C0",
      color: "#B3261E",
    };
  }

  if (lower.includes("shipped")) {
    return {
      bgcolor: "#F3EBDD",
      borderColor: "#E7D6BA",
      color: "#7A5A33",
    };
  }

  if (lower.includes("ready")) {
    return {
      bgcolor: "#EEF5EE",
      borderColor: "#D4E5D5",
      color: "#466A4A",
    };
  }

  if (lower.includes("online")) {
    return {
      bgcolor: "#F3F1FB",
      borderColor: "#DFD8F6",
      color: "#5E4FA8",
    };
  }

  if (lower.includes("pending")) {
    return {
      bgcolor: "#F6F6F6",
      borderColor: "#EAEAEA",
      color: "#4B4B4B",
    };
  }

  return {
    bgcolor: "#F5F5F5",
    borderColor: "#E4E4E4",
    color: PALETTE.textSecondary,
  };
}

const OrderNotFoundBlock = () => (
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

export default function OrderSuccessPage() {
  const { order, address, hasState } = useOrderSuccessPage();

  if (!hasState || !order) {
    return <OrderNotFoundBlock />;
  }

  return (
    <Box
      sx={{
        maxWidth: 1120,
        mx: "auto",
        mt: 10,
        px: { xs: 2, md: 3 },
        pb: 8,
        bgcolor: "#FFFFFF",
      }}
    >
      {/* Success hero */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${PALETTE.border}`,
          borderRadius: 2.5,
          p: { xs: 3, md: 4 },
          mb: 4,
          boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
          bgcolor: PALETTE.cardBg,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                border: "1px solid #E0F2E9",
                bgcolor: "#F4FBF7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 30, color: "#16a34a" }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: 22,
                  color: PALETTE.textMain,
                }}
              >
                Order placed successfully
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 14,
                  color: PALETTE.textSecondary,
                }}
              >
                Thank you. Your eyewear is now in motion.
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 999,
                bgcolor: "#F7F7F7",
                border: `1px solid ${PALETTE.border}`,
                fontSize: 12,
                fontWeight: 600,
                color: PALETTE.textMain,
                fontFamily: "monospace",
              }}
            >
              ID: {order.id}
            </Box>
            <Chip
              label={order.orderStatus}
              size="small"
              sx={{
                textTransform: "capitalize",
                fontWeight: 600,
                borderRadius: 999,
                borderWidth: 1,
                borderStyle: "solid",
                fontSize: 12,
                px: 1.25,
                ...getStatusChipStyle(order.orderStatus),
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Main content */}
      <Grid container spacing={4}>
        {/* Left column */}
        <Grid item xs={12} md={7}>
          {/* Order information */}
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${PALETTE.border}`,
              borderRadius: 2.5,
              p: 3,
              mb: 3,
              bgcolor: PALETTE.cardBg,
              boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 17,
                color: PALETTE.textMain,
              }}
            >
              Order information
            </Typography>
            <Divider sx={{ my: 2, borderColor: PALETTE.divider }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <Typography sx={{ color: PALETTE.textMuted }}>Status</Typography>
                <Typography sx={{ color: PALETTE.textMain, fontWeight: 600 }}>
                  {order.orderStatus}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <Typography sx={{ color: PALETTE.textMuted }}>Order date</Typography>
                <Typography sx={{ color: PALETTE.textMain }}>
                  {new Date(order.createdAt).toLocaleString()}
                </Typography>
              </Box>
              {order.customerNote && (
                <Box sx={{ mt: 0.5 }}>
                  <Typography sx={{ fontSize: 13, color: PALETTE.textMuted, mb: 0.25 }}>
                    Customer note
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: PALETTE.textMain }}>
                    {order.customerNote}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Payment block */}
            <Divider sx={{ my: 2, borderColor: PALETTE.divider }} />
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 15,
                color: PALETTE.textMain,
                mb: 1,
              }}
            >
              Payment
            </Typography>
            {order.payment ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, fontSize: 14 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: PALETTE.textMuted }}>Method</Typography>
                  <Typography sx={{ color: PALETTE.textMain, fontWeight: 500 }}>
                    {order.payment.paymentMethod}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: PALETTE.textMuted }}>Status</Typography>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 999,
                      border: "1px solid #E5E5E5",
                      fontSize: 12,
                      fontWeight: 500,
                      bgcolor:
                        order.payment.paymentStatus?.toLowerCase() === "pending"
                          ? "#FFF7ED"
                          : "#F4F4F5",
                      color:
                        order.payment.paymentStatus?.toLowerCase() === "pending"
                          ? "#92400E"
                          : PALETTE.textSecondary,
                    }}
                  >
                    {order.payment.paymentStatus}
                  </Box>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: PALETTE.textMuted }}>Amount</Typography>
                  <Typography sx={{ color: PALETTE.textMain, fontWeight: 600 }}>
                    {formatMoney(order.payment.amount)}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography sx={{ fontSize: 14, color: PALETTE.textSecondary }}>
                Payment information is not available.
              </Typography>
            )}

            {/* Status history as timeline */}
            {order.statusHistories?.length > 0 && (
              <>
                <Divider sx={{ my: 2, borderColor: PALETTE.divider }} />
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: 15,
                    color: PALETTE.textMain,
                    mb: 1.25,
                  }}
                >
                  Status history
                </Typography>
                <Box sx={{ position: "relative", pl: 2 }}>
                  {order.statusHistories.length > 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 6,
                        top: 6,
                        bottom: 6,
                        width: 1,
                        bgcolor: PALETTE.divider,
                      }}
                    />
                  )}
                  {order.statusHistories.map((h, i) => {
                    const isLast = i === order.statusHistories!.length - 1;
                    return (
                      <Box
                        key={i}
                        sx={{
                          display: "flex",
                          gap: 2,
                          mb: i === order.statusHistories!.length - 1 ? 0 : 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            width: 14,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              mt: 0.25,
                              border: isLast ? `2px solid ${PALETTE.accent}` : "1px solid #D4D4D4",
                              bgcolor: isLast ? "#FFFFFF" : "#F5F5F5",
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            sx={{
                              fontSize: 14,
                              color: PALETTE.textMain,
                              fontWeight: isLast ? 600 : 500,
                            }}
                          >
                            {h.toStatus}
                            {h.notes ? ` · ${h.notes}` : ""}
                          </Typography>
                          <Typography
                            sx={{ fontSize: 12, color: PALETTE.textMuted, mt: 0.25 }}
                          >
                            {h.createdAt ? new Date(h.createdAt).toLocaleString() : ""}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </>
            )}
          </Paper>

          {/* Shipping address */}
          {address && (
            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${PALETTE.border}`,
                borderRadius: 2.5,
                p: 3,
                bgcolor: PALETTE.cardBg,
                boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 17,
                  color: PALETTE.textMain,
                  mb: 1,
                }}
              >
                Shipping address
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: PALETTE.textMain,
                  }}
                >
                  {address.recipientName} · {address.recipientPhone}
                </Typography>
                {address.venue && (
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: PALETTE.textSecondary,
                    }}
                  >
                    {address.venue}
                  </Typography>
                )}
                <Typography
                  sx={{
                    fontSize: 13,
                    color: PALETTE.textSecondary,
                  }}
                >
                  {[address.ward, address.district, address.city].filter(Boolean).join(", ")}
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* Right column: summary */}
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              position: { md: "sticky" },
              top: { md: 96 },
            }}
          >
            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${PALETTE.border}`,
                borderRadius: 2.5,
                p: 3,
                bgcolor: PALETTE.cardBg,
                boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 17,
                  color: PALETTE.textMain,
                }}
              >
                Order summary
              </Typography>
              <Divider sx={{ my: 2, borderColor: PALETTE.divider }} />
              {order.items.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 1.25,
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 1.5,
                      bgcolor: "#F7F7F7",
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
                    ) : null}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 14,
                        color: PALETTE.textMain,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.productName}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: PALETTE.textMuted,
                      }}
                    >
                      {item.variantName ? `${item.variantName} · ` : ""}
                      × {item.quantity}
                    </Typography>
                    {(() => {
                      const prescription = getOrderPrescription(order.id, item.id);
                      return prescription ? (
                        <PrescriptionDisplay prescription={prescription} variant="inline" />
                      ) : null;
                    })()}
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: PALETTE.textMain,
                    }}
                  >
                    {formatMoney(item.totalPrice)}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2, borderColor: PALETTE.divider }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ fontSize: 13, color: PALETTE.textSecondary }}>
                  Subtotal
                </Typography>
                <Typography sx={{ fontSize: 14, color: PALETTE.textMain }}>
                  {formatMoney(order.totalAmount)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ fontSize: 13, color: PALETTE.textSecondary }}>
                  Shipping fee
                </Typography>
                <Typography sx={{ fontSize: 14, color: PALETTE.textMain }}>
                  {formatMoney(order.shippingFee)}
                </Typography>
              </Box>
              {order.discountApplied != null && order.discountApplied !== 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography sx={{ fontSize: 13, color: PALETTE.textSecondary }}>
                    Discount
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: PALETTE.textMain }}>
                    - {formatMoney(order.discountApplied)}
                  </Typography>
                </Box>
              )}
              <Divider sx={{ my: 2, borderColor: PALETTE.divider }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: PALETTE.accent,
                    }}
                  />
                  <Typography sx={{ fontSize: 14, color: PALETTE.textSecondary }}>
                    Total
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: 20,
                    color: PALETTE.textMain,
                  }}
                >
                  {formatMoney(order.finalAmount ?? order.totalAmount)}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* CTAs */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mt: 5,
          flexWrap: "wrap",
        }}
      >
        <Button
          component={NavLink}
          to="/collections"
          variant="outlined"
          sx={{
            minWidth: 180,
            height: 44,
            borderRadius: 1.75,
            borderColor: PALETTE.border,
            color: PALETTE.textMain,
            fontWeight: 600,
            textTransform: "none",
            px: 3,
            "&:hover": {
              bgcolor: "#FAFAFA",
              borderColor: PALETTE.border,
            },
          }}
        >
          Continue shopping
        </Button>
        <Button
          component={NavLink}
          to="/orders"
          variant="contained"
          sx={{
            minWidth: 190,
            height: 44,
            borderRadius: 1.75,
            bgcolor: "#111827",
            color: "#FFFFFF",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            px: 3,
            boxShadow: "0 8px 22px rgba(0,0,0,0.16)",
            "&:hover": {
              bgcolor: "#151826",
              boxShadow: "0 10px 26px rgba(0,0,0,0.18)",
            },
            "&:focus-visible": {
              outline: "2px solid rgba(182,140,90,0.5)",
              outlineOffset: 3,
            },
          }}
        >
          View my orders
        </Button>
      </Box>
    </Box>
  );
}
