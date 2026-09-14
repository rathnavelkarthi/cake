"use client";

import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delayDuration={0}>{children}</TooltipProvider>;
}
