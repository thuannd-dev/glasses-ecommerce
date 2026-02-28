export type Category = "fashion" | "glasses" | "lens";
export type GlassesType = "eyeglasses" | "sunglasses";
export type Shape = "round" | "square" | "cat-eye" | "aviator" | "rectangle";
export type Material = "acetate" | "metal" | "tr90" | "titanium";
export type Gender = "unisex" | "men" | "women";
export type FrameSize = "S" | "M" | "L";

export type SortKey = "featured" | "priceAsc" | "priceDesc";

export type Product = {
  id: string;
  category: Category;
  name: string;
  price: number;
  tag?: string;
  image: string;
  brand: string;
  code: string;
  glassesType?: GlassesType;
  shape?: Shape;
  material?: Material;
  gender?: Gender;
  frameSize?: FrameSize;
  colors?: string[];
};

export type FiltersState = {
  keyword: string;
  glassesTypes: GlassesType[];
  shapes: Shape[];
  colors: string[];
  frameSizes: FrameSize[];
  materials: Material[];
  genders: Gender[];
  minPrice: number | null;
  maxPrice: number | null;
  brand: string | null;
};
