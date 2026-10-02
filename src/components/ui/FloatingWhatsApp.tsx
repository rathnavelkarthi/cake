"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone, X } from "lucide-react";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { triggerHaptic } from "@/lib/utils/haptics";

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Never render customer order support floating button on admin dashboard routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const whatsappUrl = `https://wa.me/${BUSINESS_CONFIG.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Hi Kichees Baked Delights! I'd like to check today's fresh bakes and order availability."
  )}`;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "16px",
        zIndex: 900,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "10px",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      {/* Expanded Quick Contact Card */}
      {isOpen && (
        <div
          style={{
            backgroundColor: "var(--bg-surface, #FFFFFF)",
            borderRadius: "20px",
            padding: "16px 18px",
            boxShadow: "0 12px 36px rgba(35, 23, 17, 0.16)",
            border: "1px solid var(--border-medium, rgba(74, 46, 31, 0.14))",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "250px",
          }}
          className="animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary, #1F1714)" }}>
              Direct Bakery Help
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted, #9A897F)",
                padding: "2px",
              }}
              aria-label="Close contact card"
            >
              <X size={15} />
            </button>
          </div>

          <p style={{ margin: 0, fontSize: "11.5px", color: "var(--text-secondary, #6B5B53)", lineHeight: 1.4 }}>
            Chat with our Chennai baking desk for custom requests or quick delivery status.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => triggerHaptic("selection")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#25D366",
              color: "#FFFFFF",
              padding: "10px 14px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              justifyContent: "center",
            }}
          >
            <MessageCircle size={16} />
            <span>Chat on WhatsApp</span>
          </a>

          <a
            href={`tel:${BUSINESS_CONFIG.phone}`}
            onClick={() => triggerHaptic("selection")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "var(--bg-primary, #FAF7F2)",
              color: "var(--accent-cocoa, #3A2016)",
              padding: "8px 14px",
              borderRadius: "12px",
              fontSize: "12.5px",
              fontWeight: 600,
              textDecoration: "none",
              justifyContent: "center",
              border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.1))",
            }}
          >
            <Phone size={14} />
            <span>Call {BUSINESS_CONFIG.phoneDisplay}</span>
          </a>
        </div>
      )}

      {/* Main Trigger Pill / Button */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic("selection");
          setIsOpen(!isOpen);
        }}
        aria-label="Contact bakery via WhatsApp or Phone"
        style={{
          height: "48px",
          borderRadius: "999px",
          backgroundColor: "#25D366",
          color: "#FFFFFF",
          border: "none",
          boxShadow: "0 4px 16px rgba(37, 211, 102, 0.35), 0 2px 6px rgba(0, 0, 0, 0.08)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "0 16px",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "14px",
          whiteSpace: "nowrap",
          transition: "all 200ms cubic-bezier(0.16, 1, 0.3, 1)",
          minWidth: "48px",
        }}
        className="hover:scale-105 active:scale-95 hover:brightness-110 sm:pr-5"
      >
        <MessageCircle size={20} />
        <span className="hidden sm:inline">Order Support</span>
      </button>
    </div>
  );
}
