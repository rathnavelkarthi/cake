"use client";

import React, { useState, useEffect } from "react";
import { ShoppingBag, Phone, MessageCircle, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { trackEvent } from "@/lib/analytics/events";
import { triggerHaptic } from "@/lib/utils/haptics";

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBadgePopping, setIsBadgePopping] = useState(false);

  // Trigger spring badge pop animation when cart count increases
  useEffect(() => {
    if (totalItems > 0) {
      setIsBadgePopping(true);
      const timer = setTimeout(() => setIsBadgePopping(false), 240);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleWhatsAppClick = () => {
    trackEvent({ name: "click_whatsapp", source: "navbar" });
  };

  const handlePhoneClick = () => {
    trackEvent({ name: "click_phone", source: "navbar" });
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div
        style={{
          backgroundColor: "var(--accent-cocoa)",
          color: "var(--text-inverse)",
          fontSize: "12px",
          padding: "6px 16px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: 500,
          letterSpacing: "-0.01em",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "nowrap", overflow: "hidden", maxWidth: "100%" }}>
          <span
            style={{
              display: "inline-block",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#4ADE80",
              boxShadow: "0 0 6px #4ADE80",
              flexShrink: 0,
            }}
          />
          <span style={{ whiteSpace: "nowrap" }}>Baking fresh daily in {BUSINESS_CONFIG.address.locality}</span>
          <span style={{ opacity: 0.4 }} className="hidden sm:inline">•</span>
          <span className="hidden sm:inline" style={{ whiteSpace: "nowrap" }}>Open 9:00 AM to 10:30 PM</span>
          <span style={{ opacity: 0.4 }} className="hidden sm:inline">•</span>
          <a
            href={`tel:${BUSINESS_CONFIG.phone}`}
            onClick={handlePhoneClick}
            className="hidden sm:inline"
            style={{ color: "var(--accent-gold)", textDecoration: "none", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {BUSINESS_CONFIG.phoneDisplay}
          </a>
        </div>
      </div>

      {/* Main Fluid Island Floating Glass Navigation Bar (Landing Page Skill B7 & Apple Design) */}
      <header
        style={{
          position: "sticky",
          top: "14px",
          zIndex: 40,
          maxWidth: "1120px",
          margin: "10px auto 0 auto",
          width: "calc(100% - 24px)",
          borderRadius: mobileMenuOpen ? "24px" : "var(--radius-full)",
          backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.90)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          boxShadow: isScrolled
            ? "0 12px 32px rgba(35, 23, 17, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
            : "0 4px 20px rgba(35, 23, 17, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
          border: "1px solid rgba(74, 46, 31, 0.12)",
          transition: "border-radius 300ms cubic-bezier(0.32, 0.72, 0, 1), background-color 300ms ease, box-shadow 300ms ease",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "60px",
            padding: "0 16px",
          }}
          className="sm:px-6"
        >
          {/* Logo & Brand Identity */}
          <a
            href="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <img
              src="https://kicheesbakeddelights.com/wp-content/uploads/2025/02/kichees-baked-delights-bakery-logo.png"
              alt="Kichees Bakery Emblem"
              style={{
                height: "36px",
                width: "auto",
                objectFit: "contain",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            {/* Hidden on mobile to prevent overlapping, visible on md+ */}
            <img
              src="https://kicheesbakeddelights.com/wp-content/uploads/2025/02/kichees-baked-delights-cakes-shop-text-logo.png"
              alt="Kichees Baked Delights"
              className="hidden md:block"
              style={{
                height: "24px",
                width: "auto",
                objectFit: "contain",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: "none",
              alignItems: "center",
              gap: "24px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, sans-serif",
            }}
            className="desktop-nav"
          >
            <a href="/shop" style={{ ...navLinkStyle, color: "var(--accent-cocoa)", fontWeight: 600 }}>Shop All</a>
            <a href="/#signature-cakes" style={navLinkStyle}>Signature Cakes</a>
            <a href="/#custom-studio" style={navLinkStyle}>Custom Studio</a>
            <a href="/account/orders" style={navLinkStyle}>My Orders</a>
            <a href="/#bakery-story" style={navLinkStyle}>Our Kitchen</a>
            <a href="/#location" style={navLinkStyle}>Nungambakkam</a>
            <a href="/admin/kitchen" style={{ ...navLinkStyle, color: "var(--accent-caramel)", fontWeight: 600 }}>Kitchen KDS</a>
          </nav>

          {/* Right Direct Conversion Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="sm:gap-3">
            {/* Direct WhatsApp Callout */}
            <a
              href={`https://wa.me/${BUSINESS_CONFIG.whatsapp.replace("+", "")}?text=${encodeURIComponent("Hi Kichees! I'd like to enquire about ordering a cake.")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="pressable flex items-center justify-center rounded-full"
              title="Chat on WhatsApp"
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: "rgba(37, 211, 102, 0.14)",
                color: "#166534",
                textDecoration: "none",
                transition: "all 140ms var(--ease-out)",
              }}
            >
              <MessageCircle size={17} style={{ color: "#16A34A" }} />
            </a>

            {/* Quick Call - Hidden on very small mobile */}
            <a
              href={`tel:${BUSINESS_CONFIG.phone}`}
              onClick={handlePhoneClick}
              className="pressable hidden sm:inline-flex items-center justify-center"
              title="Call Bakery Counter"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "var(--bg-muted)",
                color: "var(--accent-cocoa)",
                textDecoration: "none",
                transition: "all 140ms var(--ease-out)",
              }}
            >
              <Phone size={15} />
            </a>

            {/* Demo Candidate Roles Shortcut */}
            <a
              href="/admin/login"
              className="pressable hidden md:inline-flex items-center gap-1"
              style={{
                backgroundColor: "var(--accent-caramel-subtle)",
                color: "var(--accent-cocoa)",
                padding: "7px 12px",
                borderRadius: "var(--radius-full)",
                fontSize: "12px",
                fontWeight: 700,
                textDecoration: "none",
                border: "1px solid rgba(199, 109, 56, 0.25)",
              }}
              title="Candidate Logins: Selva, Anbu, Sara, Admin, Customer"
            >
              <span>⚡ Candidate Logins</span>
            </a>

            {/* Cart Trigger with Dynamic Pop Badge */}
            <button
              onClick={() => {
                triggerHaptic("selection");
                setIsCartOpen(true);
              }}
              className="pressable flex items-center gap-1.5"
              style={{
                backgroundColor: "var(--accent-cocoa)",
                color: "#FFFFFF",
                padding: "8px 14px",
                borderRadius: "var(--radius-full)",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, sans-serif",
                boxShadow: "0 2px 8px rgba(58, 32, 22, 0.16)",
              }}
              aria-label={`View Cart, ${totalItems} items`}
            >
              <ShoppingBag size={15} />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span
                  className={isBadgePopping ? "badge-pop" : ""}
                  style={{
                    backgroundColor: "var(--accent-caramel)",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: 800,
                    borderRadius: "10px",
                    padding: "0 6px",
                    lineHeight: "16px",
                    minWidth: "16px",
                    textAlign: "center",
                  }}
                >
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => {
                triggerHaptic("selection");
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="pressable mobile-toggle lg:hidden flex items-center justify-center"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
              }}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide Navigation */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: "16px 24px 24px",
              backgroundColor: "var(--bg-surface)",
              borderBottom: "1px solid var(--border-medium)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <a
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              style={{ ...mobileNavLinkStyle, color: "var(--accent-cocoa)", fontWeight: 700 }}
            >
              🎂 Shop All Bakes & Menu
            </a>
            <a
              href="/#signature-cakes"
              onClick={() => setMobileMenuOpen(false)}
              style={mobileNavLinkStyle}
            >
              Signature Cakes & Bakes
            </a>
            <a
              href="/#custom-studio"
              onClick={() => setMobileMenuOpen(false)}
              style={mobileNavLinkStyle}
            >
              Custom Cake Studio
            </a>
            <a
              href="/account/orders"
              onClick={() => setMobileMenuOpen(false)}
              style={{ ...mobileNavLinkStyle, color: "var(--accent-cocoa)", fontWeight: 700 }}
            >
              🛍️ My Orders & Cake Tracker
            </a>
            <a
              href="/admin/kitchen"
              onClick={() => setMobileMenuOpen(false)}
              style={{ ...mobileNavLinkStyle, color: "var(--accent-caramel)", fontWeight: 700 }}
            >
              👨‍🍳 Kitchen KDS (Selva & Anbu)
            </a>
            <a
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              style={{ ...mobileNavLinkStyle, color: "#92400E", fontWeight: 700 }}
            >
              ⚡ Candidate Demo Logins (Selva / Anbu / Sara / Admin)
            </a>
            <a
              href="#bakery-story"
              onClick={() => setMobileMenuOpen(false)}
              style={mobileNavLinkStyle}
            >
              Our Kitchen Standards
            </a>
            <a
              href="#location"
              onClick={() => setMobileMenuOpen(false)}
              style={mobileNavLinkStyle}
            >
              Nungambakkam Counter & Map
            </a>
            <a
              href="#faqs"
              onClick={() => setMobileMenuOpen(false)}
              style={mobileNavLinkStyle}
            >
              Delivery & FAQs
            </a>
          </div>
        )}
      </header>

      <style jsx>{`
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .hide-mobile {
            display: none;
          }
        }
      `}</style>
    </>
  );
}

const navLinkStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: 500,
  transition: "color 150ms var(--ease-out)",
};

const mobileNavLinkStyle: React.CSSProperties = {
  color: "var(--text-primary)",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: 600,
  padding: "8px 0",
};
