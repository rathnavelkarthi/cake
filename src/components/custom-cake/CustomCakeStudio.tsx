"use client";

import React, { useState, useRef } from "react";
import {
  Sparkles,
  MessageCircle,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Eye,
  ShoppingBag,
  ArrowRight,
  Cake,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { trackEvent } from "@/lib/analytics/events";
import { triggerHaptic } from "@/lib/utils/haptics";
import { SAMPLE_CAKES, SampleCake } from "@/data/sample-cakes";
import { addInstantOrder } from "@/lib/orders/order-store";

const FLAVOURS = [
  "Belgian Dark Chocolate Truffle",
  "Mascarpone & Fresh Fig",
  "Roasted Hazelnut Praline",
  "Classic Red Velvet",
  "Alphonso Mango (Seasonal)",
];

const WEIGHTS = [
  { label: "1.0 kg", servings: "6 to 8 guests" },
  { label: "1.5 kg", servings: "10 to 12 guests" },
  { label: "2.0 kg", servings: "14 to 16 guests" },
  { label: "3.0 kg (Two Tier)", servings: "22 to 26 guests" },
];

const TIME_SLOTS = [
  "Morning (10:00 AM to 1:00 PM)",
  "Afternoon (1:00 PM to 5:00 PM)",
  "Evening (5:00 PM to 8:30 PM)",
];

const PIPING_CREAM_PALETTE = [
  { id: "dark-ganache", name: "Dark Ganache", color: "#28140B", textShadow: "0 1px 2px rgba(255,255,255,0.85)" },
  { id: "golden-caramel", name: "Salted Caramel", color: "#B85D1B", textShadow: "0 1px 2px rgba(255,255,255,0.8)" },
  { id: "ivory-cream", name: "Ivory Vanilla", color: "#5A3825", textShadow: "0 1px 2px rgba(255,255,255,0.9)" },
  { id: "ruby-berry", name: "Ruby Rose", color: "#881337", textShadow: "0 1px 2px rgba(255,255,255,0.75)" },
];

const CATEGORIES = [
  "All Styles",
  "Vintage & Lambeth",
  "Floral & Botanical",
  "Modern Ganache",
  "Tiered & Grand",
  "Festive & Themed",
];

export default function CustomCakeStudio() {
  const [selectedFlavour, setSelectedFlavour] = useState(FLAVOURS[0]);
  const [selectedWeight, setSelectedWeight] = useState(WEIGHTS[1]);
  const [selectedPipingColor, setSelectedPipingColor] = useState(PIPING_CREAM_PALETTE[0]);
  const [cakeMessage, setCakeMessage] = useState("Happy 30th Birthday Priya!");
  const [themeNotes, setThemeNotes] = useState("Minimalist botanical style with fresh flowers");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState(TIME_SLOTS[2]);
  const [isEggless, setIsEggless] = useState(true);
  const [previewPulse, setPreviewPulse] = useState(false);

  // Reference Image Management
  const [referenceMode, setReferenceMode] = useState<"lookbook" | "upload">("lookbook");
  const [selectedSample, setSelectedSample] = useState<SampleCake | null>(SAMPLE_CAKES[0]);
  const [selectedCategory, setSelectedCategory] = useState("All Styles");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);

  // Direct Order Submission State
  const [customerName, setCustomerName] = useState("Priya Sundaram");
  const [customerMobile, setCustomerMobile] = useState("+91 98401 23456");
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerPreviewPulse = () => {
    setPreviewPulse(true);
    setTimeout(() => setPreviewPulse(false), 200);
  };

  const handleFlavourChange = (flavour: string) => {
    triggerHaptic("selection");
    setSelectedFlavour(flavour);
    triggerPreviewPulse();
  };

  const handleWeightChange = (weight: typeof WEIGHTS[0]) => {
    triggerHaptic("selection");
    setSelectedWeight(weight);
    triggerPreviewPulse();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedImage(result);
      setReferenceMode("upload");
      triggerHaptic("success");
      triggerPreviewPulse();
    };
    reader.readAsDataURL(file);
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
    setUploadedFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    triggerHaptic("selection");
  };

  const activeReferenceImage =
    referenceMode === "upload" && uploadedImage
      ? uploadedImage
      : selectedSample?.image || "/custom-cakes/cake-1.jpg";

  const activeReferenceTitle =
    referenceMode === "upload" && uploadedImage
      ? `Uploaded Reference: ${uploadedFileName}`
      : selectedSample?.title || "Vintage Lambeth Caramel Swirl";

  const filteredSamples =
    selectedCategory === "All Styles"
      ? SAMPLE_CAKES
      : SAMPLE_CAKES.filter((c) => c.category === selectedCategory);

  const generateWhatsAppMessage = () => {
    triggerHaptic("success");
    trackEvent({
      name: "submit_custom_cake",
      flavour: selectedFlavour,
      weight: selectedWeight.label,
      date: preferredDate || "Not specified",
    });

    const refText =
      referenceMode === "upload" && uploadedImage
        ? `Customer Reference Photo: (Uploaded via website - ${uploadedFileName})`
        : `Selected Kichees Reference: ${selectedSample?.title || "Lookbook Reference"}`;

    const text = `Hi Kichees,

I'd like to enquire about a custom cake design.

Design Reference: ${refText}
Flavour: ${selectedFlavour} ${isEggless ? "(100% Eggless)" : "(Traditional)"}
Weight: ${selectedWeight.label} (${selectedWeight.servings})
Message on Cake: ${cakeMessage ? `"${cakeMessage}"` : "None"}
Piping Cream: ${selectedPipingColor.name}
Theme / Design Notes: ${themeNotes || "Standard decoration"}
Preferred Date: ${preferredDate || "To be discussed"}
Preferred Time Slot: ${preferredTime}

Please let me know the kitchen availability, feasibility, and price quote. Thank you!`;

    const url = `https://wa.me/${BUSINESS_CONFIG.whatsapp.replace("+", "")}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handlePlaceOrderDirect = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    triggerHaptic("success");

    try {
      const order = addInstantOrder({
        customerName: customerName.trim() || "Storefront Customer",
        customerMobile: customerMobile.trim() || "+91 98401 23456",
        fulfilmentType: "DELIVERY",
        deliveryDate: preferredDate || new Date().toISOString().split("T")[0],
        deliveryTimeSlot: preferredTime,
        flavour: selectedFlavour,
        weightKg: selectedWeight.label,
        isEggless,
        cakeMessage,
        referenceImage: activeReferenceImage,
        referenceImageName: activeReferenceTitle,
        assignedChef: "Anbu (Confectionery Chef)", // Default confectionery for bespoke cakes
        notes: `Custom studio order. Theme: ${themeNotes || "None"}`,
      });

      setOrderSuccess({ orderNumber: order.orderNumber });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="custom-studio"
      className="section-padding overflow-x-clip w-full max-w-full"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        minWidth: 0,
      }}
    >
      <div className="container min-w-0 max-w-full px-4 sm:px-6">
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 40px" }} className="px-2">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--accent-caramel)",
              marginBottom: "8px",
            }}
          >
            <Sparkles size={14} />
            <span>Bespoke Pastry Lab</span>
          </div>

          <h2
            className="font-serif"
            style={{
              fontSize: "clamp(26px, 4vw, 42px)",
              fontWeight: 700,
              color: "var(--accent-cocoa)",
              letterSpacing: "-0.02em",
              lineHeight: 1.18,
              marginBottom: "12px",
            }}
          >
            Custom Cake Studio
          </h2>

          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }} className="sm:text-base">
            Select an authentic reference style from our kitchen archives or upload your own inspiration.
            Your custom cake is directly routed to head chef <strong>Selva</strong> and confectionery specialist <strong>Anbu</strong>.
          </p>
        </div>

        {/* Success Modal Notification if placed directly */}
        {orderSuccess && (
          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto 36px auto",
              padding: "20px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "#F0FDF4",
              border: "1.5px solid #86EFAC",
              boxShadow: "0 8px 24px rgba(22, 163, 74, 0.12)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#22C55E",
                color: "#FFFFFF",
                marginBottom: "12px",
              }}
            >
              <CheckCircle2 size={28} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#166534", marginBottom: "6px" }}>
              Custom Cake Order Created!
            </h3>
            <p style={{ fontSize: "13px", color: "#15803D", marginBottom: "16px" }}>
              Ticket <strong>#{orderSuccess.orderNumber}</strong> has been transmitted live to Head Chef Selva and Confectionery Chef Anbu&apos;s kitchen display.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/account/orders"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 18px",
                  backgroundColor: "#15803D",
                  color: "#FFFFFF",
                  borderRadius: "var(--radius-full)",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <span>Track Live in My Orders</span>
                <ArrowRight size={15} />
              </Link>
              <button
                type="button"
                onClick={() => setOrderSuccess(null)}
                style={{
                  padding: "9px 16px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #BBF7D0",
                  color: "#166534",
                  borderRadius: "var(--radius-full)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Create Another Cake
              </button>
            </div>
          </div>
        )}

        {/* Studio Builder Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full min-w-0 max-w-full">
          {/* Left Column: Interactive Form Controls */}
          <div
            className="lg:col-span-7 col-span-1 w-full min-w-0 bg-[var(--bg-primary)] p-4 sm:p-7 md:p-8 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] box-border"
          >
            {/* Step 1: Reference Photo Selection & Upload */}
            <div style={{ marginBottom: "32px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--accent-cocoa)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  1. Cake Reference & Style:
                </label>

                {/* Switcher: Kichees Samples vs Customer Upload */}
                <div
                  style={{
                    display: "inline-flex",
                    backgroundColor: "var(--bg-surface)",
                    padding: "3px",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setReferenceMode("lookbook");
                      triggerHaptic("selection");
                    }}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "12px",
                      fontWeight: 600,
                      backgroundColor: referenceMode === "lookbook" ? "var(--accent-cocoa)" : "transparent",
                      color: referenceMode === "lookbook" ? "#FFFFFF" : "var(--text-secondary)",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 140ms ease",
                    }}
                  >
                    Kichees Archive
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReferenceMode("upload");
                      triggerHaptic("selection");
                    }}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "12px",
                      fontWeight: 600,
                      backgroundColor: referenceMode === "upload" ? "var(--accent-cocoa)" : "transparent",
                      color: referenceMode === "upload" ? "#FFFFFF" : "var(--text-secondary)",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 140ms ease",
                    }}
                  >
                    Upload Photo {uploadedImage ? "✓" : ""}
                  </button>
                </div>
              </div>

              {/* Mode A: Kichees Sample Lookbook */}
              {referenceMode === "lookbook" && (
                <div>
                  {/* Category Pills */}
                  <div
                    className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3 min-w-0"
                  >
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          triggerHaptic("selection");
                        }}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "var(--radius-full)",
                          fontSize: "11px",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          backgroundColor: selectedCategory === cat ? "var(--accent-caramel-subtle)" : "var(--bg-surface)",
                          color: selectedCategory === cat ? "var(--accent-cocoa)" : "var(--text-muted)",
                          border: selectedCategory === cat ? "1px solid var(--accent-caramel)" : "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Responsive Cake Thumbnail Cards */}
                  <div
                    className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1 min-w-0"
                  >
                    {filteredSamples.map((sample) => {
                      const isSelected = selectedSample?.id === sample.id;
                      return (
                        <div
                          key={sample.id}
                          onClick={() => {
                            setSelectedSample(sample);
                            triggerHaptic("selection");
                            triggerPreviewPulse();
                          }}
                          style={{
                            position: "relative",
                            borderRadius: "var(--radius-md)",
                            overflow: "hidden",
                            border: isSelected ? "2.5px solid var(--accent-caramel)" : "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            backgroundColor: "var(--bg-surface)",
                            boxShadow: isSelected ? "0 4px 12px rgba(199, 109, 56, 0.22)" : "none",
                            transition: "all 140ms ease",
                          }}
                        >
                          <div style={{ position: "relative", height: "95px", width: "100%", backgroundColor: "#F3EFEA" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={sample.image}
                              alt={sample.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            {isSelected && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "6px",
                                  right: "6px",
                                  backgroundColor: "var(--accent-caramel)",
                                  color: "#FFFFFF",
                                  borderRadius: "50%",
                                  width: "20px",
                                  height: "20px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Check size={12} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <div style={{ padding: "6px 8px" }}>
                            <div
                              style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "var(--text-primary)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {sample.title}
                            </div>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                              {sample.suggestedWeight}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedSample && (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "8px 12px",
                        backgroundColor: "var(--bg-surface)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        Selected: <strong style={{ color: "var(--accent-cocoa)" }}>{selectedSample.title}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewModalImage(selectedSample.image)}
                        style={{
                          fontSize: "11px",
                          color: "var(--accent-caramel)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          fontWeight: 600,
                        }}
                      >
                        <Eye size={12} /> View Full
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mode B: Upload Your Own Reference Image */}
              {referenceMode === "upload" && (
                <div
                  style={{
                    border: "2px dashed var(--border-medium)",
                    borderRadius: "var(--radius-lg)",
                    padding: "20px",
                    textAlign: "center",
                    backgroundColor: "var(--bg-surface)",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                    id="custom-cake-file-input"
                  />

                  {uploadedImage ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", textAlign: "left" }}>
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "var(--radius-md)",
                          overflow: "hidden",
                          flexShrink: 0,
                          border: "2px solid var(--accent-caramel)",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={uploadedImage}
                          alt="Uploaded reference"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-cocoa)" }}>
                          Custom Photo Attached
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            marginTop: "2px",
                          }}
                        >
                          {uploadedFileName}
                        </div>
                        <div style={{ marginTop: "6px", display: "flex", gap: "10px" }}>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "var(--accent-caramel)",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            Replace Image
                          </button>
                          <button
                            type="button"
                            onClick={clearUploadedImage}
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "#DC2626",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          backgroundColor: "var(--accent-caramel-subtle)",
                          color: "var(--accent-caramel)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "10px",
                        }}
                      >
                        <Upload size={20} />
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent-cocoa)" }}>
                        Upload Cake Photo from your device or Pinterest
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px", marginBottom: "12px" }}>
                        JPG, PNG, WebP up to 10MB
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          padding: "8px 18px",
                          borderRadius: "var(--radius-full)",
                          backgroundColor: "var(--accent-cocoa)",
                          color: "#FFFFFF",
                          fontSize: "12px",
                          fontWeight: 600,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Browse Files
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Flavour */}
            <div style={{ marginBottom: "28px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--accent-cocoa)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "12px",
                }}
              >
                2. Select Sponge & Flavour:
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {FLAVOURS.map((flavour) => {
                  const isSelected = selectedFlavour === flavour;
                  return (
                    <button
                      key={flavour}
                      type="button"
                      onClick={() => handleFlavourChange(flavour)}
                      className="pressable"
                      style={{
                        padding: "9px 16px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "13px",
                        fontWeight: 600,
                        backgroundColor: isSelected ? "var(--accent-cocoa)" : "var(--bg-surface)",
                        color: isSelected ? "#FFFFFF" : "var(--text-secondary)",
                        border: isSelected ? "1px solid var(--accent-cocoa)" : "1px solid var(--border-subtle)",
                        transition: "background-color 140ms var(--ease-out), color 140ms var(--ease-out)",
                      }}
                    >
                      {flavour}
                    </button>
                  );
                })}
              </div>

              {/* Eggless Option Checkbox */}
              <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="eggless-toggle"
                  checked={isEggless}
                  onChange={(e) => {
                    triggerHaptic("selection");
                    setIsEggless(e.target.checked);
                    triggerPreviewPulse();
                  }}
                  style={{ width: "16px", height: "16px", accentColor: "var(--accent-sage)" }}
                />
                <label htmlFor="eggless-toggle" style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer" }}>
                  Prepare as 100% Eggless (Dedicated Counter)
                </label>
              </div>
            </div>

            {/* Step 3: Weight & Servings */}
            <div style={{ marginBottom: "28px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--accent-cocoa)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "12px",
                }}
              >
                3. Weight & Expected Guests:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 min-w-0">
                {WEIGHTS.map((weight) => {
                  const isSelected = selectedWeight.label === weight.label;
                  return (
                    <button
                      key={weight.label}
                      type="button"
                      onClick={() => handleWeightChange(weight)}
                      className="pressable p-3 text-left rounded-[var(--radius-md)] min-w-0 transition-all cursor-pointer"
                      style={{
                        backgroundColor: isSelected ? "var(--accent-caramel-subtle)" : "var(--bg-surface)",
                        border: isSelected ? "1.5px solid var(--accent-caramel)" : "1px solid var(--border-subtle)",
                      }}
                    >
                      <div className="text-xs sm:text-sm font-bold text-[var(--accent-cocoa)] truncate">
                        {weight.label}
                      </div>
                      <div className="text-[11px] sm:text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                        {weight.servings}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Message & Piping Cream */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label
                  htmlFor="custom-cake-message"
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--accent-cocoa)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  4. Inscription & Piping Cream:
                </label>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {cakeMessage.length}/45 chars
                </div>
              </div>

              {/* Piping Cream Swatches */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                {PIPING_CREAM_PALETTE.map((cream) => {
                  const isSelected = selectedPipingColor.id === cream.id;
                  return (
                    <button
                      key={cream.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic("selection");
                        setSelectedPipingColor(cream);
                        triggerPreviewPulse();
                      }}
                      className="pressable"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "12px",
                        fontWeight: 600,
                        backgroundColor: isSelected ? "var(--accent-caramel-subtle)" : "var(--bg-surface)",
                        color: isSelected ? "var(--accent-cocoa)" : "var(--text-secondary)",
                        border: isSelected ? "1.5px solid var(--accent-caramel)" : "1px solid var(--border-subtle)",
                        boxShadow: isSelected ? "0 2px 6px rgba(199, 109, 56, 0.15)" : "none",
                        transition: "all 140ms var(--ease-apple-spring)",
                      }}
                      aria-pressed={isSelected}
                    >
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: cream.color,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
                        }}
                      />
                      <span>{cream.name}</span>
                    </button>
                  );
                })}
              </div>

              <input
                id="custom-cake-message"
                type="text"
                value={cakeMessage}
                maxLength={45}
                onChange={(e) => {
                  setCakeMessage(e.target.value);
                  triggerPreviewPulse();
                }}
                placeholder="e.g. Happy Birthday Priya! (Max 45 chars)"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-medium)",
                  backgroundColor: "var(--bg-surface)",
                  fontSize: "14px",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontFamily: "var(--font-sans)",
                }}
              />
            </div>

            {/* Step 5: Required Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6 min-w-0">
              <div className="min-w-0">
                <label
                  htmlFor="custom-cake-date"
                  className="block text-xs font-bold text-[var(--accent-cocoa)] uppercase tracking-wider mb-2"
                >
                  5. Delivery Date:
                </label>
                <input
                  id="custom-cake-date"
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full min-w-0 px-3.5 py-2.5 rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--bg-surface)] text-xs sm:text-sm text-[var(--text-primary)] outline-none box-border"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="custom-cake-time-slot"
                  className="block text-xs font-bold text-[var(--accent-cocoa)] uppercase tracking-wider mb-2"
                >
                  Time Window:
                </label>
                <select
                  id="custom-cake-time-slot"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full min-w-0 px-3.5 py-2.5 rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--bg-surface)] text-xs sm:text-sm text-[var(--text-primary)] outline-none box-border"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 6: Theme & Design Notes */}
            <div className="mb-6 min-w-0">
              <label
                htmlFor="custom-cake-theme-notes"
                className="block text-xs font-bold text-[var(--accent-cocoa)] uppercase tracking-wider mb-2"
              >
                6. Theme & Pastry Chef Instructions:
              </label>
              <textarea
                id="custom-cake-theme-notes"
                rows={3}
                value={themeNotes}
                onChange={(e) => setThemeNotes(e.target.value)}
                placeholder="Share your theme concept (e.g. vintage piping, pastel florals, gold foil, cartoon theme)..."
                className="w-full min-w-0 px-3.5 py-2.5 rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] outline-none resize-y box-border font-sans"
              />
            </div>

            {/* Quick Contact info for direct ordering */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 min-w-0">
              <div className="min-w-0">
                <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Priya Sundaram"
                  className="w-full min-w-0 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] outline-none box-border"
                />
              </div>
              <div className="min-w-0">
                <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  placeholder="e.g. +91 98401 23456"
                  className="w-full min-w-0 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] outline-none box-border"
                />
              </div>
            </div>

            {/* Notice */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                padding: "12px 14px",
                backgroundColor: "rgba(199, 109, 56, 0.08)",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(199, 109, 56, 0.2)",
                fontSize: "12px",
                color: "#783B1E",
                lineHeight: 1.5,
                marginBottom: "20px",
              }}
              className="min-w-0"
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
              <div className="min-w-0 break-words">
                <strong>Kitchen Protocol:</strong> Once placed, Head Chef Selva initiates sponge aeration while Confectionery Chef Anbu prepares bespoke colour-matching for your piping.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 w-full min-w-0">
              <button
                type="button"
                onClick={handlePlaceOrderDirect}
                disabled={isSubmitting}
                className="pressable w-full py-3.5 px-4 rounded-full bg-[var(--accent-cocoa)] text-white text-sm sm:text-base font-bold flex items-center justify-center gap-2 shadow-md min-w-0 border-none cursor-pointer transition-all"
              >
                <Cake size={18} className="shrink-0" />
                <span className="text-center leading-snug break-words">
                  {isSubmitting ? "Creating Kitchen Ticket..." : "Book Custom Cake & Dispatch to Kitchen"}
                </span>
              </button>

              <button
                type="button"
                onClick={generateWhatsAppMessage}
                className="pressable w-full py-3 px-4 rounded-full bg-[#16A34A] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 min-w-0 border-none cursor-pointer transition-all"
              >
                <MessageCircle size={17} className="shrink-0" />
                <span className="text-center leading-snug break-words">
                  Enquire & Share Reference via WhatsApp
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Visual Inscription & Reference Preview */}
          <div
            className="lg:col-span-5 col-span-1 w-full min-w-0 bg-[var(--bg-primary)] rounded-[var(--radius-xl)] p-4 sm:p-6 md:p-8 border border-[var(--border-subtle)] flex flex-col items-center text-center lg:sticky lg:top-24 static box-border"
          >
            <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
              Live Cake Simulation
            </div>

            {/* Selected Reference Card Banner */}
            <div
              className="w-full max-w-full sm:max-w-sm flex items-center gap-3 bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)] mb-5 text-left min-w-0 box-border"
            >
              <div
                className="w-12 h-12 rounded-[var(--radius-sm)] overflow-hidden shrink-0 bg-[#EAE5DF] border border-[var(--border-subtle)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeReferenceImage}
                  alt="Reference Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase text-[var(--accent-caramel)] tracking-wider">
                  {referenceMode === "upload" ? "Uploaded Reference" : "Archive Style"}
                </div>
                <div className="text-xs font-bold text-[var(--accent-cocoa)] truncate">
                  {activeReferenceTitle}
                </div>
              </div>
            </div>

            {/* Visual Cake Simulation Plate */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "min(280px, 72vw)",
                aspectRatio: "1 / 1",
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, #FFFDF9 0%, #F5ECE1 55%, #E6D6C5 100%)",
                boxShadow: "0 18px 42px rgba(58, 32, 22, 0.12), inset 0 2px 6px rgba(255, 255, 255, 0.95), inset 0 -6px 16px rgba(74, 46, 31, 0.08)",
                border: "clamp(6px, 1.8vw, 10px) solid #FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "clamp(12px, 3.5vw, 24px)",
                margin: "0 auto 20px",
                boxSizing: "border-box",
                transform: previewPulse ? "scale(0.985)" : "scale(1)",
                transition: "transform 180ms var(--ease-apple-spring)",
              }}
            >
              {/* Frosting perimeter line */}
              <div
                style={{
                  position: "absolute",
                  inset: "10px",
                  borderRadius: "50%",
                  border: "2px dashed rgba(199, 109, 56, 0.35)",
                  boxShadow: "inset 0 1px 2px rgba(199, 109, 56, 0.15)",
                }}
              />

              <div
                style={{
                  fontSize: "10px",
                  color: "var(--accent-caramel)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  marginBottom: "6px",
                  maxWidth: "90%",
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedFlavour}
              </div>

              {/* Hand-piped message with dynamic piping cream color */}
              <div
                className="font-serif"
                style={{
                  fontSize: "clamp(15px, 3.2vw, 20px)",
                  fontWeight: 600,
                  color: selectedPipingColor.color,
                  lineHeight: 1.25,
                  maxWidth: "min(200px, 55vw)",
                  minHeight: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                  textShadow: selectedPipingColor.textShadow,
                  transition: "color 200ms var(--ease-apple-spring), text-shadow 200ms var(--ease-apple-spring)",
                }}
              >
                {cakeMessage || "Your message here"}
              </div>

              <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "8px", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap", justifyContent: "center" }}>
                <span>{selectedWeight.label}</span>
                <span>•</span>
                <span>{isEggless ? "100% Eggless" : "Traditional"}</span>
                <span>•</span>
                <span style={{ color: selectedPipingColor.color, fontWeight: 700 }}>
                  {selectedPipingColor.name}
                </span>
              </div>
            </div>

            {/* Summary Specification Box */}
            <div
              className="w-full max-w-full bg-[var(--bg-surface)] p-3.5 sm:p-4 rounded-[var(--radius-lg)] text-left border border-[var(--border-subtle)] min-w-0 box-border"
            >
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-cocoa)", marginBottom: "10px" }}>
                Pastry Ticket Specs:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: "var(--text-secondary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                  <span>Base Flavour:</span>
                  <strong style={{ color: "var(--text-primary)", textAlign: "right" }}>{selectedFlavour}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                  <span>Weight / Servings:</span>
                  <strong style={{ color: "var(--text-primary)", textAlign: "right" }}>{selectedWeight.label} ({selectedWeight.servings})</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                  <span>Eggless:</span>
                  <strong style={{ color: "var(--accent-sage)", textAlign: "right" }}>{isEggless ? "Yes (Dedicated Counter)" : "No"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                  <span>Assigned Stations:</span>
                  <strong style={{ color: "var(--accent-cocoa)", textAlign: "right" }}>Chef Selva & Anbu</strong>
                </div>
                {preferredDate && (
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                    <span>Target Date:</span>
                    <strong style={{ color: "var(--text-primary)", textAlign: "right" }}>{preferredDate} ({preferredTime.split(" ")[0]})</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for sample cake */}
      {previewModalImage && (
        <div
          onClick={() => setPreviewModalImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "540px",
              width: "100%",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            }}
          >
            <button
              type="button"
              onClick={() => setPreviewModalImage(null)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "rgba(0,0,0,0.6)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                zIndex: 10,
              }}
            >
              <X size={18} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewModalImage}
              alt="Reference detail"
              style={{ width: "100%", maxHeight: "75vh", objectFit: "contain", display: "block" }}
            />
          </div>
        </div>
      )}

    </section>
  );
}
