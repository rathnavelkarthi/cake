"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Cake,
  Calendar,
  Clock,
  MapPin,
  Truck,
  CheckCircle2,
  ChefHat,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Phone,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  subscribeOrders,
  OrderItem,
} from "@/lib/orders/order-store";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const customerEmail = "customer@kichees.com";
  const customerName = "Priya Sundaram";

  useEffect(() => {
    return subscribeOrders((allOrders) => {
      // Filter orders belonging to demo customer or display all relevant customer orders
      setOrders(allOrders);
    });
  }, []);

  const activeOrders = orders.filter(
    (o) => o.orderStatus !== "COMPLETED" && o.orderStatus !== "CANCELLED"
  );
  const pastOrders = orders.filter(
    (o) => o.orderStatus === "COMPLETED" || o.orderStatus === "CANCELLED"
  );

  const getTimelineStep = (status: OrderItem["orderStatus"]) => {
    switch (status) {
      case "PENDING_PAYMENT":
      case "CONFIRMED":
        return 1;
      case "IN_OVEN":
        return 2;
      case "COOLING":
      case "DECORATING":
      case "PREPARING":
        return 3;
      case "READY":
      case "READY_FOR_PICKUP":
      case "OUT_FOR_DELIVERY":
      case "COMPLETED":
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-20">
      {/* Top Banner / Navigation */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur-md px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 hover:text-amber-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Bakery Storefront</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/#custom-studio"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Custom Cake Studio</span>
            </Link>

            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-900 px-2 py-1"
            >
              <span>Staff Login</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-8">
        {/* Customer Profile Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-amber-950 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Cake className="h-4 w-4" />
              <span>Kichees Artisanal Patron</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif">
              Welcome back, {customerName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-lg">
              Track your custom cakes handcrafted live in our Nungambakkam kitchen by Head Chef Selva and Confectionery Artisan Anbu.
            </p>
          </div>

          <div className="absolute right-6 -bottom-6 opacity-10 pointer-events-none">
            <Cake className="w-48 h-48 text-white" />
          </div>
        </div>

        {/* Section 1: Active Orders with Live Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-stone-900">
                Active Kitchen Orders
              </h2>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-900 text-[11px] font-bold text-white">
                {activeOrders.length}
              </span>
            </div>
            <span className="text-xs text-stone-500">Live Kitchen Updates</span>
          </div>

          {activeOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-stone-800">
                No active orders at the moment
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Ready for a bespoke cake? Design your customized celebration cake with our head chef.
              </p>
              <Link
                href="/#custom-studio"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-900 hover:bg-amber-950 text-white px-4 py-2 rounded-full shadow-xs"
              >
                <span>Open Custom Cake Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {activeOrders.map((order) => {
                const step = getTimelineStep(order.orderStatus);

                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs space-y-5"
                  >
                    {/* Top Row: Order Number, Date & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-stone-900 font-mono">
                            {order.orderNumber}
                          </span>
                          {order.isInstantOrder && (
                            <Badge className="bg-amber-100 text-amber-900 border-amber-200 text-[10px] font-bold">
                              ⚡ Rush Kitchen Order
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                          <span>Placed: {order.date}</span>
                          <span>•</span>
                          <span className="font-medium text-stone-700">
                            Target Delivery: {order.deliveryDate} ({order.deliveryTimeSlot.split(" ")[0]})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-xs px-2.5 py-1 font-semibold ${
                            order.orderStatus === "READY" ||
                            order.orderStatus === "READY_FOR_PICKUP"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-amber-100 text-amber-900 border-amber-200"
                          }`}
                        >
                          {order.orderStatus.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>

                    {/* 4-Step Visual Kitchen Progress Bar */}
                    <div className="py-2">
                      <div className="grid grid-cols-4 gap-2 text-center relative">
                        {/* Connecting track line */}
                        <div className="absolute top-4 left-6 right-6 h-0.5 bg-stone-200 -z-0" />

                        {/* Step 1: Placed */}
                        <div className="relative z-10 flex flex-col items-center space-y-1.5">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                              step >= 1
                                ? "bg-amber-900 text-white ring-4 ring-amber-100"
                                : "bg-stone-200 text-stone-600"
                            }`}
                          >
                            ✓
                          </div>
                          <div className="text-[11px] font-bold text-stone-900">
                            Order Confirmed
                          </div>
                          <div className="text-[10px] text-stone-500 hidden sm:block">
                            Queue initiated
                          </div>
                        </div>

                        {/* Step 2: In Oven */}
                        <div className="relative z-10 flex flex-col items-center space-y-1.5">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                              step >= 2
                                ? "bg-amber-900 text-white ring-4 ring-amber-100"
                                : "bg-stone-200 text-stone-600"
                            }`}
                          >
                            <Flame className="h-4 w-4" />
                          </div>
                          <div className="text-[11px] font-bold text-stone-900">
                            In Oven / Baking
                          </div>
                          <div className="text-[10px] text-stone-500 hidden sm:block">
                            Head Chef Selva
                          </div>
                        </div>

                        {/* Step 3: Decorating */}
                        <div className="relative z-10 flex flex-col items-center space-y-1.5">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                              step >= 3
                                ? "bg-amber-900 text-white ring-4 ring-amber-100"
                                : "bg-stone-200 text-stone-600"
                            }`}
                          >
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div className="text-[11px] font-bold text-stone-900">
                            Decorating & Piping
                          </div>
                          <div className="text-[10px] text-stone-500 hidden sm:block">
                            Chef Anbu
                          </div>
                        </div>

                        {/* Step 4: Ready */}
                        <div className="relative z-10 flex flex-col items-center space-y-1.5">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                              step >= 4
                                ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                                : "bg-stone-200 text-stone-600"
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <div className="text-[11px] font-bold text-stone-900">
                            Ready for Dispatch
                          </div>
                          <div className="text-[10px] text-stone-500 hidden sm:block">
                            {order.fulfilmentType === "PICKUP" ? "At Counter" : "Out for delivery"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cake Specification Card */}
                    <div className="rounded-xl bg-stone-50/80 p-4 border border-stone-200/80 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-stone-900">
                            {order.flavour}
                          </span>
                          <span className="text-xs font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                            {order.weightKg}
                          </span>
                          {order.isEggless && (
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Eggless
                            </span>
                          )}
                        </div>

                        {order.cakeMessage && (
                          <div className="text-xs text-stone-700 italic">
                            Message: &ldquo;{order.cakeMessage}&rdquo;
                          </div>
                        )}

                        <div className="text-xs text-stone-500 flex items-center gap-3 pt-1">
                          <span className="flex items-center gap-1">
                            <Truck className="h-3 w-3 text-stone-400" />
                            {order.fulfilmentType}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <ChefHat className="h-3 w-3 text-stone-400" />
                            {order.assignedChef || "Chef Selva & Anbu"}
                          </span>
                        </div>
                      </div>

                      {order.referenceImage && (
                        <div className="flex items-center gap-2.5 bg-white p-2 rounded-lg border border-stone-200 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={order.referenceImage}
                            alt="Reference"
                            className="h-12 w-12 rounded object-cover border border-stone-100"
                          />
                          <div className="text-[11px]">
                            <div className="font-bold text-stone-800">
                              Design Reference
                            </div>
                            <div className="text-stone-500 max-w-[140px] truncate">
                              {order.referenceImageName || "Lookbook Reference"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Total & Quick Contact */}
                    <div className="flex items-center justify-between pt-2 text-xs">
                      <div>
                        <span className="text-stone-500">Total Paid: </span>
                        <span className="font-bold text-stone-900 text-sm">
                          ₹{order.total.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <a
                        href="https://wa.me/919840123456"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        <Phone className="h-3 w-3" />
                        <span>Bakery Kitchen WhatsApp Help</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Past Orders History */}
        {pastOrders.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <h2 className="text-lg font-bold text-stone-900">
              Past Orders & Receipts
            </h2>

            <div className="rounded-xl border border-stone-200 bg-white overflow-hidden divide-y divide-stone-100">
              {pastOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-stone-50/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-stone-900">
                        {order.orderNumber}
                      </span>
                      <Badge className="bg-stone-100 text-stone-700 text-[10px]">
                        {order.orderStatus}
                      </Badge>
                    </div>
                    <div className="text-xs font-semibold text-stone-800">
                      {order.flavour} ({order.weightKg})
                    </div>
                    <div className="text-[11px] text-stone-400">
                      Delivered: {order.deliveryDate}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs font-bold text-stone-900">
                        ₹{order.total.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-medium">
                        {order.paymentStatus}
                      </div>
                    </div>

                    <Link
                      href="/#custom-studio"
                      className="text-xs font-semibold text-amber-900 hover:text-amber-950 border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                    >
                      Reorder Cake
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
