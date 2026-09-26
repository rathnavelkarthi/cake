import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import { PRODUCTS as LIB_PRODUCTS, CATEGORIES as LIB_CATEGORIES } from "../src/lib/data/products";
import { PRODUCTS as DATA_PRODUCTS } from "../src/data/products";

dotenv.config({ path: path.resolve(".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log("=== Starting Supabase Product & Category Migration ===");

  // 1. Prepare Categories
  const categoriesToUpsert = [
    { id: "cakes", name: "Signature Cakes", slug: "cakes", description: "Multi-layered artisanal gateaux", sort_order: 1, is_active: true },
    { id: "brownies", name: "Brownies & Desserts", slug: "brownies", description: "Dense fudge brownies, tarts & tea cakes", sort_order: 2, is_active: true },
    { id: "pastries", name: "French Pastries", slug: "pastries", description: "Delicate layered single-portion gateaux", sort_order: 3, is_active: true },
    { id: "bagels", name: "Artisanal Bagels", slug: "bagels", description: "Kettle-boiled New York style bagels slow-fermented for 24 hours", sort_order: 4, is_active: true },
    { id: "savouries", name: "Savouries & Buns", slug: "savouries", description: "Flaky puffs, Korean buns & fresh bakes", sort_order: 5, is_active: true },
    { id: "bites", name: "Burgers & Quick Bites", slug: "bites", description: "Sandwiches, burgers, momos & fries", sort_order: 6, is_active: true },
    { id: "waffles", name: "Waffles & Ice Cream", slug: "waffles", description: "Warm Belgian waffles & artisan scoops", sort_order: 7, is_active: true },
    { id: "beverages", name: "Beverages & Shakes", slug: "beverages", description: "Madras filter coffee, juices & thickshakes", sort_order: 8, is_active: true },
    { id: "cookies", name: "Chocolates & Cookies", slug: "cookies", description: "Handmade tea cookies & gift boxes", sort_order: 9, is_active: true },
  ];

  console.log(`Upserting ${categoriesToUpsert.length} categories...`);
  const { data: catData, error: catError } = await supabase
    .from("categories")
    .upsert(categoriesToUpsert, { onConflict: "id" })
    .select();

  if (catError) {
    console.error("Error upserting categories:", catError);
  } else {
    console.log(`✓ Successfully synced ${catData.length} categories`);
  }

  // 2. Prepare Products
  // Combine all items, ensuring no duplicates by ID or slug
  const productMap = new Map<string, any>();

  // Add all from lib/data/products
  for (const p of LIB_PRODUCTS) {
    const basePrice = p.variants && p.variants.length > 0 ? p.variants[0].price : 500;
    productMap.set(p.slug, {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku || `KCH-${p.id.toUpperCase()}`,
      category_id: p.categoryId,
      category_name: p.categoryName || p.categoryId,
      description: p.description,
      short_description: p.shortDescription || p.name,
      price: basePrice,
      sale_price: null,
      image_url: p.image || "/images/hero-truffle.jpg",
      images: [p.image || "/images/hero-truffle.jpg"],
      stock_quantity: 25,
      low_stock_threshold: 5,
      is_active: true,
      is_featured: Boolean(p.isFeatured),
      is_bestseller: Boolean(p.isBestSeller),
      is_eggless: Boolean(p.isEggless),
      prep_time: p.preparationTime || "2 hours",
      ingredients: p.ingredients || ["Pure Dairy Butter", "Organic Flour", "Fine Sugar"],
      allergens: p.allergens || ["Dairy", "Gluten"],
      variants: p.variants.map((v) => ({
        id: v.id,
        sku: v.sku || `SKU-${v.id}`,
        label: v.label,
        weight: v.weight,
        price: v.price,
        servings: v.servings,
        inStock: v.inStock !== false,
      })),
      recipe: [
        { rawMaterialId: 1, rawMaterialName: "Refined Wheat Flour (Maida)", amount: 250, unit: "g" },
        { rawMaterialId: 4, rawMaterialName: "Unsalted Dairy Butter", amount: 120, unit: "g" },
        { rawMaterialId: 5, rawMaterialName: "Granulated White Sugar", amount: 150, unit: "g" },
      ],
      updated_at: new Date().toISOString(),
    });
  }

  // Check if any product from data/products has unique slug
  for (const p of DATA_PRODUCTS) {
    if (!productMap.has(p.slug)) {
      const basePrice = p.variants && p.variants.length > 0 ? p.variants[0].price : 500;
      productMap.set(p.slug, {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: `KCH-${p.id.toUpperCase()}`,
        category_id: p.category,
        category_name: p.category.charAt(0).toUpperCase() + p.category.slice(1),
        description: p.description,
        short_description: p.shortDescription || p.name,
        price: basePrice,
        sale_price: null,
        image_url: p.image || "/images/hero-truffle.jpg",
        images: [p.image || "/images/hero-truffle.jpg"],
        stock_quantity: 20,
        low_stock_threshold: 5,
        is_active: true,
        is_featured: Boolean(p.isFeatured),
        is_bestseller: Boolean(p.isBestSeller),
        is_eggless: Boolean(p.isEggless),
        prep_time: p.prepTime || "2 hours",
        ingredients: p.ingredients || ["Pure Dairy Butter", "Organic Flour"],
        allergens: ["Dairy", "Gluten"],
        variants: p.variants.map((v) => ({
          id: v.id,
          sku: `SKU-${v.id}`,
          label: v.label,
          weight: v.weight,
          price: v.price,
          servings: v.servings,
          inStock: true,
        })),
        recipe: [
          { rawMaterialId: 1, rawMaterialName: "Refined Wheat Flour (Maida)", amount: 250, unit: "g" },
          { rawMaterialId: 4, rawMaterialName: "Unsalted Dairy Butter", amount: 120, unit: "g" },
        ],
        updated_at: new Date().toISOString(),
      });
    }
  }

  // Also include Bagels
  if (!productMap.has("toasted-sesame-bagel")) {
    productMap.set("toasted-sesame-bagel", {
      id: "prod-bagel-1",
      name: "Artisanal Toasted Sesame Bagels (Pack of 4)",
      slug: "toasted-sesame-bagel",
      sku: "KCH-BGL-01",
      category_id: "bagels",
      category_name: "Artisanal Bagels",
      description: "Authentic kettle-boiled New York style bagels slow-fermented for 24 hours. Crusty exterior with an airy, chewy crumb, generously coated with fragrant white sesame seeds.",
      short_description: "Slow-fermented high-gluten bagels boiled in barley malt and coated in toasted sesame.",
      price: 380,
      sale_price: null,
      image_url: "/images/hero-truffle.jpg",
      images: ["/images/hero-truffle.jpg"],
      stock_quantity: 20,
      low_stock_threshold: 5,
      is_active: true,
      is_featured: true,
      is_bestseller: true,
      is_eggless: true,
      prep_time: "1 hour",
      ingredients: ["High-Gluten Bread Flour", "Active Dry Yeast", "Barley Malt", "Dairy Butter", "White Sesame"],
      allergens: ["Gluten", "Sesame"],
      variants: [
        { id: "vb-1", sku: "KCH-BGL-4PK", label: "Pack of 4", weight: "450 g", price: 380, servings: "4 servings", inStock: true },
        { id: "vb-2", sku: "KCH-BGL-8PK", label: "Pack of 8", weight: "900 g", price: 720, servings: "8 servings", inStock: true },
      ],
      recipe: [
        { rawMaterialId: 2, rawMaterialName: "High-Gluten Bread Flour (for Bagels)", amount: 450, unit: "g" },
        { rawMaterialId: 6, rawMaterialName: "Active Dry Yeast", amount: 12, unit: "g" },
        { rawMaterialId: 10, rawMaterialName: "Toasted White Sesame Seeds", amount: 40, unit: "g" },
      ],
      updated_at: new Date().toISOString(),
    });
  }

  const allProducts = Array.from(productMap.values());
  console.log(`Upserting total of ${allProducts.length} products to Supabase...`);

  // Upsert in batches of 10 to ensure clean logging and no payload limit issues
  const batchSize = 10;
  for (let i = 0; i < allProducts.length; i += batchSize) {
    const batch = allProducts.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from("products")
      .upsert(batch, { onConflict: "slug" })
      .select("id, name, slug");

    if (error) {
      console.error(`Error in batch ${i / batchSize + 1}:`, error);
      // Try upserting by id
      const { data: dataById, error: errorById } = await supabase
        .from("products")
        .upsert(batch, { onConflict: "id" })
        .select("id, name, slug");
      if (errorById) {
        console.error(`Retry by ID failed in batch ${i / batchSize + 1}:`, errorById);
      } else {
        console.log(`✓ Batch ${i / batchSize + 1} succeeded via id conflict: ${dataById?.length} items`);
      }
    } else {
      console.log(`✓ Batch ${i / batchSize + 1} synced (${data?.length} products: ${batch.map(b => b.name).join(", ")})`);
    }
  }

  // Verify total count in Supabase
  const { count, error: countErr } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  if (countErr) {
    console.error("Error checking total count:", countErr);
  } else {
    console.log(`\n🎉 Verification Complete: ${count} products now stored in Supabase!`);
  }
}

runMigration().catch(console.error);
