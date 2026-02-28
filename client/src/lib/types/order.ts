/**
 * Types for Customer Orders API: POST/GET /api/me/orders, GET /api/me/orders/:id
 */

/** Order type: use values from GET /api/lookups (orderType array) */
export type OrderTypeLookup = "ReadyStock" | "PreOrder" | "Prescription";

/** Request body for POST /api/me/orders — create order from current cart */
export interface CreateOrderPayload {
  /** Saved address ID from POST /api/me/addresses */
  addressId: string;
  /** Use values from lookups.paymentMethod: "Cod" | "QrCode" | "BankTransfer" | "Cash" */
  paymentMethod: string;
  /** Optional note for the order */
  orderNote?: string | null;
  /** Use values from lookups.orderType; default ReadyStock for normal checkout */
  orderType?: OrderTypeLookup;
  /** IDs of cart items to checkout (matches CartItemDto.id) */
  selectedCartItemIds: string[];
}

/** Line item in order (from API response) */
export interface MeOrderItemDto {
  id: string;
  productVariantId: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  subtotal: number;
}

/** Order returned from GET /api/me/orders or GET /api/me/orders/:id */
export interface MeOrderDto {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  totalAmount: number;
  paymentMethod: string;
  /** Full shipping address (may be object or string depending on API) */
  shippingAddress: string | MeOrderShippingAddress;
  items: MeOrderItemDto[];
  orderNote?: string | null;
  /** If shipped */
  trackingNumber?: string | null;
  carrier?: string | null;
}

export interface MeOrderShippingAddress {
  recipientName: string;
  recipientPhone: string;
  venue: string;
  ward?: string;
  district?: string;
  city?: string;
  postalCode?: string;
}

/** Summary item returned from GET /api/me/orders (orders list) */
export interface MyOrderSummaryDto {
  id: string;
  /** Một số backend trả orderId riêng; dùng cho link/GET detail để tránh 404 khi id trùng product/variant */
  orderId?: string;
  orderType: string;
  orderStatus: string;
  totalAmount: number;
  finalAmount: number;
  itemCount: number;
  createdAt: string;
}

/** Paged response for GET /api/me/orders */
export interface MyOrdersPageDto {
  items: MyOrderSummaryDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** Order item from GET /api/me/orders/:id (CustomerOrderDto.items) */
export interface CustomerOrderItemDto {
  id: string;
  productVariantId: string;
  sku: string;
  variantName: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productId?: string;
  name?: string;
  imageUrl?: string;
  productImageUrl?: string;
}

/** Payment block from GET /api/me/orders/:id */
export interface CustomerOrderPaymentDto {
  id: string;
  paymentMethod: string;
  paymentStatus: string;
  amount: number;
  paymentAt: string | null;
}

/** Status history entry from GET /api/me/orders/:id */
export interface CustomerOrderStatusHistoryDto {
  fromStatus: string | null;
  toStatus: string;
  notes: string | null;
  createdAt: string;
}

/** Shipping address shape (object form) */
export interface OrderShippingAddressShape {
  recipientName?: string;
  recipientPhone?: string;
  venue?: string;
  ward?: string;
  district?: string;
  city?: string;
  postalCode?: string;
}

/** Full order detail from GET /api/me/orders/:id or order-success state (CustomerOrderDto) */
export interface CustomerOrderDetailDto {
  id: string;
  orderSource?: string;
  orderType?: string;
  orderStatus?: string;
  status?: string;
  orderNumber?: string;
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
  discountApplied: number | null;
  customerNote: string | null;
  createdAt: string;
  updatedAt?: string | null;
  shippingAddress?: string | OrderShippingAddressShape;
  trackingNumber?: string;
  carrier?: string;
  prescription?: unknown;
  shipment?: unknown;
  payment: CustomerOrderPaymentDto | null;
  statusHistories: CustomerOrderStatusHistoryDto[];
  items: CustomerOrderItemDto[];
}

/** State passed to OrderSuccessPage via location.state */
export interface OrderSuccessState {
  order: CustomerOrderDetailDto;
  address: OrderShippingAddressShape;
}
