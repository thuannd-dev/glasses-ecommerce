import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  LinearProgress,
  Pagination,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { useStaffOrder, useStaffOrders, useUpdateStaffOrderStatus } from "../../../lib/hooks/useStaffOrders";
import type { StaffOrderDto, StaffOrderDetailDto } from "../../../lib/types/staffOrders";

function getStatusColors(status: string) {
  switch (status) {
    case "PendingApproval":
    case "Pending":
      return { border: "#EAEAEA", bg: "#F6F6F6", color: "#4B4B4B" };
    case "Confirmed":
      return { border: "#D4E5D5", bg: "#EEF5EE", color: "#466A4A" };
    case "Rejected":
    case "Cancelled":
      return { border: "#E8CFCF", bg: "#F6EAEA", color: "#8E3B3B" };
    default:
      return { border: "#EAEAEA", bg: "#F6F6F6", color: "#4B4B4B" };
  }
}

function shortenId(id: string) {
  if (!id || id.length <= 14) return id;
  return `${id.slice(0, 8)}...${id.slice(-4)}`;
}

function SalesOrderRow({ summary }: { summary: StaffOrderDto }) {
  const [expanded, setExpanded] = useState(false);
  const updateStatus = useUpdateStaffOrderStatus();
  const { data, isLoading } = useStaffOrder(expanded ? summary.id : undefined);
  const detail = data as StaffOrderDetailDto | undefined;
  const { border, bg, color } = getStatusColors(summary.orderStatus);
  const isPending = summary.orderStatus === "Pending";
  const copyOrderId = () => {
    navigator.clipboard.writeText(summary.id);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "18px",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
        px: 2.75,
        py: 2.25,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 16px 36px rgba(0,0,0,0.08)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600 }}>Order</Typography>
          <Tooltip title={summary.id} arrow>
            <Box
              component="button"
              type="button"
              onClick={copyOrderId}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.3,
                py: 0.45,
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,0.08)",
                bgcolor: "#F7F7F7",
                color: "#171717",
                fontFamily: "monospace",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                "&:hover": { bgcolor: "#EFEFEF" },
              }}
            >
              {shortenId(summary.id)}
              <ContentCopyIcon sx={{ fontSize: 13, color: "#8A8A8A" }} />
            </Box>
          </Tooltip>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          {isPending && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                disabled={updateStatus.isPending}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 12,
                  height: 34,
                  borderRadius: 999,
                  borderColor: "#D4E5D5",
                  bgcolor: "#EEF5EE",
                  color: "#466A4A",
                  "&:hover": { bgcolor: "#E3EFE4", borderColor: "#C8DDCA" },
                }}
                onClick={() =>
                  updateStatus.mutate({
                    id: summary.id,
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
                  fontWeight: 600,
                  fontSize: 12,
                  height: 34,
                  borderRadius: 999,
                  borderColor: "#E8CFCF",
                  bgcolor: "#F6EAEA",
                  color: "#8E3B3B",
                  "&:hover": { borderColor: "#DDBFBF", bgcolor: "#F1E2E2" },
                }}
                onClick={() =>
                  updateStatus.mutate({
                    id: summary.id,
                    newStatus: 6,
                  })
                }
              >
                Reject
              </Button>
            </Stack>
          )}
          <Box
            component="span"
            sx={{
              px: 1.2,
              py: 0.3,
              borderRadius: 999,
              border: `1px solid ${border}`,
              bgcolor: bg,
              color,
              fontSize: 12.5,
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {summary.orderStatus}
          </Box>
          <IconButton
            size="small"
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? "Collapse" : "Expand"}
            sx={{
              width: 36,
              height: 36,
              borderRadius: 999,
              color: expanded ? "#B68C5A" : "#6B6B6B",
              "&:hover": { bgcolor: "#FAFAFA", color: "#171717" },
            }}
          >
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          fontSize: 13,
          color: "#6B6B6B",
        }}
      >
        <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
          {summary.itemCount} item{summary.itemCount !== 1 ? "s" : ""}
        </Typography>
        <Typography component="span" sx={{ color: "rgba(0,0,0,0.3)", mx: 0.25 }}>•</Typography>
        <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
          {new Date(summary.createdAt).toLocaleString()}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: 13, color: "#8A8A8A", fontWeight: 500 }}>Total amount</Typography>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#171717" }}>
          {summary.finalAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
        </Typography>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider sx={{ borderColor: "rgba(0,0,0,0.06)", my: 1.5 }} />
        {isLoading || !detail ? (
          <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>Loading detail...</Typography>
        ) : (
          <Box sx={{ fontSize: 13, color: "#6B6B6B", display: "flex", flexDirection: "column", gap: 1.25 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontWeight: 700, color: "#171717" }}>More details</Typography>
              <Box component="span" sx={{ px: 1, py: 0.25, borderRadius: 999, border: "1px solid rgba(0,0,0,0.08)", bgcolor: "rgba(0,0,0,0.06)", fontSize: 11, color: "#6B6B6B" }}>
                Source: {detail.orderSource}
              </Box>
              <Box component="span" sx={{ px: 1, py: 0.25, borderRadius: 999, border: "1px solid rgba(0,0,0,0.08)", bgcolor: "rgba(0,0,0,0.06)", fontSize: 11, color: "#6B6B6B" }}>
                Type: {detail.orderType}
              </Box>
            </Box>
            <Typography sx={{ fontWeight: 700, color: "#171717" }}>Items</Typography>
            {detail.items.map((item) => {
              const lineTotal = item.totalPrice ?? item.unitPrice * item.quantity;
              return (
                <Box
                  key={item.id}
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: "#171717" }}>{item.productName}</Typography>
                    <Typography>
                      {item.variantName} · Qty {item.quantity}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600 }}>
                    {lineTotal.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                  </Typography>
                </Box>
              );
            })}
            {detail.payment && (
              <>
                <Divider sx={{ borderColor: "rgba(0,0,0,0.06)", my: 1.25 }} />
                <Typography sx={{ fontWeight: 700, color: "#171717" }}>Payment</Typography>
                <Typography>
                  <b>Method:</b> {detail.payment.paymentMethod}
                </Typography>
                <Typography>
                  <b>Status:</b> {detail.payment.paymentStatus}
                </Typography>
                <Typography>
                  <b>Amount:</b>{" "}
                  {detail.payment.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </Typography>
              </>
            )}
            {detail.statusHistories && detail.statusHistories.length > 0 && (
              <>
                <Divider sx={{ borderColor: "rgba(0,0,0,0.06)", my: 1.25 }} />
                <Typography sx={{ fontWeight: 700, color: "#171717" }}>Status history</Typography>
                {detail.statusHistories.map((h, idx) => (
                  <Box key={idx}>
                    <Typography>
                      {h.fromStatus} → <b>{h.toStatus}</b>
                    </Typography>
                    <Typography sx={{ fontSize: 12 }}>
                      {h.notes ? `${h.notes} · ` : ""}
                      {new Date(h.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </>
            )}
          </Box>
        )}
      </Collapse>
    </Paper>
  );
}

export function OrdersScreen() {
  const [searchParams] = useSearchParams();

  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const rawStatus = searchParams.get("status") ?? "Pending";
  const allowedStatuses = ["Pending", "Confirmed", "Cancelled"];
  const statusFilter = allowedStatuses.includes(rawStatus) ? rawStatus : "Pending";

  useEffect(() => {
    setPageNumber(1);
  }, [statusFilter]);

  const { data, isLoading } = useStaffOrders({ pageNumber, pageSize, status: statusFilter });
  const safeOrders = Array.isArray(data?.items) ? data!.items : [];
  const filteredOrders = safeOrders.filter((o) => o.orderStatus === statusFilter);
  const meta = data ? { totalPages: data.totalPages } : null;
  const statusTabs = [
    { label: "Pending", value: "Pending" },
    { label: "Confirmed", value: "Confirmed" },
    { label: "Rejected", value: "Cancelled" },
  ] as const;

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3, lg: 4 },
        py: 4,
        height: "calc(100vh - 56px)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "#8A8A8A" }}>
          SALES CENTER
        </Typography>
        <Box sx={{ mt: 0.75, display: "flex", alignItems: "baseline", gap: 1.25, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800, color: "#171717" }}>
            Orders
          </Typography>
          <Typography
            component="span"
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: "#6B6B6B",
              bgcolor: "#F7F7F7",
              border: "1px solid rgba(0,0,0,0.08)",
              px: 1.2,
              py: 0.25,
              borderRadius: 999,
            }}
          >
            {filteredOrders.length} orders
          </Typography>
        </Box>
        <Typography sx={{ mt: 0.5, color: "#6B6B6B", fontSize: 14 }}>
          Manage pending approvals and order confirmations.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "inline-flex",
          gap: 0.5,
          p: 0.5,
          borderRadius: 999,
          bgcolor: "#F7F7F7",
          border: "1px solid rgba(0,0,0,0.08)",
          alignSelf: "flex-start",
          mb: 1.5,
        }}
      >
        {statusTabs.map((tab) => {
          const active = statusFilter === tab.value;
          return (
            <Button
              key={tab.value}
              component={RouterLink}
              to={`/sales/orders?status=${tab.value}`}
              sx={{
                borderRadius: 999,
                px: 2.5,
                py: 0.9,
                textTransform: "none",
                fontWeight: 600,
                color: active ? "#171717" : "#6B6B6B",
                position: "relative",
                bgcolor: active ? "#FFFFFF" : "transparent",
                border: active ? "1px solid rgba(182,140,90,0.4)" : "1px solid transparent",
                boxShadow: active ? "0 6px 14px rgba(0,0,0,0.06)" : "none",
                "&::after": active
                  ? {
                      content: '""',
                      display: "block",
                      width: "60%",
                      height: 2,
                      borderRadius: 2,
                      bgcolor: "#B68C5A",
                      position: "absolute",
                      bottom: 6,
                      left: "20%",
                    }
                  : undefined,
              }}
            >
              {tab.label}
            </Button>
          );
        })}
      </Box>

      {isLoading ? (
        <Box sx={{ mt: 2 }}>
          <LinearProgress sx={{ borderRadius: 1 }} />
        </Box>
      ) : filteredOrders.length === 0 ? (
        <Box sx={{ mt: 3 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: "18px",
              border: "1px solid rgba(0,0,0,0.08)",
              px: 3,
              py: 4,
              textAlign: "center",
            }}
          >
            <Typography color="text.secondary">No orders yet.</Typography>
          </Paper>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.25,
              mt: 1.5,
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              pr: { md: 1 },
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {filteredOrders.map((o) => (
              <SalesOrderRow key={o.id} summary={o} />
            ))}
          </Box>

          {meta && meta.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, pt: 1 }}>
              <Pagination
                count={meta.totalPages}
                page={pageNumber}
                onChange={(_, page) => setPageNumber(page)}
                color="primary"
                size="small"
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
