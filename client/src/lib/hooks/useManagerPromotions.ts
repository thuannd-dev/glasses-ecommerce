import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";

// ── Domain constants (API returns string enum values) ──
export const PromotionType = {
  Percentage: "Percentage",
  FixedAmount: "FixedAmount",
  FreeShipping: "FreeShipping",
} as const;

export const PROMOTION_TYPE_LABELS: Record<string, string> = {
  [PromotionType.Percentage]: "Percentage",
  [PromotionType.FixedAmount]: "Fixed Amount",
  [PromotionType.FreeShipping]: "Free Shipping",
};

// ── DTOs ──
export interface PromotionListItem {
  id: string;
  promoCode: string;
  promoName: string;
  promotionType: string;
  discountValue: number;
  maxDiscountValue: number | null;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  isPublic: boolean;
  usedCount: number;
}

export interface PromotionDetail {
  id: string;
  promoCode: string;
  promoName: string;
  description: string | null;
  promotionType: string;
  discountValue: number;
  maxDiscountValue: number | null;
  usageLimit: number | null;
  usageLimitPerCustomer: number | null;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  isPublic: boolean;
  usedCount: number;
}

export interface PagedPromotionsResponse {
  items: PromotionListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreatePromotionDto {
  promoCode: string;
  promoName: string;
  description?: string | null;
  promotionType: string;
  discountValue: number;
  maxDiscountValue?: number | null;
  usageLimit?: number | null;
  usageLimitPerCustomer?: number | null;
  validFrom: string;
  validTo: string;
  isPublic: boolean;
}

export interface UpdatePromotionDto {
  promoName: string;
  description?: string | null;
  maxDiscountValue?: number | null;
  usageLimit?: number | null;
  usageLimitPerCustomer?: number | null;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  isPublic: boolean;
}

export interface GetPromotionsParams {
  pageNumber?: number;
  pageSize?: number;
  isActive?: boolean | null;
  promotionType?: number | null;
}

// ── Hook ──
export function useManagerPromotions(params?: GetPromotionsParams) {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error, refetch } = useQuery<PagedPromotionsResponse>({
    queryKey: ["manager-promotions", params],
    queryFn: async () => {
      const qp = new URLSearchParams();
      if (params?.pageNumber) qp.append("pageNumber", params.pageNumber.toString());
      if (params?.pageSize) qp.append("pageSize", params.pageSize.toString());
      if (params?.isActive !== undefined && params?.isActive !== null)
        qp.append("isActive", String(params.isActive));
      if (params?.promotionType !== undefined && params?.promotionType !== null)
        qp.append("promotionType", params.promotionType.toString());

      const res = await agent.get<PagedPromotionsResponse>(
        `/manager/promotions?${qp.toString()}`
      );
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (dto: CreatePromotionDto) => {
      const res = await agent.post<PromotionDetail>("/manager/promotions", dto);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["manager-promotions"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdatePromotionDto }) => {
      const res = await agent.put<PromotionDetail>(`/manager/promotions/${id}`, dto);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["manager-promotions"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await agent.delete<PromotionDetail>(`/manager/promotions/${id}`);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["manager-promotions"] });
    },
  });

  return {
    promotions: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 1,
    pageNumber: data?.pageNumber ?? 1,
    pageSize: data?.pageSize ?? 20,
    isLoading,
    isFetching,
    error,
    refetch,
    createPromotion: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updatePromotion: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deactivatePromotion: deleteMutation.mutateAsync,
    isDeactivating: deleteMutation.isPending,
  };
}

export function useManagerPromotionDetail(id: string | undefined) {
  return useQuery<PromotionDetail>({
    queryKey: ["manager-promotion-detail", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await agent.get<PromotionDetail>(`/manager/promotions/${id}`);
      return res.data;
    },
  });
}
