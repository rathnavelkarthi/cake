"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { triggerHaptic } from "@/lib/utils/haptics";

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  variant?: "ghost" | "outline" | "solid";
  size?: "sm" | "md";
}

export default function CopyButton({
  textToCopy,
  label = "Copy",
  copiedLabel = "Copied!",
  className = "",
  variant = "ghost",
  size = "sm",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const ta = document.createElement("textarea");
        ta.value = textToCopy;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      triggerHaptic("success");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const isSmall = size === "sm";

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy: ${textToCopy}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: isSmall ? "4px 8px" : "8px 14px",
        borderRadius: "8px",
        fontSize: isSmall ? "11.5px" : "13px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 140ms ease",
        backgroundColor:
          variant === "solid"
            ? "var(--accent-cocoa, #3A2016)"
            : variant === "outline"
            ? "transparent"
            : "transparent",
        color:
          variant === "solid"
            ? "#FAF7F2"
            : copied
            ? "#16A34A"
            : "var(--text-secondary, #6B5B53)",
        border:
          variant === "outline"
            ? "1px solid var(--border-medium, rgba(74, 46, 31, 0.15))"
            : "none",
      }}
      className={`hover:bg-stone-100 ${className}`}
    >
      {copied ? <Check size={isSmall ? 13 : 15} className="text-emerald-600" /> : <Copy size={isSmall ? 13 : 15} />}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
