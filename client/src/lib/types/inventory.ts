export type InboundRecordStatus = "PendingApproval" | "Approved" | "Rejected";
export type InboundSourceType = "Supplier" | "Return" | "Adjustment";

export interface InboundRecordListDto {
  id: string;
  sourceType: InboundSourceType;
  sourceReference: string | null;
  status: InboundRecordStatus;
  totalItems: number;
  notes: string | null;
  createdAt: string;
  createdBy: string | null;
  createdByName: string | null;
}

export interface InboundRecordItemDto {
  id: string;
  productVariantId: string;
  productVariantName: string | null;
  quantity: number;
  unitPrice: number | null;
  notes: string | null;
}

export interface InboundRecordDto {
  id: string;
  sourceType: InboundSourceType;
  sourceReference: string | null;
  status: InboundRecordStatus;
  totalItems: number;
  notes: string | null;
  createdAt: string;
  createdBy: string | null;
  createdByName: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  approvedByName: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
  rejectedByName: string | null;
  rejectionReason: string | null;
  items: InboundRecordItemDto[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface InventoryTransactionDto {
  id: string;
  productVariantId: string;
  productVariantName: string | null;
  productName: string | null;
  sku: string | null;
  variantName: string | null;
  type: string; // Inbound, Outbound, Adjustment
  transactionType: string; // Inbound, Outbound, Adjustment (alias for type)
  referenceType: string; // InboundRecord, Order, Manual
  referenceId: string | null;
  quantity: number;
  notes: string | null;
  createdAt: string;
  createdBy: string | null;
  createdByName: string | null;
}

export interface RevenueReportDto {
  totalRevenue: number;
  netRevenue: number;
  totalDiscount: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  fromDate: string;
  toDate: string;
  orderSource: string | null;
  bySource: Array<{
    source: string;
    revenue: number;
    orderCount: number;
  }>;
}
