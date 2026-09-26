"use client";

import React from "react";
import { Sparkles, ShieldCheck, HeartHandshake, Truck } from "lucide-react";

const VALUE_PILLARS = [
  {
    icon: Sparkles,
    title: "Freshly Baked Daily",
    description: "Every sponge, bagel, and brownie is baked fresh in small batches each morning.",
  },
  {
    icon: ShieldCheck,
    title: "100% Pure Butter & Couverture",
    description: "Real dairy butter, 54% Belgian Callebaut chocolate, and zero synthetic preservatives.",
  },
  {
    icon: HeartHandshake,
    title: "Bespoke Custom Studio",
    description: "Personalised flavour profiles, tier architecture, and custom hand-piped messages.",
  },
  {
    icon: Truck,
    title: "Same-Day Chennai Delivery",
    description: "Carefully hand-delivered across Chennai from our Harrisons Hotel & Nungambakkam locations.",
  },
];

export default function BrandValueStrip() {
  return (
    <section
      style={{
        backgroundColor: "var(--bg-surface, #FFFFFF)",
        borderTop: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
        borderBottom: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "28px",
          }}
        >
          {VALUE_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    backgroundColor: "var(--bg-primary, #FAF7F2)",
                    border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.1))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent-caramel, #C76D38)",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h4
                    style={{
                      fontFamily: "var(--font-manrope, sans-serif)",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--text-primary, #1F1714)",
                      margin: "0 0 4px 0",
                    }}
                  >
                    {pillar.title}
                  </h4>
                  <p
                    style={{
                      fontSize: "12.5px",
                      lineHeight: 1.5,
                      color: "var(--text-secondary, #6B5B53)",
                      margin: 0,
                    }}
                  >
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
