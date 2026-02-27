import type {
  OrderDto,
  ShipmentDto,
  OrderType,
  OrderStatus,
  CreateShipmentPayload,
  UpdateTrackingPayload,
  UpdateOrderStatusPayload,
} from "../types";

const MOCK_DELAY_MS = 400;

function delay(ms: number = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------- Mock data ----------
const mockOrders: OrderDto[] = [
  {
    id: "ord-1",
    orderNumber: "ORD-2024-001",
    orderType: "standard",
    status: "ready_to_ship",
    createdAt: "2024-02-10T09:00:00Z",
    customerName: "Nguyễn Văn A",
    customerEmail: "a@example.com",
    shippingAddress: "123 Đường X, Q.1, TP.HCM",
    items: [
      { id: "oi-1", productVariantId: "pv-1", productName: "Ray-Ban Classic", sku: "RB-CL-001", quantity: 1, price: 149 },
    ],
    totalAmount: 149,
  },
  {
    id: "ord-2",
    orderNumber: "ORD-2024-002",
    orderType: "pre-order",
    status: "received",
    createdAt: "2024-02-08T14:00:00Z",
    customerName: "Trần Thị B",
    customerEmail: "b@example.com",
    shippingAddress: "456 Đường Y, Q.3, TP.HCM",
    items: [
      { id: "oi-2", productVariantId: "pv-2", productName: "Oakley Sport", sku: "OK-SP-002", quantity: 2, price: 189 },
    ],
    totalAmount: 378,
    expectedStockDate: "2024-02-15",
  },
  {
    id: "ord-3",
    orderNumber: "ORD-2024-003",
    orderType: "prescription",
    status: "lens_fitting",
    createdAt: "2024-02-09T11:00:00Z",
    customerName: "Lê Văn C",
    customerEmail: "c@example.com",
    shippingAddress: "789 Đường Z, Q.7, TP.HCM",
    items: [
      {
        id: "oi-3",
        productVariantId: "pv-3",
        productName: "Warby Parker Rimless",
        sku: "WP-RM-003",
        quantity: 1,
        price: 169,
        prescriptionId: "rx-1",
      },
    ],
    totalAmount: 169,
    prescriptionStatus: "lens_fitting",
  },
  {
    id: "ord-4",
    orderNumber: "ORD-2024-004",
    orderType: "standard",
    status: "shipped",
    createdAt: "2024-02-07T08:00:00Z",
    customerName: "Phạm Thị D",
    customerEmail: "d@example.com",
    shippingAddress: "321 Đường W, Q.Bình Thạnh, TP.HCM",
    items: [
      { id: "oi-4", productVariantId: "pv-4", productName: "Mykita Geometric", sku: "MK-GM-004", quantity: 1, price: 199 },
    ],
    totalAmount: 199,
    shipmentId: "ship-1",
    trackingNumber: "VN123456789",
    carrier: "GHN",
  },
  {
    id: "ord-5",
    orderNumber: "ORD-2024-005",
    orderType: "pre-order",
    status: "pending",
    createdAt: "2024-02-12T10:00:00Z",
    customerName: "Hoàng Văn E",
    customerEmail: "e@example.com",
    shippingAddress: "555 Đường V, Q.10, TP.HCM",
    items: [
      { id: "oi-5", productVariantId: "pv-5", productName: "Ray-Ban Aviator", sku: "RB-AV-005", quantity: 1, price: 159 },
    ],
    totalAmount: 159,
    expectedStockDate: "2024-02-20",
  },
];

const mockShipments: ShipmentDto[] = [
  {
    id: "ship-1",
    orderId: "ord-4",
    orderNumber: "ORD-2024-004",
    trackingNumber: "VN123456789",
    carrier: "GHN",
    status: "in_transit",
    createdAt: "2024-02-09T09:00:00Z",
    shippedAt: "2024-02-09T14:00:00Z",
    trackingEvents: [
      { date: "2024-02-09T14:00:00Z", status: "picked", location: "TP.HCM", description: "Picked up" },
      { date: "2024-02-10T08:00:00Z", status: "in_transit", location: "Bình Dương", description: "In transit" },
    ],
  },
];

// In-memory store for mock API updates
let ordersStore = [...mockOrders];
let shipmentsStore = [...mockShipments];

function getOrdersStore() {
  return ordersStore;
}
function getShipmentsStore() {
  return shipmentsStore;
}

// ---------- Mock API ----------

/** GET /api/operations/orders — danh sách đơn hàng (lọc theo type, status) */
export async function fetchOrders(params?: {
  orderType?: OrderType;
  status?: OrderStatus;
}): Promise<OrderDto[]> {
  await delay();
  let list = [...getOrdersStore()];
  if (params?.orderType) list = list.filter((o) => o.orderType === params.orderType);
  if (params?.status) list = list.filter((o) => o.status === params.status);
  return list;
}

/** GET /api/operations/orders/:id — chi tiết 1 đơn */
export async function fetchOrderById(orderId: string): Promise<OrderDto | null> {
  await delay();
  return getOrdersStore().find((o) => o.id === orderId) ?? null;
}

/** PATCH /api/operations/orders/:id/status — cập nhật trạng thái đơn */
export async function updateOrderStatus(payload: UpdateOrderStatusPayload): Promise<OrderDto> {
  await delay();
  const idx = ordersStore.findIndex((o) => o.id === payload.orderId);
  if (idx === -1) throw new Error("Order not found");
  ordersStore[idx] = { ...ordersStore[idx], status: payload.status };
  return ordersStore[idx];
}

/** POST /api/operations/shipments — tạo vận đơn (đóng gói xong, tạo tracking) */
export async function createShipment(payload: CreateShipmentPayload): Promise<ShipmentDto> {
  await delay();
  const order = getOrdersStore().find((o) => o.id === payload.orderId);
  if (!order) throw new Error("Order not found");
  const newShipment: ShipmentDto = {
    id: `ship-${Date.now()}`,
    orderId: payload.orderId,
    orderNumber: order.orderNumber,
    trackingNumber: payload.trackingNumber,
    carrier: payload.carrier,
    status: "created",
    createdAt: new Date().toISOString(),
    trackingEvents: [
      {
        date: new Date().toISOString(),
        status: "created",
        description: `Vận đơn tạo bởi ${payload.carrier}`,
      },
    ],
  };
  shipmentsStore.push(newShipment);
  const orderIdx = ordersStore.findIndex((o) => o.id === payload.orderId);
  if (orderIdx !== -1) {
    ordersStore[orderIdx] = {
      ...ordersStore[orderIdx],
      shipmentId: newShipment.id,
      trackingNumber: payload.trackingNumber,
      carrier: payload.carrier,
      status: "shipped",
    };
  }
  return newShipment;
}

/** PATCH /api/operations/shipments/:id/tracking — cập nhật tracking */
export async function updateTracking(payload: UpdateTrackingPayload): Promise<ShipmentDto> {
  await delay();
  const ship = shipmentsStore.find((s) => s.id === payload.shipmentId);
  if (!ship) throw new Error("Shipment not found");
  const events = [...(ship.trackingEvents || [])];
  events.push({
    date: new Date().toISOString(),
    status: payload.status,
    location: payload.location,
    description: payload.description ?? payload.status,
  });
  const updated: ShipmentDto = {
    ...ship,
    status: payload.status,
    trackingEvents: events,
    ...(payload.status === "picked" && { shippedAt: new Date().toISOString() }),
    ...(payload.status === "delivered" && { deliveredAt: new Date().toISOString() }),
  };
  const idx = shipmentsStore.findIndex((s) => s.id === payload.shipmentId);
  shipmentsStore[idx] = updated;
  return updated;
}

/** GET /api/operations/shipments — danh sách vận đơn */
export async function fetchShipments(): Promise<ShipmentDto[]> {
  await delay();
  return [...getShipmentsStore()];
}
