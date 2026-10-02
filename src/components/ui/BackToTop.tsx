"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { triggerHaptic } from "@/lib/utils/haptics";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 350);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    triggerHaptic("selection");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (pathname?.startsWith("/admin") || !isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top of page"
      style={{
        position: "fixed",
        bottom: "84px",
        right: "24px",
        zIndex: 900,
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        backgroundColor: "var(--bg-surface, #FFFFFF)",
        color: "var(--accent-cocoa, #3A2016)",
        border: "1.5px solid var(--border-medium, rgba(74, 46, 31, 0.16))",
        boxShadow: "0 6px 20px rgba(35, 23, 17, 0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 200ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className="hover:scale-110 active:scale-95 hover:bg-stone-50"
    >
      <ArrowUp size={20} />
    </button>
  );
}
