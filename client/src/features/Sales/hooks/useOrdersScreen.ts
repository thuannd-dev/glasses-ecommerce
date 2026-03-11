import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useStaffOrders } from "../../../lib/hooks/useStaffOrders";
import type { StaffOrderDto } from "../../../lib/types/staffOrders";

export function useOrdersScreen() {
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
  const safeOrders: StaffOrderDto[] = Array.isArray(data?.items) ? (data!.items as StaffOrderDto[]) : [];
  const filteredOrders = safeOrders.filter((o) => o.orderStatus === statusFilter);
  const meta = data
    ? {
        totalPages: data.totalPages,
        totalCount: data.totalCount,
        pageSize: data.pageSize,
      }
    : null;

  const statusTabs = [
    { label: "Pending", value: "Pending" },
    { label: "Confirmed", value: "Confirmed" },
    { label: "Rejected", value: "Cancelled" },
  ] as const;

  return {
    pageNumber,
    setPageNumber,
    statusFilter,
    filteredOrders,
    isLoading,
    meta,
    statusTabs,
  };
}

