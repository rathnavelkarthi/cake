export interface ProductVariant {
  id: string;
  sku: string;
  label: string;
  weight: string;
  price: number;
  servings: string;
  inStock: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  categoryId: string;
  categoryName: string;
  shortDescription: string;
  description: string;
  image: string;
  isEggless: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  preparationTime: string;
  ingredients: string[];
  variants: ProductVariant[];
  allergens?: string[];
  storageInstructions?: string;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  price: number;
  quantity: number;
  image: string;
  isEggless: boolean;
  customMessage?: string;
}

export interface CustomCakeRequest {
  occasion: string;
  flavour: string;
  weight: string;
  cakeMessage: string;
  themeNotes: string;
  preferredDate: string;
  preferredTimeSlot: string;
  fulfilment: "pickup" | "delivery";
  contactName?: string;
  contactPhone?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "orders" | "ingredients" | "delivery" | "custom";
}
