"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Calendar, Heart, Gift, Crown, Camera, Cake } from "lucide-react";
import { triggerHaptic } from "@/lib/utils/haptics";

interface OccasionItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  icon: React.ElementType;
  flavourRecommendation: string;
  targetAnchor: string;
}

const OCCASIONS: OccasionItem[] = [
  {
    id: "birthday",
    title: "Milestone Birthdays",
    subtitle: "From 1st birthdays to golden jubilee celebrations with custom age & name piping.",
    tag: "Most Requested",
    image: "/custom-cakes/cake-1.jpg",
    icon: Gift,
    flavourRecommendation: "Belgian Dark Chocolate Truffle",
    targetAnchor: "#custom-studio",
  },
  {
    id: "anniversary",
    title: "Romantic Anniversaries",
    subtitle: "Subtle vintage lambeth piping, pastel mascarpone creams, and edible floral crowns.",
    tag: "Artisanal Vintage",
    image: "/custom-cakes/cake-2.jpg",
    icon: Heart,
    flavourRecommendation: "Mascarpone & Fresh Fig",
    targetAnchor: "#custom-studio",
  },
  {
    id: "wedding",
    title: "Weddings & Grand Tiers",
    subtitle: "Multi-tiered structural masterpieces designed for central banquet displays in Chennai.",
    tag: "Two & Three Tier",
    image: "/custom-cakes/cake-4.jpg",
    icon: Crown,
    flavourRecommendation: "Roasted Hazelnut Praline",
    targetAnchor: "#custom-studio",
  },
  {
    id: "photo",
    title: "Memories & Photo Cakes",
    subtitle: "High-definition edible sugar paper prints celebrating personal family portraits.",
    tag: "100% Edible Print",
    image: "/custom-cakes/cake-8.jpg",
    icon: Camera,
    flavourRecommendation: "Classic Red Velvet",
    targetAnchor: "#custom-studio",
  },
  {
    id: "kids",
    title: "Children's Whimsical",
    subtitle: "Pastel dreamscapes, custom cartoon color palettes, and clean eggless recipes.",
    tag: "Safe & Pure Dairy",
    image: "/custom-cakes/cake-6.jpg",
    icon: Sparkles,
    flavourRecommendation: "Pure Vanilla Bean & Berry",
    targetAnchor: "#custom-studio",
  },
  {
    id: "intimate",
    title: "Intimate Evenings",
    subtitle: "Petite 1kg single-tier bakes and tea cakes baked fresh for family dinners.",
    tag: "Same Day Dispatch",
    image: "/images/celebration-cake.jpg",
    icon: Cake,
    flavourRecommendation: "Dark Chocolate Truffle",
    targetAnchor: "#signature-cakes",
  },
];

export default function ShopByOccasion() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleOccasionClick = (target: string) => {
    triggerHaptic("selection");
    const el = document.querySelector(target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="shop-by-occasion"
      className="section-padding overflow-x-clip w-full max-w-full"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="container min-w-0 max-w-full px-4 sm:px-6">
        {/* Section Header with Cormorant Garamond & Manrope */}
        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
          <div
            className="small-label"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--accent-caramel)",
              fontFamily: "var(--font-sans)",
              marginBottom: "8px",
            }}
          >
            <Calendar size={14} />
            <span>Curated Celebrations</span>
          </div>

          <h2
            className="section-heading font-serif"
            style={{
              fontSize: "clamp(38px, 4.6vw, 64px)",
              fontWeight: 600,
              color: "var(--accent-cocoa)",
              letterSpacing: "-0.02em",
              lineHeight: 1.12,
              fontFamily: "var(--font-serif)",
              marginBottom: "14px",
            }}
          >
            Crafted for Every Occasion
          </h2>

          <p
            className="body-text"
            style={{
              fontSize: "clamp(15px, 1.5vw, 18px)",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              fontFamily: "var(--font-sans)",
              fontWeight: 400,
            }}
          >
            Every milestone has a distinctive spirit. Select your celebration to explore kitchen archive inspirations or commission a bespoke design.
          </p>
        </div>

        {/* Occasion Discovery Grid / Mobile Horizontal Rail */}
        <div
          ref={scrollContainerRef}
          className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 overflow-x-auto sm:overflow-x-visible no-scrollbar pb-4 sm:pb-0 snap-x snap-mandatory min-w-0"
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          {OCCASIONS.map((occ) => {
            const Icon = occ.icon;
            return (
              <div
                key={occ.id}
                onClick={() => handleOccasionClick(occ.targetAnchor)}
                className="group pressable shrink-0 w-[290px] sm:w-auto snap-center rounded-[var(--radius-xl)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden cursor-pointer flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{
                  boxShadow: "0 4px 16px rgba(35, 23, 17, 0.05)",
                }}
              >
                {/* Image Banner with Subtle Zoom on Hover */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#EFECE8]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={occ.image}
                    alt={occ.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(20, 10, 5, 0.05) 0%, rgba(20, 10, 5, 0.45) 100%)",
                    }}
                  />
                  {/* Floating Pill Tag - Manrope 11-13px, weight 600, letter spacing 0.08em */}
                  <div
                    className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-semibold text-white tracking-[0.08em] uppercase small-label"
                    style={{
                      backgroundColor: "rgba(25, 15, 10, 0.72)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {occ.tag}
                  </div>

                  {/* Icon badge */}
                  <div
                    className="absolute bottom-3.5 right-3.5 w-9 h-9 rounded-full flex items-center justify-center text-white"
                    style={{
                      backgroundColor: "var(--accent-cocoa)",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <Icon size={16} />
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Occasion / Cake Name: Manrope 18-22px, Weight 600/700 */}
                    <h3
                      className="cake-name text-[19px] sm:text-[21px] font-bold text-[var(--accent-cocoa)] mb-1.5 leading-snug group-hover:text-[var(--accent-caramel)] transition-colors"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontWeight: 700,
                      }}
                    >
                      {occ.title}
                    </h3>
                    <p
                      className="body-text text-[14px] sm:text-[15px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-3"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontWeight: 400,
                      }}
                    >
                      {occ.subtitle}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <span
                      className="text-[12px] font-semibold text-[var(--accent-caramel)] small-label"
                      style={{
                        fontFamily: "var(--font-sans)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {occ.flavourRecommendation}
                    </span>
                    <div
                      className="btn-action flex items-center gap-1 text-[14px] font-semibold text-[var(--accent-cocoa)] group-hover:translate-x-1 transition-transform"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontWeight: 600,
                      }}
                    >
                      <span>Explore</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Swipe Cue */}
        <div className="sm:hidden text-center mt-3 text-xs text-[var(--text-muted)] flex items-center justify-center gap-1.5">
          <span>Swipe to explore more occasions</span>
          <ArrowRight size={13} />
        </div>
      </div>
    </section>
  );
}
