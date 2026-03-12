export interface AfterSalesTicketDto {
  id: string;
  status?: string;
  createdAt?: string;
  orderId?: string;
  subject?: string;
  reason?: string;
  customerName?: string;
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

