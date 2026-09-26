"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/data/types";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/Toast";
import { triggerHaptic } from "@/lib/utils/haptics";
import { Plus, Check, ArrowRight, Eye, Sparkles } from "lucide-react";

interface CuratedFavouritesProps {
  products: Product[];
  onQuickView: (product: Product) => void;
}

export default function CuratedFavourites({ products, onQuickView }: CuratedFavouritesProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Intelligently select 6 curated favourites from CRM data
  const curatedList = React.useMemo(() => {
    if (!products || products.length === 0) return [];

    // Prioritize bestsellers and featured products
    const bestsellers = products.filter((p) => p.isBestSeller || p.isFeatured);
    const others = products.filter((p) => !p.isBestSeller && !p.isFeatured);
    const combined = [...bestsellers, ...others];

    // Ensure category diversity across the 6 slots
    const seenCategories = new Set<string>();
    const curated: Product[] = [];

    for (const p of combined) {
      if (!seenCategories.has(p.categoryId) && curated.length < 6) {
        seenCategories.add(p.categoryId);
        curated.push(p);
      }
    }

    // Fill remaining up to 6 if needed
    for (const p of combined) {
      if (curated.length >= 6) break;
      if (!curated.some((c) => c.id === p.id)) {
        curated.push(p);
      }
    }

    return curated.slice(0, 6);
  }, [products]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic("success");

    // If multi-variant, open quick view modal for size selection
    if (product.variants && product.variants.length > 1) {
      onQuickView(product);
      return;
    }

    const defaultVariant = product.variants[0] || {
      id: `v-${product.id}`,
      label: "Standard",
      price: 750,
    };

    addItem({
      productId: product.id,
      variantId: defaultVariant.id,
      name: product.name,
      variantLabel: defaultVariant.label,
      price: defaultVariant.price,
      quantity: 1,
      image: product.image,
      isEggless: product.isEggless,
    });

    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1200);

    toast("Added to Bag", {
      description: `${product.name} has been added to your order bag.`,
      type: "success",
    });
  };

  return (
    <section
      style={{
        backgroundColor: "var(--bg-primary, #FAF7F2)",
        padding: "80px 24px",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Section Header */}
        <div
          style={{
            textAlign: "center",
            maxWidth: "680px",
            margin: "0 auto 48px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--accent-caramel, #C76D38)",
              marginBottom: "8px",
              fontFamily: "var(--font-manrope, sans-serif)",
            }}
          >
            <Sparkles size={14} />
            <span>Curated Daily Bakes</span>
          </div>

          <h2
            style={{
              fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 600,
              color: "var(--text-primary, #1F1714)",
              margin: "0 0 12px 0",
              lineHeight: 1.15,
            }}
          >
            Made For Sweet Moments
          </h2>

          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.6,
              color: "var(--text-secondary, #6B5B53)",
              margin: 0,
            }}
          >
            A hand-picked selection of our most loved daily creations. Baked every morning with 100% pure butter and Belgian Callebaut couverture.
          </p>
        </div>

        {/* 6 Curated Products Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "32px",
            marginBottom: "56px",
          }}
        >
          {curatedList.map((product) => {
            const defaultVariant = product.variants[0];
            const startingPrice = defaultVariant?.price ?? 500;
            const hasMultipleVariants = product.variants && product.variants.length > 1;

            return (
              <div
                key={product.id}
                onClick={() => onQuickView(product)}
                style={{
                  backgroundColor: "var(--bg-surface, #FFFFFF)",
                  borderRadius: "24px",
                  overflow: "hidden",
                  border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
                  boxShadow: "0 4px 20px rgba(35, 23, 17, 0.04)",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "all 260ms cubic-bezier(0.16, 1, 0.3, 1)",
                  position: "relative",
                }}
                className="group hover:-translate-y-1.5 hover:shadow-2xl hover:border-amber-200"
              >
                {/* Product Photography */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "4 / 3",
                    backgroundColor: "#F3ECE2",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={product.image || "/images/hero-truffle.jpg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Top Badges */}
                  <div
                    style={{
                      position: "absolute",
                      top: "14px",
                      left: "14px",
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Veg / Non-Veg Indicator */}
                    <div
                      style={{
                        padding: "4px 8px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(255, 255, 255, 0.94)",
                        backdropFilter: "blur(6px)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "9px",
                          height: "9px",
                          borderRadius: "2px",
                          border: `2px solid ${product.isEggless ? "#16A34A" : "#DC2626"}`,
                          position: "relative",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            width: "3px",
                            height: "3px",
                            borderRadius: "50%",
                            backgroundColor: product.isEggless ? "#16A34A" : "#DC2626",
                            top: "1px",
                            left: "1px",
                          }}
                        />
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: product.isEggless ? "#15803D" : "#991B1B",
                        }}
                      >
                        {product.isEggless ? "100% Eggless" : "Contains Egg"}
                      </span>
                    </div>

                    {product.isBestSeller && (
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "8px",
                          backgroundColor: "var(--accent-cocoa, #3A2016)",
                          color: "#FAF7F2",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        ★ Bestseller
                      </span>
                    )}
                  </div>

                  {/* Quick View Hover Peek Overlay Button */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      right: "12px",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(8px)",
                      borderRadius: "999px",
                      padding: "6px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--text-primary, #1F1714)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <Eye size={13} />
                    <span>Quick View</span>
                  </div>
                </div>

                {/* Card Details */}
                <div
                  style={{
                    padding: "20px 22px",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    justifyContent: "space-between",
                    gap: "14px",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--accent-caramel, #C76D38)",
                        marginBottom: "4px",
                        display: "block",
                      }}
                    >
                      {product.categoryName}
                    </span>

                    <h3
                      style={{
                        fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
                        fontSize: "22px",
                        fontWeight: 700,
                        color: "var(--text-primary, #1F1714)",
                        margin: "0 0 6px 0",
                        lineHeight: 1.2,
                      }}
                    >
                      {product.name}
                    </h3>

                    <p
                      style={{
                        fontSize: "13px",
                        lineHeight: 1.45,
                        color: "var(--text-secondary, #6B5B53)",
                        margin: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {product.shortDescription || product.description}
                    </p>
                  </div>

                  {/* Price & Action Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: "12px",
                      borderTop: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted, #9A897F)", display: "block" }}>
                        {hasMultipleVariants ? "Starts from" : "Standard 0.5 kg"}
                      </span>
                      <span
                        style={{
                          fontSize: "19px",
                          fontWeight: 800,
                          color: "var(--text-primary, #1F1714)",
                          fontFamily: "var(--font-manrope, sans-serif)",
                        }}
                      >
                        ₹{startingPrice}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(product, e)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        backgroundColor:
                          justAddedId === product.id
                            ? "#16A34A"
                            : "var(--accent-cocoa, #3A2016)",
                        color: "#FAF7F2",
                        padding: "9px 18px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        transition: "all 160ms ease",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                      className="hover:scale-105 active:scale-95"
                    >
                      {justAddedId === product.id ? (
                        <>
                          <Check size={14} />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>{hasMultipleVariants ? "Choose Size" : "Add to Bag"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View Complete Catalogue CTA Button */}
        <div style={{ textAlign: "center" }}>
          <Link
            href="/shop"
            onClick={() => triggerHaptic("selection")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "var(--bg-surface, #FFFFFF)",
              color: "var(--text-primary, #1F1714)",
              border: "1.5px solid var(--border-medium, rgba(74, 46, 31, 0.16))",
              padding: "16px 36px",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "15px",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(35, 23, 17, 0.05)",
              transition: "all 200ms ease",
            }}
            className="hover:border-amber-900 hover:text-amber-950 hover:bg-amber-50/40 hover:shadow-lg active:scale-98"
          >
            <span>Explore Complete 40+ Bakery Catalogue</span>
            <ArrowRight size={17} className="text-amber-800" />
          </Link>
        </div>
      </div>
    </section>
  );
}
