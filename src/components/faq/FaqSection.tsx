"use client";

import React, { useState } from "react";
import { FAQS } from "@/lib/data/faqs";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { trackEvent } from "@/lib/analytics/events";

export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQS[0].id);

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faqs" className="section-padding" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
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
            <HelpCircle size={14} />
            <span>Common Questions</span>
          </div>

          <h2
            className="font-serif"
            style={{
              fontSize: "clamp(28px, 4vw, 38px)",
              fontWeight: 700,
              color: "var(--accent-cocoa)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: "14px",
            }}
          >
            Frequently Asked Questions
          </h2>

          <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Everything you need to know about our ingredients, eggless baking, custom orders, and delivery across Chennai.
          </p>
        </div>

        {/* Accordion Stack with Grid-Template-Rows hardware animation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  overflow: "hidden",
                  transition: "border-color 180ms var(--ease-out), box-shadow 180ms var(--ease-out)",
                  boxShadow: isOpen ? "var(--shadow-sm)" : "none",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(faq.id)}
                  aria-expanded={isOpen}
                  className="pressable"
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 24px",
                    textAlign: "left",
                    backgroundColor: "transparent",
                    color: "var(--accent-cocoa)",
                    fontSize: "16px",
                    fontWeight: 600,
                  }}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 200ms var(--ease-out)",
                      color: isOpen ? "var(--accent-caramel)" : "var(--text-muted)",
                      flexShrink: 0,
                      marginLeft: "16px",
                    }}
                  />
                </button>

                {/* CSS Grid Rows Smooth Expansion */}
                <div className={`accordion-wrapper ${isOpen ? "is-open" : ""}`}>
                  <div className="accordion-inner">
                    <div
                      style={{
                        padding: "0 24px 20px 24px",
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                        lineHeight: 1.65,
                        borderTop: "1px solid rgba(0,0,0,0.03)",
                        paddingTop: "12px",
                      }}
                    >
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Direct WhatsApp Callout */}
        <div
          style={{
            marginTop: "40px",
            textAlign: "center",
            padding: "24px",
            backgroundColor: "var(--bg-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--accent-cocoa)" }}>
              Have a special dietary or celebration question?
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Our team answers queries directly on WhatsApp during counter hours.
            </div>
          </div>

          <a
            href={`https://wa.me/${BUSINESS_CONFIG.whatsapp.replace("+", "")}?text=${encodeURIComponent(
              "Hi Kichees, I have a question about ordering a cake."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent({ name: "click_whatsapp", source: "faq_footer_box" })}
            className="pressable"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "#16A34A",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <MessageCircle size={16} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
