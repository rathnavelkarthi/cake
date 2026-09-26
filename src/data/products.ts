export interface ProductVariant {
  id: string;
  label: string;
  weight: string;
  price: number;
  servings: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  image: string;
  isEggless: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  prepTime: string;
  variants: ProductVariant[];
  ingredients: string[];
}

// All products are stored in and fetched dynamically from Supabase
export const PRODUCTS: Product[] = [];
