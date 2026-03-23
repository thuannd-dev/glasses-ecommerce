import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import agent from "../api/agent";
import { profileQueryKey } from "./useProfile";

export interface UpdateDisplayNamePayload {
  displayName: string;
}

export function useUpdateDisplayName(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateDisplayNamePayload) => {
      const response = await agent.put<void>("/account/update-display-name", {
        displayName: payload.displayName,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate profile queries to refresh the display name
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: profileQueryKey(userId) });
      }
      void queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to update display name. Please try again.";
      toast.error(message);
    },
  });
}
