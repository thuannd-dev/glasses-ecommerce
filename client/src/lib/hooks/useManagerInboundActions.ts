import { useMutation, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";

export function useApproveInbound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await agent.put(`/manager/inventory/inbound/${id}/approve`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["manager-inbound-records"] });
      await queryClient.invalidateQueries({ queryKey: ["manager-inbound-detail"] });
    },
  });
}

export function useRejectInbound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; rejectionReason: string }) => {
      await agent.put(`/manager/inventory/inbound/${data.id}/reject`, {
        rejectionReason: data.rejectionReason,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["manager-inbound-records"] });
      await queryClient.invalidateQueries({ queryKey: ["manager-inbound-detail"] });
    },
  });
}
