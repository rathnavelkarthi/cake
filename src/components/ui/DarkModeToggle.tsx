"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { triggerHaptic } from "@/lib/utils/haptics";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedTheme = localStorage.getItem("kichees_theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
        setIsDark(true);
        document.documentElement.classList.add("dark");
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = () => {
    triggerHaptic("selection");
    const nextDark = !isDark;
    setIsDark(nextDark);
    try {
      if (nextDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("kichees_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("kichees_theme", "light");
      }
    } catch {
      // ignore
    }
  };

  if (!isMounted) return null;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to warm light mode" : "Switch to warm dark mode"}
      title={isDark ? "Switch to warm light mode" : "Switch to warm dark mode"}
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-muted, #F3ECE2)",
        color: "var(--text-primary, #1F1714)",
        border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.1))",
        cursor: "pointer",
        transition: "all 180ms ease",
      }}
      className="hover:scale-105 active:scale-95 hover:bg-stone-200"
    >
      {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-stone-700" />}
    </button>
  );
}
