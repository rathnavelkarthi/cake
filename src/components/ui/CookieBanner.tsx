"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { triggerHaptic } from "@/lib/utils/haptics";

const COOKIE_CONSENT_KEY = "kichees_cookie_consent";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        // Show after brief delay
        const timer = setTimeout(() => setShowBanner(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // In case localStorage is blocked
    }
  }, []);

  const handleConsent = (level: "all" | "essential") => {
    triggerHaptic("selection");
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, level);
    } catch {
      // ignore
    }
    setShowBanner(false);
  };

  if (pathname?.startsWith("/admin") || !showBanner) return null;

  return (
    <div
      id="cookie-consent-banner"
      role="region"
      aria-label="Cookie consent banner"
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        zIndex: 9998,
        maxWidth: "460px",
        width: "calc(100vw - 40px)",
        backgroundColor: "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(16px)",
        borderRadius: "20px",
        padding: "20px 22px",
        boxShadow: "0 16px 40px rgba(35, 23, 17, 0.16)",
        border: "1px solid var(--border-medium, rgba(74, 46, 31, 0.15))",
      }}
      className="animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            backgroundColor: "var(--accent-caramel-subtle, #FBEFE7)",
            color: "var(--accent-caramel, #C76D38)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Cookie size={18} />
        </div>

        <div style={{ flex: 1 }}>
          <h4
            style={{
              margin: "0 0 6px 0",
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--text-primary, #1F1714)",
            }}
          >
            We Value Your Privacy & Sweet Experience
          </h4>
          <p
            style={{
              margin: "0 0 14px 0",
              fontSize: "12px",
              lineHeight: 1.5,
              color: "var(--text-secondary, #6B5B53)",
            }}
          >
            We use essential cookies to keep your shopping cart intact and provide secure order checkout. Learn more in our{" "}
            <Link href="/cookie-policy" className="underline font-semibold text-amber-900">
              Cookie Policy
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline font-semibold text-amber-900">
              Privacy Policy
            </Link>
            .
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => handleConsent("all")}
              style={{
                backgroundColor: "var(--accent-cocoa, #3A2016)",
                color: "#FAF7F2",
                border: "none",
                borderRadius: "999px",
                padding: "8px 16px",
                fontSize: "12.5px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 140ms ease",
              }}
              className="hover:bg-stone-900 active:scale-95"
            >
              Accept All
            </button>

            <button
              type="button"
              onClick={() => handleConsent("essential")}
              style={{
                backgroundColor: "transparent",
                color: "var(--text-secondary, #6B5B53)",
                border: "1px solid var(--border-medium, rgba(74, 46, 31, 0.2))",
                borderRadius: "999px",
                padding: "7px 14px",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 140ms ease",
              }}
              className="hover:bg-stone-100 active:scale-95"
            >
              Essential Only
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleConsent("essential")}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted, #9A897F)",
            cursor: "pointer",
            padding: "2px",
          }}
          aria-label="Dismiss cookie notice"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
