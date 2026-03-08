import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import type {
  TicketDetailDto,
  AfterSalesTicketType,
  StaffAfterSalesResponse,
} from "../types/afterSales";

const QUERY_KEY_MY_TICKETS = ["me", "after-sales"];

export interface SubmitTicketPayload {
  orderId: string;
  orderItemIds?: string[];
  ticketType: AfterSalesTicketType;
  reason: string;
  requestedAction?: string | null;
  refundAmount?: number | null;
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    fileExtension?: string;
  }>;
}

/** POST /api/me/after-sales — submit a warranty/return/refund ticket */
export function useSubmitTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SubmitTicketPayload) => {
      // Map numeric enum to string representation for backend JsonStringEnumConverter
      const ticketTypeMap: Record<number, string> = {
        1: "Return",
        2: "Warranty",
        3: "Refund",
      };
      
      const body = {
        orderId: payload.orderId,
        orderItemIds: payload.orderItemIds || [],
        ticketType: ticketTypeMap[payload.ticketType] || "Unknown",
        reason: payload.reason,
        requestedAction: payload.requestedAction || null,
        refundAmount: payload.refundAmount || null,
        attachments: payload.attachments,
      };
      const res = await agent.post<TicketDetailDto>("/me/after-sales", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_MY_TICKETS });
    },
  });
}

/** GET /api/me/after-sales — list my after-sales tickets */
export function useMyTickets(pageNumber = 1, pageSize = 10) {
  return useQuery<StaffAfterSalesResponse>({
    queryKey: [...QUERY_KEY_MY_TICKETS, pageNumber, pageSize],
    queryFn: async () => {
      const res = await agent.get<StaffAfterSalesResponse>("/me/after-sales", {
        params: { pageNumber, pageSize },
      });
      return res.data;
    },
  });
}

/** DELETE /api/me/after-sales/{id} — cancel a pending ticket */
export function useCancelTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticketId: string) => {
      const res = await agent.delete(`/me/after-sales/${ticketId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_MY_TICKETS });
    },
  });
}

/** GET /api/me/after-sales/:id — ticket detail */
export function useTicketDetail(ticketId: string | undefined) {
  return useQuery<TicketDetailDto>({
    queryKey: [...QUERY_KEY_MY_TICKETS, ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const res = await agent.get<TicketDetailDto>(`/me/after-sales/${ticketId}`);
      return res.data;
    },
  });
}
