"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Truck,
  Clock,
  ArrowRight,
  MessageCircle,
  MapPin,
  QrCode,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronDown,
  Info,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";
import { triggerHaptic } from "@/lib/utils/haptics";
import {
  CHENNAI_BRANCHES,
  POPULAR_CHENNAI_LOCALITIES,
  calculateDeliveryFee,
} from "@/lib/config/branches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    fulfilmentType,
    setFulfilmentType,
    selectedBranchId,
    setSelectedBranchId,
    deliveryDistanceKm,
    setDeliveryDistanceKm,
    deliveryAddress,
    setDeliveryAddress,
    deliveryFee,
    total,
  } = useCart();

  // Animation lifecycle
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [selectedLocality, setSelectedLocality] = useState("T. Nagar (Pondy Bazaar / Panagal Park)");
  const [customKm, setCustomKm] = useState(false);

  // Submission / Success State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Autofill from localStorage if guest has previously identified themselves
  useEffect(() => {
    const savedPhone = localStorage.getItem("kichees_customer_phone");
    const savedName = localStorage.getItem("kichees_customer_name");
    if (savedPhone) setCustomerMobile(savedPhone.replace(/\D/g, "").slice(-10));
    if (savedName) setCustomerName(savedName);
  }, []);

  useEffect(() => {
    if (isCartOpen) {
      setIsRendered(true);
      const timer = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 280);
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

  const handleLocalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locName = e.target.value;
    setSelectedLocality(locName);
    if (locName === "custom") {
      setCustomKm(true);
    } else {
      setCustomKm(false);
      const found = POPULAR_CHENNAI_LOCALITIES.find((l) => l.name === locName);
      if (found) {
        setDeliveryDistanceKm(found.distanceKm);
      }
    }
  };

  const selectedBranch =
    CHENNAI_BRANCHES.find((b) => b.id === selectedBranchId) || CHENNAI_BRANCHES[0];

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      alert("Please enter your name for the order.");
      return;
    }
    if (!customerMobile.trim() || customerMobile.replace(/\D/g, "").length < 10) {
      alert("Please enter a valid 10-digit WhatsApp phone number to receive order updates & UPI QR code.");
      return;
    }
    if (fulfilmentType === "delivery" && !deliveryAddress.trim()) {
      alert("Please provide your delivery address in Chennai.");
      return;
    }

    setIsSubmitting(true);
    triggerHaptic("selection");

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          variantLabel: i.variantLabel,
          quantity: i.quantity,
          price: i.price,
          isEggless: i.isEggless,
        })),
        subtotal,
        fulfilmentType: fulfilmentType === "pickup" ? "PICKUP" : "DELIVERY",
        branchId: selectedBranch.id,
        branchName: selectedBranch.shortName,
        deliveryAddress:
          fulfilmentType === "delivery"
            ? `${deliveryAddress} (${selectedLocality})`
            : undefined,
        deliveryDistanceKm: fulfilmentType === "delivery" ? deliveryDistanceKm : 0,
        deliveryFee,
        total,
        customerNotes,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create order.");
      }

      // Save customer details in localStorage for future frictionless orders
      localStorage.setItem("kichees_customer_phone", customerMobile.trim());
      localStorage.setItem("kichees_customer_name", customerName.trim());

      setPlacedOrder(data);
      clearCart();
      triggerHaptic("success");
    } catch (err: any) {
      console.error("Order placement error:", err);
      alert(err.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyUpi = (upiId: string) => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const deliveryCalc = calculateDeliveryFee(deliveryDistanceKm, subtotal);

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
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(30, 20, 15, 0.45)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 240ms ease-out",
        }}
        onClick={handleClose}
      />

      {/* Drawer Panel */}
      <div
        className="drawer-panel"
        style={{
          position: "relative",
          zIndex: 101,
          width: "100%",
          maxWidth: "480px",
          height: "100%",
          backgroundColor: "#FFFFFF",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          transform: isVisible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 280ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #f1ece4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#faf7f2",
          }}
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={20} className="text-amber-800" />
            <h2 className="font-serif font-bold text-lg text-stone-900">
              Your Order Basket
            </h2>
            <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
              {items.reduce((acc, i) => acc + i.quantity, 0)} items
            </span>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 rounded-full transition-colors"
            aria-label="Close Cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* ============================================================== */}
        {/* SUCCESS / ORDER PLACED MODAL */}
        {/* ============================================================== */}
        {placedOrder ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#faf7f2]">
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={32} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Order Received
              </span>
              <h3 className="font-serif font-bold text-2xl text-stone-900 mt-1">
                #{placedOrder.order?.orderNumber}
              </h3>
              <p className="text-xs text-stone-600 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong>{placedOrder.order?.customerName}</strong>! We have logged your order and sent your invoice directly to your WhatsApp (+91 {placedOrder.order?.customerMobile}).
              </p>
            </div>

            {/* UPI QR Payment Box */}
            <div className="p-5 rounded-2xl bg-white border border-amber-200/90 shadow-sm text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-semibold">
                <QrCode className="w-3.5 h-3.5 text-amber-800" />
                <span>Instant UPI Payment</span>
              </div>

              <div className="p-2 bg-[#faf7f2] rounded-xl border border-stone-200 inline-block">
                <img
                  src={placedOrder.upi?.qrImageUrl}
                  alt="UPI QR Code"
                  width={180}
                  height={180}
                  className="mx-auto"
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs text-stone-500">Amount Payable:</div>
                <div className="text-2xl font-bold font-serif text-stone-900">
                  ₹{Number(placedOrder.order?.total).toLocaleString("en-IN")}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <code className="text-xs font-mono bg-stone-100 px-3 py-1 rounded-lg border border-stone-200 text-stone-800 font-bold">
                  {placedOrder.upi?.upiId}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyUpi(placedOrder.upi?.upiId)}
                  className="h-7 text-xs border-stone-300"
                >
                  {copiedUpi ? (
                    <span className="text-emerald-700 font-medium">Copied!</span>
                  ) : (
                    <span>Copy</span>
                  )}
                </Button>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-left text-xs text-emerald-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-700" />
                  <span>Next Step: Send Payment Screenshot</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-800">
                  After paying via GPay, PhonePe, or Paytm, please reply with your screenshot on WhatsApp. Our manager will confirm and push your bakes to Chef Selva and Chef Anbu!
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={`https://wa.me/919884631078?text=${encodeURIComponent(
                    `Hi Kichees! Here is the payment screenshot for Order #${placedOrder.order?.orderNumber} (₹${placedOrder.order?.total}). Please confirm and push to kitchen!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs tracking-wider uppercase">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    <span>Send Screenshot on WhatsApp</span>
                  </Button>
                </a>

                <Link href="/account/orders" onClick={handleClose} className="w-full">
                  <Button variant="outline" className="w-full h-10 text-xs border-stone-300">
                    <span>View in My Past Orders</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* STANDARD CART & CHECKOUT FORM */
          /* ============================================================== */
          <>
            {/* Fulfilment Method Toggle */}
            <div className="p-3 px-6 bg-[#faf7f2] border-b border-stone-200">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("selection");
                    setFulfilmentType("pickup");
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    fulfilmentType === "pickup"
                      ? "bg-white text-stone-900 shadow-sm border border-stone-200"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Clock size={14} className={fulfilmentType === "pickup" ? "text-amber-800" : ""} />
                  <span>Store Pickup (Free)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("selection");
                    setFulfilmentType("delivery");
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    fulfilmentType === "delivery"
                      ? "bg-white text-stone-900 shadow-sm border border-stone-200"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Truck size={14} className={fulfilmentType === "delivery" ? "text-amber-800" : ""} />
                  <span>Chennai Delivery</span>
                </button>
              </div>

              {/* STORE PICKUP: BRANCH SELECTION */}
              {fulfilmentType === "pickup" && (
                <div className="mt-3 pt-3 border-t border-stone-200/80 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                    Select Collection Outlet:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {CHENNAI_BRANCHES.map((branch) => {
                      const isSelected = selectedBranchId === branch.id;
                      return (
                        <div
                          key={branch.id}
                          onClick={() => {
                            triggerHaptic("selection");
                            setSelectedBranchId(branch.id);
                          }}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-amber-50/80 border-amber-700 shadow-xs"
                              : "bg-white border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-stone-900">
                              {branch.shortName}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] bg-amber-800 text-white font-bold px-1.5 py-0.5 rounded">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-1">
                            {branch.address}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-stone-400">
                            <span>Open: {branch.timings}</span>
                            <span className="text-emerald-700 font-semibold">Free Pickup</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* DELIVERY: DISTANCE & LOCALITY CALCULATION */}
              {fulfilmentType === "delivery" && (
                <div className="mt-3 pt-3 border-t border-stone-200/80 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                      Delivery Zone & Distance
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-800">
                      {deliveryCalc.isFree ? "Free Delivery Unlocked!" : `Fee: ₹${deliveryCalc.fee}`}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <select
                      value={customKm ? "custom" : selectedLocality}
                      onChange={handleLocalityChange}
                      className="w-full h-9 px-2.5 rounded-lg border border-stone-200 bg-white text-xs text-stone-800 font-medium focus:outline-none focus:border-amber-800"
                    >
                      {POPULAR_CHENNAI_LOCALITIES.map((loc) => (
                        <option key={loc.name} value={loc.name}>
                          {loc.name} (~{loc.distanceKm} km)
                        </option>
                      ))}
                      <option value="custom">Enter custom distance in KM...</option>
                    </select>

                    {customKm && (
                      <div className="flex items-center gap-2 pt-1">
                        <Input
                          type="number"
                          min={1}
                          max={45}
                          value={deliveryDistanceKm}
                          onChange={(e) => setDeliveryDistanceKm(Number(e.target.value) || 1)}
                          className="h-8 text-xs w-28 bg-white border-stone-200"
                          placeholder="e.g. 5"
                        />
                        <span className="text-xs text-stone-500">km from Nungambakkam</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing formula badge */}
                  <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-200/70 text-[11px] text-amber-950 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                    <span>{deliveryCalc.formula}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag size={36} className="text-stone-300 mx-auto mb-3" />
                  <h3 className="font-serif font-bold text-stone-800 text-base">
                    Your basket is empty
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 mb-4">
                    Explore our Belgian truffle cakes and freshly baked gateaux.
                  </p>
                  <Button
                    onClick={handleClose}
                    className="h-9 text-xs bg-amber-900 hover:bg-amber-950 text-white"
                  >
                    Browse Cakes
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex gap-3 pb-3 border-b border-stone-100 items-center"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-stone-900 truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {item.variantLabel} {item.isEggless && "• Eggless"}
                      </div>
                      <div className="text-xs font-bold text-amber-900 mt-0.5">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>

                    {/* Steppers */}
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="inline-flex items-center border border-stone-200 rounded-full px-1.5 py-0.5 bg-stone-50">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic("selection");
                            updateQuantity(item.cartItemId, item.quantity - 1);
                          }}
                          className="w-5 h-5 flex items-center justify-center text-stone-700 hover:text-stone-900"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-xs font-bold px-2 text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic("selection");
                            updateQuantity(item.cartItemId, item.quantity + 1);
                          }}
                          className="w-5 h-5 flex items-center justify-center text-stone-700 hover:text-stone-900"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic("warning");
                          removeItem(item.cartItemId);
                        }}
                        className="text-[10px] text-stone-400 hover:text-red-700 flex items-center gap-0.5"
                      >
                        <Trash2 size={10} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Checkout Section */}
            {items.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-stone-200 bg-[#faf7f2] space-y-3">
                {/* Guest Details Form */}
                <div className="space-y-2 bg-white p-3.5 rounded-xl border border-stone-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block">
                    Contact & WhatsApp Notification
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="text"
                      placeholder="Your Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-8 text-xs border-stone-200"
                      required
                    />
                    <Input
                      type="tel"
                      placeholder="WhatsApp Mobile"
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      className="h-8 text-xs border-stone-200"
                      required
                    />
                  </div>

                  {fulfilmentType === "delivery" && (
                    <Input
                      type="text"
                      placeholder="Complete Delivery Address & Landmark in Chennai"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="h-8 text-xs border-stone-200"
                      required
                    />
                  )}

                  <Input
                    type="text"
                    placeholder="Cake message / Chef special notes..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="h-8 text-xs border-stone-200"
                  />
                </div>

                {/* Subtotal & Delivery Total */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Items Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>
                      {fulfilmentType === "pickup"
                        ? `Pickup @ ${selectedBranch.shortName}`
                        : `Delivery (${deliveryDistanceKm} km)`}
                    </span>
                    <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between text-stone-900 font-bold text-sm pt-1 border-t border-stone-200">
                    <span>Total Amount</span>
                    <span className="text-amber-900">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Place Order & Trigger Evolution API WhatsApp */}
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full h-11 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <span>Sending Invoice via WhatsApp...</span>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4" />
                      <span>Place Order & Pay via UPI</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <p className="text-[10px] text-stone-400 text-center">
                  Invoice & UPI QR code sent to your WhatsApp. Verified by kitchen manager.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
