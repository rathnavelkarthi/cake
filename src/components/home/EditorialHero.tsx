"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Star, ShieldCheck, Clock } from "lucide-react";
import { triggerHaptic } from "@/lib/utils/haptics";

interface EditorialHeroProps {
  onOpenCustomCake: () => void;
}

export default function EditorialHero({ onOpenCustomCake }: EditorialHeroProps) {
  return (
    <section
      style={{
        position: "relative",
        backgroundColor: "var(--bg-primary, #FAF7F2)",
        overflow: "hidden",
        paddingTop: "48px",
        paddingBottom: "72px",
        borderBottom: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
      }}
    >
      {/* Subtle Warm Ambient Background Gradient */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "55vw",
          height: "55vw",
          maxWidth: "750px",
          maxHeight: "750px",
          background: "radial-gradient(circle, rgba(221, 167, 82, 0.12) 0%, rgba(199, 109, 56, 0.04) 50%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "48px",
            alignItems: "center",
          }}
          className="lg:grid-cols-12"
        >
          {/* Left Column: Brand Story & Conversion CTAs */}
          <div className="lg:col-span-6" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Eyebrow Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "999px",
                backgroundColor: "var(--bg-surface, #FFFFFF)",
                border: "1px solid var(--border-medium, rgba(74, 46, 31, 0.12))",
                boxShadow: "0 2px 8px rgba(35, 23, 17, 0.04)",
                width: "fit-content",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: "#16A34A",
                  boxShadow: "0 0 6px #16A34A",
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--accent-cocoa, #3A2016)",
                  fontFamily: "var(--font-manrope, sans-serif)",
                }}
              >
                Baked Fresh Daily • Nungambakkam, Chennai
              </span>
            </div>

            {/* Editorial Headline */}
            <h1
              style={{
                fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
                fontSize: "clamp(42px, 5.2vw, 68px)",
                lineHeight: 1.05,
                fontWeight: 600,
                color: "var(--text-primary, #1F1714)",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Make Every Moment <br />
              <span
                style={{
                  fontStyle: "italic",
                  color: "var(--accent-caramel, #C76D38)",
                  fontWeight: 500,
                }}
              >
                A Little Sweeter.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p
              style={{
                fontSize: "17px",
                lineHeight: 1.6,
                color: "var(--text-secondary, #6B5B53)",
                maxWidth: "520px",
                margin: 0,
                fontFamily: "var(--font-manrope, sans-serif)",
              }}
            >
              Artisanal multi-layer celebration gateaux, dense molten fudge brownies, and kettle-boiled bagels. Baked each morning with pure cultured butter and genuine Belgian couverture chocolate.
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "14px",
                paddingTop: "8px",
              }}
            >
              <Link
                href="/shop"
                onClick={() => triggerHaptic("selection")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  backgroundColor: "var(--accent-cocoa, #3A2016)",
                  color: "#FAF7F2",
                  padding: "16px 32px",
                  borderRadius: "999px",
                  fontWeight: 600,
                  fontSize: "15px",
                  textDecoration: "none",
                  boxShadow: "0 8px 24px rgba(58, 32, 22, 0.18)",
                  transition: "all 200ms ease",
                  minHeight: "52px",
                }}
                className="hover:scale-[1.02] hover:bg-stone-900 active:scale-[0.98]"
              >
                <span>Explore Our Menu</span>
                <ArrowRight size={17} />
              </Link>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic("selection");
                  onOpenCustomCake();
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  backgroundColor: "var(--bg-surface, #FFFFFF)",
                  color: "var(--text-primary, #1F1714)",
                  border: "1.5px solid var(--border-medium, rgba(74, 46, 31, 0.18))",
                  padding: "15px 28px",
                  borderRadius: "999px",
                  fontWeight: 600,
                  fontSize: "15px",
                  cursor: "pointer",
                  transition: "all 200ms ease",
                  minHeight: "52px",
                }}
                className="hover:border-amber-900 hover:text-amber-950 hover:bg-amber-50/50 active:scale-[0.98]"
              >
                <Sparkles size={16} className="text-amber-700" />
                <span>Customize Your Cake</span>
              </button>
            </div>

            {/* Value Trust Micro-Strip */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "18px",
                paddingTop: "16px",
                borderTop: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
                fontSize: "13px",
                color: "var(--text-muted, #9A897F)",
                fontWeight: 500,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheck size={16} className="text-amber-700" />
                <span>100% Pure Dairy Butter</span>
              </div>
              <span>•</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "2px",
                    border: "2px solid #16A34A",
                  }}
                />
                <span>Dedicated Eggless Range</span>
              </div>
              <span>•</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={15} className="text-amber-700" />
                <span>Same-Day Chennai Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Bakery Artwork with Floating Glass Badges */}
          <div className="lg:col-span-6" style={{ position: "relative" }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "4 / 3",
                borderRadius: "28px",
                overflow: "hidden",
                boxShadow: "0 24px 60px rgba(35, 23, 17, 0.12), 0 4px 16px rgba(35, 23, 17, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                backgroundColor: "#F3ECE2",
              }}
            >
              <Image
                src="/images/kichees-hero-cake.jpg"
                alt="Artisanal celebration cake by Kichees Baked Delights Chennai"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />

              {/* Bottom Subtle Vignette for Contrast */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(25, 19, 16, 0.35) 0%, transparent 40%)",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Floating Glass Pill: Customer Love Badge */}
            <div
              style={{
                position: "absolute",
                top: "20px",
                right: "16px",
                backgroundColor: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(12px)",
                borderRadius: "16px",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 10px 28px rgba(35, 23, 17, 0.12)",
                border: "1px solid rgba(255, 255, 255, 0.8)",
              }}
              className="animate-in fade-in slide-in-from-top-3 duration-500"
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "var(--accent-caramel-subtle, #FBEFE7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-caramel, #C76D38)",
                }}
              >
                <Star size={18} fill="currentColor" />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary, #1F1714)" }}>
                    4.9 / 5.0
                  </span>
                  <span style={{ fontSize: "11px", color: "#16A34A", fontWeight: 600 }}>★★★★★</span>
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-muted, #9A897F)" }}>
                  Over 4,000 Chennai Celebrations
                </span>
              </div>
            </div>

            {/* Floating Glass Card: Handcrafted Daily Pill */}
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "16px",
                backgroundColor: "rgba(255, 255, 255, 0.94)",
                backdropFilter: "blur(14px)",
                borderRadius: "16px",
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 12px 32px rgba(35, 23, 17, 0.14)",
                border: "1px solid rgba(255, 255, 255, 0.9)",
              }}
              className="animate-in fade-in slide-in-from-bottom-3 duration-500"
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  backgroundColor: "#2A201A",
                  color: "#FAF7F2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
              >
                🎂
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text-primary, #1F1714)" }}>
                  Bespoke Celebration Studio
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "var(--text-secondary, #6B5B53)" }}>
                  Custom tiers, flavours & hand-piped notes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
