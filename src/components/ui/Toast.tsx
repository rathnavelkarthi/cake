"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { triggerHaptic } from "@/lib/utils/haptics";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (title: string, options?: { description?: string; type?: ToastType }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback(
    (title: string, options?: { description?: string; type?: ToastType }) => {
      const type = options?.type || "success";
      if (type === "success") triggerHaptic("success");
      else if (type === "error") triggerHaptic("warning");
      else triggerHaptic("selection");

      const id = `${Date.now()}-${Math.random()}`;
      const newToast: ToastMessage = {
        id,
        title,
        description: options?.description,
        type,
      };

      setToasts((prev) => [...prev.slice(-3), newToast]);

      // Auto dismiss after 2400ms
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2400);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Floating Toasts Stack */}
      <div
        aria-live="polite"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          pointerEvents: "none",
          maxWidth: "360px",
          width: "calc(100% - 48px)",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: "auto",
              backgroundColor: "var(--material-dark)",
              backdropFilter: "var(--material-blur)",
              WebkitBackdropFilter: "var(--material-blur)",
              color: "#FFFFFF",
              padding: "12px 18px",
              borderRadius: "var(--radius-md)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              border: "1px solid rgba(255,255,255,0.18)",
              transition: "transform 180ms var(--ease-apple-spring), opacity 180ms var(--ease-apple-spring)",
              animation: "toastEnter 220ms var(--ease-apple-spring)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {t.type === "success" && <CheckCircle2 size={18} style={{ color: "#4ADE80" }} />}
              {t.type === "error" && <AlertCircle size={18} style={{ color: "#F87171" }} />}
              {t.type === "info" && <Info size={18} style={{ color: "var(--accent-gold)" }} />}
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.01em" }}>{t.title}</div>
                {t.description && (
                  <div style={{ fontSize: "12px", color: "#D1D5DB", marginTop: "2px" }}>
                    {t.description}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="pressable"
              style={{
                color: "rgba(255,255,255,0.6)",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes toastEnter {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
