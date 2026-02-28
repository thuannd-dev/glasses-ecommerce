/** Predefined reasons for order cancellation (English) */
export const CANCEL_ORDER_REASONS = [
  { value: "changed_mind", label: "Changed my mind" },
  { value: "ordered_by_mistake", label: "Ordered by mistake" },
  { value: "found_better_price", label: "Found a better price elsewhere" },
  { value: "delivery_too_late", label: "Delivery would be too late" },
  { value: "duplicate_order", label: "Duplicate order" },
  { value: "other", label: "Other" },
] as const;

export type CancelReasonValue = (typeof CANCEL_ORDER_REASONS)[number]["value"];
