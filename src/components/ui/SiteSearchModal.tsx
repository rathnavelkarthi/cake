"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Sparkles, ArrowRight, Clock, Cake } from "lucide-react";
import { getLiveProducts } from "@/lib/data/products";
import { Product } from "@/lib/data/types";
import { triggerHaptic } from "@/lib/utils/haptics";

interface SiteSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SiteSearchModal({ isOpen, onClose }: SiteSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Handle Cmd+K / Ctrl+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open signal handled if Navbar listens
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Live filter products
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const all = getLiveProducts();
    const filtered = all.filter((p) => {
      const matchName = p.name.toLowerCase().includes(trimmed);
      const matchDesc = p.description?.toLowerCase().includes(trimmed) || p.shortDescription?.toLowerCase().includes(trimmed);
      const matchCat = p.categoryId?.toLowerCase().includes(trimmed) || p.categoryName?.toLowerCase().includes(trimmed);
      const matchFlavour = p.flavourNotes?.some((t) => t.toLowerCase().includes(trimmed));
      const matchIngredient = p.ingredients?.some((i) => i.toLowerCase().includes(trimmed));
      return matchName || matchDesc || matchCat || matchFlavour || matchIngredient;
    });

    setResults(filtered.slice(0, 6));
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    triggerHaptic("selection");
    onClose();
    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  const handleSelectProduct = (product: Product) => {
    triggerHaptic("selection");
    onClose();
    router.push(`/shop?product=${encodeURIComponent(product.slug || product.id)}`);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site Search"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "rgba(18, 10, 6, 0.72)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "16px",
        paddingTop: "clamp(60px, 12vh, 120px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "580px",
          backgroundColor: "var(--bg-surface, #FFFFFF)",
          borderRadius: "20px",
          border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.12))",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
          animation: "searchModalIn 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
            gap: "12px",
          }}
        >
          <Search size={20} style={{ color: "var(--accent-caramel, #9A5A30)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search truffle cakes, brownies, tea cakes, eggless..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
              fontSize: "15px",
              fontFamily: "var(--font-sans, inherit)",
              color: "var(--text-primary, #1F1714)",
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              style={{
                border: "none",
                background: "none",
                color: "var(--text-muted, #7E7068)",
                cursor: "pointer",
                padding: "4px",
              }}
              aria-label="Clear query"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.15))",
              backgroundColor: "var(--bg-muted, #F3ECE2)",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-secondary, #4A2E1F)",
              cursor: "pointer",
            }}
          >
            Esc
          </button>
        </form>

        {/* Results Container */}
        <div style={{ maxHeight: "380px", overflowY: "auto", padding: "12px" }}>
          {results.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted, #7E7068)",
                  padding: "4px 8px",
                }}
              >
                Matching Cakes & Patisserie ({results.length})
              </div>
              {results.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleSelectProduct(prod)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleSelectProduct(prod)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px 10px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "background-color 140ms ease",
                  }}
                  className="hover:bg-amber-50/60 dark:hover:bg-stone-800"
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      backgroundColor: "var(--bg-muted, #F3ECE2)",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={prod.image || "/images/hero-truffle.jpg"}
                      alt={prod.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--text-primary, #1F1714)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {prod.name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--accent-caramel, #9A5A30)",
                        fontWeight: 600,
                      }}
                    >
                      ₹{prod.variants?.[0]?.price || 650}
                      {prod.isEggless && (
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "10px",
                            color: "#16A34A",
                            backgroundColor: "rgba(22, 163, 74, 0.1)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          100% Eggless
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: "var(--text-muted, #7E7068)" }} />
                </div>
              ))}

              <div style={{ padding: "8px", borderTop: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))" }}>
                <button
                  type="button"
                  onClick={handleSubmit}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    backgroundColor: "var(--accent-cocoa, #231711)",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <span>View all results for &ldquo;{query}&rdquo; in Shop</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ) : query.trim() ? (
            <div style={{ padding: "32px 16px", textAlign: "center" }}>
              <Cake size={32} style={{ color: "var(--text-muted, #7E7068)", margin: "0 auto 10px auto" }} />
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary, #1F1714)" }}>
                No cakes found for &ldquo;{query}&rdquo;
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary, #4A2E1F)", marginTop: "4px" }}>
                Looking for a bespoke celebration gateau? You can customize any flavor in our Cake Studio.
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/custom-cakes");
                }}
                style={{
                  marginTop: "14px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--accent-caramel, #9A5A30)",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Open Custom Studio
              </button>
            </div>
          ) : (
            <div style={{ padding: "16px 8px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted, #7E7068)",
                  marginBottom: "8px",
                }}
              >
                Popular Searches
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {["Belgian Truffle", "Molten Brownie", "Red Velvet", "Biscoff Lotus", "Eggless Cake", "Pineapple Gateau"].map(
                  (tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setQuery(tag)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        backgroundColor: "var(--bg-muted, #F3ECE2)",
                        border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.1))",
                        fontSize: "12px",
                        color: "var(--text-primary, #1F1714)",
                        cursor: "pointer",
                      }}
                      className="hover:bg-amber-100/70"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
