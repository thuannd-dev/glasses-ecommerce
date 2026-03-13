import { useMemo, useState } from "react";
import { toast } from "react-toastify";

import {
  useCreateInventoryOutbound,
  useInventoryCatalog,
} from "../../../lib/hooks/useOperationsInventory";
import { useDebouncedValue } from "../../../lib/hooks/useDebouncedValue";
import { useOperationsOrderDetail, useOperationsOrders } from "../../../lib/hooks/useOperationsOrders";
import type { StaffOrderDto } from "../../../lib/types/staffOrders";

export function useOutboundInventoryScreen() {
  const [inventorySearch, setInventorySearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderId, setOrderId] = useState("");
  const [notes, setNotes] = useState("");
  const debouncedInventorySearch = useDebouncedValue(inventorySearch, 250);

  const outboundMutation = useCreateInventoryOutbound();
  const {
    data: inventoryData,
    isLoading: isInventoryLoading,
    isFetching: isInventoryFetching,
  } = useInventoryCatalog({
    pageNumber,
    pageSize: 12,
    search: debouncedInventorySearch,
  });
  const { data: ordersData, isLoading: isOrdersLoading } = useOperationsOrders({
    pageNumber: 1,
    pageSize: 80,
  });
  const { data: selectedOrderDetail, isLoading: isOrderDetailLoading } = useOperationsOrderDetail(
    orderId.trim() || undefined,
  );

  const inventoryItems = inventoryData?.items ?? [];
  const safeOrders = useMemo<StaffOrderDto[]>(() => {
    return Array.isArray(ordersData?.items)
      ? (ordersData!.items as unknown as StaffOrderDto[])
      : [];
  }, [ordersData]);
  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    if (!q) return safeOrders;
    return safeOrders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        (o.walkInCustomerName || "").toLowerCase().includes(q),
    );
  }, [safeOrders, orderSearch]);
  const selectedOrderOption = safeOrders.find((o) => o.id === orderId) ?? null;
  const totalPages = inventoryData?.totalPages ?? 1;
  const totalCount = inventoryData?.totalCount ?? 0;

  const normalizedOrderId = orderId.trim();
  const hasValidOrderDetail =
    !!selectedOrderDetail && selectedOrderDetail.id.toLowerCase() === normalizedOrderId.toLowerCase();
  const isFormValid = normalizedOrderId.length > 0 && hasValidOrderDetail;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    try {
      await outboundMutation.mutateAsync({
        orderId: normalizedOrderId,
        notes,
      });

      toast.success("Outbound recorded successfully.");
      setOrderId("");
      setNotes("");
      setDialogOpen(false);
    } catch {
      // handled by mutation state + global interceptor
    }
  };

  return {
    // state
    inventorySearch,
    setInventorySearch,
    pageNumber,
    setPageNumber,
    dialogOpen,
    setDialogOpen,
    orderSearch,
    setOrderSearch,
    orderId,
    setOrderId,
    notes,
    setNotes,
    // data
    inventoryItems,
    totalPages,
    totalCount,
    isInventoryLoading,
    isInventoryFetching,
    outboundMutation,
    // orders autocomplete
    filteredOrders,
    selectedOrderOption,
    isOrdersLoading,
    normalizedOrderId,
    selectedOrderDetail,
    isOrderDetailLoading,
    // submit
    isFormValid,
    handleSubmit,
  };
}

