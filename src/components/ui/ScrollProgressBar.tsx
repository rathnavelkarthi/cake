"use client";

import React, { useState, useEffect } from "react";

export default function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (totalScroll / windowHeight) * 100)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (scrollProgress <= 0) return null;

  return (
    <div
      role="progressbar"
      aria-label="Page reading progress"
      aria-valuenow={Math.round(scrollProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "3px",
        width: `${scrollProgress}%`,
        backgroundColor: "var(--accent-gold, #DDA752)",
        backgroundImage: "linear-gradient(to right, #C76D38, #DDA752)",
        zIndex: 9999,
        transition: "width 100ms ease-out",
        boxShadow: "0 0 8px rgba(221, 167, 82, 0.6)",
      }}
    />
  );
}
