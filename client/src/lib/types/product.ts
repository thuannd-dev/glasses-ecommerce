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
    isPreOrder: boolean;
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

/** DTO for creating a new product */
export type CreateProductDto = {
  categoryId: string; // Required, GUID
  productName: string; // Required, max 255 chars
  type: number; // 1=Frame, 2=Lens, 3=Combo, 4=Accessory, 5=Service
  description?: string | null; // Optional, max 1000 chars
  brand?: string | null; // Optional, max 100 chars
  status?: number; // 0=Active, 1=Inactive, 2=Draft (default: Draft)
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
  isPreOrder: boolean;
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
    isPreOrder: boolean;
    images: string[];
  }>;
};
