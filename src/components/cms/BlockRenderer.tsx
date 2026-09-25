"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ContentBlock,
  HeroBlock,
  ProductShowcaseBlock,
  GalleryBlock,
  RichTextBlock,
  ReviewsBlock,
  FaqBlock,
  CtaBannerBlock,
} from "@/lib/cms/types";
import HeroSection from "@/components/hero/HeroSection";
import QuickActionBar from "@/components/hero/QuickActionBar";
import ProductSection from "@/components/products/ProductSection";
import BrandStory from "@/components/brand/BrandStory";
import CustomerReviews from "@/components/brand/CustomerReviews";
import FaqSection from "@/components/faq/FaqSection";
import FinalCtaSection from "@/components/brand/FinalCtaSection";
import TaglineReveal from "@/components/brand/TaglineReveal";
import HowItWorks from "@/components/brand/HowItWorks";
import CustomCakeStudio from "@/components/custom-cake/CustomCakeStudio";
import LocationSection from "@/components/location/LocationSection";
import { ArrowRight, Sparkles, Quote, X, Camera } from "lucide-react";

interface BlockRendererProps {
  blocks: ContentBlock[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);

  const visibleBlocks = blocks.filter((b) => b.isVisible !== false);

  return (
    <>
      {visibleBlocks.map((block) => {
        switch (block.type) {
          case "hero": {
            const b = block as HeroBlock;
            return (
              <React.Fragment key={b.id}>
                <HeroSection
                  badge={b.badge}
                  headline={b.headline}
                  subline={b.subline}
                  primaryCtaText={b.primaryCtaText}
                  primaryCtaLink={b.primaryCtaLink}
                  imageUrl={b.imageUrl}
                />
                <QuickActionBar />
              </React.Fragment>
            );
          }

          case "product_showcase": {
            const b = block as ProductShowcaseBlock;
            return (
              <React.Fragment key={b.id}>
                <ProductSection />
                <TaglineReveal />
              </React.Fragment>
            );
          }

          case "gallery": {
            const b = block as GalleryBlock;
            return (
              <section
                key={b.id}
                className="section-padding"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderTop: "1px solid var(--border-subtle)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <div className="container">
                  <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 40px" }}>
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
                      <Camera size={14} />
                      <span>Kitchen Gallery</span>
                    </div>
                    <h2
                      className="font-serif"
                      style={{
                        fontSize: "clamp(26px, 3.5vw, 36px)",
                        fontWeight: 700,
                        color: "var(--accent-cocoa)",
                        marginBottom: "10px",
                      }}
                    >
                      {b.title}
                    </h2>
                    {b.subtitle && (
                      <p style={{ fontSize: "15px", color: "var(--text-secondary)" }}>
                        {b.subtitle}
                      </p>
                    )}
                  </div>

                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0"
                  >
                    {b.images.map((img) => (
                      <div
                        key={img.id}
                        onClick={() => setSelectedGalleryImage(img.url)}
                        className="pressable"
                        style={{
                          borderRadius: "var(--radius-lg)",
                          overflow: "hidden",
                          boxShadow: "var(--shadow-sm)",
                          border: "1px solid var(--border-subtle)",
                          backgroundColor: "var(--bg-surface)",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ aspectRatio: "4/3", position: "relative", overflow: "hidden" }}>
                          <img
                            src={img.url}
                            alt={img.caption || "Kichees bake"}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.4s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
                          />
                        </div>
                        {img.caption && (
                          <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border-subtle)" }}>
                            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--accent-cocoa)" }}>
                              {img.caption}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Lightbox Modal */}
                  {selectedGalleryImage && (
                    <div
                      onClick={() => setSelectedGalleryImage(null)}
                      style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.85)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                        padding: "20px",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "relative",
                          maxWidth: "90vw",
                          maxHeight: "85vh",
                          borderRadius: "16px",
                          overflow: "hidden",
                          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
                        }}
                      >
                        <button
                          onClick={() => setSelectedGalleryImage(null)}
                          style={{
                            position: "absolute",
                            top: "14px",
                            right: "14px",
                            background: "rgba(0,0,0,0.6)",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "50%",
                            width: "36px",
                            height: "36px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <X size={20} />
                        </button>
                        <img
                          src={selectedGalleryImage}
                          alt="Expanded Gallery Bake"
                          style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", display: "block" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>
            );
          }

          case "rich_text": {
            const b = block as RichTextBlock;
            return (
              <React.Fragment key={b.id}>
                {b.id === "block-story" ? (
                  <>
                    <BrandStory />
                    <HowItWorks />
                    <CustomCakeStudio />
                  </>
                ) : (
                  <section
                    className="section-padding"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderTop: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div className="container" style={{ maxWidth: "800px" }}>
                      <div style={{ textAlign: "center", marginBottom: "28px" }}>
                        <h2
                          className="font-serif"
                          style={{
                            fontSize: "clamp(26px, 3.5vw, 36px)",
                            fontWeight: 700,
                            color: "var(--accent-cocoa)",
                            marginBottom: "10px",
                          }}
                        >
                          {b.title}
                        </h2>
                        {b.subtitle && (
                          <p style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
                            {b.subtitle}
                          </p>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: "16px",
                          lineHeight: 1.8,
                          color: "var(--text-secondary)",
                          marginBottom: b.quote ? "28px" : "0",
                        }}
                      >
                        {b.content}
                      </div>

                      {b.quote && (
                        <div
                          style={{
                            padding: "24px",
                            borderRadius: "var(--radius-lg)",
                            backgroundColor: "var(--accent-caramel-subtle)",
                            borderLeft: "4px solid var(--accent-caramel)",
                            marginTop: "24px",
                          }}
                        >
                          <Quote size={24} style={{ color: "var(--accent-caramel)", marginBottom: "8px" }} />
                          <p
                            style={{
                              fontSize: "17px",
                              fontStyle: "italic",
                              color: "var(--accent-cocoa)",
                              marginBottom: "8px",
                            }}
                          >
                            &ldquo;{b.quote}&rdquo;
                          </p>
                          {b.author && (
                            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-caramel)" }}>
                              {b.author}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </React.Fragment>
            );
          }

          case "reviews": {
            return (
              <React.Fragment key={block.id}>
                <CustomerReviews />
                <LocationSection />
              </React.Fragment>
            );
          }

          case "faq": {
            return <FaqSection key={block.id} />;
          }

          case "cta_banner": {
            const b = block as CtaBannerBlock;
            return <FinalCtaSection key={b.id} />;
          }

          default:
            return null;
        }
      })}
    </>
  );
}
