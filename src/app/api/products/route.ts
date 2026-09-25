import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/products
// Returns products from Supabase
// query params:
// - all=true: return all products (including hidden/inactive) for Admin
// - category: filter by category
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const includeAll = searchParams.get("all") === "true";
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let query = supabaseAdmin.from("products").select("*").order("created_at", { ascending: false });

    if (!includeAll) {
      query = query.eq("is_active", true);
    }

    if (category && category !== "all") {
      query = query.eq("category_id", category);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching products from Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data || [] });
  } catch (err: any) {
    console.error("API error in GET /api/products:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/products
// Create a new product in Supabase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      category,
      price,
      salePrice,
      stock,
      imageUrl,
      description,
      shortDescription,
      isEggless,
      isFeatured,
      isBestSeller,
      prepTime,
      ingredients,
      variants,
      recipe,
      isActive,
    } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: "Product name and price are required" }, { status: 400 });
    }

    const categoryId = (category || "cakes").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const id = body.id || `kch-prod-${Date.now()}`;
    const sku = body.sku || `KCH-${Math.floor(1000 + Math.random() * 9000)}`;

    // Ensure category exists
    await supabaseAdmin
      .from("categories")
      .upsert({
        id: categoryId,
        name: category || "Signature Cakes",
        slug: categoryId,
        description: `Handcrafted ${category} freshly baked in our kitchen.`,
        is_active: true,
      });

    const newProduct = {
      id,
      name: name.trim(),
      slug,
      sku,
      category_id: categoryId,
      category_name: category || "Signature Cakes",
      description: description || `Freshly baked with pure ingredients in our kitchen.`,
      short_description: shortDescription || `Freshly baked ${name}.`,
      price: Number(price),
      sale_price: salePrice ? Number(salePrice) : null,
      image_url: imageUrl || "/images/hero-truffle.jpg",
      images: imageUrl ? [imageUrl] : ["/images/hero-truffle.jpg"],
      stock_quantity: Number(stock ?? 20),
      low_stock_threshold: Number(body.lowStockThreshold ?? 5),
      is_active: isActive !== false,
      is_featured: Boolean(isFeatured),
      is_bestseller: Boolean(isBestSeller),
      is_eggless: isEggless !== false,
      prep_time: prepTime || "2 hours",
      ingredients: ingredients || ["Pure Butter", "Unbleached Flour", "Organic Sugar"],
      allergens: body.allergens || ["Dairy", "Gluten"],
      variants: variants || [
        {
          id: `v-${id}-std`,
          label: "Standard (0.5 kg)",
          weight: "0.5 kg",
          price: Number(price),
          servings: "3-4 servings",
          inStock: Number(stock ?? 20) > 0,
        },
      ],
      recipe: recipe || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert(newProduct)
      .select()
      .single();

    if (error) {
      console.error("Error creating product in Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    console.error("API error in POST /api/products:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/products
// Update product in Supabase (edit fields, price, stock, show/hide toggle)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    // Map frontend field names to db column names
    const dbUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) {
      dbUpdates.name = updates.name.trim();
      dbUpdates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }
    if (updates.category !== undefined) {
      const catId = updates.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      dbUpdates.category_id = catId;
      dbUpdates.category_name = updates.category;
    }
    if (updates.price !== undefined) dbUpdates.price = Number(updates.price);
    if (updates.salePrice !== undefined) dbUpdates.sale_price = updates.salePrice ? Number(updates.salePrice) : null;
    if (updates.stock !== undefined) dbUpdates.stock_quantity = Number(updates.stock);
    if (updates.lowStockThreshold !== undefined) dbUpdates.low_stock_threshold = Number(updates.lowStockThreshold);
    if (updates.imageUrl !== undefined) {
      dbUpdates.image_url = updates.imageUrl;
      dbUpdates.images = [updates.imageUrl];
    }
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.shortDescription !== undefined) dbUpdates.short_description = updates.shortDescription;
    if (updates.isActive !== undefined) dbUpdates.is_active = Boolean(updates.isActive);
    if (updates.isFeatured !== undefined) dbUpdates.is_featured = Boolean(updates.isFeatured);
    if (updates.isBestSeller !== undefined) dbUpdates.is_bestseller = Boolean(updates.isBestSeller);
    if (updates.isEggless !== undefined) dbUpdates.is_eggless = Boolean(updates.isEggless);
    if (updates.ingredients !== undefined) dbUpdates.ingredients = updates.ingredients;
    if (updates.variants !== undefined) dbUpdates.variants = updates.variants;
    if (updates.recipe !== undefined) dbUpdates.recipe = updates.recipe;

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product in Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    console.error("API error in PUT /api/products:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/products
// Delete product from Supabase
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting product in Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("API error in DELETE /api/products:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
