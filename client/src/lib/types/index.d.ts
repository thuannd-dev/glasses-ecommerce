type Activity = {
  id: string;
  title: string;
  date: Date;
  description: string;
  category: string;
  isCancelled: boolean;
  city: string;
  venue: string;
  latitude: number;
  longitude: number;
  attendees: Profile[];
  //check current user is attendees of an activity
  isGoing: boolean;
  isHost: boolean;
  hostId: string;
  hostDisplayName: string;
};

type Profile = {
  id: string;
  displayName: string;
  bio?: string;
  imageUrl?: string;
};

type User = {
  id: string;
  email: string;
  displayName: string;
  imageUrl?: string;
  roles?: string[];
};

type LocationIQSuggestion = {
  place_id: string;
  osm_id: string;
  osm_type: string;
  licence: string;
  lat: string;
  lon: string;
  boundingbox: string[];
  class: string;
  type: string;
  display_name: string;
  display_place: string;
  display_address: string;
  address: LocationIQAddress;
};

type LocationIQAddress = {
  name: string;
  house_number: string;
  road: string;
  suburb?: string;
  town?: string;
  village?: string;
  city?: string;
  county: string;
  state: string;
  postcode: string;
  country: string;
  country_code: string;
  neighbourhood?: string;
};

/** Query params for GET /api/products */
type ProductsQueryParams = {
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

/** Cart DTOs used by /api/carts endpoints */
type CartItemDto = {
  id: string;
  cartId: string;
  productVariantId: string;
  quantity: number;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  color: string | null;
  size: string | null;
  material: string | null;
  quantityAvailable: number;
  isInStock: boolean;
  productId: string;
  productName: string;
  productImageUrl: string;
  subtotal: number;
};

type CartDto = {
  id: string;
  items: CartItemDto[];
  totalQuantity: number;
  totalAmount: number;
};

type AddCartItemPayload = {
  /** Product variant ID to add to cart */
  productVariantId: string;
  /** Quantity to add */
  quantity: number;
};

type UpdateCartItemPayload = {
  /** Cart item ID */
  id: string;
  /** New quantity */
  quantity: number;
};

/** Products & categories DTOs used by /api/products and /api/categories */
type ApiProductItem = {
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

type ProductDetailApi = {
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

type ProductsApiResponse = {
  items: ApiProductItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
};

type CategoryDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

/** View model for product detail page */
type ProductDetailView = {
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
