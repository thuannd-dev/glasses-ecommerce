/** Shared flattened prescription fields (OD/OS + optional single PD). */
export type RxFields = {
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

/** Cart DTOs used by /api/carts endpoints */
export type CartItemDto = RxFields & {
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
  selectedCoatings?: Array<{
    id: string;
    coatingName: string;
    description?: string | null;
    currentExtraPrice: number;
  }>;
  hasPrescription: boolean;
  subtotal: number;
};

export type CartDto = {
  id: string;
  items: CartItemDto[];
  totalQuantity: number;
  totalAmount: number;
};

/** Add-to-cart payload with optional flattened prescription fields. */
export type AddCartItemPayload = RxFields & {
  /** Product variant ID to add to cart */
  productVariantId: string;
  /** Quantity to add */
  quantity: number;
  /** Optional lens variant for this frame line. Null/undefined = frame-only. */
  lensVariantId?: string | null;
  /** Optional selected coating IDs for the chosen lens. */
  selectedCoatingIds?: string[];
};

export type UpdateCartItemPayload = {
  /** Cart item ID */
  id: string;
  /** New quantity */
  quantity: number;
};
