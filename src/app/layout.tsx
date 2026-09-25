import type { Metadata, Viewport } from "next";
import "./globals.css";
import { generateBakerySchema, generateFAQSchema } from "@/lib/seo/structured-data";
import { BUSINESS_CONFIG } from "@/lib/config/business";

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Kichees Baked Delights | Handcrafted Cakes & Patisserie in Nungambakkam, Chennai",
  description: "Boutique artisanal cakes, molten fudge brownies, and bespoke celebration gateaux baked fresh daily in Nungambakkam. Order online for same-day delivery across Chennai or counter pickup.",
  keywords: [
    "cakes in nungambakkam",
    "birthday cakes chennai",
    "eggless cakes chennai",
    "customized cakes chennai",
    "brownies nungambakkam",
    "kichees baked delights",
  ],
  metadataBase: new URL("https://kichees.in"),
  openGraph: {
    title: "Kichees Baked Delights | Artisanal Cakes & Patisserie",
    description: "100% pure butter, Belgian Callebaut chocolate, and bespoke bakes made fresh every morning in Nungambakkam, Chennai.",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/images/hero-truffle.jpg",
        width: 1200,
        height: 900,
        alt: "Kichees Belgian Chocolate Truffle Cake",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bakerySchema = generateBakerySchema();
  const faqSchema = generateFAQSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Structured Data for SEO & AEO Discovery */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(bakerySchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body className="paper-texture" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
