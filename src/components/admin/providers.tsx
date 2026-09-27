"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AdminProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: any;
}) {
  return (
    <SessionProvider session={session}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SessionProvider>
  );
}
