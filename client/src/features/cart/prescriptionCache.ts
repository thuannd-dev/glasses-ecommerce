import type { PrescriptionData } from "../../lib/types/prescription";
import type { CartLensMode } from "../../lib/types/lensSelection";

/** In-memory cache only (no local/session storage). */
const byCartItemId: Record<string, PrescriptionData> = {};
const byVariantId: Record<string, PrescriptionData> = {};
const lensModes: Record<string, CartLensMode> = {};

/** Clear prescription + lens mode for a line; optional variant key for by-variant cache. */
export function removeCartItemLocalData(
  cartItemId: string,
  productVariantId?: string | null,
) {
  delete byCartItemId[cartItemId];
  delete lensModes[cartItemId];
  if (productVariantId) {
    delete byVariantId[productVariantId];
  }
}

export function setCartItemLensMode(cartItemId: string, mode: CartLensMode) {
  lensModes[cartItemId] = mode;
  if (mode === "non-prescription") {
    delete byCartItemId[cartItemId];
  }
}

/** Explicit lens mode; if unset but prescription exists in cache, treated as prescription. */
export function getCartItemLensMode(cartItemId: string | undefined): CartLensMode | undefined {
  if (!cartItemId) return undefined;
  const byMode = lensModes[cartItemId];
  if (byMode) return byMode;
  if (byCartItemId[cartItemId]) return "prescription";
  return undefined;
}

export function setCartItemPrescription(cartItemId: string, prescription: PrescriptionData) {
  byCartItemId[cartItemId] = prescription;
  lensModes[cartItemId] = "prescription";
}

/** Store by productVariantId so checkout can show prescription even if cart item id wasn't available when adding. */
export function setPrescriptionByVariantId(productVariantId: string, prescription: PrescriptionData) {
  byVariantId[productVariantId] = prescription;
}

export function getCartItemPrescription(cartItemId: string | undefined): PrescriptionData | undefined {
  if (!cartItemId) return undefined;
  return byCartItemId[cartItemId];
}

export function getPrescriptionByVariantId(productVariantId: string | undefined): PrescriptionData | undefined {
  if (!productVariantId) return undefined;
  return byVariantId[productVariantId];
}

/** Prescriptions by cart item id; uses variant fallback when id has no prescription. */
export function getCartItemPrescriptions(
  items: Array<{ id: string; productVariantId: string }>
): Record<string, PrescriptionData> {
  const out: Record<string, PrescriptionData> = {};
  items.forEach((item) => {
    const prescription = byCartItemId[item.id] ?? byVariantId[item.productVariantId];
    if (prescription) out[item.id] = prescription;
  });
  return out;
}
