"use client";

import React from "react";
import { PulseFitHero, ProgramCard } from "@/components/ui/pulse-fit-hero";
import { useCart } from "@/context/CartContext";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { trackEvent } from "@/lib/analytics/events";
import { triggerHaptic } from "@/lib/utils/haptics";
import { Sparkles, Truck, Clock } from "lucide-react";

export interface HeroSectionProps {
  badge?: string;
  headline?: string;
  subline?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  imageUrl?: string;
}

export default function HeroSection({
  badge,
  headline,
  subline,
  primaryCtaText = "Order for delivery or pickup",
  primaryCtaLink = "#signature-cakes",
  imageUrl,
}: HeroSectionProps = {}) {
  const { fulfilmentType, setFulfilmentType } = useCart();

  const handleOrderOnline = () => {
    triggerHaptic("impact");
    trackEvent({ name: "click_phone", source: "hero_order_online" });
    const el = document.querySelector("#signature-cakes");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleCustomCakes = () => {
    triggerHaptic("impact");
    trackEvent({ name: "begin_custom_cake" });
    const el = document.querySelector("#custom-studio") || document.querySelector("#custom-cakes");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Bakery Product Cards for the Infinite Motion Carousel
  const bakeryPrograms: ProgramCard[] = [
    {
      image: imageUrl || "/images/hero-truffle.jpg",
      category: "SIGNATURE GATEAU",
      title: "54% Callebaut Dark Chocolate Truffle",
      badge: "Best Seller • Same Day Delivery",
      href: "#signature-cakes",
    },
    {
      image: "/images/fudge-brownies.jpg",
      category: "MOLTEN FUDGE",
      title: "Classic Dark Chocolate Brownies",
      badge: "Toasted California Walnuts",
      href: "#signature-cakes",
    },
    {
      image: imageUrl || "/images/hero-truffle.jpg",
      category: "BAGELS & BREADS",
      title: "Artisanal Toasted Sesame Bagels",
      badge: "24-Hour Cold Ferment",
      href: "#signature-cakes",
    },
    {
      image: "/images/celebration-cake.jpg",
      category: "CELEBRATION GATEAU",
      title: "Mascarpone & Fig Celebration Cake",
      badge: "Fresh Figs & Vanilla Chiffon",
      href: "#signature-cakes",
    },
    {
      image: "/images/fudge-brownies.jpg",
      category: "FRENCH PATISSERIE",
      title: "Salted Caramel Cocoa Entremet",
      badge: "Single Portion Delicacy",
      href: "#signature-cakes",
    },
    {
      image: "/images/celebration-cake.jpg",
      category: "100% EGGLESS",
      title: "Persian Pistachio & Saffron Gateau",
      badge: "Dedicated Clean Counter",
      href: "#signature-cakes",
    },
  ];

  return (
    <div style={{ position: "relative" }}>
      <PulseFitHero
        showHeader={false}
        youtubeVideoId="gxC03Sm6cZs"
        enableInteractiveGlow={true}
        className="min-h-0 pt-4 pb-8"
        title={
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            {/* Bakery Brand Badge with Official Emblem */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.16)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                color: "#FFFFFF",
                padding: "6px 16px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: "var(--font-sans)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
              }}
            >
              <img
                src="https://kicheesbakeddelights.com/wp-content/uploads/2025/02/kichees-baked-delights-bakery-logo.png"
                alt="Kichees Logo"
                style={{ width: "20px", height: "20px", objectFit: "contain" }}
              />
              <span>
                {badge || `Baking fresh today • ${BUSINESS_CONFIG.address.locality}, Chennai`}
              </span>
            </div>

            {/* Main Hero Headline: Cormorant Garamond, 72–96px desktop / 48–60px mobile, Weight 600 */}
            <h1
              className="hero-headline font-serif"
              style={{
                color: "#FFFFFF",
                fontSize: "clamp(48px, 6.8vw, 92px)",
                fontWeight: 600,
                lineHeight: 1.04,
                letterSpacing: "-0.025em",
                fontFamily: "var(--font-serif)",
                textShadow: "0 2px 28px rgba(0, 0, 0, 0.75)",
                maxWidth: "880px",
                display: "block",
                textAlign: "center",
                margin: "0 auto",
              }}
            >
              {headline || "Real butter. Single origin chocolate. Cakes baked fresh in Nungambakkam."}
            </h1>
          </div>
        }
        subtitle={
          subline ||
          "Order handcrafted Belgian dark chocolate truffle cakes, molten fudge brownies, and kettle-boiled bagels for same-day delivery across Chennai or counter pickup in thirty minutes. Zero commercial premixes."
        }
        primaryAction={{
          label: primaryCtaText,
          onClick: handleOrderOnline,
          href: primaryCtaLink,
        }}
        secondaryAction={{
          label: "Custom Cake Studio",
          onClick: handleCustomCakes,
          href: "#custom-studio",
        }}
        disclaimer="*100% pure butter guarantee • Dedicated eggless station • Doorstep delivery across Chennai"
        socialProof={{
          avatars: [
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
          ],
          text: "4.9 ★ across 1,240+ celebrations in Chennai",
        }}
        programs={bakeryPrograms}
      />
    </div>
  );
}
