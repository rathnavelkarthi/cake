"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { triggerHaptic } from "@/lib/utils/haptics";

const OCCASIONS = [
  {
    id: "birthday",
    title: "Birthdays",
    subtitle: "Make their day unforgettable",
    description: "Multi-layered ganache, chocolate drip, and celebration toppings.",
    image: "https://uiftoqlzlarfkfzqnedk.supabase.co/storage/v1/object/public/custom-cakes/cake-3.jpg",
    link: "/shop?search=Birthday",
    badge: "Most Popular",
  },
  {
    id: "anniversary",
    title: "Anniversaries",
    subtitle: "Something sweet for two",
    description: "Romantic Red Velvet, Belgian Truffle, and delicate hand-drawn florals.",
    image: "https://uiftoqlzlarfkfzqnedk.supabase.co/storage/v1/object/public/custom-cakes/cake-4.jpg",
    link: "/shop?search=Anniversary",
    badge: "Artisanal",
  },
  {
    id: "weddings",
    title: "Weddings & Milestones",
    subtitle: "Celebrate beautifully",
    description: "Grand tiered architecture with bespoke floral and botanical styling.",
    image: "/images/kichees-hero-cake.jpg",
    link: "/shop?category=cakes",
    badge: "Bespoke",
  },
  {
    id: "just-because",
    title: "Just Because",
    subtitle: "No reason needed",
    description: "Afternoon tea cakes, molten brownies, and flaky morning bakes.",
    image: "/images/fudge-brownies.jpg",
    link: "/shop?category=brownies",
    badge: "Daily Treat",
  },
];

export default function OccasionShowcase() {
  return (
    <section
      style={{
        backgroundColor: "var(--bg-primary, #FAF7F2)",
        padding: "80px 24px",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 48px" }}>
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
            Celebration Moments
          </span>
          <h2
            style={{
              fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 600,
              color: "var(--text-primary, #1F1714)",
              margin: "0 0 12px 0",
              lineHeight: 1.15,
            }}
          >
            Baked For Every Moment
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.6,
              color: "var(--text-secondary, #6B5B53)",
              margin: 0,
            }}
          >
            Whether it is an intimate date night or a 200-guest gathering, we bake cakes that match the joy of the occasion.
          </p>
        </div>

        {/* 4 Occasion Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "28px",
          }}
        >
          {OCCASIONS.map((occ) => (
            <Link
              key={occ.id}
              href={occ.link}
              onClick={() => triggerHaptic("selection")}
              style={{
                borderRadius: "24px",
                overflow: "hidden",
                position: "relative",
                backgroundColor: "var(--bg-surface, #FFFFFF)",
                border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
                boxShadow: "0 4px 20px rgba(35, 23, 17, 0.04)",
                display: "flex",
                flexDirection: "column",
                textDecoration: "none",
                transition: "all 260ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              className="group hover:-translate-y-1.5 hover:shadow-xl hover:border-amber-200"
            >
              {/* Image Container with Zoom */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1 / 1",
                  backgroundColor: "#F3ECE2",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={occ.image}
                  alt={occ.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 300px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "14px",
                    left: "14px",
                    backgroundColor: "rgba(255, 255, 255, 0.92)",
                    backdropFilter: "blur(6px)",
                    borderRadius: "999px",
                    padding: "4px 12px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--accent-cocoa, #3A2016)",
                  }}
                >
                  {occ.badge}
                </div>
              </div>

              {/* Card Body */}
              <div
                style={{
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "var(--text-primary, #1F1714)",
                      margin: "0 0 4px 0",
                      lineHeight: 1.2,
                    }}
                  >
                    {occ.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--accent-caramel, #C76D38)",
                      margin: "0 0 6px 0",
                    }}
                  >
                    {occ.subtitle}
                  </p>
                  <p
                    style={{
                      fontSize: "12.5px",
                      lineHeight: 1.45,
                      color: "var(--text-secondary, #6B5B53)",
                      margin: 0,
                    }}
                  >
                    {occ.description}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "8px",
                    borderTop: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "var(--accent-cocoa, #3A2016)",
                    }}
                  >
                    Explore Occasion
                  </span>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      backgroundColor: "var(--bg-primary, #FAF7F2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent-cocoa, #3A2016)",
                      transition: "all 200ms ease",
                    }}
                    className="group-hover:bg-amber-900 group-hover:text-white"
                  >
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
