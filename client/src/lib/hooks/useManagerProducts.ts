import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";

export interface ProductListItem {
  id: string;
  productName: string;
  type: string;
  brand: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  totalQuantityAvailable: number;
  firstImage: {
    id: string;
    imageUrl: string;
    altText: string;
  } | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProductsResponse {
  items: ProductListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetProductsParams {
  pageNumber?: number;
  pageSize?: number;
  categoryIds?: string[];
  brand?: string;
  search?: string;
  status?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: number;
  sortOrder?: number;
}

const SORT_BY_MAP: Record<number, string> = {
  0: "CreatedAt",
  1: "Price",
  2: "Name",
};

const SORT_ORDER_MAP: Record<number, string> = {
  0: "Asc",
  1: "Desc",
};

export type AddProductImageDto = {
  imageUrl: string;
  altText: string | null;
  displayOrder: number;
  modelUrl: string | null;
};

export type DeleteProductImageDto = {
  productId: string;
  imageId: string;
};

export type CreateProductVariantDto = {
  sku: string;
  variantName: string | null;
  color: string | null;
  size: string | null;
  material: string | null;
  frameWidth: number | null;
  lensWidth: number | null;
  bridgeWidth: number | null;
  templeLength: number | null;
  price: number;
  compareAtPrice: number | null;
  isPreOrder: boolean;
};

export type AddVariantImageDto = {
  imageUrl: string;
  altText: string | null;
  displayOrder: number;
  modelUrl: string | null;
};

export type UpdateVariantPreorderDto = {
  productId: string;
  variantId: string;
  isPreOrder: boolean;
};

export type UpdateProductVariantDto = {
  productId: string;
  variantId: string;
  variant: {
    sku?: string | null;
    variantName?: string | null;
    color?: string | null;
    size?: string | null;
    material?: string | null;
    frameWidth?: number | null;
    lensWidth?: number | null;
    bridgeWidth?: number | null;
    templeLength?: number | null;
    price?: number | null;
    compareAtPrice?: number | null;
    isActive?: boolean | null;
  };
};

/** Hook để fetch và manage products cho Manager */
export function useManagerProducts(params?: GetProductsParams) {
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery<ProductsResponse>({
    queryKey: ["manager-products", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.pageNumber) queryParams.append("pageNumber", params.pageNumber.toString());
      if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
      if (params?.categoryIds?.length) {
        params.categoryIds.filter(Boolean).forEach((id) => queryParams.append("categoryIds", id));
      }
      if (params?.brand) queryParams.append("brand", params.brand);
      if (params?.search) queryParams.append("search", params.search);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.type) queryParams.append("type", params.type);
      if (params?.minPrice !== undefined) queryParams.append("minPrice", params.minPrice.toString());
      if (params?.maxPrice !== undefined) queryParams.append("maxPrice", params.maxPrice.toString());
      if (params?.sortBy !== undefined) {
        queryParams.append("sortBy", SORT_BY_MAP[params.sortBy] ?? params.sortBy.toString());
      }
      if (params?.sortOrder !== undefined) {
        queryParams.append("sortOrder", SORT_ORDER_MAP[params.sortOrder] ?? params.sortOrder.toString());
      }

      const res = await agent.get<ProductsResponse>(
        `/products?${queryParams.toString()}`
      );
      return res.data;
    },
  });

  // Mutation: Delete product (soft delete)
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await agent.delete(`/manager/products/${productId}`);
    },
    onSuccess: async (_data, productId) => {
      queryClient.setQueriesData(
        { queryKey: ["manager-products"], exact: false },
        (old: ProductsResponse | undefined) => {
          if (!old) return old;
          const nextItems = Array.isArray(old.items) ? old.items.filter((p) => p.id !== productId) : [];
          return {
            ...old,
            items: nextItems,
            totalCount: Math.max(0, (old.totalCount ?? nextItems.length) - 1),
          };
        }
      );

      await queryClient.invalidateQueries({ queryKey: ["manager-products"] });
    },
  });

  // Mutation: Update product
  const updateProductMutation = useMutation({
    mutationFn: async (data: { id: string; productData: Record<string, unknown> }) => {
      await agent.put(`/manager/products/${data.id}`, data.productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-products"] });
    },
  });

  // Mutation: Add product image
  const addProductImageMutation = useMutation({
    mutationFn: async (data: { productId: string; image: AddProductImageDto }) => {
      await agent.post(`/manager/products/${data.productId}/images`, data.image);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["product-detail", variables.productId] });
      await queryClient.invalidateQueries({ queryKey: ["manager-product-detail", variables.productId] });
    },
  });

  // Mutation: Delete product image
  const deleteProductImageMutation = useMutation({
    mutationFn: async (data: DeleteProductImageDto) => {
      await agent.delete(`/manager/products/${data.productId}/images/${data.imageId}`);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["product-detail", variables.productId] });
      await queryClient.invalidateQueries({ queryKey: ["manager-product-detail", variables.productId] });
    },
  });

  // Mutation: Create product variant
  const createProductVariantMutation = useMutation({
    mutationFn: async (data: { productId: string; variant: CreateProductVariantDto }) => {
      const res = await agent.post<string>(`/manager/products/${data.productId}/variants`, data.variant);
      return res.data;
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["product-detail", variables.productId] });
      await queryClient.invalidateQueries({ queryKey: ["manager-product-detail", variables.productId] });
    },
  });

  // Mutation: Add variant image
  const addVariantImageMutation = useMutation({
    mutationFn: async (data: { productId: string; variantId: string; image: AddVariantImageDto }) => {
      await agent.post(
        `/manager/products/${data.productId}/variants/${data.variantId}/images`,
        data.image
      );
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["product-detail", variables.productId] });
      await queryClient.invalidateQueries({ queryKey: ["manager-product-detail", variables.productId] });
    },
  });

  // Mutation: Update variant preorder
  const updateVariantPreorderMutation = useMutation({
    mutationFn: async (data: UpdateVariantPreorderDto) => {
      await agent.patch(`/manager/products/${data.productId}/variants/${data.variantId}/preorder`, {
        isPreOrder: data.isPreOrder,
      });
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["product-detail", variables.productId] });
      await queryClient.invalidateQueries({ queryKey: ["manager-product-detail", variables.productId] });
    },
  });

  // Mutation: Update product variant
  const updateProductVariantMutation = useMutation({
    mutationFn: async (data: UpdateProductVariantDto) => {
      await agent.put(`/manager/products/${data.productId}/variants/${data.variantId}`, data.variant);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["product-detail", variables.productId] });
      await queryClient.invalidateQueries({ queryKey: ["manager-product-detail", variables.productId] });
    },
  });

  // Mutation: Reorder product images
  const reorderProductImagesMutation = useMutation({
    mutationFn: async (data: { productId: string; imageIds: string[] }) => {
      await agent.put(`/manager/products/${data.productId}/images/reorder`, {
        imageIds: data.imageIds,
      });
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["product-detail", variables.productId] });
      await queryClient.invalidateQueries({ queryKey: ["manager-product-detail", variables.productId] });
    },
  });

  // Mutation: Reorder variant images
  const reorderVariantImagesMutation = useMutation({
    mutationFn: async (data: { productId: string; variantId: string; imageIds: string[] }) => {
      await agent.put(
        `/manager/products/${data.productId}/variants/${data.variantId}/images/reorder`,
        { imageIds: data.imageIds }
      );
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["product-detail", variables.productId] });
      await queryClient.invalidateQueries({ queryKey: ["manager-product-detail", variables.productId] });
    },
  });

  return {
    products: response?.items || [],
    totalCount: response?.totalCount || 0,
    pageNumber: response?.pageNumber || 1,
    pageSize: response?.pageSize || 10,
    totalPages: response?.totalPages || 1,
    isLoading,
    error,
    deleteProduct: deleteProductMutation.mutateAsync,
    isDeleting: deleteProductMutation.isPending,
    updateProduct: updateProductMutation.mutateAsync,
    isUpdating: updateProductMutation.isPending,
    addProductImage: addProductImageMutation.mutateAsync,
    isAddingImage: addProductImageMutation.isPending,
    deleteProductImage: deleteProductImageMutation.mutateAsync,
    isDeletingImage: deleteProductImageMutation.isPending,
    createProductVariant: createProductVariantMutation.mutateAsync,
    isCreatingVariant: createProductVariantMutation.isPending,
    addVariantImage: addVariantImageMutation.mutateAsync,
    isAddingVariantImage: addVariantImageMutation.isPending,
    updateVariantPreorder: updateVariantPreorderMutation.mutateAsync,
    isUpdatingVariantPreorder: updateVariantPreorderMutation.isPending,
    updateVariant: updateProductVariantMutation.mutateAsync,
    isUpdatingVariant: updateProductVariantMutation.isPending,
    reorderProductImages: reorderProductImagesMutation.mutateAsync,
    isReorderingProductImages: reorderProductImagesMutation.isPending,
    reorderVariantImages: reorderVariantImagesMutation.mutateAsync,
    isReorderingVariantImages: reorderVariantImagesMutation.isPending,
  };
}
