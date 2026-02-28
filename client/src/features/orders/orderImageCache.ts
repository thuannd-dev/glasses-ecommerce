/**
 * Cache ảnh order item từ cart khi place order, để My Orders / Order Detail hiển thị đúng ảnh.
 * Key: orderId -> productVariantId -> imageUrl
 */
const STORAGE_KEY = "orderItemImages";

type Cache = Record<string, Record<string, string>>;

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

/** Lưu ảnh từ cart cho đơn vừa tạo (gọi sau khi place order thành công) */
export function setOrderItemImages(
  orderId: string,
  variantToImage: Record<string, string>
) {
  const cache = read();
  cache[orderId] = { ...cache[orderId], ...variantToImage };
  write(cache);
}

/** Lấy ảnh đã cache theo orderId + productVariantId */
export function getOrderItemImage(
  orderId: string | undefined,
  productVariantId: string | undefined
): string | undefined {
  if (!orderId || !productVariantId) return undefined;
  const cache = read();
  return cache[orderId]?.[productVariantId];
}
