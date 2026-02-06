import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

interface OrderListDto {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
  orderType: "Unknown" | "ReadyStock" | "PreOrder" | "Prescription";
  orderStatus: "Pending" | "Confirmed" | "InProduction" | "ReadyToPack" | "Packed" | "HandedOverToCarrier" | "Delivered" | "Completed" | "Cancelled" | "Refunded";
  createdAt: string;
  orderSource: "Unknown" | "Online" | "Offline";
  itemCount: number;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface OrderDetailDto {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: AddressDto;
  totalAmount: number;
  shippingFee: number;
  orderType: string;
  orderStatus: string;
  orderSource: string;
  customerNote?: string;
  createdAt: string;
  updatedAt?: string;
  orderItems: OrderItemDetailDto[];
  prescription?: PrescriptionDto;
}

export interface AddressDto {
  recipientName: string;
  recipientPhone: string;
  venue: string;
  ward: string;
  district: string;
  city: string;
  postalCode?: string;
}

export interface OrderItemDetailDto {
  id: string;
  orderItemId: string;
  productName: string;
  glassModel: string;
  lensType: string;
  quantity: number;
  unitPrice: number;
}

export interface PrescriptionDto {
  id: string;
  isVerified: boolean;
  details: PrescriptionDetailDto[];
}

export interface PrescriptionDetailDto {
  eye: "Unknown" | "Left" | "Right";
  sph?: number;
  cyl?: number;
  axis?: number;
  pd?: number;
  add?: number;
}

const API_BASE = "https://localhost:5001/api";

// Queries
export function useGetOrders(
  pageNumber: number = 1,
  pageSize: number = 10,
  filters?: {
    customerEmail?: string;
    status?: string;
    type?: string;
    source?: string;
    fromDate?: string;
    toDate?: string;
  }
) {
  return useQuery({
    queryKey: ["orders", pageNumber, pageSize, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
      });

      if (filters?.customerEmail) params.append("customerEmail", filters.customerEmail);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.type) params.append("type", filters.type);
      if (filters?.source) params.append("source", filters.source);
      if (filters?.fromDate) params.append("fromDate", filters.fromDate);
      if (filters?.toDate) params.append("toDate", filters.toDate);

      const response = await axios.get<PagedResult<OrderListDto>>(
        `${API_BASE}/orders?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    },
  });
}

export function useGetOrderDetail(orderId: string) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await axios.get<OrderDetailDto>(
        `${API_BASE}/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!orderId,
  });
}

// Mutations
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      data,
    }: {
      orderId: string;
      data: {
        orderItems?: { orderItemId: string; quantity: number }[];
        prescription?: {
          details: Array<{
            eye: string;
            sph?: number;
            cyl?: number;
            axis?: number;
            pd?: number;
            add?: number;
          }>;
        };
      };
    }) => {
      const response = await axios.put(
        `${API_BASE}/orders/${orderId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order updated successfully");
    },
    onError: () => {
      toast.error("Failed to update order");
    },
  });
}

export function useConfirmOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await axios.put(
        `${API_BASE}/orders/${orderId}/confirm`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order confirmed and queued to Operation tab");
    },
    onError: () => {
      toast.error("Failed to confirm order");
    },
  });
}

export function useGetOperationQueueOrders(
  pageNumber: number = 1,
  pageSize: number = 10,
  filterStatus: string = "Confirmed",
  filters?: {
    customerEmail?: string;
    type?: string;
    fromDate?: string;
    toDate?: string;
  }
) {
  return useQuery({
    queryKey: ["operation-orders", pageNumber, pageSize, filterStatus, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
        filterStatus: filterStatus,
      });

      if (filters?.customerEmail) params.append("customerEmail", filters.customerEmail);
      if (filters?.type) params.append("type", filters.type);
      if (filters?.fromDate) params.append("fromDate", filters.fromDate);
      if (filters?.toDate) params.append("toDate", filters.toDate);

      const response = await axios.get<PagedResult<OrderListDto>>(
        `${API_BASE}/orders/operation-queue?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    },
  });
}

export function useSelectLensForPrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      lensProductVariantId,
      quantity,
    }: {
      orderId: string;
      lensProductVariantId: string;
      quantity: number;
    }) => {
      const response = await axios.post(
        `${API_BASE}/orders/${orderId}/select-lens`,
        { lensProductVariantId, quantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["operation-orders"] });
      toast.success("Lens selected and inventory updated");
    },
    onError: () => {
      toast.error("Failed to select lens");
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      newStatus,
      pickedQuantity,
    }: {
      orderId: string;
      newStatus: string;
      pickedQuantity?: number;
    }) => {
      const response = await axios.put(
        `${API_BASE}/orders/${orderId}/status`,
        { newStatus, pickedQuantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["operation-orders"] });
      queryClient.invalidateQueries({ queryKey: ["in-production-orders"] });
      queryClient.invalidateQueries({ queryKey: ["completed-orders"] });
      toast.success("Order status updated");
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });
}

export function useGetInProductionOrders(
  pageNumber: number = 1,
  pageSize: number = 10,
  filters?: {
    customerEmail?: string;
    type?: string;
    fromDate?: string;
    toDate?: string;
  }
) {
  return useQuery({
    queryKey: ["in-production-orders", pageNumber, pageSize, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
      });

      if (filters?.customerEmail) params.append("customerEmail", filters.customerEmail);
      if (filters?.type) params.append("type", filters.type);
      if (filters?.fromDate) params.append("fromDate", filters.fromDate);
      if (filters?.toDate) params.append("toDate", filters.toDate);

      const response = await axios.get<PagedResult<OrderListDto>>(
        `${API_BASE}/orders/in-production?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    },
  });
}

export function useGetCompletedOrders(
  pageNumber: number = 1,
  pageSize: number = 10,
  filters?: {
    customerEmail?: string;
    type?: string;
    fromDate?: string;
    toDate?: string;
  }
) {
  return useQuery({
    queryKey: ["completed-orders", pageNumber, pageSize, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
      });

      if (filters?.customerEmail) params.append("customerEmail", filters.customerEmail);
      if (filters?.type) params.append("type", filters.type);
      if (filters?.fromDate) params.append("fromDate", filters.fromDate);
      if (filters?.toDate) params.append("toDate", filters.toDate);

      const response = await axios.get<PagedResult<OrderListDto>>(
        `${API_BASE}/orders/completed?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    },
  });
}
