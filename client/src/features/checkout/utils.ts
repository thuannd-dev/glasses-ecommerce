import type { PaymentMethodUI } from "./types";
import type { PrescriptionData } from "../../lib/types/prescription";
import type { PrescriptionInputDto } from "../../lib/types/order";

/** Map UI payment method to API value (GET /api/lookups paymentMethod) */
export function toApiPaymentMethod(ui: PaymentMethodUI): string {
  const map: Record<PaymentMethodUI, string> = {
    COD: "Cod",
    BANK: "BankTransfer",
  };
  return map[ui];
}

/** Vietnam phone: 10 digits, optional +84 or 0 prefix */
export function isValidVietnamPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return /^(0|84)?[35789][0-9]{8}$/.test(cleaned) && cleaned.length >= 10;
}

/**
 * Convert frontend PrescriptionData to API PrescriptionInputDto.
 * - Frontend: eye 1 = OD (Right), 2 = OS (Left). API: Eye 1 = Left, 2 = Right.
 * - Backend requires CYL in [-6, +6].
 */
export function toPrescriptionInputDto(data: PrescriptionData): PrescriptionInputDto {
  const round2 = (n: number | null | undefined) =>
    n != null && Number.isFinite(n) ? Math.round(n * 100) / 100 : null;

  return {
    ImageUrl: data.imageUrl?.trim() ? data.imageUrl.trim() : undefined,
    Details: data.details.map((d) => {
      const sph: number | null = round2(d.sph) ?? null;
      const cyl: number | null = round2(d.cyl) ?? null;
      const axis: number | null = d.axis != null ? Math.round(d.axis) : null;

      return {
        Eye: (d.eye === 1 ? 2 : 1) as 1 | 2,
        SPH: sph,
        CYL: cyl,
        AXIS: axis,
        PD: round2(d.pd),
        ADD: round2(d.add),
      };
    }),
  };
}
