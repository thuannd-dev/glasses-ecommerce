import { useQuery } from "@tanstack/react-query";
import agent from "../api/agent";
import type { ProductDetailApi } from "../types/product";

export function useProductDetail(productId: string | undefined) {
  const {
    data: product,
    isLoading,
    error,
  } = useQuery<ProductDetailApi>({
    queryKey: ["product-detail", productId],
    queryFn: async () => {
      if (!productId) throw new Error("Product ID is required");
      const res = await agent.get<ProductDetailApi>(`/products/${productId}`);
      return res.data;
    },
    enabled: !!productId,
  });

  return { product, isLoading, error };
}
