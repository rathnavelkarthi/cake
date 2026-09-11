export interface OpeningHour {
  days: string;
  hours: string;
  isOpenToday: boolean;
}

export interface BusinessConfig {
  name: string;
  tagline: string;
  shortDescription: string;
  foundedYear: number;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  whatsappDisplay: string;
  email: string;
  address: {
    line1: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string;
    full: string;
  };
  mapsUrl: string;
  googleMapsEmbedUrl?: string;
  openingHours: OpeningHour[];
  deliveryZones: {
    primary: string;
    suburbs: string;
    minOrderFreeDelivery: number;
    standardDeliveryFee: number;
    expressDeliveryMinutes: number;
  };
  socialLinks: {
    instagram: string;
    facebook?: string;
    whatsapp: string;
  };
  orderPolicies: {
    customCakeAdvanceHours: number;
    standardCakeLeadTimeHours: number;
    cancellationPolicy: string;
  };
}

export const BUSINESS_CONFIG: BusinessConfig = {
  name: "Kichees Baked Delights",
  tagline: "Artisanal Bakes & Bespoke Celebrations",
  shortDescription: "Handcrafted cakes, fudge brownies, and European pastries baked fresh daily in Nungambakkam, Chennai.",
  foundedYear: 2021,
  phone: "+919840823145",
  phoneDisplay: "044 - 2827 4912",
  whatsapp: "+919840823145",
  whatsappDisplay: "+91 98408 23145",
  email: "orders@kichees.in",
  address: {
    line1: "142 Nungambakkam High Road",
    locality: "Nungambakkam",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600034",
    landmark: "Near Sterling Road Junction",
    full: "142 Nungambakkam High Road, Nungambakkam, Chennai, Tamil Nadu 600034",
  },
  mapsUrl: "https://maps.google.com/?q=Nungambakkam+High+Road+Chennai+600034",
  openingHours: [
    { days: "Monday – Sunday", hours: "9:00 AM – 10:30 PM", isOpenToday: true },
  ],
  deliveryZones: {
    primary: "Nungambakkam, Chetpet, Alwarpet, T. Nagar, Gopalapuram, Kilpauk, Egmore",
    suburbs: "Anna Nagar, Adyar, Besant Nagar, OMR (up to Thoraipakkam)",
    minOrderFreeDelivery: 1000,
    standardDeliveryFee: 80,
    expressDeliveryMinutes: 60,
  },
  socialLinks: {
    instagram: "https://instagram.com/kicheesbakeddelights",
    whatsapp: "https://wa.me/919840823145",
  },
  orderPolicies: {
    customCakeAdvanceHours: 24,
    standardCakeLeadTimeHours: 2,
    cancellationPolicy: "Orders can be modified or cancelled up to 4 hours before scheduled delivery or preparation.",
  },
};
