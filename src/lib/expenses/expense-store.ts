export type ExpenseCategory =
  | "Raw Materials & Ingredients"
  | "Packaging & Boxes"
  | "Utilities (Power/Water/Gas)"
  | "Kitchen Equipment & Maintenance"
  | "Staff Salaries & Daily Wages"
  | "Delivery & Logistics"
  | "Bakery Store Rent & Maintenance"
  | "Marketing & Promotions"
  | "Licenses & Compliance"
  | "Miscellaneous & Office";

export type PaymentMode =
  | "UPI"
  | "CASH"
  | "BANK_TRANSFER"
  | "CARD"
  | "CHEQUE";

export type ExpenseStatus = "PAID" | "PENDING" | "REIMBURSED";

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMode: PaymentMode;
  vendor: string;
  invoiceNumber?: string;
  status: ExpenseStatus;
  recordedBy: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  totalExpenses: number;
  thisMonthTotal: number;
  todayTotal: number;
  categoryBreakdown: Array<{
    category: ExpenseCategory;
    amount: number;
    percentage: number;
    count: number;
  }>;
  paymentModeBreakdown: Record<PaymentMode, number>;
  pendingCount: number;
  pendingAmount: number;
}

const STORAGE_KEY = "kichees_expenses_v1";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Raw Materials & Ingredients",
  "Packaging & Boxes",
  "Utilities (Power/Water/Gas)",
  "Kitchen Equipment & Maintenance",
  "Staff Salaries & Daily Wages",
  "Delivery & Logistics",
  "Bakery Store Rent & Maintenance",
  "Marketing & Promotions",
  "Licenses & Compliance",
  "Miscellaneous & Office",
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: "exp-101",
    title: "Barry Callebaut 54% Dark Couverture (25kg Bag)",
    category: "Raw Materials & Ingredients",
    amount: 18500,
    date: "2026-10-01",
    paymentMode: "BANK_TRANSFER",
    vendor: "Barry Callebaut India Pvt Ltd",
    invoiceNumber: "BCI-2026-8812",
    status: "PAID",
    recordedBy: "Selva (Head Chef)",
    notes: "Batch for signature truffle cakes and molten brownies",
    createdAt: "2026-10-01T09:30:00.000Z",
    updatedAt: "2026-10-01T09:30:00.000Z",
  },
  {
    id: "exp-102",
    title: "Milky Mist Unsalted Dairy Butter (40kg) & Cream Cheese",
    category: "Raw Materials & Ingredients",
    amount: 14200,
    date: "2026-10-01",
    paymentMode: "UPI",
    vendor: "Milky Mist Dairy Foods",
    invoiceNumber: "MM-CH-44910",
    status: "PAID",
    recordedBy: "Desmond (Manager)",
    notes: "Cold chain delivery verified at 4°C",
    createdAt: "2026-10-01T11:15:00.000Z",
    updatedAt: "2026-10-01T11:15:00.000Z",
  },
  {
    id: "exp-103",
    title: "Luxury Rigid Cake Boxes (Gold Foil & Window - 500 pcs)",
    category: "Packaging & Boxes",
    amount: 9500,
    date: "2026-09-30",
    paymentMode: "BANK_TRANSFER",
    vendor: "PackBakers Solutions",
    invoiceNumber: "PB-9941",
    status: "PAID",
    recordedBy: "Admin",
    notes: "Custom 0.5kg and 1.0kg luxury matte chocolate boxes",
    createdAt: "2026-09-30T14:20:00.000Z",
    updatedAt: "2026-09-30T14:20:00.000Z",
  },
  {
    id: "exp-104",
    title: "TNEB Commercial Kitchen Power Bill - Nungambakkam",
    category: "Utilities (Power/Water/Gas)",
    amount: 12450,
    date: "2026-09-28",
    paymentMode: "UPI",
    vendor: "TNEB Chennai Central",
    invoiceNumber: "TNEB-04-98402",
    status: "PAID",
    recordedBy: "Admin",
    notes: "3-phase bakery ovens and blast chiller consumption",
    createdAt: "2026-09-28T16:00:00.000Z",
    updatedAt: "2026-09-28T16:00:00.000Z",
  },
  {
    id: "exp-105",
    title: "Commercial LPG 19kg Cylinders (4 Cylinders)",
    category: "Utilities (Power/Water/Gas)",
    amount: 6800,
    date: "2026-10-02",
    paymentMode: "CASH",
    vendor: "Indane Gas Agency Nungambakkam",
    invoiceNumber: "IND-2026-301",
    status: "PAID",
    recordedBy: "Selva (Head Chef)",
    notes: "Delivered to kitchen back dock",
    createdAt: "2026-10-02T08:45:00.000Z",
    updatedAt: "2026-10-02T08:45:00.000Z",
  },
  {
    id: "exp-106",
    title: "Pastry & Baking Staff Weekly Allowance & Overtime",
    category: "Staff Salaries & Daily Wages",
    amount: 16500,
    date: "2026-10-02",
    paymentMode: "BANK_TRANSFER",
    vendor: "Kitchen Team (4 Staff)",
    invoiceNumber: "PAY-WK-40",
    status: "PAID",
    recordedBy: "Desmond (Manager)",
    notes: "Weekly weekend wedding cake overtime distribution",
    createdAt: "2026-10-02T13:00:00.000Z",
    updatedAt: "2026-10-02T13:00:00.000Z",
  },
  {
    id: "exp-107",
    title: "Refrigerated Delivery Van Fuel & Tolls (Week 40)",
    category: "Delivery & Logistics",
    amount: 3200,
    date: "2026-10-02",
    paymentMode: "UPI",
    vendor: "Indian Oil Corp - Anna Salai",
    invoiceNumber: "IOC-49129",
    status: "PAID",
    recordedBy: "Desmond (Manager)",
    notes: "Deliveries across OMR, ECR, and Central Chennai",
    createdAt: "2026-10-02T14:30:00.000Z",
    updatedAt: "2026-10-02T14:30:00.000Z",
  },
  {
    id: "exp-108",
    title: "Convection Deck Oven Digital Thermostat Calibration",
    category: "Kitchen Equipment & Maintenance",
    amount: 2800,
    date: "2026-09-25",
    paymentMode: "UPI",
    vendor: "Metro Kitchen Equipments Chennai",
    invoiceNumber: "MKE-849",
    status: "PAID",
    recordedBy: "Selva (Head Chef)",
    notes: "Bi-annual oven heat uniformity inspection",
    createdAt: "2026-09-25T11:00:00.000Z",
    updatedAt: "2026-09-25T11:00:00.000Z",
  },
  {
    id: "exp-109",
    title: "Madagascar Bourbon Vanilla Pods & Pure Extract (3L)",
    category: "Raw Materials & Ingredients",
    amount: 5400,
    date: "2026-10-02",
    paymentMode: "UPI",
    vendor: "Bakersville India",
    invoiceNumber: "BV-59102",
    status: "PENDING",
    recordedBy: "Desmond (Manager)",
    notes: "Invoice received, payment scheduled upon delivery check",
    createdAt: "2026-10-02T15:20:00.000Z",
    updatedAt: "2026-10-02T15:20:00.000Z",
  },
];

let expensesCache: Expense[] = [...INITIAL_EXPENSES];
const listeners: Array<() => void> = [];

function emitChange() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error("Expense listener failed:", e);
    }
  });
}

export function subscribeExpenses(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export function getExpenses(): Expense[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        expensesCache = JSON.parse(stored);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expensesCache));
      }
    } catch (e) {
      console.warn("Could not read expenses from localStorage:", e);
    }
  }
  return [...expensesCache].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function saveExpenses(expenses: Expense[]): void {
  expensesCache = expenses;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.warn("Could not save expenses to localStorage:", e);
    }
  }
  emitChange();
}

export function addExpense(data: Omit<Expense, "id" | "createdAt" | "updatedAt">): Expense {
  const all = getExpenses();
  const now = new Date().toISOString();
  const newExpense: Expense = {
    ...data,
    id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newExpense, ...all];
  saveExpenses(updated);
  return newExpense;
}

export function updateExpense(id: string, updates: Partial<Expense>): Expense | null {
  const all = getExpenses();
  const idx = all.findIndex((e) => e.id === id);
  if (idx === -1) return null;

  const updatedExpense: Expense = {
    ...all[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  all[idx] = updatedExpense;
  saveExpenses(all);
  return updatedExpense;
}

export function deleteExpense(id: string): boolean {
  const all = getExpenses();
  const filtered = all.filter((e) => e.id !== id);
  if (filtered.length === all.length) return false;
  saveExpenses(filtered);
  return true;
}

export function getExpenseSummary(expensesList?: Expense[]): ExpenseSummary {
  const list = expensesList || getExpenses();
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const todayStr = now.toISOString().split("T")[0];

  let totalExpenses = 0;
  let thisMonthTotal = 0;
  let todayTotal = 0;
  let pendingCount = 0;
  let pendingAmount = 0;

  const categoryMap = new Map<ExpenseCategory, { amount: number; count: number }>();
  const paymentModeBreakdown: Record<PaymentMode, number> = {
    UPI: 0,
    CASH: 0,
    BANK_TRANSFER: 0,
    CARD: 0,
    CHEQUE: 0,
  };

  // Pre-initialize categories
  EXPENSE_CATEGORIES.forEach((cat) => categoryMap.set(cat, { amount: 0, count: 0 }));

  list.forEach((exp) => {
    totalExpenses += exp.amount;

    if (exp.date.startsWith(currentMonthStr)) {
      thisMonthTotal += exp.amount;
    }

    if (exp.date === todayStr) {
      todayTotal += exp.amount;
    }

    if (exp.status === "PENDING") {
      pendingCount += 1;
      pendingAmount += exp.amount;
    }

    // Category aggregation
    const catData = categoryMap.get(exp.category) || { amount: 0, count: 0 };
    catData.amount += exp.amount;
    catData.count += 1;
    categoryMap.set(exp.category, catData);

    // Payment mode aggregation
    if (paymentModeBreakdown[exp.paymentMode] !== undefined) {
      paymentModeBreakdown[exp.paymentMode] += exp.amount;
    }
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return {
    totalExpenses,
    thisMonthTotal,
    todayTotal,
    categoryBreakdown,
    paymentModeBreakdown,
    pendingCount,
    pendingAmount,
  };
}

export function exportExpensesToCsv(expensesList?: Expense[]): string {
  const list = expensesList || getExpenses();
  const headers = [
    "Expense ID",
    "Date",
    "Title / Description",
    "Category",
    "Amount (INR)",
    "Payment Mode",
    "Vendor / Payee",
    "Invoice / Receipt #",
    "Status",
    "Recorded By",
    "Notes",
  ];

  const rows = list.map((e) => [
    e.id,
    e.date,
    `"${(e.title || "").replace(/"/g, '""')}"`,
    `"${e.category}"`,
    e.amount,
    e.paymentMode,
    `"${(e.vendor || "").replace(/"/g, '""')}"`,
    `"${(e.invoiceNumber || "").replace(/"/g, '""')}"`,
    e.status,
    `"${(e.recordedBy || "").replace(/"/g, '""')}"`,
    `"${(e.notes || "").replace(/"/g, '""')}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
