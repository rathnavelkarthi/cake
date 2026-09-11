"use client";

import React, { useState } from "react";
import { Product, ProductVariant } from "@/lib/data/types";
import { useCart } from "@/context/CartContext";
import { Plus, Eye, Check } from "lucide-react";
import { triggerHaptic } from "@/lib/utils/haptics";

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic("success");
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      variantLabel: selectedVariant.label,
      price: selectedVariant.price,
      quantity: 1,
      image: product.image,
      isEggless: product.isEggless,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div
      className="card-hover"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        transition: "transform 220ms var(--ease-out), box-shadow 220ms var(--ease-out)",
        position: "relative",
      }}
    >
      {/* Product Image Area */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "72%",
          backgroundColor: "var(--bg-muted)",
          overflow: "hidden",
          cursor: "pointer",
        }}
        onClick={() => onQuickView(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onQuickView(product);
          }
        }}
        aria-label={`View details for ${product.name}`}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 350ms var(--ease-out)",
          }}
        />

        {/* Top Badges */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          {product.isBestSeller && (
            <span
              style={{
                backgroundColor: "var(--accent-cocoa)",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "var(--radius-full)",
                letterSpacing: "0.02em",
              }}
            >
              Best Seller
            </span>
          )}

          {product.isEggless && (
            <span
              style={{
                backgroundColor: "var(--accent-sage-subtle)",
                color: "var(--accent-sage)",
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "var(--radius-full)",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "var(--accent-sage)",
                }}
              />
              100% Eggless
            </span>
          )}
        </div>

        {/* Quick View Button on Image - Apple Translucent Circle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic("selection");
            onQuickView(product);
          }}
          className="pressable"
          style={{
            position: "absolute",
            bottom: "12px",
            right: "12px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "var(--material-floating)",
            backdropFilter: "var(--material-blur)",
            WebkitBackdropFilter: "var(--material-blur)",
            color: "var(--accent-cocoa)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
            border: "1px solid rgba(255,255,255,0.65)",
          }}
          aria-label={`Quick view ${product.name}`}
        >
          <Eye size={16} />
        </button>
      </div>

      {/* Content Body */}
      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
          <h3
            className="font-serif card-headline"
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--accent-cocoa)",
              lineHeight: 1.25,
              letterSpacing: "-0.015em",
            }}
          >
            {product.name}
          </h3>
        </div>

        <p
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            lineHeight: 1.45,
            marginBottom: "16px",
            minHeight: "38px",
          }}
        >
          {product.shortDescription}
        </p>

        {/* Variant Selector Pills with Immediate Price Update */}
        <div style={{ marginBottom: "18px" }}>
          <div
            className="tag-label"
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "8px",
            }}
          >
            Weight / Size:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {product.variants.map((variant) => {
              const isSelected = selectedVariant.id === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic("selection");
                    setSelectedVariant(variant);
                  }}
                  className="pressable"
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "5px 11px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: isSelected ? "var(--accent-cocoa)" : "rgba(74, 46, 31, 0.05)",
                    color: isSelected ? "#FFFFFF" : "var(--text-secondary)",
                    border: isSelected ? "1px solid var(--accent-cocoa)" : "1px solid var(--border-subtle)",
                    boxShadow: isSelected ? "0 2px 6px rgba(58, 32, 22, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.2)" : "none",
                    transition: "background-color 140ms var(--ease-apple-spring), color 140ms var(--ease-apple-spring)",
                  }}
                  aria-pressed={isSelected}
                >
                  {variant.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions: Dynamic Price & Add to Cart */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "14px",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {selectedVariant.servings}
            </div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--accent-caramel)" }}>
              ₹{selectedVariant.price.toLocaleString("en-IN")}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="pressable"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 16px",
              borderRadius: "var(--radius-full)",
              backgroundColor: justAdded ? "var(--accent-sage)" : "var(--accent-caramel)",
              color: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(199, 109, 56, 0.2)",
              transition: "background-color 160ms var(--ease-out), transform 140ms var(--ease-out)",
            }}
            aria-label={`Add ${product.name} (${selectedVariant.label}) to cart`}
          >
            {justAdded ? (
              <>
                <Check size={15} />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus size={15} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
