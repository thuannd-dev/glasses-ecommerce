import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import type {
  CreateOrderPayload,
  MeOrderDto,
  MyOrdersPageDto,
} from "../types/order";

const QUERY_KEY_MY_ORDERS = ["me", "orders"];

export interface CreatePaymentUrlPayload {
  orderId: string;
  orderType: string;
  amount: number;
  name: string;
  orderDescription?: string;
}

export function useCreatePaymentUrl() {
  return useMutation({
    mutationFn: async (payload: CreatePaymentUrlPayload) => {
      const res = await agent.post<string>("/me/payments/create-url", payload);
      return res.data;
    },
  });
}

/** POST /api/me/orders — create order from current cart */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      // Backend expects CheckoutDto at ROOT of body (no wrapper).
      const body: Record<string, unknown> = {
        addressId: payload.addressId,
        orderType: payload.orderType ?? "ReadyStock",
        paymentMethod: payload.paymentMethod,
        customerNote: payload.orderNote ?? null,
        selectedCartItemIds: payload.selectedCartItemIds,
        districtId: payload.districtId,
        wardCode: payload.wardCode,
      };
      if (payload.promoCode != null && payload.promoCode.trim() !== "") {
        body.promoCode = payload.promoCode.trim();
      }
      // Send prescriptions array formatted as OrderItemPrescriptionDto for backend
      if (payload.prescriptions != null && payload.prescriptions.length > 0) {
        body.prescriptions = payload.prescriptions;
      }
      const res = await agent.post<MeOrderDto>("/me/orders", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_MY_ORDERS });
    },
  });
}

/** GET /api/me/orders — list my orders (paginated from backend) */
export function useMyOrders(pageNumber: number = 1, status?: string) {
  return useQuery<MyOrdersPageDto>({
    queryKey: [...QUERY_KEY_MY_ORDERS, pageNumber, status],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        pageNumber,
      };
      if (status && status.trim() !== "") {
        params.status = status;
      }
      const res = await agent.get<MyOrdersPageDto>("/me/orders", {
        params,
      });
      return res.data;
    },
  });
}

/** GET /api/me/orders/:id — order detail */
export function useOrder(orderId: string | undefined) {
  return useQuery<MeOrderDto>({
    queryKey: [...QUERY_KEY_MY_ORDERS, orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const res = await agent.get<MeOrderDto>(`/me/orders/${orderId}`);
      return res.data;
    },
  });
}

/** PUT /api/me/orders/:id/cancel — cancel order with reason */
export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      reason,
    }: {
      orderId: string;
      reason: string | null;
    }) => {
      const res = await agent.put<MeOrderDto>(`/me/orders/${orderId}/cancel`, {
        reason: reason ?? null,
      });
      return res.data;
    },
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_MY_ORDERS, orderId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_MY_ORDERS });
    },
  });
}
