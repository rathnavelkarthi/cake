// Central Staff Workload & Team Communication Store
// Powers real-time employee workload monitoring and internal bakery team chat

export interface StaffMember {
  id: string;
  name: string;
  roleTitle: string;
  email: string;
  role: "SUPER_ADMIN" | "HEAD_CHEF" | "BILLING_STAFF";
  station: string;
  avatar: string;
  status: "ON_DUTY" | "ON_BREAK" | "OFF_DUTY";
  currentTask: string;
  todayBakesKg: number;
  todayCompletedOrders: number;
  activeTickets: number;
  avgPrepTimeMin: number;
  efficiencyRate: number;
  capacityPercent: number;
  phone: string;
  shiftHours: string;
}

export interface StaffActivityItem {
  id: string;
  staffId: string;
  staffName: string;
  staffAvatar: string;
  action: string;
  orderNumber?: string;
  timestamp: string;
  type: "BAKE" | "DECORATE" | "POS" | "STATUS_CHANGE" | "INVENTORY";
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  icon: string;
  unreadCount?: number;
}

export interface TeamMessage {
  id: string;
  channelId: string;
  senderName: string;
  senderRole: string;
  senderEmail: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  taggedOrderNumber?: string;
  isUrgent?: boolean;
}

export const CHANNELS: ChatChannel[] = [
  {
    id: "general",
    name: "general-ops",
    description: "Floor coordination, shift handovers & bakery notices",
    icon: "💬",
  },
  {
    id: "kitchen",
    name: "hot-kitchen-baking",
    description: "Sponge baking, oven timers, temperature & aeration",
    icon: "🔥",
  },
  {
    id: "confectionery",
    name: "custom-cakes-deco",
    description: "Piping cream colors, bespoke inscriptions & lookbook specs",
    icon: "🎂",
  },
  {
    id: "pos-dispatch",
    name: "pos-dispatch",
    description: "Front counter billing, customer pickups & delivery van",
    icon: "📦",
  },
  {
    id: "urgent",
    name: "urgent-rush-orders",
    description: "Immediate rush cakes & VIP guest orders",
    icon: "🚨",
  },
];

const INITIAL_STAFF: StaffMember[] = [
  {
    id: "staff-1",
    name: "Selva Kumar",
    roleTitle: "Bakery Head Chef",
    email: "bakery.chef@kicheesbakeddelights.in",
    role: "HEAD_CHEF",
    station: "Hot Kitchen & Oven Deck 1-2",
    avatar: "👨‍🍳",
    status: "ON_DUTY",
    currentTask: "Baking Belgian Dark Chocolate Truffle (ORD-2026-0891)",
    todayBakesKg: 24.5,
    todayCompletedOrders: 14,
    activeTickets: 2,
    avgPrepTimeMin: 22,
    efficiencyRate: 98,
    capacityPercent: 82,
    phone: "+91 98401 55678",
    shiftHours: "6:00 AM - 3:00 PM",
  },
  {
    id: "staff-2",
    name: "Anbu Selvan",
    roleTitle: "Confectionery Head Chef",
    email: "confectionery.chef@kicheesbakeddelights.in",
    role: "HEAD_CHEF",
    station: "Patisserie & Custom Cake Studio",
    avatar: "🎂",
    status: "ON_DUTY",
    currentTask: "Artisanal Lambeth piping for KCH-2026-0901",
    todayBakesKg: 18.0,
    todayCompletedOrders: 9,
    activeTickets: 3,
    avgPrepTimeMin: 34,
    efficiencyRate: 96,
    capacityPercent: 91,
    phone: "+91 97910 44321",
    shiftHours: "8:00 AM - 5:00 PM",
  },
  {
    id: "staff-3",
    name: "Sara Mathew",
    roleTitle: "Kichees Cafe Staff",
    email: "cafe.staff@kicheesbakeddelights.in",
    role: "BILLING_STAFF",
    station: "Front Counter, POS & Billing",
    avatar: "☕",
    status: "ON_DUTY",
    currentTask: "Packing pickup order for Karthik Raja (ORD-0892)",
    todayBakesKg: 0,
    todayCompletedOrders: 28,
    activeTickets: 1,
    avgPrepTimeMin: 3,
    efficiencyRate: 99,
    capacityPercent: 68,
    phone: "+91 98842 88901",
    shiftHours: "9:00 AM - 6:00 PM",
  },
  {
    id: "staff-4",
    name: "Murugan P.",
    roleTitle: "Express Dispatch Driver",
    email: "dispatch@kicheesbakeddelights.in",
    role: "BILLING_STAFF",
    station: "Refrigerated Van #1 (Chennai Fleet)",
    avatar: "🛵",
    status: "ON_DUTY",
    currentTask: "Delivering custom tiered cake to Harrington Rd",
    todayBakesKg: 0,
    todayCompletedOrders: 7,
    activeTickets: 2,
    avgPrepTimeMin: 28,
    efficiencyRate: 95,
    capacityPercent: 60,
    phone: "+91 98412 11223",
    shiftHours: "10:00 AM - 7:00 PM",
  },
  {
    id: "staff-5",
    name: "Kichees Super Admin",
    roleTitle: "Operations Director",
    email: "admin@kicheesbakeddelights.in",
    role: "SUPER_ADMIN",
    station: "Executive Management Portal",
    avatar: "🛡️",
    status: "ON_DUTY",
    currentTask: "Live kitchen workload monitoring & inventory audit",
    todayBakesKg: 0,
    todayCompletedOrders: 0,
    activeTickets: 0,
    avgPrepTimeMin: 0,
    efficiencyRate: 100,
    capacityPercent: 40,
    phone: "+91 98401 23456",
    shiftHours: "All Shifts (Admin Access)",
  },
];

const INITIAL_ACTIVITIES: StaffActivityItem[] = [
  {
    id: "act-1",
    staffId: "staff-1",
    staffName: "Selva Kumar (Head Chef)",
    staffAvatar: "👨‍🍳",
    action: "Loaded 2x 1.5kg dark chocolate truffle sponges into deck oven #2 at 175°C",
    orderNumber: "KCH-2026-0901",
    timestamp: "10 mins ago",
    type: "BAKE",
  },
  {
    id: "act-2",
    staffId: "staff-2",
    staffName: "Anbu Selvan (Confectionery Chef)",
    staffAvatar: "🎂",
    action: "Completed piped inscription: 'Happy 30th Birthday Divya!' with Salted Caramel cream",
    orderNumber: "KCH-2026-0901",
    timestamp: "18 mins ago",
    type: "DECORATE",
  },
  {
    id: "act-3",
    staffId: "staff-3",
    staffName: "Sara Mathew (Cafe Staff)",
    staffAvatar: "☕",
    action: "Generated GST invoice #INV-8921 and boxed 6x Dark Fudge Brownies for counter pickup",
    orderNumber: "ORD-2026-0892",
    timestamp: "25 mins ago",
    type: "POS",
  },
  {
    id: "act-4",
    staffId: "staff-4",
    staffName: "Murugan P. (Dispatch)",
    staffAvatar: "🛵",
    action: "Loaded temperature-controlled van with chilled box for Nungambakkam express route",
    orderNumber: "ORD-2026-0891",
    timestamp: "35 mins ago",
    type: "STATUS_CHANGE",
  },
  {
    id: "act-5",
    staffId: "staff-1",
    staffName: "Selva Kumar (Head Chef)",
    staffAvatar: "👨‍🍳",
    action: "Inspected aeration crumb for 100% eggless red velvet batch. Cleared quality benchmark.",
    orderNumber: "KCH-2026-0902",
    timestamp: "45 mins ago",
    type: "BAKE",
  },
];

const INITIAL_MESSAGES: TeamMessage[] = [
  {
    id: "msg-1",
    channelId: "general",
    senderName: "Selva Kumar",
    senderRole: "Bakery Head Chef",
    senderEmail: "bakery.chef@kicheesbakeddelights.in",
    senderAvatar: "👨‍🍳",
    text: "Morning team! Deck ovens 1 and 2 are pre-heated to 175°C. Eggless chocolate sponges are in prep.",
    timestamp: "08:15 AM",
  },
  {
    id: "msg-2",
    channelId: "general",
    senderName: "Sara Mathew",
    senderRole: "Kichees Cafe Staff",
    senderEmail: "cafe.staff@kicheesbakeddelights.in",
    senderAvatar: "☕",
    text: "Front register open! We have 4 pre-orders scheduled for early morning pickup before 11 AM.",
    timestamp: "08:30 AM",
  },
  {
    id: "msg-3",
    channelId: "kitchen",
    senderName: "Selva Kumar",
    senderRole: "Bakery Head Chef",
    senderEmail: "bakery.chef@kicheesbakeddelights.in",
    senderAvatar: "👨‍🍳",
    text: "Sponges for #ORD-2026-0891 are out of the oven, chilling in cooling rack #3.",
    timestamp: "09:40 AM",
    taggedOrderNumber: "ORD-2026-0891",
  },
  {
    id: "msg-4",
    channelId: "confectionery",
    senderName: "Anbu Selvan",
    senderRole: "Confectionery Head Chef",
    senderEmail: "confectionery.chef@kicheesbakeddelights.in",
    senderAvatar: "🎂",
    text: "Bespoke floral piping for #KCH-2026-0901 is underway. Caramel swirl shade matched to reference.",
    timestamp: "10:05 AM",
    taggedOrderNumber: "KCH-2026-0901",
  },
  {
    id: "msg-5",
    channelId: "pos-dispatch",
    senderName: "Sara Mathew",
    senderRole: "Kichees Cafe Staff",
    senderEmail: "cafe.staff@kicheesbakeddelights.in",
    senderAvatar: "☕",
    text: "Customer Karthik Raja is on his way for pickup #ORD-2026-0892.",
    timestamp: "10:20 AM",
    taggedOrderNumber: "ORD-2026-0892",
  },
  {
    id: "msg-6",
    channelId: "urgent",
    senderName: "Kichees Super Admin",
    senderRole: "Operations Director",
    senderEmail: "admin@kicheesbakeddelights.in",
    senderAvatar: "🛡️",
    text: "VIP anniversary cake incoming for evening delivery. Please ensure Callebaut gold ganache garnish.",
    timestamp: "10:35 AM",
    isUrgent: true,
  },
];

const STORAGE_KEY_STAFF = "kichees_staff_v2";
const STORAGE_KEY_CHATS = "kichees_team_chat_v2";
const STORAGE_KEY_ACTIVITIES = "kichees_staff_activities_v2";

let staffMemory: StaffMember[] = [...INITIAL_STAFF];
let messagesMemory: TeamMessage[] = [...INITIAL_MESSAGES];
let activitiesMemory: StaffActivityItem[] = [...INITIAL_ACTIVITIES];

const listeners: Array<() => void> = [];

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("Listener error:", e);
    }
  });
}

function getStoredOrInit<T>(key: string, initial: T): T {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return initial;
  }
}

function persist<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

export function getStaffMembers(): StaffMember[] {
  if (typeof window !== "undefined") {
    staffMemory = getStoredOrInit(STORAGE_KEY_STAFF, INITIAL_STAFF);
  }
  return staffMemory;
}

export function updateStaffStatus(
  staffId: string,
  newStatus: StaffMember["status"]
): StaffMember | null {
  const staff = getStaffMembers();
  const target = staff.find((s) => s.id === staffId);
  if (!target) return null;

  target.status = newStatus;
  persist(STORAGE_KEY_STAFF, staff);
  notifyListeners();
  return target;
}

export function logStaffActivity(item: Omit<StaffActivityItem, "id" | "timestamp">) {
  const activities = getStaffActivities();
  const newActivity: StaffActivityItem = {
    ...item,
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: "Just now",
  };
  activities.unshift(newActivity);
  if (activities.length > 50) activities.pop();

  activitiesMemory = activities;
  persist(STORAGE_KEY_ACTIVITIES, activities);
  notifyListeners();
  return newActivity;
}

export function getStaffActivities(): StaffActivityItem[] {
  if (typeof window !== "undefined") {
    activitiesMemory = getStoredOrInit(STORAGE_KEY_ACTIVITIES, INITIAL_ACTIVITIES);
  }
  return activitiesMemory;
}

export function getTeamMessages(channelId?: string): TeamMessage[] {
  if (typeof window !== "undefined") {
    messagesMemory = getStoredOrInit(STORAGE_KEY_CHATS, INITIAL_MESSAGES);
  }
  if (!channelId) return messagesMemory;
  return messagesMemory.filter((m) => m.channelId === channelId);
}

export function sendTeamMessage(
  input: Omit<TeamMessage, "id" | "timestamp">
): TeamMessage {
  const messages = getTeamMessages();
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const newMsg: TeamMessage = {
    ...input,
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: timeStr,
  };

  messages.push(newMsg);
  messagesMemory = messages;
  persist(STORAGE_KEY_CHATS, messages);

  // Cross-tab broadcast
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      const bc = new BroadcastChannel("kichees_team_chat");
      bc.postMessage({ type: "NEW_MESSAGE", message: newMsg });
      bc.close();
    } catch {}
  }

  notifyListeners();
  return newMsg;
}

export function subscribeTeamStore(callback: () => void): () => void {
  listeners.push(callback);

  if (typeof window !== "undefined") {
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === STORAGE_KEY_CHATS ||
        e.key === STORAGE_KEY_STAFF ||
        e.key === STORAGE_KEY_ACTIVITIES
      ) {
        callback();
      }
    };
    window.addEventListener("storage", handleStorage);

    let bc: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      bc = new BroadcastChannel("kichees_team_chat");
      bc.onmessage = () => callback();
    }

    return () => {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) listeners.splice(idx, 1);
      window.removeEventListener("storage", handleStorage);
      bc?.close();
    };
  }

  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}
