import type { PrescriptionData } from "../../lib/types/prescription";

/** Prescriptions per order: orderId -> productVariantId -> PrescriptionData (set when placing order). */
const STORAGE_KEY = "orderPrescriptions";

type Cache = Record<string, Record<string, PrescriptionData>>;

function read(): Cache {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Cache) : {};
  } catch {
    return {};
  }
}

function write(data: Cache) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function setOrderPrescriptions(
  orderId: string,
  byVariant: Record<string, PrescriptionData>
) {
  const cache = read();
  cache[orderId] = byVariant;
  write(cache);
}

export function getOrderPrescription(
  orderId: string | undefined,
  productVariantId: string | undefined
): PrescriptionData | undefined {
  if (!orderId || !productVariantId) return undefined;
  return read()[orderId]?.[productVariantId];
}

export function getOrderPrescriptions(orderId: string | undefined): Record<string, PrescriptionData> {
  if (!orderId) return {};
  return read()[orderId] ?? {};
}
