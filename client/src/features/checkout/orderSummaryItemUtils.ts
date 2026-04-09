import type { CartItemDto } from "../../lib/types/cart";

export function cartItemPerUnitEa(item: CartItemDto): number {
  if (item.quantity <= 0) return item.price;
  return (item.subtotal ?? item.price * item.quantity) / item.quantity;
}

export function showRxLensPriceSplit(item: CartItemDto, hasPrescriptionInCache: boolean): boolean {
  return (
    hasPrescriptionInCache &&
    item.hasPrescription &&
    Boolean(
      item.lensVariantId ||
        (item.lensPrice ?? 0) > 0 ||
        (item.coatingExtraPrice ?? 0) > 0,
    )
  );
}
