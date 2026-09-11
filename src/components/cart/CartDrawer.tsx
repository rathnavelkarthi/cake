"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { X, Plus, Minus, Trash2, ShoppingBag, Truck, Clock, ArrowRight, MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";
import { triggerHaptic } from "@/lib/utils/haptics";

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    subtotal,
    fulfilmentType,
    setFulfilmentType,
    deliveryFee,
    total,
  } = useCart();

  // Animation lifecycle state: handle graceful symmetrical exit
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isCartOpen) {
      setIsRendered(true);
      // Next tick triggers transition
      const timer = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 280); // matches --duration-drawer
      return () => clearTimeout(timer);
    }
  }, [isCartOpen]);

  // Handle Escape key and body scroll lock
  useEffect(() => {
    if (!isCartOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCartOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isRendered) return null;

  const handleClose = () => {
    triggerHaptic("selection");
    setIsCartOpen(false);
  };

  const handleCheckoutViaWhatsApp = () => {
    triggerHaptic("success");
    trackEvent({
      name: "begin_checkout",
      totalItems: items.length,
      total,
      fulfilment: fulfilmentType,
    });

    const itemsList = items
      .map(
        (i, idx) =>
          `${idx + 1}. ${i.name} (${i.variantLabel}) x ${i.quantity} = ₹${(
            i.price * i.quantity
          ).toLocaleString("en-IN")}`
      )
      .join("\n");

    const message = `*NEW ORDER - KICHEES BAKED DELIGHTS*

${itemsList}

*Subtotal:* ₹${subtotal.toLocaleString("en-IN")}
*Fulfilment:* ${
      fulfilmentType === "pickup"
        ? "Counter Pickup (Nungambakkam)"
        : "Delivery across Chennai"
    }
*Delivery Fee:* ${deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
*Estimated Total:* ₹${total.toLocaleString("en-IN")}

Please share the payment link / confirm availability. Thank you!`;

    const url = `https://wa.me/${BUSINESS_CONFIG.whatsapp.replace(
      "+",
      ""
    )}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "flex-end",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Basket"
    >
      {/* Backdrop with Symmetrical Fade & Apple Scrim Material */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "var(--material-scrim)",
          backdropFilter: "var(--material-blur-scrim)",
          WebkitBackdropFilter: "var(--material-blur-scrim)",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 240ms var(--ease-apple-spring)",
        }}
        onClick={handleClose}
      />

      {/* Drawer Panel - Symmetrical Slide via Apple Sheet Spring */}
      <div
        className="drawer-panel"
        style={{
          position: "relative",
          zIndex: 101,
          width: "100%",
          maxWidth: "460px",
          height: "100%",
          backgroundColor: "var(--bg-surface)",
          boxShadow: "var(--shadow-drawer)",
          display: "flex",
          flexDirection: "column",
          transform: isVisible ? "translateX(0)" : "translateX(100%)",
          transition: "transform var(--duration-drawer) var(--ease-apple-sheet)",
          borderLeft: "1px solid var(--border-subtle)",
        }}
      >
        {/* Mobile Pull Handle Indicator */}
        <div className="mobile-grab-handle-wrapper" style={{ display: "none" }}>
          <div className="sheet-grab-bar" />
        </div>

        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShoppingBag size={20} style={{ color: "var(--accent-caramel)" }} />
            <h2 className="font-serif" style={{ fontSize: "20px", fontWeight: 700, color: "var(--accent-cocoa)" }}>
              Your Order Basket
            </h2>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                backgroundColor: "var(--accent-caramel-subtle)",
                color: "var(--accent-caramel)",
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
              }}
            >
              {items.reduce((acc, i) => acc + i.quantity, 0)} items
            </span>
          </div>

          <button
            onClick={handleClose}
            className="pressable"
            style={{
              padding: "6px",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              borderRadius: "50%",
            }}
            aria-label="Close Cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Fulfilment Selector */}
        <div style={{ padding: "12px 24px", backgroundColor: "var(--bg-muted)", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                setFulfilmentType("delivery");
              }}
              className="pressable"
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                fontSize: "12px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                backgroundColor: fulfilmentType === "delivery" ? "var(--bg-surface)" : "transparent",
                color: fulfilmentType === "delivery" ? "var(--accent-cocoa)" : "var(--text-secondary)",
                boxShadow: fulfilmentType === "delivery" ? "var(--shadow-sm)" : "none",
                transition: "background-color 160ms var(--ease-apple-spring), color 160ms var(--ease-apple-spring)",
              }}
            >
              <Truck size={14} style={{ color: fulfilmentType === "delivery" ? "var(--accent-caramel)" : "inherit" }} />
              <span>Chennai Delivery</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                setFulfilmentType("pickup");
              }}
              className="pressable"
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                fontSize: "12px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                backgroundColor: fulfilmentType === "pickup" ? "var(--bg-surface)" : "transparent",
                color: fulfilmentType === "pickup" ? "var(--accent-cocoa)" : "var(--text-secondary)",
                boxShadow: fulfilmentType === "pickup" ? "var(--shadow-sm)" : "none",
                transition: "background-color 160ms var(--ease-apple-spring), color 160ms var(--ease-apple-spring)",
              }}
            >
              <Clock size={14} style={{ color: fulfilmentType === "pickup" ? "var(--accent-caramel)" : "inherit" }} />
              <span>Counter Pickup (Free)</span>
            </button>
          </div>
        </div>

        {/* Items List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                margin: "auto 0",
                textAlign: "center",
                padding: "40px 20px",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "var(--bg-muted)",
                  color: "var(--accent-caramel)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <ShoppingBag size={24} />
              </div>
              <h3 className="font-serif" style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent-cocoa)", marginBottom: "6px" }}>
                Your basket is empty
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                Explore our morning bakes and signature chocolate truffle cakes.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="btn-primary pressable"
                style={{ fontSize: "13px", padding: "10px 20px" }}
              >
                Browse Signature Cakes
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.cartItemId}
                style={{
                  display: "flex",
                  gap: "14px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid var(--border-subtle)",
                  alignItems: "center",
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: "68px",
                    height: "68px",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    backgroundColor: "var(--bg-muted)",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent-cocoa)", lineHeight: 1.3, marginBottom: "2px" }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    {item.variantLabel} {item.isEggless && "• Eggless"}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent-caramel)" }}>
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </div>
                </div>

                {/* Steppers */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      border: "1px solid var(--border-medium)",
                      borderRadius: "var(--radius-full)",
                      padding: "2px",
                      backgroundColor: "var(--bg-primary)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("selection");
                        updateQuantity(item.cartItemId, item.quantity - 1);
                      }}
                      className="pressable"
                      style={{
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--accent-cocoa)",
                      }}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontSize: "12px", fontWeight: 700, minWidth: "22px", textAlign: "center" }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("selection");
                        updateQuantity(item.cartItemId, item.quantity + 1);
                      }}
                      className="pressable"
                      style={{
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--accent-cocoa)",
                      }}
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("warning");
                      removeItem(item.cartItemId);
                    }}
                    style={{
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    aria-label="Remove item"
                  >
                    <Trash2 size={12} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Calculation */}
        {items.length > 0 && (
          <div
            style={{
              padding: "20px 24px",
              borderTop: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-surface)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                <span>Fulfilment ({fulfilmentType === "pickup" ? "Pickup" : "Delivery"})</span>
                <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
              </div>

              {fulfilmentType === "delivery" && subtotal < BUSINESS_CONFIG.deliveryZones.minOrderFreeDelivery && (
                <div style={{ fontSize: "11px", color: "var(--accent-caramel)" }}>
                  Add ₹{(BUSINESS_CONFIG.deliveryZones.minOrderFreeDelivery - subtotal).toLocaleString("en-IN")} more for Free Delivery!
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "17px",
                  fontWeight: 800,
                  color: "var(--accent-cocoa)",
                  paddingTop: "8px",
                  borderTop: "1px dashed var(--border-subtle)",
                }}
              >
                <span>Total</span>
                <span style={{ color: "var(--accent-caramel)" }}>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckoutViaWhatsApp}
              className="pressable"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "#16A34A",
                color: "#FFFFFF",
                fontSize: "15px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(22, 163, 74, 0.28)",
              }}
            >
              <MessageCircle size={18} />
              <span>Confirm Order on WhatsApp</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginTop: "10px" }}>
              Immediate confirmation from Nungambakkam kitchen counter
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .mobile-grab-handle-wrapper {
            display: block !important;
          }
          .drawer-panel {
            max-width: 100% !important;
            height: 88vh !important;
            margin-top: auto !important;
            border-top-left-radius: var(--radius-xl) !important;
            border-top-right-radius: var(--radius-xl) !important;
            border-left: none !important;
            border-top: 1px solid rgba(255, 255, 255, 0.4) !important;
            box-shadow: var(--shadow-sheet) !important;
            transform: ${isVisible ? "translateY(0)" : "translateY(100%)"} !important;
            transition: transform var(--duration-drawer) var(--ease-apple-sheet) !important;
          }
        }
      `}</style>
    </div>
  );
}
