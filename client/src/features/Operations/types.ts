/** Loại đơn: thường | pre-order | prescription */
export type OrderType = "standard" | "pre-order" | "prescription";

/** Trạng thái xử lý đơn (theo từng loại đơn) */
export type OrderStatus =
  | "pending"           // Chờ xử lý
  | "confirmed"         // Đã xác nhận
  | "processing"        // Đang xử lý (đóng gói / gia công)
  | "ready_to_ship"     // Sẵn sàng gửi
  | "shipped"           // Đã gửi
  | "delivered"         // Đã giao
  | "received"          // Pre-order: đã nhận hàng về kho
  | "lens_ordered"     // Prescription: đã đặt tròng
  | "lens_fitting"      // Prescription: đang lắp tròng / làm kính
  | "cancelled";

export type ShipmentStatus = "created" | "picked" | "in_transit" | "delivered";

export interface OrderItemDto {
  id: string;
  productVariantId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  prescriptionId?: string; // Có nếu đơn prescription
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
  /** Pre-order: ngày dự kiến hàng về */
  expectedStockDate?: string;
  /** Prescription: trạng thái gia công (lắp tròng / làm kính) */
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
  /** Lịch sử tracking */
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
  /** Pre-order: cập nhật kho sau khi nhận hàng */
  receivedQuantity?: Record<string, number>; // variantId -> quantity
}
