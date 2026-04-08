import { useQuery } from "@tanstack/react-query";
import agent from "../api/agent";

export type LensCoatingOptionDto = {
  id: string;
  lensProductId: string;
  coatingName: string;
  description?: string | null;
  extraPrice: number;
  isActive?: boolean;
};

async function fetchLensCoatingOptions(
  lensProductId: string
): Promise<LensCoatingOptionDto[]> {
  const res = await agent.get<LensCoatingOptionDto[]>(
    `/products/${lensProductId}/coating-options`
  );
  return Array.isArray(res.data) ? res.data : [];
}

export function useLensCoatingOptions(
  lensProductId: string | null | undefined,
  enabled: boolean
) {
  return useQuery({
    queryKey: ["products", "coating-options", lensProductId],
    queryFn: () => fetchLensCoatingOptions(lensProductId!),
    enabled: Boolean(lensProductId) && enabled,
    staleTime: 60_000,
  });
}
