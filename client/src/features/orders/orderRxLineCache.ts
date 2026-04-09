import type { CartLensLineDisplayMeta } from "../../lib/types/lensSelection";

/** RX line pricing + lens labels at checkout time (order item ids differ from cart ids). */
export type OrderRxLineSnapshot = {
  framePrice: number;
  lensPrice: number;
  coatingExtraPrice: number;
  lensVariantName?: string | null;
  lensDisplay?: CartLensLineDisplayMeta | null;
};

const STORAGE_KEY = "orderRxLineSnapshots";

type Cache = Record<string, Record<string, OrderRxLineSnapshot>>;

function read(): Cache {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          localStorage.setItem(STORAGE_KEY, raw);
        } catch {
          // quota or disabled
        }
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
    return raw ? (JSON.parse(raw) as Cache) : {};
  } catch {
    return {};
  }
}

function write(data: Cache) {
  const s = JSON.stringify(data);
  try {
    localStorage.setItem(STORAGE_KEY, s);
  } catch {
    try {
      sessionStorage.setItem(STORAGE_KEY, s);
    } catch {
      // ignore
    }
  }
}

export function setOrderRxLineSnapshots(orderId: string, byOrderItem: Record<string, OrderRxLineSnapshot>) {
  const cache = read();
  cache[orderId] = byOrderItem;
  write(cache);
}

export function getOrderRxLineSnapshot(
  orderId: string | undefined,
  orderItemId: string | undefined,
): OrderRxLineSnapshot | undefined {
  if (!orderId || !orderItemId) return undefined;
  return read()[orderId]?.[orderItemId];
}
