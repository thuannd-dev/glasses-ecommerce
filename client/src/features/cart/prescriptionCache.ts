import type { PrescriptionData } from "../../lib/types/prescription";

/** Cache prescription by cart item id (set after adding to cart with prescription). */
const STORAGE_KEY = "cartItemPrescriptions";
/** Fallback: prescription by productVariantId (same tab/session). */
const STORAGE_KEY_BY_VARIANT = "cartPrescriptionByVariantId";

type Cache = Record<string, PrescriptionData>;

function read(key: string): Cache {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Cache) : {};
  } catch {
    return {};
  }
}

function write(key: string, data: Cache) {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function setCartItemPrescription(cartItemId: string, prescription: PrescriptionData) {
  const cache = read(STORAGE_KEY);
  cache[cartItemId] = prescription;
  write(STORAGE_KEY, cache);
}

/** Store by productVariantId so checkout can show prescription even if cart item id wasn't available when adding. */
export function setPrescriptionByVariantId(productVariantId: string, prescription: PrescriptionData) {
  const cache = read(STORAGE_KEY_BY_VARIANT);
  cache[productVariantId] = prescription;
  write(STORAGE_KEY_BY_VARIANT, cache);
}

export function getCartItemPrescription(cartItemId: string | undefined): PrescriptionData | undefined {
  if (!cartItemId) return undefined;
  return read(STORAGE_KEY)[cartItemId];
}

export function getPrescriptionByVariantId(productVariantId: string | undefined): PrescriptionData | undefined {
  if (!productVariantId) return undefined;
  return read(STORAGE_KEY_BY_VARIANT)[productVariantId];
}

/** Prescriptions by cart item id; uses variant fallback when id has no prescription. */
export function getCartItemPrescriptions(
  items: Array<{ id: string; productVariantId: string }>
): Record<string, PrescriptionData> {
  const byId = read(STORAGE_KEY);
  const byVariant = read(STORAGE_KEY_BY_VARIANT);
  const out: Record<string, PrescriptionData> = {};
  items.forEach((item) => {
    const prescription = byId[item.id] ?? byVariant[item.productVariantId];
    if (prescription) out[item.id] = prescription;
  });
  return out;
}
