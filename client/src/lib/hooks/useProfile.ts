import { useQuery } from "@tanstack/react-query";
import agent from "../api/agent";
import type { Profile } from "../types/user";

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await agent.get<Profile>(`/profiles/${userId}`);
      return response.data;
    },
  });
}

