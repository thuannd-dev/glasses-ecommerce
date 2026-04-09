import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";

export const LensDesign = {
  SingleVision: 1,
  Progressive: 2,
  Bifocal: 3,
} as const;

export type LensDesign = (typeof LensDesign)[keyof typeof LensDesign];

export interface LensCoatingOption {
  id: string;
  lensProductId: string;
  coatingName: string;
  description: string | null;
  extraPrice: number;
  isActive: boolean;
}

export interface LensVariantAttribute {
  productVariantId: string;
  sphMin: number;
  sphMax: number;
  cylMin: number;
  cylMax: number;
  axisMin: number;
  axisMax: number;
  addMin: number | null;
  addMax: number | null;
  index: number;
  lensDesign: LensDesign | string;
}

export interface CompatibleLensLink {
  lensProductId: string;
  lensProductName: string;
  brand: string | null;
  status: number;
}

export interface AddLensCoatingOptionDto {
  coatingName: string;
  description?: string | null;
  extraPrice: number;
}

export interface UpdateLensCoatingOptionDto {
  coatingName?: string | null;
  description?: string | null;
  extraPrice?: number | null;
  isActive?: boolean | null;
}

export interface UpsertLensVariantAttributeDto {
  sphMin: number;
  sphMax: number;
  cylMin: number;
  cylMax: number;
  axisMin?: number;
  axisMax?: number;
  addMin?: number | null;
  addMax?: number | null;
  index: number;
  lensDesign: LensDesign;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function sanitizeLensVariantAttributeDto(dto: UpsertLensVariantAttributeDto) {
  if (!isFiniteNumber(dto.sphMin) || !isFiniteNumber(dto.sphMax)) {
    throw new Error("Invalid SPH range");
  }
  if (!isFiniteNumber(dto.cylMin) || !isFiniteNumber(dto.cylMax)) {
    throw new Error("Invalid CYL range");
  }
  if (!isFiniteNumber(dto.index)) {
    throw new Error("Invalid index value");
  }

  const axisMin = dto.axisMin ?? 0;
  const axisMax = dto.axisMax ?? 180;
  if (!isFiniteNumber(axisMin) || !isFiniteNumber(axisMax)) {
    throw new Error("Invalid AXIS range");
  }

  let addMin = dto.addMin ?? null;
  let addMax = dto.addMax ?? null;
  if (addMin !== null && !isFiniteNumber(addMin)) addMin = null;
  if (addMax !== null && !isFiniteNumber(addMax)) addMax = null;

  if (dto.lensDesign === LensDesign.SingleVision) {
    addMin = null;
    addMax = null;
  }

  return {
    ...dto,
    axisMin: Math.round(axisMin),
    axisMax: Math.round(axisMax),
    addMin,
    addMax,
  };
}

export function useManagerLens() {
  const queryClient = useQueryClient();

  const getLensCoatingOptionsQuery = (lensProductId: string) =>
    useQuery<LensCoatingOption[]>({
      queryKey: ["lens-coating-options", lensProductId],
      queryFn: async () => {
        const res = await agent.get<LensCoatingOption[]>(
          `/products/${lensProductId}/coating-options`
        );
        return res.data;
      },
      enabled: !!lensProductId,
    });

  const addCoatingOptionMutation = useMutation({
    mutationFn: async (data: { productId: string; dto: AddLensCoatingOptionDto }) => {
      const res = await agent.post<LensCoatingOption>(
        `/manager/products/${data.productId}/coating-options`,
        data.dto
      );
      return res.data;
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["lens-coating-options", variables.productId] });
      await queryClient.invalidateQueries({ queryKey: ["product-detail", variables.productId] });
      await queryClient.invalidateQueries({ queryKey: ["manager-product-detail", variables.productId] });
    },
  });

  const updateCoatingOptionMutation = useMutation({
    mutationFn: async (data: {
      productId: string;
      coatingId: string;
      dto: UpdateLensCoatingOptionDto;
    }) => {
      const res = await agent.patch<LensCoatingOption>(
        `/manager/products/${data.productId}/coating-options/${data.coatingId}`,
        data.dto
      );
      return res.data;
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["lens-coating-options", variables.productId] });
      await queryClient.invalidateQueries({ queryKey: ["product-detail", variables.productId] });
      await queryClient.invalidateQueries({ queryKey: ["manager-product-detail", variables.productId] });
    },
  });

  const deleteCoatingOptionMutation = useMutation({
    mutationFn: async (data: { productId: string; coatingId: string }) => {
      await agent.delete(`/manager/products/${data.productId}/coating-options/${data.coatingId}`);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["lens-coating-options", variables.productId] });
      await queryClient.invalidateQueries({ queryKey: ["product-detail", variables.productId] });
      await queryClient.invalidateQueries({ queryKey: ["manager-product-detail", variables.productId] });
    },
  });

  const LENS_DESIGN_MAP: Record<LensDesign, string> = {
    [LensDesign.SingleVision]: "SingleVision",
    [LensDesign.Progressive]: "Progressive",
    [LensDesign.Bifocal]: "Bifocal",
  };

  const setLensVariantAttributeMutation = useMutation({
    mutationFn: async (data: {
      productId: string;
      variantId: string;
      dto: UpsertLensVariantAttributeDto;
    }) => {
      // Backend uses JsonStringEnumConverter, so send enum as string
      const sanitizedDto = sanitizeLensVariantAttributeDto(data.dto);
      const payload = {
        ...sanitizedDto,
        lensDesign: LENS_DESIGN_MAP[sanitizedDto.lensDesign] || "SingleVision",
      };
      const res = await agent.put<LensVariantAttribute>(
        `/manager/products/${data.productId}/variants/${data.variantId}/lens-attributes`,
        payload
      );
      return res.data;
    },
    onSuccess: async (data, variables) => {
      const patchProductDetailCache = (queryKey: (string | undefined)[]) => {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old || !Array.isArray(old.variants)) return old;
          return {
            ...old,
            variants: old.variants.map((v: any) =>
              v?.id === variables.variantId ? { ...v, lensAttribute: data } : v
            ),
          };
        });
      };

      patchProductDetailCache(["product-detail", variables.productId]);
      patchProductDetailCache(["manager-product-detail", variables.productId]);

      await queryClient.invalidateQueries({ queryKey: ["lens-variant-attribute", variables.productId, variables.variantId] });
      await queryClient.invalidateQueries({ queryKey: ["product-detail", variables.productId] });
      await queryClient.invalidateQueries({ queryKey: ["manager-product-detail", variables.productId] });
    },
  });

  const getLensVariantAttributeQuery = (productId: string, variantId: string) =>
    useQuery<LensVariantAttribute | null>({
      queryKey: ["lens-variant-attribute", productId, variantId],
      queryFn: async () => {
        try {
          const res = await agent.get<LensVariantAttribute>(
            `/manager/products/${productId}/variants/${variantId}/lens-attributes`
          );
          return res.data;
        } catch (error: any) {
          if (error?.response?.status === 404) return null;
          throw error;
        }
      },
      enabled: !!productId && !!variantId,
    });

  const getCompatibleLensesQuery = (frameProductId: string) =>
    useQuery<CompatibleLensLink[]>({
      queryKey: ["frame-compatible-lenses", frameProductId],
      queryFn: async () => {
        const res = await agent.get<CompatibleLensLink[]>(
          `/manager/products/${frameProductId}/compatible-lenses`
        );
        return res.data;
      },
      enabled: !!frameProductId,
    });

  const addCompatibleLensMutation = useMutation({
    mutationFn: async (data: { frameProductId: string; lensProductId: string }) => {
      await agent.post(`/manager/products/${data.frameProductId}/compatible-lenses`, {
        lensProductId: data.lensProductId,
      });
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["frame-compatible-lenses", variables.frameProductId],
      });
    },
  });

  const removeCompatibleLensMutation = useMutation({
    mutationFn: async (data: { frameProductId: string; lensProductId: string }) => {
      await agent.delete(
        `/manager/products/${data.frameProductId}/compatible-lenses/${data.lensProductId}`
      );
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["frame-compatible-lenses", variables.frameProductId],
      });
    },
  });

  return {
    getLensVariantAttribute: getLensVariantAttributeQuery,
    getLensCoatingOptions: getLensCoatingOptionsQuery,
    addCoatingOption: addCoatingOptionMutation.mutateAsync,
    isAddingCoating: addCoatingOptionMutation.isPending,
    updateCoatingOption: updateCoatingOptionMutation.mutateAsync,
    isUpdatingCoating: updateCoatingOptionMutation.isPending,
    deleteCoatingOption: deleteCoatingOptionMutation.mutateAsync,
    isDeletingCoating: deleteCoatingOptionMutation.isPending,
    setLensVariantAttribute: setLensVariantAttributeMutation.mutateAsync,
    isSettingAttribute: setLensVariantAttributeMutation.isPending,
    getCompatibleLenses: getCompatibleLensesQuery,
    addCompatibleLens: addCompatibleLensMutation.mutateAsync,
    isAddingCompatibleLens: addCompatibleLensMutation.isPending,
    removeCompatibleLens: removeCompatibleLensMutation.mutateAsync,
    isRemovingCompatibleLens: removeCompatibleLensMutation.isPending,
  };
}
