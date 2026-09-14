"use client";

import React from "react";
import { ArrowRight, ShieldCheck, Clock, MessageCircle } from "lucide-react";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { triggerHaptic } from "@/lib/utils/haptics";

export default function FinalCtaSection() {
  return (
    <section
      style={{
        backgroundColor: "var(--bg-dark)",
        color: "var(--text-inverse)",
        paddingTop: "80px",
        paddingBottom: "80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="container" style={{ maxWidth: "780px", textAlign: "center" }}>
        {/* Risk Reversal Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            color: "var(--accent-gold)",
            padding: "6px 16px",
            borderRadius: "var(--radius-full)",
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "24px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <ShieldCheck size={16} />
          <span>Oven Fresh Quality Guarantee</span>
        </div>

        {/* Headline */}
        <h2
          style={{
            fontSize: "clamp(30px, 4.8vw, 48px)",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
            marginBottom: "18px",
          }}
        >
          Ready to celebrate with an oven fresh cake?
        </h2>

        {/* Subheadline */}
        <p
          style={{
            fontSize: "clamp(16px, 1.8vw, 18px)",
            color: "#C5BCB6",
            lineHeight: 1.6,
            maxWidth: "620px",
            margin: "0 auto 36px",
          }}
        >
          Order handcrafted Belgian dark chocolate truffle cakes and molten brownies for same day delivery across Chennai or thirty minute pickup at our Nungambakkam counter.
        </p>

        {/* Final CTA Buttons Matching Top Conversion Action */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "36px",
          }}
        >
          <a
            href="#signature-cakes"
            onClick={() => triggerHaptic("impact")}
            className="btn-primary pressable"
            style={{
              padding: "10px 24px",
              fontSize: "16px",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <span>Order for delivery or pickup</span>
            <ArrowRight size={16} />
          </a>

          <a
            href={`https://wa.me/${BUSINESS_CONFIG.whatsapp.replace("+", "")}?text=${encodeURIComponent("Hi Kichees! I'd like to ask about a celebration cake.")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => triggerHaptic("selection")}
            className="pressable"
            style={{
              padding: "10px 20px",
              fontSize: "15px",
              fontWeight: 600,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              color: "#FFFFFF",
              borderRadius: "var(--radius-full)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <MessageCircle size={16} style={{ color: "#4ADE80" }} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        {/* Reversal Terms */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "24px",
            fontSize: "13px",
            color: "#8E827A",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Clock size={14} />
            <span>Thirty minute counter pickup</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck size={14} />
            <span>Dedicated separate eggless station</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>•</span>
            <span>Zero artificial premixes</span>
          </div>
        </div>
      </div>
    </section>
  );
}
