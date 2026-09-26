import { Product, ProductVariant } from "@/data/products";
import { localProducts, AdminProductItem } from "@/lib/db/admin-data";

// In-memory store populated dynamically from live Supabase products
let productsStore: Product[] = [];

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore
    }
  });
}

export function subscribeToProducts(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getStorefrontProducts(): Product[] {
  return [...productsStore];
}

export function getAllCategories(): string[] {
  const categoriesSet = new Set<string>();
  productsStore.forEach((p) => {
    if (p.category) {
      categoriesSet.add(p.category.toLowerCase());
    }
  });
  return Array.from(categoriesSet);
}

export function addStorefrontProduct(item: {
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  description?: string;
  isEggless?: boolean;
}): Product {
  const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const id = `prod-${Date.now()}`;
  const categoryFormatted = item.category.toLowerCase();

  const newProduct: Product = {
    id,
    slug,
    name: item.name,
    category: categoryFormatted as any,
    shortDescription: item.description || `Freshly baked artisanal ${item.name}.`,
    description: item.description || `Made with premium ingredients at the Kichees kitchen. Baked fresh daily.`,
    image: item.imageUrl || "/images/hero-truffle.jpg",
    isEggless: item.isEggless ?? true,
    isBestSeller: false,
    isFeatured: true,
    prepTime: "2 hours",
    variants: [
      {
        id: `v-${id}-1`,
        label: "Standard",
        weight: "500 g",
        price: item.price,
        servings: "2-4 servings",
      },
    ],
    ingredients: ["Pure Butter", "Unbleached Flour", "Organic Sugar"],
  };

  // Add to storefront list at the top
  productsStore = [newProduct, ...productsStore];

  // Also sync to admin inventory if not already present
  const alreadyInAdmin = localProducts.some((p) => p.name.toLowerCase() === item.name.toLowerCase());
  if (!alreadyInAdmin) {
    const adminProd: AdminProductItem = {
      id: localProducts.length + 1,
      name: item.name,
      slug,
      sku: `KCH-${1000 + localProducts.length + 1}`,
      category: item.category,
      price: item.price,
      stock: item.stock,
      lowStockThreshold: 5,
      status: "active",
      imageUrl: item.imageUrl || "/images/hero-truffle.jpg",
      featured: true,
      bestSeller: false,
    };
    localProducts.unshift(adminProd);
  }

  notifyListeners();
  return newProduct;
}
