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
  return res.data;
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

const CARRIER_TO_ENUM: Record<string, number> = {
  GHN: 1,   // Giao Hàng Nhanh
  GHTK: 2,  // Giao Hàng Tiết Kiệm
};

function ensureAbsoluteUrl(url: string | null | undefined): string | null {
  if (!url || url.trim() === "") return null;
  
  const trimmed = url.trim();
  // If already has a scheme, return as-is
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  // Otherwise prepend https://
  return `https://${trimmed}`;
}

async function apiUpdateOrderStatus(payload: UpdateOrderStatusPayload): Promise<OrderDto> {
  const newStatus = ORDER_STATUS_TO_NEW_STATUS[payload.status];

  const isShipping = payload.status === "shipped";

  const carrierEnum = isShipping && payload.shipmentCarrierName 
    ? CARRIER_TO_ENUM[payload.shipmentCarrierName] ?? 1
    : null;

  const res = await agent.put<OrderDto>(`/operations/orders/${payload.orderId}/status`, {
    NewStatus: newStatus,
    Notes: null,
    // Backend requires shipment info (at least CarrierName) when shipping an order
    Shipment: isShipping
      ? {
          CarrierName: carrierEnum ?? 1,
          TrackingCode: payload.shipmentTrackingCode ?? null,
          TrackingUrl: ensureAbsoluteUrl(payload.shipmentTrackingUrl),
          EstimatedDeliveryAt: payload.shipmentEstimatedDeliveryAt ?? null,
          ShippingNotes: payload.shipmentNotes ?? null,
        }
      : null,
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ORDERS });
      queryClient.invalidateQueries({ queryKey: ["operations", "order", variables.orderId] });
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
