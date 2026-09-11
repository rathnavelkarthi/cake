"use client";

import React, { useState, useMemo } from "react";
import { PRODUCTS, CATEGORIES } from "@/lib/data/products";
import { Product } from "@/lib/data/types";
import ProductCard from "./ProductCard";
import QuickViewModal from "./QuickViewModal";
import { Search, Sparkles, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";
import { triggerHaptic } from "@/lib/utils/haptics";

export default function ProductSection() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [egglessOnly, setEgglessOnly] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const handleCategorySelect = (catId: string) => {
    triggerHaptic("selection");
    setActiveCategory(catId);
    trackEvent({ name: "select_category", categoryId: catId });
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // Category check
      if (activeCategory === "eggless" && !product.isEggless) {
        return false;
      } else if (
        activeCategory !== "all" &&
        activeCategory !== "eggless" &&
        product.categoryId !== activeCategory
      ) {
        return false;
      }

      // Eggless toggle
      if (egglessOnly && !product.isEggless) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.shortDescription.toLowerCase().includes(query);
        const matchesIngredient = product.ingredients.some((i) =>
          i.toLowerCase().includes(query)
        );
        return matchesName || matchesDesc || matchesIngredient;
      }

      return true;
    });
  }, [activeCategory, searchQuery, egglessOnly]);

  return (
    <section id="signature-cakes" className="section-padding" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto 40px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--accent-caramel)",
              marginBottom: "8px",
            }}
          >
            <Sparkles size={14} />
            <span>Artisanal Daily Bakes</span>
          </div>

          <h2
            className="font-serif"
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 700,
              color: "var(--accent-cocoa)",
              letterSpacing: "-0.02em",
              lineHeight: 1.18,
              marginBottom: "14px",
            }}
          >
            Signature Cakes & Patisserie
          </h2>

          <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Baked in small morning batches with Belgian chocolate, pure dairy butter, and fresh seasonal ingredients.
          </p>
        </div>

        {/* Filter Controls & Search Bar */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginBottom: "36px",
          }}
        >
          {/* Top Row: Categories + Eggless Toggle */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            {/* Category Pills */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className="pressable"
                    style={{
                      padding: "8px 18px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "13px",
                      fontWeight: 600,
                      backgroundColor: isActive ? "var(--accent-cocoa)" : "var(--bg-surface)",
                      color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                      border: isActive ? "1px solid var(--accent-cocoa)" : "1px solid var(--border-subtle)",
                      boxShadow: isActive ? "0 2px 8px rgba(58, 32, 22, 0.16)" : "var(--shadow-sm)",
                      transition: "background-color 160ms var(--ease-out), color 160ms var(--ease-out), transform 140ms var(--ease-out)",
                    }}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Eggless Only Filter Pill */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                setEgglessOnly(!egglessOnly);
              }}
              className="pressable"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                fontSize: "13px",
                fontWeight: 600,
                backgroundColor: egglessOnly ? "var(--accent-sage)" : "var(--bg-surface)",
                color: egglessOnly ? "#FFFFFF" : "var(--accent-sage)",
                border: "1px solid var(--accent-sage)",
                boxShadow: egglessOnly ? "0 2px 8px rgba(78, 104, 77, 0.2)" : "none",
                transition: "background-color 160ms var(--ease-apple-spring), color 160ms var(--ease-apple-spring)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: egglessOnly ? "#FFFFFF" : "var(--accent-sage)",
                }}
              />
              <span>100% Eggless Only</span>
            </button>
          </div>

          {/* Search Input */}
          <div
            style={{
              position: "relative",
              maxWidth: "420px",
              width: "100%",
            }}
          >
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by bake or ingredient (e.g. Hazelnut, Truffle, Fig)..."
              style={{
                width: "100%",
                padding: "10px 38px 10px 42px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-medium)",
                backgroundColor: "var(--bg-surface)",
                fontSize: "13px",
                color: "var(--text-primary)",
                outline: "none",
                fontFamily: "var(--font-sans)",
                transition: "border-color 160ms var(--ease-out)",
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="pressable"
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Product Grid with Stagger Entrance */}
        {filteredProducts.length > 0 ? (
          <div
            key={`${activeCategory}-${egglessOnly}-${searchQuery}`}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {filteredProducts.map((product) => (
              <div key={product.id} className="stagger-item">
                <ProductCard
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "64px 20px",
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-xl)",
              border: "1px dashed var(--border-medium)",
            }}
          >
            <h3 className="font-serif" style={{ fontSize: "20px", color: "var(--accent-cocoa)", marginBottom: "8px" }}>
              No bakes found matching &ldquo;{searchQuery}&rdquo;
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Try searching for chocolate, truffle, brownies, or reset the active filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
                setEgglessOnly(false);
              }}
              className="btn-secondary pressable"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
}
