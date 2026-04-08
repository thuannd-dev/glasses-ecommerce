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
  lensVariantId: z.string().trim().min(1).nullable().optional(),
  selectedCoatingIds: z.array(z.string().trim().min(1)).optional(),
  sphOD: z.number().nullable().optional(),
  cylOD: z.number().nullable().optional(),
  axisOD: z.number().int().nullable().optional(),
  addOD: z.number().nullable().optional(),
  pdOD: z.number().nullable().optional(),
  sphOS: z.number().nullable().optional(),
  cylOS: z.number().nullable().optional(),
  axisOS: z.number().int().nullable().optional(),
  addOS: z.number().nullable().optional(),
  pdOS: z.number().nullable().optional(),
  pd: z.number().nullable().optional(),
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
