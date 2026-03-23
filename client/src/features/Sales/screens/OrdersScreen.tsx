import { useMemo, useState, useEffect } from "react";
import { Box, Button, Chip, Collapse, Divider, IconButton, LinearProgress, Paper, TextField, Typography, InputAdornment } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SearchIcon from "@mui/icons-material/Search";
import { Link as RouterLink } from "react-router-dom";
import { useStaffOrder, useUpdateStaffOrderStatus } from "../../../lib/hooks/useStaffOrders";
import type { StaffOrderDto, StaffOrderDetailDto } from "../../../lib/types/staffOrders";
import { OrderDetailExpanded } from "../../../app/shared/components/OrderDetailExpanded";
import { useOrdersScreen } from "../hooks/useOrdersScreen";
import { AppPagination } from "../../../app/shared/components/AppPagination";

function getStatusColors(status: string) {
  switch (status) {
    case "PendingApproval":
    case "Pending":
      return { border: "#EAEAEA", bg: "#F6F6F6", color: "#4B4B4B" };
    case "Confirmed":
      return { border: "#D4E5D5", bg: "#EEF5EE", color: "#466A4A" };
    case "Processing":
      return { border: "#F5D7B8", bg: "#FDE8D4", color: "#9B4B0F" };
    case "Shipped":
      return { border: "#D4B5A4", bg: "#F5E8E1", color: "#6B5B56" };
    case "Delivered":
    case "Completed":
      return { border: "#BBE5B8", bg: "#E8F7E6", color: "#2E7D32" };
    case "Rejected":
    case "Cancelled":
      return { border: "#E8CFCF", bg: "#F6EAEA", color: "#8E3B3B" };
    default:
      return { border: "#EAEAEA", bg: "#F6F6F6", color: "#4B4B4B" };
  }
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
      {/* Row 1: Order ID pill + status + actions (same visual as shipped card) */}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
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

      {/* Row 2: meta – items count + created */}
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
        {/* Source / Type pills giống Operations */}
        <Typography component="span" sx={{ color: "rgba(0,0,0,0.3)", mx: 0.25 }}>•</Typography>
        <Chip
          label={summary.orderSource}
          size="small"
          sx={{
            height: 22,
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            bgcolor: "#ECFEFF",
            color: "#0369A1",
          }}
        />
        <Chip
          label={summary.orderType}
          size="small"
          sx={{
            height: 22,
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            bgcolor: "#F5F3FF",
            color: "#4C1D95",
          }}
        />
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
          {summary.finalAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
        </Typography>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider sx={{ borderColor: "rgba(0,0,0,0.06)", my: 1.5 }} />
        {isLoading || !detail ? (
          <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>Loading detail...</Typography>
        ) : (
          <>
            <OrderDetailExpanded detail={detail} />
            {isPending && (
              <Box
                sx={{
                  mt: 1.5,
                  display: "flex",
                  flexDirection: "row",
                  gap: 1,
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  disabled={updateStatus.isPending}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 13,
                    height: 40,
                    borderRadius: 1,
                    borderColor: "#D4E5D5",
                    bgcolor: "#EEF5EE",
                    color: "#466A4A",
                    "&:hover": {
                      bgcolor: "#E3EFE4",
                      borderColor: "#C8DDCA",
                    },
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
                  fullWidth
                  variant="outlined"
                  size="small"
                  disabled={updateStatus.isPending}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 13,
                    height: 40,
                    borderRadius: 1,
                    borderColor: "#E8CFCF",
                    bgcolor: "#F6EAEA",
                    color: "#8E3B3B",
                    "&:hover": {
                      borderColor: "#DDBFBF",
                      bgcolor: "#F1E2E2",
                    },
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
              </Box>
            )}
          </>
        )}
      </Collapse>
    </Paper>
  );
}

export function OrdersScreen() {
  const { pageNumber, setPageNumber, statusFilter, typeFilter, filteredOrders, isLoading, meta, statusTabs } =
    useOrdersScreen();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Apply search and date filters client-side
  const visibleOrders = useMemo(() => {
    return filteredOrders.filter((o) => {
      // Search by customer phone or order id
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const phone = (
          (o as any).customerPhone ??
          (o as any).walkInCustomerPhone ??
          ""
        )
          .toString()
          .toLowerCase();
        const orderId = (o.id ?? "").toString().toLowerCase();
        if (!phone.includes(q) && !orderId.includes(q)) {
          return false;
        }
      }

      // Date filter by createdAt (yyyy-mm-dd)
      if (dateFilter) {
        const d = new Date(o.createdAt);
        const yyyy = String(d.getFullYear()).padStart(4, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const ymd = `${yyyy}-${mm}-${dd}`;
        if (ymd !== dateFilter) return false;
      }

      return true;
    });
  }, [filteredOrders, searchQuery, dateFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPageNumber(1);
  }, [searchQuery, dateFilter, setPageNumber]);

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
            {visibleOrders.length} orders
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
          const typeParam = typeFilter === "All" ? "" : `&type=${typeFilter}`;
          const statusParam = tab.value === "All" ? "" : `status=${tab.value}`;
          const separator = statusParam && typeParam ? "&" : "";
          const allParams = `${statusParam}${separator}${typeParam}`;
          const href = allParams ? `/sales/orders?${allParams}` : "/sales/orders";
          return (
            <Button
              key={tab.value}
              component={RouterLink}
              to={href}
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

      {/* Search and Date Filter */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
          mb: 2,
          justifyContent: "flex-start",
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search by phone or order ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              minWidth: 220,
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                bgcolor: "#FAFAF8",
                fontSize: 13,
                px: 1,
                "& fieldset": { borderColor: "rgba(0,0,0,0.06)" },
                "&:hover fieldset": { borderColor: "rgba(0,0,0,0.18)" },
                "&.Mui-focused fieldset": { borderColor: "#B68C5A", borderWidth: 1 },
              },
              "& .MuiInputBase-input": {
                py: 0.75,
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "#9CA3AF" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            size="small"
            type="date"
            label="Order date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={{
              minWidth: 160,
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                bgcolor: "#FAFAF8",
                fontSize: 13,
                px: 1.25,
                "& fieldset": { borderColor: "rgba(0,0,0,0.06)" },
                "&:hover fieldset": { borderColor: "rgba(0,0,0,0.18)" },
                "&.Mui-focused fieldset": { borderColor: "#B68C5A", borderWidth: 1 },
              },
              "& .MuiInputBase-input": {
                py: 0.75,
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "#9CA3AF",
              },
            }}
          />
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ mt: 2 }}>
          <LinearProgress sx={{ borderRadius: 1 }} />
        </Box>
      ) : visibleOrders.length === 0 ? (
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
            <Typography color="text.secondary">{searchQuery || dateFilter ? "No matching orders found." : "No orders yet."}</Typography>
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
            {visibleOrders.map((o) => (
              <SalesOrderRow key={o.id} summary={o} />
            ))}
          </Box>

          {meta && (
            <AppPagination
              page={pageNumber}
              totalPages={meta.totalPages || 1}
              onChange={setPageNumber}
              totalItems={meta.totalCount}
              pageSize={meta.pageSize}
              unitLabel="orders"
              align="flex-end"
            />
          )}
        </Box>
      )}
    </Box>
  );
}
