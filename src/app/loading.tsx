"use client";

import React from "react";
import { Cake } from "lucide-react";

export default function Loading() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        gap: "16px",
      }}
      aria-live="polite"
      aria-busy="true"
    >
      <div
        style={{
          position: "relative",
          width: "64px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Pulsing Outer Ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid var(--accent-caramel, #C76D38)",
            opacity: 0.25,
            animation: "pulseRing 1.5s cubic-bezier(0.16, 1, 0.3, 1) infinite",
          }}
        />
        {/* Rotating Progress Arc */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid transparent",
            borderTopColor: "var(--accent-caramel, #C76D38)",
            animation: "spinArc 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite",
          }}
        />
        {/* Bakery Cake Icon */}
        <Cake
          size={28}
          style={{
            color: "var(--accent-caramel, #C76D38)",
            animation: "bounceSubtle 1.2s ease-in-out infinite",
          }}
        />
      </div>

      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-serif, Georgia, serif)",
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--accent-cocoa, #3A2016)",
            margin: 0,
          }}
        >
          Preparing Fresh Bakes...
        </p>
        <p
          style={{
            fontSize: "12px",
            color: "var(--text-muted, #9A897F)",
            marginTop: "4px",
            margin: 0,
          }}
        >
          Kichees Kitchen • Handcrafted in Nungambakkam
        </p>
      </div>

      <style jsx>{`
        @keyframes spinArc {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes pulseRing {
          0% {
            transform: scale(0.85);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.15;
          }
          100% {
            transform: scale(0.85);
            opacity: 0.6;
          }
        }
        @keyframes bounceSubtle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
      `}</style>
    </div>
  );
}
