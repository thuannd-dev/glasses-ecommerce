import { useMutation, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import type { TicketDetailDto } from "./useStaffAfterSalesTickets";

interface ReceiveTicketPayload {
  ticketId: string;
}

interface SetTicketDestinationPayload {
  ticketId: string;
  destination: "Repair" | "Reject";
  notes?: string;
}

interface SetTicketDestinationDto {
  destination: string;
  notes?: string;
}

interface InspectReturnPayload {
  ticketId: string;
  isAccepted: boolean;
  notes?: string;
}

interface InspectReturnDto {
  isAccepted: boolean;
  notes?: string;
}

export function useReceiveWarrantyTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReceiveTicketPayload) => {
      const response = await agent.put<TicketDetailDto>(
        `/operations/after-sales/${payload.ticketId}/receive`
      );
      return response;
    },
    onSuccess: (_data, variables) => {
      // Invalidate ticket detail query
      queryClient.invalidateQueries({
        queryKey: ["opsTicketDetail", variables.ticketId],
      });
      // Invalidate ticket list query
      queryClient.invalidateQueries({
        queryKey: ["opsTickets"],
      });
    },
  });
}

export function useSetTicketDestination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SetTicketDestinationPayload) => {
      const dto: SetTicketDestinationDto = {
        destination: payload.destination,
        notes: payload.notes,
      };

      const response = await agent.put<TicketDetailDto>(
        `/operations/after-sales/${payload.ticketId}/set-destination`,
        dto
      );
      return response;
    },
    onSuccess: (_data, variables) => {
      // Invalidate ticket detail query
      queryClient.invalidateQueries({
        queryKey: ["opsTicketDetail", variables.ticketId],
      });
      // Invalidate ticket list query
      queryClient.invalidateQueries({
        queryKey: ["opsTickets"],
      });
    },
  });
}

export function useReceiveReturnRefundTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReceiveTicketPayload) => {
      const response = await agent.put<TicketDetailDto>(
        `/operations/after-sales/${payload.ticketId}/receive`
      );
      return response;
    },
    onSuccess: (_data, variables) => {
      // Invalidate ticket detail query
      queryClient.invalidateQueries({
        queryKey: ["operations", "after-sales", "detail", variables.ticketId],
      });
      // Invalidate ticket list query
      queryClient.invalidateQueries({
        queryKey: ["operations", "after-sales", "list"],
      });
    },
  });
}

export function useInspectReturnRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: InspectReturnPayload) => {
      const dto: InspectReturnDto = {
        isAccepted: payload.isAccepted,
        notes: payload.notes,
      };

      const response = await agent.put<TicketDetailDto>(
        `/operations/after-sales/${payload.ticketId}/inspect`,
        dto
      );
      return response;
    },
    onSuccess: (_data, variables) => {
      // Invalidate ticket detail query
      queryClient.invalidateQueries({
        queryKey: ["operations", "after-sales", "detail", variables.ticketId],
      });
      // Invalidate ticket list query
      queryClient.invalidateQueries({
        queryKey: ["operations", "after-sales", "list"],
      });
    },
  });
}
