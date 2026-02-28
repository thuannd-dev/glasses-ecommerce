/** Query params for GET /api/products */
export type ProductsQueryParams = {
  /** Default: 1 */
  pageNumber?: number;
  /** Default: 10 */
  pageSize?: number;
  categoryIds?: string[] | null;
  brand?: string | null;
  status?: string | null;
  type?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  search?: string | null;
  /** Default: 0 */
  sortBy?: number;
  /** Default: 1 */
  sortOrder?: number;
};

/** Products & categories DTOs used by /api/products and /api/categories */
export type ApiProductItem = {
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
};

export type ProductDetailApi = {
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
};

export type ProductsApiResponse = {
  items: ApiProductItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
};

export type CategoryDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

/** View model for product detail page */
export type ProductDetailView = {
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
};
