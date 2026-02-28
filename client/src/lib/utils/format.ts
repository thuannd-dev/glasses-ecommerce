/**
 * Shared formatters for display (currency, etc.)
 */

/** Format number as USD (e.g. $1,234.56) */
export function formatMoney(v: number | undefined | null): string {
  if (v == null || Number.isNaN(v)) return "$0.00";
  return v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
