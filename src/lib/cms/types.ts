export type BlockType =
  | "hero"
  | "product_showcase"
  | "gallery"
  | "rich_text"
  | "reviews"
  | "faq"
  | "cta_banner";

export interface BaseBlock {
  id: string;
  type: BlockType;
  isVisible: boolean;
}

export interface HeroBlock extends BaseBlock {
  type: "hero";
  badge: string;
  headline: string;
  subline: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  imageUrl: string;
}

export interface ProductShowcaseBlock extends BaseBlock {
  type: "product_showcase";
  title: string;
  subtitle: string;
  categoryFilter: string; // "all", "cakes", "bagels", etc.
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
}

export interface GalleryBlock extends BaseBlock {
  type: "gallery";
  title: string;
  subtitle: string;
  images: GalleryImage[];
}

export interface RichTextBlock extends BaseBlock {
  type: "rich_text";
  title: string;
  subtitle?: string;
  content: string;
  quote?: string;
  author?: string;
}

export interface ReviewsBlock extends BaseBlock {
  type: "reviews";
  title: string;
  subtitle: string;
}

export interface FaqBlock extends BaseBlock {
  type: "faq";
  title: string;
  subtitle: string;
}

export interface CtaBannerBlock extends BaseBlock {
  type: "cta_banner";
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  bgStyle?: string;
}

export type ContentBlock =
  | HeroBlock
  | ProductShowcaseBlock
  | GalleryBlock
  | RichTextBlock
  | ReviewsBlock
  | FaqBlock
  | CtaBannerBlock;

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  status: "Published" | "Draft";
  category: string;
  blocks: ContentBlock[];
  seoTitle?: string;
  seoDescription?: string;
}
