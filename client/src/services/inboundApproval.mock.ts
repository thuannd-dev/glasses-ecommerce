import type {
  InboundRecord,
  ApprovePayload,
  RejectPayload,
  User,
  InventoryTransaction,
} from "./inbound.types";
import {
  InboundRecordStatus,
  SourceType,
  TransactionType,
  ReferenceType,
  InventoryTransactionStatus,
} from "./inbound.types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockCurrentUser: User = {
  id: "user-001",
  displayName: "John Manager",
  email: "john@example.com",
};

const mockPendingRecords: InboundRecord[] = [
  {
    id: "inbound-001",
    sourceType: SourceType.Supplier,
    sourceReference: "PO-2026-0001",
    status: InboundRecordStatus.PendingApproval,
    totalItems: 2,
    notes: "Frame order from supplier A",
    createdAt: "2026-02-01T10:00:00Z",
    createdBy: "user-002",
    creator: {
      id: "user-002",
      displayName: "Alice Warehouse",
      email: "alice@example.com",
    },
    items: [
      {
        id: "item-001",
        inboundRecordId: "inbound-001",
        productVariantId: "var-001",
        quantity: 50,
        notes: "Black frame, size M",
        productVariant: {
          id: "var-001",
          productId: "prod-001",
          sku: "FRAME-BLK-M",
          variantName: "Classic Black M",
          color: "Black",
          size: "M",
          price: 129.99,
          isActive: true,
        },
        product: {
          id: "prod-001",
          categoryId: "cat-001",
          productName: "Classic Frame",
          type: 1,
          description: "Timeless eyewear frame",
          brand: "Vooglam",
          status: 0,
          createdAt: "2026-01-01T00:00:00Z",
        },
      },
      {
        id: "item-002",
        inboundRecordId: "inbound-001",
        productVariantId: "var-002",
        quantity: 30,
        notes: "Tortoiseshell, size S",
        productVariant: {
          id: "var-002",
          productId: "prod-002",
          sku: "FRAME-TOR-S",
          variantName: "Tortoiseshell S",
          color: "Tortoiseshell",
          size: "S",
          price: 149.99,
          isActive: true,
        },
        product: {
          id: "prod-002",
          categoryId: "cat-001",
          productName: "Elegant Frame",
          type: 1,
          description: "Elegant eyewear frame",
          brand: "Vooglam",
          status: 0,
          createdAt: "2026-01-05T00:00:00Z",
        },
      },
    ],
  },
  {
    id: "inbound-002",
    sourceType: SourceType.Return,
    sourceReference: "RMA-2026-0050",
    status: InboundRecordStatus.PendingApproval,
    totalItems: 1,
    notes: "Customer return - damage assessment needed",
    createdAt: "2026-02-03T14:30:00Z",
    createdBy: "user-003",
    creator: {
      id: "user-003",
      displayName: "Bob Returns",
      email: "bob@example.com",
    },
    items: [
      {
        id: "item-003",
        inboundRecordId: "inbound-002",
        productVariantId: "var-003",
        quantity: 1,
        notes: "Minor scratch, still usable",
        productVariant: {
          id: "var-003",
          productId: "prod-003",
          sku: "LENS-UV-STD",
          variantName: "UV Protection Lens",
          color: "Clear",
          size: "Standard",
          price: 79.99,
          isActive: true,
        },
        product: {
          id: "prod-003",
          categoryId: "cat-002",
          productName: "UV Protection Lens",
          type: 2,
          description: "Premium UV blocking lens",
          brand: "Vooglam",
          status: 0,
          createdAt: "2026-01-10T00:00:00Z",
        },
      },
    ],
  },
  {
    id: "inbound-003",
    sourceType: SourceType.Supplier,
    sourceReference: "PO-2026-0002",
    status: InboundRecordStatus.PendingApproval,
    totalItems: 2,
    notes: "Bulk order from supplier B - quarterly stock",
    createdAt: "2026-02-05T08:00:00Z",
    createdBy: "user-002",
    creator: {
      id: "user-002",
      displayName: "Alice Warehouse",
      email: "alice@example.com",
    },
    items: [
      {
        id: "item-004",
        inboundRecordId: "inbound-003",
        productVariantId: "var-004",
        quantity: 75,
        notes: "Gold frame, size L",
        productVariant: {
          id: "var-004",
          productId: "prod-004",
          sku: "FRAME-GOLD-L",
          variantName: "Premium Gold L",
          color: "Gold",
          size: "L",
          price: 199.99,
          isActive: true,
        },
        product: {
          id: "prod-004",
          categoryId: "cat-001",
          productName: "Premium Frame Gold",
          type: 1,
          description: "Luxury gold-plated frame",
          brand: "Vooglam",
          status: 0,
          createdAt: "2026-01-15T00:00:00Z",
        },
      },
      {
        id: "item-005",
        inboundRecordId: "inbound-003",
        productVariantId: "var-005",
        quantity: 60,
        notes: "Silver frame, size M",
        productVariant: {
          id: "var-005",
          productId: "prod-005",
          sku: "FRAME-SILVER-M",
          variantName: "Premium Silver M",
          color: "Silver",
          size: "M",
          price: 189.99,
          isActive: true,
        },
        product: {
          id: "prod-005",
          categoryId: "cat-001",
          productName: "Premium Frame Silver",
          type: 1,
          description: "Luxury silver-plated frame",
          brand: "Vooglam",
          status: 0,
          createdAt: "2026-01-18T00:00:00Z",
        },
      },
    ],
  },
  {
    id: "inbound-004",
    sourceType: SourceType.Adjustment,
    sourceReference: "ADJ-2026-0015",
    status: InboundRecordStatus.PendingApproval,
    totalItems: 1,
    notes: "Inventory adjustment - stock count correction",
    createdAt: "2026-02-05T11:15:00Z",
    createdBy: "user-001",
    creator: {
      id: "user-001",
      displayName: "John Manager",
      email: "john@example.com",
    },
    items: [
      {
        id: "item-006",
        inboundRecordId: "inbound-004",
        productVariantId: "var-006",
        quantity: 25,
        notes: "Found misplaced inventory in warehouse",
        productVariant: {
          id: "var-006",
          productId: "prod-006",
          sku: "CONTACT-DAILY",
          variantName: "Daily Disposable",
          color: "Clear",
          size: "Monthly Supply",
          price: 49.99,
          isActive: true,
        },
        product: {
          id: "prod-006",
          categoryId: "cat-003",
          productName: "Daily Contact Lenses",
          type: 2,
          description: "Comfortable daily disposable lenses",
          brand: "Vooglam",
          status: 0,
          createdAt: "2026-01-20T00:00:00Z",
        },
      },
    ],
  },
];

const mockStockDatabase: Record<string, { quantityOnHand: number; quantityReserved: number }> =
  {
    "var-001": { quantityOnHand: 100, quantityReserved: 20 },
    "var-002": { quantityOnHand: 50, quantityReserved: 10 },
    "var-003": { quantityOnHand: 200, quantityReserved: 30 },
  };

const mockTransactions: InventoryTransaction[] = [];

// Add approved records
const mockApprovedRecords: InboundRecord[] = [
  {
    id: "inbound-app-001",
    sourceType: SourceType.Supplier,
    sourceReference: "PO-2026-0000",
    status: InboundRecordStatus.Approved,
    totalItems: 2,
    notes: "Approved supplier order",
    createdAt: "2026-01-28T10:00:00Z",
    createdBy: "user-002",
    creator: {
      id: "user-002",
      displayName: "Alice Warehouse",
      email: "alice@example.com",
    },
    approvedAt: "2026-01-29T14:30:00Z",
    approvedBy: "user-001",
    items: [
      {
        id: "item-app-001",
        inboundRecordId: "inbound-app-001",
        productVariantId: "var-001",
        quantity: 100,
        notes: "Black frame bulk order",
        productVariant: {
          id: "var-001",
          productId: "prod-001",
          sku: "FRAME-BLK-M",
          variantName: "Classic Black M",
          color: "Black",
          size: "M",
          price: 129.99,
          isActive: true,
        },
        product: {
          id: "prod-001",
          categoryId: "cat-001",
          productName: "Classic Frame",
          type: 1,
          description: "Timeless eyewear frame",
          brand: "Vooglam",
          status: 0,
          createdAt: "2026-01-01T00:00:00Z",
        },
      },
    ],
  },
  {
    id: "inbound-app-002",
    sourceType: SourceType.Supplier,
    sourceReference: "PO-2026-0001",
    status: InboundRecordStatus.Approved,
    totalItems: 1,
    notes: "Approved contact lens shipment",
    createdAt: "2026-02-01T09:00:00Z",
    createdBy: "user-002",
    creator: {
      id: "user-002",
      displayName: "Alice Warehouse",
      email: "alice@example.com",
    },
    approvedAt: "2026-02-02T10:00:00Z",
    approvedBy: "user-001",
    items: [
      {
        id: "item-app-002",
        inboundRecordId: "inbound-app-002",
        productVariantId: "var-002",
        quantity: 200,
        notes: "Contact lens monthly supply",
        productVariant: {
          id: "var-002",
          productId: "prod-002",
          sku: "CONTACT-MONTHLY",
          variantName: "Monthly Supply",
          color: "Clear",
          size: "Monthly",
          price: 45.99,
          isActive: true,
        },
        product: {
          id: "prod-002",
          categoryId: "cat-002",
          productName: "Monthly Contact Lens",
          type: 2,
          description: "High-quality monthly contact lenses",
          brand: "Vooglam",
          status: 0,
          createdAt: "2026-01-05T00:00:00Z",
        },
      },
    ],
  },
];

export const inboundApprovalService = {
  async getPendingInboundRecords(): Promise<InboundRecord[]> {
    await sleep(500);
    return mockPendingRecords.filter((r) => r.status === InboundRecordStatus.PendingApproval);
  },

  async getApprovedInboundRecords(): Promise<InboundRecord[]> {
    await sleep(500);
    return mockApprovedRecords.filter((r) => r.status === InboundRecordStatus.Approved);
  },

  async getInboundRecordById(id: string): Promise<InboundRecord | null> {
    await sleep(300);
    return [...mockPendingRecords, ...mockApprovedRecords].find((r) => r.id === id) || null;
  },

  async approveInboundRecord(
    id: string,
    payload: ApprovePayload,
    currentUser: User,
  ): Promise<{ success: boolean; record: InboundRecord | null; error?: string }> {
    await sleep(800);

    const record = mockPendingRecords.find((r) => r.id === id);
    if (!record) {
      return { success: false, record: null, error: "Record not found" };
    }

    if (record.createdBy === currentUser.id) {
      return {
        success: false,
        record: null,
        error: "You cannot approve your own inbound record",
      };
    }

    if (record.status !== InboundRecordStatus.PendingApproval) {
      return {
        success: false,
        record: null,
        error: "Record is not in pending approval status",
      };
    }

    record.status = InboundRecordStatus.Approved;
    record.approvedAt = payload.approvedAt;
    record.approvedBy = payload.approvedBy;

    record.items.forEach((item) => {
      const stock = mockStockDatabase[item.productVariantId];
      if (stock) {
        stock.quantityOnHand += item.quantity;
      }

      const transaction: InventoryTransaction = {
        id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: currentUser.id,
        productVariantId: item.productVariantId,
        transactionType: TransactionType.Inbound,
        quantity: item.quantity,
        referenceType: ReferenceType.Supplier,
        referenceId: record.id,
        status: InventoryTransactionStatus.Completed,
        notes: `Inbound approval: ${record.sourceReference}`,
        createdAt: payload.approvedAt,
        createdBy: currentUser.id,
      };
      mockTransactions.push(transaction);
    });

    return { success: true, record };
  },

  async rejectInboundRecord(
    id: string,
    payload: RejectPayload,
    currentUser: User,
  ): Promise<{ success: boolean; record: InboundRecord | null; error?: string }> {
    await sleep(800);

    const record = mockPendingRecords.find((r) => r.id === id);
    if (!record) {
      return { success: false, record: null, error: "Record not found" };
    }

    if (record.createdBy === currentUser.id) {
      return {
        success: false,
        record: null,
        error: "You cannot reject your own inbound record",
      };
    }

    if (record.status !== InboundRecordStatus.PendingApproval) {
      return {
        success: false,
        record: null,
        error: "Record is not in pending approval status",
      };
    }

    record.status = InboundRecordStatus.Rejected;
    record.rejectedAt = payload.rejectedAt;
    record.rejectionReason = payload.rejectionReason;

    return { success: true, record };
  },

  getCurrentUser(): User {
    return mockCurrentUser;
  },
};
