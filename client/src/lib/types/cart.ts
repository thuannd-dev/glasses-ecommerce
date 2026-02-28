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

export type AddCartItemPayload = {
  /** Product variant ID to add to cart */
  productVariantId: string;
  /** Quantity to add */
  quantity: number;
};

export type UpdateCartItemPayload = {
  /** Cart item ID */
  id: string;
  /** New quantity */
  quantity: number;
};
