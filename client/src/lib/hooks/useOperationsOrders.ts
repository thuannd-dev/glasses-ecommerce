import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrders,
  fetchOrderById,
  updateOrderStatus as apiUpdateOrderStatus,
  createShipment,
  updateTracking as apiUpdateTracking,
  fetchShipments,
} from "../../features/Operations/api";
import type {
  OrderType,
  OrderStatus,
  CreateShipmentPayload,
  UpdateTrackingPayload,
  UpdateOrderStatusPayload,
} from "../types/operations";

const QUERY_KEY_ORDERS = ["operations", "orders"];
const QUERY_KEY_SHIPMENTS = ["operations", "shipments"];

export function useOperationsOrders(params?: { orderType?: OrderType; status?: OrderStatus }) {
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
    mutationFn: (payload: CreateShipmentPayload) => createShipment(payload),
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
