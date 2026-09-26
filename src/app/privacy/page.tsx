"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/ui/Toast";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <ToastProvider>
      <CartProvider>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-primary, #FAF7F2)" }}>
          <Navbar />

          <main id="main-content" style={{ flex: 1, padding: "64px 24px 96px" }}>
            <div style={{ maxWidth: "840px", margin: "0 auto", backgroundColor: "#fff", borderRadius: "28px", padding: "48px 36px", border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))", boxShadow: "0 4px 20px rgba(35, 23, 17, 0.04)" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent-caramel, #C76D38)", marginBottom: "8px" }}>
                <ShieldCheck size={14} />
                <span>Legal & Trust</span>
              </div>

              <h1 style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)", fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 600, color: "var(--text-primary, #1F1714)", margin: "0 0 12px 0" }}>
                Privacy Policy
              </h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted, #9A897F)", marginBottom: "32px" }}>
                Last updated: September 2026 • Kichees Baked Delights, Chennai
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontSize: "14.5px", lineHeight: 1.7, color: "var(--text-secondary, #6B5B53)" }}>
                <section>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary, #1F1714)", marginBottom: "8px" }}>
                    1. Information We Collect
                  </h2>
                  <p>
                    When you place an order with Kichees Baked Delights (online or via WhatsApp), we collect only the necessary details required to bake, package, and deliver your cakes safely:
                  </p>
                  <ul style={{ paddingLeft: "20px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <li><strong>Contact details:</strong> Name, phone number, and email address for order confirmation, OTP validation, and receipt delivery.</li>
                    <li><strong>Delivery information:</strong> Street address, landmark, pin code, and delivery date/time slot for our dispatch team.</li>
                    <li><strong>Customization preferences:</strong> Cake messages, flavour selections, and dietary requirements (e.g., 100% Eggless, nut allergies).</li>
                  </ul>
                </section>

                <section>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary, #1F1714)", marginBottom: "8px" }}>
                    2. Payment Security
                  </h2>
                  <p>
                    We do not store or process debit/credit card numbers or UPI PINs on our servers. All digital payments are processed through RBI-authorized payment gateways and secure UPI QR dynamic rails.
                  </p>
                </section>

                <section>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary, #1F1714)", marginBottom: "8px" }}>
                    3. How We Use Your Data
                  </h2>
                  <p>
                    Your information is exclusively used for baking execution, dispatch routing, customer service updates, and occasional member invitations if you have subscribed to the Kichees Celebration Club. We do not sell or lease your personal data to third parties.
                  </p>
                </section>

                <section>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary, #1F1714)", marginBottom: "8px" }}>
                    4. Contact Our Privacy Officer
                  </h2>
                  <p>
                    For data access, corrections, or deletion requests, reach out to our Chennai bakery headquarters:
                  </p>
                  <div style={{ marginTop: "12px", padding: "16px", borderRadius: "16px", backgroundColor: "var(--bg-primary, #FAF7F2)", border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13.5px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin size={16} className="text-amber-800" />
                      <span>{BUSINESS_CONFIG.address.full}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Phone size={16} className="text-amber-800" />
                      <a href={`tel:${BUSINESS_CONFIG.phone}`} className="underline text-stone-900 font-semibold">{BUSINESS_CONFIG.phoneDisplay}</a>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Mail size={16} className="text-amber-800" />
                      <a href={`mailto:${BUSINESS_CONFIG.email}`} className="underline text-stone-900 font-semibold">{BUSINESS_CONFIG.email}</a>
                    </div>
                  </div>
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
