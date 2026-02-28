import type { OrderShippingAddressShape } from "../../lib/types/order";

/**
 * Cache địa chỉ giao hàng từ checkout khi place order, để Order Detail hiển thị đúng địa chỉ khách đã điền.
 */
const STORAGE_KEY = "orderShippingAddresses";

type Cache = Record<string, OrderShippingAddressShape>;

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

/** Lưu địa chỉ giao hàng cho đơn vừa tạo (gọi sau khi place order thành công) */
export function setOrderShippingAddress(
  orderId: string,
  address: OrderShippingAddressShape
) {
  const cache = read();
  cache[orderId] = address;
  write(cache);
}

/** Lấy địa chỉ đã cache theo orderId */
export function getOrderShippingAddress(
  orderId: string | undefined
): OrderShippingAddressShape | undefined {
  if (!orderId) return undefined;
  return read()[orderId];
}
