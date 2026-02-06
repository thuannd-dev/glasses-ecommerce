export const AfterSalesTicketType = {
  Unknown: 0 as const,
  Return: 1 as const,
  Warranty: 2 as const,
  Refund: 3 as const,
};

export type AfterSalesTicketTypeValue = typeof AfterSalesTicketType[keyof typeof AfterSalesTicketType];

export const AfterSalesTicketStatus = {
  Pending: 0 as const,
  InProgress: 1 as const,
  Resolved: 2 as const,
  Rejected: 3 as const,
  Closed: 4 as const,
};

export type AfterSalesTicketStatusValue = typeof AfterSalesTicketStatus[keyof typeof AfterSalesTicketStatus];

export const TransactionType = {
  Unknown: 0 as const,
  Inbound: 1 as const,
  Outbound: 2 as const,
  Adjustment: 3 as const,
};

export type TransactionTypeValue = typeof TransactionType[keyof typeof TransactionType];

export const ReferenceType = {
  Order: 1 as const,
  Return: 2 as const,
  Supplier: 3 as const,
  Adjustment: 4 as const,
};

export type ReferenceTypeValue = typeof ReferenceType[keyof typeof ReferenceType];

export const InventoryTransactionStatus = {
  Pending: 0 as const,
  Completed: 1 as const,
};

export type InventoryTransactionStatusValue = typeof InventoryTransactionStatus[keyof typeof InventoryTransactionStatus];

export interface User {
  id: string;
  displayName: string;
  email: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  variantName?: string;
  color?: string;
  size?: string;
  material?: string;
  price: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  categoryId: string;
  productName: string;
  type: number;
  description?: string;
  brand?: string;
  status: number;
  createdAt: string;
  isPrescription?: boolean;
  isCustomized?: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productVariantId: string;
  quantity: number;
  unitPrice: number;
  productVariant?: ProductVariant;
  product?: Product;
}

export interface Order {
  id: string;
  userId?: string;
  createdAt: string;
  totalAmount: number;
  orderStatus: number;
  items: OrderItem[];
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  paidAt?: string;
}

export interface AfterSalesTicketItem {
  id: string;
  ticketId: string;
  orderItemId: string;
  returnedQuantity: number;
  condition: string;
  notes?: string;
  canRestock: boolean;
  orderItem?: OrderItem;
}

export interface AfterSalesTicket {
  id: string;
  orderId: string;
  customerId: string;
  ticketType: AfterSalesTicketTypeValue;
  ticketStatus: AfterSalesTicketStatusValue;
  reason: string;
  requestedAction?: string;
  refundAmount?: number;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  customer?: User;
  order?: Order;
  items: AfterSalesTicketItem[];
}

export interface InventoryTransaction {
  id: string;
  userId: string;
  productVariantId: string;
  transactionType: TransactionTypeValue;
  quantity: number;
  referenceType: ReferenceTypeValue;
  referenceId?: string;
  status: InventoryTransactionStatusValue;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface ApproveReturnPayload {
  ticketId: string;
  approvedAt: string;
  approvedBy: string;
  itemUpdates: {
    itemId: string;
    approvedQuantity: number;
  }[];
}

export interface RejectReturnPayload {
  ticketId: string;
  rejectionReason: string;
  rejectedAt: string;
  rejectedBy: string;
}
