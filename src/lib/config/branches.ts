// Kichee's Baked Delights: Multi-Branch & Delivery Logistics Configuration
// Verified Chennai Locations: Harrisons Hotel (Valluvar Kottam) & Casablanca Studio (Thirumoorthy Nagar)

export interface BranchLocation {
  id: string;
  name: string;
  shortName: string;
  address: string;
  area: string;
  city: string;
  pincode: string;
  phone: string;
  timings: string;
  lat: number;
  lng: number;
  mapLink: string;
  isPickupAvailable: boolean;
  isActive: boolean;
}

export const CHENNAI_BRANCHES: BranchLocation[] = [
  {
    id: "harrisons",
    name: "Kichee's Baked Delights - Harrisons Hotel",
    shortName: "Harrisons Hotel (Valluvar Kottam High Rd)",
    address:
      "No. 315, Harrisons Hotel, Next to Bosch Showroom, Valluvar Kottam High Road, Nungambakkam, Chennai - 600034, Tamil Nadu",
    area: "Valluvar Kottam High Road, Nungambakkam",
    city: "Chennai",
    pincode: "600034",
    phone: "+91 98846 31078",
    timings: "9:00 AM - 10:30 PM (Daily)",
    lat: 13.0569,
    lng: 80.2425,
    mapLink: "https://maps.google.com/?q=Harrisons+Hotel+Nungambakkam+Chennai",
    isPickupAvailable: true,
    isActive: true,
  },
  {
    id: "nungambakkam",
    name: "Kichee's Baked Delights - Casablanca Studio",
    shortName: "Casablanca Studio (Thirumoorthy Nagar)",
    address:
      "Flat No. S2, Ground Floor, KG Casablanca-1, 17/18, Dr. Thirumoorthy Nagar Main Road, Nungambakkam, Chennai - 600034, Tamil Nadu",
    area: "Dr. Thirumoorthy Nagar, Nungambakkam",
    city: "Chennai",
    pincode: "600034",
    phone: "+91 98846 31078",
    timings: "8:00 AM - 11:00 PM (Daily)",
    lat: 13.0601,
    lng: 80.2372,
    mapLink:
      "https://maps.google.com/?q=KG+Casablanca+1+Dr+Thirumoorthy+Nagar+Nungambakkam+Chennai",
    isPickupAvailable: true,
    isActive: true,
  },
];

export interface DeliveryPricingConfig {
  basePrice: number; // e.g., ₹60 for starting radius
  baseKm: number; // e.g., first 3 km included in base price
  perKmPrice: number; // e.g., ₹15 per km after baseKm
  freeDeliveryThreshold: number; // e.g., orders above ₹1,500
}

export const DEFAULT_DELIVERY_CONFIG: DeliveryPricingConfig = {
  basePrice: 60,
  baseKm: 3,
  perKmPrice: 15,
  freeDeliveryThreshold: 1500,
};

export interface ChennaiLocalityPreset {
  name: string;
  zone: string;
  distanceKm: number;
}

export const POPULAR_CHENNAI_LOCALITIES: ChennaiLocalityPreset[] = [
  { name: "Nungambakkam", zone: "Central", distanceKm: 1.0 },
  { name: "T. Nagar (Pondy Bazaar / Panagal Park)", zone: "Central", distanceKm: 2.5 },
  { name: "Chetpet & Harrington Road", zone: "Central", distanceKm: 2.5 },
  { name: "Gopalapuram & Cathedral Road", zone: "Central", distanceKm: 3.2 },
  { name: "Alwarpet & TTK Road", zone: "Central-South", distanceKm: 4.0 },
  { name: "Kilpauk & Kellys", zone: "Central-North", distanceKm: 4.5 },
  { name: "Egmore & Pantheon Road", zone: "Central", distanceKm: 4.8 },
  { name: "Kodambakkam & Vadapalani", zone: "West", distanceKm: 4.5 },
  { name: "Mylapore & Mandaveli", zone: "South", distanceKm: 5.5 },
  { name: "Anna Nagar (Roundtana / Shanti Colony)", zone: "North-West", distanceKm: 7.0 },
  { name: "Guindy & Saidapet", zone: "South", distanceKm: 8.0 },
  { name: "Adyar & Gandhi Nagar", zone: "South", distanceKm: 8.5 },
  { name: "Besant Nagar & Thiruvanmiyur", zone: "Coastal South", distanceKm: 10.5 },
  { name: "Velachery & Phoenix MarketCity", zone: "South", distanceKm: 13.0 },
  { name: "Porur & DLF IT Park", zone: "West", distanceKm: 14.5 },
  { name: "OMR (Perungudi & Thoraipakkam)", zone: "IT Corridor", distanceKm: 16.5 },
  { name: "Tambaram & Chromepet", zone: "South Suburbs", distanceKm: 24.0 },
];

/**
 * Calculates delivery fee based on distance in kilometers and order subtotal
 */
export function calculateDeliveryFee(
  distanceKm: number,
  orderSubtotal: number,
  config: DeliveryPricingConfig = DEFAULT_DELIVERY_CONFIG
): {
  fee: number;
  isFree: boolean;
  distanceKm: number;
  formula: string;
} {
  if (orderSubtotal >= config.freeDeliveryThreshold) {
    return {
      fee: 0,
      isFree: true,
      distanceKm,
      formula: `Free delivery unlocked on orders above ₹${config.freeDeliveryThreshold.toLocaleString("en-IN")}`,
    };
  }

  const validDistance = Math.max(0.5, Number(distanceKm) || 1);

  if (validDistance <= config.baseKm) {
    return {
      fee: config.basePrice,
      isFree: false,
      distanceKm: validDistance,
      formula: `Base delivery charge (up to ${config.baseKm} km) = ₹${config.basePrice}`,
    };
  }

  const extraKm = Math.ceil(validDistance - config.baseKm);
  const extraCharge = extraKm * config.perKmPrice;
  const totalFee = config.basePrice + extraCharge;

  return {
    fee: totalFee,
    isFree: false,
    distanceKm: validDistance,
    formula: `₹${config.basePrice} base + ${extraKm} km × ₹${config.perKmPrice}/km = ₹${totalFee}`,
  };
}

/**
 * Calculate geographical distance in kilometers between two lat/lng coordinates (Haversine formula)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}
