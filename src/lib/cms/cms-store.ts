import { ContentBlock, BlogPost } from "./types";

let defaultLandingBlocks: ContentBlock[] = [
  {
    id: "block-hero",
    type: "hero",
    isVisible: true,
    badge: "Baked Fresh Daily • Nungambakkam, Chennai",
    headline: "Slow-Crafted European Gateaux & Morning Bakes",
    subline:
      "Handcrafted with pure 54% Callebaut chocolate, cultured dairy butter, and zero synthetic preservatives. Order for same-day doorstep delivery or pickup at our boutique kitchen.",
    primaryCtaText: "Order Online",
    primaryCtaLink: "#signature-cakes",
    secondaryCtaText: "Custom Cake Studio",
    secondaryCtaLink: "#custom-cakes",
    imageUrl: "/images/hero-truffle.jpg",
  },
  {
    id: "block-products",
    type: "product_showcase",
    isVisible: true,
    title: "Signature Cakes & Daily Patisserie",
    subtitle:
      "Small-batch celebration cakes, fudgy brownies, and kettle-boiled artisanal bagels.",
    categoryFilter: "all",
  },
  {
    id: "block-gallery",
    type: "gallery",
    isVisible: true,
    title: "Moments from Our Kitchen Counter",
    subtitle: "A glimpse into our daily morning bakes, hand-rolled doughs, and fresh deliveries.",
    images: [
      {
        id: "g-1",
        url: "/images/hero-truffle.jpg",
        caption: "54% Callebaut Dark Belgian Truffle Gateau",
      },
      {
        id: "g-2",
        url: "/images/fudge-brownies.jpg",
        caption: "Dense molten dark fudge brownies with toasted walnuts",
      },
      {
        id: "g-3",
        url: "/images/celebration-cake.jpg",
        caption: "Hand-piped Persian Pistachio & Rose Entremet",
      },
    ],
  },
  {
    id: "block-story",
    type: "rich_text",
    isVisible: true,
    title: "The Kichees Baking Philosophy",
    subtitle: "Pure ingredients. Time-honoured European traditions. No shortcuts.",
    content:
      "We believe great bakery goods start with ingredient integrity. Every gateau, bagel, and brownie is baked in small daily batches using unbleached flours, pure dairy butter, and genuine Belgian couverture chocolate.",
    quote: "Baking is not mass manufacturing. It is a daily promise of freshness.",
    author: "Head Pâtissier, Kichees",
  },
  {
    id: "block-reviews",
    type: "reviews",
    isVisible: true,
    title: "Loved Across Chennai",
    subtitle: "Read verified stories from over 4,000 delighted celebration hosts.",
  },
  {
    id: "block-faq",
    type: "faq",
    isVisible: true,
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about delivery windows, eggless options, and custom cake orders.",
  },
  {
    id: "block-cta",
    type: "cta_banner",
    isVisible: true,
    title: "Celebrate Every Occasion with Kichees",
    subtitle: "Same-day doorstep delivery across Chennai or express counter pickup in Nungambakkam.",
    buttonText: "Order Your Celebration Bake",
    buttonLink: "#signature-cakes",
  },
];

let blogPosts: BlogPost[] = [
  {
    id: "blog-1",
    title: "Top 5 Celebration Cakes & Kettle-Boiled Bagels in Chennai",
    slug: "top-5-cakes-and-bagels-chennai",
    coverImage: "/images/hero-truffle.jpg",
    excerpt:
      "From multi-tiered dark chocolate ganache gateaux to 24-hour slow-fermented sesame bagels, discover the artisanal bakes defining Kichees.",
    author: "Kichees Editorial",
    publishedAt: "September 12, 2026",
    status: "Published",
    category: "Guides & Features",
    seoTitle: "Best Cakes & Bagels in Chennai | Kichees Artisanal Bakery",
    seoDescription:
      "Discover the best birthday cakes, fudge brownies, and kettle-boiled bagels in Nungambakkam, Chennai.",
    blocks: [
      {
        id: "b-1",
        type: "rich_text",
        isVisible: true,
        title: "Artisanal Baking Done Right",
        content:
          "Finding genuine European-standard bakery items in Chennai used to mean compromising on shelf-life stabilizers. At Kichees, we bake fresh every morning with pure Callebaut chocolate and slow-fermented high-gluten bagel dough.",
      },
      {
        id: "b-2",
        type: "gallery",
        isVisible: true,
        title: "Morning Showcase Gallery",
        subtitle: "Fresh from the 7:00 AM oven bake.",
        images: [
          { id: "bg-1", url: "/images/hero-truffle.jpg", caption: "Belgian Dark Chocolate Truffle" },
          { id: "bg-2", url: "/images/fudge-brownies.jpg", caption: "Freshly Sliced Brownies" },
        ],
      },
      {
        id: "b-3",
        type: "product_showcase",
        isVisible: true,
        title: "Featured in This Story",
        subtitle: "Order directly for today's delivery.",
        categoryFilter: "all",
      },
    ],
  },
  {
    id: "blog-2",
    title: "The Science of 24-Hour Cold Fermentation for Bagels",
    slug: "science-of-bagel-cold-fermentation",
    coverImage: "/images/fudge-brownies.jpg",
    excerpt:
      "Why real New York-style bagels cannot be rushed. A deep dive into starch breakdown, barley malt boiling, and chewy crust formation.",
    author: "Kitchen Master",
    publishedAt: "September 8, 2026",
    status: "Published",
    category: "Kitchen Journal",
    seoTitle: "Why We Cold-Ferment Bagels for 24 Hours | Kichees Bakery",
    seoDescription:
      "Learn how slow cold fermentation develops deep aroma, chew, and golden blistered crust in authentic bagels.",
    blocks: [
      {
        id: "b-2-1",
        type: "rich_text",
        isVisible: true,
        title: "Patience Over Speed",
        content:
          "Most commercial bagels rely on chemical dough conditioners to hurry gluten development in 45 minutes. We give our dough 24 hours of cold rest at 4°C to unlock rich, sweet malted notes and complex aroma.",
        quote: "Time is an irreplaceable ingredient.",
      },
    ],
  },
];

type CmsListener = () => void;
const cmsListeners: Set<CmsListener> = new Set();
let hasLoadedFromRemote = false;

function notifyCmsListeners() {
  cmsListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
}

// Automatically sync from remote Supabase on load in client environment
export async function syncCmsFromRemote(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/cms/blocks");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.blocks) && data.blocks.length > 0) {
        defaultLandingBlocks = data.blocks;
        notifyCmsListeners();
      }
    }

    const blogRes = await fetch("/api/cms/blogs");
    if (blogRes.ok) {
      const blogData = await blogRes.json();
      if (Array.isArray(blogData.posts) && blogData.posts.length > 0) {
        blogPosts = blogData.posts;
        notifyCmsListeners();
      }
    }
    hasLoadedFromRemote = true;
  } catch (err) {
    console.warn("Failed to sync CMS from Supabase API, using fallback store:", err);
  }
}

// Auto-trigger sync on initial module load in browser
if (typeof window !== "undefined" && !hasLoadedFromRemote) {
  setTimeout(() => {
    syncCmsFromRemote();
  }, 10);
}

export function subscribeCms(listener: CmsListener): () => void {
  cmsListeners.add(listener);
  // Also trigger sync if not yet loaded
  if (typeof window !== "undefined" && !hasLoadedFromRemote) {
    syncCmsFromRemote();
  }
  return () => cmsListeners.delete(listener);
}

export function getLandingPageBlocks(): ContentBlock[] {
  return JSON.parse(JSON.stringify(defaultLandingBlocks));
}

export async function updateLandingPageBlocks(blocks: ContentBlock[]) {
  defaultLandingBlocks = JSON.parse(JSON.stringify(blocks));
  notifyCmsListeners();

  // Persist directly to Supabase via API
  if (typeof window !== "undefined") {
    try {
      await fetch("/api/cms/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });
    } catch (err) {
      console.error("Failed to persist CMS blocks to Supabase:", err);
    }
  }
}

export function getBlogPosts(): BlogPost[] {
  return JSON.parse(JSON.stringify(blogPosts));
}

export async function saveBlogPost(post: BlogPost): Promise<BlogPost> {
  const index = blogPosts.findIndex((p) => p.id === post.id);
  if (index >= 0) {
    blogPosts[index] = JSON.parse(JSON.stringify(post));
  } else {
    blogPosts = [JSON.parse(JSON.stringify(post)), ...blogPosts];
  }
  notifyCmsListeners();

  // Persist to Supabase
  if (typeof window !== "undefined") {
    try {
      await fetch("/api/cms/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });
    } catch (err) {
      console.error("Failed to persist blog post to Supabase:", err);
    }
  }

  return post;
}

export async function deleteBlogPost(id: string) {
  blogPosts = blogPosts.filter((p) => p.id !== id);
  notifyCmsListeners();

  // Persist to Supabase
  if (typeof window !== "undefined") {
    try {
      await fetch(`/api/cms/blogs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete blog post from Supabase:", err);
    }
  }
}
