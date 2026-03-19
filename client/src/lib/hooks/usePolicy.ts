import { useQuery } from "@tanstack/react-query";
import agent from "../api/agent";
import type { PolicyConfigurationDto } from "../types";

type ActivePoliciesResponse = PolicyConfigurationDto[] | { items: PolicyConfigurationDto[] };

/** GET /api/policies/active — list active customer-facing policies (Return/Warranty/Refund) */
export function usePolicy() {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["policies", "active"],
    queryFn: async () => {
      const res = await agent.get<ActivePoliciesResponse>("/policies/active");
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray(payload.items)) return payload.items;
      return [];
    },
  });

  return {
    policies: data ?? [],
    policiesData: data,
    isPoliciesLoading: isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}

