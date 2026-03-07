import { createContext, useCallback, useContext, useState } from "react";
import {
  useOperationsOrders,
  useOperationsShipments,
  useUpdateOrderStatus,
  useCreateShipment,
  useUpdateTracking,
} from "../../../lib/hooks/useOperationsOrders";
import { CreateShipmentDialog } from "../components";
import type { ShipmentDto, OperationsOrdersResponse, OperationsOrderDto } from "../../../lib/types";

type OperationsContextValue = {
  orders: OperationsOrderDto[];
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
  const [createShipCarrier, setCreateShipCarrier] = useState("GHN");
  const [createShipTracking, setCreateShipTracking] = useState("");
  const [createShipTrackingUrl, setCreateShipTrackingUrl] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const { data: ordersData, isLoading: ordersLoading } = useOperationsOrders();
  const { data: shipmentsData, isLoading: shipmentsLoading } = useOperationsShipments();
  const updateStatus = useUpdateOrderStatus();
  const createShipment = useCreateShipment();
  const updateTracking = useUpdateTracking();

  const openCreateShipment = useCallback((orderId: string) => setCreateShipOrderId(orderId), []);

  const handleCreateShipment = useCallback(() => {
    if (!createShipOrderId || !createShipTracking.trim()) return;
    createShipment.mutate(
      { 
        orderId: createShipOrderId, 
        carrier: createShipCarrier, 
        trackingNumber: createShipTracking.trim(),
        trackingUrl: createShipTrackingUrl.trim() || undefined,
      },
      {
        onSuccess: () => {
          setCreateShipOrderId(null);
          setCreateShipTracking("");
          setCreateShipTrackingUrl("");
        },
      }
    );
  }, [createShipOrderId, createShipCarrier, createShipTracking, createShipTrackingUrl, createShipment]);

  const safeOrders: OperationsOrderDto[] = Array.isArray(ordersData)
    ? (ordersData as OperationsOrderDto[])
    : Array.isArray((ordersData as OperationsOrdersResponse | undefined)?.items)
    ? ((ordersData as OperationsOrdersResponse).items as OperationsOrderDto[])
    : [];

  const safeShipments: ShipmentDto[] =  
    Array.isArray(shipmentsData)
      ? (shipmentsData as ShipmentDto[])
      : (shipmentsData as any)?.items && Array.isArray((shipmentsData as any).items)
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
        onClose={() => setCreateShipOrderId(null)}
        order={selectedOrder}
        carrier={createShipCarrier}
        setCarrier={setCreateShipCarrier}
        trackingNumber={createShipTracking}
        setTrackingNumber={setCreateShipTracking}
        trackingUrl={createShipTrackingUrl}
        setTrackingUrl={setCreateShipTrackingUrl}
        onSubmit={handleCreateShipment}
        isPending={createShipment.isPending}
      />
    </OperationsContext.Provider>
  );
}
