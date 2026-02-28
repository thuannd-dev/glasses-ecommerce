import type { OrderType, OrderStatus, ShipmentDto } from "../../lib/types";

export const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  standard: "Standard",
  "pre-order": "Pre-order",
  prescription: "Prescription",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  ready_to_ship: "Ready to ship",
  shipped: "Shipped",
  delivered: "Delivered",
  received: "Received at warehouse",
  lens_ordered: "Lens ordered",
  lens_fitting: "Lens fitting",
  cancelled: "Cancelled",
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
