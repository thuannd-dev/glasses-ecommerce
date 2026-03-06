import { useState, useMemo } from "react";
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
  InputAdornment,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { useOperationsOrders, useOperationsOrderDetail } from "../../../lib/hooks/useOperationsOrders";
import type { StaffOrderDto, StaffOrderDetailDto } from "../../../lib/types/staffOrders";
import { OperationsPageHeader } from "../components/OperationsPageHeader";
import { OrdersTabs } from "../components/OrdersTabs";

const SHIPPED_PILL = {
  bg: "#EEF5EE",
  color: "#466A4A",
  border: "#D4E5D5",
};

export function TrackingScreen() {
  const [pageNumber, setPageNumber] = useState(1);
  const [orderIdFilter, setOrderIdFilter] = useState("");
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
  const totalCount = data?.totalCount ?? safeOrders.length;

  const filteredOrders = useMemo(() => {
    if (!orderIdFilter.trim()) return safeOrders;
    const q = orderIdFilter.trim().toLowerCase();
    return safeOrders.filter((o) => o.id.toLowerCase().includes(q));
  }, [safeOrders, orderIdFilter]);

  const getStatusColors = (status: string) => {
    switch (status) {
      case "Shipped":
      case "Delivered":
      case "Completed":
        return SHIPPED_PILL;
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
      <OperationsPageHeader
        eyebrow="OPERATIONS CENTER"
        title="Shipped orders"
        subtitle="Orders that have been marked as shipped."
        count={totalCount}
        countLabel="orders"
      />
      <OrdersTabs active="shipped" />

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
            bgcolor: "#FFFFFF",
            boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
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
            <Typography sx={{ color: "#6B6B6B" }}>No shipped orders yet.</Typography>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                  flexWrap: "wrap",
                }}
              >
                <TextField
                  size="small"
                  placeholder="Search by Order ID"
                  value={orderIdFilter}
                  onChange={(e) => setOrderIdFilter(e.target.value)}
                  sx={{
                    width: { xs: "100%", sm: 260 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#FAFAF8",
                      fontSize: 14,
                      "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
                      "&:hover fieldset": { borderColor: "rgba(0,0,0,0.12)" },
                      "&.Mui-focused fieldset": { borderColor: "#B68C5A", borderWidth: 1 },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 20, color: "#8A8A8A" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2.5,
                  mt: 0,
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
                {filteredOrders.map((o) => (
                  <ShippedOrderRow key={o.id} summary={o} getStatusColors={getStatusColors} />
                ))}
                {filteredOrders.length === 0 && orderIdFilter.trim() && (
                  <Typography sx={{ color: "#6B6B6B", py: 2 }}>
                    No orders match &quot;{orderIdFilter}&quot;.
                  </Typography>
                )}
              </Box>

              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, pt: 1.5, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <Pagination
                    count={totalPages}
                    page={pageNumber}
                    onChange={(_, page) => setPageNumber(page)}
                    color="primary"
                    size="small"
                    sx={{
                      "& .Mui-selected": {
                        bgcolor: "rgba(182,140,90,0.2)",
                        color: "#171717",
                      },
                    }}
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

  const copyOrderId = () => {
    navigator.clipboard.writeText(summary.id);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "#FFFFFF",
        boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
        px: 2.75,
        py: 2.25,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 16px 36px rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* Row 1: Order ID pill + status + menu */}
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
          <Typography component="span" sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600 }}>
            Order
          </Typography>
          <Box
            component="button"
            type="button"
            onClick={copyOrderId}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.08)",
              bgcolor: "#F7F7F7",
              fontFamily: "monospace",
              fontSize: 13,
              fontWeight: 600,
              color: "#171717",
              cursor: "pointer",
              "&:hover": { bgcolor: "#EFEFEF" },
            }}
          >
            {summary.id}
            <ContentCopyIcon sx={{ fontSize: 14, color: "#8A8A8A" }} />
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Chip
            label={summary.orderStatus}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: 12,
              textTransform: "capitalize",
              border: `1px solid ${border}`,
              bgcolor: bg,
              color,
              borderRadius: 10,
            }}
          />
          <IconButton
            size="small"
            onClick={() => setExpanded((e) => !e)}
            sx={{ color: "#6B6B6B" }}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      {/* Row 2: meta – items count + created only (no Source/Type) */}
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
        <Typography component="span" sx={{ fontSize: 13, color: "#6B6B6B" }}>
          {summary.itemCount} item{summary.itemCount !== 1 ? "s" : ""}
        </Typography>
        <Typography component="span" sx={{ color: "rgba(0,0,0,0.3)", mx: 0.25 }}>•</Typography>
        <Typography component="span" sx={{ fontSize: 13, color: "#6B6B6B" }}>
          {new Date(summary.createdAt).toLocaleString()}
        </Typography>
      </Box>

      {/* Row 3: Total amount */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: 13, color: "#8A8A8A", fontWeight: 500 }}>
          Total amount
        </Typography>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#171717" }}>
          {summary.finalAmount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </Typography>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider sx={{ borderColor: "rgba(0,0,0,0.06)", my: 1.5 }} />
        {isLoading || !detail ? (
          <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>Loading detail…</Typography>
        ) : (
          <Box sx={{ fontSize: 13, color: "#6B6B6B", display: "flex", flexDirection: "column", gap: 1.5 }}>
            {/* More details: Source & Type as small muted chips */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
              <Typography component="span" sx={{ fontWeight: 600, color: "#171717", mr: 0.5 }}>
                More details
              </Typography>
              <Chip
                size="small"
                label={`Source: ${detail.orderSource}`}
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 500,
                  bgcolor: "rgba(0,0,0,0.06)",
                  color: "#6B6B6B",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              />
              <Chip
                size="small"
                label={`Type: ${detail.orderType}`}
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 500,
                  bgcolor: "rgba(0,0,0,0.06)",
                  color: "#6B6B6B",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              />
            </Box>

            <Typography sx={{ fontWeight: 700, color: "#171717" }}>Items</Typography>
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
                    <Typography sx={{ fontWeight: 600, color: "#171717" }}>
                      {item.productName}
                    </Typography>
                    <Typography sx={{ color: "#6B6B6B" }}>
                      {item.variantName} · Qty {item.quantity}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: "#171717" }}>
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
                <Divider sx={{ borderColor: "rgba(0,0,0,0.06)", my: 1 }} />
                <Typography sx={{ fontWeight: 700, color: "#171717" }}>Payment</Typography>
                <Typography>
                  Method: {detail.payment.paymentMethod} · Status: {detail.payment.paymentStatus}
                </Typography>
                <Typography>
                  Amount:{" "}
                  {detail.payment.amount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </Typography>
              </>
            )}

            {detail.statusHistories && detail.statusHistories.length > 0 && (
              <>
                <Divider sx={{ borderColor: "rgba(0,0,0,0.06)", my: 1 }} />
                <Typography sx={{ fontWeight: 700, color: "#171717" }}>Status history</Typography>
                {detail.statusHistories.map((h, idx) => (
                  <Box key={idx}>
                    <Typography>
                      {h.fromStatus} → <b>{h.toStatus}</b>
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#8A8A8A" }}>
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
