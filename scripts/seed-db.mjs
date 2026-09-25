import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local if present
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      const val = (match[2] || "").trim().replace(/^['"]|['"]$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Categories
const CATEGORIES = [
  { id: "cakes", name: "Signature Cakes", slug: "cakes", description: "Multi-layered European artisanal gateaux", sort_order: 1, is_active: true },
  { id: "brownies", name: "Brownies & Desserts", slug: "brownies", description: "Dense fudge brownies, tarts & tea cakes", sort_order: 2, is_active: true },
  { id: "pastries", name: "French Pastries", slug: "pastries", description: "Delicate layered single-portion gateaux", sort_order: 3, is_active: true },
  { id: "bagels", name: "Artisanal Bagels", slug: "bagels", description: "Kettle-boiled 24-hour slow fermented New York bagels", sort_order: 4, is_active: true },
  { id: "savouries", name: "Savouries & Buns", slug: "savouries", description: "Flaky puffs, Korean cream cheese buns & savory bakes", sort_order: 5, is_active: true },
  { id: "bites", name: "Burgers & Quick Bites", slug: "bites", description: "Freshly assembled brioche burgers, momos & fries", sort_order: 6, is_active: true },
  { id: "waffles", name: "Waffles & Ice Cream", slug: "waffles", description: "Warm Belgian waffles with artisan scoops", sort_order: 7, is_active: true },
  { id: "beverages", name: "Beverages & Shakes", slug: "beverages", description: "Madras filter coffee, juices & thickshakes", sort_order: 8, is_active: true },
  { id: "cookies", name: "Chocolates & Cookies", slug: "cookies", description: "Handmade tea cookies & bespoke gift boxes", sort_order: 9, is_active: true },
];

// Products
const PRODUCTS = [
  {
    id: "prod-1",
    name: "Belgian Dark Chocolate Truffle",
    slug: "belgian-dark-chocolate-truffle",
    sku: "KCH-TRF-01",
    category_id: "cakes",
    category_name: "Signature Cakes",
    short_description: "Silky 54% Callebaut ganache, moist dark sponge, cocoa nibs & berries.",
    description: "Our signature gateau. Three layers of slow-baked dark cocoa sponge soaked in mild espresso syrup, enrobed in velvety 54% Belgian Callebaut chocolate ganache, and crowned with fresh seasonal berries and gold specks.",
    price: 650,
    sale_price: 620,
    image_url: "/images/hero-truffle.jpg",
    images: ["/images/hero-truffle.jpg", "/images/celebration-cake.jpg"],
    stock_quantity: 24,
    low_stock_threshold: 5,
    is_active: true,
    is_featured: true,
    is_bestseller: true,
    is_eggless: true,
    prep_time: "2 hours",
    ingredients: ["54% Callebaut Dark Chocolate", "Pure Dairy Cream", "Unsalted Butter", "Dutch Cocoa"],
    allergens: ["Dairy", "Gluten"],
    variants: [
      { id: "v1-1", label: "0.5 kg", weight: "0.5 kg", price: 650, servings: "3-4 servings", inStock: true },
      { id: "v1-2", label: "1.0 kg", weight: "1.0 kg", price: 1200, servings: "6-8 servings", inStock: true },
      { id: "v1-3", label: "1.5 kg", weight: "1.5 kg", price: 1750, servings: "10-12 servings", inStock: true },
    ],
  },
  {
    id: "prod-rv",
    name: "Classic Red Velvet Gateau",
    slug: "classic-red-velvet",
    sku: "KCH-RV-01",
    category_id: "cakes",
    category_name: "Signature Cakes",
    short_description: "Cultured buttermilk cocoa crumb with whipped cream cheese frosting.",
    description: "Authentic red velvet sponge infused with natural cocoa and cultured buttermilk, layered with tangy whipped cream cheese frosting.",
    price: 708,
    image_url: "/custom-cakes/cake-2.jpg",
    images: ["/custom-cakes/cake-2.jpg"],
    stock_quantity: 18,
    low_stock_threshold: 4,
    is_active: true,
    is_featured: true,
    is_bestseller: true,
    is_eggless: true,
    prep_time: "2 hours",
    ingredients: ["Cultured Buttermilk", "Pure Cream Cheese", "Dutch Cocoa", "Vanilla Pod"],
    variants: [
      { id: "vrv-1", label: "0.5 kg", weight: "0.5 kg", price: 708, servings: "3-4 servings", inStock: true },
      { id: "vrv-2", label: "1.0 kg", weight: "1.0 kg", price: 1526, servings: "6-8 servings", inStock: true },
    ],
  },
  {
    id: "prod-fr",
    name: "Ferrero Rocher Grandeur",
    slug: "ferrero-rocher-grandeur",
    sku: "KCH-FR-01",
    category_id: "cakes",
    category_name: "Signature Cakes",
    short_description: "Toasted hazelnut gianduja, chocolate drip, whole Ferrero rochers.",
    description: "Decadent dark chocolate layers stuffed with roasted hazelnut crunch, topped with a dark chocolate drip, hazelnut praline, and gold-dusted Ferrero Rochers.",
    price: 872,
    image_url: "/custom-cakes/cake-3.jpg",
    images: ["/custom-cakes/cake-3.jpg"],
    stock_quantity: 15,
    low_stock_threshold: 4,
    is_active: true,
    is_featured: true,
    is_bestseller: true,
    is_eggless: true,
    prep_time: "3 hours",
    ingredients: ["Roasted Hazelnuts", "Gianduja Praline", "54% Callebaut Dark", "Pure Cream"],
    variants: [
      { id: "vfr-1", label: "0.5 kg", weight: "0.5 kg", price: 872, servings: "3-4 servings", inStock: true },
      { id: "vfr-2", label: "1.0 kg", weight: "1.0 kg", price: 1852, servings: "6-8 servings", inStock: true },
    ],
  },
  {
    id: "prod-ras",
    name: "Rasmalai Melts Celebration Cake",
    slug: "rasmalai-melts-celebration-cake",
    sku: "KCH-RAS-01",
    category_id: "cakes",
    category_name: "Signature Cakes",
    short_description: "Saffron-soaked milk sponge, fresh cottage cheese dumplings & pistachios.",
    description: "A royal fusion. Fluffy cardamom-infused vanilla sponge soaked in slow-simmered saffron rabri, layered with soft cottage cheese rasmalai discs and slivered Iranian pistachios.",
    price: 817,
    image_url: "/custom-cakes/cake-4.jpg",
    images: ["/custom-cakes/cake-4.jpg"],
    stock_quantity: 12,
    low_stock_threshold: 3,
    is_active: true,
    is_featured: true,
    is_bestseller: true,
    is_eggless: true,
    prep_time: "3 hours",
    ingredients: ["Fresh Chenna Rasmalai", "Kashmiri Saffron", "Cardamom", "Pistachio Slivers"],
    variants: [
      { id: "vras-1", label: "0.5 kg", weight: "0.5 kg", price: 817, servings: "3-4 servings", inStock: true },
      { id: "vras-2", label: "1.0 kg", weight: "1.0 kg", price: 1743, servings: "6-8 servings", inStock: true },
    ],
  },
  {
    id: "prod-brownie-box",
    name: "Classic Molten Fudge Walnut Brownies (Box of 4)",
    slug: "classic-molten-fudge-brownies",
    sku: "KCH-BRW-01",
    category_id: "brownies",
    category_name: "Brownies & Desserts",
    short_description: "Dense dark chocolate fudge brownies folded with toasted California walnuts.",
    description: "Slow-baked to achieve a paper-thin crinkly crust and an intensely fudgy molten center. Loaded with toasted walnuts and Belgian dark chunks.",
    price: 450,
    image_url: "/images/fudge-brownies.jpg",
    images: ["/images/fudge-brownies.jpg"],
    stock_quantity: 30,
    low_stock_threshold: 6,
    is_active: true,
    is_featured: true,
    is_bestseller: true,
    is_eggless: true,
    prep_time: "1 hour",
    ingredients: ["54% Callebaut Dark Chocolate", "Dairy Butter", "California Walnuts", "Brown Sugar"],
    variants: [
      { id: "vbr-4", label: "Box of 4", weight: "320g", price: 450, servings: "4 pieces", inStock: true },
      { id: "vbr-8", label: "Box of 8", weight: "640g", price: 850, servings: "8 pieces", inStock: true },
    ],
  },
  {
    id: "prod-bagel-1",
    name: "Artisanal Toasted Sesame Bagels (Pack of 4)",
    slug: "toasted-sesame-bagels",
    sku: "KCH-BGL-01",
    category_id: "bagels",
    category_name: "Artisanal Bagels",
    short_description: "24-hr cold-fermented high-gluten dough, barley malt boiled & sesame encrusted.",
    description: "Authentic New York style kettle-boiled bagels. Slow cold fermentation yields an airy yet distinctively chewy crumb, with a crisp golden exterior coated in aromatic toasted white sesame.",
    price: 380,
    image_url: "/images/bakery-counter.jpg",
    images: ["/images/bakery-counter.jpg"],
    stock_quantity: 20,
    low_stock_threshold: 5,
    is_active: true,
    is_featured: true,
    is_bestseller: true,
    is_eggless: true,
    prep_time: "1 hour",
    ingredients: ["High-Gluten Flour", "Barley Malt Syrup", "Active Yeast", "Toasted White Sesame", "Sea Salt"],
    variants: [
      { id: "vbgl-4", label: "Pack of 4", weight: "450g", price: 380, servings: "4 servings", inStock: true },
      { id: "vbgl-8", label: "Pack of 8", weight: "900g", price: 720, servings: "8 servings", inStock: true },
    ],
  },
  {
    id: "prod-pistachio-rose",
    name: "Persian Pistachio & Damask Rose Entremet",
    slug: "persian-pistachio-damask-rose-entremet",
    sku: "KCH-PST-01",
    category_id: "cakes",
    category_name: "Signature Cakes",
    short_description: "Iranian pistachio mousse, damask rose water jelly, almond sponge.",
    description: "An elegant French entremet inspired by Persian flavours. Fragrant Iranian pistachio mousse enveloping a slow-cooked damask rose water jelly insert atop a flourless almond biscuit.",
    price: 950,
    image_url: "/images/celebration-cake.jpg",
    images: ["/images/celebration-cake.jpg"],
    stock_quantity: 10,
    low_stock_threshold: 3,
    is_active: true,
    is_featured: true,
    is_bestseller: false,
    is_eggless: true,
    prep_time: "4 hours",
    ingredients: ["Bronte Pistachio Paste", "Organic Damask Rose Water", "Dairy Whipping Cream", "Ground Almonds"],
    variants: [
      { id: "vpst-500", label: "0.5 kg", weight: "0.5 kg", price: 950, servings: "3-4 servings", inStock: true },
      { id: "vpst-1000", label: "1.0 kg", weight: "1.0 kg", price: 1900, servings: "6-8 servings", inStock: true },
    ],
  },
  {
    id: "prod-korean-bun",
    name: "Korean Cream Cheese Garlic Brioche Bun",
    slug: "korean-cream-cheese-garlic-bun",
    sku: "KCH-SAV-01",
    category_id: "savouries",
    category_name: "Savouries & Buns",
    short_description: "Soft pull-apart brioche stuffed with sweetened cream cheese & roasted garlic butter.",
    description: "Fluffy Japanese-style brioche bread dipped in luscious roasted garlic butter, parsley, and filled with sweet whipped Philadelphia-style cream cheese.",
    price: 180,
    image_url: "/custom-cakes/cake-6.jpg",
    images: ["/custom-cakes/cake-6.jpg"],
    stock_quantity: 35,
    low_stock_threshold: 8,
    is_active: true,
    is_featured: false,
    is_bestseller: true,
    is_eggless: true,
    prep_time: "30 mins",
    ingredients: ["Brioche Flour", "Philadelphia Cream Cheese", "Roasted Garlic", "Fresh Parsley", "Cultured Butter"],
    variants: [
      { id: "vkb-1", label: "Single Bun", weight: "180g", price: 180, servings: "1 serving", inStock: true },
      { id: "vkb-2", label: "Box of 2", weight: "360g", price: 340, servings: "2 servings", inStock: true },
    ],
  },
];

// CMS Blocks
const CMS_BLOCKS = [
  {
    id: "block-hero",
    block_type: "hero",
    title: "Slow-Crafted European Gateaux & Morning Bakes",
    subtitle: "Handcrafted with pure 54% Callebaut chocolate, cultured dairy butter, and zero synthetic preservatives. Order for same-day doorstep delivery or pickup at our boutique kitchen.",
    badge: "Baked Fresh Daily • Nungambakkam, Chennai",
    primary_cta_text: "Order Online",
    primary_cta_link: "#signature-cakes",
    secondary_cta_text: "Custom Cake Studio",
    secondary_cta_link: "#custom-cakes",
    image_url: "/images/hero-truffle.jpg",
    is_visible: true,
    sort_order: 1,
  },
  {
    id: "block-products",
    block_type: "product_showcase",
    title: "Signature Cakes & Daily Patisserie",
    subtitle: "Small-batch celebration cakes, fudgy brownies, and kettle-boiled artisanal bagels.",
    metadata: { categoryFilter: "all" },
    is_visible: true,
    sort_order: 2,
  },
  {
    id: "block-gallery",
    block_type: "gallery",
    title: "Moments from Our Kitchen Counter",
    subtitle: "A glimpse into our daily morning bakes, hand-rolled doughs, and fresh deliveries.",
    metadata: {
      images: [
        { id: "g-1", url: "/images/hero-truffle.jpg", caption: "54% Callebaut Dark Belgian Truffle Gateau" },
        { id: "g-2", url: "/images/fudge-brownies.jpg", caption: "Dense molten dark fudge brownies with toasted walnuts" },
        { id: "g-3", url: "/images/celebration-cake.jpg", caption: "Hand-piped Persian Pistachio & Rose Entremet" },
        { id: "g-4", url: "/images/bakery-counter.jpg", caption: "Freshly baked morning counter in Nungambakkam" },
      ],
    },
    is_visible: true,
    sort_order: 3,
  },
  {
    id: "block-story",
    block_type: "rich_text",
    title: "The Kichees Baking Philosophy",
    subtitle: "Pure ingredients. Time-honoured European traditions. No shortcuts.",
    content: "We believe great bakery goods start with ingredient integrity. Every gateau, bagel, and brownie is baked in small daily batches using unbleached flours, pure dairy butter, and genuine Belgian couverture chocolate.",
    metadata: {
      quote: "Baking is not mass manufacturing. It is a daily promise of freshness.",
      author: "Head Pâtissier, Kichees",
    },
    is_visible: true,
    sort_order: 4,
  },
  {
    id: "block-reviews",
    block_type: "reviews",
    title: "Loved Across Chennai",
    subtitle: "Read verified stories from over 4,000 delighted celebration hosts.",
    is_visible: true,
    sort_order: 5,
  },
  {
    id: "block-faq",
    block_type: "faq",
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about delivery windows, eggless options, and custom cake orders.",
    is_visible: true,
    sort_order: 6,
  },
  {
    id: "block-cta",
    block_type: "cta_banner",
    title: "Celebrate Every Occasion with Kichees",
    subtitle: "Same-day doorstep delivery across Chennai or express counter pickup in Nungambakkam.",
    primary_cta_text: "Order Your Celebration Bake",
    primary_cta_link: "#signature-cakes",
    is_visible: true,
    sort_order: 7,
  },
];

// CMS Settings
const CMS_SETTINGS = [
  {
    key: "site_info",
    value: {
      brand_name: "Kichee's Baked Delights",
      tagline: "Pure Callebaut Chocolate & Slow European Baking",
      address: "14/2, Sterling Road, Nungambakkam, Chennai - 600034",
      phone: "+91 98402 12345",
      email: "support@kicheesbakeddelights.in",
      hours: "Mon - Sun: 8:00 AM - 10:30 PM",
      fssai_lic: "12423008000456",
      announcement_enabled: true,
      announcement_text: "🌟 Fresh Morning Bakes Now Available • Free Delivery on Orders Above ₹999 Across Chennai",
    },
  },
  {
    key: "delivery_config",
    value: {
      standard_delivery_fee: 99,
      free_delivery_threshold: 999,
      slots: [
        "10:00 AM - 01:00 PM (Morning Slot)",
        "02:00 PM - 05:00 PM (Afternoon Slot)",
        "06:00 PM - 09:30 PM (Evening Celebration Slot)",
      ],
      express_available: true,
    },
  },
];

// Production HTML Email Templates with authentic Kichee's branding and images
const EMAIL_TEMPLATES = [
  {
    id: "tmpl-signup",
    template_key: "signup_confirmation",
    name: "Customer Welcome & Signup Confirmation",
    subject: "Welcome to Kichee's Baked Delights, {{customer_name}}! 🎂",
    variables: ["customer_name", "customer_email", "login_url", "discount_code"],
    is_active: true,
    body_text: "Welcome to Kichee's Baked Delights! Your account is ready. Explore slow-crafted European gateaux and fresh morning bakes.",
    body_html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Welcome to Kichee's Baked Delights</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf7f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d241e;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf7f2; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #ebd9c8;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(180deg, #fff9f3 0%, #ffffff 100%); border-bottom: 1px solid #f3e9df;">
              <img src="https://kicheesbakeddelights.com/wp-content/uploads/2025/02/kichees-baked-delights-bakery-logo.png" alt="Kichee's Baked Delights" width="160" style="max-width: 160px; height: auto; display: block; margin: 0 auto 12px;" />
              <p style="margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #b45309; font-weight: 700;">Artisanal European Bakery • Chennai</p>
            </td>
          </tr>

          <!-- Hero Image Banner -->
          <tr>
            <td style="padding: 0; position: relative;">
              <img src="https://uiftoqlzlarfkfzqnedk.supabase.co/storage/v1/object/public/site-assets/hero-truffle.jpg" alt="Artisanal Belgian Truffle Cake" width="600" style="width: 100%; height: 240px; object-fit: cover; display: block;" onerror="this.src='https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&q=80'" />
            </td>
          </tr>

          <!-- Welcome Content -->
          <tr>
            <td style="padding: 36px 32px 24px;">
              <h1 style="margin: 0 0 16px; font-size: 26px; line-height: 1.3; color: #382013; font-weight: 800;">Welcome to the Family, {{customer_name}}!</h1>
              <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.6; color: #57463b;">
                Thank you for creating an account with <strong>Kichee's Baked Delights</strong>. From our kitchen in Nungambakkam, we bake slow-crafted gateaux using pure 54% Callebaut Belgian chocolate, cultured French-style butter, and zero synthetic preservatives.
              </p>
              
              <!-- Promo Highlight Box -->
              <div style="background-color: #fef8ee; border: 1.5px dashed #d97706; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <p style="margin: 0 0 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #92400e;">Your Welcome Gift</p>
                <div style="font-size: 24px; font-weight: 800; color: #78350f; letter-spacing: 3px; margin: 4px 0 6px;">{{discount_code}}</div>
                <p style="margin: 0; font-size: 13px; color: #b45309;">Enjoy 10% off your first celebration cake or morning pastry batch!</p>
              </div>

              <!-- Button CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px auto 12px;">
                <tr>
                  <td align="center" style="border-radius: 30px; background-color: #78350f;">
                    <a href="{{login_url}}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 30px; letter-spacing: 0.5px;">Explore the Bakery Menu &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Featured Showcase Row -->
          <tr>
            <td style="padding: 12px 32px 32px; background-color: #fffbf7; border-top: 1px solid #f3e9df;">
              <h3 style="margin: 0 0 16px; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; color: #78350f; text-align: center;">Our Daily Kitchen Specialties</h3>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="31%" style="padding: 6px; text-align: center; vertical-align: top;">
                    <img src="https://uiftoqlzlarfkfzqnedk.supabase.co/storage/v1/object/public/site-assets/hero-truffle.jpg" alt="Belgian Truffle" width="140" style="width: 100%; height: 90px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80'" />
                    <p style="margin: 8px 0 2px; font-size: 12px; font-weight: 700; color: #382013;">Belgian Truffle</p>
                    <span style="font-size: 11px; color: #8c7667;">54% Callebaut</span>
                  </td>
                  <td width="31%" style="padding: 6px; text-align: center; vertical-align: top;">
                    <img src="https://uiftoqlzlarfkfzqnedk.supabase.co/storage/v1/object/public/site-assets/fudge-brownies.jpg" alt="Molten Fudge Brownies" width="140" style="width: 100%; height: 90px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&q=80'" />
                    <p style="margin: 8px 0 2px; font-size: 12px; font-weight: 700; color: #382013;">Fudge Brownies</p>
                    <span style="font-size: 11px; color: #8c7667;">Toasted Walnuts</span>
                  </td>
                  <td width="31%" style="padding: 6px; text-align: center; vertical-align: top;">
                    <img src="https://uiftoqlzlarfkfzqnedk.supabase.co/storage/v1/object/public/site-assets/celebration-cake.jpg" alt="Celebration Gateaux" width="140" style="width: 100%; height: 90px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=300&q=80'" />
                    <p style="margin: 8px 0 2px; font-size: 12px; font-weight: 700; color: #382013;">Pistachio Rose</p>
                    <span style="font-size: 11px; color: #8c7667;">Hand-Piped</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #2b1a10; color: #d6c6b9; text-align: center; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 6px; font-weight: 700; color: #ffffff;">Kichee's Baked Delights</p>
              <p style="margin: 0 0 6px;">14/2, Sterling Road, Nungambakkam, Chennai - 600034</p>
              <p style="margin: 0 0 12px;">Call / WhatsApp: +91 98402 12345 • Mon - Sun: 8:00 AM - 10:30 PM</p>
              <p style="margin: 0; color: #9c8a7d; font-size: 11px;">&copy; 2026 Kichee's Baked Delights. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: "tmpl-order",
    template_key: "order_confirmation",
    name: "Customer Order Confirmation & Invoice",
    subject: "Order Confirmed: #{{order_number}} • Kichee's Baked Delights 🎂",
    variables: ["order_number", "customer_name", "items_table", "total_amount", "delivery_type", "delivery_date", "delivery_address", "track_url"],
    is_active: true,
    body_text: "Your order #{{order_number}} has been confirmed! We are preparing your fresh bake.",
    body_html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Order Confirmation #{{order_number}}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf7f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d241e;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf7f2; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #ebd9c8;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px; text-align: center; background: linear-gradient(180deg, #fff9f3 0%, #ffffff 100%); border-bottom: 1px solid #f3e9df;">
              <img src="https://kicheesbakeddelights.com/wp-content/uploads/2025/02/kichees-baked-delights-bakery-logo.png" alt="Kichee's Baked Delights" width="150" style="max-width: 150px; height: auto; display: block; margin: 0 auto 10px;" />
              <div style="display: inline-block; background-color: #ecfdf5; color: #047857; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 20px; border: 1px solid #a7f3d0; text-transform: uppercase; letter-spacing: 1px;">
                ✓ Order Confirmed & Paid
              </div>
            </td>
          </tr>

          <!-- Order Summary Header -->
          <tr>
            <td style="padding: 28px 32px 16px;">
              <h1 style="margin: 0 0 8px; font-size: 22px; color: #382013; font-weight: 800;">Thank you, {{customer_name}}!</h1>
              <p style="margin: 0 0 20px; font-size: 14px; color: #6b574a; line-height: 1.5;">
                We have received your order <strong>#{{order_number}}</strong>. Our pastry chefs are preparing your bake with the freshest ingredients.
              </p>

              <!-- Delivery & Slot Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf5ef; border-radius: 10px; padding: 16px; margin-bottom: 24px; border: 1px solid #ebd9c8;">
                <tr>
                  <td width="50%" style="vertical-align: top; padding: 6px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #8c7667; font-weight: 700; letter-spacing: 0.5px;">Fulfilment Method</div>
                    <div style="font-size: 14px; font-weight: 700; color: #382013; margin-top: 2px;">{{delivery_type}}</div>
                    <div style="font-size: 12px; color: #6b574a; margin-top: 2px;">{{delivery_address}}</div>
                  </td>
                  <td width="50%" style="vertical-align: top; padding: 6px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #8c7667; font-weight: 700; letter-spacing: 0.5px;">Requested Schedule</div>
                    <div style="font-size: 14px; font-weight: 700; color: #78350f; margin-top: 2px;">{{delivery_date}}</div>
                    <div style="font-size: 12px; color: #6b574a; margin-top: 2px;">Fresh from oven</div>
                  </td>
                </tr>
              </table>

              <!-- Order Items Section -->
              <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #78350f;">Order Summary</h3>
              
              <div style="border: 1px solid #f0e4d7; border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
                {{items_table}}
              </div>

              <!-- Total Row -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="right" style="font-size: 16px; font-weight: 800; color: #382013;">
                    Total Paid: <span style="color: #78350f; font-size: 20px;">₹{{total_amount}}</span>
                  </td>
                </tr>
              </table>

              <!-- Action Track Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 20px auto 8px;">
                <tr>
                  <td align="center" style="border-radius: 30px; background-color: #78350f;">
                    <a href="{{track_url}}" target="_blank" style="display: inline-block; padding: 13px 28px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 30px;">Track Live Baking Status &rarr;</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #2b1a10; color: #d6c6b9; text-align: center; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 4px; font-weight: 700; color: #ffffff;">Kichee's Kitchen Counter</p>
              <p style="margin: 0 0 4px;">14/2, Sterling Road, Nungambakkam, Chennai - 600034</p>
              <p style="margin: 0;">Order helpline: +91 98402 12345 • support@kicheesbakeddelights.in</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: "tmpl-status",
    template_key: "order_status_update",
    name: "Order Status Update / Dispatch Notice",
    subject: "Update: Your Kichee's Order #{{order_number}} is {{new_status}}! 🚗",
    variables: ["order_number", "customer_name", "new_status", "status_message", "track_url"],
    is_active: true,
    body_text: "Your order #{{order_number}} is now {{new_status}}. {{status_message}}",
    body_html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Order Status Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf7f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d241e;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf7f2; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #ebd9c8;">
          
          <tr>
            <td style="padding: 24px; text-align: center; border-bottom: 1px solid #f3e9df;">
              <img src="https://kicheesbakeddelights.com/wp-content/uploads/2025/02/kichees-baked-delights-bakery-logo.png" alt="Kichee's" width="140" style="display: block; margin: 0 auto 8px;" />
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 28px; text-align: center;">
              <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #b45309; margin-bottom: 8px;">Order #{{order_number}}</div>
              <h2 style="margin: 0 0 16px; font-size: 24px; color: #382013; font-weight: 800;">Status: {{new_status}}</h2>
              <p style="margin: 0 0 24px; font-size: 15px; color: #57463b; line-height: 1.6;">
                {{status_message}}
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 30px; background-color: #78350f;">
                    <a href="{{track_url}}" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 30px;">View Live Details &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 16px; background-color: #2b1a10; color: #d6c6b9; text-align: center; font-size: 11px;">
              Kichee's Baked Delights • Sterling Road, Nungambakkam, Chennai
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
];

async function seedDatabase() {
  console.log("Starting Supabase database seeding...");

  // 1. Seed Categories
  console.log(`Seeding ${CATEGORIES.length} categories...`);
  const { error: catErr } = await supabase.from("categories").upsert(CATEGORIES);
  if (catErr) console.error("Categories error:", catErr);
  else console.log("Categories seeded successfully.");

  // 2. Seed Products
  console.log(`Seeding ${PRODUCTS.length} products...`);
  const { error: prodErr } = await supabase.from("products").upsert(PRODUCTS);
  if (prodErr) console.error("Products error:", prodErr);
  else console.log("Products seeded successfully.");

  // 3. Seed CMS Blocks
  console.log(`Seeding ${CMS_BLOCKS.length} CMS blocks...`);
  const { error: cmsErr } = await supabase.from("cms_blocks").upsert(CMS_BLOCKS);
  if (cmsErr) console.error("CMS blocks error:", cmsErr);
  else console.log("CMS blocks seeded successfully.");

  // 4. Seed CMS Settings
  console.log(`Seeding ${CMS_SETTINGS.length} CMS settings...`);
  const { error: setErr } = await supabase.from("cms_settings").upsert(CMS_SETTINGS);
  if (setErr) console.error("CMS settings error:", setErr);
  else console.log("CMS settings seeded successfully.");

  // 5. Seed Email Templates
  console.log(`Seeding ${EMAIL_TEMPLATES.length} Email Templates...`);
  const { error: tmplErr } = await supabase.from("email_templates").upsert(EMAIL_TEMPLATES);
  if (tmplErr) console.error("Email templates error:", tmplErr);
  else console.log("Email templates seeded successfully.");

  console.log("Database seeding completed successfully!");
}

seedDatabase().catch(console.error);
