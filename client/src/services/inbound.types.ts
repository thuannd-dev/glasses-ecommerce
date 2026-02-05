export enum SourceType {
  Unknown = 0,
  Supplier = 1,
  Return = 2,
  Adjustment = 3,
}

export enum InboundRecordStatus {
  PendingApproval = 0,
  Approved = 1,
  Rejected = 2,
}

export enum TransactionType {
  Unknown = 0,
  Inbound = 1,
  Outbound = 2,
  Adjustment = 3,
}

export enum ReferenceType {
  Order = 1,
  Return = 2,
  Supplier = 3,
  Adjustment = 4,
}

export enum InventoryTransactionStatus {
  Pending = 0,
  Completed = 1,
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
}

export interface InboundRecordItem {
  id: string;
  inboundRecordId: string;
  productVariantId: string;
  quantity: number;
  notes?: string;
  productVariant?: ProductVariant;
  product?: Product;
}

export interface InboundRecord {
  id: string;
  sourceType: SourceType;
  sourceReference?: string;
  status: InboundRecordStatus;
  totalItems: number;
  notes?: string;
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  creator?: {
    id: string;
    displayName: string;
    email: string;
  };
  items: InboundRecordItem[];
}

export interface InventoryTransaction {
  id: string;
  userId: string;
  productVariantId: string;
  transactionType: TransactionType;
  quantity: number;
  referenceType: ReferenceType;
  referenceId?: string;
  status: InventoryTransactionStatus;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  imageUrl?: string;
}

export interface ApprovePayload {
  approvedAt: string;
  approvedBy: string;
}

export interface RejectPayload {
  rejectedAt: string;
  rejectionReason: string;
}
