"use client";

import React, { useEffect, useRef, useState } from "react";

const TAGLINE_WORDS = [
  "Slow",
  "baked",
  "every",
  "morning",
  "in",
  "Nungambakkam.",
  "Real",
  "Belgian",
  "Callebaut",
  "chocolate,",
  "pure",
  "farm",
  "butter,",
  "and",
  "zero",
  "artificial",
  "extracts.",
];

export default function TaglineReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = container.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // Trigger when container enters the middle portion of the viewport
          const progress = Math.min(
            1,
            Math.max(0, (windowHeight * 0.8 - rect.top) / (windowHeight * 0.6))
          );

          const wordCount = TAGLINE_WORDS.length;
          const targetIndex = Math.floor(progress * wordCount);
          setActiveWordIndex(targetIndex);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      style={{
        backgroundColor: "var(--bg-primary)",
        paddingTop: "88px",
        paddingBottom: "88px",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="container" style={{ maxWidth: "880px", margin: "0 auto", textAlign: "center" }}>
        {/* Micro Category Pill */}
        <div
          style={{
            display: "inline-block",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--accent-caramel)",
            marginBottom: "24px",
          }}
        >
          The Kitchen Standard
        </div>

        {/* Dynamic Kinetic Tagline Reveal (Landing Page Skill B11) */}
        <h2
          className="font-serif"
          style={{
            fontSize: "clamp(28px, 4.2vw, 48px)",
            lineHeight: 1.25,
            letterSpacing: "-0.025em",
            color: "var(--accent-cocoa)",
            textWrap: "balance",
            margin: "0 auto",
          }}
        >
          {TAGLINE_WORDS.map((word, idx) => {
            const isRevealed = idx <= activeWordIndex;
            return (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  marginRight: "0.26em",
                  color: isRevealed ? "var(--accent-cocoa)" : "rgba(74, 46, 31, 0.28)",
                  transform: isRevealed ? "translateY(0)" : "translateY(4px)",
                  transition:
                    "color 400ms cubic-bezier(0.32, 0.72, 0, 1), transform 400ms cubic-bezier(0.32, 0.72, 0, 1)",
                }}
              >
                {word}
              </span>
            );
          })}
        </h2>

        <p
          style={{
            marginTop: "24px",
            fontSize: "15px",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
            textWrap: "pretty",
          }}
        >
          Every gateau and pastry batch is prepared by hand in our open Nungambakkam kitchen.
          Orders leave our oven straight to your table in chilled temperature safe packaging.
        </p>
      </div>
    </section>
  );
}
