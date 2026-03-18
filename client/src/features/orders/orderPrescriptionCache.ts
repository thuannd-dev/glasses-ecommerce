import type { PrescriptionData } from "../../lib/types/prescription";

/** Prescriptions per order: orderId -> orderItemId -> PrescriptionData (set when placing order). */
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
  byOrderItem: Record<string, PrescriptionData>
) {
  const cache = read();
  cache[orderId] = byOrderItem;
  write(cache);
}

export function getOrderPrescription(
  orderId: string | undefined,
  orderItemId: string | undefined
): PrescriptionData | undefined {
  if (!orderId || !orderItemId) return undefined;
  return read()[orderId]?.[orderItemId];
}

export function getOrderPrescriptions(orderId: string | undefined): Record<string, PrescriptionData> {
  if (!orderId) return {};
  return read()[orderId] ?? {};
}
