import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useOperationsOrderDetail, useUpdateOrderStatus } from "../../../lib/hooks/useOperationsOrders";

export function OperationsOrderDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useOperationsOrderDetail(id);
  const updateStatus = useUpdateOrderStatus();

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
          onClick={() => navigate(-1)}
          sx={{ textTransform: "none" }}
        >
          Back to list
        </Button>
      </Box>
    );
  }

  const order = data;

  const handleSendToPacking = () => {
    if (id) {
      updateStatus.mutate(
        { orderId: id, status: "Processing" },
        {
          onSuccess: () => {
            navigate("/operations/pack");
          },
        }
      );
    }
  };

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
        onClick={() => navigate(-1)}
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
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, fontSize: 13, alignItems: "center" }}>
          <Typography>
            <b>Source:</b> {order.orderSource}
          </Typography>
          <Typography>
            <b>Type:</b> {order.orderType}
          </Typography>
          <Typography>
            <b>Status:</b>{" "}
            <span
              style={{
                textTransform: "capitalize",
                fontWeight: 600,
              }}
            >
              {order.orderStatus}
            </span>
          </Typography>
          <Typography>
            <b>Created:</b> {new Date(order.createdAt).toLocaleString()}
          </Typography>
        </Box>

        {/* Customer Information Section */}
        {(order.customerName || order.customerPhone || order.shippingAddress) && (
          <Box
            sx={{
              pt: 2,
              borderTop: "1px solid rgba(0,0,0,0.08)",
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            {order.customerName && (
              <Box>
                <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
                  Customer Name
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {order.customerName}
                </Typography>
              </Box>
            )}
            {order.customerPhone && (
              <Box>
                <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
                  Phone
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {order.customerPhone}
                </Typography>
              </Box>
            )}
            {order.shippingAddress && (
              <Box sx={{ gridColumn: { xs: "1fr", md: "1 / -1" } }}>
                <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
                  Delivery Address
                </Typography>
                <Typography sx={{ fontWeight: 700, lineHeight: 1.5 }}>
                  {order.shippingAddress.venue && `${order.shippingAddress.venue}, `}
                  {order.shippingAddress.ward && `${order.shippingAddress.ward}, `}
                  {order.shippingAddress.district && `${order.shippingAddress.district}, `}
                  {order.shippingAddress.city}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>

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
        {/* Prescription Information Section */}
        {order.prescription && (
          <Box>
            <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 1, fontWeight: 700 }}>
              👁️ Prescription Information
            </Typography>
            <Box
              sx={{
                bgcolor: "rgba(99, 182, 255, 0.05)",
                borderRadius: 2,
                p: 2,
                border: "1px solid rgba(99, 182, 255, 0.2)",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {order.prescription.isVerified && (
                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: "#d1fae5",
                      border: "1px solid #6ee7b7",
                    }}
                  >
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#059669" }}>
                      VERIFIED
                    </Typography>
                  </Box>
                )}
              </Box>

              {order.prescription.details && order.prescription.details.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {order.prescription.details.map((detail, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 1,
                        bgcolor: "white",
                        borderRadius: 1,
                        border: "1px solid rgba(99, 182, 255, 0.1)",
                        fontSize: 12,
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                        {detail.eye || "Both Eyes"}
                      </Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))", gap: 0.5 }}>
                        {detail.sph !== null && detail.sph !== undefined && (
                          <Typography><b>SPH:</b> {detail.sph}</Typography>
                        )}
                        {detail.cyl !== null && detail.cyl !== undefined && (
                          <Typography><b>CYL:</b> {detail.cyl}</Typography>
                        )}
                        {detail.axis !== null && detail.axis !== undefined && (
                          <Typography><b>AXIS:</b> {detail.axis}</Typography>
                        )}
                        {detail.pd !== null && detail.pd !== undefined && (
                          <Typography><b>PD:</b> {detail.pd}</Typography>
                        )}
                        {detail.add !== null && detail.add !== undefined && (
                          <Typography><b>ADD:</b> {detail.add}</Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ fontSize: 12, color: "text.secondary", fontStyle: "italic" }}>
                  No prescription details available
                </Typography>
              )}
            </Box>
            <Divider sx={{ my: 1.5 }} />
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            mb: 2,
            flexWrap: "wrap",
            pb: 2,
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Change Order Status</Typography>
          <Button
            variant="contained"
            onClick={handleSendToPacking}
            disabled={updateStatus.isPending || order.orderStatus.toLowerCase() === "processing"}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              bgcolor: "#3b82f6",
              "&:hover": {
                bgcolor: "#1d4ed8",
              },
              "&:disabled": {
                opacity: 0.7,
              },
            }}
          >
            {updateStatus.isPending ? (
              <CircularProgress size={16} sx={{ color: "white", mr: 1 }} />
            ) : null}
            {updateStatus.isPending ? "Sending..." : "Send to packing"}
          </Button>
        </Box>

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
                    py: 0.5,
                    fontSize: 13,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {item.productName}
                    </Typography>
                    <Typography sx={{ color: "text.secondary" }}>
                      {item.variantName} · Qty {item.quantity}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600 }}>
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
