"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Camera, Eye, X, ArrowUpRight } from "lucide-react";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { triggerHaptic } from "@/lib/utils/haptics";

const SUPABASE_CDN = "https://uiftoqlzlarfkfzqnedk.supabase.co/storage/v1/object/public/custom-cakes";

const GALLERY_TILES = [
  { id: "g-1", src: `${SUPABASE_CDN}/cake-1.jpg`, caption: "Hand-piped Vintage Lambeth Birthday Gateau", tag: "#BirthdayBakes" },
  { id: "g-2", src: `${SUPABASE_CDN}/cake-2.jpg`, caption: "Fresh Fig & Edible Gold Leaf Truffle Tier", tag: "#CustomStudio" },
  { id: "g-3", src: `${SUPABASE_CDN}/cake-3.jpg`, caption: "Pastel Buttercream Floral Celebration", tag: "#Celebration" },
  { id: "g-4", src: `${SUPABASE_CDN}/cake-4.jpg`, caption: "54% Callebaut Dark Belgian Ganache", tag: "#ChocolateLover" },
  { id: "g-5", src: `${SUPABASE_CDN}/cake-5.jpg`, caption: "Mini Two-Tier Anniversary Milestone", tag: "#AnniversaryCake" },
  { id: "g-6", src: `${SUPABASE_CDN}/cake-6.jpg`, caption: "Persian Pistachio & Saffron Rose Entremet", tag: "#Artisanal" },
];

export default function SocialGallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section
      style={{
        backgroundColor: "var(--bg-primary, #FAF7F2)",
        padding: "80px 24px",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Section Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "36px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--accent-caramel, #C76D38)",
                marginBottom: "6px",
                fontFamily: "var(--font-manrope, sans-serif)",
              }}
            >
              <Camera size={14} />
              <span>@kichees_baked_delights</span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
                fontSize: "clamp(28px, 3.5vw, 42px)",
                fontWeight: 600,
                color: "var(--text-primary, #1F1714)",
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              Sweet Moments From Our Oven
            </h2>
          </div>

          <a
            href={BUSINESS_CONFIG.socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => triggerHaptic("selection")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--accent-cocoa, #3A2016)",
              textDecoration: "none",
              borderBottom: "1.5px solid var(--accent-caramel, #C76D38)",
              paddingBottom: "2px",
            }}
            className="hover:text-amber-800"
          >
            <span>Follow Us on Instagram</span>
            <ArrowUpRight size={16} />
          </a>
        </div>

        {/* 6 Visual Tiles Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "18px",
          }}
          className="sm:grid-cols-3 lg:grid-cols-6"
        >
          {GALLERY_TILES.map((tile) => (
            <div
              key={tile.id}
              onClick={() => {
                triggerHaptic("selection");
                setSelectedImage(tile.src);
              }}
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                borderRadius: "18px",
                overflow: "hidden",
                cursor: "pointer",
                backgroundColor: "#F3ECE2",
                boxShadow: "0 2px 10px rgba(35, 23, 17, 0.05)",
                border: "1px solid var(--border-subtle, rgba(74, 46, 31, 0.08))",
              }}
              className="group"
            >
              <Image
                src={tile.src}
                alt={tile.caption}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 200px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Hover Dark Vignette & Caption */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(25, 19, 16, 0.65)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                  textAlign: "center",
                  color: "#FFFFFF",
                  transition: "opacity 200ms ease",
                }}
                className="opacity-0 group-hover:opacity-100"
              >
                <Eye size={20} className="mb-2 text-amber-300" />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-gold, #DDA752)" }}>
                  {tile.tag}
                </span>
                <p style={{ margin: "4px 0 0 0", fontSize: "11px", lineHeight: 1.3, fontWeight: 500 }}>
                  {tile.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(20, 14, 10, 0.88)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "600px",
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Image src={selectedImage} alt="Kichees Bakery Creation" fill className="object-cover" />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "rgba(0,0,0,0.6)",
                color: "#FFFFFF",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
