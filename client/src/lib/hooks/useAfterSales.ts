import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import type {
  TicketDetailDto,
  MyTicketsPageDto,
} from "../types/afterSales";

const QUERY_KEY_MY_TICKETS = ["me", "after-sales"];
const QUERY_KEY_ORDER_TICKETS = ["me", "after-sales", "orders"];

/** GET /api/me/after-sales — list my tickets (paginated) */
export function useMyTickets(pageNumber: number = 1) {
  return useQuery<MyTicketsPageDto>({
    queryKey: [...QUERY_KEY_MY_TICKETS, pageNumber],
    queryFn: async () => {
      const res = await agent.get<MyTicketsPageDto>("/me/after-sales", {
        params: {
          pageNumber,
        },
      });
      return res.data;
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

/** GET /api/me/after-sales/orders/:orderId — tickets for a specific order */
export function useTicketsByOrder(orderId: string | undefined) {
  return useQuery<TicketDetailDto[]>({
    queryKey: [...QUERY_KEY_ORDER_TICKETS, orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const res = await agent.get<TicketDetailDto[]>(
        `/me/after-sales/orders/${orderId}`
      );
      return res.data;
    },
  });
}

/** POST /api/me/after-sales/:id/cancel — cancel a pending ticket */
export function useCancelTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticketId: string) => {
      const res = await agent.post<TicketDetailDto>(
        `/me/after-sales/${ticketId}/cancel`,
        {}
      );
      return res.data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_MY_TICKETS });
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_ORDER_TICKETS, data.orderId],
      });
    },
  });
}
