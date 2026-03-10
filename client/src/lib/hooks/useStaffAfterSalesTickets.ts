import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import type {
  StaffAfterSalesResponse,
  TicketDetailDto,
  AfterSalesTicketStatus,
  AfterSalesTicketType,
  TicketResolutionType,
} from "../types/afterSales";
import {
  AfterSalesTicketTypeValues,
  TicketResolutionTypeValues,
} from "../types/afterSales";
import {
  normalizeStaffAfterSalesResponse,
  normalizeTicketDetailDto,
} from "../utils/enumConverters";

// -------- Re-export types --------
export type { TicketDetailDto };

// -------- API wrappers --------

export interface StaffAfterSalesQueryParams {
  pageNumber?: number;
  pageSize?: number;
  status?: AfterSalesTicketStatus;
  ticketType?: AfterSalesTicketType;
  orderId?: string;
}

export interface UpdateTicketStatusPayload {
  ticketId: string;
  actionType: "approve" | "reject";
  reason?: string;
  refundAmount?: number; // Override refund amount for RefundOnly tickets
  ticket?: TicketDetailDto; // Pass ticket data to determine resolution type
}

async function fetchStaffAfterSalesTickets(
  params?: StaffAfterSalesQueryParams
): Promise<StaffAfterSalesResponse> {
  const res = await agent.get<StaffAfterSalesResponse>("/staff/after-sales", {
    params: {
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 20,
      status: params?.status,
      ticketType: params?.ticketType,
      orderId: params?.orderId,
    },
  });
  return normalizeStaffAfterSalesResponse(res.data);
}

async function fetchStaffAfterSalesTicketDetail(
  id: string
): Promise<TicketDetailDto> {
  const res = await agent.get<TicketDetailDto>(`/staff/after-sales/${id}`);
  return normalizeTicketDetailDto(res.data);
}

async function updateTicketStatus(
  payload: UpdateTicketStatusPayload
): Promise<TicketDetailDto> {
  if (payload.actionType === "reject") {
    const res = await agent.put<TicketDetailDto>(
      `/staff/after-sales/${payload.ticketId}/reject`,
      {
        reason: payload.reason ?? "No reason provided",
      }
    );
    return normalizeTicketDetailDto(res.data);
  } else {
    // For approve: determine resolution type based on ticket type
    if (!payload.ticket) {
      throw new Error("Ticket data is required for approval");
    }

    let resolutionType: TicketResolutionType;
    let refundAmount: number | null = null;

    // Determine resolution type and refund amount based on ticket type
    if (payload.ticket.ticketType === AfterSalesTicketTypeValues.Refund) {
      resolutionType = TicketResolutionTypeValues.RefundOnly;
      // Use staff-provided refund amount if available, otherwise use the ticket's refundAmount or order item total
      if (payload.refundAmount !== undefined && payload.refundAmount > 0) {
        refundAmount = payload.refundAmount;
      } else {
        refundAmount =
          payload.ticket.refundAmount ||
          (payload.ticket.orderItem?.totalPrice ?? 0);
      }
    } else if (
      payload.ticket.ticketType === AfterSalesTicketTypeValues.Return
    ) {
      resolutionType = TicketResolutionTypeValues.ReturnAndRefund;
      // For Return: refundAmount will be calculated by operations team
    } else if (
      payload.ticket.ticketType === AfterSalesTicketTypeValues.Warranty
    ) {
      // Default to Repair for warranty tickets
      resolutionType = TicketResolutionTypeValues.WarrantyRepair;
    } else {
      throw new Error("Unknown ticket type");
    }

    const res = await agent.put<TicketDetailDto>(
      `/staff/after-sales/${payload.ticketId}/approve`,
      {
        resolutionType,
        refundAmount: refundAmount || undefined,
        staffNotes: payload.reason ?? null,
      }
    );
    return normalizeTicketDetailDto(res.data);
  }
}

// -------- Hooks --------

export function useStaffAfterSalesTickets(
  params?: StaffAfterSalesQueryParams
) {
  return useQuery({
    queryKey: ["staff", "after-sales", "list", params],
    queryFn: () => fetchStaffAfterSalesTickets(params),
  });
}

export function useStaffAfterSalesTicketDetail(ticketId: string | undefined) {
  return useQuery({
    queryKey: ["staff", "after-sales", "detail", ticketId],
    queryFn: () => {
      if (!ticketId) throw new Error("Ticket ID is required");
      return fetchStaffAfterSalesTicketDetail(ticketId);
    },
    enabled: !!ticketId,
    retry: false,
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTicketStatus,
    onSuccess: () => {
      // Refresh list cache
      queryClient.invalidateQueries({ queryKey: ["staff", "after-sales", "list"] });
    },
  });
}

// -------- Operations API wrappers --------

export interface OperationsTicketsQueryParams {
  pageNumber?: number;
  pageSize?: number;
  resolutionType?: number; // WarrantyRepair (2), WarrantyReplace (3), ReturnAndRefund (1)
}

async function fetchOperationsTickets(
  params?: OperationsTicketsQueryParams
): Promise<StaffAfterSalesResponse> {
  const res = await agent.get<StaffAfterSalesResponse>("/operations/after-sales", {
    params: {
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 20,
      resolutionType: params?.resolutionType,
    },
  });
  return normalizeStaffAfterSalesResponse(res.data);
}

async function fetchOperationsTicketDetail(
  id: string
): Promise<TicketDetailDto> {
  const res = await agent.get<TicketDetailDto>(`/operations/after-sales/${id}`);
  return normalizeTicketDetailDto(res.data);
}

// -------- Operations Hooks --------

export function useOperationsTickets(
  params?: OperationsTicketsQueryParams
) {
  return useQuery({
    queryKey: ["operations", "after-sales", "list", params],
    queryFn: () => fetchOperationsTickets(params),
  });
}

export function useOperationsTicketDetail(ticketId: string | undefined) {
  return useQuery({
    queryKey: ["operations", "after-sales", "detail", ticketId],
    queryFn: () => {
      if (!ticketId) throw new Error("Ticket ID is required");
      return fetchOperationsTicketDetail(ticketId);
    },
    enabled: !!ticketId,
    retry: false,
  });
}
