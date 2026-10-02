"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider, useCart } from "@/context/CartContext";
import { ToastProvider } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { triggerHaptic } from "@/lib/utils/haptics";

function CartPageContent() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, deliveryFee, total } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900">
                Your Order Basket
              </h1>
              <p className="text-xs text-stone-500">
                Review your handcrafted bakes before proceeding to checkout
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-stone-500">
              {items.reduce((acc, i) => acc + i.quantity, 0)} {items.reduce((acc, i) => acc + i.quantity, 0) === 1 ? "Item" : "Items"}
            </span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-4 my-8">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
              <ShoppingBag size={32} />
            </div>
            <h2 className="font-serif font-bold text-stone-900 text-xl">
              Your basket is empty
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              Explore our Belgian truffle cakes, artisanal gateaux, and molten brownies.
            </p>
            <Link href="/shop" className="inline-block pt-2">
              <Button className="h-11 px-8 bg-amber-950 hover:bg-black text-white text-xs font-semibold rounded-xl">
                Browse Bakery Menu
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Items Column (7 cols) */}
            <div className="md:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Basket Items
                </span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("warning");
                    clearCart();
                  }}
                  className="text-xs text-stone-400 hover:text-red-700 font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4 pb-4 border-b border-stone-100 last:border-b-0 last:pb-0 items-center">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/70">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-stone-900 truncate">{item.name}</p>
                      <p className="text-xs text-stone-500">
                        {item.variantLabel} {item.isEggless && "• Eggless"}
                      </p>
                      {item.customMessage && (
                        <p className="text-[11px] text-amber-900 italic mt-0.5">
                          &quot;{item.customMessage}&quot;
                        </p>
                      )}
                      <p className="text-sm font-bold text-amber-900 mt-1">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="inline-flex items-center border border-stone-200 rounded-full px-2 py-0.5 bg-stone-50">
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
                        <span className="text-xs font-bold px-2 text-stone-900">{item.quantity}</span>
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
                        className="text-[11px] text-stone-400 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Column (5 cols) */}
            <div className="md:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4 sticky top-24">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Summary
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery Estimate</span>
                  <span className="font-medium">{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-stone-900 font-bold text-base pt-3 border-t border-stone-200">
                  <span>Total</span>
                  <span className="text-amber-900 font-serif text-xl">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/checkout" className="block w-full">
                  <Button className="w-full h-12 bg-amber-950 hover:bg-black text-white font-semibold text-xs tracking-wider uppercase rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/70 text-[11px] text-stone-600 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                <span>100% Pure Butter & Eggless • Chilled 4°C Van Delivery across Chennai</span>
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

export default function CartPage() {
  return (
    <ToastProvider>
      <CartProvider>
        <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center font-serif text-amber-900">Loading Cart...</div>}>
          <CartPageContent />
        </Suspense>
      </CartProvider>
    </ToastProvider>
  );
}
