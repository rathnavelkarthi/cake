"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { BlockRenderer } from "@/components/cms/BlockRenderer";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/ui/Toast";
import { getLandingPageBlocks, subscribeCms } from "@/lib/cms/cms-store";
import { ContentBlock } from "@/lib/cms/types";

export default function Home() {
  const [blocks, setBlocks] = useState<ContentBlock[]>(getLandingPageBlocks);

  useEffect(() => {
    return subscribeCms(() => {
      setBlocks(getLandingPageBlocks());
    });
  }, []);

  return (
    <ToastProvider>
      <CartProvider>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "100vw",
            overflowX: "clip",
          }}
          suppressHydrationWarning
        >
          {/* Header & Sticky Fluid Island Navigation */}
          <Navbar />

          {/* Main Content Sections Dynamic CMS Blocks */}
          <main style={{ flex: 1, minWidth: 0, width: "100%", maxWidth: "100vw", overflowX: "clip" }}>
            <BlockRenderer blocks={blocks} />
          </main>

          {/* Footer */}
          <Footer />

          {/* Interactive Cart Drawer */}
          <CartDrawer />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}

