"use client";

import React from "react";
import { Star, ShieldCheck } from "lucide-react";

interface Review {
  name: string;
  locality: string;
  order: string;
  date: string;
  rating: number;
  text: string;
  verified: boolean;
}

const REVIEWS: Review[] = [
  {
    name: "Dr. Ananya Sundaram",
    locality: "Harrington Road, Chetpet",
    order: "1.5 kg Belgian Dark Chocolate Truffle",
    date: "14 Aug 2026",
    rating: 5,
    text: "Ordered for my father's 70th birthday. The chocolate ganache was rich and genuinely made with real butter, not the sugary whipped topping that other bakeries use. Arrived chilled and spotless.",
    verified: true,
  },
  {
    name: "Karthik Narayanan",
    locality: "Alwarpet, Chennai",
    order: "Box of 6 Classic Dark Fudge Brownies",
    date: "28 Aug 2026",
    rating: 5,
    text: "Picked these up thirty minutes after ordering from their Nungambakkam counter. Dense, molten center with crisp crinkly tops. My team finished the entire box in ten minutes.",
    verified: true,
  },
  {
    name: "Meera & Rajesh Varma",
    locality: "Anna Nagar East",
    order: "2.0 kg Roasted Hazelnut Praline (Eggless)",
    date: "2 Sep 2026",
    rating: 5,
    text: "Finding a strictly separate eggless preparation for my mother in law that still tastes luxurious used to be impossible in Chennai. Kichees nailed the praline crunch and texture.",
    verified: true,
  },
];

export default function CustomerReviews() {
  return (
    <section
      id="customer-reviews"
      className="section-padding"
      style={{
        backgroundColor: "var(--bg-primary)",
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
            <span>Verified Customer Stories</span>
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
            Baked for Chennai celebrations
          </h2>

          <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Over 1,240 birthday and family milestones served directly from our Nungambakkam kitchen.
          </p>
        </div>

        {/* Reviews Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {REVIEWS.map((review, idx) => (
            <div
              key={idx}
              className="card-hover"
              style={{
                backgroundColor: "var(--bg-surface)",
                padding: "28px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Star Rating & Verified Pill */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div style={{ display: "flex", gap: "3px", color: "var(--accent-gold)" }}>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--accent-sage)",
                    backgroundColor: "var(--accent-sage-subtle)",
                    padding: "3px 8px",
                    borderRadius: "var(--radius-full)",
                  }}
                >
                  <ShieldCheck size={12} />
                  <span>Verified Order</span>
                </div>
              </div>

              {/* Review Text */}
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-primary)",
                  lineHeight: 1.65,
                  marginBottom: "20px",
                  flexGrow: 1,
                }}
              >
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Customer Info & Order Details */}
              <div
                style={{
                  paddingTop: "14px",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--accent-cocoa)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {review.name}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {review.locality}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--accent-caramel)",
                    fontWeight: 600,
                    marginTop: "6px",
                  }}
                >
                  {review.order}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
