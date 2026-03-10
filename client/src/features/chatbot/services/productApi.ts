import agent from "../../../lib/api/agent";

export type ChatbotProduct = {
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

type ProductsApiResponse = {
  items: ChatbotProduct[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

let cachedProducts: ChatbotProduct[] | null = null;

export async function fetchChatbotProducts(): Promise<ChatbotProduct[]> {
  if (cachedProducts) return cachedProducts;

  try {
    const response = await agent.get<ProductsApiResponse>("/products", {
      params: { pageNumber: 1, pageSize: 100 },
    });
    cachedProducts = response.data.items ?? [];
    return cachedProducts;
  } catch (error) {
    console.warn("Chatbot: Could not fetch products from API:", error);
    cachedProducts = [];
    return cachedProducts;
  }
}

export function buildProductsJsonForPrompt(products: ChatbotProduct[]): string {
  const simplified = products.map((p) => ({
    id: p.id,
    name: p.productName,
    brand: p.brand,
    type: p.type,
    description: p.description,
    minPrice: p.minPrice,
    maxPrice: p.maxPrice,
    category: p.category.name,
    image: p.firstImage?.imageUrl ?? "",
    detail_url: `/product/${p.id}`,
  }));
  return JSON.stringify(simplified, null, 2);
}
