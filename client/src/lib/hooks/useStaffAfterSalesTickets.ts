import { useQuery } from "@tanstack/react-query";
import agent from "../api/agent";
import type {
  StaffAfterSalesResponse,
  TicketDetailDto,
} from "../types/afterSales";
import { AfterSalesTicketStatus, AfterSalesTicketType } from "../types/afterSales";

// -------- API wrappers --------

export interface StaffAfterSalesQueryParams {
  pageNumber?: number;
  pageSize?: number;
  status?: AfterSalesTicketStatus;
  ticketType?: AfterSalesTicketType;
  orderId?: string;
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
