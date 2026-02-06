import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

interface AfterSalesTicketListDto {
  id: string;
  ticketNumber: string;
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  ticketType: "Unknown" | "Return" | "Warranty" | "Refund";
  ticketStatus: "Pending" | "InProgress" | "Resolved" | "Rejected" | "Closed";
  reason: string;
  policyViolation?: string;
  createdAt: string;
  refundAmount?: number;
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

export interface AfterSalesTicketDetailDto {
  id: string;
  ticketNumber: string;
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  ticketType: string;
  ticketStatus: string;
  reason: string;
  requestedAction?: string;
  refundAmount?: number;
  isRequiredEvidence: boolean;
  policyViolation?: string;
  createdAt: string;
  resolvedAt?: string;
  orderSummary: OrderSummaryDto;
}

export interface OrderSummaryDto {
  id: string;
  orderNumber: string;
  totalAmount: number;
  orderType: string;
  createdAt: string;
  items: OrderItemSummaryDto[];
}

export interface OrderItemSummaryDto {
  id: string;
  productName: string;
  glassModel: string;
  quantity: number;
  unitPrice: number;
}

const API_BASE = "https://localhost:5001/api";

// Queries
export function useGetTickets(
  pageNumber: number = 1,
  pageSize: number = 10,
  filters?: {
    customerEmail?: string;
    type?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }
) {
  return useQuery({
    queryKey: ["tickets", pageNumber, pageSize, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
      });

      if (filters?.customerEmail) params.append("customerEmail", filters.customerEmail);
      if (filters?.type) params.append("type", filters.type);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.fromDate) params.append("fromDate", filters.fromDate);
      if (filters?.toDate) params.append("toDate", filters.toDate);

      const response = await axios.get<PagedResult<AfterSalesTicketListDto>>(
        `${API_BASE}/tickets?${params}`,
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

export function useGetTicketDetail(ticketId: string) {
  return useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      const response = await axios.get<AfterSalesTicketDetailDto>(
        `${API_BASE}/tickets/${ticketId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!ticketId,
  });
}

// Mutations
export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      data,
    }: {
      ticketId: string;
      data: {
        newStatus: string;
        notes?: string;
        refundAmount?: number;
      };
    }) => {
      const response = await axios.put(
        `${API_BASE}/tickets/${ticketId}/status`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update ticket status");
    },
  });
}
