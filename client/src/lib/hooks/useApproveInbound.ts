import { useMutation, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";

export function useApproveInbound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inboundId: string) => {
      const res = await agent.put(`/manager/inventory/inbound/${inboundId}/approve`);
      return res.data;
    },
    onSuccess: (_, inboundId) => {
      queryClient.invalidateQueries({ queryKey: ["inbound-detail", inboundId] });
      queryClient.invalidateQueries({ queryKey: ["manager-inbound-records"] });
    },
  });
}
