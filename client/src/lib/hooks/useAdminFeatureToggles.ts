import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import type {
  FeatureToggleDto,
  CreateFeatureTogglePayload,
  UpdateFeatureTogglePayload,
  SetFeatureToggleEnabledPayload,
  AdminFeatureTogglesQueryParams,
  PagedFeatureTogglesResponse,
} from "../types";

export const useAdminFeatureToggles = (
  queryParams?: AdminFeatureTogglesQueryParams
) => {
  const queryClient = useQueryClient();

  // Get paginated feature toggles list
  const { data: togglesData, isLoading: isTogglesLoading } = useQuery({
    queryKey: ["admin", "feature-toggles", queryParams],
    queryFn: async () => {
      const response = await agent.get<PagedFeatureTogglesResponse>(
        "/admin/feature-toggles",
        { params: queryParams || {} }
      );
      return response.data;
    },
  });

  // Create feature toggle mutation
  const createToggleMutation = useMutation({
    mutationFn: async (payload: CreateFeatureTogglePayload) => {
      const response = await agent.post<FeatureToggleDto>(
        "/admin/feature-toggles",
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "feature-toggles"] });
    },
  });

  // Update feature toggle mutation
  const updateToggleMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateFeatureTogglePayload;
    }) => {
      const response = await agent.put<FeatureToggleDto>(
        `/admin/feature-toggles/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "feature-toggles"] });
    },
  });

  // Quick enable/disable mutation (PATCH)
  const setToggleEnabledMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: SetFeatureToggleEnabledPayload;
    }) => {
      const response = await agent.patch<FeatureToggleDto>(
        `/admin/feature-toggles/${id}/enabled`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "feature-toggles"] });
    },
  });

  // Delete feature toggle mutation
  const deleteToggleMutation = useMutation({
    mutationFn: async (id: string) => {
      await agent.delete(`/admin/feature-toggles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "feature-toggles"] });
    },
  });

  // Get single toggle details
  const getToggleDetails = async (id: string) => {
    const response = await agent.get<FeatureToggleDto>(
      `/admin/feature-toggles/${id}`
    );
    return response.data;
  };

  return {
    toggles: togglesData?.items || [],
    togglesData,
    isTogglesLoading,
    createToggle: createToggleMutation.mutate,
    isCreating: createToggleMutation.isPending,
    updateToggle: updateToggleMutation.mutate,
    isUpdating: updateToggleMutation.isPending,
    setToggleEnabled: setToggleEnabledMutation.mutate,
    isSettingEnabled: setToggleEnabledMutation.isPending,
    deleteToggle: deleteToggleMutation.mutate,
    isDeleting: deleteToggleMutation.isPending,
    getToggleDetails,
  };
};
