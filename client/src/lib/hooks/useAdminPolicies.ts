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
    policies: policiesData?.items || [],
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
