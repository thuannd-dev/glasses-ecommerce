/** Cart DTOs used by /api/carts endpoints */
export type CartItemDto = {
  id: string;
  cartId: string;
  productVariantId: string;
  quantity: number;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  color: string | null;
  size: string | null;
  material: string | null;
  quantityAvailable: number;
  isInStock: boolean;
  productId: string;
  productName: string;
  productImageUrl: string;
  subtotal: number;
};

export type CartDto = {
  id: string;
  items: CartItemDto[];
  totalQuantity: number;
  totalAmount: number;
};

/** Optional prescription; when present, backend should create a NEW cart line (do not merge with same variant). */
export type AddCartItemPayload = {
  /** Product variant ID to add to cart */
  productVariantId: string;
  /** Quantity to add */
  quantity: number;
  /** When set, server should create a separate line so "same variant + prescription" and "same variant + no prescription" are different lines. */
  prescription?: import("./prescription").PrescriptionData | null;
};

export type UpdateCartItemPayload = {
  /** Cart item ID */
  id: string;
  /** New quantity */
  quantity: number;
};
