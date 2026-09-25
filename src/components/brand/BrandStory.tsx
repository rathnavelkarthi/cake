"use client";

import React from "react";
import { ShieldCheck, Sparkles, Heart, Utensils, CheckCircle } from "lucide-react";
import { BUSINESS_CONFIG } from "@/lib/config/business";

export default function BrandStory() {
  return (
    <section id="bakery-story" className="section-padding" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="container">
        {/* Editorial Introduction */}
        <div style={{ maxWidth: "760px", margin: "0 auto 56px", textAlign: "center" }}>
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
            <Sparkles size={14} />
            <span>The Kichees Standard</span>
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
              marginBottom: "16px",
            }}
          >
            How we bake in our Nungambakkam kitchen
          </h2>

          <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: 1.65 }}>
            Most commercial cakes today rely on shelf stable cake premixes, artificial stabilizers, and vegetable fats. At {BUSINESS_CONFIG.name}, we follow traditional European pastry fundamentals with ingredients you recognise.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14 min-w-0"
        >
          {/* Pillar 1 */}
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              padding: "28px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--accent-caramel-subtle)",
                color: "var(--accent-caramel)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-serif" style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent-cocoa)", marginBottom: "8px" }}>
              100% Pure Dairy Butter
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.55 }}>
              We bake exclusively with unsalted farm butter and fresh dairy cream. No vanaspati, no margarine, and zero palm oil fats.
            </p>
          </div>

          {/* Pillar 2 */}
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              padding: "28px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--accent-cocoa)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <Utensils size={20} />
            </div>
            <h3 className="font-serif" style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent-cocoa)", marginBottom: "8px" }}>
              Belgian Callebaut Chocolate
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.55 }}>
              Our truffle ganaches and fudge brownies are made with genuine 54% and 70% Callebaut dark chocolate for authentic depth.
            </p>
          </div>

          {/* Pillar 3 */}
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              padding: "28px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--accent-sage-subtle)",
                color: "var(--accent-sage)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <CheckCircle size={22} />
            </div>
            <h3 className="font-serif" style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent-cocoa)", marginBottom: "8px" }}>
              Dedicated Eggless Counter
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.55 }}>
              We maintain separated mixing bowls, whisks, and cake tins for eggless bakes to prevent cross-contact.
            </p>
          </div>

          {/* Pillar 4 */}
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              padding: "28px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-muted)",
                color: "var(--accent-cocoa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <Heart size={20} />
            </div>
            <h3 className="font-serif" style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent-cocoa)", marginBottom: "8px" }}>
              Baked in Daily Batches
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.55 }}>
              Sponges are baked each morning for same day delivery. We never freeze bases or sell day old display cakes.
            </p>
          </div>
        </div>

        {/* Photography Showcase Banner */}
        <div
          style={{
            position: "relative",
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid var(--border-subtle)",
            display: "grid",
            gridTemplateColumns: "1fr",
            backgroundColor: "var(--bg-dark)",
            color: "#FFFFFF",
          }}
          className="counter-banner-grid"
        >
          <div style={{ padding: "clamp(24px, 5vw, 48px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: "12px", color: "var(--accent-gold)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
              Visit the Counter
            </div>
            <h3
              className="font-serif"
              style={{
                fontSize: "clamp(24px, 3.5vw, 36px)",
                fontWeight: 700,
                color: "#FFFFFF",
                lineHeight: 1.2,
                marginBottom: "16px",
              }}
            >
              Watch fresh batches coming out of our stone ovens.
            </h3>
            <p style={{ fontSize: "14px", color: "#C5BCB6", lineHeight: 1.6, marginBottom: "24px", maxWidth: "480px" }}>
              Step into our Nungambakkam patisserie counter to pick up warm fudge brownies, sample seasonal slices, or discuss your upcoming custom cake in person.
            </p>
            <div>
              <a
                href={BUSINESS_CONFIG.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary pressable"
                style={{ display: "inline-flex", textDecoration: "none" }}
              >
                Get Directions to Nungambakkam
              </a>
            </div>
          </div>

          <div style={{ minHeight: "320px", position: "relative" }}>
            <img
              src="/images/bakery-counter.jpg"
              alt="Kichees Bakery Counter in Nungambakkam Chennai"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 860px) {
          .counter-banner-grid {
            grid-template-columns: 1.1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
