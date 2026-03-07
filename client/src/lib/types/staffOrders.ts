export interface StaffOrderDto {
  id: string;
  orderSource: string;
  orderType: string;
  orderStatus: string;
  totalAmount: number;
  finalAmount: number;
  walkInCustomerName: string | null;
  walkInCustomerPhone: string | null;
  createdBySalesStaff: string | null;
  salesStaffName: string | null;
  itemCount: number;
  createdAt: string;
}

export interface StaffOrdersResponse {
  items: StaffOrderDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface StaffOrderStatusPayload {
  id: string;
  newStatus: number;
  notes?: string | null;
  shipment?: unknown;
  trackingCode?: string | null;
  trackingUrl?: string | null;
  estimatedDeliveryAt?: string | null;
  shippingNotes?: string | null;
}

export type StaffRevenueReport = Record<string, unknown>;

// Detail type for GET /api/staff/orders/{id}

export interface StaffOrderItemDto {
  id: string;
  productVariantId: string;
  sku: string;
  variantName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImageUrl?: string | null;
}

export interface StaffOrderPaymentDto {
  id: string;
  paymentMethod: string;
  paymentStatus: string;
  amount: number;
  paymentAt: string | null;
}

export interface ShipmentInfoDto {
  carrierName: string;
  trackingCode?: string | null;
  trackingUrl?: string | null;
  shippedAt?: string | null;
  estimatedDeliveryAt?: string | null;
  actualDeliveryAt?: string | null;
  shippingNotes?: string | null;
}

export interface StaffOrderStatusHistoryDto {
  fromStatus: string;
  toStatus: string;
  notes: string | null;
  createdAt: string;
  changedByUserId?: string | null;
  changedByUserName?: string | null;
  changedByUserEmail?: string | null;
}

export interface StaffOrderDetailDto {
  id: string;
  orderSource: string;
  orderType: string;
  orderStatus: string;
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
  discountApplied: number | null;
  customerNote: string | null;
  walkInCustomerName: string | null;
  walkInCustomerPhone: string | null;
  createdBySalesStaff: string | null;
  salesStaffName: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string | null;
  items: StaffOrderItemDto[];
  payment: StaffOrderPaymentDto | null;
  prescription: unknown;
  shipment?: ShipmentInfoDto | null;
  statusHistories: StaffOrderStatusHistoryDto[];
}


