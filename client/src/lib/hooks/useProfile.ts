import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import agent from "../api/agent";
import type { Profile, ProfilePhotoDto } from "../types/user";

export const profileQueryKey = (userId: string) => ["profile", userId] as const;

export const profilePhotosQueryKey = (userId: string) =>
  ["profile-photos", userId] as const;

export type UploadProfilePhotoInput = {
  file: File;
  /** Multipart field name — must match backend (default `file`) */
  formFieldName?: string;
};

/**
 * Profile + gallery: GET /profiles/{userId}, GET /profiles/{userId}/photos,
 * POST /profiles/photo, DELETE /profiles/{photoId}/photos, PUT /profiles/{photoId}/main
 */
export function useProfile(userId: string | undefined) {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: userId ? profileQueryKey(userId) : ["profile", ""],
    queryFn: async () => {
      const response = await agent.get<Profile>(`/profiles/${userId}`);
      return response.data;
    },
    enabled: Boolean(userId),
  });

  const photosQuery = useQuery({
    queryKey: userId ? profilePhotosQueryKey(userId) : ["profile-photos", ""],
    queryFn: async () => {
      const response = await agent.get<ProfilePhotoDto[]>(`/profiles/${userId}/photos`);
      return response.data;
    },
    enabled: Boolean(userId),
  });

  const invalidateProfileAndPhotos = () => {
    if (!userId) return;
    void queryClient.invalidateQueries({ queryKey: profileQueryKey(userId) });
    void queryClient.invalidateQueries({ queryKey: profilePhotosQueryKey(userId) });
    void queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ file, formFieldName = "file" }: UploadProfilePhotoInput) => {
      const form = new FormData();
      form.append(formFieldName, file);
      const res = await agent.post<ProfilePhotoDto>("/profiles/photo", form);
      return res.data;
    },
    onSuccess: invalidateProfileAndPhotos,
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      await agent.delete(`/profiles/${photoId}/photos`);
    },
    onSuccess: invalidateProfileAndPhotos,
  });

  const setMainPhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const res = await agent.put<unknown>(`/profiles/${photoId}/main`);
      return res.data;
    },
    onSuccess: invalidateProfileAndPhotos,
  });

  return {
    ...profileQuery,

    photos: photosQuery.data,
    photosLoading: photosQuery.isLoading,
    photosFetching: photosQuery.isFetching,
    photosError: photosQuery.isError,
    photosErrorObj: photosQuery.error,
    refetchPhotos: photosQuery.refetch,

    uploadPhoto: uploadPhotoMutation.mutate,
    uploadPhotoAsync: uploadPhotoMutation.mutateAsync,
    isUploadingPhoto: uploadPhotoMutation.isPending,
    uploadPhotoError: uploadPhotoMutation.error,
    resetUploadPhoto: uploadPhotoMutation.reset,

    deletePhoto: deletePhotoMutation.mutate,
    deletePhotoAsync: deletePhotoMutation.mutateAsync,
    isDeletingPhoto: deletePhotoMutation.isPending,
    deletePhotoError: deletePhotoMutation.error,

    setMainPhoto: setMainPhotoMutation.mutate,
    setMainPhotoAsync: setMainPhotoMutation.mutateAsync,
    isSettingMainPhoto: setMainPhotoMutation.isPending,
    setMainPhotoError: setMainPhotoMutation.error,
  };
}
