import agent from "../lib/api/agent";
import type {
  ProductListResponse,
  ProductFilters,
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "./product.types";

const apiUrl = "/api/products";

export const productService = {
  // Get all products with filters
  getProducts: async (filters: ProductFilters = {}): Promise<ProductListResponse> => {
    const params = new URLSearchParams();

    if (filters.pageNumber) params.append("pageNumber", filters.pageNumber.toString());
    if (filters.pageSize) params.append("pageSize", filters.pageSize.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.brand) params.append("brand", filters.brand);
    if (filters.status) params.append("status", filters.status);
    if (filters.type) params.append("type", filters.type.toString());
    if (filters.minPrice !== undefined) params.append("minPrice", filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append("maxPrice", filters.maxPrice.toString());
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      filters.categoryIds.forEach((id) => params.append("categoryIds", id));
    }
    if (filters.sortBy !== undefined) params.append("sortBy", filters.sortBy.toString());
    if (filters.sortOrder !== undefined) params.append("sortOrder", filters.sortOrder.toString());

    const queryString = params.toString();
    const url = queryString ? `${apiUrl}?${queryString}` : apiUrl;

    const response = await agent.get<ProductListResponse>(url);
    return response.data;
  },

  // Get product by ID
  getProductById: async (id: string): Promise<Product> => {
    const response = await agent.get<Product>(`${apiUrl}/${id}`);
    return response.data;
  },

  // Create new product
  createProduct: async (request: CreateProductRequest): Promise<Product> => {
    const response = await agent.post<Product>(apiUrl, request);
    return response.data;
  },

  // Update product
  updateProduct: async (request: UpdateProductRequest): Promise<Product> => {
    const response = await agent.put<Product>(`${apiUrl}/${request.id}`, request);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id: string): Promise<void> => {
    await agent.delete(`${apiUrl}/${id}`);
  },
};
