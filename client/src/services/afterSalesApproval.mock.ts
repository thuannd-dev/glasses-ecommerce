import type {
  AfterSalesTicket,
  ApproveReturnPayload,
  RejectReturnPayload,
  User,
  InventoryTransaction,
} from "./afterSales.types";
import {
  AfterSalesTicketStatus,
  AfterSalesTicketType,
  TransactionType,
  ReferenceType,
  InventoryTransactionStatus,
} from "./afterSales.types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockPendingTickets: AfterSalesTicket[] = [
  {
    id: "ticket-001",
    orderId: "order-001",
    customerId: "cust-001",
    ticketType: AfterSalesTicketType.Return,
    ticketStatus: AfterSalesTicketStatus.Pending,
    reason: "Product arrived damaged",
    requestedAction: "Full refund",
    refundAmount: 299.98,
    createdAt: "2026-02-01T10:30:00Z",
    customer: {
      id: "cust-001",
      displayName: "John Doe",
      email: "john@customer.com",
    },
    order: {
      id: "order-001",
      userId: "cust-001",
      createdAt: "2026-01-25T08:00:00Z",
      totalAmount: 299.98,
      orderStatus: 4,
      items: [
        {
          id: "item-001",
          orderId: "order-001",
          productVariantId: "var-001",
          quantity: 2,
          unitPrice: 149.99,
          product: {
            id: "prod-001",
            categoryId: "cat-001",
            productName: "Classic Frame",
            type: 1,
            brand: "Vooglam",
            status: 0,
            createdAt: "2026-01-01T00:00:00Z",
            isPrescription: false,
            isCustomized: false,
          },
          productVariant: {
            id: "var-001",
            productId: "prod-001",
            sku: "FRAME-BLK-M",
            variantName: "Black M",
            color: "Black",
            size: "M",
            price: 149.99,
            isActive: true,
          },
        },
      ],
    },
    items: [
      {
        id: "ti-001",
        ticketId: "ticket-001",
        orderItemId: "item-001",
        returnedQuantity: 2,
        condition: "Damaged - bent frame",
        notes: "Left hinge is broken",
        canRestock: false,
        orderItem: {
          id: "item-001",
          orderId: "order-001",
          productVariantId: "var-001",
          quantity: 2,
          unitPrice: 149.99,
          product: {
            id: "prod-001",
            categoryId: "cat-001",
            productName: "Classic Frame",
            type: 1,
            brand: "Vooglam",
            status: 0,
            createdAt: "2026-01-01T00:00:00Z",
            isPrescription: false,
            isCustomized: false,
          },
          productVariant: {
            id: "var-001",
            productId: "prod-001",
            sku: "FRAME-BLK-M",
            variantName: "Black M",
            color: "Black",
            size: "M",
            price: 149.99,
            isActive: true,
          },
        },
      },
    ],
  },
  {
    id: "ticket-002",
    orderId: "order-002",
    customerId: "cust-002",
    ticketType: AfterSalesTicketType.Return,
    ticketStatus: AfterSalesTicketStatus.Pending,
    reason: "Changed mind about purchase",
    requestedAction: "Return for credit",
    refundAmount: 129.99,
    createdAt: "2026-02-03T14:15:00Z",
    customer: {
      id: "cust-002",
      displayName: "Jane Smith",
      email: "jane@customer.com",
    },
    order: {
      id: "order-002",
      userId: "cust-002",
      createdAt: "2026-01-28T10:00:00Z",
      totalAmount: 129.99,
      orderStatus: 4,
      items: [
        {
          id: "item-002",
          orderId: "order-002",
          productVariantId: "var-002",
          quantity: 1,
          unitPrice: 129.99,
          product: {
            id: "prod-002",
            categoryId: "cat-001",
            productName: "Elegant Frame",
            type: 1,
            brand: "Vooglam",
            status: 0,
            createdAt: "2026-01-05T00:00:00Z",
            isPrescription: false,
            isCustomized: false,
          },
          productVariant: {
            id: "var-002",
            productId: "prod-002",
            sku: "FRAME-TOR-S",
            variantName: "Tortoiseshell S",
            color: "Tortoiseshell",
            size: "S",
            price: 129.99,
            isActive: true,
          },
        },
      ],
    },
    items: [
      {
        id: "ti-002",
        ticketId: "ticket-002",
        orderItemId: "item-002",
        returnedQuantity: 1,
        condition: "Unused - still in box",
        notes: "Decided not to wear this style",
        canRestock: true,
        orderItem: {
          id: "item-002",
          orderId: "order-002",
          productVariantId: "var-002",
          quantity: 1,
          unitPrice: 129.99,
          product: {
            id: "prod-002",
            categoryId: "cat-001",
            productName: "Elegant Frame",
            type: 1,
            brand: "Vooglam",
            status: 0,
            createdAt: "2026-01-05T00:00:00Z",
            isPrescription: false,
            isCustomized: false,
          },
          productVariant: {
            id: "var-002",
            productId: "prod-002",
            sku: "FRAME-TOR-S",
            variantName: "Tortoiseshell S",
            color: "Tortoiseshell",
            size: "S",
            price: 129.99,
            isActive: true,
          },
        },
      },
    ],
  },
  {
    id: "ticket-003",
    orderId: "order-003",
    customerId: "cust-003",
    ticketType: AfterSalesTicketType.Return,
    ticketStatus: AfterSalesTicketStatus.Pending,
    reason: "Prescription lens issue",
    requestedAction: "Remake with correct prescription",
    createdAt: "2026-02-04T09:45:00Z",
    customer: {
      id: "cust-003",
      displayName: "Mike Johnson",
      email: "mike@customer.com",
    },
    order: {
      id: "order-003",
      userId: "cust-003",
      createdAt: "2026-01-20T14:30:00Z",
      totalAmount: 299.98,
      orderStatus: 4,
      items: [
        {
          id: "item-003",
          orderId: "order-003",
          productVariantId: "var-003",
          quantity: 1,
          unitPrice: 299.98,
          product: {
            id: "prod-003",
            categoryId: "cat-02",
            productName: "Premium Prescription Lens",
            type: 2,
            brand: "Vooglam",
            status: 0,
            createdAt: "2026-01-10T00:00:00Z",
            isPrescription: true,
            isCustomized: false,
          },
          productVariant: {
            id: "var-003",
            productId: "prod-003",
            sku: "LENS-PRES-CUSTOM",
            variantName: "Custom Prescription",
            color: "Clear",
            size: "Standard",
            price: 299.98,
            isActive: true,
          },
        },
      ],
    },
    items: [
      {
        id: "ti-003",
        ticketId: "ticket-003",
        orderItemId: "item-003",
        returnedQuantity: 1,
        condition: "Blurry vision - wrong prescription",
        notes: "Customer reports vision is not clear",
        canRestock: false,
        orderItem: {
          id: "item-003",
          orderId: "order-003",
          productVariantId: "var-003",
          quantity: 1,
          unitPrice: 299.98,
          product: {
            id: "prod-003",
            categoryId: "cat-02",
            productName: "Premium Prescription Lens",
            type: 2,
            brand: "Vooglam",
            status: 0,
            createdAt: "2026-01-10T00:00:00Z",
            isPrescription: true,
            isCustomized: false,
          },
          productVariant: {
            id: "var-003",
            productId: "prod-003",
            sku: "LENS-PRES-CUSTOM",
            variantName: "Custom Prescription",
            color: "Clear",
            size: "Standard",
            price: 299.98,
            isActive: true,
          },
        },
      },
    ],
  },
];

const mockStockDatabase: Record<string, { quantityOnHand: number; quantityReserved: number }> = {
  "var-001": { quantityOnHand: 75, quantityReserved: 15 },
  "var-002": { quantityOnHand: 120, quantityReserved: 25 },
  "var-003": { quantityOnHand: 45, quantityReserved: 5 },
};

const mockTransactions: InventoryTransaction[] = [];

export const afterSalesApprovalService = {
  async getPendingAfterSalesTickets(): Promise<AfterSalesTicket[]> {
    await sleep(500);
    return mockPendingTickets.filter(
      (t) => t.ticketStatus === AfterSalesTicketStatus.Pending,
    );
  },

  async getAfterSalesTicketById(id: string): Promise<AfterSalesTicket | null> {
    await sleep(300);
    return mockPendingTickets.find((t) => t.id === id) || null;
  },

  async approveReturn(
    payload: ApproveReturnPayload,
    currentUser: User,
  ): Promise<{ success: boolean; ticket: AfterSalesTicket | null; error?: string }> {
    await sleep(800);

    const ticket = mockPendingTickets.find((t) => t.id === payload.ticketId);
    if (!ticket) {
      return { success: false, ticket: null, error: "Ticket not found" };
    }

    if (ticket.ticketStatus !== AfterSalesTicketStatus.Pending) {
      return {
        success: false,
        ticket: null,
        error: "Ticket is not in pending status",
      };
    }

    if (!currentUser.id.includes("manager")) {
      return {
        success: false,
        ticket: null,
        error: "Only managers can approve returns",
      };
    }

    // Process each item
    ticket.items.forEach((item) => {
      const update = payload.itemUpdates.find((u) => u.itemId === item.id);
      if (!update) return;

      // Check if item can be restocked (not prescription/customized)
      if (item.canRestock) {
        // Update stock
        const stock = mockStockDatabase[item.orderItem?.productVariantId || ""];
        if (stock) {
          stock.quantityOnHand += update.approvedQuantity;
        }

        // Create inventory transaction
        const transaction: InventoryTransaction = {
          id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: currentUser.id,
          productVariantId: item.orderItem?.productVariantId || "",
          transactionType: TransactionType.Inbound,
          quantity: update.approvedQuantity,
          referenceType: ReferenceType.Return,
          referenceId: payload.ticketId,
          status: InventoryTransactionStatus.Completed,
          notes: `Return approved: ${ticket.id}`,
          createdAt: payload.approvedAt,
          createdBy: currentUser.id,
        };
        mockTransactions.push(transaction);
      }
    });

    // Update ticket status
    ticket.ticketStatus = AfterSalesTicketStatus.Resolved;
    ticket.resolvedAt = payload.approvedAt;
    ticket.resolvedBy = payload.approvedBy;

    return { success: true, ticket };
  },

  async rejectReturn(
    payload: RejectReturnPayload,
    currentUser: User,
  ): Promise<{ success: boolean; ticket: AfterSalesTicket | null; error?: string }> {
    await sleep(800);

    const ticket = mockPendingTickets.find((t) => t.id === payload.ticketId);
    if (!ticket) {
      return { success: false, ticket: null, error: "Ticket not found" };
    }

    if (ticket.ticketStatus !== AfterSalesTicketStatus.Pending) {
      return {
        success: false,
        ticket: null,
        error: "Ticket is not in pending status",
      };
    }

    if (!currentUser.id.includes("manager")) {
      return {
        success: false,
        ticket: null,
        error: "Only managers can reject returns",
      };
    }

    ticket.ticketStatus = AfterSalesTicketStatus.Rejected;
    ticket.rejectedAt = payload.rejectedAt;
    ticket.rejectedBy = payload.rejectedBy;
    ticket.rejectionReason = payload.rejectionReason;

    return { success: true, ticket };
  },
};
