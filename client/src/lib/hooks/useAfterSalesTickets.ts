import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import type { AfterSalesTicketDto, AfterSalesTicketsResponse } from "../types/afterSales";

// ---- Sales after-sales tickets (staff) ----

export interface AfterSalesTicketsQueryParams {
  pageNumber?: number;
  pageSize?: number;
  ticketType?: string;
  status?: string;
}

async function fetchAfterSalesTickets(
  params?: AfterSalesTicketsQueryParams,
): Promise<AfterSalesTicketsResponse> {
  const res = await agent.get<AfterSalesTicketsResponse>("/staff/after-sales", {
    params: {
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 10,
      ...(params?.ticketType && { ticketType: params.ticketType }),
      ...(params?.status && { status: params.status }),
    },
  });

  return res.data;
}

export function useAfterSalesTickets(params?: AfterSalesTicketsQueryParams) {
  return useQuery({
    queryKey: ["staff", "after-sales", "list", params],
    queryFn: () => fetchAfterSalesTickets(params),
  });
}

// ---- Staff after-sales detail + actions ----

async function fetchStaffAfterSalesTicketById(id: string): Promise<AfterSalesTicketDto> {
  const res = await agent.get<AfterSalesTicketDto>(`/staff/after-sales/${id}`);
  return res.data;
}

export function useStaffAfterSalesTicket(id: string | undefined) {
  return useQuery({
    queryKey: ["staff", "after-sales", "detail", id],
    enabled: !!id,
    queryFn: () => fetchStaffAfterSalesTicketById(id!),
  });
}

async function approveStaffAfterSalesTicket(ticketId: string, dto: { resolutionType: string; staffNotes?: string; refundAmount?: number }): Promise<AfterSalesTicketDto> {
  const res = await agent.put<AfterSalesTicketDto>(`/staff/after-sales/${ticketId}/approve`, {
    resolutionType: dto.resolutionType,
    staffNotes: dto.staffNotes,
    refundAmount: dto.refundAmount,
  });
  return res.data;
}

async function rejectStaffAfterSalesTicket(ticketId: string, dto: { reason: string }): Promise<AfterSalesTicketDto> {
  const res = await agent.put<AfterSalesTicketDto>(`/staff/after-sales/${ticketId}/reject`, {
    reason: dto.reason,
  });
  return res.data;
}

async function requestEvidenceForStaffAfterSalesTicket(id: string): Promise<AfterSalesTicketDto> {
  const res = await agent.put<AfterSalesTicketDto>(`/staff/after-sales/${id}/request-evidence`, {});
  return res.data;
}

export function useApproveStaffAfterSalesTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { ticketId: string; resolutionType: string; staffNotes?: string; refundAmount?: number }) =>
      approveStaffAfterSalesTicket(params.ticketId, {
        resolutionType: params.resolutionType,
        staffNotes: params.staffNotes,
        refundAmount: params.refundAmount,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "after-sales"] });
    },
  });
}

export function useRejectStaffAfterSalesTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { ticketId: string; reason: string }) =>
      rejectStaffAfterSalesTicket(params.ticketId, { reason: params.reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "after-sales"] });
    },
  });
}

export function useRequestEvidenceStaffAfterSalesTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requestEvidenceForStaffAfterSalesTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "after-sales"] });
    },
  });
}


