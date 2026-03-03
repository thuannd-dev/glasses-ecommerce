import { useState } from "react";
import {
  Box,
  Chip,
  LinearProgress,
  Pagination,
  Paper,
  Typography,
  Collapse,
  Divider,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { useOperationsOrders, useOperationsOrderDetail } from "../../../lib/hooks/useOperationsOrders";
import type { StaffOrderDto, StaffOrderDetailDto } from "../../../lib/types/staffOrders";

export function TrackingScreen() {
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useOperationsOrders({
    pageNumber,
    pageSize,
    status: "Shipped",
  });

  const safeOrders: StaffOrderDto[] = Array.isArray(data?.items)
    ? (data!.items as unknown as StaffOrderDto[])
    : [];
  const totalPages = data?.totalPages ?? 1;

  const getStatusColors = (status: string) => {
    switch (status) {
      case "Pending":
        return {
          border: "#0ea5e9",
          bg: "rgba(14,165,233,0.12)",
          color: "#0369a1",
        };
      case "Confirmed":
        return {
          border: "#8b5cf6",
          bg: "rgba(139,92,246,0.12)",
          color: "#5b21b6",
        };
      case "Processing":
        return {
          border: "#f97316",
          bg: "rgba(249,115,22,0.12)",
          color: "#c2410c",
        };
      case "Shipped":
      case "Delivered":
      case "Completed":
        return {
          border: "#22c55e",
          bg: "rgba(34,197,94,0.12)",
          color: "#15803d",
        };
      case "Cancelled":
      case "Refunded":
        return {
          border: "#ef4444",
          bg: "rgba(239,68,68,0.12)",
          color: "#b91c1c",
        };
      default:
        return {
          border: "rgba(148,163,184,0.8)",
          bg: "rgba(148,163,184,0.18)",
          color: "#475569",
        };
    }
  };

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 12, letterSpacing: 5, textTransform: "uppercase", color: "text.secondary" }}>
          Operations Center
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 26, fontWeight: 900 }} color="text.primary">
          Shipped orders
        </Typography>
        <Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: 14 }}>
          Orders that have been marked as shipped.
        </Typography>
      </Box>

      <Box
        sx={{
          px: { xs: 0, md: 0 },
          height: "calc(100vh - 56px)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.08)",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {isLoading ? (
            <LinearProgress sx={{ borderRadius: 1 }} />
          ) : safeOrders.length === 0 ? (
            <Typography color="text.secondary">No shipped orders yet.</Typography>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  mt: 1,
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  pr: { md: 1 },
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
              >
                {safeOrders.map((o) => (
                  <ShippedOrderRow key={o.id} summary={o} getStatusColors={getStatusColors} />
                ))}
              </Box>

              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, pt: 1 }}>
                  <Pagination
                    count={totalPages}
                    page={pageNumber}
                    onChange={(_, page) => setPageNumber(page)}
                    color="primary"
                    size="small"
                  />
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>
    </>
  );
}

function ShippedOrderRow({
  summary,
  getStatusColors,
}: {
  summary: StaffOrderDto;
  getStatusColors: (status: string) => { border: string; bg: string; color: string };
}) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading } = useOperationsOrderDetail(summary.id);
  const detail = data as StaffOrderDetailDto | undefined;

  const { border, bg, color } = getStatusColors(summary.orderStatus);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.08)",
        px: 3,
        py: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
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
        <Typography sx={{ fontWeight: 700 }}>
          Order ID: {summary.id}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Chip
            label={summary.orderStatus}
            size="small"
            sx={{
              fontWeight: 700,
              textTransform: "capitalize",
              border: `1px solid ${border}`,
              bgcolor: bg,
              color,
            }}
          />
          <IconButton
            size="small"
            onClick={() => setExpanded((e) => !e)}
            sx={{ ml: 0.5 }}
          >
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          fontSize: 13,
          color: "text.secondary",
        }}
      >
        <Typography>
          <b>Source:</b> {summary.orderSource}
        </Typography>
        <Typography>
          <b>Type:</b> {summary.orderType}
        </Typography>
        <Typography>
          <b>Items:</b> {summary.itemCount}
        </Typography>
        <Typography>
          <b>Created:</b>{" "}
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
        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
          Total amount
        </Typography>
        <Typography sx={{ fontSize: 18, fontWeight: 900 }}>
          {summary.finalAmount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </Typography>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider sx={{ my: 1.5 }} />
        {isLoading || !detail ? (
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Loading detail...
          </Typography>
        ) : (
          <Box sx={{ fontSize: 13, color: "text.secondary", display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography sx={{ fontWeight: 700, color: "text.primary" }}>Items</Typography>
            {detail.items.map((item) => {
              const lineTotal =
                (item.totalPrice ?? item.unitPrice * item.quantity) || 0;
              return (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
                      {item.productName}
                    </Typography>
                    <Typography>
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

            {detail.payment && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography sx={{ fontWeight: 700, color: "text.primary" }}>Payment</Typography>
                <Typography>
                  <b>Method:</b> {detail.payment.paymentMethod}
                </Typography>
                <Typography>
                  <b>Status:</b> {detail.payment.paymentStatus}
                </Typography>
                <Typography>
                  <b>Amount:</b>{" "}
                  {detail.payment.amount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </Typography>
              </>
            )}

            {detail.statusHistories && detail.statusHistories.length > 0 && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography sx={{ fontWeight: 700, color: "text.primary" }}>Status history</Typography>
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
