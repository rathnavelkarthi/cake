"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Award, Heart } from "lucide-react";
import { triggerHaptic } from "@/lib/utils/haptics";

export default function EditorialStory() {
  return (
    <section
      style={{
        backgroundColor: "var(--bg-surface, #FFFFFF)",
        padding: "96px 24px",
        borderTop: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
        borderBottom: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "56px",
            alignItems: "center",
          }}
          className="lg:grid-cols-12"
        >
          {/* Left Column: Atmospheric Artisan Bakery Photography */}
          <div className="lg:col-span-6" style={{ position: "relative" }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "4 / 3",
                borderRadius: "28px",
                overflow: "hidden",
                boxShadow: "0 24px 60px rgba(35, 23, 17, 0.12)",
                backgroundColor: "#F3ECE2",
              }}
            >
              <Image
                src="/images/kichees-artisan-baker.jpg"
                alt="Artisan baker at work in Kichees bakery kitchen"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>

            {/* Floating Location Card */}
            <div
              style={{
                position: "absolute",
                bottom: "-20px",
                left: "24px",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(12px)",
                borderRadius: "16px",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 12px 32px rgba(35, 23, 17, 0.14)",
                border: "1px solid rgba(255, 255, 255, 0.9)",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "var(--accent-caramel-subtle, #FBEFE7)",
                  color: "var(--accent-caramel, #C76D38)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MapPin size={18} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text-primary, #1F1714)" }}>
                  Two Chennai Outlets
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "var(--text-secondary, #6B5B53)" }}>
                  Harrisons Hotel & Nungambakkam High Rd
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Philosophy & Craft */}
          <div className="lg:col-span-6" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--accent-caramel, #C76D38)",
                  display: "block",
                  marginBottom: "8px",
                  fontFamily: "var(--font-manrope, sans-serif)",
                }}
              >
                Our Baking Philosophy
              </span>

              <h2
                style={{
                  fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
                  fontSize: "clamp(34px, 4.2vw, 52px)",
                  fontWeight: 600,
                  color: "var(--text-primary, #1F1714)",
                  margin: "0 0 16px 0",
                  lineHeight: 1.1,
                }}
              >
                Baked Fresh. <br />
                <span style={{ fontStyle: "italic", color: "var(--accent-caramel, #C76D38)" }}>
                  Made With Care.
                </span>
              </h2>

              <p
                style={{
                  fontSize: "16px",
                  lineHeight: 1.65,
                  color: "var(--text-secondary, #6B5B53)",
                  margin: "0 0 16px 0",
                  fontFamily: "var(--font-manrope, sans-serif)",
                }}
              >
                At Kichees Baked Delights, we believe great baked goods begin with ingredient integrity. We do not use commercial cake premixes, artificial emulsifiers, or vegetable shortenings.
              </p>

              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.65,
                  color: "var(--text-secondary, #6B5B53)",
                  margin: 0,
                  fontFamily: "var(--font-manrope, sans-serif)",
                }}
              >
                Every sponge is whipped from scratch using unbleached wheat flour, farm-fresh eggs, pure dairy butter, and genuine 54% Callebaut Belgian chocolate. We slow-ferment our bagels for 24 hours and bake our cookies daily to guarantee honest, melt-in-the-mouth flavour.
              </p>
            </div>

            {/* Proof Numbers Strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
                padding: "20px 0",
                borderTop: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
                borderBottom: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "26px",
                    fontWeight: 800,
                    color: "var(--accent-cocoa, #3A2016)",
                    fontFamily: "var(--font-manrope, sans-serif)",
                    display: "block",
                  }}
                >
                  100%
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary, #6B5B53)" }}>
                  Scratch-Baked Daily
                </span>
              </div>

              <div>
                <span
                  style={{
                    fontSize: "26px",
                    fontWeight: 800,
                    color: "var(--accent-cocoa, #3A2016)",
                    fontFamily: "var(--font-manrope, sans-serif)",
                    display: "block",
                  }}
                >
                  4,000+
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary, #6B5B53)" }}>
                  Chennai Celebrations
                </span>
              </div>

              <div>
                <span
                  style={{
                    fontSize: "26px",
                    fontWeight: 800,
                    color: "var(--accent-cocoa, #3A2016)",
                    fontFamily: "var(--font-manrope, sans-serif)",
                    display: "block",
                  }}
                >
                  2 Hubs
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary, #6B5B53)" }}>
                  Nungambakkam & Harrisons
                </span>
              </div>
            </div>

            <div>
              <Link
                href="/shop"
                onClick={() => triggerHaptic("selection")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "var(--accent-cocoa, #3A2016)",
                  fontWeight: 700,
                  fontSize: "14.5px",
                  textDecoration: "none",
                  borderBottom: "1.5px solid var(--accent-caramel, #C76D38)",
                  paddingBottom: "3px",
                }}
                className="hover:text-amber-800"
              >
                <span>Taste the difference in our daily bakes</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
