import { useQuery } from "@tanstack/react-query";
import agent from "../api/agent";
import { productsQueryParamsSchema } from "../schemas/productsQuerySchema";
import type {
  ApiProductItem,
  ProductDetailApi,
  ProductsApiResponse,
  CategoryDto,
  ProductDetailView,
  ProductsQueryParams,
} from "../types/product";
import type { Product } from "../types/collections";

// Chuyển 1 item từ API (productName, category.slug...) sang dạng Product dùng ở UI (name, category, glassesType)
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

// Chuyển response chi tiết sản phẩm từ API sang dạng view (ảnh đã sort, mainVariant, giá từ variant)
function mapDetailApiToView(api: ProductDetailApi): ProductDetailView {
  const apiImages = Array.isArray(api.images) ? api.images : [];
  const apiVariants = Array.isArray(api.variants) ? api.variants : [];

  const sortedProductImages = apiImages
    .slice()
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const heroUrl = sortedProductImages[0]?.imageUrl;
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

// Chuẩn hóa params (validate bằng schema) rồi bỏ vào object chỉ chứa field có giá trị để gửi query string
function buildProductsParams(params: ProductsQueryParams): Record<string, unknown> {
  const parsed = productsQueryParamsSchema.safeParse(params);
  const p = parsed.success ? parsed.data : {};
  const result: Record<string, unknown> = {};
  if (p.pageNumber != null) result.pageNumber = p.pageNumber;
  if (p.pageSize != null) result.pageSize = p.pageSize;
  if (p.categoryIds?.length) result.categoryIds = p.categoryIds;
  if (p.brand != null && p.brand !== "") result.brand = p.brand;
  if (p.status != null && p.status !== "") result.status = p.status;
  if (p.type != null && p.type !== "") result.type = p.type;
  if (p.minPrice != null) result.minPrice = p.minPrice;
  if (p.maxPrice != null) result.maxPrice = p.maxPrice;
  if (p.search != null && p.search !== "") result.search = p.search;
  if (p.sortBy != null) result.sortBy = p.sortBy;
  if (p.sortOrder != null) result.sortOrder = p.sortOrder;
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
    queryKey: ["products", queryParams], // params đổi thì queryKey đổi → tự gọi lại API
    enabled: options?.enabled !== false, // false thì không gọi (vd. chưa chọn type)
    queryFn: async () => {
      const response = await agent.get<ProductsApiResponse>("/products", {
        params: queryParams,
      });
      const data = response.data;
      const rawItems = data?.items;
      const items = Array.isArray(rawItems)
        ? rawItems.map(mapApiItemToProduct) // map từng item API → Product
        : [];
      return { ...data, items };
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

export function useBrands() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await agent.get<string[]>("/brands");
      return response.data;
    },
  });

  return {
    brands: Array.isArray(data) ? data : [],
    isLoading,
    isError,
    error,
  };
}

export function useProductDetail(id?: string) {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["product", id], // id đổi thì gọi lại
    enabled: !!id, // không gọi khi chưa có id
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
