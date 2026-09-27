"use client";

import React, { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider, useCart } from "@/context/CartContext";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { getLiveProducts, getLiveCategories, subscribeProducts } from "@/lib/data/products";
import { Product, ProductVariant } from "@/lib/data/types";
import { Search, Sparkles, Filter, ChevronDown, Check, Plus, ShoppingBag, Clock, Heart, Truck, ShieldCheck, Zap } from "lucide-react";
import QuickViewModal from "@/components/products/QuickViewModal";

function ShopContent() {
  const [productList, setProductList] = useState(getLiveProducts);
  const [categoriesList, setCategoriesList] = useState(getLiveCategories);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [egglessOnly, setEgglessOnly] = useState(false);
  const [sameDayOnly, setSameDayOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { addItem, setIsCartOpen } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    return subscribeProducts(() => {
      setProductList(getLiveProducts());
      setCategoriesList(getLiveCategories());
    });
  }, []);

  // Handle direct product URL link (e.g. /shop?product=slug or /shop?search=cake)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const prodParam = params.get("product") || params.get("id");
    const searchParam = params.get("search");

    if (searchParam) {
      setSearchQuery(searchParam);
    }

    if (prodParam && productList.length > 0) {
      const decodedParam = decodeURIComponent(prodParam).toLowerCase();
      const match = productList.find(
        (p) =>
          p.id.toLowerCase() === decodedParam ||
          p.slug.toLowerCase() === decodedParam ||
          p.name.toLowerCase() === decodedParam
      );
      if (match) {
        setQuickViewProduct(match);
        if (match.categoryId && match.categoryId !== "all") {
          setActiveCategory(match.categoryId);
        }
        setTimeout(() => {
          const el = document.getElementById(`product-${match.slug || match.id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 300);
      }
    }
  }, [productList]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = productList.filter((product) => {
      // Category check
      if (activeCategory === "eggless") {
        if (!product.isEggless) return false;
      } else if (activeCategory !== "all") {
        if (product.categoryId !== activeCategory) return false;
      }

      // Eggless toggle
      if (egglessOnly && !product.isEggless) return false;

      // Same-Day Dispatch toggle
      if (sameDayOnly) {
        const prep = product.preparationTime?.toLowerCase() || "";
        const isQuickPrep = prep.includes("min") || prep.includes("instant") || prep.includes("counter");
        const isStandardCounterItem = ["cakes", "pastries", "brownies", "cookies", "bestsellers", "beverages", "savories"].includes(product.categoryId);
        if (!isQuickPrep && !isStandardCounterItem) return false;
      }

      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.shortDescription.toLowerCase().includes(q);
        const matchesIngredient = product.ingredients.some((i) => i.toLowerCase().includes(q));
        const matchesCat = product.categoryName.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesIngredient && !matchesCat) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0));
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0));
    } else {
      // Featured / best seller priority
      result = [...result].sort((a, b) => {
        if (a.isBestSeller && !b.isBestSeller) return -1;
        if (!a.isBestSeller && b.isBestSeller) return 1;
        return 0;
      });
    }

    return result;
  }, [productList, activeCategory, searchQuery, egglessOnly, sameDayOnly, sortBy]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.variants.length > 1) {
      setQuickViewProduct(product);
      return;
    }

    const defaultVariant = product.variants[0];
    if (!defaultVariant) return;

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

    toast("Added to Cart", {
      description: `${product.name} (${defaultVariant.label}) added to your bag.`,
      type: "success",
    });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-primary, #FAF7F2)" }}>
      <Navbar />

      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* Page Hero Header */}
        <section
          style={{
            background: "linear-gradient(180deg, rgba(230, 217, 203, 0.3) 0%, rgba(250, 247, 242, 0.8) 100%)",
            borderBottom: "1px solid rgba(197, 160, 89, 0.15)",
            padding: "48px 16px 36px",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "999px",
                backgroundColor: "rgba(197, 160, 89, 0.12)",
                color: "#78531C",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              <Sparkles size={13} />
              <span>Full Artisanal Counter & Kitchen Menu</span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-serif, 'Playfair Display', Georgia, serif)",
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                fontWeight: 700,
                color: "var(--text-primary, #2A201A)",
                marginBottom: "12px",
                letterSpacing: "-0.02em",
              }}
            >
              Order Online From Kichees
            </h1>
            <p
              style={{
                maxWidth: "600px",
                margin: "0 auto",
                fontSize: "15px",
                color: "var(--text-secondary, #6B5B52)",
                lineHeight: 1.6,
              }}
            >
              Handcrafted in Nungambakkam, Chennai. From our signature 54% Belgian Callebaut gateaux and slow-steamed momos to warm Madras filter coffee and fresh baked bakes.
            </p>

            {/* Live Counter Info Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "16px",
                padding: "6px 16px",
                borderRadius: "999px",
                backgroundColor: "#fff",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                fontSize: "13px",
                color: "#4A3F35",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#16A34A" }} />
                Kitchen Active
              </span>
              <span>•</span>
              <span>Pickup in 15 mins</span>
              <span>•</span>
              <span>Chennai Same-Day Delivery</span>
            </div>
          </div>
        </section>

        {/* Value & Delivery Assurance Banner */}
        <div style={{ maxWidth: "1200px", margin: "16px auto 0", padding: "0 16px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "12px",
              padding: "14px 20px",
              borderRadius: "16px",
              backgroundColor: "#fff",
              border: "1px solid rgba(197, 160, 89, 0.2)",
              boxShadow: "0 2px 10px rgba(42, 32, 26, 0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#EFF6FF", color: "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Truck size={18} />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-cocoa, #2A201A)" }}>4°C Active-Chilled Van Fleet</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary, #6B5B52)" }}>Zero melted frosting in Chennai heat. Shock-proof lock boxes.</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#F0FDF4", color: "#15803D", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-cocoa, #2A201A)" }}>100% Dedicated Eggless Line</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary, #6B5B52)" }}>Independent counter, sanctified ovens & zero cross-contact.</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#FEF3C7", color: "#B45309", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Zap size={18} />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-cocoa, #2A201A)" }}>45-Minute Express Dispatch</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary, #6B5B52)" }}>Fresh from our Nungambakkam counter right to your door.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 16px 0" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              backgroundColor: "#fff",
              padding: "16px 20px",
              borderRadius: "16px",
              boxShadow: "0 4px 16px rgba(42, 32, 26, 0.04)",
              border: "1px solid rgba(197, 160, 89, 0.12)",
            }}
          >
            {/* Search */}
            <div style={{ position: "relative", flex: "1 1 280px" }}>
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9CA3AF",
                }}
              />
              <input
                type="text"
                placeholder="Search cakes, brownies, milkshakes, puffs, burgers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px 10px 42px",
                  borderRadius: "10px",
                  border: "1px solid #E5E7EB",
                  backgroundColor: "#F9FAFB",
                  fontSize: "14px",
                  color: "#1F2937",
                  outline: "none",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "12px",
                    color: "#9CA3AF",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              {/* Eggless Toggle */}
              <button
                onClick={() => setEgglessOnly(!egglessOnly)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "999px",
                  border: egglessOnly ? "1.5px solid #16A34A" : "1px solid #E5E7EB",
                  backgroundColor: egglessOnly ? "#DCFCE7" : "#fff",
                  color: egglessOnly ? "#15803D" : "#4B5563",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "10px",
                    height: "10px",
                    borderRadius: "2px",
                    border: "2px solid #16A34A",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      backgroundColor: "#16A34A",
                      top: "1px",
                      left: "1px",
                    }}
                  />
                </span>
                Pure Veg / Eggless
              </button>

              {/* Same-Day Dispatch Toggle */}
              <button
                onClick={() => setSameDayOnly(!sameDayOnly)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "999px",
                  border: sameDayOnly ? "1.5px solid #F59E0B" : "1px solid #E5E7EB",
                  backgroundColor: sameDayOnly ? "#FEF3C7" : "#fff",
                  color: sameDayOnly ? "#B45309" : "#4B5563",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <Zap size={13} style={{ color: sameDayOnly ? "#B45309" : "#F59E0B" }} />
                <span>⚡ Same-Day Dispatch</span>
              </button>

              {/* Sort By Dropdown */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6B7280" }}>
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                    backgroundColor: "#fff",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#374151",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="featured">Best Sellers First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Tabs Scrollable Horizontal Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              overflowX: "auto",
              padding: "16px 4px 8px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {categoriesList.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = productList.filter((p) => (cat.id === "all" ? true : cat.id === "eggless" ? p.isEggless : p.categoryId === cat.id)).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "999px",
                    whiteSpace: "nowrap",
                    fontSize: "13px",
                    fontWeight: isActive ? 600 : 500,
                    border: isActive ? "1px solid var(--accent-gold, #C5A059)" : "1px solid rgba(0,0,0,0.08)",
                    backgroundColor: isActive ? "var(--accent-cocoa, #2A201A)" : "#fff",
                    color: isActive ? "#FAF7F2" : "var(--text-primary, #2A201A)",
                    boxShadow: isActive ? "0 4px 12px rgba(42, 32, 26, 0.15)" : "none",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    flexShrink: 0,
                  }}
                >
                  <span>{cat.name}</span>
                  <span
                    style={{
                      fontSize: "11px",
                      opacity: isActive ? 0.9 : 0.6,
                      backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)",
                      padding: "1px 6px",
                      borderRadius: "999px",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 16px" }}>
          {productList.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-w-0">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl border border-stone-200/80 bg-white/60 p-4 animate-pulse space-y-3"
                >
                  <div className="aspect-square w-full rounded-xl bg-stone-200/70" />
                  <div className="h-4 w-3/4 rounded bg-stone-200/70" />
                  <div className="h-3 w-1/2 rounded bg-stone-100" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-5 w-16 rounded bg-stone-200/70" />
                    <div className="h-8 w-20 rounded-full bg-stone-200/70" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                backgroundColor: "#fff",
                borderRadius: "20px",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <ShoppingBag size={48} style={{ color: "#D1D5DB", margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#1F2937", marginBottom: "8px" }}>
                No bakes matched your selection
              </h3>
              <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "20px" }}>
                Try resetting your search query or switching categories to explore the rest of our menu.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                  setEgglessOnly(false);
                  setSameDayOnly(false);
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  backgroundColor: "var(--accent-cocoa, #2A201A)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-w-0"
            >
              {filteredAndSortedProducts.map((product) => {
                const minPrice = product.variants[0]?.price || 0;

                return (
                  <div
                    key={product.id}
                    id={`product-${product.slug || product.id}`}
                    onClick={() => setQuickViewProduct(product)}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: "20px",
                      overflow: "hidden",
                      border: "1px solid rgba(197, 160, 89, 0.15)",
                      boxShadow: "0 4px 20px rgba(42, 32, 26, 0.05)",
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 12px 32px rgba(42, 32, 26, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 20px rgba(42, 32, 26, 0.05)";
                    }}
                  >
                    {/* Product Image Container */}
                    <div style={{ position: "relative", width: "100%", height: "200px", backgroundColor: "#F3F4F6", overflow: "hidden" }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/images/hero-truffle.jpg";
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
                        {/* Veg / Non-Veg Indicator */}
                        <div
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(255, 255, 255, 0.92)",
                            backdropFilter: "blur(4px)",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: "10px",
                              height: "10px",
                              borderRadius: "2px",
                              border: `2px solid ${product.isEggless ? "#16A34A" : "#DC2626"}`,
                              position: "relative",
                            }}
                          >
                            <span
                              style={{
                                position: "absolute",
                                width: "4px",
                                height: "4px",
                                borderRadius: "50%",
                                backgroundColor: product.isEggless ? "#16A34A" : "#DC2626",
                                top: "1px",
                                left: "1px",
                              }}
                            />
                          </span>
                          <span style={{ fontSize: "11px", fontWeight: 600, color: product.isEggless ? "#15803D" : "#991B1B" }}>
                            {product.isEggless ? "Veg" : "Non-Veg"}
                          </span>
                        </div>

                        {product.isBestSeller && (
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              backgroundColor: "var(--accent-cocoa, #2A201A)",
                              color: "#FAF7F2",
                              fontSize: "11px",
                              fontWeight: 600,
                              letterSpacing: "0.02em",
                            }}
                          >
                            Bestseller
                          </span>
                        )}

                        {(product.preparationTime?.includes("min") || ["cakes", "pastries", "brownies"].includes(product.categoryId)) && (
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              backgroundColor: "rgba(254, 243, 199, 0.95)",
                              color: "#B45309",
                              fontSize: "11px",
                              fontWeight: 700,
                              letterSpacing: "0.02em",
                              border: "1px solid rgba(245, 158, 11, 0.3)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                          >
                            <Zap size={10} />
                            Same-Day
                          </span>
                        )}
                      </div>

                      {/* Preparation Time badge */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          right: "10px",
                          padding: "3px 8px",
                          borderRadius: "999px",
                          backgroundColor: "rgba(0, 0, 0, 0.65)",
                          backdropFilter: "blur(4px)",
                          color: "#fff",
                          fontSize: "11px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Clock size={11} />
                        <span>{product.preparationTime}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "var(--accent-gold, #C5A059)",
                          marginBottom: "4px",
                        }}
                      >
                        {product.categoryName}
                      </span>

                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "var(--text-primary, #2A201A)",
                          marginBottom: "6px",
                          lineHeight: 1.3,
                        }}
                      >
                        {product.name}
                      </h3>

                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--text-secondary, #6B5B52)",
                          lineHeight: 1.5,
                          marginBottom: "16px",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          flex: 1,
                        }}
                      >
                        {product.shortDescription}
                      </p>

                      {/* Price and Add to Cart footer */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingTop: "12px",
                          borderTop: "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        <div>
                          <span style={{ fontSize: "11px", color: "#9CA3AF", display: "block" }}>
                            {product.variants.length > 1 ? "Starting from" : "Price"}
                          </span>
                          <span
                            style={{
                              fontSize: "18px",
                              fontWeight: 700,
                              color: "var(--text-primary, #2A201A)",
                            }}
                          >
                            ₹{minPrice}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleQuickAdd(product, e)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 14px",
                            borderRadius: "10px",
                            backgroundColor: "var(--accent-cocoa, #2A201A)",
                            color: "#FAF7F2",
                            fontSize: "13px",
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer",
                            transition: "background-color 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#433228")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-cocoa, #2A201A)")}
                        >
                          <Plus size={14} />
                          <span>{product.variants.length > 1 ? "Choose" : "Add"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Quick View Modal for size/variant selection */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      <Footer />
      <CartDrawer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <ToastProvider>
      <CartProvider>
        <ShopContent />
      </CartProvider>
    </ToastProvider>
  );
}
