"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/ui/Toast";
import {
  Cake,
  Calendar,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Heart,
  Clock,
  Layers,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { createQuotation } from "@/lib/quotations/quotation-store";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import Link from "next/link";

const OCCASIONS = [
  { id: "wedding", label: "Wedding Gateau", icon: "💍" },
  { id: "birthday", label: "Milestone Birthday", icon: "🎂" },
  { id: "baby_shower", label: "Baby Shower / 1st B'day", icon: "🧸" },
  { id: "anniversary", label: "Anniversary Celebration", icon: "🥂" },
  { id: "corporate", label: "Corporate Hampers & Gifting", icon: "🎁" },
  { id: "custom_theme", label: "Custom Theme / Sculpted Cake", icon: "✨" },
];

const WEIGHT_OPTIONS = [
  { label: "1.5 KG (10 - 15 Servings)", value: "1.5 KG" },
  { label: "2.0 - 3.0 KG (20 - 30 Servings)", value: "2.5 KG" },
  { label: "4.0 - 5.0 KG (40 - 50 Servings / 2 Tiers)", value: "4.5 KG" },
  { label: "6.0+ KG (60+ Servings / 3+ Tiers)", value: "6.0 KG" },
  { label: "Bulk Individual Hampers (25+ Boxes)", value: "Bulk Boxes" },
];

const SIGNATURE_FLAVOURS = [
  "Belgian Dark Chocolate Truffle (54% Callebaut)",
  "Hazelnut Praline & Gianduja Mousse",
  "Lotus Biscoff & Salted Butter Caramel",
  "Madagascar Bourbon Vanilla & Raspberry Compote",
  "Classic Red Velvet with Philadelphia Cream Cheese",
  "Pistachio Rose & White Chocolate",
  "Espresso Mocha & Roasted Almond Crumb",
];

function QuoteRequestContent() {
  const [occasion, setOccasion] = useState("Wedding Gateau");
  const [eventDate, setEventDate] = useState("");
  const [weightOption, setWeightOption] = useState("2.5 KG");
  const [selectedFlavour, setSelectedFlavour] = useState(SIGNATURE_FLAVOURS[0]);
  const [isEggless, setIsEggless] = useState(true);
  const [eventVenue, setEventVenue] = useState("");
  const [designNotes, setDesignNotes] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [submittedQuote, setSubmittedQuote] = useState<{
    quoteNumber: string;
    customerName: string;
    whatsappUrl: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerMobile.trim()) {
      toast.error("Please enter your name and contact mobile number");
      return;
    }
    if (!eventDate) {
      toast.error("Please select your anticipated celebration date");
      return;
    }

    setIsSubmitting(true);

    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const validUntilDate = new Date();
      validUntilDate.setDate(validUntilDate.getDate() + 14);
      const validUntilStr = validUntilDate.toISOString().split("T")[0];

      // Estimated rate based on weight
      let estPrice = 3200;
      if (weightOption.includes("4.5")) estPrice = 6500;
      if (weightOption.includes("6.0")) estPrice = 13500;
      if (weightOption.includes("Bulk")) estPrice = 18000;

      const newQuote = createQuotation({
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        customerEmail: customerEmail.trim() || undefined,
        occasion,
        eventDate,
        eventVenue: eventVenue.trim() || "Nungambakkam Studio Counter Pickup",
        validUntil: validUntilStr,
        date: todayStr,
        items: [
          {
            id: `req-item-${Date.now()}`,
            name: `${occasion} - ${weightOption}`,
            description: `Flavour: ${selectedFlavour}. Notes: ${designNotes || "Artisanal customization requested by client."}`,
            flavour: selectedFlavour,
            weightKg: weightOption,
            quantity: 1,
            unitPrice: estPrice,
            totalPrice: estPrice,
            isEggless,
            category: "Customer Quotation Inquiry",
          },
        ],
        subtotal: estPrice,
        includeGst: true,
        gstRate: 5,
        tax: Math.round(estPrice * 0.05),
        deliveryFee: 150,
        setupFee: 0,
        discount: 0,
        grandTotal: Math.round(estPrice * 1.05 + 150),
        advanceRequiredPercentage: 50,
        advanceAmount: Math.round((estPrice * 1.05 + 150) * 0.5),
        status: "DRAFT",
        specialInstructions: designNotes.trim() || "Customer requested online quote estimate.",
      });

      // WhatsApp link directly to Chief Pastry Chef
      const cleanPhone = customerMobile.replace(/[^0-9]/g, "");
      const msg = `Hi Chef Selva, I have submitted an online quotation request on Kichees website!
      
Ref: *${newQuote.quotationNumber}*
Name: *${customerName}*
Occasion: *${occasion}*
Date: *${eventDate}*
Weight: *${weightOption}*
Flavour: *${selectedFlavour}* (${isEggless ? "100% Eggless" : "Standard"})
Venue: *${eventVenue || "Chennai"}*

Looking forward to your bespoke design proposal and quotation!`;

      const whatsappUrl = `https://wa.me/919840823145?text=${encodeURIComponent(msg)}`;

      setSubmittedQuote({
        quoteNumber: newQuote.quotationNumber,
        customerName: customerName.trim(),
        whatsappUrl,
      });

      // Celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#78350F", "#C76D38", "#DDA752", "#FAF7F2"],
      });

      toast.success("Quotation inquiry submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while creating your quotation request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1F1714] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
        {submittedQuote ? (
          /* SUCCESS VIEW */
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-stone-200/80 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-9 w-9 text-amber-900" />
            </div>

            <div className="space-y-2">
              <Badge className="bg-amber-900/10 text-amber-900 border-0 font-semibold px-3 py-1">
                Quotation Ref #{submittedQuote.quoteNumber}
              </Badge>
              <h1 className="text-3xl font-serif font-bold text-stone-900">
                Thank You, {submittedQuote.customerName}!
              </h1>
              <p className="text-sm text-stone-600 leading-relaxed">
                Your bespoke celebration request has been logged in our baking studio. Chef Selva and our confectionery team are reviewing your design details.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 text-left space-y-2 text-xs text-stone-700">
              <div className="font-semibold text-stone-900 text-sm">What happens next?</div>
              <p>• Our kitchen checks baking capacity and ingredient availability for {eventDate}.</p>
              <p>• We prepare an itemized PDF quotation with structural tier sketch and delivery logistics.</p>
              <p>• You can chat directly with our chef on WhatsApp right now to share reference photos.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={submittedQuote.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary w-full justify-center gap-2 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Chat with Chef on WhatsApp</span>
              </a>

              <Link
                href="/shop"
                className="btn-secondary w-full justify-center py-3.5 rounded-xl text-center"
              >
                Browse Standard Menu
              </Link>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <div className="space-y-10">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 bg-amber-900/10 text-amber-900 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                <Sparkles className="h-3.5 w-3.5 text-amber-800" />
                <span>Bespoke Gateaux & Bulk Gifting</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-stone-900">
                Request an Artisanal Cake Quotation
              </h1>
              <p className="text-base text-stone-600">
                Tell us about your celebration in Chennai. Chef Selva will craft a tailored estimate with tier options, flavor pairings, and scheduled delivery.
              </p>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-stone-200/90 space-y-8">
              {/* Step 1: Occasion */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  1. Select Celebration Occasion *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => setOccasion(occ.label)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all text-left ${
                        occasion === occ.label
                          ? "bg-amber-900/10 border-amber-900 text-amber-950 shadow-xs"
                          : "border-stone-200 bg-stone-50/50 hover:bg-stone-100 text-stone-700"
                      }`}
                    >
                      <span className="text-lg">{occ.icon}</span>
                      <span>{occ.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Date & Logistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                    2. Event / Delivery Date *
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="bg-stone-50/60 border-stone-200 text-sm py-2.5 rounded-xl"
                    />
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Custom tiered cakes require at least 48–72 hours notice.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                    Venue or Delivery Neighborhood
                  </label>
                  <Input
                    value={eventVenue}
                    onChange={(e) => setEventVenue(e.target.value)}
                    placeholder="e.g. MRC Nagar, Alwarpet, Nungambakkam, or Counter Pickup"
                    className="bg-stone-50/60 border-stone-200 text-sm py-2.5 rounded-xl"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    We deliver across Chennai via temperature-controlled vans.
                  </span>
                </div>
              </div>

              {/* Step 3: Size & Tiers */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  3. Approximate Weight / Guest Count *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {WEIGHT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setWeightOption(opt.value)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        weightOption === opt.value
                          ? "bg-amber-900 text-white border-amber-900 shadow-sm"
                          : "border-stone-200 bg-stone-50/50 hover:bg-stone-100 text-stone-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Flavor & Dietary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-end">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                    4. Preferred Flavor Palette
                  </label>
                  <select
                    value={selectedFlavour}
                    onChange={(e) => setSelectedFlavour(e.target.value)}
                    className="w-full border border-stone-200 bg-stone-50/60 rounded-xl px-3.5 py-2.5 text-sm font-medium text-stone-900 outline-none"
                  >
                    {SIGNATURE_FLAVOURS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                    Dietary Requirement
                  </label>
                  <div className="flex items-center gap-2 p-2 border border-stone-200 rounded-xl bg-stone-50/60">
                    <button
                      type="button"
                      onClick={() => setIsEggless(true)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isEggless
                          ? "bg-emerald-700 text-white shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      100% Eggless
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEggless(false)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        !isEggless
                          ? "bg-amber-900 text-white shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      Standard (Egg)
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 5: Design Vision */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                  5. Design Vision & Custom Inscription
                </label>
                <textarea
                  rows={3}
                  value={designNotes}
                  onChange={(e) => setDesignNotes(e.target.value)}
                  placeholder="Describe your color theme, wafer paper flowers, gold leaf, message on cake, or any Pinterest reference ideas..."
                  className="w-full border border-stone-200 bg-stone-50/60 rounded-xl p-3.5 text-sm text-stone-900 outline-none"
                />
              </div>

              {/* Step 6: Customer Info */}
              <div className="border-t border-stone-200 pt-6 space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  6. Your Contact Information
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-stone-700 block mb-1">
                      Full Name *
                    </label>
                    <Input
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Radhika Menon"
                      className="bg-stone-50/60 border-stone-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-700 block mb-1">
                      WhatsApp Mobile Number *
                    </label>
                    <Input
                      required
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      placeholder="+91 98401 23456"
                      className="bg-stone-50/60 border-stone-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-700 block mb-1">
                      Email Address (Optional)
                    </label>
                    <Input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="radhika@gmail.com"
                      className="bg-stone-50/60 border-stone-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-900 hover:bg-amber-800 text-white font-bold py-6 rounded-2xl text-base shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>{isSubmitting ? "Submitting Inquiry..." : "Submit Quotation Request"}</span>
                </Button>
                <p className="text-center text-xs text-stone-500 mt-2">
                  No advance payment needed right now. We review your request and reply within 2 business hours.
                </p>
              </div>
            </form>

            {/* Trust Points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-center">
              <div className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs space-y-1.5">
                <div className="w-9 h-9 bg-amber-100 text-amber-900 rounded-xl flex items-center justify-center mx-auto">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-stone-900">100% Pure Butter & Callebaut</h3>
                <p className="text-xs text-stone-500">
                  Zero artificial substitutes, zero premixes. Only French butter and Belgian chocolate.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs space-y-1.5">
                <div className="w-9 h-9 bg-amber-100 text-amber-900 rounded-xl flex items-center justify-center mx-auto">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-stone-900">Precision Van Logistics</h3>
                <p className="text-xs text-stone-500">
                  Dedicated temperature-controlled air-conditioned transport across Chennai.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs space-y-1.5">
                <div className="w-9 h-9 bg-amber-100 text-amber-900 rounded-xl flex items-center justify-center mx-auto">
                  <Cake className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-stone-900">Chef Venue Assembly</h3>
                <p className="text-xs text-stone-500">
                  Pastry chefs attend on-site to dowel, stack, and dress 3+ tier celebration cakes.
                </p>
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

export default function QuoteRequestPage() {
  return (
    <ToastProvider>
      <CartProvider>
        <QuoteRequestContent />
      </CartProvider>
    </ToastProvider>
  );
}
