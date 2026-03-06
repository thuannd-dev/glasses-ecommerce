import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  Divider,
  Button,
  Stack,
} from "@mui/material";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useStaffOrder, useUpdateStaffOrderStatus } from "../../../lib/hooks/useStaffOrders";

export function OrderDetailScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useStaffOrder(id);
  const updateStatus = useUpdateStaffOrderStatus();

  const backUrl = `/sales/orders?${searchParams.toString()}`;

  if (isLoading) {
    return (
      <Box sx={{ px: { xs: 2, md: 4, lg: 6 }, py: 4 }}>
        <LinearProgress sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box sx={{ px: { xs: 2, md: 4, lg: 6 }, py: 4 }}>
        <Typography color="error" sx={{ mb: 2 }}>
          Failed to load order detail.
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate(backUrl)}
          sx={{ textTransform: "none" }}
        >
          Back to list
        </Button>
      </Box>
    );
  }

  const order = data;

  return (
    <Box sx={{ px: { xs: 2, md: 4, lg: 6 }, py: 4 }}>
      <Button
        variant="text"
        sx={{
          textTransform: "none",
          mb: 1,
          fontWeight: 700,
          color: "black",
        }}
        onClick={() => navigate(backUrl)}
      >
        ← Back to list
      </Button>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography sx={{ fontSize: 24, fontWeight: 900 }}>
          Order ID: {order.id}
        </Typography>

        {order.orderStatus === "Pending" && (
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Button
              variant="contained"
              size="small"
              disabled={updateStatus.isPending}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                bgcolor: "#16a34a",
                "&:hover": { bgcolor: "#15803d" },
              }}
              onClick={() =>
                updateStatus.mutate(
                  {
                    id: order.id,
                    newStatus: 1,
                  },
                  {
                    onSuccess: () => {
                      toast.success("Order confirmed");
                      navigate(backUrl);
                    },
                    onError: (error) => {
                      const errorMsg = error instanceof Error ? error.message : "Failed to confirm order";
                      toast.error(errorMsg);
                    },
                  }
                )
              }
            >
              Confirm
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={updateStatus.isPending}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                borderColor: "#dc2626",
                color: "#dc2626",
                "&:hover": { borderColor: "#b91c1c", bgcolor: "rgba(220,38,38,0.04)" },
              }}
              onClick={() =>
                updateStatus.mutate(
                  {
                    id: order.id,
                    newStatus: 6,
                  },
                  {
                    onSuccess: () => {
                      toast.success("Order rejected");
                      navigate(backUrl);
                    },
                    onError: (error) => {
                      const errorMsg = error instanceof Error ? error.message : "Failed to reject order";
                      toast.error(errorMsg);
                    },
                  }
                )
              }
            >
              Reject
            </Button>
          </Stack>
        )}
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, fontSize: 13 }}>
          <Typography>
            <b>Source:</b> {order.orderSource}
          </Typography>
          <Typography>
            <b>Type:</b> {order.orderType}
          </Typography>
          <Typography>
            <b>Status:</b> {order.orderStatus}
          </Typography>
          <Typography>
            <b>Created:</b> {new Date(order.createdAt).toLocaleString()}
          </Typography>
        </Box>

        <Divider />

        <Box>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Items</Typography>
          {Array.isArray(order.items) &&
            order.items.map((item) => {
              const lineTotal =
                (item.totalPrice ?? item.unitPrice * item.quantity) || 0;
              return (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1.5,
                    py: 1,
                    fontSize: 13,
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 1.5,
                      bgcolor: "rgba(0,0,0,0.04)",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {item.productImageUrl ? (
                      <Box
                        component="img"
                        src={item.productImageUrl}
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
                          color: "text.secondary",
                          fontSize: 10,
                        }}
                      >
                        —
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {item.productName}
                    </Typography>
                    <Typography sx={{ color: "text.secondary" }}>
                      {item.variantName} · Qty {item.quantity}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600, flexShrink: 0 }}>
                    {lineTotal.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </Typography>
                </Box>
              );
            })}
        </Box>

        <Divider />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <Typography sx={{ color: "text.secondary" }}>Subtotal</Typography>
            <Typography>
              {(order.totalAmount || 0).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </Typography>
          </Box>

          {order.shippingFee > 0 && (
            <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <Typography sx={{ color: "text.secondary" }}>Shipping</Typography>
              <Typography>
                {(order.shippingFee || 0).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </Typography>
            </Box>
          )}

          {order.discountApplied && order.discountApplied > 0 && (
            <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <Typography sx={{ color: "text.secondary" }}>Discount</Typography>
              <Typography sx={{ color: "#16a34a" }}>
                -{(order.discountApplied).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 0.5 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 700 }}>
              Total amount
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 900 }}>
              {(() => {
                const amount =
                  (order.finalAmount ?? order.totalAmount ?? 0) || 0;
                return amount.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                });
              })()}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {order.payment && (
          <>
            <Divider />
            <Box sx={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography sx={{ fontWeight: 700 }}>Payment</Typography>
              <Typography>
                <b>Method:</b> {order.payment.paymentMethod}
              </Typography>
              <Typography>
                <b>Status:</b> {order.payment.paymentStatus}
              </Typography>
              <Typography>
                <b>Amount:</b>{" "}
                {order.payment.amount.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </Typography>
              <Typography>
                <b>Paid at:</b>{" "}
                {order.payment.paymentAt
                  ? new Date(order.payment.paymentAt).toLocaleString()
                  : "—"}
              </Typography>
            </Box>
          </>
        )}

        {Array.isArray(order.statusHistories) && order.statusHistories.length > 0 && (
          <>
            <Divider />
            <Box sx={{ fontSize: 13 }}>
              <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Status history</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {order.statusHistories.map((h, idx) => {
                  const showUser = h.toStatus !== "Pending" && (h.changedByUserName || h.changedByUserEmail);
                  
                  return (
                    <Box key={idx}>
                      <Typography sx={{ fontWeight: 700 }}>
                        {h.toStatus}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography sx={{ color: "text.secondary" }}>
                          {h.notes}
                          {h.notes && " · "}
                          {new Date(h.createdAt).toLocaleString()}
                        </Typography>
                        {showUser && (
                          <Box
                            sx={{
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              bgcolor: "rgba(99, 102, 241, 0.12)",
                              border: "1px solid rgba(99, 102, 241, 0.3)",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#4338ca",
                                whiteSpace: "nowrap",
                              }}
                            >
                              by {h.changedByUserName || h.changedByUserEmail}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}

