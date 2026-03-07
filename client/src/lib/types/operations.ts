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
  trackingUrl?: string;
  estimatedDeliveryAt?: string;
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
  trackingUrl?: string;
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

// -------- Operations orders list (paginated) --------

/** Query params for Operations orders listing endpoint `/api/operations/orders` */
export interface OperationsOrdersQueryParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  orderType?: OrderType;
}

/** DTO for operations orders list item */
export interface OperationsOrderDto {
  id: string;
  orderSource: string;
  orderType: string;
  orderStatus: string;
  totalAmount: number;
  finalAmount: number;
  customerName: string | null;
  customerPhone: string | null;
  itemCount: number;
  createdAt: string;
}

/** Standard paginated response for Operations orders listing */
export interface OperationsOrdersResponse {
  items: OperationsOrderDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
