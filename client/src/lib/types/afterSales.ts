// Enums matching Domain/.../AfterSalesTicket.cs
export enum AfterSalesTicketType {
  Unknown = 0,
  Return = 1,
  Warranty = 2,
  Refund = 3,
}

export enum AfterSalesTicketStatus {
  Pending = 1,
  InProgress = 2,
  Resolved = 3,
  Rejected = 4,
  Closed = 5,
}

// DTOs
export interface TicketListDto {
  id: string;
  orderId: string;
  orderItemId: string | null;
  ticketType: AfterSalesTicketType;
  ticketStatus: AfterSalesTicketStatus;
  reason: string;
  refundAmount: number | null;
  isRequiredEvidence: boolean;
  createdAt: string;
  resolvedAt: string | null;
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
  customerId: string;
  ticketType: AfterSalesTicketType;
  ticketStatus: AfterSalesTicketStatus;
  reason: string;
  requestedAction: string | null;
  refundAmount: number | null;
  isRequiredEvidence: boolean;
  createdAt: string;
  resolvedAt: string | null;
}
