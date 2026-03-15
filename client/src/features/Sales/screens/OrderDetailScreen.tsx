import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  Divider,
  Button,
  Stack,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useStaffOrder, useUpdateStaffOrderStatus } from "../../../lib/hooks/useStaffOrders";

export function OrderDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useStaffOrder(id);
  const updateStatus = useUpdateStaffOrderStatus();

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
          onClick={() => navigate("/sales/orders")}
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
        onClick={() => navigate("/sales/orders")}
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
              updateStatus.mutate({
                id: order.id,
                newStatus: 1,
              })
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
              updateStatus.mutate({
                id: order.id,
                newStatus: 6,
              })
            }
          >
            Reject
          </Button>
        </Stack>
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
          <Typography sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <b>Source:</b>
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 1,
                border: "1px solid #22c55e",
                bgcolor: "rgba(34,197,94,0.12)",
                color: "#15803d",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {order.orderSource}
            </Box>
          </Typography>
          <Typography sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <b>Type:</b>
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 1,
                border: "1px solid #0ea5e9",
                bgcolor: "rgba(14,165,233,0.12)",
                color: "#0369a1",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {order.orderType}
            </Box>
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

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
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
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Status history</Typography>
              {order.statusHistories.map((h, idx) => (
                <Box key={idx} sx={{ mb: 0.75 }}>
                  <Typography>
                    <b>{h.toStatus}</b>
                  </Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    {h.notes || ""}
                    {h.notes && " · "}
                    {new Date(h.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}

