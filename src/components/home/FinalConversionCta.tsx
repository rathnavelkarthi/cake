"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Cake } from "lucide-react";
import { triggerHaptic } from "@/lib/utils/haptics";

interface FinalConversionCtaProps {
  onOpenCustomCake: () => void;
}

export default function FinalConversionCta({ onOpenCustomCake }: FinalConversionCtaProps) {
  return (
    <section
      style={{
        backgroundColor: "var(--accent-cocoa, #3A2016)",
        color: "var(--text-inverse, #FAF7F2)",
        padding: "96px 24px",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Decorative Warm Ambient Glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px",
          height: "400px",
          background: "radial-gradient(ellipse, rgba(199, 109, 56, 0.22) 0%, rgba(221, 167, 82, 0.08) 50%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "760px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "999px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--accent-gold, #DDA752)",
            marginBottom: "18px",
          }}
        >
          <Sparkles size={14} />
          <span>Fresh From The Morning Oven</span>
        </div>

        <h2
          style={{
            fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
            fontSize: "clamp(36px, 4.8vw, 58px)",
            fontWeight: 600,
            lineHeight: 1.08,
            margin: "0 0 16px 0",
            letterSpacing: "-0.01em",
          }}
        >
          Something Sweet <br />
          <span style={{ fontStyle: "italic", color: "var(--accent-gold, #DDA752)" }}>
            Is Waiting For You.
          </span>
        </h2>

        <p
          style={{
            fontSize: "16.5px",
            lineHeight: 1.6,
            color: "rgba(250, 247, 242, 0.8)",
            margin: "0 auto 36px",
            maxWidth: "540px",
          }}
        >
          Explore handcrafted celebration cakes, molten fudge brownies, and fresh European patisserie. Delivered carefully across Chennai.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
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
              backgroundColor: "var(--accent-gold, #DDA752)",
              color: "#1F1714",
              padding: "16px 36px",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "15px",
              textDecoration: "none",
              boxShadow: "0 8px 28px rgba(0, 0, 0, 0.25)",
              transition: "all 200ms ease",
              minHeight: "52px",
            }}
            className="hover:scale-105 hover:bg-amber-400 active:scale-95"
          >
            <span>Explore Complete Menu</span>
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
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              color: "#FAF7F2",
              border: "1.5px solid rgba(255, 255, 255, 0.25)",
              backdropFilter: "blur(8px)",
              padding: "15px 30px",
              borderRadius: "999px",
              fontWeight: 600,
              fontSize: "15px",
              cursor: "pointer",
              transition: "all 200ms ease",
              minHeight: "52px",
            }}
            className="hover:bg-white/15 hover:border-white/40 active:scale-95"
          >
            <Cake size={17} />
            <span>Customize Your Cake</span>
          </button>
        </div>
      </div>
    </section>
  );
}
