import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import type { AfterSalesTicketsResponse, TicketDetailDto } from "../types/afterSales";
import type { AfterSalesTicketsQueryParams } from "./useAfterSalesTickets";

// ---- Operations after-sales tickets ----

async function fetchOperationsAfterSalesTickets(
  params?: AfterSalesTicketsQueryParams,
): Promise<AfterSalesTicketsResponse> {
  const res = await agent.get<AfterSalesTicketsResponse>("/operations/after-sales", {
    params: {
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 10,
    },
  });

  return res.data;
}

export function useOperationsAfterSalesTickets(params?: AfterSalesTicketsQueryParams) {
  return useQuery({
    queryKey: ["operations", "after-sales", "list", params],
    queryFn: () => fetchOperationsAfterSalesTickets(params),
  });
}

// ---- Detail + actions (receive / inspect) ----

async function fetchOperationsAfterSalesTicketById(id: string): Promise<TicketDetailDto> {
  const res = await agent.get<TicketDetailDto>(`/operations/after-sales/${id}`);
  return res.data;
}

export function useOperationsAfterSalesTicket(id: string | undefined) {
  return useQuery({
    queryKey: ["operations", "after-sales", "detail", id],
    enabled: !!id,
    queryFn: () => fetchOperationsAfterSalesTicketById(id!),
  });
}

async function receiveAfterSalesTicket(id: string): Promise<TicketDetailDto> {
  const res = await agent.put<TicketDetailDto>(`/operations/after-sales/${id}/receive`, {});
  return res.data;
}

interface InspectDecisionPayload {
  isAccepted: boolean;
  notes: string;
}

async function inspectAfterSalesTicket(id: string, decision: InspectDecisionPayload): Promise<TicketDetailDto> {
  const res = await agent.put<TicketDetailDto>(`/operations/after-sales/${id}/inspect`, decision);
  return res.data;
}

export function useReceiveAfterSalesTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => receiveAfterSalesTicket(id),
    onSuccess: async () => {
      console.log("✅ Receive success - invalidating operations queries");
      // Invalidate all operations-related queries
      await queryClient.invalidateQueries({
        queryKey: ["operations"],
      });
      // Give queries a moment to refetch
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log("✅ Invalidation completed - queries stale and will refetch");
    },

  });
}

export function useInspectAfterSalesTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; decision: InspectDecisionPayload }) =>
      inspectAfterSalesTicket(params.id, params.decision),
    onSuccess: async () => {
      console.log("✅ Inspect success - invalidating all operations queries");
      // Invalidate all operations-related queries to force refetch
      await queryClient.invalidateQueries({
        queryKey: ["operations"],
      });
      // Give queries a moment to refetch
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log("✅ Invalidation completed - queries stale and will refetch");
    },

  });
}



