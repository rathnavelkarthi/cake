"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/ui/Toast";
import { getBlogPosts } from "@/lib/cms/cms-store";
import { BlogPost } from "@/lib/cms/types";
import { BookOpen, Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";

export default function BlogIndexPage() {
  const [posts] = useState<BlogPost[]>(() =>
    getBlogPosts().filter((p) => p.status === "Published")
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => set.add(p.category));
    return ["All", ...Array.from(set)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "All") return posts;
    return posts.filter((p) => p.category === selectedCategory);
  }, [posts, selectedCategory]);

  return (
    <ToastProvider>
      <CartProvider>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <Navbar />

          <main style={{ flex: 1, backgroundColor: "var(--bg-primary)" }}>
            {/* Editorial Header */}
            <section
              style={{
                paddingTop: "60px",
                paddingBottom: "40px",
                borderBottom: "1px solid var(--border-subtle)",
                textAlign: "center",
              }}
            >
              <div className="container" style={{ maxWidth: "720px" }}>
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
                    marginBottom: "12px",
                  }}
                >
                  <BookOpen size={14} />
                  <span>The Kichees Journal</span>
                </div>

                <h1
                  className="font-serif"
                  style={{
                    fontSize: "clamp(32px, 4.5vw, 48px)",
                    fontWeight: 700,
                    color: "var(--accent-cocoa)",
                    lineHeight: 1.15,
                    marginBottom: "16px",
                  }}
                >
                  Stories, Guides & Kitchen Craft
                </h1>

                <p
                  style={{
                    fontSize: "17px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  Explore our morning baking methods, cold-fermentation science, and celebration guides from our Nungambakkam kitchen.
                </p>

                {/* Category Filter Pills */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "10px",
                    marginTop: "32px",
                  }}
                >
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: "7px 18px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "13px",
                        fontWeight: 600,
                        border: "1px solid",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        backgroundColor:
                          selectedCategory === cat ? "var(--accent-cocoa)" : "var(--bg-surface)",
                        color:
                          selectedCategory === cat ? "#ffffff" : "var(--accent-cocoa)",
                        borderColor:
                          selectedCategory === cat ? "var(--accent-cocoa)" : "var(--border-subtle)",
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Articles Grid */}
            <section className="section-padding">
              <div className="container" style={{ maxWidth: "1140px" }}>
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-w-0"
                >
                  {filteredPosts.map((post) => (
                    <article
                      key={post.id}
                      style={{
                        borderRadius: "var(--radius-xl)",
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "var(--shadow-sm)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "var(--shadow-md)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                      }}
                    >
                      <Link href={`/blog/${post.slug}`} style={{ display: "block" }}>
                        <div style={{ aspectRatio: "16/9", position: "relative", overflow: "hidden" }}>
                          <img
                            src={post.coverImage || "/images/hero-truffle.jpg"}
                            alt={post.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      </Link>

                      <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            fontSize: "12px",
                            color: "var(--text-tertiary)",
                            marginBottom: "12px",
                          }}
                        >
                          <span
                            style={{
                              backgroundColor: "var(--accent-caramel-subtle)",
                              color: "var(--accent-caramel)",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontWeight: 700,
                            }}
                          >
                            {post.category}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Calendar size={12} />
                            {post.publishedAt}
                          </span>
                        </div>

                        <h2
                          className="font-serif"
                          style={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "var(--accent-cocoa)",
                            lineHeight: 1.3,
                            marginBottom: "10px",
                          }}
                        >
                          <Link
                            href={`/blog/${post.slug}`}
                            style={{ color: "inherit", textDecoration: "none" }}
                          >
                            {post.title}
                          </Link>
                        </h2>

                        <p
                          style={{
                            fontSize: "14px",
                            color: "var(--text-secondary)",
                            lineHeight: 1.6,
                            marginBottom: "20px",
                            flex: 1,
                          }}
                        >
                          {post.excerpt}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingTop: "16px",
                            borderTop: "1px solid var(--border-subtle)",
                            fontSize: "13px",
                          }}
                        >
                          <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                            By {post.author}
                          </span>
                          <Link
                            href={`/blog/${post.slug}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontWeight: 700,
                              color: "var(--accent-caramel)",
                              textDecoration: "none",
                            }}
                          >
                            Read Article
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </main>

          <Footer />
          <CartDrawer />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}
