/**
 * GET /api/lookups — valid enum values for dropdowns and API payloads
 */
export interface LookupsResponse {
  orderType: string[];
  orderSource: string[];
  orderStatus: string[];
  paymentMethod: string[];
  paymentStatus: string[];
  paymentType: string[];
  productType: string[];
  productStatus: string[];
  eyeType: string[];
  cartStatus: string[];
  promotionType: string[];
  shippingCarrier: string[];
  sourceType: string[];
  inboundRecordStatus: string[];
  transactionType: string[];
  referenceType: string[];
  inventoryTransactionStatus: string[];
}
