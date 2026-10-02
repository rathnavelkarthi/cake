"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider, useCart } from "@/context/CartContext";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import {
  ShoppingBag,
  Truck,
  Clock,
  ArrowRight,
  MessageCircle,
  QrCode,
  CheckCircle2,
  Copy,
  Plus,
  Minus,
  Trash2,
  Gift,
  Camera,
  ShieldCheck,
  Info,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { triggerHaptic } from "@/lib/utils/haptics";
import {
  CHENNAI_BRANCHES,
  POPULAR_CHENNAI_LOCALITIES,
  calculateDeliveryFee,
} from "@/lib/config/branches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NumberFlow from "@number-flow/react";

function CheckoutContent() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    items,
    addItem,
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

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [selectedLocality, setSelectedLocality] = useState("T. Nagar (Pondy Bazaar / Panagal Park)");
  const [customKm, setCustomKm] = useState(false);

  // Gifting State
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [giftCardMessage, setGiftCardMessage] = useState("");
  const [photoProofRequested, setPhotoProofRequested] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // Autofill from localStorage & session parameter
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedPhone = localStorage.getItem("kichees_customer_phone");
    const savedName = localStorage.getItem("kichees_customer_name");
    const savedNotes = localStorage.getItem("kichees_customer_notes");

    if (savedPhone) setCustomerMobile(savedPhone.replace(/\D/g, "").slice(-10));
    if (savedName) setCustomerName(savedName);
    if (savedNotes) setCustomerNotes(savedNotes);

    // Direct session URL hydration check
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("cart") || params.get("cartSession") || params.get("session");

    if (sessionId && sessionId.startsWith("cs_")) {
      setIsLoadingSession(true);
      fetch(`/api/cart/session?id=${encodeURIComponent(sessionId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.session) {
            if (data.session.customerPhone) {
              setCustomerMobile(data.session.customerPhone.replace(/\D/g, "").slice(-10));
            }
            if (data.session.customerName) {
              setCustomerName(data.session.customerName);
            }
            if (data.session.customerNotes) {
              setCustomerNotes(data.session.customerNotes);
            }
          }
        })
        .catch((e) => console.warn("Checkout session fetch error:", e))
        .finally(() => setIsLoadingSession(false));
    }
  }, []);

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
        customerNotes: isGift
          ? `${customerNotes ? customerNotes + " | " : ""}Gift for: ${recipientName} (${recipientPhone}) - Note: "${giftCardMessage}"`
          : customerNotes,
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

      localStorage.setItem("kichees_customer_phone", customerMobile.trim());
      localStorage.setItem("kichees_customer_name", customerName.trim());

      setPlacedOrder(data);
      clearCart();
      triggerHaptic("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  const deliveryCalc = calculateDeliveryFee(deliveryDistanceKm, subtotal);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 leading-tight">
                Secure Checkout
              </h1>
              <p className="text-xs text-stone-500">
                Freshly baked with pure butter & Belgian Callebaut chocolate in Nungambakkam
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck size={16} />
            <span>100% Eggless • Verified Bakery Desk</span>
          </div>
        </div>

        {/* ORDER SUCCESS SCREEN */}
        {placedOrder ? (
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Order Received Successfully
              </span>
              <h2 className="font-serif font-bold text-3xl text-stone-900 mt-1">
                #{placedOrder.order?.orderNumber}
              </h2>
              <p className="text-xs text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{placedOrder.order?.customerName}</strong>! Your invoice has been sent directly to your WhatsApp (+91 {placedOrder.order?.customerMobile}).
              </p>
            </div>

            {/* UPI QR Payment Box */}
            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-stone-200 text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                <QrCode className="w-3.5 h-3.5 text-amber-800" />
                <span>Instant UPI Payment</span>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-stone-200 inline-block shadow-xs">
                <img
                  src={placedOrder.upi?.qrImageUrl}
                  alt="UPI QR Code"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs text-stone-500">Amount Payable:</div>
                <div className="text-3xl font-bold font-serif text-stone-900">
                  ₹{Number(placedOrder.order?.total).toLocaleString("en-IN")}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <code className="text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-stone-200 text-stone-800 font-bold">
                  {placedOrder.upi?.upiId}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyUpi(placedOrder.upi?.upiId)}
                  className="h-8 text-xs border-stone-300"
                >
                  {copiedUpi ? (
                    <span className="text-emerald-700 font-medium">Copied!</span>
                  ) : (
                    <span>Copy</span>
                  )}
                </Button>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-left text-xs text-emerald-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-700" />
                  <span>Next Step: Send Payment Screenshot</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-800">
                  After paying via GPay, PhonePe, or Paytm, please reply with your screenshot on WhatsApp. Our manager will confirm and push your bakes to Chef Selva!
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
                  <Button className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs tracking-wider uppercase rounded-xl">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    <span>Send Screenshot on WhatsApp</span>
                  </Button>
                </a>

                <Link href="/shop" className="w-full">
                  <Button variant="outline" className="w-full h-11 text-xs border-stone-300 rounded-xl">
                    <span>Back to Bakery Menu</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* EMPTY BASKET STATE */
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-4 my-8">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
              <ShoppingBag size={32} />
            </div>
            <h2 className="font-serif font-bold text-stone-900 text-xl">
              Your basket is currently empty
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              If you received a pre-filled link from our voice agent or WhatsApp, please ensure the complete link was opened, or explore our menu below.
            </p>
            <Link href="/shop" className="inline-block pt-2">
              <Button className="h-11 px-8 bg-amber-950 hover:bg-black text-white text-xs font-semibold rounded-xl">
                Browse Cakes & Pastries
              </Button>
            </Link>
          </div>
        ) : (
          /* ACTIVE CHECKOUT TWO-COLUMN LAYOUT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Customer, Fulfilment, and Delivery Form (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Fulfilment Method Card */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                  1. Fulfilment Method
                </span>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setFulfilmentType("delivery");
                    }}
                    className={`flex-1 py-3 px-4 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      fulfilmentType === "delivery"
                        ? "bg-amber-950 text-white shadow-xs"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200/80"
                    }`}
                  >
                    <Truck size={16} />
                    <span>Chennai Doorstep Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setFulfilmentType("pickup");
                    }}
                    className={`flex-1 py-3 px-4 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      fulfilmentType === "pickup"
                        ? "bg-amber-950 text-white shadow-xs"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200/80"
                    }`}
                  >
                    <Clock size={16} />
                    <span>Store Pickup (Free)</span>
                  </button>
                </div>

                {/* Pickup details */}
                {fulfilmentType === "pickup" && (
                  <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/70 text-xs text-amber-950 space-y-1">
                    <div className="font-bold flex items-center justify-between">
                      <span>Collection Counter:</span>
                      <span className="text-emerald-700 font-bold">Free Pickup</span>
                    </div>
                    <p className="font-semibold text-stone-800">{selectedBranch.name}</p>
                    <p className="text-[11px] text-stone-600">{selectedBranch.address}</p>
                    <p className="text-[10px] text-stone-500 pt-1">Timings: {selectedBranch.timings}</p>
                  </div>
                )}

                {/* Delivery Zone details */}
                {fulfilmentType === "delivery" && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-700">Delivery Locality in Chennai:</span>
                      <span className="font-bold text-emerald-800">
                        {deliveryCalc.isFree ? "Free Delivery Unlocked!" : `Delivery: ₹${deliveryCalc.fee}`}
                      </span>
                    </div>

                    <select
                      value={customKm ? "custom" : selectedLocality}
                      onChange={handleLocalityChange}
                      className="w-full h-10 px-3 rounded-xl border border-stone-300 bg-stone-50 text-xs text-stone-900 font-medium focus:outline-none focus:border-amber-800 focus:bg-white"
                    >
                      {POPULAR_CHENNAI_LOCALITIES.map((loc) => (
                        <option key={loc.name} value={loc.name}>
                          {loc.name} (~{loc.distanceKm} km from Nungambakkam)
                        </option>
                      ))}
                      <option value="custom">Enter custom distance in KM...</option>
                    </select>

                    {customKm && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={45}
                          value={deliveryDistanceKm}
                          onChange={(e) => setDeliveryDistanceKm(Number(e.target.value) || 1)}
                          className="h-9 text-xs w-28 bg-white border-stone-300"
                        />
                        <span className="text-xs text-stone-500">km from Nungambakkam kitchen</span>
                      </div>
                    )}

                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-950 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                      <span>{deliveryCalc.formula}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Customer Contact & Delivery Address Card */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                  2. Contact & Delivery Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Your Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Aravind"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-10 text-xs bg-white border-stone-300 text-stone-900 font-medium rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      WhatsApp Mobile Number *
                    </label>
                    <Input
                      type="tel"
                      placeholder="10-digit mobile (e.g. 9884631078)"
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      className="h-10 text-xs bg-white border-stone-300 text-stone-900 font-medium rounded-xl"
                      required
                    />
                  </div>
                </div>

                {fulfilmentType === "delivery" && (
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Complete Delivery Address & Landmark in Chennai *
                    </label>
                    <Input
                      type="text"
                      placeholder="Flat/House no, Street name, Landmark, Pin Code"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="h-10 text-xs bg-white border-stone-300 text-stone-900 font-medium rounded-xl"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Cake Lettering Message or Chef Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 'Happy 25th Birthday Priya' or 'Please keep it light on frosting'"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white p-3 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-amber-800 resize-none font-medium"
                  />
                </div>

                {/* Gifting Section */}
                <div className="pt-3 border-t border-stone-100">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
                    <input
                      type="checkbox"
                      checked={isGift}
                      onChange={(e) => setIsGift(e.target.checked)}
                      className="accent-amber-800 rounded"
                    />
                    <Gift className="w-4 h-4 text-amber-800" />
                    <span>Sending as a Surprise Gift to Family / Friend in Chennai?</span>
                  </label>

                  {isGift && (
                    <div className="mt-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          type="text"
                          placeholder="Recipient's Name *"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="h-9 text-xs bg-white border-stone-300"
                        />
                        <Input
                          type="tel"
                          placeholder="Recipient's Phone *"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          className="h-9 text-xs bg-white border-stone-300"
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Personalized note to be handwritten on luxury cardstock..."
                        value={giftCardMessage}
                        onChange={(e) => setGiftCardMessage(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-amber-800 resize-none font-medium"
                      />
                      <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={photoProofRequested}
                          onChange={(e) => setPhotoProofRequested(e.target.checked)}
                          className="accent-amber-800 rounded"
                        />
                        <Camera className="w-3.5 h-3.5 text-amber-800" />
                        <span>Send delivery presentation photo to my WhatsApp upon arrival</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Basket Items, Upsells, and Total (5 Cols) */}
            <div className="lg:col-span-5 space-y-5 sticky top-24">
              {/* Items Card */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Order Items ({items.reduce((acc, i) => acc + i.quantity, 0)})
                  </span>
                  <Link href="/shop" className="text-xs text-amber-900 font-semibold hover:underline">
                    + Add More
                  </Link>
                </div>

                <div className="space-y-3.5">
                  {items.map((item) => (
                    <div key={item.cartItemId} className="flex gap-3 pb-3 border-b border-stone-100 last:border-b-0 last:pb-0 items-center">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/70">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-stone-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate">
                          {item.variantLabel} {item.isEggless && "• Eggless"}
                        </p>
                        {item.customMessage && (
                          <p className="text-[10px] text-amber-900 italic truncate">
                            &quot;{item.customMessage}&quot;
                          </p>
                        )}
                        <p className="text-xs font-bold text-amber-900 mt-0.5">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="inline-flex items-center border border-stone-200 rounded-full px-1.5 py-0.5 bg-stone-50">
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic("selection");
                              updateQuantity(item.cartItemId, item.quantity - 1);
                            }}
                            className="w-6 h-6 flex items-center justify-center text-stone-700 hover:text-stone-900"
                          >
                            <Minus size={12} />
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
                            className="w-6 h-6 flex items-center justify-center text-stone-700 hover:text-stone-900"
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
                          className="text-[10px] text-stone-400 hover:text-red-700 flex items-center gap-0.5"
                        >
                          <Trash2 size={11} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Celebration 1-Click Upsells */}
              <div className="p-4 bg-amber-50/70 rounded-3xl border border-amber-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                    <span className="text-xs font-bold text-amber-950">
                      Celebration Add-ons
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-100/80 px-2 py-0.5 rounded-full">
                    1-Click Add
                  </span>
                </div>

                <div className="space-y-2">
                  {CELEBRATION_ADDONS.map((addon) => {
                    const alreadyInCart = items.some((i) => i.productId === addon.productId);
                    return (
                      <div
                        key={addon.productId}
                        className="flex items-center justify-between p-2.5 bg-white rounded-2xl border border-amber-100 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={addon.image}
                            alt={addon.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-100"
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
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
                            alreadyInCart
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-amber-950 hover:bg-black text-white shadow-xs cursor-pointer"
                          }`}
                        >
                          {alreadyInCart ? "✓ Added" : `+ ₹${addon.price}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bill Details & Order Placement */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  Bill Summary
                </span>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Items Subtotal</span>
                    <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <span>
                      {fulfilmentType === "pickup"
                        ? `Store Pickup (${selectedBranch.shortName})`
                        : `Delivery (${deliveryDistanceKm} km)`}
                    </span>
                    <span className="font-medium">
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-stone-900 font-bold text-base pt-2.5 border-t border-stone-200">
                    <span>Total Amount</span>
                    <span className="text-amber-900 font-serif text-lg">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="w-full h-12 bg-amber-950 hover:bg-black text-white font-semibold text-xs tracking-wider uppercase rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
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

                  <p className="text-[10px] text-stone-400 text-center leading-tight">
                    Instant UPI QR Code generated upon order submission • Verified by kitchen team
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ToastProvider>
      <CartProvider>
        <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center font-serif text-amber-900">Loading Checkout...</div>}>
          <CheckoutContent />
        </Suspense>
      </CartProvider>
    </ToastProvider>
  );
}
