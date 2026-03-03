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
import { useOperationsOrders, useUpdateOrderStatus } from "../../../lib/hooks/useOperationsOrders";
import type { StaffOrderDto } from "../../../lib/types/staffOrders";
import type { OrderStatus } from "../../../lib/types/operations";

export function PackScreen() {
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useOperationsOrders({
    pageNumber,
    pageSize,
    status: "Confirmed",
  });

  const safeOrders: StaffOrderDto[] = Array.isArray(data?.items)
    ? (data!.items as unknown as StaffOrderDto[])
    : [];
  const totalPages = data?.totalPages ?? 1;

  const updateStatus = useUpdateOrderStatus();

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
        <Typography
          sx={{ mt: 1, fontSize: 26, fontWeight: 900 }}
          color="text.primary"
        >
          Confirmed orders
        </Typography>
        <Typography
          sx={{ mt: 0.5, color: "text.secondary", fontSize: 14 }}
        >
          Orders to pick and prepare before creating shipments.
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
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.25,
                            flexWrap: "wrap",
                          }}
                        >
                          <Chip
                            label={o.orderStatus}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              textTransform: "capitalize",
                              border: `1px solid ${border}`,
                              bgcolor: bg,
                              color,
                            }}
                          />
                          {o.orderStatus === "Confirmed" && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() =>
                                updateStatus.mutate({
                                  orderId: o.id,
                                  status: "processing" as OrderStatus,
                                })
                              }
                              sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                borderRadius: 2,
                                px: 1.8,
                                py: 0.2,
                                fontSize: 12,
                                bgcolor: "#f97316",
                                "&:hover": {
                                  bgcolor: "#ea580c",
                                },
                              }}
                            >
                              Processing
                            </Button>
                          )}
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
                          <b>Source:</b> {o.orderSource}
                        </Typography>
                        <Typography>
                          <b>Type:</b> {o.orderType}
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

