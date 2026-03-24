import { createContext, useCallback, useContext, useState } from "react";
import {
  useOperationsOrders,
  useOperationsOrderDetail,
  useOperationsShipments,
  useUpdateOrderStatus,
  useUpdateTracking,
} from "../../../lib/hooks/useOperationsOrders";
import { CreateGHNShipmentDialog } from "../components";
import type {
  OrderDto,
  OrderItemDto,
  OrderStatus,
  OrderType,
  ShipmentDto,
} from "../../../lib/types";

type OperationsContextValue = {
  orders: OrderDto[];
  ordersLoading: boolean;
  shipments: ShipmentDto[];
  shipmentsLoading: boolean;
  updateStatus: ReturnType<typeof useUpdateOrderStatus>;
  updateTracking: ReturnType<typeof useUpdateTracking>;
  openCreateShipment: (orderId: string) => void;
  expandedOrderId: string | null;
  setExpandedOrderId: (id: string | null) => void;
};

const OperationsContext = createContext<OperationsContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useOperations() {
  const ctx = useContext(OperationsContext);
  if (!ctx) throw new Error("useOperations must be used within OperationsProvider");
  return ctx;
}

export function OperationsProvider({ children }: { children: React.ReactNode }) {
  const [createShipOrderId, setCreateShipOrderId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const { data: ordersData, isLoading: ordersLoading } = useOperationsOrders();
  const { data: selectedOrderDetail } = useOperationsOrderDetail(
    createShipOrderId || undefined
  );
  const { data: shipmentsData, isLoading: shipmentsLoading } = useOperationsShipments();
  const updateStatus = useUpdateOrderStatus();
  const updateTracking = useUpdateTracking();

  const openCreateShipment = useCallback((orderId: string) => {
    setCreateShipOrderId(orderId);
  }, []);

  type PaginatedResult<T> = { items?: T[] };

  const safeOrders: OrderDto[] = Array.isArray(ordersData)
    ? ordersData
    : Array.isArray((ordersData as PaginatedResult<OrderDto> | undefined)?.items)
    ? ((ordersData as PaginatedResult<OrderDto>).items ?? [])
    : [];

  const safeShipments: ShipmentDto[] = Array.isArray(shipmentsData)
    ? shipmentsData
    : Array.isArray((shipmentsData as PaginatedResult<ShipmentDto> | undefined)?.items)
    ? (((shipmentsData as unknown) as PaginatedResult<ShipmentDto>).items ?? [])
    : [];

  const value: OperationsContextValue = {
    orders: safeOrders,
    ordersLoading,
    shipments: safeShipments,
    shipmentsLoading,
    updateStatus,
    updateTracking,
    openCreateShipment,
    expandedOrderId,
    setExpandedOrderId,
  };

  const selectedOrder: OrderDto | null = createShipOrderId
    ? safeOrders.find((o) => o.id === createShipOrderId) ??
      (selectedOrderDetail
        ? ({
            id: selectedOrderDetail.id,
            orderNumber: selectedOrderDetail.id,
            orderType: selectedOrderDetail.orderType as OrderType,
            status: selectedOrderDetail.orderStatus as OrderStatus,
            createdAt: selectedOrderDetail.createdAt,
            customerName:
              selectedOrderDetail.customerName ||
              selectedOrderDetail.walkInCustomerName ||
              "",
            customerEmail: "",
            shippingAddress: selectedOrderDetail.shippingAddress
              ? `${selectedOrderDetail.shippingAddress.venue ?? ""} ${selectedOrderDetail.shippingAddress.ward ?? ""} ${selectedOrderDetail.shippingAddress.district ?? ""} ${selectedOrderDetail.shippingAddress.city ?? ""}`.trim()
              : "",
            items: selectedOrderDetail.items.map(
              (item): OrderItemDto => ({
                id: item.id,
                productVariantId: item.productVariantId,
                productName: item.productName,
                sku: item.sku,
                quantity: item.quantity,
                price: item.unitPrice,
              })
            ),
            totalAmount: selectedOrderDetail.finalAmount,
          } as OrderDto)
        : null)
    : null;

  return (
    <OperationsContext.Provider value={value}>
      {children}
      <CreateGHNShipmentDialog
        open={!!createShipOrderId}
        onClose={() => setCreateShipOrderId(null)}
        order={selectedOrder}
      />
    </OperationsContext.Provider>
  );
}
