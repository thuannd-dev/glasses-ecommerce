// Type matching Domain/.../AfterSalesTicket.cs
export type AfterSalesTicketType = 0 | 1 | 2 | 3;
export type AfterSalesTicketStatus = 1 | 2 | 3 | 4 | 5 | 6;
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
  Resolved: 3 as const,
  Rejected: 4 as const,
  Closed: 5 as const,
  Cancelled: 6 as const,
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

export interface TicketDetailDto {
  id: string;
  orderId: string;
  orderItemId: string | null;
  orderItem: OrderItemDto | null;
  customerId: string;
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
}
