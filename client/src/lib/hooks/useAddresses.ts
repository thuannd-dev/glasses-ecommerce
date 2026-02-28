import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import agent from "../api/agent";
import type { AddressDto, CreateAddressPayload } from "../types/address";

const QUERY_KEY_ADDRESSES = ["me", "addresses"];

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
        city: payload.city,
        postalCode: payload.postalCode ?? null,
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        isDefault: payload.isDefault ?? false,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ADDRESSES });
    },
  });
}
