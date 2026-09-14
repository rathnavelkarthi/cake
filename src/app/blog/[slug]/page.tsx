"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/ui/Toast";
import { getBlogPosts } from "@/lib/cms/cms-store";
import { BlogPost, GalleryBlock, RichTextBlock, ProductShowcaseBlock } from "@/lib/cms/types";
import { getLiveProducts } from "@/lib/data/products";
import ProductCard from "@/components/products/ProductCard";
import QuickViewModal from "@/components/products/QuickViewModal";
import { Product } from "@/lib/data/types";
import {
  ArrowLeft,
  Calendar,
  User,
  Quote,
  Camera,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [posts] = useState<BlogPost[]>(getBlogPosts);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);

  const post = posts.find((p) => p.slug === slug);
  const liveProducts = getLiveProducts();

  if (!post) {
    return (
      <ToastProvider>
        <CartProvider>
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />
            <main
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 20px",
                backgroundColor: "var(--bg-primary)",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  maxWidth: "480px",
                  padding: "40px",
                  backgroundColor: "var(--bg-surface)",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <h1
                  className="font-serif"
                  style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "var(--accent-cocoa)",
                    marginBottom: "12px",
                  }}
                >
                  Article Not Found
                </h1>
                <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
                  This journal entry may have been moved or is currently being updated in our kitchen.
                </p>
                <Link
                  href="/blog"
                  className="btn-primary pressable"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    textDecoration: "none",
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Return to Journal</span>
                </Link>
              </div>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <CartProvider>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <Navbar />

          <main style={{ flex: 1, backgroundColor: "var(--bg-primary)" }}>
            {/* Article Top Banner */}
            <article style={{ maxWidth: "840px", margin: "0 auto", padding: "48px 20px 80px" }}>
              <Link
                href="/blog"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--accent-caramel)",
                  marginBottom: "24px",
                  textDecoration: "none",
                }}
              >
                <ArrowLeft size={15} />
                <span>Back to All Articles</span>
              </Link>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "13px",
                  color: "var(--text-tertiary)",
                  marginBottom: "14px",
                }}
              >
                <span
                  style={{
                    backgroundColor: "var(--accent-caramel-subtle)",
                    color: "var(--accent-caramel)",
                    padding: "3px 10px",
                    borderRadius: "4px",
                    fontWeight: 700,
                    fontSize: "12px",
                  }}
                >
                  {post.category}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Calendar size={13} />
                  {post.publishedAt}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <User size={13} />
                  {post.author}
                </span>
              </div>

              <h1
                className="font-serif"
                style={{
                  fontSize: "clamp(30px, 4.5vw, 44px)",
                  fontWeight: 700,
                  color: "var(--accent-cocoa)",
                  lineHeight: 1.18,
                  marginBottom: "20px",
                  letterSpacing: "-0.02em",
                }}
              >
                {post.title}
              </h1>

              <p
                style={{
                  fontSize: "18px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  marginBottom: "32px",
                  borderLeft: "3px solid var(--accent-caramel)",
                  paddingLeft: "16px",
                  fontStyle: "italic",
                }}
              >
                {post.excerpt}
              </p>

              {/* Cover Image */}
              {post.coverImage && (
                <div
                  style={{
                    borderRadius: "var(--radius-xl)",
                    overflow: "hidden",
                    aspectRatio: "16/9",
                    marginBottom: "48px",
                    boxShadow: "var(--shadow-md)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
              )}

              {/* Article Content Blocks */}
              <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                {post.blocks.map((block) => {
                  if (block.type === "rich_text") {
                    const b = block as RichTextBlock;
                    return (
                      <div key={b.id} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {b.title && (
                          <h2
                            className="font-serif"
                            style={{
                              fontSize: "24px",
                              fontWeight: 700,
                              color: "var(--accent-cocoa)",
                              marginTop: "8px",
                            }}
                          >
                            {b.title}
                          </h2>
                        )}
                        <div
                          style={{
                            fontSize: "16px",
                            lineHeight: 1.8,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {b.content}
                        </div>

                        {b.quote && (
                          <div
                            style={{
                              padding: "20px 24px",
                              borderRadius: "var(--radius-lg)",
                              backgroundColor: "var(--accent-caramel-subtle)",
                              borderLeft: "4px solid var(--accent-caramel)",
                              margin: "12px 0",
                            }}
                          >
                            <Quote size={20} style={{ color: "var(--accent-caramel)", marginBottom: "6px" }} />
                            <p
                              style={{
                                fontSize: "16px",
                                fontStyle: "italic",
                                color: "var(--accent-cocoa)",
                              }}
                            >
                              &ldquo;{b.quote}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (block.type === "gallery") {
                    const b = block as GalleryBlock;
                    return (
                      <div
                        key={b.id}
                        style={{
                          padding: "28px",
                          borderRadius: "var(--radius-xl)",
                          backgroundColor: "var(--bg-surface)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        <div style={{ marginBottom: "20px" }}>
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "var(--accent-caramel)",
                              textTransform: "uppercase",
                              marginBottom: "6px",
                            }}
                          >
                            <Camera size={14} />
                            <span>{b.title || "Photo Gallery"}</span>
                          </div>
                          {b.subtitle && (
                            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                              {b.subtitle}
                            </p>
                          )}
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                            gap: "16px",
                          }}
                        >
                          {b.images.map((img) => (
                            <div
                              key={img.id}
                              onClick={() => setSelectedGalleryImage(img.url)}
                              style={{
                                borderRadius: "var(--radius-md)",
                                overflow: "hidden",
                                border: "1px solid var(--border-subtle)",
                                cursor: "pointer",
                                backgroundColor: "var(--bg-primary)",
                              }}
                            >
                              <div style={{ aspectRatio: "4/3", overflow: "hidden" }}>
                                <img
                                  src={img.url}
                                  alt={img.caption || "Kitchen photo"}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    transition: "transform 0.3s ease",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
                                />
                              </div>
                              {img.caption && (
                                <div style={{ padding: "10px 14px", fontSize: "13px", fontWeight: 600, color: "var(--accent-cocoa)" }}>
                                  {img.caption}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (block.type === "product_showcase") {
                    const b = block as ProductShowcaseBlock;
                    return (
                      <div
                        key={b.id}
                        style={{
                          padding: "32px 24px",
                          borderRadius: "var(--radius-xl)",
                          backgroundColor: "var(--bg-secondary)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        <div style={{ textAlign: "center", marginBottom: "28px" }}>
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "var(--accent-caramel)",
                              textTransform: "uppercase",
                              marginBottom: "6px",
                            }}
                          >
                            <ShoppingBag size={14} />
                            <span>Bakery Counter</span>
                          </div>
                          <h3
                            className="font-serif"
                            style={{ fontSize: "22px", fontWeight: 700, color: "var(--accent-cocoa)" }}
                          >
                            {b.title || "Featured Bakes in This Article"}
                          </h3>
                          {b.subtitle && (
                            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
                              {b.subtitle}
                            </p>
                          )}
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                            gap: "20px",
                          }}
                        >
                          {liveProducts.slice(0, 3).map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              onQuickView={setQuickViewProduct}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
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
                      alt="Expanded Bake View"
                      style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", display: "block" }}
                    />
                  </div>
                </div>
              )}
            </article>
          </main>

          <Footer />
          <CartDrawer />

          {/* Quick View Modal */}
          {quickViewProduct && (
            <QuickViewModal
              product={quickViewProduct}
              onClose={() => setQuickViewProduct(null)}
            />
          )}
        </div>
      </CartProvider>
    </ToastProvider>
  );
}
