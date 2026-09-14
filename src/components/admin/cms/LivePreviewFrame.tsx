"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Star,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentBlock } from "@/lib/cms/types";
import { LIVE_PRODUCTS } from "@/lib/data/products";
import { cn } from "@/lib/utils";

interface LivePreviewFrameProps {
  blocks: ContentBlock[];
}

export function LivePreviewFrame({ blocks }: LivePreviewFrameProps) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const visibleBlocks = blocks.filter((b) => b.isVisible);

  return (
    <div className="flex flex-col h-full bg-stone-100/70 border border-stone-200 rounded-xl overflow-hidden shadow-xs">
      {/* Device Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-stone-200">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mr-2">
            Live Preview Canvas
          </span>
          <div className="flex rounded-lg bg-stone-100 p-0.5">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={cn(
                "p-1.5 rounded-md text-xs transition-colors",
                device === "desktop"
                  ? "bg-white text-stone-900 shadow-xs font-semibold"
                  : "text-stone-500 hover:text-stone-900"
              )}
              title="Desktop view"
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDevice("tablet")}
              className={cn(
                "p-1.5 rounded-md text-xs transition-colors",
                device === "tablet"
                  ? "bg-white text-stone-900 shadow-xs font-semibold"
                  : "text-stone-500 hover:text-stone-900"
              )}
              title="Tablet view"
            >
              <Tablet className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={cn(
                "p-1.5 rounded-md text-xs transition-colors",
                device === "mobile"
                  ? "bg-white text-stone-900 shadow-xs font-semibold"
                  : "text-stone-500 hover:text-stone-900"
              )}
              title="Mobile view"
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <a
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-stone-900"
        >
          <span>Open Live Site</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Frame Viewport Container */}
      <div className="flex-1 overflow-y-auto p-4 flex justify-center items-start">
        <div
          className={cn(
            "bg-[#FAF7F2] shadow-md transition-all duration-300 rounded-lg overflow-hidden border border-stone-200 text-stone-900",
            device === "desktop" && "w-full max-w-4xl",
            device === "tablet" && "w-[768px]",
            device === "mobile" && "w-[375px]"
          )}
        >
          {/* Simulated Storefront Header Bar */}
          <div className="bg-[#3A2016] text-[#FAF7F2] text-[10px] px-3 py-1 flex items-center justify-between font-medium">
            <span>✨ Artisanal Boutique Bakes • Nungambakkam, Chennai</span>
            <span className="hidden sm:inline">Order WhatsApp / Same-Day Delivery</span>
          </div>

          {/* Render Active Blocks */}
          <div className="divide-y divide-stone-200/50">
            {visibleBlocks.map((block) => {
              /* 1. HERO BLOCK */
              if (block.type === "hero") {
                return (
                  <div key={block.id} className="p-6 sm:p-10 space-y-6">
                    <div className="inline-flex items-center gap-1.5 bg-[#FBEFE7] text-[#3A2016] px-3 py-1 rounded-full text-xs font-semibold">
                      <Sparkles className="h-3 w-3 text-[#C76D38]" />
                      <span>{block.badge}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div className="space-y-3">
                        <h1 className="text-xl sm:text-3xl font-bold font-serif text-[#3A2016] leading-tight">
                          {block.headline}
                        </h1>
                        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                          {block.subline}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <button
                            type="button"
                            className="bg-[#3A2016] text-[#FAF7F2] px-4 py-2 rounded-lg text-xs font-bold shadow-xs"
                          >
                            {block.primaryCtaText}
                          </button>
                          <button
                            type="button"
                            className="border border-[#3A2016]/30 text-[#3A2016] px-4 py-2 rounded-lg text-xs font-medium"
                          >
                            {block.secondaryCtaText}
                          </button>
                        </div>
                      </div>

                      <div className="relative h-44 sm:h-56 rounded-xl overflow-hidden border border-stone-200 shadow-md">
                        <Image
                          src={block.imageUrl || "/images/hero-truffle.jpg"}
                          alt="Hero preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              /* 2. PRODUCT SHOWCASE BLOCK (Live Inventory Connection) */
              if (block.type === "product_showcase") {
                const displayProducts =
                  block.categoryFilter === "all"
                    ? LIVE_PRODUCTS
                    : LIVE_PRODUCTS.filter(
                        (p) => p.categoryId === block.categoryFilter
                      );

                return (
                  <div key={block.id} className="p-6 sm:p-8 space-y-4">
                    <div className="text-center space-y-1">
                      <h2 className="text-lg sm:text-2xl font-bold font-serif text-[#3A2016]">
                        {block.title}
                      </h2>
                      <p className="text-xs text-stone-600 max-w-md mx-auto">
                        {block.subtitle}
                      </p>
                    </div>

                    {/* Dynamic Product Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      {displayProducts.slice(0, 3).map((prod) => (
                        <div
                          key={prod.id}
                          className="rounded-xl border border-stone-200 bg-white p-2.5 shadow-xs flex flex-col justify-between"
                        >
                          <div className="relative h-24 sm:h-28 rounded-lg overflow-hidden mb-2 bg-stone-100">
                            <Image
                              src={prod.image || "/images/hero-truffle.jpg"}
                              alt={prod.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-[#C76D38] tracking-wider">
                              {prod.categoryName}
                            </span>
                            <h3 className="text-xs font-bold text-stone-900 truncate">
                              {prod.name}
                            </h3>
                            <p className="text-xs font-bold text-[#3A2016] mt-1">
                              ₹{prod.variants[0]?.price.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="mt-2 w-full bg-[#3A2016] text-[#FAF7F2] text-[10px] font-bold py-1.5 rounded"
                          >
                            Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              /* 3. GALLERY BLOCK */
              if (block.type === "gallery") {
                return (
                  <div key={block.id} className="p-6 sm:p-8 space-y-4">
                    <div className="text-center space-y-1">
                      <h2 className="text-lg sm:text-2xl font-bold font-serif text-[#3A2016]">
                        {block.title}
                      </h2>
                      <p className="text-xs text-stone-600 max-w-md mx-auto">
                        {block.subtitle}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                      {block.images.map((img) => (
                        <div
                          key={img.id}
                          className="relative h-28 sm:h-36 rounded-lg overflow-hidden border border-stone-200 shadow-xs group"
                        >
                          <Image
                            src={img.url}
                            alt={img.caption || "Gallery"}
                            fill
                            className="object-cover"
                          />
                          {img.caption && (
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 text-[9px] text-white">
                              {img.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              /* 4. STORY / RICH TEXT BLOCK */
              if (block.type === "rich_text") {
                return (
                  <div key={block.id} className="p-6 sm:p-8 space-y-3">
                    <h2 className="text-lg sm:text-xl font-bold font-serif text-[#3A2016]">
                      {block.title}
                    </h2>
                    {block.subtitle && (
                      <p className="text-xs text-[#C76D38] font-semibold">
                        {block.subtitle}
                      </p>
                    )}
                    <p className="text-xs text-stone-700 leading-relaxed">
                      {block.content}
                    </p>
                    {block.quote && (
                      <blockquote className="my-2 border-l-2 border-[#C76D38] pl-3 italic text-xs text-[#3A2016] font-serif">
                        "{block.quote}"
                        {block.author && (
                          <span className="block not-italic text-[10px] text-stone-500 mt-0.5">
                            — {block.author}
                          </span>
                        )}
                      </blockquote>
                    )}
                  </div>
                );
              }

              /* 5. CTA BANNER BLOCK */
              if (block.type === "cta_banner") {
                return (
                  <div
                    key={block.id}
                    className="p-6 sm:p-8 bg-[#3A2016] text-[#FAF7F2] text-center space-y-3"
                  >
                    <h2 className="text-lg sm:text-xl font-bold font-serif">
                      {block.title}
                    </h2>
                    <p className="text-xs text-stone-300 max-w-md mx-auto">
                      {block.subtitle}
                    </p>
                    <button
                      type="button"
                      className="bg-[#C76D38] text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm hover:bg-[#B55D2B]"
                    >
                      {block.buttonText}
                    </button>
                  </div>
                );
              }

              /* Default other blocks */
              return (
                <div key={block.id} className="p-4 text-center text-xs text-stone-500">
                  <p className="font-semibold text-stone-800">
                    {block.type.toUpperCase()} SECTION
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
