import { Category, Product, ProductVariant } from "./types";

export type { Category, Product, ProductVariant };

// Clean empty array - all product data is fetched dynamically from Supabase
export const PRODUCTS: Product[] = [];

// Base categories - dynamically augmented from Supabase public.categories
export const CATEGORIES: Category[] = [
  { id: "all", slug: "all", name: "All Items", description: "Fresh from the morning oven" },
  { id: "cakes", slug: "cakes", name: "Signature Cakes", description: "Multi-layered artisanal gateaux" },
  { id: "brownies", slug: "brownies", name: "Brownies & Desserts", description: "Dense fudge brownies, tarts & tea cakes" },
  { id: "pastries", slug: "pastries", name: "French Pastries", description: "Delicate layered single-portion gateaux" },
  { id: "bagels", slug: "bagels", name: "Artisanal Bagels", description: "Kettle-boiled New York style bagels slow-fermented for 24 hours" },
  { id: "savouries", slug: "savouries", name: "Savouries & Buns", description: "Flaky puffs, Korean buns & fresh bakes" },
  { id: "bites", slug: "bites", name: "Burgers & Quick Bites", description: "Sandwiches, burgers, momos & fries" },
  { id: "waffles", slug: "waffles", name: "Waffles & Ice Cream", description: "Warm Belgian waffles & artisan scoops" },
  { id: "beverages", slug: "beverages", name: "Beverages & Shakes", description: "Madras filter coffee, juices & thickshakes" },
  { id: "cookies", slug: "cookies", name: "Chocolates & Cookies", description: "Handmade tea cookies & gift boxes" },
  { id: "eggless", slug: "eggless", name: "100% Eggless", description: "Dedicated counter & pure bakes" },
];

export let LIVE_PRODUCTS: Product[] = [];
export let LIVE_CATEGORIES: Category[] = [...CATEGORIES];

type ProductsChangeListener = () => void;
const productChangeListeners: Set<ProductsChangeListener> = new Set();
let hasSyncedStorefrontFromSupabase = false;
let isStorefrontLoading = true;

export function mapSupabaseToProduct(p: any): Product {
  const rawVariants = Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : null;
  const variants: ProductVariant[] = rawVariants
    ? rawVariants.map((v: any, idx: number) => ({
        id: v.id || `v-${p.id}-${idx}`,
        sku: v.sku || `SKU-${v.id || p.id}`,
        label: v.label || "Standard",
        weight: v.weight || "0.5 kg",
        price: Number(v.price ?? p.price ?? 500),
        servings: v.servings || "3 to 4 servings",
        inStock: v.inStock !== false && (v.stock !== undefined ? v.stock > 0 : true),
      }))
    : [
        {
          id: `v-${p.id}-std`,
          sku: `SKU-${p.id}`,
          label: "Standard",
          weight: "0.5 kg",
          price: Number(p.price ?? 500),
          servings: "3 to 4 servings",
          inStock: Number(p.stock_quantity ?? 10) > 0,
        },
      ];

  const imageUrl =
    p.image_url ||
    (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null) ||
    "/images/hero-truffle.jpg";

  return {
    id: p.id,
    slug: p.slug || p.id,
    sku: p.sku || `KCH-${p.id.toUpperCase()}`,
    name: p.name,
    categoryId: (p.category_id || "cakes").toLowerCase(),
    categoryName: p.category_name || (p.category_id ? p.category_id.charAt(0).toUpperCase() + p.category_id.slice(1) : "Signature Cakes"),
    shortDescription: p.short_description || p.description?.slice(0, 100) || p.name,
    description: p.description || "",
    image: imageUrl,
    isEggless: Boolean(p.is_eggless),
    isBestSeller: Boolean(p.is_bestseller),
    isFeatured: Boolean(p.is_featured),
    preparationTime: p.prep_time || "2 hours",
    ingredients: Array.isArray(p.ingredients) ? p.ingredients : ["Pure Butter", "Unbleached Flour"],
    allergens: Array.isArray(p.allergens) ? p.allergens : ["Dairy", "Gluten"],
    variants,
  };
}

export async function syncLiveProductsFromSupabase(): Promise<Product[]> {
  if (typeof window === "undefined") return LIVE_PRODUCTS;
  try {
    const res = await fetch("/api/products");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.products) && data.products.length > 0) {
        LIVE_PRODUCTS = data.products.map(mapSupabaseToProduct);

        // Also sync categories if returned
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          const dbCategories: Category[] = data.categories.map((c: any) => ({
            id: c.id,
            slug: c.slug || c.id,
            name: c.name,
            description: c.description || `Freshly baked ${c.name} in Chennai`,
          }));

          // Preserve virtual "all" and "eggless" filters
          LIVE_CATEGORIES = [
            { id: "all", slug: "all", name: "All Items", description: "Fresh from the morning oven" },
            ...dbCategories,
            { id: "eggless", slug: "eggless", name: "100% Eggless", description: "Dedicated counter & pure bakes" },
          ];
        }

        isStorefrontLoading = false;
        hasSyncedStorefrontFromSupabase = true;

        productChangeListeners.forEach((fn) => {
          try {
            fn();
          } catch {
            // ignore
          }
        });
      }
    }
    return LIVE_PRODUCTS;
  } catch (err) {
    console.warn("Failed to sync storefront products from Supabase:", err);
    return LIVE_PRODUCTS;
  }
}

if (typeof window !== "undefined" && !hasSyncedStorefrontFromSupabase) {
  setTimeout(() => {
    syncLiveProductsFromSupabase();
  }, 0);
}

export function subscribeProducts(listener: ProductsChangeListener): () => void {
  productChangeListeners.add(listener);
  if (typeof window !== "undefined" && (!hasSyncedStorefrontFromSupabase || LIVE_PRODUCTS.length === 0)) {
    syncLiveProductsFromSupabase();
  }
  return () => {
    productChangeListeners.delete(listener);
  };
}

export function getLiveProducts(): Product[] {
  return [...LIVE_PRODUCTS];
}

export function getLiveCategories(): Category[] {
  return [...LIVE_CATEGORIES];
}

export function isStorefrontDataLoading(): boolean {
  return isStorefrontLoading && LIVE_PRODUCTS.length === 0;
}

export function addLiveProduct(item: {
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  description?: string;
  isEggless?: boolean;
  ingredients?: string[];
  recipe?: { rawMaterialName: string }[];
}): Product {
  const categoryId = item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const id = `kch-custom-${Date.now()}`;

  // Auto register category if new
  if (!LIVE_CATEGORIES.some((c) => c.id === categoryId)) {
    LIVE_CATEGORIES = [
      ...LIVE_CATEGORIES,
      {
        id: categoryId,
        slug: categoryId,
        name: item.category,
        description: `Handcrafted ${item.category} freshly baked in our Chennai kitchen.`,
      },
    ];
  }

  const newProduct: Product = {
    id,
    slug,
    sku: `KCH-${1000 + LIVE_PRODUCTS.length + 1}`,
    name: item.name,
    categoryId,
    categoryName: item.category,
    shortDescription: item.description || `Freshly baked artisanal ${item.name}.`,
    description: item.description || `Handcrafted with the finest ingredients in our Chennai kitchen. Baked fresh daily.`,
    image: item.imageUrl || "/images/hero-truffle.jpg",
    isEggless: item.isEggless ?? true,
    isBestSeller: false,
    isFeatured: true,
    preparationTime: "2 hours",
    ingredients:
      item.ingredients && item.ingredients.length > 0
        ? item.ingredients
        : item.recipe && item.recipe.length > 0
        ? item.recipe.map((r) => r.rawMaterialName)
        : ["Pure Butter", "Unbleached Flour", "Organic Sugar"],
    variants: [
      {
        id: `v-${id}-1`,
        sku: `KCH-${id}-STD`,
        label: "Standard",
        weight: "500g",
        price: item.price,
        servings: "2 to 4 servings",
        inStock: item.stock > 0,
      },
    ],
  };

  LIVE_PRODUCTS = [newProduct, ...LIVE_PRODUCTS];
  productChangeListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });

  return newProduct;
}
