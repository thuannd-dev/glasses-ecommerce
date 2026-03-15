import { useQuery } from "@tanstack/react-query";
import agent from "../api/agent";
import type { AfterSalesTicketsResponse, AfterSalesTicketDto } from "../types/afterSales";

interface OperationsTicketsQueryParams {
  resolutionType?: "ReturnAndRefund" | "WarrantyReplace";
  pageNumber?: number;
  pageSize?: number;
  status?: "Awaiting" | "Inspecting" | "Accepted" | "Rejected" | "All";
}

async function fetchOperationsTickets(
  params?: OperationsTicketsQueryParams,
): Promise<AfterSalesTicketsResponse> {
  const res = await agent.get<AfterSalesTicketsResponse>("/operations/after-sales", {
    params: {
      resolutionType: params?.resolutionType,
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 20,
    },
  });

  const response = res.data;

  // Filter on the frontend based on status and receivedAt
  if (params?.status && params.status !== "All") {
    response.items = response.items.filter((ticket) => {
      const hasReceivedAt = !!ticket.receivedAt;
      
      switch (params.status) {
        case "Awaiting":
          // Approved but not yet received by Operations
          return !hasReceivedAt;
        case "Inspecting":
          // Received, waiting for inspection decision
          return hasReceivedAt && ticket.ticketStatus === "InProgress";
        case "Accepted":
          // Inspection passed, resolved
          return ticket.ticketStatus === "Resolved";
        case "Rejected":
          // Inspection failed
          return ticket.ticketStatus === "Rejected";
        default:
          return true;
      }
    });
    response.totalCount = response.items.length;
  }

  return response;
}

export function useOperationsTickets(params?: OperationsTicketsQueryParams) {
  return useQuery({
    queryKey: ["operations", "after-sales", "tickets", params],
    queryFn: () => fetchOperationsTickets(params),
  });
}
