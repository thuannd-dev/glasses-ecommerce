/** Request for POST /api/promotions/validate */
export interface ValidatePromotionRequest {
  promoCode: string;
  orderTotal: number;
  shippingFee?: number;
}

/** Response from POST /api/promotions/validate (200) */
export interface ValidatePromotionResponse {
  valid?: boolean;
  discountAmount?: number;
  message?: string;
  promoCode?: string;
}

/** Item from GET /api/promotions/active */
export interface ActivePromotionDto {
  id?: string;
  code: string;
  name?: string;
  description?: string;
  discountAmount?: number;
  discountPercent?: number;
  validFrom?: string;
  validTo?: string;
}
