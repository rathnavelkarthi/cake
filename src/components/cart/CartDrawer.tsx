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
  Sparkles,
  Gift,
  Camera,
  ShieldCheck,
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
import { useToast } from "@/components/ui/Toast";
import NumberFlow from "@number-flow/react";

export default function CartDrawer() {
  const { toast } = useToast();
  const {
    items,
    addItem,
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

  // Gifting / NRI Long-Distance State
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [giftCardMessage, setGiftCardMessage] = useState("");
  const [photoProofRequested, setPhotoProofRequested] = useState(true);

  // Submission / Success State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Autofill from localStorage if guest has previously identified themselves or hydrated via session link
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedPhone = localStorage.getItem("kichees_customer_phone");
    const savedName = localStorage.getItem("kichees_customer_name");
    const savedNotes = localStorage.getItem("kichees_customer_notes");
    if (savedPhone) setCustomerMobile(savedPhone.replace(/\D/g, "").slice(-10));
    if (savedName) setCustomerName(savedName);
    if (savedNotes && !customerNotes) setCustomerNotes(savedNotes);
  }, [isCartOpen]);

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

  // Handle Escape key and body scroll lock + hide floating widgets
  useEffect(() => {
    if (!isCartOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("cart-open");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCartOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove("cart-open");
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
      toast("Name Required", { description: "Please enter your name for the order.", type: "error" });
      return;
    }
    if (!customerMobile.trim() || customerMobile.replace(/\D/g, "").length < 10) {
      toast("Phone Required", { description: "Please enter a valid 10-digit WhatsApp phone number.", type: "error" });
      return;
    }
    if (fulfilmentType === "delivery" && !deliveryAddress.trim()) {
      toast("Address Required", { description: "Please provide your delivery address in Chennai.", type: "error" });
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

  const CELEBRATION_ADDONS = [
    {
      productId: "addon-candles",
      variantId: "set-1",
      name: "Artisanal Gold Candles & Wooden Server Set",
      variantLabel: "Set of 6 + Knife",
      price: 99,
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&auto=format&fit=crop&q=80",
      tagline: "Sparkler candles with wooden server",
    },
    {
      productId: "addon-card",
      variantId: "card-1",
      name: "Handwritten Letterpress Birthday Card",
      variantLabel: "Custom Card",
      price: 120,
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&auto=format&fit=crop&q=80",
      tagline: "Personalized note on luxury cardstock",
    },
    {
      productId: "addon-brownie-taster",
      variantId: "taster-2",
      name: "Taster Pair: Molten Dark Fudge Brownies",
      variantLabel: "Box of 2",
      price: 190,
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&auto=format&fit=crop&q=80",
      tagline: "A molten treat for the sender",
    },
  ];

  const handleOrderViaWhatsApp = () => {
    if (!customerMobile.trim()) {
      toast("Mobile Required", { description: "Please enter your WhatsApp mobile number first.", type: "error" });
      return;
    }
    const itemsSummary = items
      .map((i) => `• ${i.quantity}x ${i.name} (${i.variantLabel}) - ₹${i.price * i.quantity}`)
      .join("\n");

    const text = `Hi Kichees Bakery, I would like to place an order:

${itemsSummary}

Subtotal: ₹${subtotal.toLocaleString("en-IN")}
Fulfilment: ${fulfilmentType === "pickup" ? `Store Pickup (${selectedBranch.shortName})` : `Doorstep Delivery (${selectedLocality})`}
Delivery Fee: ${deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
Total Amount: ₹${total.toLocaleString("en-IN")}

Customer Name: ${customerName || "Customer"}
Phone: ${customerMobile}
${fulfilmentType === "delivery" ? `Delivery Address: ${deliveryAddress}` : ""}
${isGift ? `\n🎁 Surprise Gift for: ${recipientName} (${recipientPhone})\nGreeting Card Note: "${giftCardMessage}"\nWhatsApp delivery photo proof: ${photoProofRequested ? "Yes" : "No"}` : ""}
${customerNotes ? `Notes: ${customerNotes}` : ""}

Please confirm kitchen availability and UPI payment QR code. Thank you!`;

    const url = `https://wa.me/919884631078?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const deliveryCalc = calculateDeliveryFee(deliveryDistanceKm, subtotal);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        justifyContent: "flex-end",
        overflow: "hidden",
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
          backgroundColor: "rgba(30, 20, 15, 0.5)",
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
          zIndex: 100000,
          width: "100%",
          maxWidth: "480px",
          height: "100%",
          backgroundColor: "#FAF7F2",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.22)",
          display: "flex",
          flexDirection: "column",
          transform: isVisible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 280ms cubic-bezier(0.32, 0.72, 0, 1)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #ECE3D6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#FAF7F2",
            flexShrink: 0,
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-900">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-900 leading-none">
                Your Order Basket
              </h2>
              <span className="text-[11px] font-medium text-stone-500">
                {items.reduce((acc, i) => acc + i.quantity, 0)} {items.reduce((acc, i) => acc + i.quantity, 0) === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-full transition-colors"
            aria-label="Close Cart"
          >
            <X size={19} />
          </button>
        </div>

        {/* Content Area */}
        {placedOrder ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-[#faf7f2]">
            <div className="text-center py-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <CheckCircle2 size={30} />
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
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-200/60 flex items-center justify-center text-stone-400 mb-3">
              <ShoppingBag size={32} />
            </div>
            <h3 className="font-serif font-bold text-stone-800 text-lg">
              Your basket is empty
            </h3>
            <p className="text-xs text-stone-500 mt-1 mb-5 max-w-xs">
              Explore our Belgian truffle cakes, artisanal bagels, and freshly baked gateaux.
            </p>
            <Button
              onClick={handleClose}
              className="h-10 px-6 text-xs font-semibold bg-amber-950 hover:bg-black text-white rounded-xl shadow-xs"
            >
              Browse Bakery Menu
            </Button>
          </div>
        ) : (
          <>
            {/* Unified Scrollable Container: Everything scrolls smoothly */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-4 no-scrollbar">
              {/* 1. Fulfilment Toggle & Configuration Card */}
              <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setFulfilmentType("pickup");
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      fulfilmentType === "pickup"
                        ? "bg-amber-950 text-white shadow-xs"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200/80"
                    }`}
                  >
                    <Clock size={14} />
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
                        ? "bg-amber-950 text-white shadow-xs"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200/80"
                    }`}
                  >
                    <Truck size={14} />
                    <span>Chennai Delivery</span>
                  </button>
                </div>

                {/* Pickup Outlet Selection */}
                {fulfilmentType === "pickup" && (
                  <div className="pt-1 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                      Collection Outlet:
                    </span>
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
                              ? "bg-amber-50/80 border-amber-800 shadow-2xs"
                              : "bg-stone-50 border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-stone-900">
                              {branch.shortName}
                            </span>
                            <span className="text-[10px] bg-amber-800 text-white font-bold px-1.5 py-0.5 rounded">
                              Selected
                            </span>
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
                )}

                {/* Delivery Zone & Locality Calculator */}
                {fulfilmentType === "delivery" && (
                  <div className="pt-1 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                        Delivery Zone & Distance
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800">
                        {deliveryCalc.isFree ? "Free Delivery Unlocked!" : `Fee: ₹${deliveryCalc.fee}`}
                      </span>
                    </div>

                    <select
                      value={customKm ? "custom" : selectedLocality}
                      onChange={handleLocalityChange}
                      className="w-full h-9 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-xs text-stone-800 font-medium focus:outline-none focus:border-amber-800 focus:bg-white"
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

                    <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-950 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                      <span className="leading-tight">{deliveryCalc.formula}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Basket Items Card */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                    Basket Items ({items.reduce((acc, i) => acc + i.quantity, 0)})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("warning");
                      clearCart();
                    }}
                    className="text-[11px] text-stone-400 hover:text-red-700 font-medium transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="flex gap-3 pb-3 border-b border-stone-100 last:border-b-0 last:pb-0 items-center"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/70">
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
                        <div className="text-[11px] text-stone-500 truncate">
                          {item.variantLabel} {item.isEggless && "• Eggless"}
                        </div>
                        <div className="text-xs font-bold text-amber-900 mt-1 inline-flex items-center gap-0.5">
                          <span>₹</span>
                          <NumberFlow value={item.price * item.quantity} />
                        </div>
                      </div>

                      {/* Steppers & Remove */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="inline-flex items-center border border-stone-200 rounded-full px-1.5 py-0.5 bg-stone-50 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic("selection");
                              updateQuantity(item.cartItemId, item.quantity - 1);
                            }}
                            className="w-6 h-6 flex items-center justify-center text-stone-700 hover:text-stone-900 active:scale-90"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold px-2 text-stone-900 inline-flex items-center min-w-[18px] justify-center">
                            <NumberFlow value={item.quantity} />
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic("selection");
                              updateQuantity(item.cartItemId, item.quantity + 1);
                            }}
                            className="w-6 h-6 flex items-center justify-center text-stone-700 hover:text-stone-900 active:scale-90"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic("warning");
                            removeItem(item.cartItemId);
                          }}
                          className="text-[10px] text-stone-400 hover:text-red-700 flex items-center gap-0.5 transition-colors"
                        >
                          <Trash2 size={10} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. 1-Click Celebration Add-ons Upsell */}
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                    <span className="text-xs font-bold text-amber-950">
                      Complete the Celebration
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-100/80 px-2 py-0.5 rounded-full">
                    1-Click Add-on
                  </span>
                </div>

                <div className="space-y-1.5">
                  {CELEBRATION_ADDONS.map((addon) => {
                    const alreadyInCart = items.some((i) => i.productId === addon.productId);
                    return (
                      <div
                        key={addon.productId}
                        className="flex items-center justify-between p-2 bg-white rounded-xl border border-amber-100/80 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={addon.image}
                            alt={addon.name}
                            className="w-9 h-9 rounded-lg object-cover shrink-0 border border-stone-100"
                          />
                          <div className="truncate">
                            <p className="font-bold text-stone-900 truncate leading-tight">
                              {addon.name}
                            </p>
                            <p className="text-[10px] text-stone-500 truncate">
                              {addon.tagline}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (alreadyInCart) return;
                            triggerHaptic("selection");
                            addItem({
                              productId: addon.productId,
                              variantId: addon.variantId,
                              name: addon.name,
                              variantLabel: addon.variantLabel,
                              price: addon.price,
                              quantity: 1,
                              image: addon.image,
                              isEggless: true,
                            });
                          }}
                          disabled={alreadyInCart}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                            alreadyInCart
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-amber-950 hover:bg-black text-white shadow-xs"
                          }`}
                        >
                          {alreadyInCart ? "✓ Added" : `+ ₹${addon.price}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Trust Banner */}
              <div className="grid grid-cols-2 gap-2 text-[10px] p-2.5 rounded-xl bg-white border border-stone-200/90 text-stone-700 shadow-2xs">
                <div className="flex items-start gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 block font-bold">4°C Chilled Van</strong>
                    <span className="text-[9px] text-stone-500 leading-tight block">Zero-tilt delivery across Chennai</span>
                  </div>
                </div>
                <div className="flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 block font-bold">Dedicated Eggless</strong>
                    <span className="text-[9px] text-stone-500 leading-tight block">Cultured butter, zero synthetic icing</span>
                  </div>
                </div>
              </div>

              {/* 5. Guest Contact Details Form */}
              <div className="space-y-2.5 bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block">
                  Contact & WhatsApp Notification
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="text"
                    placeholder="Your Name *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-9 text-xs bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 font-medium"
                    required
                  />
                  <Input
                    type="tel"
                    placeholder="WhatsApp Mobile *"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    className="h-9 text-xs bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 font-medium"
                    required
                  />
                </div>

                {fulfilmentType === "delivery" && (
                  <Input
                    type="text"
                    placeholder="Complete Delivery Address & Landmark in Chennai *"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="h-9 text-xs bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 font-medium"
                    required
                  />
                )}

                <textarea
                  rows={2}
                  placeholder="Cake message (e.g. 'Happy Birthday Priya') or Chef instructions..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full rounded-md border border-stone-300 bg-white p-2.5 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800/20 resize-none font-medium"
                />

                {/* Gifting Section */}
                <div className="pt-2 border-t border-stone-100">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
                    <input
                      type="checkbox"
                      checked={isGift}
                      onChange={(e) => setIsGift(e.target.checked)}
                      className="accent-amber-800 rounded"
                    />
                    <Gift className="w-3.5 h-3.5 text-amber-800" />
                    <span>Sending as a Gift to Family / Friend in Chennai?</span>
                  </label>

                  {isGift && (
                    <div className="mt-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2 animate-in fade-in duration-200">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="text"
                          placeholder="Recipient's Name *"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="h-8 text-xs bg-white border-stone-300 text-stone-900 font-medium"
                          required={isGift}
                        />
                        <Input
                          type="tel"
                          placeholder="Recipient's Phone *"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          className="h-8 text-xs bg-white border-stone-300 text-stone-900 font-medium"
                          required={isGift}
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Personalized greeting note on handwritten card..."
                        value={giftCardMessage}
                        onChange={(e) => setGiftCardMessage(e.target.value)}
                        className="w-full rounded-md border border-stone-300 bg-white p-2 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-amber-800 resize-none font-medium"
                      />
                      <label className="flex items-center gap-1.5 text-[11px] text-stone-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={photoProofRequested}
                          onChange={(e) => setPhotoProofRequested(e.target.checked)}
                          className="accent-amber-800 rounded"
                        />
                        <Camera className="w-3 h-3 text-amber-800" />
                        <span>Send presentation photo proof to my WhatsApp when delivered</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* 6. Detailed Bill Breakdown */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-1.5 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-2">
                  Bill Details
                </span>
                <div className="flex justify-between text-stone-600">
                  <span>Items Subtotal</span>
                  <span className="inline-flex items-center gap-0.5 font-medium">
                    <span>₹</span>
                    <NumberFlow value={subtotal} />
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>
                    {fulfilmentType === "pickup"
                      ? `Pickup @ ${selectedBranch.shortName}`
                      : `Delivery (${deliveryDistanceKm} km)`}
                  </span>
                  <span className="font-medium">{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-stone-900 font-bold text-sm pt-2 border-t border-stone-200">
                  <span>Total Payable</span>
                  <span className="text-amber-900 inline-flex items-center gap-0.5 text-base">
                    <span>₹</span>
                    <NumberFlow value={total} />
                  </span>
                </div>
              </div>
            </div>

            {/* STICKY BOTTOM CHECKOUT ACTION BAR */}
            <div
              className="shrink-0 border-t border-stone-200/90 bg-white/98 backdrop-blur-md p-3.5 sm:p-4 space-y-2 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]"
              style={{
                paddingBottom: "max(14px, env(safe-area-inset-bottom, 14px))",
              }}
            >
              <div className="flex items-center justify-between text-xs px-0.5">
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase font-bold tracking-wider leading-none">
                    Total Amount
                  </span>
                  <span className="text-base font-bold font-serif text-stone-900 inline-flex items-center gap-0.5 mt-0.5">
                    <span>₹</span>
                    <NumberFlow value={total} />
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 inline-block">
                    {fulfilmentType === "pickup" ? "Free Pickup" : deliveryFee === 0 ? "Free Delivery" : `₹${deliveryFee} Delivery`}
                  </span>
                </div>
              </div>

              {/* Dual Fast-Track Checkout Actions */}
              <div className="flex flex-col gap-2 pt-0.5">
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full h-11 bg-amber-950 hover:bg-black text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm rounded-xl cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Sending Invoice via WhatsApp...</span>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 text-amber-400" />
                      <span>Place Order & Pay via UPI</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={handleOrderViaWhatsApp}
                  className="w-full h-9 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Confirm & Enquire via WhatsApp</span>
                </button>
              </div>

              <p className="text-[9.5px] text-stone-400 text-center leading-tight">
                Invoice & UPI QR code sent directly to your WhatsApp • Verified by kitchen
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
