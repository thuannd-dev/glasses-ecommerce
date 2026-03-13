import { useState } from "react";
import { Box, LinearProgress, Paper, Typography } from "@mui/material";
import { useOperationsOrders, useUpdateOrderStatus } from "../../../lib/hooks/useOperationsOrders";
import { AppPagination } from "../../../app/shared/components/AppPagination";
import type { StaffOrderDto } from "../../../lib/types/staffOrders";
import type { OrderStatus } from "../../../lib/types/operations";
import { OperationsPageHeader } from "../components/OperationsPageHeader";
import { OrdersTabs } from "../components/OrdersTabs";
import { OrderListCard } from "../components/OrderListCard";

export function PackScreen() {
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 5;

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
  return (
    <>
      <OperationsPageHeader
        title="Confirmed orders"
        subtitle="Orders to pick and prepare before creating shipments."
      />
      <OrdersTabs active="confirmed" />

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
                {safeOrders.map((o) => (
                  <OrderListCard
                    key={o.id}
                    mode="confirmed"
                    summary={o}
                    primaryActionLabel={
                      String(o.orderStatus).toLowerCase() === "confirmed"
                        ? "Processing"
                        : undefined
                    }
                    onPrimaryActionClick={(orderId) =>
                      updateStatus.mutate({
                        orderId,
                        status: "Processing" as OrderStatus,
                      })
                    }
                  />
                ))}
              </Box>

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
