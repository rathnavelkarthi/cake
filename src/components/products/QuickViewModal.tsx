"use client";

import React, { useState, useEffect, useRef } from "react";
import { Product, ProductVariant } from "@/lib/data/types";
import { useCart } from "@/context/CartContext";
import { X, Plus, Check, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import { triggerHaptic } from "@/lib/utils/haptics";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      setActiveProduct(product);
      if (product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      }
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setActiveProduct(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [product]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!activeProduct) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeProduct]);

  if (!activeProduct || !selectedVariant) return null;

  const handleClose = () => {
    triggerHaptic("selection");
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleAddToCart = () => {
    triggerHaptic("success");
    addItem({
      productId: activeProduct.id,
      variantId: selectedVariant.id,
      name: activeProduct.name,
      variantLabel: selectedVariant.label,
      price: selectedVariant.price,
      quantity: 1,
      image: activeProduct.image,
      isEggless: activeProduct.isEggless,
    });
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      handleClose();
    }, 1000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop - Apple Scrim Material */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "var(--material-scrim)",
          backdropFilter: "var(--material-blur-scrim)",
          WebkitBackdropFilter: "var(--material-blur-scrim)",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 200ms var(--ease-apple-spring)",
        }}
        onClick={handleClose}
      />

      {/* Modal Dialog Card - Symmetrical scale(0.96) to scale(1) */}
      <div
        ref={modalRef}
        style={{
          position: "relative",
          zIndex: 91,
          backgroundColor: "var(--bg-surface)",
          borderRadius: "var(--radius-xl)",
          maxWidth: "840px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
          border: "1px solid var(--border-subtle)",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.96)",
          transition: "opacity 200ms var(--ease-apple-spring), transform 200ms var(--ease-apple-spring)",
          display: "grid",
          gridTemplateColumns: "1fr",
        }}
      >
        {/* Close Button - Apple Translucent Circle */}
        <button
          onClick={handleClose}
          className="pressable"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 10,
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
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="modal-inner-grid" style={{ display: "grid", gridTemplateColumns: "1fr" }}>
          {/* Image Column */}
          <div
            style={{
              position: "relative",
              minHeight: "280px",
              backgroundColor: "var(--bg-muted)",
            }}
          >
            <img
              src={activeProduct.image}
              alt={activeProduct.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            {activeProduct.isEggless && (
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "16px",
                  backgroundColor: "rgba(255,255,255,0.94)",
                  color: "var(--accent-sage)",
                  fontWeight: 700,
                  fontSize: "12px",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
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
              </div>
            )}
          </div>

          {/* Details Column */}
          <div style={{ padding: "32px", display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--accent-caramel)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "6px",
              }}
            >
              {activeProduct.categoryName}
            </div>

            <h2
              id="modal-title"
              className="font-serif"
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "var(--accent-cocoa)",
                marginBottom: "14px",
                lineHeight: 1.25,
              }}
            >
              {activeProduct.name}
            </h2>

            <p
              style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                marginBottom: "20px",
              }}
            >
              {activeProduct.description}
            </p>

            {/* Preparation time & quality badge */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
                <Clock size={15} style={{ color: "var(--accent-caramel)" }} />
                <span>Prep: {activeProduct.preparationTime}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
                <ShieldCheck size={15} style={{ color: "var(--accent-sage)" }} />
                <span>100% Real Butter</span>
              </div>
            </div>

            {/* Sensory Flavour & Tasting Profile */}
            {activeProduct.tastingProfile && (
              <div
                style={{
                  backgroundColor: "var(--bg-muted)",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "20px",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--accent-cocoa)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>Patisserie Tasting Profile</span>
                  {activeProduct.tastingProfile.texture && (
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--accent-caramel)" }}>
                      {activeProduct.tastingProfile.texture}
                    </span>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "12px" }}>
                  {activeProduct.tastingProfile.cacaoIntensity !== undefined && activeProduct.tastingProfile.cacaoIntensity > 0 && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", color: "var(--text-secondary)", fontSize: "11px" }}>
                        <span>Cacao Intensity</span>
                        <strong>{activeProduct.tastingProfile.cacaoIntensity}%</strong>
                      </div>
                      <div style={{ width: "100%", height: "5px", backgroundColor: "rgba(0,0,0,0.06)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                        <div style={{ width: `${activeProduct.tastingProfile.cacaoIntensity}%`, height: "100%", backgroundColor: "var(--accent-cocoa)", borderRadius: "var(--radius-full)" }} />
                      </div>
                    </div>
                  )}

                  {activeProduct.tastingProfile.richness !== undefined && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", color: "var(--text-secondary)", fontSize: "11px" }}>
                        <span>Richness</span>
                        <strong>{activeProduct.tastingProfile.richness}%</strong>
                      </div>
                      <div style={{ width: "100%", height: "5px", backgroundColor: "rgba(0,0,0,0.06)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                        <div style={{ width: `${activeProduct.tastingProfile.richness}%`, height: "100%", backgroundColor: "var(--accent-caramel)", borderRadius: "var(--radius-full)" }} />
                      </div>
                    </div>
                  )}
                </div>

                {activeProduct.flavourNotes && activeProduct.flavourNotes.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                    {activeProduct.flavourNotes.map((note, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor: "var(--bg-surface)",
                          color: "var(--accent-cocoa)",
                          padding: "3px 9px",
                          borderRadius: "var(--radius-full)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Ingredients */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "6px",
                }}
              >
                Key Ingredients:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {activeProduct.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: "12px",
                      backgroundColor: "var(--bg-muted)",
                      color: "var(--text-secondary)",
                      padding: "3px 10px",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Allergens if any */}
            {activeProduct.allergens && activeProduct.allergens.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: "#9A735C",
                  marginBottom: "24px",
                }}
              >
                <AlertCircle size={14} />
                <span>Allergens: {activeProduct.allergens.join(", ")}</span>
              </div>
            )}

            {/* Variant Selector */}
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "8px",
                }}
              >
                Select Size / Weight:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {activeProduct.variants.map((v) => {
                  const isSelected = selectedVariant.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic("selection");
                        setSelectedVariant(v);
                      }}
                      className="pressable"
                      style={{
                        padding: "8px 14px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "13px",
                        fontWeight: 600,
                        backgroundColor: isSelected ? "var(--accent-cocoa)" : "var(--bg-muted)",
                        color: isSelected ? "#FFFFFF" : "var(--text-secondary)",
                        border: isSelected ? "1px solid var(--accent-cocoa)" : "1px solid transparent",
                        boxShadow: isSelected ? "0 2px 6px rgba(58, 32, 22, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.2)" : "none",
                        transition: "background-color 140ms var(--ease-apple-spring), color 140ms var(--ease-apple-spring)",
                      }}
                    >
                      {v.label} ({v.servings})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "20px",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Total Price</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--accent-caramel)" }}>
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
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: justAdded ? "var(--accent-sage)" : "var(--accent-caramel)",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(199, 109, 56, 0.24)",
                  transition: "background-color 160ms var(--ease-out), transform 140ms var(--ease-out)",
                }}
              >
                {justAdded ? (
                  <>
                    <Check size={16} />
                    <span>Added to Basket</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 720px) {
          .modal-inner-grid {
            grid-template-columns: 1fr 1.2fr !important;
          }
        }
      `}</style>
    </div>
  );
}
