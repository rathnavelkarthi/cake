"use client";

import React from "react";
import { ShoppingBag, MessageCircle, Phone, Navigation } from "lucide-react";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { trackEvent } from "@/lib/analytics/events";

export default function QuickActionBar() {
  return (
    <section style={{ paddingBottom: "48px" }}>
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          {/* 1. ORDER ONLINE */}
          <a
            href="#signature-cakes"
            onClick={() => trackEvent({ name: "click_phone", source: "quick_action_order" })}
            className="pressable card-hover"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "20px 22px",
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-sm)",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--accent-caramel-subtle)",
                color: "var(--accent-caramel)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShoppingBag size={22} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--accent-cocoa)" }}>
                Order Online
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Delivery or 30-min pickup
              </div>
            </div>
          </a>

          {/* 2. WHATSAPP */}
          <a
            href={`https://wa.me/${BUSINESS_CONFIG.whatsapp.replace("+", "")}?text=${encodeURIComponent("Hi Kichees! I'd like to ask about a cake order.")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent({ name: "click_whatsapp", source: "quick_action_strip" })}
            className="pressable card-hover"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "20px 22px",
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid rgba(37, 211, 102, 0.2)",
              boxShadow: "var(--shadow-sm)",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(37, 211, 102, 0.12)",
                color: "#16A34A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MessageCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--accent-cocoa)" }}>
                WhatsApp Us
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Direct custom inquiries
              </div>
            </div>
          </a>

          {/* 3. CALL NOW */}
          <a
            href={`tel:${BUSINESS_CONFIG.phone}`}
            onClick={() => trackEvent({ name: "click_phone", source: "quick_action_strip" })}
            className="pressable card-hover"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "20px 22px",
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-sm)",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-muted)",
                color: "var(--accent-cocoa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Phone size={22} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--accent-cocoa)" }}>
                Call Bakery Counter
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {BUSINESS_CONFIG.phoneDisplay}
              </div>
            </div>
          </a>

          {/* 4. GET DIRECTIONS */}
          <a
            href={BUSINESS_CONFIG.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent({ name: "click_directions", source: "quick_action_strip" })}
            className="pressable card-hover"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "20px 22px",
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-sm)",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--accent-sage-subtle)",
                color: "var(--accent-sage)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Navigation size={22} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--accent-cocoa)" }}>
                Get Directions
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {BUSINESS_CONFIG.address.locality}, Chennai
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
