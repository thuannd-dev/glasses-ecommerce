import { useMutation, useQuery } from "@tanstack/react-query";
import agent from "../api/agent";
import type {
  ValidatePromotionRequest,
  ValidatePromotionResponse,
  ActivePromotionDto,
} from "../types/promotion";

/** GET /api/promotions/active — list active promotions (for checkout selection) */
export function useActivePromotions() {
  return useQuery<ActivePromotionDto[]>({
    queryKey: ["promotions", "active"],
    queryFn: async () => {
      const res = await agent.get<ActivePromotionDto[]>("/promotions/active");
      const list = Array.isArray(res.data) ? res.data : [];
      const now = new Date();
      // Hide promotions that are already expired based on validTo
      return list.filter((p) => {
        if (!p.validTo) return true;
        const validToDate = new Date(p.validTo);
        return validToDate.getTime() >= now.getTime();
      });
    },
  });
}

/** POST /api/promotions/validate — validate promo code and get discount */
export function useValidatePromotion() {
  return useMutation({
    mutationFn: async (payload: ValidatePromotionRequest) => {
      const res = await agent.post<ValidatePromotionResponse>("/promotions/validate", {
        promoCode: payload.promoCode.trim(),
        orderTotal: payload.orderTotal,
        shippingFee: payload.shippingFee ?? 0,
      });
      return res.data;
    },
  });
}
