import { useQuery } from "@tanstack/react-query";
import agent from "../api/agent";
import type { Product } from "../../features/collections/types";

/** Item trả về từ GET /api/products (list) */
export interface ApiProductItem {
  id: string;
  productName: string;
  type: string | number;
  brand: string;
  description: string | null;
  minPrice: number;
  maxPrice: number;
  totalQuantityAvailable: number;
  firstImage: {
    id: string;
    imageUrl: string;
    altText: string | null;
    displayOrder: number;
    modelUrl: string | null;
  } | null;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };
}

/** Item trả về từ GET /api/products/{id} (detail) */
export interface ProductDetailApi {
  id: string;
  productName: string;
  type: number;
  description: string | null;
  brand: string | null;
  status: number;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };
  variants: Array<{
    id: string;
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
    isActive: boolean;
    quantityAvailable: number;
    images: Array<{
      id: string;
      imageUrl: string;
      altText: string | null;
      displayOrder: number;
      modelUrl: string | null;
    }>;
  }>;
  images: Array<{
    id: string;
    imageUrl: string;
    altText: string | null;
    displayOrder: number;
    modelUrl: string | null;
  }>;
}

/** Response shape từ GET /api/products (list) */
export interface ProductsApiResponse {
  items: ApiProductItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

/** Category từ GET /api/categories */
export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

function mapApiItemToProduct(item: ApiProductItem): Product {
  const categorySlug = item.category?.slug ?? "";
  const category: Product["category"] =
    categorySlug === "eyeglasses" || categorySlug === "sunglasses"
      ? "glasses"
      : categorySlug === "lens"
        ? "lens"
        : categorySlug === "fashion"
          ? "fashion"
          : "glasses";

  return {
    id: item.id,
    name: item.productName,
    brand: item.brand,
    price: item.minPrice,
    image: item.firstImage?.imageUrl ?? "",
    code: item.productName,
    category,
    glassesType:
      categorySlug === "eyeglasses"
        ? "eyeglasses"
        : categorySlug === "sunglasses"
          ? "sunglasses"
          : undefined,
  };
}

/** View model chi tiết dùng cho ProductDetailPage */
export interface ProductDetailView {
  id: string;
  name: string;
  brand: string | null;
  description: string | null;
  status: string;
  createdAt: string;
  categoryName: string;
  categorySlug: string;
  categoryDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  color: string | null;
  size: string | null;
  material: string | null;
  frameWidth: number | null;
  lensWidth: number | null;
  bridgeWidth: number | null;
  templeLength: number | null;
  quantityAvailable: number;
  images: string[];
  variants: Array<{
    id: string;
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
    quantityAvailable: number;
    images: string[];
  }>;
}

function mapDetailApiToView(api: ProductDetailApi): ProductDetailView {
  const apiImages = Array.isArray(api.images) ? api.images : [];
  const apiVariants = Array.isArray(api.variants) ? api.variants : [];

  // Sắp xếp ảnh sản phẩm theo displayOrder để lấy ảnh hero ổn định
  const sortedProductImages = apiImages
    .slice()
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const heroUrl = sortedProductImages[0]?.imageUrl;

  // Ưu tiên chọn variant có ảnh trùng với heroUrl,
  // nếu không có thì fallback isActive hoặc variant đầu tiên
  const mainVariant =
    (heroUrl &&
      apiVariants.find((v) =>
        Array.isArray(v.images)
          ? v.images.some((img) => img.imageUrl === heroUrl)
          : false,
      )) ||
    apiVariants.find((v) => v.isActive) ||
    apiVariants[0];

  const price = mainVariant?.price ?? 0;

  // Sắp xếp ảnh của mainVariant theo displayOrder trước khi map ra URL
  const variantImages = Array.isArray(mainVariant?.images)
    ? mainVariant.images
        .slice()
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .map((img) => img.imageUrl)
    : [];

  const productImages = sortedProductImages.map((img) => img.imageUrl);
  const images = [...variantImages, ...productImages];

  const variantsMapped = apiVariants.map((v) => ({
    id: v.id,
    sku: v.sku,
    variantName: v.variantName,
    color: v.color,
    size: v.size,
    material: v.material,
    frameWidth: v.frameWidth,
    lensWidth: v.lensWidth,
    bridgeWidth: v.bridgeWidth,
    templeLength: v.templeLength,
    price: v.price,
    compareAtPrice: v.compareAtPrice,
    quantityAvailable: v.quantityAvailable,
    images: Array.isArray(v.images)
      ? v.images
          .slice()
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .map((img) => img.imageUrl)
      : [],
  }));

  // Đảm bảo mainVariant luôn đứng đầu danh sách variants
  const variants =
    mainVariant?.id
      ? [...variantsMapped].sort((a, b) =>
          a.id === mainVariant!.id ? -1 : b.id === mainVariant!.id ? 1 : 0,
        )
      : variantsMapped;

  return {
    id: api.id,
    name: api.productName,
    brand: api.brand,
    description: api.description,
    status: String(api.status),
    createdAt: api.createdAt,
    categoryName: api.category.name,
    categorySlug: api.category.slug,
    categoryDescription: api.category.description,
    price,
    compareAtPrice: mainVariant?.compareAtPrice ?? null,
    sku: mainVariant?.sku ?? "",
    color: mainVariant?.color ?? null,
    size: mainVariant?.size ?? null,
    material: mainVariant?.material ?? null,
    frameWidth: mainVariant?.frameWidth ?? null,
    lensWidth: mainVariant?.lensWidth ?? null,
    bridgeWidth: mainVariant?.bridgeWidth ?? null,
    templeLength: mainVariant?.templeLength ?? null,
    quantityAvailable: mainVariant?.quantityAvailable ?? 0,
    images,
    variants,
  };
}

function buildProductsParams(params: ProductsQueryParams): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (params.pageNumber != null) result.pageNumber = params.pageNumber;
  if (params.pageSize != null) result.pageSize = params.pageSize;
  if (params.categoryIds?.length) result.categoryIds = params.categoryIds;
  if (params.brand != null && params.brand !== "") result.brand = params.brand;
  if (params.status != null && params.status !== "") result.status = params.status;
  if (params.type != null && params.type !== "") result.type = params.type;
  if (params.minPrice != null) result.minPrice = params.minPrice;
  if (params.maxPrice != null) result.maxPrice = params.maxPrice;
  if (params.search != null && params.search !== "") result.search = params.search;
  if (params.sortBy != null) result.sortBy = params.sortBy;
  if (params.sortOrder != null) result.sortOrder = params.sortOrder;
  return result;
}

export function useProducts(
  params: ProductsQueryParams = {},
  options?: { enabled?: boolean },
) {
  const queryParams = buildProductsParams(params);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products", queryParams],
    enabled: options?.enabled !== false,
    queryFn: async () => {
      const response = await agent.get<ProductsApiResponse>("/products", {
        params: queryParams,
      });
      const data = response.data;
      const rawItems = data?.items;
      const items = Array.isArray(rawItems)
        ? rawItems.map(mapApiItemToProduct)
        : [];
      return {
        ...data,
        items,
      };
    },
  });

  const products = Array.isArray(data?.items) ? data.items : [];

  return {
    products,
    totalCount: data?.totalCount ?? 0,
    pageNumber: data?.pageNumber ?? params.pageNumber ?? 1,
    pageSize: data?.pageSize ?? params.pageSize ?? 10,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}

/** Lấy danh sách category từ GET /api/categories */
export function useCategories() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await agent.get<CategoryDto[]>("/categories");
      return response.data;
    },
  });

  return {
    categories: Array.isArray(data) ? data : [],
    isLoading,
    isError,
    error,
  };
}

/** Lấy chi tiết sản phẩm từ GET /api/products/{id} */
export function useProductDetail(id?: string) {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["product", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await agent.get<ProductDetailApi>(`/products/${id}`);
      return mapDetailApiToView(response.data);
    },
  });

  return {
    product: data,
    isLoading,
    isError,
    error,
  };
}
