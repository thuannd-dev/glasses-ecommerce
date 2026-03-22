import type { PrescriptionData } from "../../lib/types/prescription";
import type { CartLensMode } from "../../lib/types/lensSelection";

/** Cache prescription by cart item id (set after adding to cart with prescription). */
const STORAGE_KEY = "cartItemPrescriptions";
/** Fallback: prescription by productVariantId. */
const STORAGE_KEY_BY_VARIANT = "cartPrescriptionByVariantId";
const STORAGE_KEY_LENS_MODE = "cartItemLensMode";

/**
 * Dùng localStorage (không phải sessionStorage) để cùng origin chia sẻ giữa các tab.
 * sessionStorage tách theo tab nên mở /cart tab mới sẽ mất prescription đã lưu ở tab khác.
 */
function getItem(key: string): string | null {
  try {
    const fromLocal = localStorage.getItem(key);
    if (fromLocal != null) return fromLocal;
    const legacy = sessionStorage.getItem(key);
    if (legacy != null) {
      localStorage.setItem(key, legacy);
      sessionStorage.removeItem(key);
    }
    return legacy;
  } catch {
    return null;
  }
}

function setItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

type Cache = Record<string, PrescriptionData>;
type LensModeCache = Record<string, CartLensMode>;

function read(key: string): Cache {
  try {
    const raw = getItem(key);
    return raw ? (JSON.parse(raw) as Cache) : {};
  } catch {
    return {};
  }
}

function write(key: string, data: Cache) {
  setItem(key, JSON.stringify(data));
}

function readLensModes(): LensModeCache {
  try {
    const raw = getItem(STORAGE_KEY_LENS_MODE);
    return raw ? (JSON.parse(raw) as LensModeCache) : {};
  } catch {
    return {};
  }
}

function writeLensModes(data: LensModeCache) {
  setItem(STORAGE_KEY_LENS_MODE, JSON.stringify(data));
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
