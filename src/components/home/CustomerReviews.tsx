"use client";

import React from "react";
import { Star, Quote, CheckCircle } from "lucide-react";

const REVIEWS = [
  {
    id: "rev-1",
    author: "Dr. Sneha Ramachandran",
    locality: "Nungambakkam, Chennai",
    cakeOrdered: "Belgian Chocolate Truffle Gateau (1.5 kg)",
    rating: 5,
    text: "The Belgian chocolate truffle cake for my daughter's 5th birthday was absolutely sublime. Not cloyingly sweet like regular bakery cakes — you can immediately taste the rich couverture cocoa and pure butter. Every guest asked where it came from!",
    occasion: "5th Birthday Celebration",
  },
  {
    id: "rev-2",
    author: "Vikram & Deepa Chandran",
    locality: "Alwarpet, Chennai",
    cakeOrdered: "Custom 2-Tier Vintage Lambeth Cake",
    rating: 5,
    text: "We ordered a custom 2-tier wedding anniversary cake. The hand-piped Lambeth detailing was immaculate, and the temperature-controlled delivery was prompt. The Persian Pistachio flavour is a work of art.",
    occasion: "10th Wedding Anniversary",
  },
  {
    id: "rev-3",
    author: "Karthik Subramanian",
    locality: "Kilpauk, Chennai",
    cakeOrdered: "Dark Fudge Brownie Box & Sesame Bagels",
    rating: 5,
    text: "Hands down the best brownies in Chennai. Dense, fudgy, and intensely chocolaty. Their boiled bagels with garlic herb cream cheese are now our weekly Sunday breakfast tradition.",
    occasion: "Family Weekend Brunch",
  },
];

export default function CustomerReviews() {
  return (
    <section
      style={{
        backgroundColor: "var(--bg-surface, #FFFFFF)",
        padding: "80px 24px",
        borderTop: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
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
            Real Customer Stories
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
            Loved Across Chennai
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.6,
              color: "var(--text-secondary, #6B5B53)",
              margin: 0,
            }}
          >
            From milestone birthdays to quiet Sunday breakfasts, here is what our guests have to say.
          </p>
        </div>

        {/* 3 Review Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "28px",
          }}
        >
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              style={{
                backgroundColor: "var(--bg-primary, #FAF7F2)",
                borderRadius: "24px",
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "20px",
                border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
                boxShadow: "0 4px 16px rgba(35, 23, 17, 0.03)",
              }}
            >
              <div>
                {/* Rating Stars & Occasion Badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", gap: "3px", color: "#F59E0B" }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>

                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--accent-caramel, #C76D38)",
                      backgroundColor: "var(--bg-surface, #FFFFFF)",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.1))",
                    }}
                  >
                    {rev.occasion}
                  </span>
                </div>

                <Quote size={24} className="text-amber-800/25 mb-2" />

                <p
                  style={{
                    fontSize: "14.5px",
                    lineHeight: 1.6,
                    color: "var(--text-primary, #1F1714)",
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              {/* Author & Cake Context */}
              <div
                style={{
                  paddingTop: "16px",
                  borderTop: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary, #1F1714)" }}>
                    {rev.author}
                  </span>
                  <CheckCircle size={14} className="text-emerald-600" />
                </div>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "var(--text-muted, #9A897F)" }}>
                  {rev.locality}
                </p>
                <p style={{ margin: 0, fontSize: "11.5px", fontWeight: 600, color: "var(--accent-cocoa, #3A2016)" }}>
                  Ordered: {rev.cakeOrdered}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
