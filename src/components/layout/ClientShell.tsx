"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import ScrollProgressBar from "@/components/ui/ScrollProgressBar";
import BackToTop from "@/components/ui/BackToTop";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import CookieBanner from "@/components/ui/CookieBanner";
import { captureUtmParameters } from "@/lib/analytics/utm";

interface ClientShellProps {
  children: React.ReactNode;
}

export default function ClientShell({ children }: ClientShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    // Capture marketing UTM parameters on first page load
    captureUtmParameters();
  }, []);

  return (
    <>
      {/* WCAG 2.1 Accessible Skip to Main Content Link */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Real-time reading & scroll progress indicator (customer pages only) */}
      {!isAdmin && <ScrollProgressBar />}

      {/* Main Page Content Target */}
      <div id="main-content" tabIndex={-1} style={{ outline: "none", minWidth: 0, width: "100%" }}>
        {children}
      </div>

      {/* Persistent Accessibility & Conversion Controls (customer pages only) */}
      {!isAdmin && (
        <>
          <BackToTop />
          <FloatingWhatsApp />
          <CookieBanner />
        </>
      )}
    </>
  );
}
