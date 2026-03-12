import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import type { AfterSalesTicketsResponse, AfterSalesTicketDto } from "../types/afterSales";
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

async function fetchOperationsAfterSalesTicketById(id: string): Promise<AfterSalesTicketDto> {
  const res = await agent.get<AfterSalesTicketDto>(`/operations/after-sales/${id}`);
  return res.data;
}

export function useOperationsAfterSalesTicket(id: string | undefined) {
  return useQuery({
    queryKey: ["operations", "after-sales", "detail", id],
    enabled: !!id,
    queryFn: () => fetchOperationsAfterSalesTicketById(id!),
  });
}

async function receiveAfterSalesTicket(id: string): Promise<AfterSalesTicketDto> {
  const res = await agent.put<AfterSalesTicketDto>(`/operations/after-sales/${id}/receive`, {});
  return res.data;
}

async function inspectAfterSalesTicket(id: string): Promise<AfterSalesTicketDto> {
  const res = await agent.put<AfterSalesTicketDto>(`/operations/after-sales/${id}/inspect`, {});
  return res.data;
}

export function useReceiveAfterSalesTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => receiveAfterSalesTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations", "after-sales"] });
    },
  });
}

export function useInspectAfterSalesTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inspectAfterSalesTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations", "after-sales"] });
    },
  });
}



