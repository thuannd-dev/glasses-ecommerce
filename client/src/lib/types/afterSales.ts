import type { AddressDto } from "./address";

// Type matching Domain/.../AfterSalesTicket.cs
export type AfterSalesTicketType = 0 | 1 | 2 | 3;
export type AfterSalesTicketStatus = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type TicketResolutionType = 1 | 2 | 3 | 4;

export const AfterSalesTicketTypeValues = {
  Unknown: 0 as const,
  Return: 1 as const,
  Warranty: 2 as const,
  Refund: 3 as const,
} as const;

export const AfterSalesTicketStatusValues = {
  Pending: 1 as const,
  InProgress: 2 as const,
  Replacing: 3 as const,
  Resolved: 4 as const,
  Rejected: 5 as const,
  Closed: 6 as const,
  Cancelled: 7 as const,
} as const;

export const TicketResolutionTypeValues = {
  RefundOnly: 1 as const,
  ReturnAndRefund: 2 as const,
  WarrantyRepair: 3 as const,
  WarrantyReplace: 4 as const,
} as const;

// Order Item DTO for ticket details - matches OrderItemOutputDto from backend
export interface OrderItemDto {
  id: string;
  productVariantId: string;
  sku: string | null;
  variantName: string | null;
  productName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImageUrl: string | null;
}

// Status history for tickets based on timestamps
export interface TicketStatusHistoryDto {
  status: AfterSalesTicketStatus;
  timestamp: string;
  description: string;
}

// DTOs
export interface TicketListDto {
  id: string;
  orderId: string;
  orderItemId: string | null;
  orderItem: OrderItemDto | null;
  ticketType: AfterSalesTicketType;
  ticketStatus: AfterSalesTicketStatus;
  reason: string;
  refundAmount: number | null;
  isRequiredEvidence: boolean;
  createdAt: string;
  resolvedAt: string | null;
  receivedAt: string | null;
  resolutionType: TicketResolutionType | null;
  isReplacementCompleted: boolean;
}

export interface StaffAfterSalesResponse {
  items: TicketListDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface TicketAttachmentDto {
  id: string;
  fileName: string;
  fileUrl: string;
  fileExtension: string | null;
  createdAt: string;
}

export interface TicketDetailDto {
  id: string;
  orderId: string;
  orderItemId: string | null;
  orderItem: OrderItemDto | null;
  replacementOrderItemId: string | null;
  replacementOrderItem: OrderItemDto | null;
  customerId: string;
  customerName: string | null;
  customerPhone: string | null;
  shippingAddress: AddressDto | null;
  orderPrescription: OrderPrescriptionDto | null;
  ticketType: AfterSalesTicketType;
  ticketStatus: AfterSalesTicketStatus;
  reason: string;
  requestedAction: string | null;
  refundAmount: number | null;
  isRequiredEvidence: boolean;
  staffNotes: string | null;
  createdAt: string;
  resolvedAt: string | null;
  receivedAt: string | null;
  resolutionType: TicketResolutionType | null;
  attachments: TicketAttachmentDto[];
}

export interface PrescriptionDetailDto {
  id: string;
  eye: string | null;
  sph: number | null;
  cyl: number | null;
  axis: number | null;
  pd: number | null;
  add: number | null;
}

export interface OrderPrescriptionDto {
  id: string;
  isVerified: boolean;
  verifiedAt: string | null;
  verificationNotes: string | null;
  details: PrescriptionDetailDto[];
}
