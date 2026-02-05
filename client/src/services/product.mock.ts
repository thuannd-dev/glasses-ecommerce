import type { Product, ProductListResponse, ProductFilters } from "./product.types";

const mockProducts: Product[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174001",
    productName: "Ray-Ban Aviator Classic",
    type: 1,
    brand: "Ray-Ban",
    description: "Classic aviator style sunglasses with UV protection",
    minPrice: 129.99,
    maxPrice: 199.99,
    totalQuantityAvailable: 45,
    status: "Active",
    createdDate: "2025-01-15",
    updatedDate: "2025-02-01",
    firstImage: {
      id: "img-001",
      imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop",
      altText: "Ray-Ban Aviator",
      displayOrder: 1,
      modelUrl: null,
    },
    category: {
      id: "cat-001",
      name: "Sunglasses",
      slug: "sunglasses",
      description: "Stylish sunglasses for outdoor use",
    },
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174002",
    productName: "Oakley Holbrook",
    type: 1,
    brand: "Oakley",
    description: "Durable sports sunglasses with polarized lenses",
    minPrice: 149.99,
    maxPrice: 229.99,
    totalQuantityAvailable: 32,
    status: "Active",
    createdDate: "2025-01-20",
    updatedDate: "2025-02-02",
    firstImage: {
      id: "img-002",
      imageUrl: "https://images.unsplash.com/photo-1511499767150-a01a6648e935?w=200&h=200&fit=crop",
      altText: "Oakley Holbrook",
      displayOrder: 1,
      modelUrl: null,
    },
    category: {
      id: "cat-001",
      name: "Sunglasses",
      slug: "sunglasses",
      description: "Stylish sunglasses for outdoor use",
    },
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174003",
    productName: "Tom Ford Black Tie",
    type: 1,
    brand: "Tom Ford",
    description: "Luxury frame glasses for formal occasions",
    minPrice: 199.99,
    maxPrice: 349.99,
    totalQuantityAvailable: 18,
    status: "Active",
    createdDate: "2025-01-25",
    updatedDate: "2025-02-03",
    firstImage: {
      id: "img-003",
      imageUrl: "https://images.unsplash.com/photo-1508296695146-367180be27d7?w=200&h=200&fit=crop",
      altText: "Tom Ford Black Tie",
      displayOrder: 1,
      modelUrl: null,
    },
    category: {
      id: "cat-002",
      name: "Formal Glasses",
      slug: "formal-glasses",
      description: "Premium eyewear for professional settings",
    },
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174004",
    productName: "Acuvue Daily Contact Lens",
    type: 2,
    brand: "Johnson & Johnson",
    description: "Daily disposable contact lenses with moisture technology",
    minPrice: 29.99,
    maxPrice: 49.99,
    totalQuantityAvailable: 120,
    status: "Active",
    createdDate: "2025-02-01",
    updatedDate: "2025-02-04",
    firstImage: {
      id: "img-004",
      imageUrl: "https://images.unsplash.com/photo-1509587891217-51ac28680050?w=200&h=200&fit=crop",
      altText: "Acuvue Daily",
      displayOrder: 1,
      modelUrl: null,
    },
    category: {
      id: "cat-003",
      name: "Contact Lenses",
      slug: "contact-lenses",
      description: "Comfortable contact lenses for daily wear",
    },
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174005",
    productName: "Bausch & Lomb ULTRA",
    type: 2,
    brand: "Bausch & Lomb",
    description: "Monthly contact lenses with high oxygen transmission",
    minPrice: 39.99,
    maxPrice: 59.99,
    totalQuantityAvailable: 85,
    status: "Active",
    createdDate: "2025-02-01",
    updatedDate: "2025-02-04",
    firstImage: {
      id: "img-005",
      imageUrl: "https://images.unsplash.com/photo-1509587891217-51ac28680050?w=200&h=200&fit=crop",
      altText: "Bausch & Lomb ULTRA",
      displayOrder: 1,
      modelUrl: null,
    },
    category: {
      id: "cat-003",
      name: "Contact Lenses",
      slug: "contact-lenses",
      description: "Comfortable contact lenses for daily wear",
    },
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174006",
    productName: "Blue Light Blocking Glasses",
    type: 1,
    brand: "Generic",
    description: "Anti-glare coating for computer use",
    minPrice: 49.99,
    maxPrice: 89.99,
    totalQuantityAvailable: 67,
    status: "Active",
    createdDate: "2025-01-30",
    updatedDate: "2025-02-05",
    firstImage: {
      id: "img-006",
      imageUrl: "https://images.unsplash.com/photo-1577098471364-32c50e32881f?w=200&h=200&fit=crop",
      altText: "Blue Light Blocking",
      displayOrder: 1,
      modelUrl: null,
    },
    category: {
      id: "cat-002",
      name: "Computer Glasses",
      slug: "computer-glasses",
      description: "Specially designed for screen time",
    },
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174007",
    productName: "Designer Sunglasses Case",
    type: 3,
    brand: "Ray-Ban",
    description: "Protective case with soft lining",
    minPrice: 19.99,
    maxPrice: 34.99,
    totalQuantityAvailable: 150,
    status: "Active",
    createdDate: "2025-02-01",
    updatedDate: "2025-02-04",
    firstImage: {
      id: "img-007",
      imageUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=200&h=200&fit=crop",
      altText: "Sunglasses Case",
      displayOrder: 1,
      modelUrl: null,
    },
    category: {
      id: "cat-004",
      name: "Accessories",
      slug: "accessories",
      description: "Eyewear accessories and care products",
    },
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174008",
    productName: "Lens Cleaning Cloth Set",
    type: 3,
    brand: "Generic",
    description: "Microfiber cleaning cloths - pack of 5",
    minPrice: 9.99,
    maxPrice: 19.99,
    totalQuantityAvailable: 200,
    status: "Active",
    createdDate: "2025-02-02",
    updatedDate: "2025-02-04",
    firstImage: {
      id: "img-008",
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop",
      altText: "Cleaning Cloth",
      displayOrder: 1,
      modelUrl: null,
    },
    category: {
      id: "cat-004",
      name: "Accessories",
      slug: "accessories",
      description: "Eyewear accessories and care products",
    },
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174009",
    productName: "Prada Rectangle Frame",
    type: 1,
    brand: "Prada",
    description: "Elegant rectangular frame with premium materials",
    minPrice: 249.99,
    maxPrice: 399.99,
    totalQuantityAvailable: 15,
    status: "Active",
    createdDate: "2025-01-28",
    updatedDate: "2025-02-03",
    firstImage: {
      id: "img-009",
      imageUrl: "https://images.unsplash.com/photo-1517850212624-ba8b0c6e8b3b?w=200&h=200&fit=crop",
      altText: "Prada Rectangle",
      displayOrder: 1,
      modelUrl: null,
    },
    category: {
      id: "cat-002",
      name: "Formal Glasses",
      slug: "formal-glasses",
      description: "Premium eyewear for professional settings",
    },
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174010",
    productName: "Cat Eye Sunglasses",
    type: 1,
    brand: "Gucci",
    description: "Fashionable cat eye design with gradient lenses",
    minPrice: 189.99,
    maxPrice: 299.99,
    totalQuantityAvailable: 28,
    status: "Active",
    createdDate: "2025-02-01",
    updatedDate: "2025-02-05",
    firstImage: {
      id: "img-010",
      imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop",
      altText: "Cat Eye Sunglasses",
      displayOrder: 1,
      modelUrl: null,
    },
    category: {
      id: "cat-001",
      name: "Sunglasses",
      slug: "sunglasses",
      description: "Stylish sunglasses for outdoor use",
    },
  },
];

// Simple in-memory "database"
let products = [...mockProducts];
let nextId = 11;

export const productMockService = {
  getProducts: async (filters: ProductFilters = {}): Promise<ProductListResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...products];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.productName.toLowerCase().includes(searchLower) ||
          p.brand?.toLowerCase().includes(searchLower) ||
          p.category?.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter((p) => p.type === filters.type);
    }

    // Apply brand filter
    if (filters.brand) {
      filtered = filtered.filter((p) =>
        p.brand?.toLowerCase().includes(filters.brand!.toLowerCase())
      );
    }

    // Apply price range filter
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.minPrice >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.maxPrice! <= filters.maxPrice!);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    // Sorting
    if (filters.sortBy === 1) {
      filtered.sort((a, b) => a.minPrice - b.minPrice);
    } else if (filters.sortBy === 2) {
      filtered.sort((a, b) => b.minPrice - a.minPrice);
    }

    // Pagination
    const pageNumber = filters.pageNumber || 1;
    const pageSize = filters.pageSize || 10;
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    const startIndex = (pageNumber - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber < totalPages,
    };
  },

  getProductById: async (id: string): Promise<Product> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const product = products.find((p) => p.id === id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  },

  createProduct: async (data: any): Promise<Product> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newProduct: Product = {
      id: `123e4567-e89b-12d3-a456-42661417400${nextId}`,
      productName: data.productName,
      type: data.type,
      brand: data.brand || null,
      description: data.description || null,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice || null,
      totalQuantityAvailable: data.totalQuantityAvailable,
      status: "Active",
      createdDate: new Date().toISOString().split("T")[0],
      updatedDate: new Date().toISOString().split("T")[0],
      firstImage: {
        id: `img-${nextId}`,
        imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop",
        altText: data.productName,
        displayOrder: 1,
        modelUrl: null,
      },
      category: {
        id: data.categoryId,
        name: "New Category",
        slug: "new-category",
        description: null,
      },
    };

    nextId++;
    products.push(newProduct);
    return newProduct;
  },

  updateProduct: async (data: any): Promise<Product> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = products.findIndex((p) => p.id === data.id);
    if (index === -1) {
      throw new Error("Product not found");
    }

    const updated: Product = {
      ...products[index],
      productName: data.productName,
      type: data.type,
      brand: data.brand || null,
      description: data.description || null,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice || null,
      totalQuantityAvailable: data.totalQuantityAvailable,
      updatedDate: new Date().toISOString().split("T")[0],
    };

    products[index] = updated;
    return updated;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error("Product not found");
    }

    products.splice(index, 1);
  },
};
