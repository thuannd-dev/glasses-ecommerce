import { useMutation, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";

export interface RejectInboundDto {
  rejectionReason: string;
}

export function useRejectInbound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inboundId, dto }: { inboundId: string; dto: RejectInboundDto }) => {
      const res = await agent.put(`/manager/inventory/inbound/${inboundId}/reject`, dto);
      return res.data;
    },
    onSuccess: (_, { inboundId }) => {
      queryClient.invalidateQueries({ queryKey: ["inbound-detail", inboundId] });
      queryClient.invalidateQueries({ queryKey: ["manager-inbound-records"] });
    },
  });
}
