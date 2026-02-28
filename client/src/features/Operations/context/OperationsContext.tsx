import { createContext, useCallback, useContext, useState } from "react";
import {
  useOperationsOrders,
  useOperationsShipments,
  useUpdateOrderStatus,
  useCreateShipment,
  useUpdateTracking,
} from "../../../lib/hooks/useOperationsOrders";
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
  const [createShipCarrier, setCreateShipCarrier] = useState("GHN");
  const [createShipTracking, setCreateShipTracking] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const { data: orders = [], isLoading: ordersLoading } = useOperationsOrders();
  const { data: shipments = [], isLoading: shipmentsLoading } = useOperationsShipments();
  const updateStatus = useUpdateOrderStatus();
  const createShipment = useCreateShipment();
  const updateTracking = useUpdateTracking();

  const openCreateShipment = useCallback((orderId: string) => setCreateShipOrderId(orderId), []);

  const handleCreateShipment = useCallback(() => {
    if (!createShipOrderId || !createShipTracking.trim()) return;
    createShipment.mutate(
      { orderId: createShipOrderId, carrier: createShipCarrier, trackingNumber: createShipTracking.trim() },
      {
        onSuccess: () => {
          setCreateShipOrderId(null);
          setCreateShipTracking("");
        },
      }
    );
  }, [createShipOrderId, createShipCarrier, createShipTracking, createShipment]);

  const value: OperationsContextValue = {
    orders: orders ?? [],
    ordersLoading,
    shipments: shipments ?? [],
    shipmentsLoading,
    updateStatus,
    updateTracking,
    openCreateShipment,
    expandedOrderId,
    setExpandedOrderId,
  };

  const selectedOrder = createShipOrderId
    ? (orders ?? []).find((o) => o.id === createShipOrderId) ?? null
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
        onSubmit={handleCreateShipment}
        isPending={createShipment.isPending}
      />
    </OperationsContext.Provider>
  );
}
