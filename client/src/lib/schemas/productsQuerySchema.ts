import z from "zod";

/** Schema validate/sanitize query params cho GET /api/products */
export const productsQueryParamsSchema = z
  .object({
    pageNumber: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional(),
    categoryIds: z
      .union([z.array(z.string()), z.string().transform((s) => (s ? [s] : []))])
      .optional()
      .nullable(),
    brand: z.string().trim().optional().nullable(),
    status: z.union([z.string(), z.number()]).optional().nullable(),
    type: z.union([z.string(), z.number()]).optional().nullable(),
    minPrice: z.coerce.number().min(0).optional().nullable(),
    maxPrice: z.coerce.number().min(0).optional().nullable(),
    search: z.string().trim().optional().nullable(),
    sortBy: z.coerce.number().int().min(0).optional(),
    sortOrder: z.coerce.number().int().min(0).optional(),
  })
  .refine(
    (data) => {
      const min = data.minPrice ?? 0;
      const max = data.maxPrice;
      if (max != null && min > max) return false;
      return true;
    },
    { message: "Min price cannot be greater than max price" },
  );

export type ProductsQueryParamsSchema = z.infer<
  typeof productsQueryParamsSchema
>;
