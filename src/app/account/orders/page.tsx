"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  MapPin,
  QrCode,
  ArrowRight,
  Phone,
  MessageCircle,
  RefreshCw,
  LogOut,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHENNAI_BRANCHES } from "@/lib/config/branches";
import { getOrders, OrderItem } from "@/lib/orders/order-store";
import { OTPInput, SlotProps } from "input-otp";

function OtpSlot(props: SlotProps) {
  return (
    <div
      className={`relative w-10 sm:w-12 h-12 sm:h-14 text-lg font-bold flex items-center justify-center border rounded-xl transition-all font-mono ${
        props.isActive
          ? "border-emerald-600 ring-2 ring-emerald-500/20 bg-white text-stone-900 shadow-sm"
          : "border-stone-300 bg-stone-50/80 text-stone-800"
      }`}
    >
      {props.char !== null ? props.char : ""}
      {props.hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-0.5 h-6 bg-emerald-600 animate-pulse" />
        </div>
      )}
    </div>
  );
}

export default function CustomerOrdersPage() {
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Login Form State
  const [inputPhone, setInputPhone] = useState("");
  const [inputName, setInputName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all");

  // Check saved session on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem("kichees_customer_phone");
    const savedName = localStorage.getItem("kichees_customer_name");

    if (savedPhone) {
      setCustomerPhone(savedPhone);
      setCustomerName(savedName || "Valued Guest");
      setIsAuthenticated(true);
      fetchCustomerOrders(savedPhone);
    }
  }, []);

  const fetchCustomerOrders = async (phone: string) => {
    setFetchingOrders(true);
    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();

      let remoteOrders: any[] = data.orders || [];

      // Also merge with local mock store matching customer phone
      const localStore = getOrders();
      const cleanPhoneDigits = phone.replace(/\D/g, "").slice(-10);
      const matchingLocal = localStore.filter((o) =>
        o.customerMobile.replace(/\D/g, "").includes(cleanPhoneDigits)
      );

      // Deduplicate by order number
      const existingNumbers = new Set(remoteOrders.map((o) => o.order_number || o.orderNumber));
      const combined = [...remoteOrders];

      matchingLocal.forEach((loc) => {
        if (!existingNumbers.has(loc.orderNumber)) {
          combined.push({
            id: loc.id,
            order_number: loc.orderNumber,
            customer_name: loc.customerName,
            customer_mobile: loc.customerMobile,
            total: loc.total,
            payment_status: loc.paymentStatus,
            order_status: loc.orderStatus,
            fulfilment_type: loc.fulfilmentType,
            delivery_address: loc.fulfilmentType === "DELIVERY" ? "Chennai Address" : undefined,
            branch_id: loc.fulfilmentType === "PICKUP" ? "nungambakkam" : undefined,
            branch_name: loc.fulfilmentType === "PICKUP" ? "Casablanca Studio (Nungambakkam)" : undefined,
            items: loc.items,
            created_at: loc.createdAt || new Date().toISOString(),
          });
        }
      });

      // Sort newest first
      combined.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

      setOrders(combined);
    } catch (err) {
      console.error("Failed to load customer orders:", err);
    } finally {
      setFetchingOrders(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPhone || inputPhone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit WhatsApp phone number.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/whatsapp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: inputPhone, name: inputName }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send verification code.");
      } else {
        setOtpSent(true);
        setSuccessMsg(
          "Verification code sent to your WhatsApp! (Check the chat from Kichee's Baked Delights)"
        );
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP code received on WhatsApp.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/whatsapp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: inputPhone, otp: otp.trim(), name: inputName }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid verification code.");
      } else {
        const phone = data.user.phone;
        const name = data.user.name;

        localStorage.setItem("kichees_customer_phone", phone);
        localStorage.setItem("kichees_customer_name", name);

        setCustomerPhone(phone);
        setCustomerName(name);
        setIsAuthenticated(true);
        fetchCustomerOrders(phone);
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("kichees_customer_phone");
    localStorage.removeItem("kichees_customer_name");
    setIsAuthenticated(false);
    setOrders([]);
    setOtpSent(false);
    setOtp("");
    setInputPhone("");
  };

  const handleCopyUpi = (upiId: string) => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const filteredOrders = orders.filter((ord) => {
    const status = ord.order_status || ord.orderStatus;
    if (activeTab === "active") {
      return status !== "COMPLETED" && status !== "CANCELLED";
    }
    if (activeTab === "completed") {
      return status === "COMPLETED";
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#faf7f2] text-stone-900 pb-20">
      {/* Brand Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="https://kicheesbakeddelights.com/wp-content/uploads/2025/02/kichees-baked-delights-bakery-logo.png"
              alt="Kichee's"
              className="h-10 w-auto object-contain"
            />
            <span className="font-serif font-bold text-stone-800 tracking-tight text-lg hidden sm:inline">
              Guest Portal
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Order Cake</span>
            </Link>

            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-xs text-stone-500 hover:text-red-700 h-8 px-2 flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {!isAuthenticated ? (
          /* ========================================================== */
          /* Login with WhatsApp Screen */
          /* ========================================================== */
          <div className="max-w-md mx-auto mt-6">
            <div className="text-center mb-8">
              <div className="inline-flex p-3 rounded-full bg-emerald-100/70 text-emerald-800 mb-3 shadow-xs">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-stone-900">
                View Past Orders & Track Bakes
              </h1>
              <p className="text-xs text-stone-500 mt-1.5 max-w-sm mx-auto">
                Sign in with your WhatsApp number to view past invoices, collection details, and real-time kitchen progress.
              </p>
            </div>

            <Card className="border-stone-200/80 shadow-lg bg-white rounded-2xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-amber-600 to-amber-800" />
              <CardContent className="p-6">
                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700">
                        Your Name (Optional)
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter your name"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        className="h-11 text-xs border-stone-200"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700">
                        WhatsApp Mobile Number
                      </label>
                      <div className="flex gap-2">
                        <div className="flex items-center px-3 bg-stone-100 border border-stone-200 rounded-lg text-xs font-medium text-stone-600">
                          🇮🇳 +91
                        </div>
                        <Input
                          type="tel"
                          required
                          placeholder="98846 31078"
                          value={inputPhone}
                          onChange={(e) => setInputPhone(e.target.value)}
                          className="h-11 text-xs border-stone-200"
                          disabled={loading}
                        />
                      </div>
                      <p className="text-[11px] text-stone-400">
                        We send an instant 6-digit verification code directly to your WhatsApp.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold uppercase tracking-wider shadow-sm mt-3 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span>Connecting via Evolution API...</span>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4" />
                          <span>Send Code via WhatsApp</span>
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-stone-800">Phone: </span>
                        <span>+91 {inputPhone.replace(/\D/g, "").slice(-10)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                        }}
                        className="text-xs text-amber-800 font-semibold hover:underline"
                      >
                        Change
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-stone-700 block text-center">
                        Enter 6-Digit WhatsApp Code
                      </label>
                      <div className="flex justify-center py-2">
                        <OTPInput
                          maxLength={6}
                          value={otp}
                          onChange={setOtp}
                          autoFocus
                          disabled={loading}
                          containerClassName="group flex items-center justify-center gap-1.5 sm:gap-2"
                          render={({ slots }) => (
                            <>
                              <div className="flex gap-1.5 sm:gap-2">
                                {slots.slice(0, 3).map((slot, idx) => (
                                  <OtpSlot key={idx} {...slot} />
                                ))}
                              </div>
                              <div className="text-stone-400 font-bold px-0.5 sm:px-1">–</div>
                              <div className="flex gap-1.5 sm:gap-2">
                                {slots.slice(3, 6).map((slot, idx) => (
                                  <OtpSlot key={idx} {...slot} />
                                ))}
                              </div>
                            </>
                          )}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-amber-900 hover:bg-amber-950 text-white text-xs font-semibold uppercase tracking-wider shadow-sm mt-2 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span>Verifying...</span>
                      ) : (
                        <>
                          <span>Verify & View Past Orders</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="text-xs text-stone-500 hover:text-stone-800 underline"
                      >
                        Didn't receive code? Resend via WhatsApp
                      </button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            <div className="mt-8 text-center text-xs text-stone-400">
              <p>Kichee's Baked Delights • Casablanca Studio, Nungambakkam</p>
              <p className="mt-1">For urgent queries, call +91 98846 31078</p>
            </div>
          </div>
        ) : (
          /* ========================================================== */
          /* Logged In Customer Orders View */
          /* ========================================================== */
          <div className="space-y-6">
            {/* Customer Greeting Banner */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-amber-800">
                    Welcome Back
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                    Verified WhatsApp Account
                  </Badge>
                </div>
                <h1 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                  {customerName}
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Mobile: +91 {customerPhone.slice(-10)} • Showing all recorded orders
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchCustomerOrders(customerPhone)}
                  disabled={fetchingOrders}
                  className="h-9 text-xs border-stone-200 hover:bg-stone-50 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${fetchingOrders ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </Button>
                <Link href="/shop">
                  <Button
                    size="sm"
                    className="h-9 text-xs font-semibold bg-amber-900 hover:bg-amber-950 text-white"
                  >
                    <span>New Order</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === "all"
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab("active")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === "active"
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                In Kitchen / Active (
                {
                  orders.filter(
                    (o) =>
                      (o.order_status || o.orderStatus) !== "COMPLETED" &&
                      (o.order_status || o.orderStatus) !== "CANCELLED"
                  ).length
                }
                )
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === "completed"
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                Completed (
                {
                  orders.filter(
                    (o) => (o.order_status || o.orderStatus) === "COMPLETED"
                  ).length
                }
                )
              </button>
            </div>

            {/* Orders Feed */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
                <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-stone-800 text-base">
                  No orders found
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  You haven't placed any bakes under this phone number yet. Order freshly handcrafted Belgian chocolate truffle or bespoke cakes!
                </p>
                <Link href="/shop" className="inline-block mt-4">
                  <Button className="h-9 text-xs bg-amber-900 hover:bg-amber-950 text-white">
                    Explore Cake Studio
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredOrders.map((ord) => {
                  const orderNum = ord.order_number || ord.orderNumber;
                  const total = ord.total;
                  const isPaid = ord.payment_status === "PAID" || ord.paymentStatus === "PAID";
                  const status = ord.order_status || ord.orderStatus || "CONFIRMED";
                  const isPickup = (ord.fulfilment_type || ord.fulfilmentType) === "PICKUP";

                  // Find branch matching order
                  const branch =
                    CHENNAI_BRANCHES.find(
                      (b) => b.id === (ord.branch_id || ord.branchId)
                    ) || CHENNAI_BRANCHES[0];

                  const upiId = "kichees@upi";
                  const upiLink = `upi://pay?pa=${upiId}&pn=Kichees%20Baked%20Delights&am=${total}&cu=INR&tn=Order%20${orderNum}`;
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                    upiLink
                  )}&color=451a03&bgcolor=ffffff`;

                  return (
                    <Card
                      key={ord.id || orderNum}
                      className="border-stone-200/90 shadow-sm bg-white rounded-2xl overflow-hidden"
                    >
                      {/* Order Card Header */}
                      <div className="p-4 sm:p-5 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0">
                            🎂
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-stone-900">
                                #{orderNum}
                              </span>
                              <Badge
                                className={
                                  isPaid
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]"
                                    : "bg-amber-100 text-amber-900 border-amber-200 text-[10px]"
                                }
                              >
                                {isPaid ? "✓ Paid" : "⏳ Payment Verification Pending"}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-stone-400 mt-0.5">
                              Placed on:{" "}
                              {ord.created_at
                                ? new Date(ord.created_at).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Recent Order"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                          <span className="text-xs text-stone-500">Total Amount</span>
                          <span className="text-base font-bold text-stone-900">
                            ₹{Number(total).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Status Progress Bar */}
                      <div className="px-5 py-3 bg-amber-50/40 border-b border-stone-100">
                        <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                            <span>Current Stage:</span>
                            <span className="text-amber-950 font-bold uppercase tracking-wider">
                              {status.replace(/_/g, " ")}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-500">
                            {status === "COMPLETED"
                              ? "Order Fulfilled"
                              : "Chef Selva & Anbu's Station"}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <CardContent className="p-5 space-y-4">
                        {/* Fulfillment Section */}
                        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
                          {isPickup ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                                  <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                                  <span>Self-Collection / Counter Pickup</span>
                                </div>
                                <span className="text-[11px] text-stone-500 font-medium">
                                  {branch.timings}
                                </span>
                              </div>
                              <p className="font-bold text-stone-900 pl-5">
                                {branch.name}
                              </p>
                              <p className="text-stone-600 pl-5 text-[11px] leading-relaxed">
                                {branch.address}
                              </p>
                              <div className="pl-5 pt-1">
                                <a
                                  href={branch.mapLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 underline"
                                >
                                  <span>Open in Google Maps</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                                <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                                <span>Home Delivery across Chennai</span>
                              </div>
                              <p className="text-stone-800 pl-5">
                                <span className="font-semibold">Delivery Address: </span>
                                {ord.delivery_address || ord.deliveryAddress || "Address provided at booking"}
                              </p>
                              {ord.delivery_distance_km && (
                                <p className="text-stone-500 pl-5 text-[11px]">
                                  Distance: {ord.delivery_distance_km} km from central bakery
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Items List */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                            Ordered Confectionery
                          </h4>
                          <div className="divide-y divide-stone-100 border border-stone-100 rounded-xl overflow-hidden bg-white">
                            {(ord.items || []).map((item: any, idx: number) => {
                              const title =
                                typeof item === "string"
                                  ? item
                                  : `${item.quantity || 1}x ${item.name} ${
                                      item.variantLabel ? `(${item.variantLabel})` : ""
                                    }`;
                              return (
                                <div
                                  key={idx}
                                  className="p-3 text-xs flex justify-between items-center"
                                >
                                  <span className="font-medium text-stone-800">{title}</span>
                                  {typeof item === "object" && item.price && (
                                    <span className="font-bold text-stone-900">
                                      ₹{(item.price * (item.quantity || 1)).toLocaleString("en-IN")}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* UPI Payment Box if NOT PAID */}
                        {!isPaid && (
                          <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                              {/* QR Code */}
                              <div className="bg-white p-2 rounded-xl shadow-xs border border-amber-200 shrink-0 text-center">
                                <img
                                  src={qrUrl}
                                  alt="Scan to pay UPI"
                                  width={130}
                                  height={130}
                                  className="mx-auto"
                                />
                                <span className="text-[10px] font-bold text-amber-900 block mt-1">
                                  Scan via GPay / PhonePe
                                </span>
                              </div>

                              {/* Instructions & Actions */}
                              <div className="space-y-2 text-xs text-stone-700 flex-1">
                                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                                  <QrCode className="w-4 h-4 text-amber-800" />
                                  <span>Pay ₹{Number(total).toLocaleString("en-IN")} via UPI</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <code className="bg-white px-2.5 py-1 rounded border border-amber-200 font-mono text-[11px] text-amber-950 font-bold">
                                    {upiId}
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCopyUpi(upiId)}
                                    className="h-7 text-[11px] border-amber-300 hover:bg-amber-100 flex items-center gap-1"
                                  >
                                    {copiedUpi ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span>Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>Copy UPI ID</span>
                                      </>
                                    )}
                                  </Button>
                                </div>

                                <p className="text-[11px] text-stone-500 leading-relaxed">
                                  After completing the payment on your UPI app, please reply with your payment screenshot on WhatsApp. Our manager will confirm and push your bake to the kitchen!
                                </p>

                                <div className="pt-1 flex flex-wrap gap-2">
                                  <a
                                    href={`https://wa.me/919884631078?text=${encodeURIComponent(
                                      `Hi Kichees! Here is the payment screenshot for Order #${orderNum} (₹${total}). Please verify and push to kitchen.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button
                                      size="sm"
                                      className="h-8 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      <span>Send Screenshot on WhatsApp</span>
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
