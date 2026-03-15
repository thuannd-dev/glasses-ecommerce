import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import type {
  StaffOrderDto,
  StaffOrdersResponse,
  StaffOrderStatusPayload,
  StaffRevenueReport,
  StaffOrderDetailDto,
} from "../types/staffOrders";

// -------- API wrappers --------

export interface StaffOrdersQueryParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  orderType?: string;
}

async function fetchStaffOrders(params?: StaffOrdersQueryParams): Promise<StaffOrdersResponse> {
  const res = await agent.get<StaffOrdersResponse>("/staff/orders", {
    params: {
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 10,
      status: params?.status,
      orderType: params?.orderType,
    },
  });
  return res.data;
}

async function fetchStaffOrderById(id: string): Promise<StaffOrderDetailDto> {
  const res = await agent.get<StaffOrderDetailDto>(`/staff/orders/${id}`);
  return res.data;
}

async function updateStaffOrderStatus(payload: StaffOrderStatusPayload): Promise<StaffOrderDto> {
  const res = await agent.put<StaffOrderDto>(`/staff/orders/${payload.id}/status`, {
    newStatus: payload.newStatus,
    notes: payload.notes ?? null,
    shipment: payload.shipment ?? null,
    trackingCode: payload.trackingCode ?? null,
    trackingUrl: payload.trackingUrl ?? null,
    estimatedDeliveryAt: payload.estimatedDeliveryAt ?? null,
    shippingNotes: payload.shippingNotes ?? null,
  });
  return res.data;
}

async function fetchStaffRevenueReport(): Promise<StaffRevenueReport> {
  const res = await agent.get<StaffRevenueReport>("/staff/orders/reports/revenue");
  return res.data;
}

// -------- Hooks --------

export function useStaffOrders(params?: StaffOrdersQueryParams) {
  return useQuery({
    queryKey: ["staff", "orders", "list", params?.pageNumber ?? 1, params?.pageSize ?? 10, params?.status, params?.orderType],
    queryFn: () => fetchStaffOrders(params),
  });
}

export function useStaffOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["staff", "orders", "detail", orderId],
    queryFn: () => fetchStaffOrderById(orderId!),
    enabled: !!orderId,
    retry: false,
  });
}

export function useUpdateStaffOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStaffOrderStatus,
    onSuccess: () => {
      // Refresh list + revenue caches (detail keeps current state)
      queryClient.invalidateQueries({ queryKey: ["staff", "orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "orders", "revenue"] });
    },
  });
}

export function useStaffRevenueReport() {
  return useQuery({
    queryKey: ["staff", "orders", "revenue"],
    queryFn: fetchStaffRevenueReport,
  });
}

