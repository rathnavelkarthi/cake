const fs = require('fs');
const path = require('path');

const photoDir = path.join(__dirname, '../cake phots');
const files = fs.readdirSync(photoDir).filter(f => f.endsWith('.jpg'));

console.log(`Found ${files.length} photo files.`);

function cleanName(filename) {
  let name = filename.replace(/\.jpg$/i, '');
  // Remove trailing timestamp
  name = name.replace(/_\d{8,16}$/, '');
  // Remove common studio suffix descriptors
  name = name.replace(/_(food_photography|photography|tabletop|on_tabletop|on_table|prepared|in_studio|freshly_prepared|displayed|slice|dish|served|recipe_story|with_sauce|combo_served_with|freshly_prepared_on_tabletop|garnished_with_onion|dry-fried_spiced_m\.|in_spicy_sauce|in_savory_sauce|in_dark_gravy|in_gravy|cooked_with_peas|filling_food\.|with_caramel_d\.|slice_on_tab\.|with_whipped_cream|with_cream_cheese|with_haz\.|with_whipped|with_sugar|with_raisins|with_melted_cheese|with_bell_peppers|with_condiments|with_lettuce|with_roasted_peanuts|with_spices|with_tartare_sauce|with_curry_leaves|with_chutney|served_with_raita|served_with_chutney|served_with_ghee|served_in_restaurant|served_in_studio|deep-fried|oozing_chocolate|stacked_on_tabletop|sweet_filling|preparation|on_ivory_tabletop|seasoned_wit\.|stir-fried|stir-fried_with_\.|with_tomato_sauce|with_mixed_vegetables)$/i, '');
  // Replace underscores with spaces
  name = name.replace(/_/g, ' ').trim();
  // Capitalize title
  name = name.split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '').join(' ');
  return name;
}

function getCategoryAndDietary(name) {
  const lower = name.toLowerCase();
  let category = "Signature Cakes";
  let isEggless = true;
  let price = 650;

  if (lower.includes("chicken") || lower.includes("mutton") || lower.includes("fish") || lower.includes("prawn") || lower.includes("crab") || lower.includes("squid") || lower.includes("egg") || lower.includes("tuna") || lower.includes("vanjaram") || lower.includes("mackerel") || lower.includes("nethili") || lower.includes("pomfret")) {
    isEggless = false;
  }

  if (lower.includes("cake") || lower.includes("tres leches")) {
    category = "Signature Cakes";
    price = 650 + (Math.floor(Math.random() * 6) * 50); // 650 - 900
  } else if (lower.includes("pastry") || lower.includes("mousse") || lower.includes("pudding")) {
    category = "Fresh Pastries & Desserts";
    price = 120 + (Math.floor(Math.random() * 5) * 10); // 120 - 160
  } else if (lower.includes("brownie") || lower.includes("brookie") || lower.includes("lava")) {
    category = "Brownies & Brookies";
    price = 140 + (Math.floor(Math.random() * 4) * 15); // 140 - 185
  } else if (lower.includes("donut") || lower.includes("bun") || lower.includes("roll") && (lower.includes("cinnamon") || lower.includes("sweet"))) {
    category = "Gourmet Donuts & Buns";
    price = 85 + (Math.floor(Math.random() * 4) * 15); // 85 - 130
  } else if (lower.includes("cookie") || lower.includes("nankhatai")) {
    category = "Artisan Cookies";
    price = 90 + (Math.floor(Math.random() * 5) * 20); // 90 - 170
  } else if (lower.includes("puff") || lower.includes("samosa") || lower.includes("cutlet") || lower.includes("croissant") || lower.includes("empanada") || lower.includes("quiche") || lower.includes("danish")) {
    category = "Savory Puffs & Bites";
    price = isEggless ? 45 + (Math.floor(Math.random() * 4) * 10) : 65 + (Math.floor(Math.random() * 4) * 10);
  } else if (lower.includes("sandwich") || lower.includes("burger") || lower.includes("hot dog") || lower.includes("sub") || lower.includes("wrap") || lower.includes("shawarma") || (lower.includes("roll") && !lower.includes("cinnamon") && !lower.includes("spring"))) {
    category = "Sandwiches & Handhelds";
    price = isEggless ? 140 + (Math.floor(Math.random() * 5) * 15) : 180 + (Math.floor(Math.random() * 5) * 15);
  } else if (lower.includes("pizza")) {
    category = "Artisanal Pizzas";
    price = isEggless ? 260 + (Math.floor(Math.random() * 5) * 20) : 340 + (Math.floor(Math.random() * 5) * 20);
  } else if (lower.includes("pasta") || lower.includes("mac and cheese")) {
    category = "Artisanal Pastas";
    price = isEggless ? 220 + (Math.floor(Math.random() * 4) * 20) : 280 + (Math.floor(Math.random() * 4) * 20);
  } else if (lower.includes("biryani") || lower.includes("rice") || lower.includes("kothu") || lower.includes("parotta") || lower.includes("noodles")) {
    category = "Bistro Mains & Rice";
    price = isEggless ? 180 + (Math.floor(Math.random() * 5) * 20) : 240 + (Math.floor(Math.random() * 6) * 20);
  } else if (lower.includes("dosa") || lower.includes("idli") || lower.includes("pongal") || lower.includes("uthappam")) {
    category = "South Indian Specials";
    price = 90 + (Math.floor(Math.random() * 5) * 15);
  } else {
    category = "Kitchen Starters & Sides";
    price = isEggless ? 160 + (Math.floor(Math.random() * 4) * 20) : 220 + (Math.floor(Math.random() * 5) * 20);
  }

  return { category, isEggless, price };
}

const products = files.map((file, idx) => {
  const sku = `KCH-PROD-${String(idx + 1).padStart(3, '0')}`;
  const name = cleanName(file);
  const { category, isEggless, price } = getCategoryAndDietary(name);
  const stock = 10 + (idx % 25);
  const lowStockThreshold = 5;
  const description = `Freshly prepared ${name} crafted with premium quality ingredients at Kichee's Bakery & Bistro.`;

  return {
    sku,
    name,
    category,
    price,
    salePrice: idx % 7 === 0 ? price - 30 : null,
    stock,
    lowStockThreshold,
    description,
    isEggless,
    isActive: true,
    isFeatured: idx % 10 === 0,
    isBestSeller: idx % 8 === 0,
    image: file,
    productType: "FINISHED_PRODUCT",
    availableBranches: "all",
    recipe: "Refined Wheat Flour (Maida) 150g; Unsalted Dairy Butter 80g; Granulated White Sugar 60g"
  };
});

const tsContent = `/**
 * Seed dataset of 200 finished bakery and bistro products.
 * Directly mapped to images in 'cake phots'.
 */

export interface SeedProduct {
  sku: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  lowStockThreshold: number;
  description: string;
  isEggless: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  image: string;
  productType: "FINISHED_PRODUCT";
  availableBranches: string;
  recipe?: string;
}

export const SEED_200_PRODUCTS: SeedProduct[] = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/seed-200-products.ts'), tsContent, 'utf-8');
console.log(`Generated src/data/seed-200-products.ts with ${products.length} products.`);
