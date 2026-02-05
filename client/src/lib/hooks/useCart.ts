import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import agent from "../api/agent";
import { useAccount } from "./useAccount";

export interface CartItemDto {
  id: string;
  cartId: string;
  productVariantId: string;
  quantity: number;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  color: string | null;
  size: string | null;
  material: string | null;
  quantityAvailable: number;
  isInStock: boolean;
  productId: string;
  productName: string;
  productImageUrl: string;
  subtotal: number;
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  totalQuantity: number;
  totalAmount: number;
}

// Payload cho các mutation.
// POST /api/carts/items đã dùng body { productVariantId, quantity }
export type AddCartItemPayload = {
  productVariantId: string;
  quantity: number;
};

// PUT /api/carts/items/{id} dùng body { quantity }
export type UpdateCartItemPayload = {
  id: string;
  quantity: number;
};

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
      const res = await agent.post<CartDto>("/carts/items", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: () => {
      toast.error("Không thêm được sản phẩm vào giỏ hàng.");
    },
  });

  // ===== PUT /api/carts/items/{id} ===== (optimistic update)
  const updateItemMutation = useMutation({
    mutationFn: async (payload: UpdateCartItemPayload) => {
      const { id, quantity } = payload;
      const res = await agent.put<CartDto>(`/carts/items/${id}`, { quantity });
      return res.data;
    },
    onMutate: async ({ id, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previous = queryClient.getQueryData<CartDto>(["cart"]);

      if (previous) {
        const items = previous.items
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
      toast.error("Không cập nhật được giỏ hàng.");
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
        const items = previous.items.filter((it) => it.id !== id);
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
      toast.error("Không xóa được sản phẩm khỏi giỏ hàng.");
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
      toast.error("Không xóa được giỏ hàng.");
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

