import { useQuery } from "@tanstack/react-query";
import agent from "../api/agent";

export type CompatibleLensVariantDto = {
  variantId: string;
  variantName: string;
  price: number;
  index: number;
  sphMin: number;
  sphMax: number;
  cylMin: number;
  cylMax: number;
  lensDesign?: string | null;
};

export type CompatibleLensDto = {
  lensProductId: string;
  lensProductName: string;
  brand?: string | null;
  variants: CompatibleLensVariantDto[];
};

export type CompatibleLensQuery = {
  sphOD?: number | null;
  cylOD?: number | null;
  sphOS?: number | null;
  cylOS?: number | null;
};

async function fetchCompatibleLenses(
  frameProductId: string,
  rx?: CompatibleLensQuery
): Promise<CompatibleLensDto[]> {
  const res = await agent.get<CompatibleLensDto[]>(
    `/products/${frameProductId}/compatible-lenses`,
    {
      params: {
        sphOD: rx?.sphOD ?? undefined,
        cylOD: rx?.cylOD ?? undefined,
        sphOS: rx?.sphOS ?? undefined,
        cylOS: rx?.cylOS ?? undefined,
      },
    }
  );
  return Array.isArray(res.data) ? res.data : [];
}

export function useCompatibleLenses(
  frameProductId: string | null | undefined,
  rx: CompatibleLensQuery | undefined,
  enabled: boolean
) {
  return useQuery({
    queryKey: [
      "products",
      "compatible-lenses",
      frameProductId,
      rx?.sphOD ?? null,
      rx?.cylOD ?? null,
      rx?.sphOS ?? null,
      rx?.cylOS ?? null,
    ],
    queryFn: () => fetchCompatibleLenses(frameProductId!, rx),
    enabled: Boolean(frameProductId) && enabled,
    staleTime: 60_000,
  });
}
