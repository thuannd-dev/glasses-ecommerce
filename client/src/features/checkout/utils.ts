import type { PaymentMethodUI } from "./types";
import type { PrescriptionData } from "../../lib/types/prescription";
import type { PrescriptionInputDto } from "../../lib/types/order";

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

/**
 * Convert frontend PrescriptionData to API PrescriptionInputDto.
 * - Frontend: eye 1 = OD (Right), 2 = OS (Left). API: Eye 1 = Left, 2 = Right.
 * - Backend requires CYL in [-6, 0] (negative cylinder). If user entered positive CYL, convert to minus cylinder.
 */
export function toPrescriptionInputDto(data: PrescriptionData): PrescriptionInputDto {
  const round2 = (n: number | null | undefined) =>
    n != null && Number.isFinite(n) ? Math.round(n * 100) / 100 : null;

  return {
    Details: data.details.map((d) => {
      let sph: number | null = round2(d.sph) ?? null;
      let cyl: number | null = round2(d.cyl) ?? null;
      let axis: number | null = d.axis != null ? Math.round(d.axis) : null;

      // Backend requires CYL between -6 and 0. Convert positive cylinder to negative.
      if (cyl != null && cyl > 0) {
        sph = sph != null ? round2(sph + cyl) : null;
        cyl = round2(-cyl);
        axis = axis != null ? ((axis + 90) % 180) || 180 : null;
      }
      // Clamp CYL to valid range in case of drift or old data
      if (cyl != null && (cyl < -6 || cyl > 0)) {
        cyl = Math.max(-6, Math.min(0, cyl));
        cyl = round2(cyl);
      }

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
