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
          padding: "8px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 500,
          letterSpacing: "0.02em",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
          <span
            style={{
              display: "inline-block",
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: "#4ADE80",
              boxShadow: "0 0 6px #4ADE80",
            }}
          />
          <span>Baking fresh daily in {BUSINESS_CONFIG.address.locality}</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span>Open 9:00 AM – 10:30 PM</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <a
            href={`tel:${BUSINESS_CONFIG.phone}`}
            onClick={handlePhoneClick}
            style={{ color: "var(--accent-gold)", textDecoration: "none", fontWeight: 600 }}
          >
            {BUSINESS_CONFIG.phoneDisplay}
          </a>
        </div>
      </div>

      {/* Main Sticky Navigation Bar */}
      <header
        className={isScrolled ? "glass-nav" : ""}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          transition: "background-color 200ms var(--ease-apple-spring), border-color 200ms var(--ease-apple-spring), box-shadow 200ms var(--ease-apple-spring)",
          borderBottom: isScrolled ? "1px solid var(--border-subtle)" : "1px solid transparent",
          backgroundColor: isScrolled ? "var(--material-thick)" : "var(--bg-primary)",
          backdropFilter: isScrolled ? "var(--material-blur)" : "none",
          WebkitBackdropFilter: isScrolled ? "var(--material-blur)" : "none",
          boxShadow: isScrolled ? "0 1px 0 rgba(255, 255, 255, 0.6) inset, 0 4px 16px rgba(35, 23, 17, 0.04)" : "none",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "72px",
          }}
        >
          {/* Logo & Brand Identity */}
          <a
            href="#"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "baseline",
              gap: "8px",
            }}
          >
            <span
              className="font-serif"
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "var(--accent-cocoa)",
                letterSpacing: "-0.02em",
              }}
            >
              KICHEES
            </span>
            <span
              style={{
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: "var(--accent-caramel)",
              }}
            >
              Baked Delights
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: "none",
              alignItems: "center",
              gap: "28px",
            }}
            className="desktop-nav"
          >
            <a href="#signature-cakes" style={navLinkStyle}>Signature Cakes</a>
            <a href="#custom-studio" style={navLinkStyle}>Custom Cakes</a>
            <a href="#bakery-story" style={navLinkStyle}>Our Kitchen</a>
            <a href="#location" style={navLinkStyle}>Nungambakkam Counter</a>
            <a href="#faqs" style={navLinkStyle}>FAQs</a>
          </nav>

          {/* Right Direct Conversion Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Direct WhatsApp Callout */}
            <a
              href={`https://wa.me/${BUSINESS_CONFIG.whatsapp.replace("+", "")}?text=${encodeURIComponent("Hi Kichees! I'd like to enquire about ordering a cake.")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="pressable"
              title="Chat on WhatsApp"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "rgba(37, 211, 102, 0.12)",
                color: "#166534",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "background-color 160ms var(--ease-out)",
              }}
            >
              <MessageCircle size={15} style={{ color: "#16A34A" }} />
              <span className="hide-mobile">WhatsApp</span>
            </a>

            {/* Quick Call */}
            <a
              href={`tel:${BUSINESS_CONFIG.phone}`}
              onClick={handlePhoneClick}
              className="pressable"
              title="Call Bakery Counter"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                backgroundColor: "var(--bg-muted)",
                color: "var(--accent-cocoa)",
                textDecoration: "none",
                transition: "background-color 160ms var(--ease-out), transform 140ms var(--ease-out)",
              }}
            >
              <Phone size={16} />
            </a>

            {/* Cart Trigger with Dynamic Pop Badge */}
            <button
              onClick={() => {
                triggerHaptic("selection");
                setIsCartOpen(true);
              }}
              className="pressable"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "var(--accent-cocoa)",
                color: "#FFFFFF",
                padding: "9px 16px",
                borderRadius: "var(--radius-full)",
                fontSize: "14px",
                fontWeight: 600,
                boxShadow: "0 2px 8px rgba(58, 32, 22, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.18)",
              }}
              aria-label={`View Cart, ${totalItems} items`}
            >
              <ShoppingBag size={16} />
              <span className="hide-mobile">Cart</span>
              {totalItems > 0 && (
                <span
                  className={isBadgePopping ? "badge-pop" : ""}
                  style={{
                    backgroundColor: "var(--accent-caramel)",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: 800,
                    borderRadius: "10px",
                    padding: "1px 7px",
                    lineHeight: "16px",
                    minWidth: "18px",
                    textAlign: "center",
                    display: "inline-block",
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
              className="pressable mobile-toggle"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
              }}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
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
              href="#signature-cakes"
              onClick={() => setMobileMenuOpen(false)}
              style={mobileNavLinkStyle}
            >
              Signature Cakes & Bakes
            </a>
            <a
              href="#custom-studio"
              onClick={() => setMobileMenuOpen(false)}
              style={mobileNavLinkStyle}
            >
              Custom Cake Studio
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
