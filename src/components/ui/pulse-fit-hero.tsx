"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface NavigationItem {
  label: string;
  hasDropdown?: boolean;
  onClick?: () => void;
  href?: string;
}

export interface ProgramCard {
  image: string;
  category: string;
  title: string;
  onClick?: () => void;
  href?: string;
  badge?: string;
}

export interface PulseFitHeroProps {
  logo?: React.ReactNode;
  navigation?: NavigationItem[];
  ctaButton?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  title: React.ReactNode;
  subtitle: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  disclaimer?: string;
  socialProof?: {
    avatars: string[];
    text: string;
  };
  programs?: ProgramCard[];
  className?: string;
  children?: React.ReactNode;
  backgroundStyle?: React.CSSProperties;
  showHeader?: boolean;
  youtubeVideoId?: string;
  enableInteractiveGlow?: boolean;
}

export function PulseFitHero({
  logo = "PulseFit",
  navigation = [
    { label: "Features" },
    { label: "Programs", hasDropdown: true },
    { label: "Testimonials" },
    { label: "Pricing" },
    { label: "Contact" },
  ],
  ctaButton,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  disclaimer,
  socialProof,
  programs = [],
  className,
  children,
  backgroundStyle,
  showHeader = true,
  youtubeVideoId,
  enableInteractiveGlow = true,
}: PulseFitHeroProps) {
  const [mousePos, setMousePos] = React.useState({ x: 500, y: 300 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!enableInteractiveGlow) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const hasVideo = Boolean(youtubeVideoId);

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative w-full min-h-screen flex flex-col overflow-hidden select-none",
        className
      )}
      style={{
        background: hasVideo
          ? "#140a05"
          : "linear-gradient(180deg, #E8F0FF 0%, #F5F9FF 50%, #FFFFFF 100%)",
        maxWidth: "100vw",
        overflowX: "clip",
        contain: "paint",
        ...backgroundStyle,
      }}
      role="banner"
      aria-label="Hero section"
    >
      {/* 1. Cinematic Ambient YouTube Video Background */}
      {youtubeVideoId && (
        <div
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 hidden sm:block"
          style={{
            backgroundColor: "#180d07",
            contain: "paint",
            clipPath: "inset(0)",
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeVideoId}&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1&playsinline=1&enablejsapi=1`}
            title="Kichees Bakery Kitchen Video"
            allow="autoplay; encrypted-media"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "100%",
              height: "100%",
              minWidth: "100%",
              minHeight: "100%",
              maxWidth: "none",
              transform: "translate(-50%, -50%) scale(1.3)",
              pointerEvents: "none",
              border: 0,
              opacity: 0.72,
              filter: "brightness(0.68) contrast(1.14) saturate(1.2)",
            }}
          />
        </div>
      )}

      {/* 2. Interactive Apple-Grade Cursor Spotlight Glow */}
      {enableInteractiveGlow && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-[1]"
          style={{
            background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(235, 150, 70, 0.22), transparent 75%)`,
            opacity: isHovered ? 1 : 0.5,
          }}
        />
      )}

      {/* 3. Luxury Multi-Layer Scrim for High Legibility & Warmth */}
      {hasVideo && (
        <>
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              background:
                "linear-gradient(180deg, rgba(15, 8, 4, 0.72) 0%, rgba(15, 8, 4, 0.38) 35%, rgba(15, 8, 4, 0.78) 85%, var(--bg-primary, #FAF7F2) 100%)",
            }}
          />
          {/* Interactive Live Ambience Capsule */}
          <div
            className="absolute top-5 right-5 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full pointer-events-auto"
            style={{
              backgroundColor: "rgba(20, 10, 5, 0.65)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "rgba(255, 255, 255, 0.92)",
              fontSize: "12px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', system-ui, sans-serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "#F59E0B",
                boxShadow: "0 0 10px #F59E0B",
              }}
            />
            <span>Kitchen Atmosphere</span>
          </div>

          {/* Subtle Floating Ambient Golden Dust Sparks */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
            {[14, 28, 48, 66, 82, 92].map((leftPct, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${4 + (i % 3) * 2}px`,
                  height: `${4 + (i % 3) * 2}px`,
                  backgroundColor: "rgba(245, 195, 130, 0.55)",
                  boxShadow: "0 0 14px rgba(245, 195, 130, 0.85)",
                  top: `${16 + i * 13}%`,
                  left: `${leftPct}%`,
                }}
                animate={{
                  y: [0, -32, 0],
                  x: [0, i % 2 === 0 ? 14 : -14, 0],
                  opacity: [0.25, 0.9, 0.25],
                  scale: [1, 1.35, 1],
                }}
                transition={{
                  duration: 4.2 + i * 1.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </>
      )}
      {/* Header */}
      {showHeader && (
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-20 flex flex-row justify-between items-center px-6 lg:px-16"
          style={{
            paddingTop: "24px",
            paddingBottom: "24px",
          }}
        >
          {/* Logo */}
          <div
            style={{
              fontFamily: "var(--font-sans, Inter, sans-serif)",
              fontWeight: 700,
              fontSize: "24px",
              color: "#1a1a1a",
              display: "flex",
              alignItems: "center",
            }}
          >
            {typeof logo === "string" ? <span>{logo}</span> : logo}
          </div>

          {/* Navigation */}
          <nav
            className="hidden lg:flex flex-row items-center gap-8"
            aria-label="Main navigation"
          >
            {navigation.map((item, index) => {
              if (item.href) {
                return (
                  <a
                    key={index}
                    href={item.href}
                    onClick={item.onClick}
                    className="flex flex-row items-center gap-1 hover:opacity-70 transition-opacity"
                    style={{
                      fontFamily: "var(--font-sans, Inter, sans-serif)",
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    {item.label}
                    {item.hasDropdown && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M4 6L8 10L12 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </a>
                );
              }
              return (
                <button
                  key={index}
                  type="button"
                  onClick={item.onClick}
                  className="flex flex-row items-center gap-1 hover:opacity-70 transition-opacity cursor-pointer"
                  style={{
                    fontFamily: "var(--font-sans, Inter, sans-serif)",
                    fontSize: "15px",
                    fontWeight: 500,
                    color: "inherit",
                    background: "none",
                    border: "none",
                  }}
                >
                  {item.label}
                  {item.hasDropdown && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </nav>

          {/* CTA Button */}
          {ctaButton && (
            <div>
              {ctaButton.href ? (
                <a
                  href={ctaButton.href}
                  onClick={ctaButton.onClick}
                  className="px-6 py-2.5 rounded-full transition-all hover:scale-105 inline-block"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    fontFamily: "var(--font-sans, Inter, sans-serif)",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#1a1a1a",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                    textDecoration: "none",
                  }}
                >
                  {ctaButton.label}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={ctaButton.onClick}
                  className="px-6 py-2.5 rounded-full transition-all hover:scale-105 cursor-pointer"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    fontFamily: "var(--font-sans, Inter, sans-serif)",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#1a1a1a",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  {ctaButton.label}
                </button>
              )}
            </div>
          )}
        </motion.header>
      )}

      {/* Main Content */}
      {children ? (
        <div className="relative z-10 flex-1 flex items-center justify-center w-full">
          {children}
        </div>
      ) : (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center text-center max-w-4xl"
            style={{ gap: "24px" }}
          >
            {/* Title */}
            <h1
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(34px, 5.2vw, 60px)",
                lineHeight: "1.08",
                color: hasVideo ? "#FFFFFF" : "#1a1a1a",
                letterSpacing: "-0.03em",
                textShadow: hasVideo ? "0 2px 20px rgba(0, 0, 0, 0.65)" : "none",
              }}
            >
              {title}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', system-ui, sans-serif",
                fontWeight: 400,
                fontSize: "clamp(15px, 1.8vw, 19px)",
                lineHeight: "1.55",
                color: hasVideo ? "rgba(255, 255, 255, 0.92)" : "#4a5568",
                maxWidth: "680px",
                letterSpacing: "-0.01em",
                textShadow: hasVideo ? "0 1px 8px rgba(0, 0, 0, 0.5)" : "none",
              }}
            >
              {subtitle}
            </p>

            {/* Action Buttons */}
            {(primaryAction || secondaryAction) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center gap-4 mt-2"
              >
                {primaryAction && (
                  <>
                    {primaryAction.href ? (
                      <a
                        href={primaryAction.href}
                        onClick={primaryAction.onClick}
                        className="flex flex-row items-center gap-2 px-8 py-3.5 rounded-full transition-all hover:scale-105 active:scale-95"
                        style={{
                          background: hasVideo ? "#FFFFFF" : "#1a1a1a",
                          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', system-ui, sans-serif",
                          fontSize: "15px",
                          fontWeight: 600,
                          letterSpacing: "-0.01em",
                          color: hasVideo ? "#231711" : "#FFFFFF",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                          textDecoration: "none",
                        }}
                      >
                        {primaryAction.label}
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                          <path
                            d="M7 10H13M13 10L10 7M13 10L10 13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={primaryAction.onClick}
                        className="flex flex-row items-center gap-2 px-8 py-3.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        style={{
                          background: hasVideo ? "#FFFFFF" : "#1a1a1a",
                          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', system-ui, sans-serif",
                          fontSize: "15px",
                          fontWeight: 600,
                          letterSpacing: "-0.01em",
                          color: hasVideo ? "#231711" : "#FFFFFF",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                        }}
                      >
                        {primaryAction.label}
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                          <path
                            d="M7 10H13M13 10L10 7M13 10L10 13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </>
                )}

                {secondaryAction && (
                  <>
                    {secondaryAction.href ? (
                      <a
                        href={secondaryAction.href}
                        onClick={secondaryAction.onClick}
                        className="px-8 py-3.5 rounded-full transition-all hover:scale-105 active:scale-95 inline-block"
                        style={{
                          background: hasVideo ? "rgba(255, 255, 255, 0.16)" : "rgba(255, 255, 255, 0.8)",
                          backdropFilter: "blur(20px)",
                          WebkitBackdropFilter: "blur(20px)",
                          border: hasVideo ? "1px solid rgba(255, 255, 255, 0.32)" : "1px solid #cbd5e0",
                          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', system-ui, sans-serif",
                          fontSize: "15px",
                          fontWeight: 600,
                          letterSpacing: "-0.01em",
                          color: hasVideo ? "#FFFFFF" : "#1a1a1a",
                          textDecoration: "none",
                          boxShadow: hasVideo ? "0 4px 16px rgba(0, 0, 0, 0.2)" : "none",
                        }}
                      >
                        {secondaryAction.label}
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={secondaryAction.onClick}
                        className="px-8 py-3.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        style={{
                          background: hasVideo ? "rgba(255, 255, 255, 0.16)" : "rgba(255, 255, 255, 0.8)",
                          backdropFilter: "blur(20px)",
                          WebkitBackdropFilter: "blur(20px)",
                          border: hasVideo ? "1px solid rgba(255, 255, 255, 0.32)" : "1px solid #cbd5e0",
                          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', system-ui, sans-serif",
                          fontSize: "15px",
                          fontWeight: 600,
                          letterSpacing: "-0.01em",
                          color: hasVideo ? "#FFFFFF" : "#1a1a1a",
                          boxShadow: hasVideo ? "0 4px 16px rgba(0, 0, 0, 0.2)" : "none",
                        }}
                      >
                        {secondaryAction.label}
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* Disclaimer */}
            {disclaimer && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', system-ui, sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "-0.005em",
                  color: hasVideo ? "rgba(255, 255, 255, 0.85)" : "#718096",
                  textShadow: hasVideo ? "0 1px 6px rgba(0, 0, 0, 0.6)" : "none",
                }}
              >
                {disclaimer}
              </motion.p>
            )}

            {/* Social Proof */}
            {socialProof && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-row items-center gap-3 mt-2"
              >
                <div className="flex flex-row -space-x-2">
                  {socialProof.avatars.map((avatar, index) => (
                    <img
                      key={index}
                      src={avatar}
                      alt={`Customer ${index + 1}`}
                      className="rounded-full border-2 border-white shadow-sm"
                      style={{
                        width: "38px",
                        height: "38px",
                        objectFit: "cover",
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', system-ui, sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    color: hasVideo ? "rgba(255, 255, 255, 0.95)" : "#4a5568",
                    textShadow: hasVideo ? "0 1px 8px rgba(0, 0, 0, 0.6)" : "none",
                  }}
                >
                  {socialProof.text}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* Cards Carousel */}
      {programs.length > 0 && (
        <div
          className="relative z-10 w-full overflow-hidden"
          style={{
            paddingTop: "24px",
            paddingBottom: "36px",
            overflowX: "clip",
            contain: "paint",
            clipPath: "inset(0)",
            maxWidth: "100%",
          }}
        >
          {/* Gradient Overlays */}
          <div
            className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
            style={{
              width: "clamp(24px, 8vw, 120px)",
              background: hasVideo
                ? "linear-gradient(90deg, rgba(15, 8, 4, 0.92) 0%, rgba(15, 8, 4, 0) 100%)"
                : "linear-gradient(90deg, var(--bg-primary, #FAF7F2) 0%, rgba(250, 247, 242, 0) 100%)",
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
            style={{
              width: "clamp(24px, 8vw, 120px)",
              background: hasVideo
                ? "linear-gradient(270deg, rgba(15, 8, 4, 0.92) 0%, rgba(15, 8, 4, 0) 100%)"
                : "linear-gradient(270deg, var(--bg-primary, #FAF7F2) 0%, rgba(250, 247, 242, 0) 100%)",
            }}
          />

          {/* Scrolling Container */}
          <motion.div
            className="flex items-center"
            animate={{
              x: [0, -((programs.length * 360) / 2)],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: Math.max(16, programs.length * 4),
                ease: "linear",
              },
            }}
            style={{
              gap: "20px",
              paddingLeft: "20px",
            }}
          >
            {/* Duplicate programs for seamless loop */}
            {[...programs, ...programs].map((program, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: "spring", damping: 20, stiffness: 240 }}
                onClick={() => {
                  if (program.href) {
                    window.location.href = program.href;
                  } else if (program.onClick) {
                    program.onClick();
                  }
                }}
                className="flex-shrink-0 cursor-pointer relative overflow-hidden group w-[240px] h-[330px] sm:w-[320px] sm:h-[420px]"
                style={{
                  borderRadius: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  boxShadow: "0 18px 42px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
                }}
              >
                {/* Image */}
                <img
                  src={program.image}
                  alt={program.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                  }}
                  className="group-hover:scale-105"
                />

                {/* Dark Gradient Overlay for Readability */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(20, 10, 5, 0.05) 0%, rgba(20, 10, 5, 0.78) 100%)",
                  }}
                />

                {/* Text Content */}
                <div
                  className="absolute bottom-0 left-0 right-0 p-6"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', system-ui, sans-serif",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "rgba(255, 220, 190, 0.95)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {program.category}
                  </span>
                  <h3
                    style={{
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro', system-ui, sans-serif",
                      fontSize: "21px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                      lineHeight: "1.2",
                      letterSpacing: "-0.02em",
                      textShadow: "0 2px 10px rgba(0, 0, 0, 0.6)",
                    }}
                  >
                    {program.title}
                  </h3>
                  {program.badge && (
                    <span
                      style={{
                        marginTop: "4px",
                        alignSelf: "flex-start",
                        fontSize: "12px",
                        fontWeight: 600,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', system-ui, sans-serif",
                        letterSpacing: "-0.01em",
                        backdropFilter: "blur(14px)",
                        WebkitBackdropFilter: "blur(14px)",
                        backgroundColor: "rgba(199, 109, 56, 0.92)",
                        border: "1px solid rgba(255, 255, 255, 0.25)",
                        color: "#ffffff",
                        padding: "4px 12px",
                        borderRadius: "9999px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      {program.badge}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Bottom transition gradient into storefront */}
      {hasVideo && (
        <div
          className="w-full pointer-events-none relative z-10"
          style={{
            height: "48px",
            background:
              "linear-gradient(180deg, transparent 0%, var(--bg-primary, #FAF7F2) 100%)",
          }}
        />
      )}
    </section>
  );
}
