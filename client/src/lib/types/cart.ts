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
  isPreOrder: boolean;
  productId: string;
  productName: string;
  productImageUrl: string;
  lensVariantId: string | null;
  lensVariantName: string | null;
  lensPrice: number;
  coatingExtraPrice: number;
  hasPrescription: boolean;
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
  /** Optional lens variant for this frame line. Null/undefined = frame-only. */
  lensVariantId?: string | null;
  /** Optional selected coating IDs for the chosen lens. */
  selectedCoatingIds?: string[] | null;
  /** Flattened RX fields expected by AddCartItemDto (OD/OS + PD). */
  sphOD?: number | null;
  cylOD?: number | null;
  axisOD?: number | null;
  addOD?: number | null;
  pdOD?: number | null;
  sphOS?: number | null;
  cylOS?: number | null;
  axisOS?: number | null;
  addOS?: number | null;
  pdOS?: number | null;
  pd?: number | null;
};

export type UpdateCartItemPayload = {
  /** Cart item ID */
  id: string;
  /** New quantity */
  quantity: number;
};
