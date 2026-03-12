import { createContext, useCallback, useContext, useState } from "react";
import {
  useOperationsOrders,
  useOperationsShipments,
  useUpdateOrderStatus,
  useUpdateTracking,
} from "../../../lib/hooks/useOperationsOrders";
import { useLookups } from "../../../lib/hooks/useLookups";
import { CreateShipmentDialog } from "../components";
import type { OrderDto, ShipmentDto } from "../../../lib/types";

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
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const { data: ordersData, isLoading: ordersLoading } = useOperationsOrders();
  const { data: shipmentsData, isLoading: shipmentsLoading } = useOperationsShipments();
  const { data: lookupsData } = useLookups();
  const updateStatus = useUpdateOrderStatus();
  const updateTracking = useUpdateTracking();

  const carriers = lookupsData?.shippingCarrier || [];
  
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
    
    // Update order status to "Shipped" with shipment details
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
          setCreateShipOrderId(null);
          setCreateShipTracking("");
          setCreateShipTrackingUrl("");
          setCreateShipEstimatedDeliveryDate("");
          setCreateShipShippingNotes("");
          setCreateShipCarrier("");
        },
      }
    );
  }, [createShipOrderId, createShipCarrier, createShipTracking, createShipTrackingUrl, createShipEstimatedDeliveryDate, createShipShippingNotes, updateStatus]);

  const safeOrders: OrderDto[] = Array.isArray(ordersData)
    ? ordersData
    : Array.isArray((ordersData as any)?.items)
    ? ((ordersData as any).items as any[]) // Backend returns StaffOrderDto-like structure with orderStatus, not status
    : [];

  const safeShipments: ShipmentDto[] = Array.isArray(shipmentsData)
    ? shipmentsData
    : Array.isArray((shipmentsData as any)?.items)
    ? ((shipmentsData as any).items as ShipmentDto[])
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

  const selectedOrder = createShipOrderId
    ? safeOrders.find((o) => o.id === createShipOrderId) ?? null
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
        isPending={updateStatus.isPending}
      />
    </OperationsContext.Provider>
  );
}
