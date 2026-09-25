import { db, schema } from "./index";
import { eq, ilike, desc, and, sql } from "drizzle-orm";
import { PRODUCTS } from "@/data/products";
import { addLiveProduct } from "@/lib/data/products";

export interface RecipeIngredient {
  rawMaterialId: number;
  rawMaterialName: string;
  amount: number; // e.g. 250
  unit: "g" | "kg" | "ml" | "l" | "pcs";
}

export interface AdminProductItem {
  id: number | string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  price: number;
  salePrice?: number;
  stock: number;
  lowStockThreshold: number;
  status: "active" | "inactive" | "archived";
  imageUrl: string;
  featured: boolean;
  bestSeller: boolean;
  description?: string;
  isEggless?: boolean;
  recipe?: RecipeIngredient[];
}

export interface RawMaterialItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  stock: number; // in base unit (kg, l, pcs)
  unit: "kg" | "l" | "pcs";
  minThreshold: number;
  costPerUnit: number;
}

export interface AdminOrderItem {
  id: number;
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  total: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  orderStatus:
    | "PENDING_PAYMENT"
    | "PAID"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "OUT_FOR_DELIVERY"
    | "READY_FOR_PICKUP"
    | "COMPLETED"
    | "CANCELLED";
  fulfilmentType: "PICKUP" | "DELIVERY";
  itemsCount: number;
  date: string;
}

export interface AdminInventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  stock: number;
  lowStockThreshold: number;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  recipe?: RecipeIngredient[];
}

export interface AdminCustomerItem {
  id: number;
  name: string;
  mobile: string;
  email: string;
  totalOrders: number;
  totalSpend: number;
  tags: string[];
  lastOrderDate: string;
}

// 1. Initial Raw Materials Inventory
export let localRawMaterials: RawMaterialItem[] = [
  {
    id: 1,
    name: "Refined Wheat Flour (Maida)",
    sku: "RAW-FLOUR-01",
    category: "Flours & Grains",
    stock: 50.0, // 50 kg
    unit: "kg",
    minThreshold: 15.0,
    costPerUnit: 48,
  },
  {
    id: 2,
    name: "High-Gluten Bread Flour (for Bagels)",
    sku: "RAW-BREAD-02",
    category: "Flours & Grains",
    stock: 35.0, // 35 kg
    unit: "kg",
    minThreshold: 10.0,
    costPerUnit: 65,
  },
  {
    id: 3,
    name: "54% Callebaut Dark Belgian Chocolate",
    sku: "RAW-CHOC-01",
    category: "Chocolates & Cocoa",
    stock: 22.5, // 22.5 kg
    unit: "kg",
    minThreshold: 8.0,
    costPerUnit: 850,
  },
  {
    id: 4,
    name: "Unsalted Dairy Butter",
    sku: "RAW-BUTTER-01",
    category: "Dairy & Fats",
    stock: 28.0, // 28 kg
    unit: "kg",
    minThreshold: 6.0,
    costPerUnit: 520,
  },
  {
    id: 5,
    name: "Granulated White Sugar",
    sku: "RAW-SUGAR-01",
    category: "Sugars & Sweeteners",
    stock: 45.0, // 45 kg
    unit: "kg",
    minThreshold: 12.0,
    costPerUnit: 45,
  },
  {
    id: 6,
    name: "Active Dry Yeast",
    sku: "RAW-YEAST-01",
    category: "Leavening & Yeast",
    stock: 4.2, // 4.2 kg
    unit: "kg",
    minThreshold: 1.5,
    costPerUnit: 340,
  },
  {
    id: 7,
    name: "Philadelphia Cream Cheese",
    sku: "RAW-CHEESE-01",
    category: "Dairy & Fats",
    stock: 16.0, // 16 kg
    unit: "kg",
    minThreshold: 4.0,
    costPerUnit: 680,
  },
  {
    id: 8,
    name: "Heavy Dairy Whipping Cream",
    sku: "RAW-CREAM-01",
    category: "Dairy & Fats",
    stock: 20.0, // 20 litres
    unit: "l",
    minThreshold: 5.0,
    costPerUnit: 220,
  },
  {
    id: 9,
    name: "Pure Madagascar Vanilla Extract",
    sku: "RAW-VANILLA-01",
    category: "Flavours & Extracts",
    stock: 2.5, // 2.5 litres
    unit: "l",
    minThreshold: 0.8,
    costPerUnit: 1400,
  },
  {
    id: 10,
    name: "Toasted White Sesame Seeds",
    sku: "RAW-SESAME-01",
    category: "Seeds & Toppings",
    stock: 8.0, // 8 kg
    unit: "kg",
    minThreshold: 2.0,
    costPerUnit: 260,
  },
];

// Sample default recipes for products
const sampleRecipes: Record<string, RecipeIngredient[]> = {
  "prod-1": [
    { rawMaterialId: 3, rawMaterialName: "54% Callebaut Dark Belgian Chocolate", amount: 350, unit: "g" },
    { rawMaterialId: 1, rawMaterialName: "Refined Wheat Flour (Maida)", amount: 250, unit: "g" },
    { rawMaterialId: 4, rawMaterialName: "Unsalted Dairy Butter", amount: 180, unit: "g" },
    { rawMaterialId: 5, rawMaterialName: "Granulated White Sugar", amount: 150, unit: "g" },
    { rawMaterialId: 8, rawMaterialName: "Heavy Dairy Whipping Cream", amount: 200, unit: "ml" },
  ],
  "prod-2": [
    { rawMaterialId: 3, rawMaterialName: "54% Callebaut Dark Belgian Chocolate", amount: 250, unit: "g" },
    { rawMaterialId: 4, rawMaterialName: "Unsalted Dairy Butter", amount: 150, unit: "g" },
    { rawMaterialId: 5, rawMaterialName: "Granulated White Sugar", amount: 200, unit: "g" },
    { rawMaterialId: 1, rawMaterialName: "Refined Wheat Flour (Maida)", amount: 120, unit: "g" },
  ],
};

// 2. Initial Product Inventory
export let localProducts: AdminProductItem[] = [
  ...PRODUCTS.map((p, idx) => ({
    id: idx + 1,
    name: p.name,
    slug: p.slug || p.id,
    sku: `KCH-${1000 + idx}`,
    category: p.category.charAt(0).toUpperCase() + p.category.slice(1),
    price: p.variants?.[0]?.price ?? 650,
    stock: [12, 4, 18, 2, 8, 25, 0, 15][idx % 8],
    lowStockThreshold: 5,
    status: [12, 4, 18, 2, 8, 25, 0, 15][idx % 8] === 0 ? ("archived" as const) : ("active" as const),
    imageUrl: p.image,
    featured: p.isFeatured,
    bestSeller: p.isBestSeller,
    recipe: sampleRecipes[p.id] || [
      { rawMaterialId: 1, rawMaterialName: "Refined Wheat Flour (Maida)", amount: 250, unit: "g" },
      { rawMaterialId: 4, rawMaterialName: "Unsalted Dairy Butter", amount: 120, unit: "g" },
      { rawMaterialId: 5, rawMaterialName: "Granulated White Sugar", amount: 150, unit: "g" },
    ],
  })),
  // Add a Bagel product to demonstrate the bakery requirement!
  {
    id: PRODUCTS.length + 1,
    name: "Artisanal Toasted Sesame Bagel (Pack of 4)",
    slug: "toasted-sesame-bagel",
    sku: "KCH-2001",
    category: "Bagels",
    price: 380,
    stock: 14,
    lowStockThreshold: 6,
    status: "active",
    imageUrl: "/images/hero-truffle.jpg",
    featured: true,
    bestSeller: true,
    recipe: [
      { rawMaterialId: 2, rawMaterialName: "High-Gluten Bread Flour (for Bagels)", amount: 450, unit: "g" },
      { rawMaterialId: 6, rawMaterialName: "Active Dry Yeast", amount: 12, unit: "g" },
      { rawMaterialId: 5, rawMaterialName: "Granulated White Sugar", amount: 25, unit: "g" },
      { rawMaterialId: 4, rawMaterialName: "Unsalted Dairy Butter", amount: 30, unit: "g" },
      { rawMaterialId: 10, rawMaterialName: "Toasted White Sesame Seeds", amount: 40, unit: "g" },
    ],
  },
];

let localOrders: AdminOrderItem[] = [
  {
    id: 1,
    orderNumber: "ORD-2026-0891",
    customerName: "Priya Sundaram",
    customerMobile: "+91 98401 23456",
    total: 1450,
    paymentStatus: "PAID",
    orderStatus: "PREPARING",
    fulfilmentType: "DELIVERY",
    itemsCount: 2,
    date: "2026-09-13 14:30",
  },
  {
    id: 2,
    orderNumber: "ORD-2026-0892",
    customerName: "Karthik Raja",
    customerMobile: "+91 97910 88231",
    total: 890,
    paymentStatus: "PAID",
    orderStatus: "READY_FOR_PICKUP",
    fulfilmentType: "PICKUP",
    itemsCount: 1,
    date: "2026-09-13 15:10",
  },
  {
    id: 3,
    orderNumber: "ORD-2026-0893",
    customerName: "Ananya Iyer",
    customerMobile: "+91 98842 11904",
    total: 2400,
    paymentStatus: "PENDING",
    orderStatus: "PENDING_PAYMENT",
    fulfilmentType: "DELIVERY",
    itemsCount: 3,
    date: "2026-09-13 15:45",
  },
  {
    id: 4,
    orderNumber: "ORD-2026-0894",
    customerName: "Vikram Raman",
    customerMobile: "+91 98412 77334",
    total: 650,
    paymentStatus: "PAID",
    orderStatus: "COMPLETED",
    fulfilmentType: "PICKUP",
    itemsCount: 1,
    date: "2026-09-13 11:20",
  },
];

let localCustomers: AdminCustomerItem[] = [
  {
    id: 1,
    name: "Priya Sundaram",
    mobile: "+91 98401 23456",
    email: "priya.sundaram@gmail.com",
    totalOrders: 6,
    totalSpend: 7850,
    tags: ["REPEAT_CUSTOMER", "CAKE_CUSTOMER", "HIGH_VALUE"],
    lastOrderDate: "2026-09-13",
  },
  {
    id: 2,
    name: "Karthik Raja",
    mobile: "+91 97910 88231",
    email: "karthik.raja@outlook.com",
    totalOrders: 3,
    totalSpend: 3200,
    tags: ["REPEAT_CUSTOMER", "BROWNIE_CUSTOMER"],
    lastOrderDate: "2026-09-13",
  },
  {
    id: 3,
    name: "Ananya Iyer",
    mobile: "+91 98842 11904",
    email: "ananya.iyer@gmail.com",
    totalOrders: 1,
    totalSpend: 2400,
    tags: ["NEW_CUSTOMER", "CUSTOM_CAKE"],
    lastOrderDate: "2026-09-13",
  },
  {
    id: 4,
    name: "Vikram Raman",
    mobile: "+91 98412 77334",
    email: "vikram.raman@tcs.com",
    totalOrders: 9,
    totalSpend: 11400,
    tags: ["CORPORATE", "REPEAT_CUSTOMER", "HIGH_VALUE"],
    lastOrderDate: "2026-09-13",
  },
];

export async function getDashboardMetrics() {
  const totalSalesToday = localOrders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = localOrders.filter(
    (o) => o.orderStatus === "PENDING_PAYMENT" || o.orderStatus === "PREPARING"
  ).length;

  const lowStockCount = localProducts.filter(
    (p) => p.stock <= p.lowStockThreshold && p.stock > 0
  ).length;

  const lowRawMaterialsCount = localRawMaterials.filter(
    (r) => r.stock <= r.minThreshold
  ).length;

  return {
    todaySales: totalSalesToday,
    todayOrders: localOrders.length,
    pendingOrders: pendingOrdersCount,
    lowStockCount,
    lowRawMaterialsCount,
    totalProducts: localProducts.length,
    totalRawMaterials: localRawMaterials.length,
    totalCustomers: localCustomers.length,
  };
}

export async function getAdminProducts(search?: string, status?: string) {
  let filtered = [...localProducts];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }
  if (status && status !== "all") {
    filtered = filtered.filter((p) => p.status === status);
  }
  return filtered;
}

export async function getAdminOrders(status?: string) {
  let filtered = [...localOrders];
  if (status && status !== "all") {
    filtered = filtered.filter((o) => o.orderStatus === status);
  }
  return filtered;
}

export async function getAdminInventory() {
  return localProducts.map((p) => {
    let stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" = "IN_STOCK";
    if (p.stock === 0) stockStatus = "OUT_OF_STOCK";
    else if (p.stock <= p.lowStockThreshold) stockStatus = "LOW_STOCK";

    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      status: stockStatus,
      recipe: p.recipe,
    };
  });
}

export async function getRawMaterials() {
  return [...localRawMaterials];
}

// Reactive Inventory Subscription System
type InventoryChangeListener = () => void;
const inventoryChangeListeners: Set<InventoryChangeListener> = new Set();
let hasSyncedFromSupabase = false;

export async function syncAdminProductsFromSupabase(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/products?all=true");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.products) && data.products.length > 0) {
        localProducts = data.products.map((p: any, idx: number) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          sku: p.sku || `KCH-${1000 + idx}`,
          category: p.category_name || (p.category_id ? p.category_id.charAt(0).toUpperCase() + p.category_id.slice(1) : "Cakes"),
          price: Number(p.price),
          salePrice: p.sale_price ? Number(p.sale_price) : undefined,
          stock: Number(p.stock_quantity ?? 10),
          lowStockThreshold: Number(p.low_stock_threshold ?? 5),
          status: p.is_active ? "active" : "inactive",
          imageUrl: p.image_url || "/images/hero-truffle.jpg",
          featured: Boolean(p.is_featured),
          bestSeller: Boolean(p.is_bestseller),
          description: p.description,
          isEggless: Boolean(p.is_eggless),
          recipe: p.recipe || [],
        }));
        notifyInventoryChange();
      }
    }
    hasSyncedFromSupabase = true;
  } catch (err) {
    console.warn("Failed to sync products from Supabase API:", err);
  }
}

if (typeof window !== "undefined" && !hasSyncedFromSupabase) {
  setTimeout(() => {
    syncAdminProductsFromSupabase();
  }, 10);
}

export function subscribeInventory(listener: InventoryChangeListener): () => void {
  inventoryChangeListeners.add(listener);
  if (typeof window !== "undefined" && !hasSyncedFromSupabase) {
    syncAdminProductsFromSupabase();
  }
  return () => {
    inventoryChangeListeners.delete(listener);
  };
}

export function notifyInventoryChange(): void {
  inventoryChangeListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
}

export function getInventoryProducts(): AdminProductItem[] {
  return [...localProducts];
}

export function addInventoryProduct(item: {
  name: string;
  category: string;
  price: number;
  stock: number;
  lowStockThreshold?: number;
  imageUrl?: string;
  description?: string;
  isEggless?: boolean;
  recipe?: RecipeIngredient[];
}): AdminProductItem {
  const newId = `kch-prod-${Date.now()}`;
  const initialStock = item.stock || 0;
  const recipe = item.recipe || [];

  // Deduct raw materials for initial production batch if recipe provided
  if (initialStock > 0 && recipe.length > 0) {
    for (const ing of recipe) {
      const raw = localRawMaterials.find((r) => r.id === ing.rawMaterialId);
      if (raw) {
        let deduction = ing.amount * initialStock;
        if (ing.unit === "g" && raw.unit === "kg") deduction /= 1000;
        if (ing.unit === "ml" && raw.unit === "l") deduction /= 1000;
        raw.stock = Math.max(0, Math.round((raw.stock - deduction) * 100) / 100);
      }
    }
  }

  const newProd: AdminProductItem = {
    id: newId,
    name: item.name.trim(),
    slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    sku: `KCH-${1000 + localProducts.length + 1}`,
    category: item.category,
    price: item.price,
    stock: initialStock,
    lowStockThreshold: item.lowStockThreshold ?? 5,
    status: initialStock > 0 ? "active" : "inactive",
    imageUrl: item.imageUrl || "/images/hero-truffle.jpg",
    featured: true,
    bestSeller: false,
    description: item.description,
    isEggless: item.isEggless ?? true,
    recipe,
  };

  localProducts.unshift(newProd);

  // Synchronize directly with storefront landing page
  addLiveProduct({
    name: newProd.name,
    category: newProd.category,
    price: newProd.price,
    stock: newProd.stock,
    imageUrl: newProd.imageUrl,
    description: item.description,
    isEggless: item.isEggless,
  });

  notifyInventoryChange();

  // Persist directly to Supabase via API
  if (typeof window !== "undefined") {
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: newId,
        name: newProd.name,
        category: newProd.category,
        price: newProd.price,
        stock: newProd.stock,
        lowStockThreshold: newProd.lowStockThreshold,
        imageUrl: newProd.imageUrl,
        description: item.description,
        isEggless: item.isEggless,
        isActive: newProd.status === "active",
        recipe,
      }),
    }).catch((err) => console.error("Failed to persist product to Supabase:", err));
  }

  return newProd;
}

export function updateInventoryProduct(
  id: number | string,
  updates: Partial<AdminProductItem>
): AdminProductItem | undefined {
  const index = localProducts.findIndex((p) => String(p.id) === String(id));
  if (index >= 0) {
    localProducts[index] = { ...localProducts[index], ...updates };
    if (typeof updates.stock === "number") {
      localProducts[index].status = localProducts[index].stock > 0 ? "active" : "archived";
    }
    notifyInventoryChange();

    // Persist to Supabase via API
    if (typeof window !== "undefined") {
      fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: String(id),
          name: updates.name,
          category: updates.category,
          price: updates.price,
          salePrice: updates.salePrice,
          stock: updates.stock,
          lowStockThreshold: updates.lowStockThreshold,
          imageUrl: updates.imageUrl,
          description: updates.description,
          isActive: updates.status ? updates.status === "active" : undefined,
          isFeatured: updates.featured,
          isBestSeller: updates.bestSeller,
          isEggless: updates.isEggless,
          recipe: updates.recipe,
        }),
      }).catch((err) => console.error("Failed to update product in Supabase:", err));
    }

    return localProducts[index];
  }
  return undefined;
}

export function deleteInventoryProduct(id: number | string): boolean {
  const index = localProducts.findIndex((p) => String(p.id) === String(id));
  if (index >= 0) {
    localProducts.splice(index, 1);
    notifyInventoryChange();

    // Persist to Supabase via API
    if (typeof window !== "undefined") {
      fetch(`/api/products?id=${encodeURIComponent(String(id))}`, {
        method: "DELETE",
      }).catch((err) => console.error("Failed to delete product in Supabase:", err));
    }

    return true;
  }
  return false;
}

export async function addRawMaterial(item: Omit<RawMaterialItem, "id">) {
  const newItem: RawMaterialItem = {
    id: localRawMaterials.length + 1,
    ...item,
  };
  localRawMaterials.push(newItem);
  notifyInventoryChange();
  return newItem;
}

export async function adjustRawMaterialStock(
  id: number,
  delta: number,
  reason: string
) {
  const item = localRawMaterials.find((r) => r.id === id);
  if (item) {
    item.stock = Math.max(0, Math.round((item.stock + delta) * 100) / 100);
    notifyInventoryChange();
  }
  return item;
}

// Produce a finished product batch and deduct raw materials from raw inventory!
export async function produceProductBatch(
  productId: number | string,
  batchQuantity: number
) {
  const product = localProducts.find((p) => String(p.id) === String(productId));
  if (!product) throw new Error("Product not found");

  const recipe = product.recipe || [];
  const deductions: { name: string; amountUsed: string; remainingStock: string }[] = [];

  // Deduct each raw material
  for (const ingredient of recipe) {
    const raw = localRawMaterials.find((r) => r.id === ingredient.rawMaterialId);
    if (raw) {
      // Convert g/ml to base kg/l
      let totalAmount = ingredient.amount * batchQuantity;
      if (ingredient.unit === "g" && raw.unit === "kg") {
        totalAmount = totalAmount / 1000;
      } else if (ingredient.unit === "ml" && raw.unit === "l") {
        totalAmount = totalAmount / 1000;
      }

      raw.stock = Math.max(0, Math.round((raw.stock - totalAmount) * 100) / 100);

      deductions.push({
        name: raw.name,
        amountUsed: `${totalAmount.toFixed(2)} ${raw.unit}`,
        remainingStock: `${raw.stock.toFixed(2)} ${raw.unit}`,
      });
    }
  }

  // Increase finished product inventory
  product.stock += batchQuantity;
  if (product.stock > 0 && product.status === "archived") {
    product.status = "active";
  }

  notifyInventoryChange();

  return {
    productName: product.name,
    unitsProduced: batchQuantity,
    newProductStock: product.stock,
    deductions,
  };
}

export async function getAdminCustomers(query?: string) {
  let filtered = [...localCustomers];
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }
  return filtered;
}

export async function updateOrderStatus(
  orderId: number,
  newStatus: AdminOrderItem["orderStatus"]
) {
  const order = localOrders.find((o) => o.id === orderId);
  if (order) {
    order.orderStatus = newStatus;
  }
  return order;
}

export async function adjustStock(
  productId: number,
  delta: number,
  reason: string
) {
  const product = localProducts.find((p) => p.id === productId);
  if (product) {
    product.stock = Math.max(0, product.stock + delta);
    if (product.stock === 0) product.status = "archived";
    else if (product.status === "archived") product.status = "active";
    notifyInventoryChange();
  }
  return product;
}

