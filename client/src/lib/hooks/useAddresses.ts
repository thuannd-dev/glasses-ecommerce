import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import agent from "../api/agent";
import type { AddressDto, CreateAddressPayload } from "../types/address";

const QUERY_KEY_ADDRESSES = ["me", "addresses"];
const QUERY_KEY_DEFAULT_ADDRESS = ["me", "addresses", "default"];

/** GET /api/me/addresses — list addresses */
export function useAddresses() {
  return useQuery<AddressDto[]>({
    queryKey: QUERY_KEY_ADDRESSES,
    queryFn: async () => {
      const res = await agent.get<AddressDto[]>("/me/addresses");
      return Array.isArray(res.data) ? res.data : [];
    },
  });
}

/** GET /api/me/addresses/default — current default address (if any).
 * Backend may return 404 when user has no default yet, we normalize that to `null`
 * so the UI doesn't spam errors. We disable retries since 404 is expected case.
 */
export function useDefaultAddress() {
  return useQuery<AddressDto | null>({
    queryKey: QUERY_KEY_DEFAULT_ADDRESS,
    queryFn: async () => {
      try {
        const res = await agent.get<AddressDto | null>("/me/addresses/default");
        return res.data ?? null;
      } catch (error: any) {
        // 404 is expected when user has no default address
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    // Don't retry on failure since 404 is expected case
    retry: false,
  });
}

/** POST /api/me/addresses — create address (e.g. at checkout) */
export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAddressPayload) => {
      const res = await agent.post<AddressDto>("/me/addresses", {
        recipientName: payload.recipientName,
        recipientPhone: payload.recipientPhone,
        venue: payload.venue,
        ward: payload.ward,
        district: payload.district,
        province: payload.province,
        provinceId: payload.provinceId ?? null,
        districtId: payload.districtId ?? null,
        wardCode: payload.wardCode ?? null,
        postalCode: payload.postalCode ?? null,
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        isDefault: payload.isDefault ?? false,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ADDRESSES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_DEFAULT_ADDRESS });
    },
  });
}

/** PUT /api/me/addresses/{id} — update address */
export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: CreateAddressPayload & { id: string }) => {
      const res = await agent.put<AddressDto>(`/me/addresses/${id}`, {
        recipientName: payload.recipientName,
        recipientPhone: payload.recipientPhone,
        venue: payload.venue,
        ward: payload.ward,
        district: payload.district,
        province: payload.province,
        provinceId: payload.provinceId ?? null,
        districtId: payload.districtId ?? null,
        wardCode: payload.wardCode ?? null,
        postalCode: payload.postalCode ?? null,
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ADDRESSES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_DEFAULT_ADDRESS });
    },
  });
}

/** DELETE /api/me/addresses/{id} — delete address */
export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await agent.delete(`/me/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ADDRESSES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_DEFAULT_ADDRESS });
    },
  });
}

/** PUT /api/me/addresses/{id}/default — set as default address */
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await agent.put<AddressDto>(`/me/addresses/${id}/default`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ADDRESSES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_DEFAULT_ADDRESS });
    },
  });
}
