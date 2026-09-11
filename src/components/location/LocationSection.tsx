"use client";

import React, { useState } from "react";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { MapPin, Phone, Clock, Navigation, Truck, MessageCircle, CheckCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";
import { triggerHaptic } from "@/lib/utils/haptics";

const CHENNAI_NEIGHBORHOODS = [
  { name: "Nungambakkam", time: "15–25 min", distance: "0–2 km" },
  { name: "T. Nagar", time: "25–35 min", distance: "3–4 km" },
  { name: "Alwarpet", time: "30–40 min", distance: "4–5 km" },
  { name: "Kilpauk", time: "30–40 min", distance: "3–4 km" },
  { name: "Mylapore", time: "35–45 min", distance: "5–6 km" },
  { name: "Anna Nagar", time: "40–50 min", distance: "7–9 km" },
  { name: "Adyar", time: "45–55 min", distance: "8–10 km" },
  { name: "Egmore", time: "20–30 min", distance: "2–3 km" },
];

export default function LocationSection() {
  const [selectedArea, setSelectedArea] = useState(CHENNAI_NEIGHBORHOODS[0]);

  const handleSelectArea = (area: typeof CHENNAI_NEIGHBORHOODS[0]) => {
    triggerHaptic("selection");
    setSelectedArea(area);
  };

  return (
    <section id="location" className="section-padding" style={{ backgroundColor: "var(--bg-surface)" }}>
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "48px",
            alignItems: "center",
          }}
          className="location-grid"
        >
          {/* Left Column: Details & Practical Visit Information */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--accent-caramel)",
                marginBottom: "8px",
              }}
            >
              <MapPin size={14} />
              <span>Visit or Pickup</span>
            </div>

            <h2
              className="font-serif"
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 700,
                color: "var(--accent-cocoa)",
                letterSpacing: "-0.02em",
                lineHeight: 1.18,
                marginBottom: "16px",
              }}
            >
              Our Nungambakkam Kitchen & Counter
            </h2>

            <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "28px" }}>
              Centrally located on Nungambakkam High Road. Walk in for counter takeaways, cake tastings, or pick up your pre-ordered celebration gateaux in as little as 30 minutes.
            </p>

            {/* Info Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
              {/* Address */}
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--accent-caramel-subtle)",
                    color: "var(--accent-caramel)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent-cocoa)" }}>
                    Address
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.45, marginTop: "2px" }}>
                    {BUSINESS_CONFIG.address.full}
                    <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" }}>
                      Landmark: {BUSINESS_CONFIG.address.landmark}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-muted)",
                    color: "var(--accent-cocoa)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent-cocoa)" }}>
                    Counter Hours
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {BUSINESS_CONFIG.openingHours[0].days}: <strong>{BUSINESS_CONFIG.openingHours[0].hours}</strong>
                  </div>
                </div>
              </div>

              {/* Delivery Scope with Interactive Locality Matrix */}
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--accent-sage-subtle)",
                    color: "var(--accent-sage)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Truck size={20} />
                </div>
                <div style={{ width: "100%" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent-cocoa)" }}>
                    Chennai Delivery Reach
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.45, marginTop: "2px", marginBottom: "10px" }}>
                    Direct dispatch across central & greater Chennai from our oven. Click your neighborhood to see delivery estimate:
                  </div>

                  {/* Locality Chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                    {CHENNAI_NEIGHBORHOODS.map((area) => {
                      const isSelected = selectedArea.name === area.name;
                      return (
                        <button
                          key={area.name}
                          type="button"
                          onClick={() => handleSelectArea(area)}
                          className="pressable"
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "4px 9px",
                            borderRadius: "var(--radius-full)",
                            backgroundColor: isSelected ? "var(--accent-cocoa)" : "var(--bg-muted)",
                            color: isSelected ? "#FFFFFF" : "var(--text-secondary)",
                            border: isSelected ? "1px solid var(--accent-cocoa)" : "1px solid var(--border-subtle)",
                            transition: "all 140ms var(--ease-apple-spring)",
                          }}
                          aria-pressed={isSelected}
                        >
                          {area.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Live Selected Area Transit Estimate */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--accent-caramel)",
                      backgroundColor: "var(--accent-caramel-subtle)",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <CheckCircle size={13} />
                    <span>
                      {selectedArea.name} ({selectedArea.distance}): est. <strong>{selectedArea.time}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <a
                href={BUSINESS_CONFIG.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ name: "click_directions", source: "location_section" })}
                className="btn-primary pressable"
                style={{ textDecoration: "none" }}
              >
                <Navigation size={16} />
                <span>Get Directions in Maps</span>
              </a>

              <a
                href={`tel:${BUSINESS_CONFIG.phone}`}
                onClick={() => trackEvent({ name: "click_phone", source: "location_section" })}
                className="btn-secondary pressable"
                style={{ textDecoration: "none" }}
              >
                <Phone size={16} />
                <span>Call {BUSINESS_CONFIG.phoneDisplay}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Visual Map / Bakery Storefront Card */}
          <div
            style={{
              backgroundColor: "var(--bg-primary)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {/* Map Frame Graphic */}
            <div
              style={{
                position: "relative",
                height: "320px",
                backgroundColor: "#E5DEC9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {/* Background styled map grid illustration */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "radial-gradient(#4a2e1f 1px, transparent 1px), linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
                  backgroundSize: "20px 20px, 40px 40px, 40px 40px",
                  opacity: 0.6,
                }}
              />

              {/* Pin Callout Marker */}
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  backgroundColor: "var(--accent-cocoa)",
                  color: "#FFFFFF",
                  padding: "12px 18px",
                  borderRadius: "var(--radius-full)",
                  boxShadow: "0 8px 24px rgba(35, 23, 17, 0.28)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  border: "2px solid #FFFFFF",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#4ADE80",
                  }}
                />
                <span style={{ fontSize: "13px", fontWeight: 700 }}>
                  Kichees • 142 Nungambakkam High Rd
                </span>
              </div>
            </div>

            {/* Quick Contact Footnote */}
            <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-cocoa)" }}>
                  Need assistance finding us?
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  We are right near the Sterling Road junction.
                </div>
              </div>

              <a
                href={`https://wa.me/${BUSINESS_CONFIG.whatsapp.replace("+", "")}?text=${encodeURIComponent("Hi Kichees! I'm on my way to your Nungambakkam counter.")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ name: "click_whatsapp", source: "location_map_card" })}
                className="pressable"
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#166534",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  textDecoration: "none",
                }}
              >
                <MessageCircle size={15} style={{ color: "#16A34A" }} />
                <span>Chat with Counter</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          .location-grid {
            grid-template-columns: 1.15fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
