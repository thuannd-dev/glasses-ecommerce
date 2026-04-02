import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import type {
  PolicyConfigurationDto,
  CreatePolicyPayload,
  UpdatePolicyPayload,
  AdminPoliciesQueryParams,
  PagedPoliciesResponse,
} from "../types";

export const useAdminPolicies = (queryParams?: AdminPoliciesQueryParams) => {
  const queryClient = useQueryClient();

  // Get paginated policies list
  const { data: policiesData, isLoading: isPoliciesLoading } = useQuery({
    queryKey: ["admin", "policies", queryParams],
    queryFn: async () => {
      const response = await agent.get<PagedPoliciesResponse>(
        "/admin/policies",
        { params: queryParams || {} }
      );
      return response.data;
    },
  });

  // Create policy mutation
  const createPolicyMutation = useMutation({
    mutationFn: async (payload: CreatePolicyPayload) => {
      const response = await agent.post<PolicyConfigurationDto>(
        "/admin/policies",
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "policies"] });
    },
  });

  // Update policy mutation
  const updatePolicyMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePolicyPayload;
    }) => {
      const response = await agent.put<PolicyConfigurationDto>(
        `/admin/policies/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "policies"] });
    },
  });

  // Delete policy mutation
  const deletePolicyMutation = useMutation({
    mutationFn: async (id: string) => {
      await agent.delete(`/admin/policies/${id}`);
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "policies"] });
      const snapshots = queryClient.getQueriesData<PagedPoliciesResponse>({
        queryKey: ["admin", "policies"],
      });

      snapshots.forEach(([queryKey, data]) => {
        if (!data) return;
        const nextItems = (data.items ?? []).filter((p) => p.id !== id);
        queryClient.setQueryData<PagedPoliciesResponse>(queryKey, {
          ...data,
          items: nextItems,
          totalCount: Math.max(0, (data.totalCount ?? nextItems.length) - 1),
        });
      });

      return { snapshots };
    },
    onError: (_err, _id, context) => {
      context?.snapshots?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "policies"] });
    },
  });

  // Get single policy details
  const getPolicyDetails = async (id: string) => {
    const response = await agent.get<PolicyConfigurationDto>(
      `/admin/policies/${id}`
    );
    return response.data;
  };

  return {
    // Hide soft-deleted policies from admin table.
    policies: (policiesData?.items || []).filter((p) => !p.isDeleted),
    policiesData,
    isPoliciesLoading,
    createPolicy: createPolicyMutation.mutate,
    isCreating: createPolicyMutation.isPending,
    updatePolicy: updatePolicyMutation.mutate,
    isUpdating: updatePolicyMutation.isPending,
    deletePolicy: deletePolicyMutation.mutate,
    isDeleting: deletePolicyMutation.isPending,
    getPolicyDetails,
  };
};
