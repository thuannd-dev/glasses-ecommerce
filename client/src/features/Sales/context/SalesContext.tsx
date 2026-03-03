import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useStaffOrders } from "../../../lib/hooks/useStaffOrders";
import type { StaffOrderDto, StaffOrdersResponse } from "../../../lib/types/staffOrders";

type SalesContextValue = {
  orders: StaffOrderDto[];
  ordersLoading: boolean;
  meta: Pick<StaffOrdersResponse, "totalCount" | "pageNumber" | "pageSize" | "totalPages"> | null;
  pageNumber: number;
  pageSize: number;
  setPageNumber: (page: number) => void;
};

const SalesContext = createContext<SalesContextValue | null>(null);

export function useSales() {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error("useSales must be used within SalesProvider");
  return ctx;
}

export function SalesProvider({ children }: { children: ReactNode }) {
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useStaffOrders({ pageNumber, pageSize });
  const safeOrders = Array.isArray(data?.items) ? data!.items : [];

  const value: SalesContextValue = {
    orders: safeOrders,
    ordersLoading: isLoading,
    pageNumber,
    pageSize,
    setPageNumber,
    meta: data
      ? {
          totalCount: data.totalCount,
          pageNumber: data.pageNumber,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
        }
      : null,
  };

  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>;
}

