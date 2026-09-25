"use client";

import React from "react";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { MapPin, Phone, MessageCircle, Clock, ShieldCheck } from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--bg-dark)",
        color: "#FAF7F2",
        paddingTop: "72px",
        paddingBottom: "40px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "48px",
            marginBottom: "56px",
          }}
        >
          {/* Column 1: Brand & Philosophy */}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "16px" }}>
              <span
                className="font-serif"
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  letterSpacing: "-0.02em",
                }}
              >
                KICHEES
              </span>
              <span
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "var(--accent-gold)",
                }}
              >
                Baked Delights
              </span>
            </div>

            <p
              style={{
                fontSize: "13px",
                color: "#A89D96",
                lineHeight: 1.6,
                marginBottom: "20px",
              }}
            >
              {BUSINESS_CONFIG.shortDescription}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-gold)", fontSize: "12px", fontWeight: 600 }}>
              <ShieldCheck size={16} />
              <span>FSSAI Lic. #22421539000128 • Clean Kitchen Certified</span>
            </div>
          </div>

          {/* Column 2: Bakery Location & Hours */}
          <div>
            <h4
              className="font-serif"
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#FFFFFF",
                marginBottom: "16px",
                letterSpacing: "-0.01em",
              }}
            >
              Bakery Counter & Hours
            </h4>

            <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
              <MapPin size={18} style={{ color: "var(--accent-caramel)", flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "13px", color: "#C5BCB6", lineHeight: 1.5 }}>
                {BUSINESS_CONFIG.address.full}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <Clock size={18} style={{ color: "var(--accent-gold)", flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "13px", color: "#C5BCB6" }}>
                {BUSINESS_CONFIG.openingHours[0].days}: {BUSINESS_CONFIG.openingHours[0].hours}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <a
                href={BUSINESS_CONFIG.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ name: "click_directions", source: "footer" })}
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--accent-caramel)",
                  textDecoration: "none",
                }}
              >
                Open in Maps →
              </a>
            </div>
          </div>

          {/* Column 3: Direct Contact */}
          <div>
            <h4
              className="font-serif"
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#FFFFFF",
                marginBottom: "16px",
                letterSpacing: "-0.01em",
              }}
            >
              Direct Order Lines
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <a
                href={`tel:${BUSINESS_CONFIG.phone}`}
                onClick={() => trackEvent({ name: "click_phone", source: "footer" })}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#FAF7F2",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                <Phone size={16} style={{ color: "var(--accent-gold)" }} />
                <span>{BUSINESS_CONFIG.phoneDisplay}</span>
              </a>

              <a
                href={`https://wa.me/${BUSINESS_CONFIG.whatsapp.replace("+", "")}?text=${encodeURIComponent("Hi Kichees! I would like to place an order.")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ name: "click_whatsapp", source: "footer" })}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#4ADE80",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                <MessageCircle size={16} />
                <span>{BUSINESS_CONFIG.whatsappDisplay} (WhatsApp)</span>
              </a>

              <div style={{ fontSize: "12px", color: "#8E827A", marginTop: "4px" }}>
                Delivery across {BUSINESS_CONFIG.deliveryZones.primary}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div
          style={{
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "12px",
            color: "#8E827A",
          }}
        >
          <div suppressHydrationWarning>
            © {new Date().getFullYear()} {BUSINESS_CONFIG.name}. Handcrafted in Nungambakkam, Chennai.
          </div>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
            <a href="#signature-cakes" style={{ color: "#8E827A", textDecoration: "none" }}>Signature Bakes</a>
            <a href="#custom-studio" style={{ color: "#8E827A", textDecoration: "none" }}>Custom Cakes</a>
            <a href="#faqs" style={{ color: "#8E827A", textDecoration: "none" }}>Delivery Policy</a>
            <a href="#faqs" style={{ color: "#8E827A", textDecoration: "none" }}>Privacy Policy</a>
            <a href="#faqs" style={{ color: "#8E827A", textDecoration: "none" }}>Terms of Service</a>
            <a href="/admin/login" style={{ color: "#544B45", textDecoration: "none", fontSize: "11px", opacity: 0.5 }} title="Bakery Staff Access">Staff</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
