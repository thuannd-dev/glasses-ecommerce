import { useState } from "react";
import {
  Box,
  Chip,
  LinearProgress,
  Pagination,
  Paper,
  Typography,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useOperationsOrders } from "../../../lib/hooks/useOperationsOrders";
import { SummaryCard } from "../components";
import type { OperationsOrderDto } from "../../../lib/types/operations";

export function PackScreen() {
  const navigate = useNavigate();
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useOperationsOrders({
    pageNumber,
    pageSize,
    status: "Confirmed",
  });

  const safeOrders: OperationsOrderDto[] = Array.isArray(data?.items)
    ? (data!.items as OperationsOrderDto[])
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
        <Typography
          sx={{
            fontSize: 12,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          Operations Center
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mt: 1, mb: 2 }}>
          <Typography
            sx={{ fontSize: 26, fontWeight: 900 }}
            color="text.primary"
          >
            CONFIRMED ORDERS
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 200 }}>
            <SummaryCard label="Total Order" value={isLoading ? "—" : data?.totalCount ?? 0} />
          </Box>
        </Box>
        <Typography
          sx={{ color: "text.secondary", fontSize: 14 }}
        >
          View confirmed order list, pick and pack order, and manage shipping information
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
            <Typography color="text.secondary">
              No orders to pack.
            </Typography>
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
                {safeOrders.map((o) => {
                  const { border, bg, color } = getStatusColors(o.orderStatus);
                  return (
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
                            border: `1px solid ${border}`,
                            bgcolor: bg,
                            color,
                            flexShrink: 0,
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1.5,
                          fontSize: 13,
                          color: "text.secondary",
                          alignItems: "center",
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
                        }}
                      >
                        <Typography
                          sx={{ fontSize: 13, color: "text.secondary" }}
                        >
                          Total amount
                        </Typography>
                        <Typography sx={{ fontSize: 18, fontWeight: 900 }}>
                          {o.finalAmount.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => navigate(`/operations/orders/${o.id}`)}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            borderRadius: 2,
                            px: 2.2,
                            py: 0.6,
                            fontSize: 13,
                            bgcolor: "#1a202c",
                            color: "white",
                            "&:hover": {
                              bgcolor: "#2d3748",
                            },
                          }}
                        >
                          View detail
                        </Button>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>

              {totalPages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 2,
                    pt: 1,
                  }}
                >
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

