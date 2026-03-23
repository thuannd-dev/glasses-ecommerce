import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  useOperationsOrders,
  useOperationsOrderDetail,
  useOperationsShipments,
  useUpdateOrderStatus,
  useUpdateTracking,
} from "../../../lib/hooks/useOperationsOrders";
import { useLookups } from "../../../lib/hooks/useLookups";
import { useCreateInventoryOutbound } from "../../../lib/hooks/useOperationsInventory";
import { CreateShipmentDialog } from "../components";
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
  const [createShipCarrier, setCreateShipCarrier] = useState("");
  const [createShipTracking, setCreateShipTracking] = useState("");
  const [createShipTrackingUrl, setCreateShipTrackingUrl] = useState("");
  const [createShipEstimatedDeliveryDate, setCreateShipEstimatedDeliveryDate] = useState("");
  const [createShipShippingNotes, setCreateShipShippingNotes] = useState("");
  const [createShipError, setCreateShipError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const { data: ordersData, isLoading: ordersLoading } = useOperationsOrders();
  const { data: selectedOrderDetail } = useOperationsOrderDetail(
    createShipOrderId || undefined
  );
  const { data: shipmentsData, isLoading: shipmentsLoading } = useOperationsShipments();
  const { data: lookupsData } = useLookups();
  const updateStatus = useUpdateOrderStatus();
  const updateTracking = useUpdateTracking();
  const createOutbound = useCreateInventoryOutbound();

  const carriers = useMemo(() => lookupsData?.shippingCarrier || [], [lookupsData]);
  
  // Set default carrier to first available carrier when carriers are loaded
  const handleOpenCreateShipment = useCallback((orderId: string) => {
    setCreateShipOrderId(orderId);
    if (carriers.length > 0 && !createShipCarrier) {
      setCreateShipCarrier(carriers[0]);
    }
  }, [carriers, createShipCarrier]);

  const openCreateShipment = handleOpenCreateShipment;

  const handleCreateShipment = useCallback(() => {
    if (!createShipOrderId || !createShipTracking.trim()) return;

    // Clear previous error
    setCreateShipError(null);

    // IMPORTANT: Record outbound FIRST to validate PreOrder fulfillment.
    // Only if outbound succeeds, then update order status to "Shipped".
    // This prevents status change if validation fails.
    createOutbound.mutate(
      {
        orderId: createShipOrderId,
      },
      {
        onSuccess: () => {
          // Outbound validation passed. Now update order status to "Shipped" with shipment details.
          updateStatus.mutate(
            {
              orderId: createShipOrderId,
              status: "Shipped" as const,
              shipmentCarrierName: createShipCarrier,
              shipmentTrackingCode: createShipTracking.trim(),
              shipmentTrackingUrl: createShipTrackingUrl || null,
              shipmentEstimatedDeliveryAt: createShipEstimatedDeliveryDate || null,
              shipmentNotes: createShipShippingNotes || null,
            },
            {
              onSuccess: () => {
                toast.success("Order shipped successfully with outbound record created");

                setCreateShipOrderId(null);
                setCreateShipTracking("");
                setCreateShipTrackingUrl("");
                setCreateShipEstimatedDeliveryDate("");
                setCreateShipShippingNotes("");
                setCreateShipCarrier("");
                setCreateShipError(null);
              },
              onError: (error: unknown) => {
                // Extract error message from API response
                let errorMessage = "Failed to update order status";
                
                if (error instanceof Error) {
                  errorMessage = error.message;
                } else if (error && typeof error === 'object') {
                  const apiError = error as { response?: { data?: { message?: string } } };
                  errorMessage = apiError?.response?.data?.message || errorMessage;
                }
                
                setCreateShipError(errorMessage);
              },
            },
          );
        },
        onError: (error: unknown) => {
          // Extract error message from API response
          // The agent interceptor throws Error objects with message for 409 errors
          let errorMessage = "Failed to create outbound record";
          
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (error && typeof error === 'object') {
            const apiError = error as { response?: { data?: { message?: string } } };
            errorMessage = apiError?.response?.data?.message || errorMessage;
          }
          
          setCreateShipError(errorMessage);
        },
      },
    );
  }, [
    createShipOrderId,
    createShipCarrier,
    createShipTracking,
    createShipTrackingUrl,
    createShipEstimatedDeliveryDate,
    createShipShippingNotes,
    updateStatus,
    createOutbound,
  ]);

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
      <CreateShipmentDialog
        open={!!createShipOrderId}
        onClose={() => {
          setCreateShipOrderId(null);
          setCreateShipTracking("");
          setCreateShipTrackingUrl("");
          setCreateShipEstimatedDeliveryDate("");
          setCreateShipShippingNotes("");
          setCreateShipCarrier("");
          setCreateShipError(null);
        }}
        order={selectedOrder}
        carrier={createShipCarrier}
        setCarrier={setCreateShipCarrier}
        trackingNumber={createShipTracking}
        setTrackingNumber={setCreateShipTracking}
        trackingUrl={createShipTrackingUrl}
        setTrackingUrl={setCreateShipTrackingUrl}
        estimatedDeliveryDate={createShipEstimatedDeliveryDate}
        setEstimatedDeliveryDate={setCreateShipEstimatedDeliveryDate}
        shippingNotes={createShipShippingNotes}
        setShippingNotes={setCreateShipShippingNotes}
        carriers={carriers}
        onSubmit={handleCreateShipment}
        isPending={updateStatus.isPending || createOutbound.isPending}
        error={createShipError}
      />
    </OperationsContext.Provider>
  );
}
