"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/hero/HeroSection";
import QuickActionBar from "@/components/hero/QuickActionBar";
import ProductSection from "@/components/products/ProductSection";
import TaglineReveal from "@/components/brand/TaglineReveal";
import CustomCakeStudio from "@/components/custom-cake/CustomCakeStudio";
import BrandStory from "@/components/brand/BrandStory";
import LocationSection from "@/components/location/LocationSection";
import FaqSection from "@/components/faq/FaqSection";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/ui/Toast";

export default function Home() {
  return (
    <ToastProvider>
      <CartProvider>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          {/* Header & Sticky Navigation */}
          <Navbar />

          {/* Main Content Sections */}
          <main style={{ flex: 1 }}>
            {/* 1. Hero Section */}
            <HeroSection />

            {/* 2. Core Conversion Actions Strip */}
            <QuickActionBar />

            {/* 3. Product Discovery & Signature Bakes */}
            <ProductSection />

            {/* 4. Mandatory B11 Tagline Reveal Moment */}
            <TaglineReveal />

            {/* 5. Custom Cake Studio */}
            <CustomCakeStudio />

            {/* 5. Brand Story & Kitchen Standards */}
            <BrandStory />

            {/* 6. Bakery Counter Location & Hours */}
            <LocationSection />

            {/* 7. FAQs & AEO Discovery */}
            <FaqSection />
          </main>

          {/* Footer */}
          <Footer />

          {/* Interactive Cart Drawer */}
          <CartDrawer />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}
