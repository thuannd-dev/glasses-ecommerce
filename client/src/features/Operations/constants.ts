import type { OrderType, OrderStatus, ShipmentDto } from "../../lib/types";

export const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  ReadyStock: "Standard",
  PreOrder: "Pre-order",
  Prescription: "Prescription",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  Pending: "Pending",
  Confirmed: "Confirmed",
  Processing: "Processing",
  Shipped: "Shipped",
  Delivered: "Delivered",
  Completed: "Completed",
  Cancelled: "Cancelled",
  Refunded: "Refunded",
};

export const SHIPMENT_STATUS_LABEL: Record<ShipmentDto["status"], string> = {
  created: "Created",
  picked: "Picked up",
  in_transit: "In transit",
  delivered: "Delivered",
};

export function formatDate(s: string): string {
  try {
    return new Date(s).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}
