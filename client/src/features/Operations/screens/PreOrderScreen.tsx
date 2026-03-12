import { useState } from "react";
import { Box, LinearProgress, Paper, Typography } from "@mui/material";

import { AppPagination } from "../../../app/shared/components/AppPagination";
import { useOperationsOrders, useUpdateOrderStatus } from "../../../lib/hooks/useOperationsOrders";
import { useOperations } from "../context/OperationsContext";
import type { StaffOrderDto } from "../../../lib/types/staffOrders";
import type { OrderStatus, OrderType } from "../../../lib/types/operations";
import { OperationsPageHeader } from "../components/OperationsPageHeader";
import { OrderListCard, StatusFilterTabs } from "../components";

export function PreOrderScreen() {
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 5;
  const [statusFilter, setStatusFilter] = useState<"All" | "Confirmed" | "Processing" | "Shipped" | "Delivered">(
    "Confirmed",
  );

  const { data, isLoading } = useOperationsOrders({
    pageNumber,
    pageSize,
    orderType: "PreOrder" as OrderType,
    status: statusFilter === "All" ? undefined : (statusFilter as OrderStatus | string),
  });

  const safeOrders: StaffOrderDto[] = Array.isArray(data?.items)
    ? (data!.items as unknown as StaffOrderDto[])
    : [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? safeOrders.length;

  const updateStatus = useUpdateOrderStatus();
  const { openCreateShipment } = useOperations();

  return (
    <>
      <OperationsPageHeader
        title="Pre-order"
        subtitle="Handle pre-orders: expected stock, receive at warehouse, pack."
        count={totalCount}
        countLabel="orders"
      />

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
          ) : (
            <>
              <StatusFilterTabs value={statusFilter} onChange={setStatusFilter} hideAll />
              {safeOrders.length === 0 ? (
                <Typography color="text.secondary">No pre-orders yet.</Typography>
              ) : (
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
                {safeOrders
                  .filter((o) => {
                    const s = String(o.orderStatus).toLowerCase();
                    if (statusFilter === "All") return true;
                    if (statusFilter === "Confirmed") return s === "confirmed";
                    if (statusFilter === "Processing") return s === "processing";
                    if (statusFilter === "Shipped") return s === "shipped";
                    if (statusFilter === "Delivered") return s === "delivered";
                    return true;
                  })
                  .map((o) => {
                    const s = String(o.orderStatus).toLowerCase();
                    const canProcessing = s === "confirmed";
                    const canMarkShipped = s === "processing";

                    return (
                      <OrderListCard
                        key={o.id}
                        mode="confirmed"
                        summary={o}
                        onProcessingClick={
                          canProcessing
                            ? (orderId) =>
                                updateStatus.mutate({
                                  orderId,
                                  status: "Processing" as OrderStatus,
                                })
                            : undefined
                        }
                        onMarkShippedClick={
                          canMarkShipped
                            ? (orderId) => openCreateShipment(orderId)
                            : undefined
                        }
                      />
                    );
                  })}
              </Box>
              )}

              {totalPages > 1 && (
                <AppPagination
                  page={pageNumber}
                  totalPages={totalPages}
                  onChange={setPageNumber}
                  totalItems={data?.totalCount}
                  pageSize={pageSize}
                  unitLabel="orders"
                  align="flex-end"
                />
              )}
            </>
          )}
        </Paper>
      </Box>
    </>
  );
}
