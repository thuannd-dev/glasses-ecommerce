export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  price: number;
  stock: number;
  sku: string;
  image?: string;
}

export interface ProductData {
  name: string;
  category: string;
  brand: string;
  description: string;
  basePrice: number;
  sku: string;
  images: string[];
  mainImageIndex: number;
  publishStatus: 'publish' | 'draft';
  variants: ProductVariant[];
}

export type WizardStep = 1 | 2 | 3 | 4 | 5;
