"use client";

import React, { useEffect } from "react";
import { AlertCircle, CheckCircle2, HelpCircle, X } from "lucide-react";
import { triggerHaptic } from "@/lib/utils/haptics";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "warning",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleConfirmClick = () => {
    triggerHaptic("success");
    onConfirm();
  };

  const handleCancelClick = () => {
    triggerHaptic("selection");
    onCancel();
  };

  const isDanger = variant === "danger";

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        backgroundColor: "rgba(18, 10, 6, 0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={handleCancelClick}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "var(--bg-surface, #FFFFFF)",
          borderRadius: "20px",
          border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.12))",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          padding: "24px",
          animation: "modalSpringIn 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "16px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              backgroundColor: isDanger ? "rgba(220, 38, 38, 0.12)" : "rgba(221, 167, 82, 0.18)",
              color: isDanger ? "#DC2626" : "var(--accent-caramel, #C76D38)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {isDanger ? <AlertCircle size={22} /> : <HelpCircle size={22} />}
          </div>

          <div style={{ flex: 1 }}>
            <h3
              id="confirm-modal-title"
              style={{
                fontFamily: "var(--font-serif, Georgia, serif)",
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--text-primary, #1F1714)",
                margin: 0,
              }}
            >
              {title}
            </h3>
            <p
              id="confirm-modal-desc"
              style={{
                fontSize: "13px",
                color: "var(--text-secondary, #6B5B53)",
                lineHeight: 1.5,
                marginTop: "6px",
                margin: 0,
              }}
            >
              {description}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
          <button
            type="button"
            onClick={handleCancelClick}
            style={{
              padding: "9px 16px",
              borderRadius: "10px",
              border: "1px solid var(--border-medium, rgba(74, 46, 31, 0.18))",
              backgroundColor: "transparent",
              color: "var(--text-primary, #1F1714)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            style={{
              padding: "9px 18px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: isDanger ? "#DC2626" : "var(--accent-cocoa, #3A2016)",
              color: "#FAF7F2",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
