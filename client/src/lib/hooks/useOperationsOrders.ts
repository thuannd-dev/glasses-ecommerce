import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import type {
  OrderDto,
  ShipmentDto,
  OrderStatus,
  CreateShipmentPayload,
  UpdateTrackingPayload,
  UpdateOrderStatusPayload,
  OperationsOrdersQueryParams,
  OperationsOrdersResponse,
} from "../types/operations";
import type { StaffOrderDetailDto } from "../types/staffOrders";

const QUERY_KEY_ORDERS = ["operations", "orders"];
const QUERY_KEY_SHIPMENTS = ["operations", "shipments"];

async function fetchOrders(params?: OperationsOrdersQueryParams): Promise<OperationsOrdersResponse> {
  const res = await agent.get<OperationsOrdersResponse>("/operations/orders", {
    params: {
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 10,
      status: params?.status,
      orderType: params?.orderType,
    },
  });
  const data = res.data;
  // Ensure response is in correct format
  return {
    items: Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [],
    totalCount: data?.totalCount ?? 0,
    pageNumber: data?.pageNumber ?? 1,
    pageSize: data?.pageSize ?? 10,
    totalPages: data?.totalPages ?? 0,
    hasPreviousPage: data?.hasPreviousPage ?? false,
    hasNextPage: data?.hasNextPage ?? false,
  };
}

async function fetchOrderById(orderId: string): Promise<StaffOrderDetailDto> {
  const res = await agent.get<StaffOrderDetailDto>(`/operations/orders/${orderId}`);
  return res.data;
}

const ORDER_STATUS_TO_NEW_STATUS: Record<OrderStatus | string, number> = {
  Pending: 0,
  Confirmed: 1,
  Processing: 2,
  Shipped: 3,
  Delivered: 4,
  Completed: 5,
  Cancelled: 6,
  Refunded: 7,
  // fallback lowercase keys if backend ever returns these
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  completed: 5,
  cancelled: 6,
  refunded: 7,
};

async function apiUpdateOrderStatus(payload: UpdateOrderStatusPayload): Promise<OrderDto> {
  const newStatus = ORDER_STATUS_TO_NEW_STATUS[payload.status];

  const isShipping = payload.status === "Shipped";

  const res = await agent.put<OrderDto>(`/operations/orders/${payload.orderId}/status`, {
    newStatus,
    notes: null,
    // Backend requires shipment info (at least carrierName) when shipping an order
    shipment: isShipping
      ? {
          carrierName: payload.shipmentCarrierName ?? "GHN",
          trackingCode: payload.shipmentTrackingCode ?? null,
          trackingUrl: payload.shipmentTrackingUrl ?? null,
          estimatedDeliveryAt: payload.shipmentEstimatedDeliveryAt ?? null,
          shippingNotes: payload.shipmentNotes ?? null,
        }
      : null,
    carrierName: null,
    trackingCode: null,
    trackingUrl: null,
    estimatedDeliveryAt: null,
    shippingNotes: null,
  });
  return res.data;
}

// NOTE: Backend hiện chưa có /operations/shipments API,
// nên các hàm dưới đây được stub để không gọi endpoint đó.
async function apiCreateShipment(payload: CreateShipmentPayload): Promise<ShipmentDto> {
  return {
    id: "",
    orderId: payload.orderId,
    orderNumber: "",
    trackingNumber: payload.trackingNumber,
    carrier: payload.carrier,
    status: "created",
    createdAt: new Date().toISOString(),
  };
}

async function apiUpdateTracking(payload: UpdateTrackingPayload): Promise<ShipmentDto> {
  return {
    id: payload.shipmentId,
    orderId: "",
    orderNumber: "",
    trackingNumber: "",
    carrier: "",
    status: payload.status,
    createdAt: new Date().toISOString(),
  };
}

async function fetchShipments(): Promise<ShipmentDto[]> {
  return [];
}

export function useOperationsOrders(params?: OperationsOrdersQueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEY_ORDERS, params],
    queryFn: () => fetchOrders(params),
  });
}

export function useOperationsOrderDetail(orderId: string | undefined) {
  return useQuery({
    queryKey: ["operations", "order", orderId],
    queryFn: () => fetchOrderById(orderId!),
    enabled: !!orderId,
  });
}

export function useOperationsShipments() {
  return useQuery({
    queryKey: QUERY_KEY_SHIPMENTS,
    queryFn: fetchShipments,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateOrderStatusPayload) => apiUpdateOrderStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ORDERS });
    },
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateShipmentPayload) => apiCreateShipment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_SHIPMENTS });
    },
  });
}

export function useUpdateTracking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTrackingPayload) => apiUpdateTracking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_SHIPMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ORDERS });
    },
  });
}
