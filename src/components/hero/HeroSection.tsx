"use client";

import React from "react";
import { ArrowRight, Clock, Sparkles, ShieldCheck, MapPin, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { trackEvent } from "@/lib/analytics/events";
import { triggerHaptic } from "@/lib/utils/haptics";

export default function HeroSection() {
  const { fulfilmentType, setFulfilmentType } = useCart();

  const handleFulfilmentToggle = (type: "delivery" | "pickup") => {
    triggerHaptic("selection");
    setFulfilmentType(type);
  };

  const handleOrderOnlineClick = () => {
    triggerHaptic("impact");
    trackEvent({ name: "click_phone", source: "hero_order_online" });
  };

  const handleCustomCakesClick = () => {
    triggerHaptic("impact");
    trackEvent({ name: "begin_custom_cake" });
  };

  return (
    <section
      style={{
        position: "relative",
        paddingTop: "40px",
        paddingBottom: "72px",
        overflow: "hidden",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "48px",
            alignItems: "center",
          }}
          className="hero-grid"
        >
          {/* Left Column: Editorial Presentation & Conversion */}
          <div>
            {/* Location & Kitchen Live Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "var(--accent-caramel-subtle)",
                color: "var(--accent-cocoa)",
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "20px",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 2px 6px rgba(199, 109, 56, 0.08)",
                border: "1px solid rgba(199, 109, 56, 0.15)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: "#22C55E",
                  boxShadow: "0 0 8px #22C55E",
                }}
              />
              <span className="tag-label" style={{ textTransform: "none", letterSpacing: "0.01em", color: "var(--accent-cocoa)" }}>
                Baking fresh today • {BUSINESS_CONFIG.address.locality}, Chennai
              </span>
            </div>

            {/* Editorial Headline with Optical Tracking */}
            <h1
              className="font-serif"
              style={{
                fontSize: "clamp(34px, 5.2vw, 56px)",
                fontWeight: 700,
                lineHeight: 1.08,
                color: "var(--accent-cocoa)",
                letterSpacing: "-0.03em",
                marginBottom: "20px",
              }}
            >
              Baked fresh in Nungambakkam. <br />
              <span style={{ color: "var(--accent-caramel)", fontStyle: "italic", fontWeight: 500 }}>
                Made for Chennai&apos;s celebrations.
              </span>
            </h1>

            {/* Honest Product Narrative */}
            <p
              style={{
                fontSize: "clamp(16px, 1.8vw, 18px)",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                maxWidth: "540px",
                marginBottom: "28px",
                letterSpacing: "-0.005em",
              }}
            >
              Handcrafted cakes, molten fudge brownies, and bespoke gateaux baked with 100% pure butter and single-origin Belgian chocolate. No commercial premixes. No shortcuts.
            </p>

            {/* Apple Tactile Segmented Fulfilment Switcher */}
            <div
              className="apple-segmented-control"
              style={{ marginBottom: "32px" }}
              role="tablist"
              aria-label="Order Fulfilment Method"
            >
              <button
                type="button"
                role="tab"
                aria-selected={fulfilmentType === "delivery"}
                onClick={() => handleFulfilmentToggle("delivery")}
                className={`apple-segmented-item ${fulfilmentType === "delivery" ? "is-active" : ""}`}
              >
                <Truck size={15} style={{ color: fulfilmentType === "delivery" ? "var(--accent-caramel)" : "inherit" }} />
                <span>Delivery across Chennai</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={fulfilmentType === "pickup"}
                onClick={() => handleFulfilmentToggle("pickup")}
                className={`apple-segmented-item ${fulfilmentType === "pickup" ? "is-active" : ""}`}
              >
                <Clock size={15} style={{ color: fulfilmentType === "pickup" ? "var(--accent-caramel)" : "inherit" }} />
                <span>Pickup in 30 Mins</span>
              </button>
            </div>

            {/* Primary & Secondary Conversion Buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "14px",
                alignItems: "center",
                marginBottom: "36px",
              }}
            >
              <a
                href="#signature-cakes"
                onClick={handleOrderOnlineClick}
                className="btn-primary pressable"
              >
                <span>Order Online</span>
                <ArrowRight size={16} />
              </a>

              <a
                href="#custom-studio"
                onClick={handleCustomCakesClick}
                className="btn-secondary pressable"
              >
                <Sparkles size={16} style={{ color: "var(--accent-caramel)" }} />
                <span>Custom Cakes</span>
              </a>
            </div>

            {/* Verified Kitchen Standards */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "20px",
                paddingTop: "20px",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} style={{ color: "var(--accent-sage)" }} />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                  100% Pure Butter
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "12px",
                    height: "12px",
                    border: "2px solid var(--accent-sage)",
                    borderRadius: "2px",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      width: "6px",
                      height: "6px",
                      backgroundColor: "var(--accent-sage)",
                      borderRadius: "50%",
                      top: "1px",
                      left: "1px",
                    }}
                  />
                </span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Separate Eggless Station
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={16} style={{ color: "var(--accent-caramel)" }} />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Same-Day Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Resolution Food Photography Showcase */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "relative",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                boxShadow: "0 24px 60px rgba(58, 32, 22, 0.16)",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-surface)",
                aspectRatio: "4 / 3",
              }}
            >
              <img
                src="/images/hero-truffle.jpg"
                alt="Belgian Dark Chocolate Truffle Cake at Kichees Baked Delights"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {/* Bottom Apple Floating Glass Card */}
              <div
                className="glass-floating-card"
                style={{
                  position: "absolute",
                  bottom: "16px",
                  right: "16px",
                  left: "16px",
                  backgroundColor: "var(--material-floating)",
                  backdropFilter: "var(--material-blur)",
                  WebkitBackdropFilter: "var(--material-blur)",
                  padding: "14px 18px",
                  borderRadius: "var(--radius-lg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 12px 32px rgba(35, 23, 17, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.65)",
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent-cocoa)", letterSpacing: "-0.01em" }}>
                    Belgian Dark Chocolate Truffle
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "1px" }}>
                    From ₹650 • 100% Eggless Option
                  </div>
                </div>

                <a
                  href="#signature-cakes"
                  onClick={() => triggerHaptic("selection")}
                  className="pressable"
                  style={{
                    backgroundColor: "var(--accent-caramel)",
                    color: "#FFFFFF",
                    padding: "8px 18px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "12px",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 2px 8px rgba(199, 109, 56, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                  }}
                >
                  Order
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 960px) {
          .hero-grid {
            grid-template-columns: 1.15fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
