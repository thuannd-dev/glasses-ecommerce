import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import agent from "../api/agent";
import {
  addCartItemSchema,
  updateCartItemSchema,
} from "../schemas/cartSchema";
import { useAccount } from "./useAccount";

/**
 * Hook quản lý Cart sử dụng API:
 *
 * - GET    /api/carts          → lấy cart hiện tại
 * - DEL    /api/carts          → xóa toàn bộ cart
 * - POST   /api/carts/items    → thêm item vào cart
 * - PUT    /api/carts/items    → cập nhật item (số lượng, ...)
 * - DEL    /api/carts/items/{id} → xóa 1 item khỏi cart
 */
export function useCart() {
  const queryClient = useQueryClient();
  const { currentUser, loadingUserInfo } = useAccount();

  // Chỉ gọi API cart khi đã đăng nhập và user-info đã load xong
  const shouldLoadCart = !!currentUser && !loadingUserInfo;

  // ===== GET /api/carts =====
  const {
    data: cart,
    isLoading: queryLoading,
    isFetching: queryFetching,
    isError,
    error,
  } = useQuery<CartDto>({
    queryKey: ["cart"],
    enabled: shouldLoadCart,
    queryFn: async () => {
      const res = await agent.get<CartDto>("/carts");
      const data = res.data;
      const items: CartItemDto[] = data.items ?? [];
      const totalQuantity =
        typeof data.totalQuantity === "number"
          ? data.totalQuantity
          : items.reduce((sum, it) => sum + it.quantity, 0);
      const totalAmount =
        typeof data.totalAmount === "number"
          ? data.totalAmount
          : items.reduce((sum, it) => sum + it.subtotal, 0);

      return {
        ...data,
        items,
        totalQuantity,
        totalAmount,
      };
    },
  });

  // ===== POST /api/carts/items =====
  const addItemMutation = useMutation({
    mutationFn: async (payload: AddCartItemPayload) => {
      const parsed = addCartItemSchema.safeParse(payload);
      if (!parsed.success) {
        const msg =
          parsed.error.issues[0]?.message ?? "Invalid cart item payload";
        toast.error(msg);
        throw new Error(msg);
      }
      const res = await agent.post<CartDto>("/carts/items", parsed.data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: () => {
      toast.error("Failed to add item to cart.");
    },
  });

  // ===== PUT /api/carts/items/{id} ===== (optimistic update)
  const updateItemMutation = useMutation({
    mutationFn: async (payload: UpdateCartItemPayload) => {
      const parsed = updateCartItemSchema.safeParse(payload);
      if (!parsed.success) {
        const msg =
          parsed.error.issues[0]?.message ?? "Invalid cart item payload";
        toast.error(msg);
        throw new Error(msg);
      }
      const { id, quantity } = parsed.data;
      const res = await agent.put<CartDto>(`/carts/items/${id}`, { quantity });
      return res.data;
    },
    onMutate: async ({ id, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previous = queryClient.getQueryData<CartDto>(["cart"]);

      if (previous) {
        const prevItems = Array.isArray(previous.items) ? previous.items : [];
        const items = prevItems
          .map((it) =>
            it.id === id
              ? {
                  ...it,
                  quantity,
                  subtotal: it.price * quantity,
                }
              : it,
          )
          .filter((it) => it.quantity > 0);

        const totalQuantity = items.reduce(
          (sum, it) => sum + (it.quantity ?? 0),
          0,
        );
        const totalAmount = items.reduce(
          (sum, it) => sum + (it.subtotal ?? 0),
          0,
        );

        queryClient.setQueryData<CartDto>(["cart"], {
          ...previous,
          items,
          totalQuantity,
          totalAmount,
        });
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["cart"], context.previous);
      }
      toast.error("Failed to update cart.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // ===== DEL /api/carts/items/{id} ===== (optimistic remove)
  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await agent.delete(`/carts/items/${id}`);
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previous = queryClient.getQueryData<CartDto>(["cart"]);

      if (previous) {
        const prevItems = Array.isArray(previous.items) ? previous.items : [];
        const items = prevItems.filter((it) => it.id !== id);
        const totalQuantity = items.reduce(
          (sum, it) => sum + (it.quantity ?? 0),
          0,
        );
        const totalAmount = items.reduce(
          (sum, it) => sum + (it.subtotal ?? 0),
          0,
        );

        queryClient.setQueryData<CartDto>(["cart"], {
          ...previous,
          items,
          totalQuantity,
          totalAmount,
        });
      }

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["cart"], context.previous);
      }
      toast.error("Failed to remove item from cart.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // ===== DEL /api/carts =====
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await agent.delete("/carts");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: () => {
      toast.error("Failed to clear cart.");
    },
  });

  const effectiveCart = shouldLoadCart ? cart : undefined;

  return {
    // state
    cart: effectiveCart,
    isLoading: shouldLoadCart && queryLoading,
    isFetching: shouldLoadCart && queryFetching,
    isError,
    error,

    // mutations & helpers
    addItem: addItemMutation.mutate,
    addItemAsync: addItemMutation.mutateAsync,

    updateItem: updateItemMutation.mutate,
    updateItemAsync: updateItemMutation.mutateAsync,

    removeItem: removeItemMutation.mutate,
    removeItemAsync: removeItemMutation.mutateAsync,

    clearCart: clearCartMutation.mutate,
    clearCartAsync: clearCartMutation.mutateAsync,

    // raw mutation objects nếu bạn cần status chi tiết
    addItemMutation,
    updateItemMutation,
    removeItemMutation,
    clearCartMutation,
  };
}

