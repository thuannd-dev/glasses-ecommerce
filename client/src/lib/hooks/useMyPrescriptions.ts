import { useMutation, useQuery } from "@tanstack/react-query";
import agent from "../api/agent";
import type { MyPrescriptionDto, MyPrescriptionsPageDto } from "../types/myPrescriptions";
import { normalizeMyPrescriptionDto, normalizeMyPrescriptionsPage } from "../utils/normalizeMyPrescriptionApi";

export interface MyPrescriptionsQueryParams {
  pageNumber?: number;
  pageSize?: number;
}

async function fetchMyPrescriptions(params?: MyPrescriptionsQueryParams): Promise<MyPrescriptionsPageDto> {
  const res = await agent.get<unknown>("/me/prescriptions", {
    params: {
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 20,
    },
  });
  return normalizeMyPrescriptionsPage(res.data);
}

export async function fetchMyPrescriptionById(id: string): Promise<MyPrescriptionDto> {
  const res = await agent.get<unknown>(`/me/prescriptions/${id}`);
  return normalizeMyPrescriptionDto(res.data);
}

export function useMyPrescriptions(params?: MyPrescriptionsQueryParams) {
  return useQuery({
    queryKey: ["me", "prescriptions", "list", params?.pageNumber ?? 1, params?.pageSize ?? 20],
    queryFn: () => fetchMyPrescriptions(params),
  });
}

export function useFetchMyPrescriptionDetail() {
  return useMutation({
    mutationFn: (id: string) => fetchMyPrescriptionById(id),
  });
}

/**
 * Load chi tiết tất cả id trong một query (map theo id) — tránh lệch index với useQueries + useMemo.
 */
export function useMyPrescriptionDetailsByIdMap(ids: string[]) {
  const idsKey = ids.filter(Boolean).join("|");

  return useQuery({
    queryKey: ["me", "prescriptions", "detailsById", idsKey],
    queryFn: async (): Promise<Record<string, MyPrescriptionDto>> => {
      const list = idsKey ? idsKey.split("|").filter(Boolean) : [];
      if (list.length === 0) return {};
      const settled = await Promise.allSettled(list.map((id) => fetchMyPrescriptionById(id)));
      const out: Record<string, MyPrescriptionDto> = {};
      list.forEach((id, i) => {
        const r = settled[i];
        if (r.status === "fulfilled") out[id] = r.value;
      });
      return out;
    },
    enabled: Boolean(idsKey),
    staleTime: 60_000,
  });
}
