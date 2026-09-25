"use client";

import React from "react";
import { Sparkles, Calendar, Gift, ArrowRight } from "lucide-react";
import { triggerHaptic } from "@/lib/utils/haptics";

const STEPS = [
  {
    step: "01",
    title: "Select your bake & dietary preference",
    description:
      "Explore handcrafted Belgian dark chocolate truffle, Basque cheesecake, or molten brownie boxes with verified eggless options.",
    icon: Sparkles,
  },
  {
    step: "02",
    title: "Choose delivery slot or counter pickup",
    description:
      "Select thirty minute pickup at Nungambakkam High Road or scheduled temperature safe dispatch to your doorstep anywhere in Chennai.",
    icon: Calendar,
  },
  {
    step: "03",
    title: "Celebrate with oven fresh quality",
    description:
      "Receive your cake fresh from the morning bake, perfectly chilled and ready to serve with celebratory candles and knife included.",
    icon: Gift,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="section-padding"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: "640px", margin: "0 auto 48px", textAlign: "center" }}>
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
              marginBottom: "10px",
            }}
          >
            <span>Simple Order Process</span>
          </div>

          <h2
            style={{
              fontSize: "clamp(26px, 3.8vw, 40px)",
              fontWeight: 800,
              color: "var(--accent-cocoa)",
              letterSpacing: "-0.025em",
              lineHeight: 1.2,
              marginBottom: "14px",
            }}
          >
            How it works in three steps
          </h2>

          <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            From our Nungambakkam oven to your celebration table in under two hours.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-0"
        >
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="card-hover"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  padding: "32px 28px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
              >
                {/* Step Number Monospace Badge */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor: "var(--accent-caramel-subtle)",
                      color: "var(--accent-caramel)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={22} />
                  </div>

                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "var(--accent-cocoa)",
                      opacity: 0.25,
                    }}
                  >
                    {item.step}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--accent-cocoa)",
                    marginBottom: "10px",
                    lineHeight: 1.35,
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                    marginTop: "auto",
                  }}
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Action Anchor */}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <a
            href="#signature-cakes"
            onClick={() => triggerHaptic("selection")}
            className="btn-primary pressable"
            style={{
              padding: "8px 16px",
              fontSize: "16px",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <span>Start your order</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
