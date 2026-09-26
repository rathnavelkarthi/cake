"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/ui/Toast";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { RotateCcw, AlertTriangle, Phone, Mail } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <ToastProvider>
      <CartProvider>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-primary, #FAF7F2)" }}>
          <Navbar />

          <main id="main-content" style={{ flex: 1, padding: "64px 24px 96px" }}>
            <div style={{ maxWidth: "840px", margin: "0 auto", backgroundColor: "#fff", borderRadius: "28px", padding: "48px 36px", border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))", boxShadow: "0 4px 20px rgba(35, 23, 17, 0.04)" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent-caramel, #C76D38)", marginBottom: "8px" }}>
                <RotateCcw size={14} />
                <span>Customer Care</span>
              </div>

              <h1 style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)", fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 600, color: "var(--text-primary, #1F1714)", margin: "0 0 12px 0" }}>
                Refund & Cancellation Policy
              </h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted, #9A897F)", marginBottom: "32px" }}>
                Updated September 2026 • Kichees Baked Delights
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontSize: "14.5px", lineHeight: 1.7, color: "var(--text-secondary, #6B5B53)" }}>
                <section>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary, #1F1714)", marginBottom: "8px" }}>
                    1. Perishable Food Items
                  </h2>
                  <p>
                    Because fresh cakes, patisserie, and bagels are freshly baked consumable items prepared for your specific timeslot, we cannot accept returns once an order has been baked or dispatched from our kitchen.
                  </p>
                </section>

                <section>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary, #1F1714)", marginBottom: "8px" }}>
                    2. Order Cancellations
                  </h2>
                  <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <li><strong>Standard daily cakes & brownies:</strong> Cancellations permitted up to 4 hours before the scheduled dispatch window for a 100% refund or bakery credit voucher.</li>
                    <li><strong>Custom celebratory cakes:</strong> Cancellations accepted up to 24 hours prior to delivery, as specialty ingredients and custom sugar work are prepared in advance.</li>
                  </ul>
                </section>

                <section>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary, #1F1714)", marginBottom: "8px" }}>
                    3. Transit Damage or Kitchen Discrepancies
                  </h2>
                  <p>
                    In the rare event that your cake arrives structurally compromised during transit or an incorrect item was dispatched, please notify our team within 60 minutes of handover with a quick photo via WhatsApp ({BUSINESS_CONFIG.whatsappDisplay}). We will promptly send an emergency replacement or issue an immediate refund.
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
