import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "react-toastify";

import agent from "../api/agent";
import { removeCartItemLocalData } from "../../features/cart/prescriptionCache";
import type { CartDto, CartItemDto, AddCartItemPayload, UpdateCartItemPayload } from "../types/cart";
import {
  addCartItemSchema,
  updateCartItemSchema,
} from "../schemas/cartSchema";
import { useAccount } from "./useAccount";

function getThrownMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (Array.isArray(err)) return err.map(String).join(" ");

  if (isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const rec = data as Record<string, unknown>;
      if (typeof rec.message === "string") return rec.message;
      if (typeof rec.title === "string") return rec.title;
      if (rec.errors && typeof rec.errors === "object") {
        const errs = rec.errors as Record<string, unknown>;
        const parts = Object.values(errs).flatMap((v) =>
          Array.isArray(v) ? v.map(String) : v != null ? [String(v)] : [],
        );
        if (parts.length) return parts.join(" ");
      }
    }
  }

  if (typeof err === "object" && err !== null && "message" in err) {
    const m = (err as { message: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  return "";
}

/** Backend messages when a cart line references a dead SKU / variant. */
function isUnavailableCartLineMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("no longer available") ||
    m.includes("not available") ||
    m.includes("out of stock") ||
    m.includes("discontinued") ||
    (m.includes("variant") && (m.includes("invalid") || m.includes("unavailable")))
  );
}

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

  // Chỉ gọi API cart khi đã đăng nhập thật (có user id) và user-info đã load xong
  const shouldLoadCart = Boolean(currentUser?.id) && !loadingUserInfo;

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
      const res = await agent.get<CartDto>("/me/cart");
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
      // API returns the new line (CartItemDto), not a full cart.
      const res = await agent.post<CartItemDto>("/me/cart/items", parsed.data);
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
      const res = await agent.put<CartDto>(`/me/cart/items/${id}`, { quantity });
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
    onError: (err, variables, context) => {
      const id = variables.id;
      const msg = getThrownMessage(err);
      if (id && isUnavailableCartLineMessage(msg)) {
        const prev = context?.previous;
        const variantId = prev?.items?.find((it) => it.id === id)?.productVariantId;
        removeCartItemLocalData(id, variantId ?? null);

        void (async () => {
          try {
            await agent.delete(`/me/cart/items/${id}`);
          } catch {
            /* ignore — refetch will reconcile */
          }
          queryClient.invalidateQueries({ queryKey: ["cart"] });
        })();

        toast.info("This item is no longer available and was removed from your cart.");
        return;
      }

      if (context?.previous) {
        queryClient.setQueryData(["cart"], context.previous);
      }
      toast.error(msg.trim() ? msg : "Failed to update cart.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // ===== DEL /api/carts/items/{id} ===== (optimistic remove)
  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await agent.delete(`/me/cart/items/${id}`);
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
      await agent.delete("/me/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: unknown) => {
      // Swallow 404 (cart not found) to avoid noisy errors when backend already cleared cart.
      const status =
        typeof error === "object" && error && "response" in error
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).response?.status
          : undefined;
      if (status === 404) return;
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

