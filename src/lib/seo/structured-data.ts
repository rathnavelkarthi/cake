import { BUSINESS_CONFIG } from "../config/business";
import { Product } from "../data/types";
import { FAQS } from "../data/faqs";

export function generateBakerySchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: BUSINESS_CONFIG.name,
    image: "https://kichees.in/images/hero-truffle.jpg",
    "@id": "https://kichees.in/#bakery",
    url: "https://kichees.in",
    telephone: BUSINESS_CONFIG.phone,
    email: BUSINESS_CONFIG.email,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS_CONFIG.address.line1,
      addressLocality: BUSINESS_CONFIG.address.locality,
      addressRegion: BUSINESS_CONFIG.address.state,
      postalCode: BUSINESS_CONFIG.address.pincode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 13.0604,
      longitude: 80.2405,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "09:00",
        closes: "22:30",
      },
    ],
    servesCuisine: "Bakery, Pastries, Desserts",
    acceptsReservations: "False",
  };
}

export function generateProductSchema(product: Product) {
  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const maxPrice = Math.max(...product.variants.map((v) => v.price));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: `https://kichees.in${product.image}`,
    description: product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: BUSINESS_CONFIG.name,
    },
    offers: {
      "@type": "AggregateOffer",
      url: `https://kichees.in/#${product.slug}`,
      priceCurrency: "INR",
      lowPrice: minPrice,
      highPrice: maxPrice,
      offerCount: product.variants.length,
      availability: "https://schema.org/InStock",
    },
  };
}

export function generateFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
