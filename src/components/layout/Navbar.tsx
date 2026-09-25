"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingBag,
  Phone,
  MessageCircle,
  Menu,
  X,
  Cake,
  Palette,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Package,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { trackEvent } from "@/lib/analytics/events";
import { triggerHaptic } from "@/lib/utils/haptics";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";
  const { totalItems, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBadgePopping, setIsBadgePopping] = useState(false);

  // Hidden admin gesture: 5 quick taps on bakery logo opens admin login
  const logoTapCountRef = useRef(0);
  const logoTapTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoTap = () => {
    logoTapCountRef.current += 1;
    if (logoTapTimerRef.current) clearTimeout(logoTapTimerRef.current);

    if (logoTapCountRef.current >= 5) {
      logoTapCountRef.current = 0;
      triggerHaptic("success");
      router.push("/admin/login");
      return;
    }

    logoTapTimerRef.current = setTimeout(() => {
      logoTapCountRef.current = 0;
    }, 2500);
  };

  // Keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A) opens admin login
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        router.push("/admin/login");
      }
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen, router]);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [mobileMenuOpen]);

  // Spring badge pop animation when cart count increases
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

  const handleCloseMenu = () => {
    triggerHaptic("selection");
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div
        style={{
          backgroundColor: isHome ? "#140a05" : "var(--accent-cocoa)",
          borderBottom: isHome ? "1px solid rgba(255, 255, 255, 0.08)" : "none",
          color: "var(--text-inverse)",
          fontSize: "12px",
          padding: "6px 16px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: 500,
          letterSpacing: "-0.01em",
          fontFamily: "var(--font-sans)",
          width: "100%",
          maxWidth: "100vw",
          overflow: "hidden",
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

      {/* Main Fluid Island Floating Glass Navigation Bar (Seamless Overlay on Hero) */}
      <header
        style={{
          position: "sticky",
          top: "10px",
          zIndex: 50,
          maxWidth: "1120px",
          margin: isHome ? "8px auto -66px auto" : "8px auto 16px auto",
          width: "calc(100% - 24px)",
          borderRadius: "var(--radius-full)",
          backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.92)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          boxShadow: isScrolled
            ? "0 12px 32px rgba(35, 23, 17, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
            : "0 8px 28px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.95)",
          border: isScrolled
            ? "1px solid rgba(74, 46, 31, 0.12)"
            : "1px solid rgba(255, 255, 255, 0.4)",
          transition: "background-color 300ms ease, box-shadow 300ms ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "58px",
            padding: "0 16px",
          }}
          className="sm:px-6"
        >
          {/* Logo & Brand Identity */}
          <a
            href="/"
            onClick={handleLogoTap}
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
            <img
              src="https://kicheesbakeddelights.com/wp-content/uploads/2025/02/kichees-baked-delights-cakes-shop-text-logo.png"
              alt="Kichees Baked Delights"
              className="hidden md:block"
              style={{
                height: "22px",
                width: "auto",
                objectFit: "contain",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </a>

          {/* Desktop Navigation Links — Pure Customer Browsing */}
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
                width: "38px",
                height: "38px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--bg-muted)",
                color: "var(--text-primary)",
              }}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={19} />
            </button>
          </div>
        </div>
      </header>

      {/* Bespoke Boutique Mobile Navigation Full-Screen Sheet */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(18, 10, 6, 0.88)",
            backdropFilter: "blur(28px) saturate(180%)",
            WebkitBackdropFilter: "blur(28px) saturate(180%)",
            display: "flex",
            flexDirection: "column",
            animation: "mobileNavFadeIn 220ms var(--ease-apple-spring)",
          }}
        >
          {/* Mobile Sheet Inner Container */}
          <div
            className="no-scrollbar"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 20px 32px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              maxWidth: "540px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            {/* Top Sheet Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "14px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
              }}
            >
              <div
                onClick={handleLogoTap}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                }}
              >
                <img
                  src="https://kicheesbakeddelights.com/wp-content/uploads/2025/02/kichees-baked-delights-bakery-logo.png"
                  alt="Kichees Emblem"
                  style={{ width: "32px", height: "32px", objectFit: "contain" }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                      letterSpacing: "0.02em",
                    }}
                  >
                    KICHEES
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255, 255, 255, 0.6)",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        backgroundColor: "#4ADE80",
                      }}
                    />
                    <span>Nungambakkam Kitchen</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseMenu}
                className="pressable"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  cursor: "pointer",
                }}
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            {/* Featured Hero Bento Card: Complete Menu & Patisserie */}
            <a
              href="/shop"
              onClick={handleCloseMenu}
              className="pressable"
              style={{
                textDecoration: "none",
                display: "block",
                padding: "20px 22px",
                borderRadius: "22px",
                background: "linear-gradient(135deg, rgba(62, 34, 21, 0.92) 0%, rgba(35, 18, 11, 0.96) 100%)",
                border: "1px solid rgba(221, 167, 82, 0.35)",
                boxShadow: "0 12px 30px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "rgba(221, 167, 82, 0.2)",
                  color: "var(--accent-gold)",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "10px",
                  border: "1px solid rgba(221, 167, 82, 0.3)",
                }}
              >
                <Sparkles size={12} />
                <span>40+ Fresh Daily Bakes</span>
              </div>

              <div
                style={{
                  fontSize: "19px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  fontFamily: "var(--font-serif)",
                  lineHeight: 1.25,
                  letterSpacing: "-0.015em",
                  marginBottom: "6px",
                }}
              >
                Explore Full Bakery Menu
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(255, 255, 255, 0.72)",
                  lineHeight: 1.5,
                  marginBottom: "14px",
                }}
              >
                Belgian Truffles • Molten Fudge • Bagels • Tea Cakes • 100% Eggless
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--accent-gold)",
                }}
              >
                <span>Browse Menu & Order</span>
                <ArrowRight size={14} />
              </div>
            </a>

            {/* 2x2 Bento Grid: Primary Customer Destinations */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              {/* Card 1: Signature Cakes */}
              <a
                href="/#signature-cakes"
                onClick={handleCloseMenu}
                className="pressable"
                style={{
                  textDecoration: "none",
                  padding: "16px 14px",
                  borderRadius: "18px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(199, 109, 56, 0.25)",
                    color: "var(--accent-caramel)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Cake size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
                    Signature Cakes
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)", marginTop: "2px" }}>
                    Same-day delivery
                  </div>
                </div>
              </a>

              {/* Card 2: Custom Cake Studio */}
              <a
                href="/#custom-studio"
                onClick={handleCloseMenu}
                className="pressable"
                style={{
                  textDecoration: "none",
                  padding: "16px 14px",
                  borderRadius: "18px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(221, 167, 82, 0.22)",
                    color: "var(--accent-gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Palette size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
                    Custom Studio
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)", marginTop: "2px" }}>
                    Bespoke celebrations
                  </div>
                </div>
              </a>

              {/* Card 3: My Orders */}
              <a
                href="/account/orders"
                onClick={handleCloseMenu}
                className="pressable"
                style={{
                  textDecoration: "none",
                  padding: "16px 14px",
                  borderRadius: "18px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(74, 222, 128, 0.2)",
                    color: "#4ADE80",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Package size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
                    Track Orders
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)", marginTop: "2px" }}>
                    Live kitchen status
                  </div>
                </div>
              </a>

              {/* Card 4: Our Kitchen Standards */}
              <a
                href="/#bakery-story"
                onClick={handleCloseMenu}
                className="pressable"
                style={{
                  textDecoration: "none",
                  padding: "16px 14px",
                  borderRadius: "18px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    color: "#FAF7F2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
                    The Kitchen
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)", marginTop: "2px" }}>
                    100% Butter & Callebaut
                  </div>
                </div>
              </a>
            </div>

            {/* Quick Informational Links */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "4px 0",
              }}
            >
              <a
                href="/#location"
                onClick={handleCloseMenu}
                className="pressable"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "14px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <MapPin size={16} style={{ color: "var(--accent-caramel)" }} />
                  <span>Nungambakkam Counter & Map</span>
                </div>
                <ArrowRight size={14} style={{ opacity: 0.4 }} />
              </a>

              <a
                href="/#faqs"
                onClick={handleCloseMenu}
                className="pressable"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "14px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <HelpCircle size={16} style={{ color: "var(--accent-gold)" }} />
                  <span>Delivery Zones & Order FAQs</span>
                </div>
                <ArrowRight size={14} style={{ opacity: 0.4 }} />
              </a>
            </div>

            {/* Bottom Direct Bakery Contact Tray */}
            <div
              style={{
                marginTop: "auto",
                paddingTop: "14px",
                borderTop: "1px solid rgba(255, 255, 255, 0.12)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                {/* Direct WhatsApp Button */}
                <a
                  href={`https://wa.me/${BUSINESS_CONFIG.whatsapp.replace("+", "")}?text=${encodeURIComponent("Hi Kichees! I'd like to ask about placing a cake order.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    handleWhatsAppClick();
                    handleCloseMenu();
                  }}
                  className="pressable"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 16px",
                    borderRadius: "9999px",
                    backgroundColor: "rgba(37, 211, 102, 0.18)",
                    border: "1px solid rgba(37, 211, 102, 0.35)",
                    color: "#4ADE80",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp Us</span>
                </a>

                {/* Direct Counter Phone Button */}
                <a
                  href={`tel:${BUSINESS_CONFIG.phone}`}
                  onClick={() => {
                    handlePhoneClick();
                    handleCloseMenu();
                  }}
                  className="pressable"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 16px",
                    borderRadius: "9999px",
                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                    color: "#FFFFFF",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  <Phone size={15} />
                  <span>Call Counter</span>
                </a>
              </div>

              {/* Hours Pill */}
              <div
                style={{
                  textAlign: "center",
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.55)",
                  padding: "4px 0",
                }}
              >
                142 Nungambakkam High Rd • Open Daily 9:00 AM – 10:30 PM
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes mobileNavFadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
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
