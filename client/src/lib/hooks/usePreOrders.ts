import { useMemo } from "react";
import { useCart } from "./useCart";
import type { CartItemDto } from "../types/cart";

/**
 * Hook để quản lý Pre-Order items
 * Filter các items có isPreOrder = true từ cart
 */
export function usePreOrders() {
  const { cart } = useCart();

  const preOrderItems = useMemo(() => {
    if (!cart?.items) return [];
    return (cart.items as Array<CartItemDto & { isPreOrder?: boolean }>).filter(
      (item) => item.isPreOrder === true
    );
  }, [cart?.items]);

  const totalQuantity = useMemo(() => {
    return preOrderItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [preOrderItems]);

  const totalAmount = useMemo(() => {
    return preOrderItems.reduce((sum, item) => sum + item.subtotal, 0);
  }, [preOrderItems]);

  return {
    preOrderItems,
    totalQuantity,
    totalAmount,
  };
}
