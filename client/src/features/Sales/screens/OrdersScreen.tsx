import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Pagination,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStaffOrders } from "../../../lib/hooks/useStaffOrders";

export function OrdersScreen() {
  const navigate = useNavigate();
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
  const meta = data
    ? {
        totalPages: data.totalPages,
      }
    : null;

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4, lg: 6 },
        py: 4,
        height: "calc(100vh - 56px)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Typography sx={{ fontSize: 24, fontWeight: 900, mb: 2 }}>
        Orders
      </Typography>

      {isLoading ? (
        <Box sx={{ maxWidth: 720, mx: "auto", mt: 2 }}>
          <LinearProgress sx={{ borderRadius: 1 }} />
        </Box>
      ) : filteredOrders.length === 0 ? (
        <Box sx={{ maxWidth: 720, mx: "auto", mt: 3 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 2,
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
              <Paper
                key={o.id}
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
                    Order ID: {o.id}
                  </Typography>
                  <Chip
                    label={o.orderStatus}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      textTransform: "capitalize",
                      border: "1px solid #8b5cf6",
                      bgcolor: "rgba(139,92,246,0.12)",
                      color: "#5b21b6",
                    }}
                  />
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
                      {o.orderSource}
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
                      {o.orderType}
                    </Box>
                  </Typography>
                  <Typography>
                    <b>Items:</b> {o.itemCount}
                  </Typography>
                  <Typography>
                    <b>Created:</b>{" "}
                    {new Date(o.createdAt).toLocaleString()}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 0.75,
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    Total amount
                  </Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
                    {o.finalAmount.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 0.5,
                  }}
                >
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 2.5,
                      bgcolor: "#111827",
                      "&:hover": { bgcolor: "#0f172a" },
                    }}
                    onClick={() => navigate(`/sales/orders/${o.id}`)}
                  >
                    View detail
                  </Button>
                </Box>
              </Paper>
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

