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
  category: "cakes" | "brownies" | "pastries" | "eggless" | "celebrations";
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

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    slug: "belgian-chocolate-truffle",
    name: "Belgian Dark Chocolate Truffle",
    category: "cakes",
    shortDescription: "Silky 54% Callebaut ganache, moist dark sponge, fresh berries.",
    description: "Our signature masterpiece. Three layers of slow-baked dark cocoa sponge soaked in mild espresso syrup, smothered in velvety 54% Belgian Callebaut chocolate ganache, and topped with fresh seasonal berries and edible gold leaf.",
    image: "/images/hero-truffle.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: true,
    prepTime: "2 hours",
    ingredients: ["54% Callebaut Belgian Chocolate", "Pure Dairy Cream", "Unsalted Butter", "Dutch Process Cocoa"],
    variants: [
      { id: "v1-1", label: "0.5 kg", weight: "0.5 kg", price: 650, servings: "3-4 servings" },
      { id: "v1-2", label: "1.0 kg", weight: "1.0 kg", price: 1200, servings: "6-8 servings" },
      { id: "v1-3", label: "1.5 kg", weight: "1.5 kg", price: 1750, servings: "10-12 servings" },
      { id: "v1-4", label: "2.0 kg", weight: "2.0 kg", price: 2300, servings: "14-16 servings" },
    ],
  },
  {
    id: "prod-2",
    slug: "fudge-walnut-brownies",
    name: "Classic Fudge & Walnut Brownies",
    category: "brownies",
    shortDescription: "Dense, chewy molten center with crisp sea salt crust.",
    description: "Baked fresh every morning in small batches. Made with pure melted dark chocolate, browned farm butter, and toasted California walnuts. Crisp papery top with a deep, fudgy, decadent core.",
    image: "/images/fudge-brownies.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: true,
    prepTime: "Ready now",
    ingredients: ["70% Dark Chocolate", "Brown Butter", "California Walnuts", "Maldon Sea Salt"],
    variants: [
      { id: "v2-1", label: "Box of 6", weight: "380g", price: 480, servings: "6 pieces" },
      { id: "v2-2", label: "Box of 12", weight: "760g", price: 920, servings: "12 pieces" },
    ],
  },
  {
    id: "prod-3",
    slug: "mascarpone-fig-celebration",
    name: "Mascarpone & Wildflower Celebration Gateau",
    category: "celebrations",
    shortDescription: "Whipped mascarpone, caramelised fresh figs, roasted pistachios.",
    description: "Designed for milestone celebrations. Delicate almond chiffon layers infused with Madagascar bourbon vanilla, filled with whipped Italian mascarpone and caramelised fresh figs, finished with organic crushed pistachios and hand-picked edible blossoms.",
    image: "/images/celebration-cake.jpg",
    isEggless: false,
    isBestSeller: false,
    isFeatured: true,
    prepTime: "4 hours advance",
    ingredients: ["Italian Mascarpone", "Fresh Figs", "Iranian Pistachios", "Madagascar Vanilla"],
    variants: [
      { id: "v3-1", label: "1.0 kg", weight: "1.0 kg", price: 1450, servings: "6-8 guests" },
      { id: "v3-2", label: "2.0 kg", weight: "2.0 kg", price: 2800, servings: "14-16 guests" },
      { id: "v3-3", label: "3.0 kg (2-Tier)", weight: "3.0 kg", price: 4100, servings: "22-26 guests" },
    ],
  },
  {
    id: "prod-4",
    slug: "roasted-hazelnut-praline-gateau",
    name: "Roasted Hazelnut Praline Gateau",
    category: "cakes",
    shortDescription: "Piedmont hazelnut butter, dark chocolate mousse, feuilletine crunch.",
    description: "Layers of hazelnut dacquoise sponge, slow-simmered hazelnut praline paste, and light 64% chocolate mousse, crowned with a crunchy French feuilletine wafer base.",
    image: "/images/hero-truffle.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: false,
    prepTime: "2 hours",
    ingredients: ["Piedmont Hazelnut", "64% Dark Chocolate", "French Feuilletine", "Pure Butter"],
    variants: [
      { id: "v4-1", label: "0.5 kg", weight: "0.5 kg", price: 750, servings: "3-4 servings" },
      { id: "v4-2", label: "1.0 kg", weight: "1.0 kg", price: 1400, servings: "6-8 servings" },
      { id: "v4-3", label: "2.0 kg", weight: "2.0 kg", price: 2700, servings: "14-16 servings" },
    ],
  },
  {
    id: "prod-5",
    slug: "philadelphia-red-velvet",
    name: "Classic Philadelphia Red Velvet",
    category: "cakes",
    shortDescription: "Cultured buttermilk cocoa crumb with genuine Philadelphia cream cheese.",
    description: "Not the artificial red sponge you find elsewhere. Handcrafted with fermented Dutch cocoa, buttermilk reduction, and lavish lashings of tart, whipped Philadelphia cream cheese.",
    image: "/images/celebration-cake.jpg",
    isEggless: true,
    isBestSeller: false,
    isFeatured: false,
    prepTime: "2 hours",
    ingredients: ["Philadelphia Cream Cheese", "Cultured Buttermilk", "Raw Cocoa", "Pure Vanilla"],
    variants: [
      { id: "v5-1", label: "0.5 kg", weight: "0.5 kg", price: 700, servings: "3-4 servings" },
      { id: "v5-2", label: "1.0 kg", weight: "1.0 kg", price: 1350, servings: "6-8 servings" },
    ],
  },
  {
    id: "prod-6",
    slug: "blueberry-opera-pastry",
    name: "Blueberry & Dark Chocolate Opera",
    category: "pastries",
    shortDescription: "Six layers of almond Joconde sponge, mountain blueberry compote, and ganache.",
    description: "Classic French pastry architecture reimagined. Delicate almond Joconde sheets brushed with blueberry reduction, layered with dark chocolate ganache and tart mountain berry compote.",
    image: "/images/hero-truffle.jpg",
    isEggless: true,
    isBestSeller: false,
    isFeatured: false,
    prepTime: "Ready at counter",
    ingredients: ["Wild Blueberries", "Almond Flour", "Dark Ganache", "French Buttercream"],
    variants: [
      { id: "v6-1", label: "Single Slice", weight: "120g", price: 190, servings: "1 serving" },
      { id: "v6-2", label: "Box of 4", weight: "480g", price: 720, servings: "4 servings" },
    ],
  },
  {
    id: "prod-7",
    slug: "pistachio-rose-entremet",
    name: "Persian Pistachio & Rose Entremet",
    category: "pastries",
    shortDescription: "Silky Iranian pistachio bavarois with damask rose jelly and sablé crunch.",
    description: "Subtle and fragrant. Roasted Iranian pistachio bavarois enclosing an organic Damask rose and raspberry gelée center, resting on an almond cardamom sablé biscuit.",
    image: "/images/celebration-cake.jpg",
    isEggless: true,
    isBestSeller: false,
    isFeatured: true,
    prepTime: "Ready at counter",
    ingredients: ["Iranian Pistachio", "Damask Rose", "Cardamom Sablé", "Raspberry Coulis"],
    variants: [
      { id: "v7-1", label: "Single Slice", weight: "135g", price: 210, servings: "1 serving" },
      { id: "v7-2", label: "Box of 4", weight: "540g", price: 800, servings: "4 servings" },
    ],
  },
  {
    id: "prod-8",
    slug: "seasonal-alphonso-gateau",
    name: "Fresh Alphonso Mango Gateau",
    category: "cakes",
    shortDescription: "Fresh Ratnagiri mango slices, coconut cream chantilly, light sponge.",
    description: "Seasonal sensation. Sweet Ratnagiri Alphonso mango slices folded into airy chiffon sponge and crowned with coconut cream chantilly and fresh mint.",
    image: "/images/celebration-cake.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: false,
    prepTime: "3 hours",
    ingredients: ["Ratnagiri Alphonso Mango", "Coconut Chantilly", "Chiffon Sponge", "Raw Honey"],
    variants: [
      { id: "v8-1", label: "0.5 kg", weight: "0.5 kg", price: 800, servings: "3-4 servings" },
      { id: "v8-2", label: "1.0 kg", weight: "1.0 kg", price: 1550, servings: "6-8 servings" },
    ],
  },
];
