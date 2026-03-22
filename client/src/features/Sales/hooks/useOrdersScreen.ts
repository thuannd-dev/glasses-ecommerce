import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import type { StaffOrderDto } from "../../../lib/types/staffOrders";
import agent from "../../../lib/api/agent";
import type { StaffOrdersResponse } from "../../../lib/types/staffOrders";

// Map filter tabs to backend order statuses
const STATUS_FILTER_MAP: Record<string, string[]> = {
  "All": ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Completed", "Cancelled", "Rejected"],
  "Pending": ["Pending"],
  "Confirmed": ["Confirmed", "Processing", "Shipped"],
  "Completed": ["Delivered", "Completed"],
  "Rejected": ["Cancelled", "Rejected"],
};

async function fetchStaffOrdersForStatus(status: string, pageNumber: number, pageSize: number, orderType?: string): Promise<StaffOrdersResponse> {
  const res = await agent.get<StaffOrdersResponse>("/staff/orders", {
    params: {
      pageNumber,
      pageSize,
      status,
      orderType,
    },
  });
  return res.data;
}

export function useOrdersScreen() {
  const [searchParams] = useSearchParams();

  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const rawStatus = searchParams.get("status") ?? "All";
  const allowedStatuses = Object.keys(STATUS_FILTER_MAP);
  const statusFilter = allowedStatuses.includes(rawStatus) ? rawStatus : "All";

  const rawType = searchParams.get("type") ?? "All";
  const allowedTypes = ["All", "ReadyStock", "PreOrder", "Prescription"];
  const typeFilter = allowedTypes.includes(rawType) ? rawType : "All";

  useEffect(() => {
    setPageNumber(1);
  }, [statusFilter, typeFilter]);

  const orderTypeForApi = typeFilter === "All" ? undefined : typeFilter;
  const statusesForFilter = STATUS_FILTER_MAP[statusFilter];

  // Fetch all statuses for the current filter
  const { data: allPaginatedData, isLoading } = useQuery({
    queryKey: ["staff", "orders", "filter", statusFilter, typeFilter, pageNumber],
    queryFn: async () => {
      const MAX_PAGE_SIZE = 100; // Backend limit
      const allOrders: StaffOrderDto[] = [];
      
      // Fetch data for each status
      for (const status of statusesForFilter) {
        try {
          const response = await fetchStaffOrdersForStatus(status, 1, MAX_PAGE_SIZE, orderTypeForApi);
          allOrders.push(...(response.items || []));
        } catch {
          // Silently handle fetch errors
        }
      }

      // Apply pagination locally to the combined results
      const startIdx = (pageNumber - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      const paginatedOrders = allOrders.slice(startIdx, endIdx);

      return {
        items: paginatedOrders,
        totalCount: allOrders.length,
        pageNumber,
        pageSize,
        totalPages: Math.ceil(allOrders.length / pageSize),
        hasPreviousPage: pageNumber > 1,
        hasNextPage: endIdx < allOrders.length,
      };
    },
  });

  const filteredOrders: StaffOrderDto[] = allPaginatedData?.items || [];
  const meta = allPaginatedData
    ? {
        totalPages: allPaginatedData.totalPages,
        totalCount: allPaginatedData.totalCount,
        pageSize: allPaginatedData.pageSize,
      }
    : null;

  const statusTabs = [
    { label: "All", value: "All" },
    { label: "Pending", value: "Pending" },
    { label: "Confirmed", value: "Confirmed" },
    { label: "Completed", value: "Completed" },
    { label: "Rejected", value: "Rejected" },
  ] as const;

  return {
    pageNumber,
    setPageNumber,
    statusFilter,
    typeFilter,
    filteredOrders,
    isLoading,
    meta,
    statusTabs,
  };
}

