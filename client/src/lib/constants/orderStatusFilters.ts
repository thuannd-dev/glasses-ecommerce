/**
 * Order status filter categories for customer orders
 * Groups backend OrderStatus values into customer-facing filter categories
 */

export const ORDER_STATUS_FILTERS = {
  All: {
    label: "All",
    backendStatuses: ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Completed", "Cancelled"],
    color: "#171717",
  },
  Pending: {
    label: "Pending",
    backendStatuses: ["Pending"],
    color: "#4A4A72",
  },
  Processing: {
    label: "Processing",
    backendStatuses: ["Confirmed", "Processing"],
    color: "#c2410c",
  },
  InTransit: {
    label: "In-transit",
    backendStatuses: ["Shipped"],
    color: "#7A5A33",
  },
  Complete: {
    label: "Complete",
    backendStatuses: ["Delivered", "Completed"],
    color: "#15803d",
  },
  Cancelled: {
    label: "Cancelled",
    backendStatuses: ["Cancelled"],
    color: "#B3261E",
  },
} as const;

export type OrderStatusFilterKey = keyof typeof ORDER_STATUS_FILTERS;

/**
 * Convert filter key to comma-separated list of backend status names
 * Used to pass to API as query parameter
 */
export function getStatusQueryString(filterKey: OrderStatusFilterKey): string {
  if (filterKey === "All") return "";
  return ORDER_STATUS_FILTERS[filterKey].backendStatuses.join(",");
}
