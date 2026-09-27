"use client";

import React, { createContext, useContext, useCallback } from "react";
import { toast as sonnerToast } from "sonner";
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
  const toast = useCallback(
    (title: string, options?: { description?: string; type?: ToastType }) => {
      const type = options?.type || "success";
      if (type === "success") {
        triggerHaptic("success");
        sonnerToast.success(title, { description: options?.description });
      } else if (type === "error") {
        triggerHaptic("warning");
        sonnerToast.error(title, { description: options?.description });
      } else {
        triggerHaptic("selection");
        sonnerToast.info(title, { description: options?.description });
      }
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: (title: string, options?: { description?: string; type?: ToastType }) => {
        const type = options?.type || "success";
        if (type === "success") {
          triggerHaptic("success");
          sonnerToast.success(title, { description: options?.description });
        } else if (type === "error") {
          triggerHaptic("warning");
          sonnerToast.error(title, { description: options?.description });
        } else {
          triggerHaptic("selection");
          sonnerToast.info(title, { description: options?.description });
        }
      },
    };
  }
  return context;
}

