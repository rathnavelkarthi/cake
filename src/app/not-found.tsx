"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, ShoppingBag } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/ui/Toast";

export default function NotFound() {
  return (
    <ToastProvider>
      <CartProvider>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-primary, #FAF7F2)" }}>
          <Navbar />

          <main
            id="main-content"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ maxWidth: "560px", margin: "0 auto" }}>
              <div
                style={{
                  fontSize: "64px",
                  marginBottom: "16px",
                  filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.1))",
                }}
              >
                🎂
              </div>

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
                Error 404 • Page Not Found
              </span>

              <h1
                style={{
                  fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
                  fontSize: "clamp(36px, 4.5vw, 52px)",
                  fontWeight: 600,
                  color: "var(--text-primary, #1F1714)",
                  margin: "0 0 16px 0",
                  lineHeight: 1.1,
                }}
              >
                Lost in the Bakery Pantry?
              </h1>

              <p
                style={{
                  fontSize: "16px",
                  lineHeight: 1.6,
                  color: "var(--text-secondary, #6B5B53)",
                  margin: "0 0 32px 0",
                }}
              >
                The page or cake you are looking for might have been moved or enjoyed fresh this morning. Let us get you back to the oven.
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "14px",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  href="/"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "var(--accent-cocoa, #3A2016)",
                    color: "#FAF7F2",
                    padding: "14px 28px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                  className="hover:scale-105 active:scale-95"
                >
                  <Home size={16} />
                  <span>Return Home</span>
                </Link>

                <Link
                  href="/shop"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "var(--bg-surface, #FFFFFF)",
                    color: "var(--text-primary, #1F1714)",
                    border: "1.5px solid var(--border-medium, rgba(74, 46, 31, 0.18))",
                    padding: "13px 26px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                  className="hover:bg-amber-50 active:scale-95"
                >
                  <ShoppingBag size={16} />
                  <span>Browse Bakery Menu</span>
                </Link>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}
