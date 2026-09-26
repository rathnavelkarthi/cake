"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, MessageCircle, ArrowRight, Palette, Layers, CheckCircle2 } from "lucide-react";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { triggerHaptic } from "@/lib/utils/haptics";

interface CustomCakesFeatureProps {
  onOpenCustomCake: () => void;
}

export default function CustomCakesFeature({ onOpenCustomCake }: CustomCakesFeatureProps) {
  const whatsappUrl = `https://wa.me/${BUSINESS_CONFIG.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Hi Kichees Baked Delights! I'd like to discuss a custom celebration cake for an upcoming event in Chennai."
  )}`;

  return (
    <section
      id="custom-cakes-feature"
      style={{
        backgroundColor: "var(--bg-muted, #F3ECE2)",
        padding: "88px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "56px",
            alignItems: "center",
          }}
          className="lg:grid-cols-12"
        >
          {/* Left Column: Visual Showcase with Multi-Tier Gallery Mosaic */}
          <div className="lg:col-span-6" style={{ position: "relative" }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "4 / 3",
                borderRadius: "28px",
                overflow: "hidden",
                boxShadow: "0 24px 60px rgba(35, 23, 17, 0.12)",
                border: "1px solid rgba(255, 255, 255, 0.9)",
                backgroundColor: "#E6DBCF",
              }}
            >
              <Image
                src="https://uiftoqlzlarfkfzqnedk.supabase.co/storage/v1/object/public/custom-cakes/cake-1.jpg"
                alt="Custom celebratory cake crafted by Kichees Baked Delights"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />

              {/* Gradient Scrim */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(25, 19, 16, 0.4) 0%, transparent 40%)",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Overlapping Secondary Creation Card */}
            <div
              style={{
                position: "absolute",
                bottom: "-24px",
                right: "-12px",
                width: "170px",
                height: "170px",
                borderRadius: "20px",
                overflow: "hidden",
                border: "4px solid #FAF7F2",
                boxShadow: "0 16px 36px rgba(35, 23, 17, 0.16)",
                display: "none",
              }}
              className="sm:block"
            >
              <Image
                src="https://uiftoqlzlarfkfzqnedk.supabase.co/storage/v1/object/public/custom-cakes/cake-2.jpg"
                alt="Hand-piped artisanal details"
                fill
                sizes="170px"
                className="object-cover"
              />
            </div>

            {/* Floating Architecture Badge */}
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(12px)",
                borderRadius: "14px",
                padding: "8px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
            >
              <Palette size={15} className="text-amber-800" />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary, #1F1714)" }}>
                Bespoke Sugar Craft & Styling
              </span>
            </div>
          </div>

          {/* Right Column: Editorial Copy & Flow Trigger */}
          <div className="lg:col-span-6" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--accent-caramel, #C76D38)",
                  display: "block",
                  marginBottom: "8px",
                  fontFamily: "var(--font-manrope, sans-serif)",
                }}
              >
                Bespoke Cake Studio
              </span>

              <h2
                style={{
                  fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
                  fontSize: "clamp(36px, 4.5vw, 54px)",
                  fontWeight: 600,
                  color: "var(--text-primary, #1F1714)",
                  margin: "0 0 16px 0",
                  lineHeight: 1.08,
                }}
              >
                Your Cake. <br />
                <span style={{ fontStyle: "italic", color: "var(--accent-caramel, #C76D38)" }}>
                  Your Story.
                </span>
              </h2>

              <p
                style={{
                  fontSize: "16px",
                  lineHeight: 1.6,
                  color: "var(--text-secondary, #6B5B53)",
                  margin: 0,
                  fontFamily: "var(--font-manrope, sans-serif)",
                }}
              >
                From hand-selected flavours and gourmet fillings to colours, vintage Lambeth piping, theme illustrations, and personalized celebratory plaques — create a cake made especially for your one-of-a-kind celebration.
              </p>
            </div>

            {/* Customisation Options Checklist */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px 18px",
                padding: "16px 0",
              }}
            >
              {[
                "12+ Artisanal Flavours",
                "1kg to Grand Multi-Tier",
                "100% Pure Eggless Options",
                "Theme & Color Palette Match",
                "Handwritten Plaque Messages",
                "Custom Delivery Time Slot",
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle2 size={16} className="text-amber-800 shrink-0" />
                  <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary, #1F1714)" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "14px",
                paddingTop: "6px",
              }}
            >
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
                  gap: "10px",
                  backgroundColor: "var(--accent-cocoa, #3A2016)",
                  color: "#FAF7F2",
                  padding: "16px 32px",
                  borderRadius: "999px",
                  fontWeight: 600,
                  fontSize: "15px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(58, 32, 22, 0.18)",
                  transition: "all 200ms ease",
                  minHeight: "52px",
                }}
                className="hover:scale-[1.02] hover:bg-stone-900 active:scale-[0.98]"
              >
                <Sparkles size={17} />
                <span>Create Your Custom Cake</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => triggerHaptic("selection")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  backgroundColor: "var(--bg-surface, #FFFFFF)",
                  color: "#166534",
                  border: "1.5px solid #BBF7D0",
                  padding: "15px 26px",
                  borderRadius: "999px",
                  fontWeight: 600,
                  fontSize: "15px",
                  textDecoration: "none",
                  transition: "all 200ms ease",
                  minHeight: "52px",
                }}
                className="hover:bg-emerald-50 hover:border-emerald-400 active:scale-[0.98]"
              >
                <MessageCircle size={18} />
                <span>WhatsApp Consultant</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
