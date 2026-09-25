import { Category, Product } from "./types";

export const CATEGORIES: Category[] = [
  { id: "all", slug: "all", name: "All Items", description: "Fresh from the morning oven" },
  { id: "cakes", slug: "cakes", name: "Signature Cakes", description: "Multi-layered artisanal gateaux" },
  { id: "brownies", slug: "brownies", name: "Brownies & Desserts", description: "Dense fudge brownies, tarts & tea cakes" },
  { id: "pastries", slug: "pastries", name: "French Pastries", description: "Delicate layered single-portion gateaux" },
  { id: "savouries", slug: "savouries", name: "Savouries & Buns", description: "Flaky puffs, Korean buns & fresh bakes" },
  { id: "bites", slug: "bites", name: "Burgers & Quick Bites", description: "Sandwiches, burgers, momos & fries" },
  { id: "waffles", slug: "waffles", name: "Waffles & Ice Cream", description: "Warm Belgian waffles & artisan scoops" },
  { id: "beverages", slug: "beverages", name: "Beverages & Shakes", description: "Madras filter coffee, juices & thickshakes" },
  { id: "cookies", slug: "cookies", name: "Chocolates & Cookies", description: "Handmade tea cookies & gift boxes" },
  { id: "eggless", slug: "eggless", name: "100% Eggless", description: "Dedicated counter & pure bakes" },
];

export const PRODUCTS: Product[] = [
  // --- SIGNATURE CAKES ---
  {
    id: "kch-cake-01",
    slug: "belgian-dark-chocolate-truffle",
    sku: "KCH-TRF-01",
    name: "Belgian Dark Chocolate Truffle",
    categoryId: "cakes",
    categoryName: "Signature Cakes",
    shortDescription: "Silky 54% Callebaut ganache, moist dark sponge, cocoa nibs & berries.",
    description: "Our signature gateau. Three layers of slow-baked dark cocoa sponge soaked in mild espresso syrup, enrobed in velvety 54% Belgian Callebaut chocolate ganache, and crowned with fresh seasonal berries and gold specks.",
    image: "/images/hero-truffle.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: true,
    preparationTime: "2 hours",
    ingredients: ["54% Callebaut Dark Chocolate", "Pure Dairy Cream", "Unsalted Butter", "Dutch Cocoa"],
    allergens: ["Dairy", "Gluten"],
    storageInstructions: "Keep refrigerated at 4-8°C. Best enjoyed at room temperature 15 minutes before serving.",
    flavourNotes: ["54% Callebaut Ganache", "Mild Espresso Maceration", "Gold Leaf & Fresh Berries"],
    tastingProfile: { cacaoIntensity: 85, sweetness: "Refined Dark", richness: 90, texture: "Velvety Slow-Melt Silk" },
    variants: [
      { id: "v-trf-500", sku: "KCH-TRF-500G", label: "0.5 kg", weight: "0.5 kg", price: 650, servings: "3 to 4 servings", inStock: true },
      { id: "v-trf-1000", sku: "KCH-TRF-1KG", label: "1.0 kg", weight: "1.0 kg", price: 1200, servings: "6 to 8 servings", inStock: true },
      { id: "v-trf-1500", sku: "KCH-TRF-1.5KG", label: "1.5 kg", weight: "1.5 kg", price: 1750, servings: "10 to 12 servings", inStock: true },
      { id: "v-trf-2000", sku: "KCH-TRF-2KG", label: "2.0 kg", weight: "2.0 kg", price: 2300, servings: "14 to 16 servings", inStock: true },
    ],
  },
  {
    id: "kch-cake-rv",
    slug: "classic-red-velvet",
    sku: "KCH-RV-01",
    name: "Classic Red Velvet Gateau",
    categoryId: "cakes",
    categoryName: "Signature Cakes",
    shortDescription: "Cultured buttermilk cocoa crumb with whipped cream cheese frosting.",
    description: "Authentic red velvet sponge infused with natural cocoa and cultured buttermilk, layered with tangy whipped cream cheese frosting.",
    image: "/custom-cakes/cake-2.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: true,
    preparationTime: "2 hours",
    ingredients: ["Cultured Buttermilk", "Pure Cream Cheese", "Dutch Cocoa", "Vanilla Pod"],
    variants: [
      { id: "v-rv-500", sku: "KCH-RV-500G", label: "0.5 kg", weight: "0.5 kg", price: 708, servings: "3 to 4 servings", inStock: true },
      { id: "v-rv-1000", sku: "KCH-RV-1KG", label: "1.0 kg", weight: "1.0 kg", price: 1526, servings: "6 to 8 servings", inStock: true },
    ],
  },
  {
    id: "kch-cake-fr",
    slug: "ferrero-rocher-grandeur",
    sku: "KCH-FR-01",
    name: "Ferrero Rocher Grandeur",
    categoryId: "cakes",
    categoryName: "Signature Cakes",
    shortDescription: "Toasted hazelnut gianduja, chocolate drip, whole Ferrero rochers.",
    description: "Decadent dark chocolate layers stuffed with roasted hazelnut crunch, topped with a dark chocolate drip, hazelnut praline, and gold-dusted Ferrero Rochers.",
    image: "/custom-cakes/cake-3.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: true,
    preparationTime: "3 hours",
    ingredients: ["Roasted Hazelnuts", "Gianduja Praline", "54% Callebaut Dark", "Pure Cream"],
    variants: [
      { id: "v-fr-500", sku: "KCH-FR-500G", label: "0.5 kg", weight: "0.5 kg", price: 872, servings: "3 to 4 servings", inStock: true },
      { id: "v-fr-1000", sku: "KCH-FR-1KG", label: "1.0 kg", weight: "1.0 kg", price: 1852, servings: "6 to 8 servings", inStock: true },
    ],
  },
  {
    id: "kch-cake-ras",
    slug: "rasmalai-melts-celebration-cake",
    sku: "KCH-RAS-01",
    name: "Rasmalai Melts Celebration Cake",
    categoryId: "cakes",
    categoryName: "Signature Cakes",
    shortDescription: "Saffron-soaked milk sponge, fresh cottage cheese dumplings & pistachios.",
    description: "A royal fusion. Fluffy cardamom-infused vanilla sponge soaked in slow-simmered saffron rabri, layered with soft cottage cheese rasmalai discs and slivered Iranian pistachios.",
    image: "/custom-cakes/cake-4.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: true,
    preparationTime: "3 hours",
    ingredients: ["Fresh Chenna Rasmalai", "Kashmiri Saffron", "Cardamom", "Pistachio Slivers"],
    variants: [
      { id: "v-ras-500", sku: "KCH-RAS-500G", label: "0.5 kg", weight: "0.5 kg", price: 817, servings: "3 to 4 servings", inStock: true },
      { id: "v-ras-1000", sku: "KCH-RAS-1KG", label: "1.0 kg", weight: "1.0 kg", price: 1743, servings: "6 to 8 servings", inStock: true },
    ],
  },
  {
    id: "kch-cake-rm",
    slug: "chennai-rosemilk-cake",
    sku: "KCH-RM-01",
    name: "Chennai Rosemilk Cake",
    categoryId: "cakes",
    categoryName: "Signature Cakes",
    shortDescription: "Aromatic rose syrup sponge, light dairy chantilly & edible dried rose petals.",
    description: "Inspired by iconic Chennai memories. Light chiffon sponge soaked in fragrant rose reduction milk, covered in light pink chantilly and finished with dried organic rose petals.",
    image: "/custom-cakes/cake-5.jpg",
    isEggless: true,
    isBestSeller: false,
    isFeatured: true,
    preparationTime: "2 hours",
    ingredients: ["Organic Damask Rose Syrup", "Dairy Whipping Cream", "Cardamom", "Dried Petals"],
    variants: [
      { id: "v-rm-500", sku: "KCH-RM-500G", label: "0.5 kg", weight: "0.5 kg", price: 817, servings: "3 to 4 servings", inStock: true },
      { id: "v-rm-1000", sku: "KCH-RM-1KG", label: "1.0 kg", weight: "1.0 kg", price: 1743, servings: "6 to 8 servings", inStock: true },
    ],
  },
  {
    id: "kch-cake-bf",
    slug: "black-forest-gateau",
    sku: "KCH-BF-01",
    name: "Black Forest Gateau",
    categoryId: "cakes",
    categoryName: "Signature Cakes",
    shortDescription: "Dark chocolate shavings, sour cherries, whipped cream & cocoa sponge.",
    description: "The time-tested European classic. Dark chocolate sponge layered with macerated sour cherries and light vanilla chantilly, wrapped in dark chocolate shavings.",
    image: "/custom-cakes/cake-6.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: false,
    preparationTime: "2 hours",
    ingredients: ["Dark Chocolate Shavings", "Sour Cherries", "Vanilla Chantilly", "Cocoa Sponge"],
    variants: [
      { id: "v-bf-500", sku: "KCH-BF-500G", label: "0.5 kg", weight: "0.5 kg", price: 654, servings: "3 to 4 servings", inStock: true },
      { id: "v-bf-1000", sku: "KCH-BF-1KG", label: "1.0 kg", weight: "1.0 kg", price: 1416, servings: "6 to 8 servings", inStock: true },
    ],
  },
  {
    id: "kch-cake-pa",
    slug: "pineapple-bliss",
    sku: "KCH-PA-01",
    name: "Pineapple Bliss Cake",
    categoryId: "cakes",
    categoryName: "Signature Cakes",
    shortDescription: "Candied Queen pineapple tidbits, fresh vanilla cream & mirror glaze.",
    description: "Sun-ripened sweet pineapple compote folded between airy vanilla sponge sheets, topped with yellow mirror glaze and fresh glazed cherries.",
    image: "/custom-cakes/cake-7.jpg",
    isEggless: true,
    isBestSeller: false,
    isFeatured: false,
    preparationTime: "2 hours",
    ingredients: ["Queen Pineapples", "Dairy Cream", "Vanilla Chiffon", "Glazed Cherries"],
    variants: [
      { id: "v-pa-500", sku: "KCH-PA-500G", label: "0.5 kg", weight: "0.5 kg", price: 600, servings: "3 to 4 servings", inStock: true },
      { id: "v-pa-1000", sku: "KCH-PA-1KG", label: "1.0 kg", weight: "1.0 kg", price: 1307, servings: "6 to 8 servings", inStock: true },
    ],
  },
  {
    id: "kch-cake-02",
    slug: "mascarpone-fig-celebration-gateau",
    sku: "KCH-FIG-01",
    name: "Mascarpone & Fig Celebration Gateau",
    categoryId: "cakes",
    categoryName: "Signature Cakes",
    shortDescription: "Airy almond sponge, whipped Italian mascarpone, caramelised fresh figs.",
    description: "Delicate almond chiffon sheets brushed with Madagascar vanilla syrup, filled with light whipped Italian mascarpone and caramelised fresh figs, and finished with Iranian pistachio crunch.",
    image: "/images/celebration-cake.jpg",
    isEggless: false,
    isBestSeller: false,
    isFeatured: true,
    preparationTime: "4 hours",
    ingredients: ["Italian Mascarpone", "Fresh Figs", "Iranian Pistachios", "Madagascar Bourbon Vanilla"],
    variants: [
      { id: "v-fig-1000", sku: "KCH-FIG-1KG", label: "1.0 kg", weight: "1.0 kg", price: 1450, servings: "6 to 8 guests", inStock: true },
      { id: "v-fig-2000", sku: "KCH-FIG-2KG", label: "2.0 kg", weight: "2.0 kg", price: 2800, servings: "14 to 16 guests", inStock: true },
    ],
  },

  // --- BROWNIES & DESSERTS ---
  {
    id: "kch-brw-01",
    slug: "classic-dark-chocolate-fudge-brownies",
    sku: "KCH-BRW-01",
    name: "Classic Dark Fudge Brownies",
    categoryId: "brownies",
    categoryName: "Brownies & Desserts",
    shortDescription: "Dense, molten fudge center with toasted California walnuts & sea salt.",
    description: "Baked daily in small morning batches. Made with pure melted dark chocolate, browned farm butter, and toasted California walnuts. A paper-thin crackly top with an intensely rich, molten core.",
    image: "/images/fudge-brownies.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: true,
    preparationTime: "Ready at counter",
    ingredients: ["70% Dark Chocolate", "Browned Butter", "California Walnuts", "Maldon Sea Salt"],
    variants: [
      { id: "v-brw-single", sku: "KCH-BRW-PC", label: "Single Piece", weight: "65g", price: 131, servings: "1 serving", inStock: true },
      { id: "v-brw-6", sku: "KCH-BRW-BOX6", label: "Box of 6", weight: "380g", price: 480, servings: "6 pieces", inStock: true },
    ],
  },
  {
    id: "kch-brw-nut",
    slug: "nutella-fudge-brownie",
    sku: "KCH-BRW-NUT",
    name: "Nutella Fudge Brownie",
    categoryId: "brownies",
    categoryName: "Brownies & Desserts",
    shortDescription: "Swirled with rich Ferrero Nutella hazelnut spread.",
    description: "Our signature dark fudge base swirled deeply with warm Italian Nutella hazelnut cream and sprinkled with toasted hazelnuts.",
    image: "/images/fudge-brownies.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: true,
    preparationTime: "Ready at counter",
    ingredients: ["Pure Nutella", "Dark Chocolate", "Hazelnuts", "Dairy Butter"],
    variants: [
      { id: "v-nut-pc", sku: "KCH-BRW-NUT-PC", label: "Single Piece", weight: "75g", price: 131, servings: "1 serving", inStock: true },
    ],
  },
  {
    id: "kch-brw-bisc",
    slug: "lotus-biscoff-brownie",
    sku: "KCH-BRW-BISC",
    name: "Lotus Biscoff Brownie",
    categoryId: "brownies",
    categoryName: "Brownies & Desserts",
    shortDescription: "Belgian caramelized spiced speculoos cookie butter & crumb.",
    description: "Layered with smooth Belgian Lotus Biscoff speculoos spread, studded with caramelized biscuit crunch and a pinch of cinnamon.",
    image: "/images/fudge-brownies.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: false,
    preparationTime: "Ready at counter",
    ingredients: ["Lotus Biscoff Spread", "Speculoos Biscuits", "Dark Chocolate", "Butter"],
    variants: [
      { id: "v-bisc-pc", sku: "KCH-BRW-BISC-PC", label: "Single Piece", weight: "75g", price: 131, servings: "1 serving", inStock: true },
    ],
  },
  {
    id: "kch-brw-kar",
    slug: "karuppati-palm-jaggery-brownie",
    sku: "KCH-BRW-KAR",
    name: "Karuppati Palm Jaggery Brownie",
    categoryId: "brownies",
    categoryName: "Brownies & Desserts",
    shortDescription: "Pure Tamil Nadu palm jaggery, dark chocolate & toasted cashews.",
    description: "A tribute to Southern confectionery craft. Sweetened solely with authentic organic Karuppati palm jaggery from Tirunelveli, blended with deep dark cocoa and toasted native cashews.",
    image: "/images/fudge-brownies.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: true,
    preparationTime: "Ready at counter",
    ingredients: ["Tirunelveli Karuppati Palm Jaggery", "Dark Cocoa", "Native Cashews", "Dairy Ghee"],
    variants: [
      { id: "v-kar-pc", sku: "KCH-BRW-KAR-PC", label: "Single Piece", weight: "80g", price: 174, servings: "1 serving", inStock: true },
    ],
  },
  {
    id: "kch-des-lava",
    slug: "choco-lava-cake",
    sku: "KCH-LAVA-01",
    name: "Molten Choco Lava Cake",
    categoryId: "brownies",
    categoryName: "Brownies & Desserts",
    shortDescription: "Gooey molten Belgian chocolate core in warm cocoa sponge.",
    description: "Individual warm dessert with a delicate outer crust and an erupting molten Belgian dark chocolate center. Served warm.",
    image: "/custom-cakes/cake-8.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: false,
    preparationTime: "Ready in 10 mins",
    ingredients: ["54% Callebaut Dark", "Farm Butter", "Cacao Powder", "Unbleached Flour"],
    variants: [
      { id: "v-lava-pc", sku: "KCH-LAVA-PC", label: "Single Cup", weight: "110g", price: 98, servings: "1 serving", inStock: true },
    ],
  },
  {
    id: "kch-des-tart",
    slug: "chef-special-tart",
    sku: "KCH-TART-01",
    name: "Chef Special Fruit & Chocolate Tart",
    categoryId: "brownies",
    categoryName: "Brownies & Desserts",
    shortDescription: "Crisp butter sablé crust with silk chocolate ganache and glaze.",
    description: "Handmade butter sablé pastry shell filled with silky dark chocolate ganache and seasonal fruit glaze.",
    image: "/custom-cakes/cake-9.jpg",
    isEggless: true,
    isBestSeller: false,
    isFeatured: false,
    preparationTime: "Ready at counter",
    ingredients: ["French Sablé Crust", "Dark Ganache", "Fresh Fruit Glaze", "Butter"],
    variants: [
      { id: "v-tart-pc", sku: "KCH-TART-PC", label: "Single Tart", weight: "90g", price: 131, servings: "1 serving", inStock: true },
    ],
  },
  {
    id: "kch-cake-ghee",
    slug: "madras-pure-ghee-cake",
    sku: "KCH-GHEE-01",
    name: "Madras Pure Ghee Cake",
    categoryId: "brownies",
    categoryName: "Brownies & Desserts",
    shortDescription: "Slow-baked tea cake enriched with pure cow's ghee and cardamom.",
    description: "Old-world Madras heritage bake. Made with fragrant pure cow's ghee, fresh cardamom, and semolina sponge.",
    image: "/custom-cakes/cake-10.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: false,
    preparationTime: "Ready at counter",
    ingredients: ["Pure Cow's Ghee", "Cardamom Pods", "Semolina", "Unbleached Flour"],
    variants: [
      { id: "v-ghee-pc", sku: "KCH-GHEE-PC", label: "Single Bar", weight: "150g", price: 131, servings: "2 servings", inStock: true },
    ],
  },

  // --- FRENCH PASTRIES ---
  {
    id: "kch-pas-bs",
    slug: "butterscotch-pastry",
    sku: "KCH-PAS-BS",
    name: "Butterscotch Praline Pastry",
    categoryId: "pastries",
    categoryName: "French Pastries",
    shortDescription: "Crunchy butterscotch praline with golden caramel cream.",
    description: "Layers of fluffy vanilla sponge soaked in butterscotch syrup, filled with rich caramel cream and roasted praline crunch.",
    image: "/custom-cakes/cake-11.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: false,
    preparationTime: "Ready at counter",
    ingredients: ["Butterscotch Praline", "Caramel Cream", "Vanilla Sponge", "Dairy Butter"],
    variants: [
      { id: "v-pbs-pc", sku: "KCH-PBS-PC", label: "Single Slice", weight: "120g", price: 87, servings: "1 serving", inStock: true },
    ],
  },
  {
    id: "kch-pas-bf",
    slug: "black-forest-pastry",
    sku: "KCH-PAS-BF",
    name: "Classic Black Forest Pastry",
    categoryId: "pastries",
    categoryName: "French Pastries",
    shortDescription: "Dark chocolate sponge slice with sour cherry and chantilly.",
    description: "Individual slice of traditional Black Forest gateau with fresh cream and dark chocolate curls.",
    image: "/custom-cakes/cake-12.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: false,
    preparationTime: "Ready at counter",
    ingredients: ["Dark Chocolate Curls", "Sour Cherry Compote", "Vanilla Cream"],
    variants: [
      { id: "v-pbf-pc", sku: "KCH-PBF-PC", label: "Single Slice", weight: "125g", price: 109, servings: "1 serving", inStock: true },
    ],
  },
  {
    id: "kch-pas-opera",
    slug: "chef-special-pastry",
    sku: "KCH-PAS-SP",
    name: "Chef Special Opera Pastry",
    categoryId: "pastries",
    categoryName: "French Pastries",
    shortDescription: "Layered almond Joconde sponge, espresso soak & dark ganache.",
    description: "The crown jewel of French pastry craft. Six delicate layers of almond sponge, espresso syrup, French buttercream, and dark chocolate glaze.",
    image: "/custom-cakes/cake-13.jpg",
    isEggless: true,
    isBestSeller: false,
    isFeatured: true,
    preparationTime: "Ready at counter",
    ingredients: ["Almond Joconde", "Espresso Reduction", "Dark Ganache", "French Buttercream"],
    variants: [
      { id: "v-pop-pc", sku: "KCH-POP-PC", label: "Single Slice", weight: "130g", price: 131, servings: "1 serving", inStock: true },
    ],
  },

  // --- SAVOURIES & BUNS ---
  {
    id: "kch-sav-veg",
    slug: "classic-veg-puff",
    sku: "KCH-PUF-VEG",
    name: "Classic Spiced Veg Puff",
    categoryId: "savouries",
    categoryName: "Savouries & Buns",
    shortDescription: "Flaky golden butter puff pastry stuffed with spiced potato and peas.",
    description: "Baked fresh throughout the day. Over 64 flaky laminated butter pastry layers enclosing our heritage spiced potato, green peas, and shallots filling.",
    image: "/images/bakery-counter.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: true,
    preparationTime: "Ready at counter",
    ingredients: ["Laminated Butter Pastry", "Potatoes", "Green Peas", "Garam Masala"],
    variants: [
      { id: "v-puf-veg-pc", sku: "KCH-PUF-V-PC", label: "Single Piece", weight: "110g", price: 70, servings: "1 serving", inStock: true },
    ],
  },
  {
    id: "kch-sav-chk",
    slug: "malabar-chicken-puff",
    sku: "KCH-PUF-CHK",
    name: "Malabar Chicken Puff",
    categoryId: "savouries",
    categoryName: "Savouries & Buns",
    shortDescription: "Flaky golden puff with slow-roasted spiced shredded chicken.",
    description: "Flaky, buttery pastry filled with tender roasted chicken, caramelized onions, curry leaves, and black pepper.",
    image: "/images/bakery-counter.jpg",
    isEggless: false,
    isBestSeller: true,
    isFeatured: true,
    preparationTime: "Ready at counter",
    ingredients: ["Laminated Butter Dough", "Tender Chicken", "Caramelized Onions", "Black Pepper"],
    variants: [
      { id: "v-puf-chk-pc", sku: "KCH-PUF-C-PC", label: "Single Piece", weight: "120g", price: 108, servings: "1 serving", inStock: true },
    ],
  },
  {
    id: "kch-bun-kor",
    slug: "korean-garlic-cheese-bun",
    sku: "KCH-BUN-KOR",
    name: "Korean Garlic Cheese Bun",
    categoryId: "savouries",
    categoryName: "Savouries & Buns",
    shortDescription: "Soft brioche pull-apart bun stuffed with cream cheese and garlic butter.",
    description: "Ultra-soft Japanese brioche bun quartered, piped with sweetened Philadelphia cream cheese, drenched in rich garlic herb butter and oven-toasted golden.",
    image: "/images/bakery-counter.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: true,
    preparationTime: "Ready at counter",
    ingredients: ["Soft Brioche", "Cream Cheese", "Roasted Garlic Butter", "Parsley"],
    variants: [
      { id: "v-kor-pc", sku: "KCH-KOR-PC", label: "Single Bun", weight: "140g", price: 142, servings: "1 serving", inStock: true },
    ],
  },
  {
    id: "kch-bun-bbj",
    slug: "bun-butter-jam",
    sku: "KCH-BUN-BBJ",
    name: "Chennai Bun Butter Jam",
    categoryId: "savouries",
    categoryName: "Savouries & Buns",
    shortDescription: "Warm milk bun with thick salted farm butter and mixed fruit jam.",
    description: "Chennai teashop nostalgia elevated. Extra-fluffy fresh milk bun sliced thick, slathered with cold salted farm butter and sweet strawberry-mixed fruit jam.",
    image: "/images/bakery-counter.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: false,
    preparationTime: "Ready at counter",
    ingredients: ["Fresh Milk Bun", "Salted Butter", "Artisanal Fruit Jam"],
    variants: [
      { id: "v-bbj-pc", sku: "KCH-BBJ-PC", label: "Single Serving", weight: "120g", price: 109, servings: "1 serving", inStock: true },
    ],
  },
  {
    id: "kch-cro-but",
    slug: "french-butter-croissant",
    sku: "KCH-CRO-BUT",
    name: "Artisanal French Butter Croissant",
    categoryId: "savouries",
    categoryName: "Savouries & Buns",
    shortDescription: "Hand-laminated pure butter croissant with honeycomb interior.",
    description: "Folded over 27 layers with pure unsalted butter. Incredibly crisp, flaky shell with an airy honeycomb crumb.",
    image: "/images/bakery-counter.jpg",
    isEggless: false,
    isBestSeller: true,
    isFeatured: true,
    preparationTime: "Ready at counter",
    ingredients: ["Pure Unsalted Butter", "French Wheat Flour", "Active Yeast"],
    variants: [
      { id: "v-cro-pc", sku: "KCH-CRO-PC", label: "Single Piece", weight: "85g", price: 142, servings: "1 serving", inStock: true },
    ],
  },

  // --- BURGERS & QUICK BITES ---
  {
    id: "kch-bit-vbg",
    slug: "crispy-veg-burger",
    sku: "KCH-BGR-VEG",
    name: "Crispy Herb Veg Burger",
    categoryId: "bites",
    categoryName: "Burgers & Quick Bites",
    shortDescription: "Crispy spiced potato-corn patty, cheddar slice, fresh lettuce.",
    description: "Toasted sesame brioche bun, house herb patty, tangy secret burger sauce, tomato slices, crunchy lettuce, and a melted cheddar cheese slice.",
    image: "/images/bakery-counter.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: false,
    preparationTime: "Ready in 15 mins",
    ingredients: ["Brioche Bun", "Crispy Veg Patty", "Cheddar Slice", "Herb Aioli"],
    variants: [
      { id: "v-vbg-pc", sku: "KCH-VBG-PC", label: "Regular Burger", weight: "220g", price: 170, servings: "1 serving", inStock: true },
    ],
  },
  {
    id: "kch-bit-cbg",
    slug: "signature-chicken-burger",
    sku: "KCH-BGR-CHK",
    name: "Signature Crispy Chicken Burger",
    categoryId: "bites",
    categoryName: "Burgers & Quick Bites",
    shortDescription: "Buttermilk fried chicken breast, spicy mayo, pickles & cheese.",
    description: "Crispy golden fried chicken breast seasoned with paprika, layered with chipotle mayo, crunchy pickled gherkins, and melted cheddar in a buttered brioche bun.",
    image: "/images/bakery-counter.jpg",
    isEggless: false,
    isBestSeller: true,
    isFeatured: true,
    preparationTime: "Ready in 15 mins",
    ingredients: ["Fried Chicken Fillet", "Brioche Bun", "Chipotle Mayo", "Dill Pickles"],
    variants: [
      { id: "v-cbg-pc", sku: "KCH-CBG-PC", label: "Regular Burger", weight: "250g", price: 227, servings: "1 serving", inStock: true },
    ],
  },
  {
    id: "kch-bit-ff",
    slug: "crispy-french-fries",
    sku: "KCH-FF-01",
    name: "Golden Crispy French Fries",
    categoryId: "bites",
    categoryName: "Burgers & Quick Bites",
    shortDescription: "Double-fried potato batons seasoned with sea salt.",
    description: "Classic golden fries, crisp on the outside and fluffy inside, tossed in Himalayan pink salt. Served with ketchup and garlic dip.",
    image: "/images/bakery-counter.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: false,
    preparationTime: "Ready in 10 mins",
    ingredients: ["Russet Potatoes", "Pink Salt", "Cold-Pressed Oil"],
    variants: [
      { id: "v-ff-pc", sku: "KCH-FF-PC", label: "Regular Basket", weight: "180g", price: 155, servings: "1 to 2 servings", inStock: true },
    ],
  },
  {
    id: "kch-bit-vm",
    slug: "steamed-veg-momos",
    sku: "KCH-MOM-VEG",
    name: "Steamed Himalayan Veg Momos",
    categoryId: "bites",
    categoryName: "Burgers & Quick Bites",
    shortDescription: "Handmade dumplings stuffed with minced cabbage, carrots & ginger.",
    description: "Translucent steamed dumplings stuffed with finely diced farm vegetables, fresh scallions, and ginger. Served with fiery red chili dipping sauce.",
    image: "/images/bakery-counter.jpg",
    isEggless: true,
    isBestSeller: false,
    isFeatured: false,
    preparationTime: "Ready in 15 mins",
    ingredients: ["Minced Vegetables", "Ginger & Scallions", "Red Chili Dip"],
    variants: [
      { id: "v-vm-6", sku: "KCH-VM-6PC", label: "Plate of 6", weight: "180g", price: 129, servings: "1 serving", inStock: true },
    ],
  },
  {
    id: "kch-bit-cm",
    slug: "steamed-chicken-momos",
    sku: "KCH-MOM-CHK",
    name: "Steamed Juicy Chicken Momos",
    categoryId: "bites",
    categoryName: "Burgers & Quick Bites",
    shortDescription: "Thin-skinned dumplings packed with seasoned minced chicken.",
    description: "Juicy chicken dumplings steamed fresh, seasoned with scallions, soy, and sesame oil. Served with spicy garlic dip.",
    image: "/images/bakery-counter.jpg",
    isEggless: false,
    isBestSeller: true,
    isFeatured: false,
    preparationTime: "Ready in 15 mins",
    ingredients: ["Minced Chicken", "Sesame Oil", "Garlic", "Spicy Dipping Sauce"],
    variants: [
      { id: "v-cm-6", sku: "KCH-CM-6PC", label: "Plate of 6", weight: "190g", price: 155, servings: "1 serving", inStock: true },
    ],
  },

  // --- WAFFLES & ICE CREAM ---
  {
    id: "kch-ice-sbr",
    slug: "sizzling-brownie-with-ice-cream",
    sku: "KCH-SIZ-BRW",
    name: "Sizzling Brownie with Ice Cream",
    categoryId: "waffles",
    categoryName: "Waffles & Ice Cream",
    shortDescription: "Warm fudge brownie on iron skillet with vanilla scoop & molten chocolate.",
    description: "Our signature dessert experience. Warm walnut fudge brownie served on a sizzling hot iron plate, topped with a cold vanilla bean scoop and bubbling hot dark chocolate fudge sauce.",
    image: "/custom-cakes/cake-14.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: true,
    preparationTime: "Ready in 10 mins",
    ingredients: ["Dark Fudge Brownie", "Vanilla Ice Cream", "Hot Chocolate Sauce", "Toasted Nuts"],
    variants: [
      { id: "v-sbr-pc", sku: "KCH-SBR-PC", label: "Single Sizzler", weight: "220g", price: 207, servings: "1 to 2 servings", inStock: true },
    ],
  },
  {
    id: "kch-waf-nut",
    slug: "nutella-hazelnut-waffle",
    sku: "KCH-WAF-NUT",
    name: "Nutella Hazelnut Belgian Waffle",
    categoryId: "waffles",
    categoryName: "Waffles & Ice Cream",
    shortDescription: "Crispy golden waffle smothered in warm Nutella and roasted hazelnuts.",
    description: "Freshly iron-pressed Belgian waffle with deep pockets filled with Nutella hazelnut spread, dark chocolate chips, and whipped cream.",
    image: "/custom-cakes/cake-15.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: true,
    preparationTime: "Ready in 15 mins",
    ingredients: ["Belgian Waffle Batter", "Nutella", "Roasted Hazelnuts", "Whipped Cream"],
    variants: [
      { id: "v-wnut-pc", sku: "KCH-WNUT-PC", label: "Full Waffle", weight: "200g", price: 279, servings: "1 to 2 servings", inStock: true },
    ],
  },
  {
    id: "kch-waf-bisc",
    slug: "lotus-biscoff-waffle",
    sku: "KCH-WAF-BISC",
    name: "Lotus Biscoff Waffle",
    categoryId: "waffles",
    categoryName: "Waffles & Ice Cream",
    shortDescription: "Warm Belgian waffle drizzled with molten speculoos cookie butter.",
    description: "Golden crispy Belgian waffle coated in warm melted Biscoff cookie spread and topped with crushed speculoos biscuits.",
    image: "/custom-cakes/cake-16.jpg",
    isEggless: true,
    isBestSeller: false,
    isFeatured: false,
    preparationTime: "Ready in 15 mins",
    ingredients: ["Belgian Waffle", "Lotus Biscoff Sauce", "Speculoos Crumb"],
    variants: [
      { id: "v-wbisc-pc", sku: "KCH-WBISC-PC", label: "Full Waffle", weight: "200g", price: 258, servings: "1 to 2 servings", inStock: true },
    ],
  },
  {
    id: "kch-ice-van",
    slug: "vanilla-bean-ice-cream",
    sku: "KCH-ICE-VAN",
    name: "Madagascar Vanilla Bean Ice Cream",
    categoryId: "waffles",
    categoryName: "Waffles & Ice Cream",
    shortDescription: "Rich dairy ice cream infused with real Madagascar vanilla caviar.",
    description: "Slow-churned pure dairy cream with visible black Madagascar vanilla bean specks. Smooth, clean, and creamy.",
    image: "/custom-cakes/cake-17.jpg",
    isEggless: true,
    isBestSeller: false,
    isFeatured: false,
    preparationTime: "Ready at counter",
    ingredients: ["Pure Dairy Cream", "Madagascar Vanilla Pods", "Cane Sugar"],
    variants: [
      { id: "v-ivan-pc", sku: "KCH-IVAN-PC", label: "Single Scoop", weight: "100g", price: 103, servings: "1 serving", inStock: true },
    ],
  },

  // --- BEVERAGES & SHAKES ---
  {
    id: "kch-bev-flt",
    slug: "madras-filter-coffee",
    sku: "KCH-BEV-FLT",
    name: "Traditional Madras Filter Coffee",
    categoryId: "beverages",
    categoryName: "Beverages & Shakes",
    shortDescription: "Freshly brewed chicory blend decoction with frothy farm milk.",
    description: "Chennai's pride. 80:20 Arabica and chicory slow-dripped decoction blended with steaming, frothed whole dairy milk in a traditional brass davarah.",
    image: "/images/bakery-counter.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: true,
    preparationTime: "Ready in 5 mins",
    ingredients: ["South Indian Coffee Decoction", "Boiled Whole Milk", "Sugar"],
    variants: [
      { id: "v-flt-pc", sku: "KCH-FLT-PC", label: "Davarah Cup", weight: "150ml", price: 82, servings: "1 serving", inStock: true },
    ],
  },
  {
    id: "kch-bev-hch",
    slug: "belgian-hot-chocolate",
    sku: "KCH-BEV-HCH",
    name: "Velvety Belgian Hot Chocolate",
    categoryId: "beverages",
    categoryName: "Beverages & Shakes",
    shortDescription: "Melted Callebaut 54% dark chocolate with whole milk.",
    description: "Not powdered cocoa. Made with real melted Belgian chocolate buttons, simmered slowly with dairy milk for a thick, luxurious sip.",
    image: "/images/hero-truffle.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: false,
    preparationTime: "Ready in 5 mins",
    ingredients: ["54% Belgian Callebaut Buttons", "Whole Milk", "Pinch of Salt"],
    variants: [
      { id: "v-hch-pc", sku: "KCH-HCH-PC", label: "Mug (220ml)", weight: "220ml", price: 77, servings: "1 serving", inStock: true },
    ],
  },
  {
    id: "kch-shk-nut",
    slug: "nutella-thickshake",
    sku: "KCH-SHK-NUT",
    name: "Nutella Hazelnut Thickshake",
    categoryId: "beverages",
    categoryName: "Beverages & Shakes",
    shortDescription: "Creamy chocolate ice cream blended with generous Nutella.",
    description: "Thick, spoonable milkshake made with Dutch chocolate ice cream, 3 full tablespoons of Ferrero Nutella, and crowned with choco curls.",
    image: "/custom-cakes/cake-18.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: true,
    preparationTime: "Ready in 5 mins",
    ingredients: ["Nutella", "Chocolate Ice Cream", "Cold Whole Milk"],
    variants: [
      { id: "v-snut-pc", sku: "KCH-SNUT-PC", label: "Glass (350ml)", weight: "350ml", price: 205, servings: "1 serving", inStock: true },
    ],
  },
  {
    id: "kch-shk-ore",
    slug: "oreo-thickshake",
    sku: "KCH-SHK-ORE",
    name: "Oreo Cookie Crumble Milkshake",
    categoryId: "beverages",
    categoryName: "Beverages & Shakes",
    shortDescription: "Vanilla cream ice cream blended with crushed chocolate Oreos.",
    description: "Crunchy Oreo cookies blended with Madagascar vanilla ice cream and topped with fine cookie dust.",
    image: "/custom-cakes/cake-19.jpg",
    isEggless: true,
    isBestSeller: false,
    isFeatured: false,
    preparationTime: "Ready in 5 mins",
    ingredients: ["Oreo Cookies", "Vanilla Ice Cream", "Cold Milk"],
    variants: [
      { id: "v-sore-pc", sku: "KCH-SORE-PC", label: "Glass (350ml)", weight: "350ml", price: 147, servings: "1 serving", inStock: true },
    ],
  },
  {
    id: "kch-bev-wm",
    slug: "fresh-watermelon-juice",
    sku: "KCH-JUC-WM",
    name: "Cold-Pressed Fresh Watermelon Juice",
    categoryId: "beverages",
    categoryName: "Beverages & Shakes",
    shortDescription: "100% pure fresh watermelon juice, no added water or sugar.",
    description: "Freshly pressed sweet Kiran watermelon with a splash of fresh lime and mint. Naturally hydrating.",
    image: "/custom-cakes/cake-20.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: false,
    preparationTime: "Ready in 5 mins",
    ingredients: ["Fresh Kiran Watermelon", "Fresh Mint", "Lime"],
    variants: [
      { id: "v-jwm-pc", sku: "KCH-JWM-PC", label: "Bottle (300ml)", weight: "300ml", price: 137, servings: "1 serving", inStock: true },
    ],
  },

  // --- CHOCOLATES & COOKIES ---
  {
    id: "kch-coo-but",
    slug: "madras-butter-cookies",
    sku: "KCH-COO-BUT",
    name: "Madras Heritage Butter Cookies",
    categoryId: "cookies",
    categoryName: "Chocolates & Cookies",
    shortDescription: "Melt-in-mouth crisp cookies made with pure dairy butter.",
    description: "Golden crumbly butter cookies baked according to our original 2007 recipe. Perfect companion to evening tea.",
    image: "/custom-cakes/cake-21.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: false,
    preparationTime: "Ready at counter",
    ingredients: ["Pure Farm Butter", "Flour", "Raw Cane Sugar"],
    variants: [
      { id: "v-cbut-box", sku: "KCH-CBUT-BOX", label: "Tin Box (200g)", weight: "200g", price: 152, servings: "10 to 12 cookies", inStock: true },
    ],
  },
  {
    id: "kch-coo-chp",
    slug: "chocolate-chip-cookies",
    sku: "KCH-COO-CHP",
    name: "Dark Chocolate Chip Cookies",
    categoryId: "cookies",
    categoryName: "Chocolates & Cookies",
    shortDescription: "Crispy edges, chewy butter center, packed with dark chocolate chips.",
    description: "Baked daily. Packed with 45% dark chocolate chips and brown sugar for a rich butter caramel finish.",
    image: "/custom-cakes/cake-22.jpg",
    isEggless: true,
    isBestSeller: true,
    isFeatured: true,
    preparationTime: "Ready at counter",
    ingredients: ["Dark Chocolate Drops", "Brown Sugar", "Pure Butter"],
    variants: [
      { id: "v-cchp-box", sku: "KCH-CCHP-BOX", label: "Pack of 6", weight: "220g", price: 174, servings: "6 cookies", inStock: true },
    ],
  },
  {
    id: "kch-coo-box",
    slug: "assorted-handcrafted-chocolate-box",
    sku: "KCH-COO-BOX",
    name: "Assorted Handcrafted Praline Box",
    categoryId: "cookies",
    categoryName: "Chocolates & Cookies",
    shortDescription: "Luxury assortment of dark ganache, roasted hazelnut and almond bonbons.",
    description: "A luxury gift box of artisan hand-rolled chocolate truffles and filled bonbons made with Belgian Callebaut chocolate.",
    image: "/custom-cakes/cake-23.jpg",
    isEggless: true,
    isBestSeller: false,
    isFeatured: true,
    preparationTime: "Ready at counter",
    ingredients: ["Callebaut Chocolate", "Hazelnuts", "Almonds", "Caramel Ganache"],
    variants: [
      { id: "v-cbox-100", sku: "KCH-CBOX-100G", label: "Box (100g)", weight: "100g", price: 131, servings: "8 bonbons", inStock: true },
      { id: "v-cbox-250", sku: "KCH-CBOX-250G", label: "Gift Box (250g)", weight: "250g", price: 327, servings: "18 bonbons", inStock: true },
    ],
  },
];

// Dynamic In-Memory Store for Live Sync between Admin Inventory and Storefront
export let LIVE_PRODUCTS: Product[] = [...PRODUCTS];
export let LIVE_CATEGORIES: Category[] = [...CATEGORIES];

type ProductsChangeListener = () => void;
const productChangeListeners: Set<ProductsChangeListener> = new Set();
let hasSyncedStorefrontFromSupabase = false;

export async function syncLiveProductsFromSupabase(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/products");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.products) && data.products.length > 0) {
        LIVE_PRODUCTS = data.products.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          sku: p.sku,
          name: p.name,
          categoryId: p.category_id || "cakes",
          categoryName: p.category_name || "Signature Cakes",
          shortDescription: p.short_description || "",
          description: p.description || "",
          image: p.image_url || "/images/hero-truffle.jpg",
          isEggless: Boolean(p.is_eggless),
          isBestSeller: Boolean(p.is_bestseller),
          isFeatured: Boolean(p.is_featured),
          preparationTime: p.prep_time || "2 hours",
          ingredients: p.ingredients || [],
          allergens: p.allergens || ["Dairy", "Gluten"],
          variants: p.variants || [
            {
              id: `v-${p.id}-std`,
              label: "Standard",
              weight: "0.5 kg",
              price: Number(p.price),
              servings: "3-4 servings",
              inStock: Number(p.stock_quantity ?? 10) > 0,
            },
          ],
        }));
        productChangeListeners.forEach((fn) => {
          try {
            fn();
          } catch {}
        });
      }
    }
    hasSyncedStorefrontFromSupabase = true;
  } catch (err) {
    console.warn("Failed to sync storefront products from Supabase:", err);
  }
}

if (typeof window !== "undefined" && !hasSyncedStorefrontFromSupabase) {
  setTimeout(() => {
    syncLiveProductsFromSupabase();
  }, 10);
}

export function subscribeProducts(listener: ProductsChangeListener): () => void {
  productChangeListeners.add(listener);
  if (typeof window !== "undefined" && !hasSyncedStorefrontFromSupabase) {
    syncLiveProductsFromSupabase();
  }
  return () => productChangeListeners.delete(listener);
}

export function getLiveProducts(): Product[] {
  return [...LIVE_PRODUCTS];
}

export function getLiveCategories(): Category[] {
  return [...LIVE_CATEGORIES];
}

export function addLiveProduct(item: {
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  description?: string;
  isEggless?: boolean;
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
        description: `Handcrafted ${item.category} freshly baked in our Nungambakkam kitchen.`,
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
    description: item.description || `Handcrafted with the finest ingredients in our Nungambakkam kitchen. Baked fresh daily.`,
    image: item.imageUrl || "/images/hero-truffle.jpg",
    isEggless: item.isEggless ?? true,
    isBestSeller: false,
    isFeatured: true,
    preparationTime: "2 hours",
    ingredients: ["Pure Butter", "Unbleached Flour", "Organic Sugar"],
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
