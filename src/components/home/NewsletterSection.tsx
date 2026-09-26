"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { triggerHaptic } from "@/lib/utils/haptics";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    triggerHaptic("success");
    setIsSubmitted(true);
    setEmail("");
  };

  return (
    <section
      style={{
        backgroundColor: "var(--bg-muted, #F3ECE2)",
        padding: "72px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          textAlign: "center",
          backgroundColor: "var(--bg-surface, #FFFFFF)",
          borderRadius: "28px",
          padding: "52px 36px",
          boxShadow: "0 12px 36px rgba(35, 23, 17, 0.06)",
          border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "var(--accent-caramel-subtle, #FBEFE7)",
            color: "var(--accent-caramel, #C76D38)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <Mail size={22} />
        </div>

        <h2
          style={{
            fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
            fontSize: "clamp(28px, 3.5vw, 40px)",
            fontWeight: 600,
            color: "var(--text-primary, #1F1714)",
            margin: "0 0 10px 0",
            lineHeight: 1.15,
          }}
        >
          A Little Sweetness In Your Inbox
        </h2>

        <p
          style={{
            fontSize: "15px",
            lineHeight: 1.6,
            color: "var(--text-secondary, #6B5B53)",
            maxWidth: "520px",
            margin: "0 auto 28px",
          }}
        >
          Subscribe to the Kichees Celebration Club for secret weekend bake drops, festive cake menus, and exclusive member tasting invitations.
        </p>

        {isSubmitted ? (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "999px",
              backgroundColor: "#DCFCE7",
              color: "#166534",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={18} />
            <span>Welcome to the club! Check your inbox for sweet surprises.</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              maxWidth: "480px",
              margin: "0 auto",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              style={{
                flex: "1 1 260px",
                height: "48px",
                padding: "0 18px",
                borderRadius: "999px",
                border: "1.5px solid var(--border-medium, rgba(74, 46, 31, 0.18))",
                fontSize: "14px",
                color: "var(--text-primary, #1F1714)",
                backgroundColor: "var(--bg-primary, #FAF7F2)",
                outline: "none",
              }}
              className="focus:border-amber-900"
            />
            <button
              type="submit"
              onClick={() => triggerHaptic("selection")}
              style={{
                height: "48px",
                padding: "0 28px",
                borderRadius: "999px",
                backgroundColor: "var(--accent-cocoa, #3A2016)",
                color: "#FAF7F2",
                fontWeight: 700,
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 160ms ease",
              }}
              className="hover:bg-stone-900 active:scale-95"
            >
              <span>Join Club</span>
              <ArrowRight size={15} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
