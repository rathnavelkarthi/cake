// Central Order Store for Kichees Bakery
// Supports real-time updates between Admin, Manager Sara, Kitchen (Selva & Anbu), and Shop Users.

export interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  total: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  orderStatus:
    | "PENDING_PAYMENT"
    | "CONFIRMED"
    | "IN_OVEN"
    | "COOLING"
    | "DECORATING"
    | "PREPARING"
    | "READY"
    | "READY_FOR_PICKUP"
    | "OUT_FOR_DELIVERY"
    | "COMPLETED"
    | "CANCELLED";
  fulfilmentType: "PICKUP" | "DELIVERY";
  itemsCount: number;
  date: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  flavour: string;
  weightKg: string;
  isEggless: boolean;
  cakeMessage?: string;
  referenceImage?: string;
  referenceImageName?: string;
  assignedChef?: "Selva (Head Chef)" | "Anbu (Confectionery Chef)" | "General Kitchen";
  isInstantOrder: boolean;
  notes?: string;
  items: string[];
  createdAt: string;
}

const INITIAL_DEMO_ORDERS: OrderItem[] = [
  {
    id: "ord-1",
    orderNumber: "KCH-2026-0901",
    customerName: "Priya Sundaram",
    customerMobile: "+91 98401 23456",
    customerEmail: "priya.sundaram@gmail.com",
    total: 2200,
    paymentStatus: "PAID",
    orderStatus: "DECORATING",
    fulfilmentType: "DELIVERY",
    itemsCount: 1,
    date: "Today, 10:15 AM",
    deliveryDate: "2026-09-14",
    deliveryTimeSlot: "Evening (5:00 PM to 8:30 PM)",
    flavour: "Belgian Dark Chocolate Truffle",
    weightKg: "1.5 kg",
    isEggless: true,
    cakeMessage: "Happy 30th Birthday Priya!",
    referenceImage: "/custom-cakes/cake-1.jpg",
    referenceImageName: "Vintage Lambeth Caramel Swirl",
    assignedChef: "Anbu (Confectionery Chef)",
    isInstantOrder: false,
    notes: "Customer requested delicate pastel floral piping around the perimeter",
    items: ["1x Belgian Dark Chocolate Truffle (1.5 KG) - Custom Inscription"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "ord-2",
    orderNumber: "KCH-2026-0902",
    customerName: "Karthik Raja",
    customerMobile: "+91 97910 88231",
    customerEmail: "karthik.raja@outlook.com",
    total: 1650,
    paymentStatus: "PAID",
    orderStatus: "IN_OVEN",
    fulfilmentType: "PICKUP",
    itemsCount: 1,
    date: "Today, 11:30 AM",
    deliveryDate: "2026-09-14",
    deliveryTimeSlot: "Afternoon (1:00 PM to 5:00 PM)",
    flavour: "Classic Red Velvet",
    weightKg: "2.0 kg",
    isEggless: false,
    cakeMessage: "Congratulations Vikram & Sneha",
    referenceImage: "/custom-cakes/cake-4.jpg",
    referenceImageName: "Celebration Two-Tier Elegance",
    assignedChef: "Selva (Head Chef)",
    isInstantOrder: true,
    notes: "Instant walk-in booking entered by Manager Sara. High priority for 4 PM pickup.",
    items: ["1x Classic Red Velvet (2.0 KG) - Two Tiered"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "ord-3",
    orderNumber: "KCH-2026-0903",
    customerName: "Ananya Iyer",
    customerMobile: "+91 98842 11904",
    customerEmail: "ananya.iyer@gmail.com",
    total: 3100,
    paymentStatus: "PAID",
    orderStatus: "CONFIRMED",
    fulfilmentType: "DELIVERY",
    itemsCount: 2,
    date: "Today, 12:45 PM",
    deliveryDate: "2026-09-15",
    deliveryTimeSlot: "Morning (10:00 AM to 1:00 PM)",
    flavour: "Roasted Hazelnut Praline",
    weightKg: "3.0 kg",
    isEggless: true,
    cakeMessage: "Welcome Home Baby Aarav",
    referenceImage: "/custom-cakes/cake-8.jpg",
    referenceImageName: "Pastel Botanical Buttercream",
    assignedChef: "Anbu (Confectionery Chef)",
    isInstantOrder: false,
    notes: "Double check eggless isolation protocol.",
    items: [
      "1x Roasted Hazelnut Praline (3.0 KG)",
      "1x Artisanal Macarons (Box of 6)",
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "ord-4",
    orderNumber: "KCH-2026-0904",
    customerName: "Vikram Raman",
    customerMobile: "+91 98412 77334",
    customerEmail: "vikram.raman@tcs.com",
    total: 1250,
    paymentStatus: "PAID",
    orderStatus: "COMPLETED",
    fulfilmentType: "PICKUP",
    itemsCount: 1,
    date: "Yesterday, 3:20 PM",
    deliveryDate: "2026-09-13",
    deliveryTimeSlot: "Evening (5:00 PM to 8:30 PM)",
    flavour: "Mascarpone & Fresh Fig",
    weightKg: "1.0 kg",
    isEggless: true,
    cakeMessage: "Happy Anniversary Mom & Dad",
    referenceImage: "/custom-cakes/cake-12.jpg",
    referenceImageName: "Rustic Fig & Chantilly",
    assignedChef: "Selva (Head Chef)",
    isInstantOrder: false,
    notes: "Picked up at Nungambakkam counter.",
    items: ["1x Mascarpone & Fresh Fig (1.0 KG)"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const STORAGE_KEY = "kichees_orders_v1";

type OrderListener = (orders: OrderItem[]) => void;
const listeners = new Set<OrderListener>();

function loadOrdersFromStorage(): OrderItem[] {
  if (typeof window === "undefined") {
    return INITIAL_DEMOOrdersCopy();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ORDERS));
      return INITIAL_DEMOOrdersCopy();
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error("Failed to parse orders from localStorage:", err);
  }

  return INITIAL_DEMOOrdersCopy();
}

function INITIAL_DEMOOrdersCopy(): OrderItem[] {
  return JSON.parse(JSON.stringify(INITIAL_DEMO_ORDERS));
}

let inMemoryOrders: OrderItem[] = INITIAL_DEMOOrdersCopy();

export function getOrders(): OrderItem[] {
  if (typeof window !== "undefined") {
    inMemoryOrders = loadOrdersFromStorage();
  }
  return [...inMemoryOrders];
}

export function saveOrders(orders: OrderItem[]) {
  inMemoryOrders = [...orders];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (err) {
      console.error("Failed to persist orders to localStorage:", err);
    }
  }
  notifySubscribers();
}

export function subscribeOrders(listener: OrderListener): () => void {
  listeners.add(listener);
  // Initial fire with current orders
  listener(getOrders());

  // Listen to storage events from other tabs
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        inMemoryOrders = JSON.parse(e.newValue);
        notifySubscribers();
      } catch {}
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

function notifySubscribers() {
  const current = [...inMemoryOrders];
  listeners.forEach((fn) => {
    try {
      fn(current);
    } catch (err) {
      console.error("Error notifying order listener:", err);
    }
  });
}

export interface InstantOrderInput {
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  fulfilmentType: "PICKUP" | "DELIVERY";
  deliveryDate: string;
  deliveryTimeSlot: string;
  flavour: string;
  weightKg: string;
  isEggless: boolean;
  cakeMessage?: string;
  referenceImage?: string;
  referenceImageName?: string;
  assignedChef: "Selva (Head Chef)" | "Anbu (Confectionery Chef)" | "General Kitchen";
  notes?: string;
  price?: number;
}

export function addInstantOrder(input: InstantOrderInput): OrderItem {
  const orders = getOrders();
  const nextNum = orders.length + 905;
  const orderNumber = `KCH-2026-0${nextNum}`;

  // Approximate default price based on weight
  let calculatedPrice = 1450;
  if (input.weightKg.includes("1.5")) calculatedPrice = 1850;
  if (input.weightKg.includes("2.0") || input.weightKg.includes("2 kg")) calculatedPrice = 2400;
  if (input.weightKg.includes("3.0") || input.weightKg.includes("3 kg")) calculatedPrice = 3600;
  if (input.price && input.price > 0) calculatedPrice = input.price;

  const newOrder: OrderItem = {
    id: `ord-${Date.now()}`,
    orderNumber,
    customerName: input.customerName.trim(),
    customerMobile: input.customerMobile.trim(),
    customerEmail: input.customerEmail?.trim(),
    total: calculatedPrice,
    paymentStatus: "PAID",
    orderStatus: "CONFIRMED", // Starts as confirmed, ready for kitchen prep
    fulfilmentType: input.fulfilmentType,
    itemsCount: 1,
    date: `Today, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    deliveryDate: input.deliveryDate || new Date().toISOString().split("T")[0],
    deliveryTimeSlot: input.deliveryTimeSlot || "Evening (5:00 PM to 8:30 PM)",
    flavour: input.flavour,
    weightKg: input.weightKg,
    isEggless: input.isEggless,
    cakeMessage: input.cakeMessage,
    referenceImage: input.referenceImage,
    referenceImageName: input.referenceImageName,
    assignedChef: input.assignedChef,
    isInstantOrder: true,
    notes: input.notes,
    items: [`1x ${input.flavour} (${input.weightKg})${input.cakeMessage ? ` - "${input.cakeMessage}"` : ""}`],
    createdAt: new Date().toISOString(),
  };

  // Prepend so it sits at the top of the kitchen and admin queues
  saveOrders([newOrder, ...orders]);
  return newOrder;
}

export function updateOrderStatus(orderId: string, status: OrderItem["orderStatus"]): OrderItem | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index !== -1) {
    orders[index] = {
      ...orders[index],
      orderStatus: status,
    };
    saveOrders(orders);
    return orders[index];
  }
  return null;
}

export function updateOrderChef(orderId: string, chef: OrderItem["assignedChef"]): OrderItem | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index !== -1) {
    orders[index] = {
      ...orders[index],
      assignedChef: chef,
    };
    saveOrders(orders);
    return orders[index];
  }
  return null;
}

export function resetDemoOrders() {
  saveOrders(INITIAL_DEMOOrdersCopy());
}
