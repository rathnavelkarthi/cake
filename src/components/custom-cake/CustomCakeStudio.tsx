"use client";

import React, { useState } from "react";
import { Sparkles, MessageCircle, AlertCircle } from "lucide-react";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { trackEvent } from "@/lib/analytics/events";
import { triggerHaptic } from "@/lib/utils/haptics";

const FLAVOURS = [
  "Belgian Dark Chocolate Truffle",
  "Mascarpone & Fresh Fig",
  "Roasted Hazelnut Praline",
  "Classic Red Velvet",
  "Alphonso Mango (Seasonal)",
];

const WEIGHTS = [
  { label: "1.0 kg", servings: "6 – 8 guests" },
  { label: "1.5 kg", servings: "10 – 12 guests" },
  { label: "2.0 kg", servings: "14 – 16 guests" },
  { label: "3.0 kg (2-Tier)", servings: "22 – 26 guests" },
];

const TIME_SLOTS = [
  "Morning (10:00 AM – 1:00 PM)",
  "Afternoon (1:00 PM – 5:00 PM)",
  "Evening (5:00 PM – 8:30 PM)",
];

export default function CustomCakeStudio() {
  const [selectedFlavour, setSelectedFlavour] = useState(FLAVOURS[0]);
  const [selectedWeight, setSelectedWeight] = useState(WEIGHTS[1]);
  const [cakeMessage, setCakeMessage] = useState("Happy 30th Birthday Priya!");
  const [themeNotes, setThemeNotes] = useState("Minimalist botanical style with fresh flowers");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState(TIME_SLOTS[2]);
  const [isEggless, setIsEggless] = useState(true);
  const [previewPulse, setPreviewPulse] = useState(false);

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

  const generateWhatsAppMessage = () => {
    triggerHaptic("success");
    trackEvent({
      name: "submit_custom_cake",
      flavour: selectedFlavour,
      weight: selectedWeight.label,
      date: preferredDate || "Not specified",
    });

    const text = `Hi Kichees,

I'd like to enquire about a custom cake.

Flavour: ${selectedFlavour} ${isEggless ? "(100% Eggless)" : "(With Egg)"}
Weight: ${selectedWeight.label} (${selectedWeight.servings})
Message on Cake: ${cakeMessage ? `"${cakeMessage}"` : "None"}
Theme / Design Notes: ${themeNotes || "Standard decoration"}
Preferred Date: ${preferredDate || "To be discussed"}
Preferred Time Slot: ${preferredTime}

Please let me know the availability, design feasibility, and price quote. Thank you!`;

    const url = `https://wa.me/${BUSINESS_CONFIG.whatsapp.replace("+", "")}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <section
      id="custom-studio"
      className="section-padding"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 48px" }}>
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
            <span>Bespoke Celebrations</span>
          </div>

          <h2
            className="font-serif"
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 700,
              color: "var(--accent-cocoa)",
              letterSpacing: "-0.02em",
              lineHeight: 1.18,
              marginBottom: "14px",
            }}
          >
            Custom Cake Studio
          </h2>

          <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Every celebration has a story. Select your foundation, customize your piping message, and send your specifications directly to our head pastry chef.
          </p>
        </div>

        {/* Studio Builder Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "36px",
            alignItems: "start",
          }}
          className="studio-grid"
        >
          {/* Left Column: Form Controls */}
          <div
            style={{
              backgroundColor: "var(--bg-primary)",
              padding: "clamp(20px, 4vw, 36px)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {/* Step 1: Flavour */}
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
                1. Select Sponge & Flavour:
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

            {/* Step 2: Weight & Servings */}
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
                2. Weight & Expected Guests:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
                {WEIGHTS.map((weight) => {
                  const isSelected = selectedWeight.label === weight.label;
                  return (
                    <button
                      key={weight.label}
                      type="button"
                      onClick={() => handleWeightChange(weight)}
                      className="pressable"
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: isSelected ? "var(--accent-caramel-subtle)" : "var(--bg-surface)",
                        border: isSelected ? "1.5px solid var(--accent-caramel)" : "1px solid var(--border-subtle)",
                        transition: "background-color 160ms var(--ease-out), border-color 160ms var(--ease-out)",
                      }}
                    >
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent-cocoa)" }}>
                        {weight.label}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                        {weight.servings}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Message on Cake */}
            <div style={{ marginBottom: "28px" }}>
              <label
                htmlFor="custom-cake-message"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--accent-cocoa)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "8px",
                }}
              >
                3. Message / Inscription on Cake:
              </label>
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
                  transition: "border-color 160ms var(--ease-out)",
                }}
              />
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", textAlign: "right" }}>
                {cakeMessage.length}/45 characters
              </div>
            </div>

            {/* Step 4: Theme & Date */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }} className="date-time-grid">
              <div>
                <label
                  htmlFor="custom-cake-date"
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--accent-cocoa)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "8px",
                  }}
                >
                  4. Required Date:
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="custom-cake-date"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-medium)",
                      backgroundColor: "var(--bg-surface)",
                      fontSize: "13px",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="custom-cake-time-slot"
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--accent-cocoa)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "8px",
                  }}
                >
                  Time Window:
                </label>
                <select
                  id="custom-cake-time-slot"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-medium)",
                    backgroundColor: "var(--bg-surface)",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 5: Theme Notes */}
            <div style={{ marginBottom: "28px" }}>
              <label
                htmlFor="custom-cake-theme-notes"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--accent-cocoa)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "8px",
                }}
              >
                5. Theme / Design Reference:
              </label>
              <textarea
                id="custom-cake-theme-notes"
                rows={3}
                value={themeNotes}
                onChange={(e) => setThemeNotes(e.target.value)}
                placeholder="Share your theme concept (e.g. vintage piping, pastel florals, gold foil, cartoon theme)..."
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
                  resize: "vertical",
                }}
              />
            </div>

            {/* Confirmation Caveat */}
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
                marginBottom: "24px",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
              <div>
                <strong>Notice:</strong> Custom cake requests require availability and design review by our pastry chef before final confirmation. Pricing will be shared based on complexity.
              </div>
            </div>

            {/* Send WhatsApp Button */}
            <button
              type="button"
              onClick={generateWhatsAppMessage}
              className="pressable"
              style={{
                width: "100%",
                padding: "14px 24px",
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
              <span>Send Custom Cake Enquiry on WhatsApp</span>
            </button>
          </div>

          {/* Right Column: Dynamic Inscription Visual Preview Plate */}
          <div
            style={{
              backgroundColor: "var(--bg-primary)",
              borderRadius: "var(--radius-xl)",
              padding: "clamp(24px, 4vw, 36px)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "20px" }}>
              Live Cake Inscription Preview
            </div>

            {/* Visual Cake Simulation Plate with spring scale pulse */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "340px",
                aspectRatio: "1 / 1",
                borderRadius: "50%",
                backgroundColor: "#F4EBE1",
                boxShadow: "0 20px 48px rgba(58, 32, 22, 0.12), inset 0 0 40px rgba(0,0,0,0.04)",
                border: "8px solid #FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px",
                margin: "0 auto 24px",
                transform: previewPulse ? "scale(0.985)" : "scale(1)",
                transition: "transform 180ms var(--ease-out)",
              }}
            >
              {/* Frosting perimeter line */}
              <div
                style={{
                  position: "absolute",
                  inset: "16px",
                  borderRadius: "50%",
                  border: "2px dashed rgba(199, 109, 56, 0.3)",
                }}
              />

              <div style={{ fontSize: "12px", color: "var(--accent-caramel)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" }}>
                {selectedFlavour}
              </div>

              {/* Hand-piped message with smooth opacity & transform */}
              <div
                className="font-serif"
                style={{
                  fontSize: "clamp(18px, 3vw, 24px)",
                  fontStyle: "italic",
                  fontWeight: 600,
                  color: "var(--accent-cocoa)",
                  lineHeight: 1.3,
                  maxWidth: "240px",
                  minHeight: "48px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "opacity 160ms var(--ease-out), transform 160ms var(--ease-out)",
                }}
              >
                {cakeMessage || "Your message here"}
              </div>

              <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "12px" }}>
                {selectedWeight.label} • {isEggless ? "100% Eggless" : "Standard"}
              </div>
            </div>

            {/* Summary Specification Box */}
            <div
              style={{
                width: "100%",
                backgroundColor: "var(--bg-surface)",
                padding: "20px",
                borderRadius: "var(--radius-lg)",
                textAlign: "left",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-cocoa)", marginBottom: "12px" }}>
                Enquiry Summary:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Base:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedFlavour}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Size:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedWeight.label} ({selectedWeight.servings})</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Preparation:</span>
                  <strong style={{ color: "var(--accent-sage)" }}>{isEggless ? "Dedicated Eggless" : "Traditional"}</strong>
                </div>
                {preferredDate && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Target Date:</span>
                    <strong style={{ color: "var(--text-primary)" }}>{preferredDate}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 960px) {
          .studio-grid {
            grid-template-columns: 1.25fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .date-time-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
