"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/ui/Toast";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { FileText, Phone, Mail } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <ToastProvider>
      <CartProvider>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-primary, #FAF7F2)" }}>
          <Navbar />

          <main id="main-content" style={{ flex: 1, padding: "64px 24px 96px" }}>
            <div style={{ maxWidth: "840px", margin: "0 auto", backgroundColor: "#fff", borderRadius: "28px", padding: "48px 36px", border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))", boxShadow: "0 4px 20px rgba(35, 23, 17, 0.04)" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent-caramel, #C76D38)", marginBottom: "8px" }}>
                <FileText size={14} />
                <span>Customer Agreement</span>
              </div>

              <h1 style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)", fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 600, color: "var(--text-primary, #1F1714)", margin: "0 0 12px 0" }}>
                Terms of Service
              </h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted, #9A897F)", marginBottom: "32px" }}>
                Effective Date: September 2026 • Kichees Baked Delights
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontSize: "14.5px", lineHeight: 1.7, color: "var(--text-secondary, #6B5B53)" }}>
                <section>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary, #1F1714)", marginBottom: "8px" }}>
                    1. Ordering & Fresh Baking Lead Times
                  </h2>
                  <p>
                    Because all Kichees gateaux and celebration cakes are handcrafted from scratch using pure dairy butter and Belgian chocolate, standard daily cakes require at least 2 hours advance notice, while bespoke multi-tiered custom cakes require 24 to 48 hours notice.
                  </p>
                </section>

                <section>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary, #1F1714)", marginBottom: "8px" }}>
                    2. Pricing & No Hidden Fees
                  </h2>
                  <p>
                    All listed prices in our bakery menu are transparent. Applicable delivery fees based on distance from our Casablanca Studio, Nungambakkam kitchen are clearly displayed in your bag before final confirmation.
                  </p>
                </section>

                <section>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary, #1F1714)", marginBottom: "8px" }}>
                    3. Delivery & Handover
                  </h2>
                  <p>
                    Our delivery partners are instructed to transport delicate celebration cakes upright in air-conditioned vehicles or temperature-insulated carriers. Customers must ensure an authorized recipient is available at the provided delivery address.
                  </p>
                </section>

                <section>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary, #1F1714)", marginBottom: "8px" }}>
                    4. Dietary & Allergen Advisory
                  </h2>
                  <p>
                    We operate a dedicated 100% Eggless baking counter with separate preparation tools. However, our bakery handles wheat gluten, dairy butter, tree nuts (almonds, pistachios, walnuts), and chocolate. If you have severe anaphylactic allergies, please alert our kitchen desk before ordering.
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
