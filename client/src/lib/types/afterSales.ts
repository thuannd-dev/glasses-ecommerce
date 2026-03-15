import type { MeOrderItemDto } from "./order";
export interface AfterSalesTicketDto {
  id: string;
  status?: string;
  ticketStatus?: string;
  createdAt?: string;
  orderId?: string;
  orderType?: string;
  subject?: string;
  reason?: string;
  customerName?: string;
  ticketType?: string;
  refundAmount?: number;
  receivedAt?: string | null;
  [key: string]: any;
}

export interface AfterSalesTicketsResponse {
  items: AfterSalesTicketDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

/** Ticket type enum */
export type AfterSalesTicketType = "Unknown" | "Return" | "Warranty" | "Refund";

/** Ticket status enum */
export type AfterSalesTicketStatus = "Pending" | "InProgress" | "Resolved" | "Rejected" | "Closed";

/** Resolution type enum */
export type TicketResolutionType = "RefundOnly" | "ReturnAndRefund" | "WarrantyRepair" | "WarrantyReplace";

/** Attachment in a ticket */
export interface TicketAttachmentDto {
  id: string;
  fileName: string;
  fileUrl: string;
  fileExtension?: string;
  createdAt: string;
}

/** Item details in a ticket (product information) */
export interface TicketItemDto {
  id: string;
  productVariantId: string;
  sku?: string;
  variantName?: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImageUrl?: string;
}

/** Ticket detail response (with product items and attachments) */
export interface TicketDetailDto {
  id: string;
  orderId: string;
  orderType?: string;
  orderItemId?: string;
  ticketType: AfterSalesTicketType;
  originalTicketType?: AfterSalesTicketType;
  ticketStatus: AfterSalesTicketStatus;
  resolutionType?: TicketResolutionType;
  reason: string;
  requestedAction?: string;
  refundAmount?: number;
  isRequiredEvidence: boolean;
  policyViolation?: string;
  staffNotes?: string;
  assignedTo?: string;
  createdAt: string;
  receivedAt?: string;
  resolvedAt?: string;
  attachments: TicketAttachmentDto[];
  items: TicketItemDto[];
}

/** Ticket summary in list response */
export interface TicketListDto {
  id: string;
  orderId: string;
  orderItemId?: string;
  ticketType: AfterSalesTicketType;
  ticketStatus: AfterSalesTicketStatus;
  reason: string;
  refundAmount?: number;
  isRequiredEvidence: boolean;
  createdAt: string;
  resolvedAt?: string;
}

/** Response for GET /api/me/after-sales (paginated) */
export interface MyTicketsPageDto {
  items: TicketListDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** Simplified customer order detail for after-sales context */
export interface CustomerOrderDetailDto {
  id: string;
  orderNumber: string;
  orderStatus: string;
  orderType: string;
  orderSource?: string;
  createdAt: string;
  totalAmount: number;
  finalAmount: number;
  paymentMethod?: string;
  payment?: {
    paymentMethod?: string;
  };
  items: MeOrderItemDto[];
  trackingNumber?: string;
  carrier?: string;
  shippingAddress?: string;
  statusHistories?: Array<{
    toStatus: string;
    createdAt: string;
  }>;
}
