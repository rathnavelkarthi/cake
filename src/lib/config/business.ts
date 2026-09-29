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
  /**
   * Tax registration details printed on every invoice. Kept here rather than
   * inline in the billing page so the number is changed in exactly one place.
   */
  taxIdentity: {
    gstin: string;
    stateCode: string;
    stateName: string;
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
  phoneDisplay: "044 2827 4912",
  whatsapp: "+919840823145",
  whatsappDisplay: "+91 98408 23145",
  email: "orders@kichees.in",
  // Single registered place of business. The former Harrisons Hotel counter is
  // no longer a separate outlet, so it must not appear on invoices.
  address: {
    line1: "KG Casablanca 1, S2, Ground Floor",
    locality: "Dr. Thirumoorthy Nagar, Nungambakkam",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600034",
    landmark: "Dr. Thirumoorthy Nagar Main Road",
    full: "KG Casablanca 1, S2, Ground Floor, Dr. Thirumoorthy Nagar Main Road, Nungambakkam, Chennai, Tamil Nadu 600034",
  },
  taxIdentity: {
    gstin: "33BCVPK6982M2ZL",
    stateCode: "33",
    stateName: "Tamil Nadu",
  },
  mapsUrl:
    "https://maps.google.com/?q=KG+Casablanca+1+Dr+Thirumoorthy+Nagar+Nungambakkam+Chennai+600034",
  openingHours: [
    { days: "Monday to Sunday", hours: "9:00 AM to 10:30 PM", isOpenToday: true },
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
