/** Order type: ReadyStock | PreOrder | Prescription */
export type OrderType = "ReadyStock" | "PreOrder" | "Prescription";

/** Order status (by type) */
export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Completed"
  | "Cancelled"
  | "Refunded";

export type ShipmentStatus = "created" | "picked" | "in_transit" | "delivered";

export interface OrderItemDto {
  id: string;
  productVariantId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  prescriptionId?: string;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  status: OrderStatus;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: OrderItemDto[];
  totalAmount: number;
  expectedStockDate?: string;
  prescriptionStatus?: "lens_ordered" | "lens_fitting" | "ready";
  shipmentId?: string;
  trackingNumber?: string;
  carrier?: string;
}

export interface ShipmentDto {
  id: string;
  orderId: string;
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
  status: ShipmentStatus;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingEvents?: TrackingEventDto[];
}

export interface TrackingEventDto {
  date: string;
  status: string;
  location?: string;
  description: string;
}

export interface CreateShipmentPayload {
  orderId: string;
  carrier: string;
  trackingNumber: string;
}

export interface UpdateTrackingPayload {
  shipmentId: string;
  status: ShipmentStatus;
  location?: string;
  description?: string;
}

export interface UpdateOrderStatusPayload {
  orderId: string;
  status: OrderStatus;
  receivedQuantity?: Record<string, number>;
  // Optional shipment info (used when transitioning to shipped status)
  shipmentCarrierName?: string;
  shipmentTrackingCode?: string | null;
  shipmentTrackingUrl?: string | null;
  shipmentEstimatedDeliveryAt?: string | null;
  shipmentNotes?: string | null;
}

// -------- GHN Integration --------

/** Payload for POST /api/operations/orders/{id}/ghn/create */
export interface CreateGHNOrderPayload {
  districtId?: number;
  wardCode?: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  requiredNote: string;
}

/** Available required note options for GHN */
export const GHN_REQUIRED_NOTES = [
  { value: "CHOXEMHANGKHONGTHU", label: "Allow inspection, no try-on" },
  { value: "CHOTHUHANG", label: "Allow try-on" },
  { value: "KHONGCHOXEMHANG", label: "No inspection allowed" },
] as const;

// -------- Operations orders list (paginated) --------

/** Query params for Operations orders listing endpoint `/api/operations/orders` */
export interface OperationsOrdersQueryParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  orderType?: OrderType;
}

/** Standard paginated response for Operations orders listing */
export interface OperationsOrdersResponse {
  items: OrderDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
