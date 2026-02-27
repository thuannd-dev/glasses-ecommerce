/** Order type: standard | pre-order | prescription */
export type OrderType = "standard" | "pre-order" | "prescription";

/** Order status (by type) */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready_to_ship"
  | "shipped"
  | "delivered"
  | "received"
  | "lens_ordered"
  | "lens_fitting"
  | "cancelled";

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
  /** Pre-order: expected stock date */
  expectedStockDate?: string;
  /** Prescription: fabrication status */
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
  /** Tracking history */
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
  /** Pre-order: update stock after receiving */
  receivedQuantity?: Record<string, number>;
}
