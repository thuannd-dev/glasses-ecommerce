// Product Types
export type ProductType = 1 | 2 | 3; // Enum values: 1 = Glasses, 2 = Contact Lens, 3 = Accessories

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  displayOrder: number;
  modelUrl: string | null;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Product {
  id: string;
  productName: string;
  type: ProductType;
  brand: string | null;
  description: string | null;
  minPrice: number;
  maxPrice: number | null;
  totalQuantityAvailable: number;
  firstImage: ProductImage;
  category: ProductCategory;
  status?: string; // Active, Inactive, etc.
  createdDate?: string;
  updatedDate?: string;
}

export interface ProductListResponse {
  items: Product[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ProductFilters {
  pageNumber?: number;
  pageSize?: number;
  categoryIds?: string[];
  brand?: string;
  status?: string;
  type?: ProductType;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: number; // 0 = default, 1 = price asc, 2 = price desc, etc.
  sortOrder?: number; // 0 = asc, 1 = desc
}

export interface CreateProductRequest {
  productName: string;
  type: ProductType;
  brand?: string;
  description?: string;
  minPrice: number;
  maxPrice?: number;
  categoryId: string;
  totalQuantityAvailable: number;
}

export interface UpdateProductRequest extends CreateProductRequest {
  id: string;
  status?: string;
}
