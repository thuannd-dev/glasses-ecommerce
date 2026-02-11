import z from "zod";

/** Payload thêm item vào giỏ – validate trước khi gọi POST /api/carts/items */
export const addCartItemSchema = z.object({
  productVariantId: z
    .string({ message: "Product variant ID is required" })
    .trim()
    .min(1, { message: "Product variant ID is invalid" }),
  quantity: z
    .number({ message: "Quantity must be a number" })
    .int("Quantity must be an integer")
    .min(1, { message: "Quantity must be greater than 0" }),
});

/** Payload cập nhật số lượng item – validate trước khi gọi PUT /api/carts/items/{id} */
export const updateCartItemSchema = z.object({
  id: z
    .string({ message: "Cart item ID is required" })
    .trim()
    .min(1, { message: "Cart item ID is invalid" }),
  quantity: z
    .number({ message: "Quantity must be a number" })
    .int("Quantity must be an integer")
    .min(0, { message: "Quantity cannot be negative" }),
});

export type AddCartItemSchema = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemSchema = z.infer<typeof updateCartItemSchema>;
