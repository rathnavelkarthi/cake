"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import QuickViewModal from "@/components/products/QuickViewModal";
import CustomCakeStudio from "@/components/custom-cake/CustomCakeStudio";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/ui/Toast";
import { getLiveProducts, subscribeProducts, syncLiveProductsFromSupabase } from "@/lib/data/products";
import { Product } from "@/lib/data/types";
import { X } from "lucide-react";

// Premium Modular Homepage Sections
import EditorialHero from "@/components/home/EditorialHero";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import BrandValueStrip from "@/components/home/BrandValueStrip";
import CuratedFavourites from "@/components/home/CuratedFavourites";
import CustomCakesFeature from "@/components/home/CustomCakesFeature";
import OccasionShowcase from "@/components/home/OccasionShowcase";
import EditorialStory from "@/components/home/EditorialStory";
import SocialGallery from "@/components/home/SocialGallery";
import CustomerReviews from "@/components/home/CustomerReviews";
import NewsletterSection from "@/components/home/NewsletterSection";
import FinalConversionCta from "@/components/home/FinalConversionCta";

function LandingPageContent() {
  const [productList, setProductList] = useState<Product[]>(getLiveProducts);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCustomCakeOpen, setIsCustomCakeOpen] = useState(false);

  useEffect(() => {
    // Initial fetch from Supabase
    syncLiveProductsFromSupabase().then((prods) => {
      if (prods && prods.length > 0) {
        setProductList(prods);
      }
    });

    // Subscribe to live inventory updates
    return subscribeProducts(() => {
      setProductList(getLiveProducts());
    });
  }, []);

  // Support direct product deep-links (e.g. /?product=slug from admin copy URL)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const prodParam = params.get("product") || params.get("id");

    if (prodParam && productList.length > 0) {
      const decoded = decodeURIComponent(prodParam).toLowerCase();
      const match = productList.find(
        (p) =>
          p.id.toLowerCase() === decoded ||
          p.slug.toLowerCase() === decoded ||
          p.name.toLowerCase() === decoded
      );
      if (match) {
        setQuickViewProduct(match);
      }
    }
  }, [productList]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "clip",
        backgroundColor: "var(--bg-primary, #FAF7F2)",
      }}
      suppressHydrationWarning
    >
      {/* Header & Sticky Fluid Island Navigation */}
      <Navbar />

      {/* Main Editorial Brand Flow */}
      <main style={{ flex: 1, minWidth: 0, width: "100%", maxWidth: "100vw", overflowX: "clip" }}>
        {/* 01: Hero Section */}
        <EditorialHero onOpenCustomCake={() => setIsCustomCakeOpen(true)} />

        {/* 02: Quick Category Discovery */}
        <CategoryShowcase />

        {/* 03: Brand Value Strip */}
        <BrandValueStrip />

        {/* 04: Curated Customer Favourites (6 items from CRM, NO massive catalog grid) */}
        <CuratedFavourites
          products={productList}
          onQuickView={(product) => setQuickViewProduct(product)}
        />

        {/* 05: Bespoke Custom Cakes Feature */}
        <CustomCakesFeature onOpenCustomCake={() => setIsCustomCakeOpen(true)} />

        {/* 06: Occasion-Based Shopping */}
        <OccasionShowcase />

        {/* 07: Editorial Bakery Story */}
        <EditorialStory />

        {/* 08: Visual Creations & Instagram Gallery */}
        <SocialGallery />

        {/* 09: Genuine Customer Stories & Reviews */}
        <CustomerReviews />

        {/* 10: VIP Celebration Club Newsletter */}
        <NewsletterSection />

        {/* 11: Final High-Conversion CTA */}
        <FinalConversionCta onOpenCustomCake={() => setIsCustomCakeOpen(true)} />
      </main>

      {/* 12: Premium Minimalist Footer */}
      <Footer />

      {/* Interactive Cart Drawer */}
      <CartDrawer />

      {/* Quick View Product Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* Bespoke Custom Cake Studio Modal */}
      {isCustomCakeOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(20, 14, 10, 0.82)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setIsCustomCakeOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "1160px",
              maxHeight: "92vh",
              backgroundColor: "var(--bg-primary, #FAF7F2)",
              borderRadius: "28px",
              overflowY: "auto",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
              border: "1px solid var(--border-medium, rgba(74, 46, 31, 0.16))",
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
              <button
                type="button"
                onClick={() => setIsCustomCakeOpen(false)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "var(--bg-surface, #FFFFFF)",
                  border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.12))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text-primary, #1F1714)",
                }}
                className="hover:bg-stone-100"
                aria-label="Close Custom Cake Studio"
              >
                <X size={18} />
              </button>
            </div>

            <CustomCakeStudio />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <CartProvider>
        <LandingPageContent />
      </CartProvider>
    </ToastProvider>
  );
}
