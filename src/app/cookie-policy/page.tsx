"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/ui/Toast";
import { Cookie } from "lucide-react";

export default function CookiePolicyPage() {
  return (
    <ToastProvider>
      <CartProvider>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-primary, #FAF7F2)" }}>
          <Navbar />

          <main id="main-content" style={{ flex: 1, padding: "64px 24px 96px" }}>
            <div style={{ maxWidth: "840px", margin: "0 auto", backgroundColor: "#fff", borderRadius: "28px", padding: "48px 36px", border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))", boxShadow: "0 4px 20px rgba(35, 23, 17, 0.04)" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent-caramel, #C76D38)", marginBottom: "8px" }}>
                <Cookie size={14} />
                <span>Cookies & Storage</span>
              </div>

              <h1 style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)", fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 600, color: "var(--text-primary, #1F1714)", margin: "0 0 12px 0" }}>
                Cookie Policy
              </h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted, #9A897F)", marginBottom: "32px" }}>
                Updated September 2026 • Kichees Baked Delights
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontSize: "14.5px", lineHeight: 1.7, color: "var(--text-secondary, #6B5B53)" }}>
                <section>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary, #1F1714)", marginBottom: "8px" }}>
                    1. What Cookies We Use
                  </h2>
                  <p>
                    Kichees Baked Delights uses minimalist, privacy-respecting client cookies and local storage tokens:
                  </p>
                  <ul style={{ paddingLeft: "20px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <li><strong>Essential Cookies:</strong> Stores items in your shopping bag and preserves checkout details during your visit.</li>
                    <li><strong>Preference Cookies:</strong> Remembers your light/dark mode selection and cookie consent status.</li>
                    <li><strong>Anonymous Attribution:</strong> Records incoming campaign UTM tags so our bakery team knows which seasonal announcement brought you here.</li>
                  </ul>
                </section>

                <section>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary, #1F1714)", marginBottom: "8px" }}>
                    2. Managing Your Preferences
                  </h2>
                  <p>
                    You can clear cookies at any time via your browser settings or click &quot;Essential Only&quot; in our cookie consent banner. Disabling essential cookies may prevent items from staying in your shopping cart.
                  </p>
                </section>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}
