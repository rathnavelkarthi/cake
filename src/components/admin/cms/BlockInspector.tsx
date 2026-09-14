"use client";

import React, { useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ContentBlock,
  HeroBlock,
  ProductShowcaseBlock,
  GalleryBlock,
  RichTextBlock,
  CtaBannerBlock,
} from "@/lib/cms/types";
import { LIVE_CATEGORIES } from "@/lib/data/products";

interface BlockInspectorProps {
  block: ContentBlock | null;
  onUpdateBlock: (updated: ContentBlock) => void;
}

export function BlockInspector({ block, onUpdateBlock }: BlockInspectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  if (!block) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white border border-stone-200 rounded-xl">
        <Sliders className="h-8 w-8 text-stone-300 mb-2" />
        <p className="text-xs font-semibold text-stone-600">No Block Selected</p>
        <p className="text-[11px] text-stone-400 mt-0.5">
          Select any section block on the left to edit its content, images, and buttons.
        </p>
      </div>
    );
  }

  // Handle image upload for Hero or single image
  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && block.type === "hero") {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          onUpdateBlock({
            ...block,
            imageUrl: reader.result,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle gallery image upload
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && block.type === "gallery") {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const newImg = {
            id: `g-${Date.now()}`,
            url: reader.result,
            caption: "Fresh bakery bake",
          };
          onUpdateBlock({
            ...block,
            images: [...block.images, newImg],
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-stone-200 bg-stone-50/70">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-amber-900" />
          <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
            Edit Section: {block.type.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Content Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* HERO BLOCK INSPECTOR */}
        {block.type === "hero" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">Top Badge Text</label>
              <Input
                value={block.badge}
                onChange={(e) => onUpdateBlock({ ...block, badge: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">Headline</label>
              <Input
                value={block.headline}
                onChange={(e) => onUpdateBlock({ ...block, headline: e.target.value })}
                className="h-8 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">Subline Description</label>
              <textarea
                rows={3}
                value={block.subline}
                onChange={(e) => onUpdateBlock({ ...block, subline: e.target.value })}
                className="w-full rounded-md border border-stone-200 p-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-900"
              />
            </div>

            {/* Hero Image Controls */}
            <div className="space-y-2 p-3 rounded-lg border border-stone-200 bg-stone-50/50">
              <label className="font-semibold text-stone-700 block">
                Hero Showcase Image
              </label>

              <div className="flex items-center gap-3">
                <div className="relative h-16 w-24 rounded-md overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                  <Image
                    src={block.imageUrl || "/images/hero-truffle.jpg"}
                    alt="Hero preview"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleHeroImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-7 text-[11px] gap-1 bg-white border-stone-300"
                  >
                    <Upload className="h-3 w-3" />
                    Upload New Image
                  </Button>
                  <Input
                    placeholder="Or enter Image URL"
                    value={block.imageUrl}
                    onChange={(e) =>
                      onUpdateBlock({ ...block, imageUrl: e.target.value })
                    }
                    className="h-7 text-[10px] bg-white"
                  />
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-medium text-stone-600">Primary Button</label>
                <Input
                  value={block.primaryCtaText}
                  onChange={(e) =>
                    onUpdateBlock({ ...block, primaryCtaText: e.target.value })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-stone-600">Primary Link</label>
                <Input
                  value={block.primaryCtaLink}
                  onChange={(e) =>
                    onUpdateBlock({ ...block, primaryCtaLink: e.target.value })
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* PRODUCT SHOWCASE BLOCK INSPECTOR */}
        {block.type === "product_showcase" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">Section Title</label>
              <Input
                value={block.title}
                onChange={(e) => onUpdateBlock({ ...block, title: e.target.value })}
                className="h-8 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">Subtitle</label>
              <Input
                value={block.subtitle}
                onChange={(e) => onUpdateBlock({ ...block, subtitle: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">
                Filter by Category
              </label>
              <Select
                value={block.categoryFilter}
                onValueChange={(val) =>
                  onUpdateBlock({ ...block, categoryFilter: val })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bakes & Patisserie</SelectItem>
                  {LIVE_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-xs">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Live Inventory Connection
              </p>
              <p>
                This block automatically calls all active products in your inventory. Whenever a new cake or bagel is added, it immediately shows up here!
              </p>
            </div>
          </div>
        )}

        {/* GALLERY BLOCK INSPECTOR */}
        {block.type === "gallery" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">Gallery Title</label>
              <Input
                value={block.title}
                onChange={(e) => onUpdateBlock({ ...block, title: e.target.value })}
                className="h-8 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">Subtitle</label>
              <Input
                value={block.subtitle}
                onChange={(e) => onUpdateBlock({ ...block, subtitle: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            {/* Photos List */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label className="font-bold text-stone-800">
                  Photos in Gallery ({block.images.length})
                </label>
                <div>
                  <input
                    type="file"
                    ref={galleryFileRef}
                    onChange={handleGalleryUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => galleryFileRef.current?.click()}
                    className="h-7 text-[11px] gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Photo
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {block.images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="flex items-center gap-2 p-2 rounded-lg border border-stone-200 bg-stone-50/50"
                  >
                    <div className="relative h-12 w-14 rounded overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                      <Image
                        src={img.url}
                        alt="Gallery item"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="Caption description"
                        value={img.caption || ""}
                        onChange={(e) => {
                          const newImages = [...block.images];
                          newImages[idx].caption = e.target.value;
                          onUpdateBlock({ ...block, images: newImages });
                        }}
                        className="h-6 text-[10px] bg-white"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newImages = block.images.filter((_, i) => i !== idx);
                        onUpdateBlock({ ...block, images: newImages });
                      }}
                      className="h-6 w-6 text-stone-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STORY & RICH TEXT BLOCK INSPECTOR */}
        {block.type === "rich_text" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">Section Title</label>
              <Input
                value={block.title}
                onChange={(e) => onUpdateBlock({ ...block, title: e.target.value })}
                className="h-8 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">Subtitle</label>
              <Input
                value={block.subtitle || ""}
                onChange={(e) =>
                  onUpdateBlock({ ...block, subtitle: e.target.value })
                }
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">Story Body Text</label>
              <textarea
                rows={5}
                value={block.content}
                onChange={(e) => onUpdateBlock({ ...block, content: e.target.value })}
                className="w-full rounded-md border border-stone-200 p-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">Highlight Quote</label>
              <Input
                value={block.quote || ""}
                onChange={(e) => onUpdateBlock({ ...block, quote: e.target.value })}
                placeholder="e.g. Baking is not mass manufacturing..."
                className="h-8 text-xs italic"
              />
            </div>
          </div>
        )}

        {/* CTA BANNER BLOCK INSPECTOR */}
        {block.type === "cta_banner" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">Banner Title</label>
              <Input
                value={block.title}
                onChange={(e) => onUpdateBlock({ ...block, title: e.target.value })}
                className="h-8 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">Subtitle</label>
              <Input
                value={block.subtitle}
                onChange={(e) => onUpdateBlock({ ...block, subtitle: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-medium text-stone-600">Button Label</label>
                <Input
                  value={block.buttonText}
                  onChange={(e) =>
                    onUpdateBlock({ ...block, buttonText: e.target.value })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-stone-600">Button Link</label>
                <Input
                  value={block.buttonLink}
                  onChange={(e) =>
                    onUpdateBlock({ ...block, buttonLink: e.target.value })
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* GENERIC TITLE/SUBTITLE FOR OTHER BLOCKS */}
        {(block.type === "reviews" || block.type === "faq") && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">Section Title</label>
              <Input
                value={block.title}
                onChange={(e) => onUpdateBlock({ ...block, title: e.target.value })}
                className="h-8 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">Subtitle</label>
              <Input
                value={block.subtitle}
                onChange={(e) => onUpdateBlock({ ...block, subtitle: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
