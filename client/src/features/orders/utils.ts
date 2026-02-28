import { formatMoney } from "../../lib/utils/format";
import type { OrderShippingAddressShape } from "../../lib/types/order";

export { formatMoney };

/** Format shipping address (string or object) to display string */
export function formatOrderAddress(
  addr: string | OrderShippingAddressShape | undefined
): string {
  if (addr == null) return "";
  if (typeof addr === "string") return addr;
  const a = addr;
  const parts = [
    [a.recipientName, a.recipientPhone].filter(Boolean).join(" – "),
    [a.venue, a.ward, a.district, a.city].filter(Boolean).join(", "),
    a.postalCode,
  ].filter(Boolean);
  return parts.join("\n");
}
