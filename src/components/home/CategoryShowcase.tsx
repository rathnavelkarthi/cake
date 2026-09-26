"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { triggerHaptic } from "@/lib/utils/haptics";

const CATEGORY_CARDS = [
  {
    id: "cakes",
    name: "Signature Cakes",
    description: "Multi-layered artisanal gateaux for milestone celebrations",
    image: "/images/hero-truffle.jpg",
    link: "/shop?category=cakes",
    count: "12 Flavours",
  },
  {
    id: "brownies",
    name: "Brownies & Desserts",
    description: "Dense molten chocolate brownies, tarts & tea cakes",
    image: "/images/fudge-brownies.jpg",
    link: "/shop?category=brownies",
    count: "8 Bakes",
  },
  {
    id: "pastries",
    name: "French Pastries",
    description: "Delicate layered single-portion gateaux & tea cakes",
    image: "/images/celebration-cake.jpg",
    link: "/shop?category=pastries",
    count: "6 Items",
  },
  {
    id: "bagels",
    name: "Artisanal Bagels",
    description: "Kettle-boiled New York style bagels slow-fermented for 24 hours",
    image: "https://uiftoqlzlarfkfzqnedk.supabase.co/storage/v1/object/public/custom-cakes/cake-6.jpg",
    link: "/shop?category=bagels",
    count: "Morning Fresh",
  },
  {
    id: "savouries",
    name: "Savouries & Buns",
    description: "Flaky puffs, Korean garlic buns & fresh gourmet bakes",
    image: "https://uiftoqlzlarfkfzqnedk.supabase.co/storage/v1/object/public/custom-cakes/cake-9.jpg",
    link: "/shop?category=savouries",
    count: "Oven Warm",
  },
  {
    id: "eggless",
    name: "100% Pure Eggless",
    description: "Dedicated pure-vegetarian bakes made with cultured butter",
    image: "/images/kichees-hero-cake.jpg",
    link: "/shop?category=eggless",
    count: "Dedicated Counter",
  },
];

export default function CategoryShowcase() {
  return (
    <section
      style={{
        backgroundColor: "var(--bg-primary, #FAF7F2)",
        padding: "64px 24px",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Section Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "36px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--accent-caramel, #C76D38)",
                display: "block",
                marginBottom: "6px",
                fontFamily: "var(--font-manrope, sans-serif)",
              }}
            >
              Artisanal Categories
            </span>
            <h2
              style={{
                fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
                fontSize: "clamp(28px, 3.5vw, 42px)",
                fontWeight: 600,
                color: "var(--text-primary, #1F1714)",
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              What Are You Craving Today?
            </h2>
          </div>

          <Link
            href="/shop"
            onClick={() => triggerHaptic("selection")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--accent-cocoa, #3A2016)",
              textDecoration: "none",
              borderBottom: "1.5px solid var(--accent-caramel, #C76D38)",
              paddingBottom: "2px",
              transition: "all 150ms ease",
            }}
            className="hover:text-amber-800"
          >
            <span>Browse Full Catalogue</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* 6 Category Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {CATEGORY_CARDS.map((cat) => (
            <Link
              key={cat.id}
              href={cat.link}
              onClick={() => triggerHaptic("selection")}
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: "20px",
                overflow: "hidden",
                backgroundColor: "var(--bg-surface, #FFFFFF)",
                border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
                boxShadow: "0 2px 10px rgba(35, 23, 17, 0.03)",
                textDecoration: "none",
                transition: "all 240ms cubic-bezier(0.16, 1, 0.3, 1)",
                position: "relative",
              }}
              className="group hover:-translate-y-1 hover:shadow-xl hover:border-amber-200"
            >
              {/* Category Image Box */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 10",
                  backgroundColor: "#F3ECE2",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 380px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Subtitle Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(6px)",
                    borderRadius: "999px",
                    padding: "3px 10px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--text-secondary, #6B5B53)",
                  }}
                >
                  {cat.count}
                </div>
              </div>

              {/* Card Content */}
              <div
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      marginBottom: "4px",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "var(--text-primary, #1F1714)",
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      {cat.name}
                    </h3>

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

                  <p
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.45,
                      color: "var(--text-secondary, #6B5B53)",
                      margin: 0,
                    }}
                  >
                    {cat.description}
                  </p>
                </div>

                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--accent-caramel, #C76D38)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    paddingTop: "6px",
                  }}
                >
                  Explore Selection →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
