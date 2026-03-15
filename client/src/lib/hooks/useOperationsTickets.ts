import { useQuery } from "@tanstack/react-query";
import agent from "../api/agent";
import type { AfterSalesTicketsResponse } from "../types/afterSales";

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

  // Filter on the frontend based on status
  if (params?.status && params.status !== "All") {
    response.items = response.items.filter((ticket) => {
      const ticketStatus = ticket.ticketStatus || ticket.status;
      
      switch (params.status) {
        case "Awaiting":
          // Pending or InProgress tickets not yet received
          return ticketStatus === "Pending" || (ticketStatus === "InProgress" && !ticket.receivedAt);
        case "Inspecting":
          // InProgress tickets that have been received
          return ticketStatus === "InProgress" && !!ticket.receivedAt;
        case "Accepted":
          // Resolved tickets (accepted inspection)
          return ticketStatus === "Resolved";
        case "Rejected":
          // Rejected tickets (failed inspection)
          return ticketStatus === "Rejected";
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
