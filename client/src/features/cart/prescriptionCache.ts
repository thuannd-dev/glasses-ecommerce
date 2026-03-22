import type { PrescriptionData } from "../../lib/types/prescription";
import type { CartLensMode } from "../../lib/types/lensSelection";

/** Cache prescription by cart item id (set after adding to cart with prescription). */
const STORAGE_KEY = "cartItemPrescriptions";
/** Fallback: prescription by productVariantId (same tab/session). */
const STORAGE_KEY_BY_VARIANT = "cartPrescriptionByVariantId";
const STORAGE_KEY_LENS_MODE = "cartItemLensMode";

type Cache = Record<string, PrescriptionData>;
type LensModeCache = Record<string, CartLensMode>;

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

function readLensModes(): LensModeCache {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_LENS_MODE);
    return raw ? (JSON.parse(raw) as LensModeCache) : {};
  } catch {
    return {};
  }
}

function writeLensModes(data: LensModeCache) {
  try {
    sessionStorage.setItem(STORAGE_KEY_LENS_MODE, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function removeCartItemPrescriptionEntry(cartItemId: string) {
  const cache = read(STORAGE_KEY);
  delete cache[cartItemId];
  write(STORAGE_KEY, cache);
}

export function setCartItemLensMode(cartItemId: string, mode: CartLensMode) {
  const cache = readLensModes();
  cache[cartItemId] = mode;
  writeLensModes(cache);
  if (mode === "non-prescription") {
    removeCartItemPrescriptionEntry(cartItemId);
  }
}

/** Explicit lens mode; if unset but prescription exists in cache, treated as prescription. */
export function getCartItemLensMode(cartItemId: string | undefined): CartLensMode | undefined {
  if (!cartItemId) return undefined;
  const byMode = readLensModes()[cartItemId];
  if (byMode) return byMode;
  if (read(STORAGE_KEY)[cartItemId]) return "prescription";
  return undefined;
}

export function setCartItemPrescription(cartItemId: string, prescription: PrescriptionData) {
  const cache = read(STORAGE_KEY);
  cache[cartItemId] = prescription;
  write(STORAGE_KEY, cache);
  const lensModes = readLensModes();
  lensModes[cartItemId] = "prescription";
  writeLensModes(lensModes);
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
