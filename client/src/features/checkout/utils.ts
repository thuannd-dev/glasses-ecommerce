import type { PaymentMethodUI } from "./types";

/** Map UI payment method to API value (GET /api/lookups paymentMethod) */
export function toApiPaymentMethod(ui: PaymentMethodUI): string {
  const map: Record<PaymentMethodUI, string> = {
    COD: "Cod",
    BANK: "BankTransfer",
    MOMO: "QrCode",
  };
  return map[ui];
}

/** Vietnam phone: 10 digits, optional +84 or 0 prefix */
export function isValidVietnamPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return /^(0|84)?[35789][0-9]{8}$/.test(cleaned) && cleaned.length >= 10;
}
