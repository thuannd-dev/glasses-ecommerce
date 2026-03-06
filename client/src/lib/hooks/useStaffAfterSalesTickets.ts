import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import type {
  StaffAfterSalesResponse,
  TicketDetailDto,
  AfterSalesTicketStatus,
  AfterSalesTicketType,
} from "../types/afterSales";

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
  return res.data;
}

async function fetchStaffAfterSalesTicketDetail(
  id: string
): Promise<TicketDetailDto> {
  const res = await agent.get<TicketDetailDto>(`/staff/after-sales/${id}`);
  return res.data;
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
    return res.data;
  } else {
    // For approve: use a simple RefundOnly approach with 0 refund for physical returns
    const res = await agent.put<TicketDetailDto>(
      `/staff/after-sales/${payload.ticketId}/approve`,
      {
        resolutionType: 0, // RefundOnly - for now, ops will handle physical cases
        refundAmount: 0,
        staffNotes: payload.reason ?? null,
      }
    );
    return res.data;
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
