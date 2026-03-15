export const ORDER_CARD_TOKENS = {
  radius: 3,
  border: "1px solid rgba(0,0,0,0.08)",
  shadow: "0 12px 30px rgba(0,0,0,0.06)",
  shadowHover: "0 16px 36px rgba(0,0,0,0.08)",
  gutterX: 2.75,
} as const;

export type OrderListCardMode = "confirmed" | "packing" | "in-transit" | "completed";

export function getStatusChipColors(status: string, mode: OrderListCardMode) {
  const s = status.toLowerCase();

  if (s.includes("shipped") || s.includes("delivered") || mode === "in-transit") {
    return { bg: "rgba(34,197,94,0.12)", color: "#15803d", border: "rgba(34,197,94,0.4)" };
  }

  if (s.includes("completed") || mode === "completed") {
    return { bg: "rgba(34,197,94,0.12)", color: "#15803d", border: "rgba(34,197,94,0.4)" };
  }

  if (s.includes("processing") || mode === "packing") {
    return { bg: "rgba(249,115,22,0.12)", color: "#c2410c", border: "rgba(249,115,22,0.4)" };
  }

  if (s.includes("confirmed") || mode === "confirmed") {
    return { bg: "rgba(139,92,246,0.12)", color: "#5b21b6", border: "rgba(139,92,246,0.4)" };
  }

  if (s.includes("pending")) {
    return { bg: "rgba(148,163,184,0.18)", color: "#475569", border: "rgba(148,163,184,0.8)" };
  }

  // cancelled / refunded – soft red
  if (s.includes("cancel") || s.includes("refund")) {
    return { bg: "rgba(239,68,68,0.12)", color: "#b91c1c", border: "rgba(248,113,113,0.6)" };
  }

  return { bg: "rgba(148,163,184,0.18)", color: "#475569", border: "rgba(148,163,184,0.8)" };
}

