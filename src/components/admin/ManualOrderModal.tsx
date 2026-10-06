"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  Calendar,
  Clock,
  Cake,
  User,
  Phone,
  ChefHat,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Search,
  X,
  Check,
  ChevronDown,
  Layers,
} from "lucide-react";
import { addInstantOrder, OrderItem } from "@/lib/orders/order-store";
import { SAMPLE_CAKES } from "@/data/sample-cakes";
import {
  getInventoryProducts,
  subscribeInventory,
  AdminProductItem,
} from "@/lib/db/admin-data";

export interface ProductOption {
  id: string | number;
  name: string;
  category: string;
  price: number;
  isEggless: boolean;
  imageUrl?: string;
  description?: string;
}

// Built-in baseline catalogue so dropdown is instant & robust even before DB hydration
const DEFAULT_CATALOGUE: ProductOption[] = [
  // Signature Cakes
  { id: "cat-1", name: "Belgian Dark Chocolate Truffle", category: "Cakes", price: 650, isEggless: true, imageUrl: "/images/hero-truffle.jpg" },
  { id: "cat-2", name: "Classic Red Velvet Gateau", category: "Cakes", price: 708, isEggless: true, imageUrl: "/custom-cakes/cake-2.jpg" },
  { id: "cat-3", name: "Ferrero Rocher Grandeur", category: "Cakes", price: 872, isEggless: true, imageUrl: "/custom-cakes/cake-3.jpg" },
  { id: "cat-4", name: "Rasmalai Melts Celebration Cake", category: "Cakes", price: 817, isEggless: true, imageUrl: "/custom-cakes/cake-4.jpg" },
  { id: "cat-5", name: "Mascarpone & Fresh Fig", category: "Cakes", price: 850, isEggless: true, imageUrl: "/custom-cakes/cake-2.jpg" },
  { id: "cat-6", name: "Roasted Hazelnut Praline", category: "Cakes", price: 820, isEggless: true, imageUrl: "/custom-cakes/cake-1.jpg" },
  { id: "cat-7", name: "Alphonso Mango (Seasonal)", category: "Cakes", price: 750, isEggless: true, imageUrl: "/custom-cakes/cake-4.jpg" },
  { id: "cat-8", name: "Fresh Strawberry Chantilly", category: "Cakes", price: 800, isEggless: true, imageUrl: "/custom-cakes/cake-5.jpg" },
  { id: "cat-9", name: "Madras Ghee Celebration Cake", category: "Cakes", price: 620, isEggless: true, imageUrl: "/images/hero-truffle.jpg" },
  
  // Cheesecakes & Tarts
  { id: "cat-10", name: "Basque Burnt Cheesecake", category: "Cheesecakes & Tarts", price: 890, isEggless: false, imageUrl: "/custom-cakes/cake-3.jpg" },
  { id: "cat-11", name: "Philadelphia Slow-Baked Cheesecake", category: "Cheesecakes & Tarts", price: 850, isEggless: false, imageUrl: "/custom-cakes/cake-1.jpg" },
  { id: "cat-12", name: "Belgian Dark Ganache Fruit Tart", category: "Cheesecakes & Tarts", price: 280, isEggless: true, imageUrl: "/custom-cakes/cake-2.jpg" },

  // Brownies & Desserts
  { id: "cat-13", name: "Classic Molten Fudge Walnut Brownies (Box of 4)", category: "Brownies", price: 450, isEggless: true, imageUrl: "/images/fudge-brownies.jpg" },
  { id: "cat-14", name: "Nutella Sea Salt Brownies (Box of 4)", category: "Brownies", price: 520, isEggless: true, imageUrl: "/images/fudge-brownies.jpg" },
  { id: "cat-15", name: "Lotus Biscoff Fudgy Blondies (Box of 4)", category: "Brownies", price: 480, isEggless: true, imageUrl: "/images/fudge-brownies.jpg" },

  // Artisanal Bagels
  { id: "cat-16", name: "Artisanal Toasted Sesame Bagels (Pack of 4)", category: "Bagels", price: 320, isEggless: true, imageUrl: "/images/bagels.jpg" },
  { id: "cat-17", name: "Everything Garlic & Onion Bagels (Pack of 4)", category: "Bagels", price: 340, isEggless: true, imageUrl: "/images/bagels.jpg" },

  // Savouries & Buns
  { id: "cat-18", name: "Korean Cream Cheese Garlic Bun", category: "Savouries", price: 220, isEggless: true, imageUrl: "/images/korean-bun.jpg" },
  { id: "cat-19", name: "Paneer Tikka Flaky Brioche Puff", category: "Savouries", price: 180, isEggless: true, imageUrl: "/images/korean-bun.jpg" },

  // French Pastries
  { id: "cat-20", name: "Classic French Opera Pastry Slice", category: "Pastries", price: 280, isEggless: true, imageUrl: "/custom-cakes/cake-3.jpg" },
  { id: "cat-21", name: "Pure Belgian Dark Truffle Pastry", category: "Pastries", price: 240, isEggless: true, imageUrl: "/images/hero-truffle.jpg" },
];

const WEIGHT_OPTIONS = [
  "0.5 kg",
  "1.0 kg",
  "1.5 kg",
  "2.0 kg",
  "3.0 kg (Two Tier)",
  "4.0 kg (Two Tier)",
  "5.0 kg (Three Tier)",
  "Standard Box / Pack",
  "Single Portion / Piece",
];

const TIME_SLOTS = [
  "Morning (10:00 AM to 1:00 PM)",
  "Afternoon (1:00 PM to 5:00 PM)",
  "Evening (5:00 PM to 8:30 PM)",
  "Rush / Urgent (Next 2 Hours)",
];

interface ManualOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated?: (order: OrderItem) => void;
  defaultChef?: "Selva (Head Chef)" | "Anbu (Confectionery Chef)" | "General Kitchen";
}

export function ManualOrderModal({
  open,
  onOpenChange,
  onOrderCreated,
  defaultChef = "General Kitchen",
}: ManualOrderModalProps) {
  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("+91 ");
  const [fulfilmentType, setFulfilmentType] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split("T")[0]);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState(TIME_SLOTS[2]);
  const [flavour, setFlavour] = useState(DEFAULT_CATALOGUE[0].name);
  const [customFlavour, setCustomFlavour] = useState("");
  const [weightKg, setWeightKg] = useState("1.5 kg");
  const [isEggless, setIsEggless] = useState(true);
  const [cakeMessage, setCakeMessage] = useState("");
  const [assignedChef, setAssignedChef] = useState<
    "Selva (Head Chef)" | "Anbu (Confectionery Chef)" | "General Kitchen"
  >(defaultChef);
  const [isRush, setIsRush] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedReferenceSample, setSelectedReferenceSample] = useState(SAMPLE_CAKES[0].id);
  const [customPrice, setCustomPrice] = useState("1850");
  const [loading, setLoading] = useState(false);

  // Products Catalogue State
  const [products, setProducts] = useState<ProductOption[]>(DEFAULT_CATALOGUE);
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const pickerContainerRef = useRef<HTMLDivElement>(null);

  // Sync Products from Inventory & Supabase
  useEffect(() => {
    const syncFromInventory = () => {
      const inv = getInventoryProducts();
      if (inv && inv.length > 0) {
        setProducts((prev) => {
          const map = new Map<string, ProductOption>();
          // Keep defaults
          DEFAULT_CATALOGUE.forEach((p) => map.set(p.name.toLowerCase().trim(), p));
          // Overlay previous
          prev.forEach((p) => map.set(p.name.toLowerCase().trim(), p));
          // Overlay inventory
          inv.forEach((item) => {
            map.set(item.name.toLowerCase().trim(), {
              id: item.id,
              name: item.name,
              category: item.category || "Cakes",
              price: item.price,
              isEggless: item.isEggless ?? true,
              imageUrl: item.imageUrl || "/images/hero-truffle.jpg",
              description: item.description,
            });
          });
          return Array.from(map.values());
        });
      }
    };

    syncFromInventory();
    const unsub = subscribeInventory(syncFromInventory);

    // Fetch live from Supabase /api/products?all=true
    fetch("/api/products?all=true")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          setProducts((prev) => {
            const map = new Map<string, ProductOption>();
            DEFAULT_CATALOGUE.forEach((p) => map.set(p.name.toLowerCase().trim(), p));
            prev.forEach((p) => map.set(p.name.toLowerCase().trim(), p));
            data.products.forEach((p: any) => {
              map.set(p.name.toLowerCase().trim(), {
                id: p.id,
                name: p.name,
                category:
                  p.category_name ||
                  (p.category_id
                    ? p.category_id.charAt(0).toUpperCase() + p.category_id.slice(1)
                    : "Cakes"),
                price: Number(p.price || 500),
                isEggless: p.is_eggless !== false,
                imageUrl: p.image_url || "/images/hero-truffle.jpg",
                description: p.description,
              });
            });
            return Array.from(map.values());
          });
        }
      })
      .catch((err) => console.warn("Failed to fetch products for modal:", err));

    return () => unsub();
  }, []);

  // Distinct categories available in products
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["all", ...Array.from(set)];
  }, [products]);

  // Filtered products based on search query & category filter
  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategoryFilter === "all" ||
        p.category.toLowerCase() === selectedCategoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, productSearch, selectedCategoryFilter]);

  // Handle Product Selection
  const handleSelectProduct = (p: ProductOption) => {
    setFlavour(p.name);
    setIsEggless(p.isEggless);

    // Auto-update price according to weight or product default
    let calculated = p.price;
    if (weightKg === "1.5 kg" && p.category === "Cakes" && p.price < 1200) {
      calculated = Math.round(p.price * 1.5);
    } else if (weightKg === "2.0 kg" && p.category === "Cakes") {
      calculated = Math.round(p.price * 2);
    }
    setCustomPrice(calculated.toString());

    // Sync reference sample if matches
    if (p.imageUrl) {
      const match = SAMPLE_CAKES.find(
        (c) =>
          c.title.toLowerCase().includes(p.name.toLowerCase()) ||
          c.recommendedFlavours?.some((rf) => rf.toLowerCase() === p.name.toLowerCase())
      );
      if (match) setSelectedReferenceSample(match.id);
    }

    setIsProductPickerOpen(false);
    setProductSearch("");
  };

  const handleSelectCustom = () => {
    setFlavour("Custom");
    setIsProductPickerOpen(false);
    setProductSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerMobile.trim()) return;

    setLoading(true);

    const refCake = SAMPLE_CAKES.find((c) => c.id === selectedReferenceSample);
    const chosenFlavour =
      flavour === "Custom"
        ? (customFlavour.trim() || "Custom Bespoke Cake")
        : flavour;
    const finalPrice = customPrice ? parseInt(customPrice, 10) : 1850;

    const matchedProduct = products.find(
      (p) => p.name.toLowerCase() === chosenFlavour.toLowerCase()
    );
    const finalImage = matchedProduct?.imageUrl || refCake?.image;

    try {
      // 1. Immediately write to local order store for instant UI feedback
      const order = addInstantOrder({
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        fulfilmentType,
        deliveryDate,
        deliveryTimeSlot: isRush
          ? "⚡ Rush Instant Order (Immediate Kitchen Prep)"
          : deliveryTimeSlot,
        flavour: chosenFlavour,
        weightKg,
        isEggless,
        cakeMessage: cakeMessage.trim(),
        referenceImage: finalImage,
        referenceImageName: refCake?.title || chosenFlavour,
        assignedChef,
        notes: `${isRush ? "[RUSH INSTANT ORDER] " : ""}${notes.trim()}`,
        price: finalPrice,
      });

      // 2. Persist to Supabase Database via POST /api/orders so daily sales count permanently
      try {
        await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerName: customerName.trim(),
            customerMobile: customerMobile.trim(),
            subtotal: finalPrice,
            total: finalPrice,
            paymentStatus: "PAID",
            paymentMethod: "CASH",
            orderStatus: "CONFIRMED",
            isInstantOrder: true,
            fulfilmentType,
            requestedDate: deliveryDate,
            requestedTime: isRush
              ? "⚡ Rush Instant Order (Immediate Kitchen Prep)"
              : deliveryTimeSlot,
            customerNotes: cakeMessage.trim() || null,
            adminNotes: `${isRush ? "[RUSH INSTANT ORDER] " : ""}[CHEF: ${assignedChef}] [INSTANT_ORDER] ${notes.trim()}`.trim(),
            items: [
              {
                name: chosenFlavour,
                quantity: 1,
                price: finalPrice,
                variantLabel: weightKg,
                isEggless,
              },
            ],
          }),
        });
      } catch (dbErr) {
        console.warn("Failed to write instant order to DB:", dbErr);
      }

      if (onOrderCreated) {
        onOrderCreated(order);
      }

      onOpenChange(false);
      // Reset fields
      setCustomerName("");
      setCustomerMobile("+91 ");
      setCakeMessage("");
      setNotes("");
      setIsRush(false);
    } finally {
      setLoading(false);
    }
  };

  // Find currently selected product object if matches
  const currentSelectedProduct = products.find((p) => p.name === flavour);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-stone-200 p-6 sm:p-7">
        <DialogHeader className="pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2 text-amber-800">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900">
              <Zap className="h-5 w-5 fill-amber-500 text-amber-700" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-stone-900">
                Create Instant / Manual Kitchen Order
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500">
                Manager & Admin order dispatch. Dispatches directly to Head Chef Selva and Confectionery Chef Anbu.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Rush Priority Alert Toggle */}
          <div className="flex items-center justify-between rounded-xl bg-amber-50/70 border border-amber-200 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-600 text-white shadow-xs">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Rush Priority Order (Immediate Kitchen Alert)
                </div>
                <div className="text-[11px] text-amber-800">
                  Flashing alert on Kitchen Display with priority sound indicator.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsRush(!isRush)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isRush ? "bg-amber-600" : "bg-stone-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isRush ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Section 1: Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-stone-400" /> Customer Name *
              </label>
              <Input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Walk-in Customer / Online Order"
                className="h-9 text-xs border-stone-300"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-stone-400" /> Phone *
              </label>
              <Input
                required
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                placeholder="+91 98401 23456"
                className="h-9 text-xs border-stone-300"
              />
            </div>
          </div>

          {/* Section 2: Date & Time & Fulfillment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-stone-400" /> Required Date *
              </label>
              <Input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="h-9 text-xs border-stone-300"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-stone-400" /> Time Window
              </label>
              <Select value={deliveryTimeSlot} onValueChange={setDeliveryTimeSlot}>
                <SelectTrigger className="h-9 text-xs border-stone-300">
                  <SelectValue placeholder="Select window" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot} className="text-xs">
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Fulfillment
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  type="button"
                  variant={fulfilmentType === "PICKUP" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFulfilmentType("PICKUP")}
                  className={`h-9 text-xs font-semibold ${
                    fulfilmentType === "PICKUP"
                      ? "bg-amber-900 text-white"
                      : "text-stone-700 border-stone-200"
                  }`}
                >
                  Pickup
                </Button>
                <Button
                  type="button"
                  variant={fulfilmentType === "DELIVERY" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFulfilmentType("DELIVERY")}
                  className={`h-9 text-xs font-semibold ${
                    fulfilmentType === "DELIVERY"
                      ? "bg-amber-900 text-white"
                      : "text-stone-700 border-stone-200"
                  }`}
                >
                  Delivery
                </Button>
              </div>
            </div>
          </div>

          {/* Section 3: Cake & Product Selection (ALL Catalogue Products) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-2 relative" ref={pickerContainerRef}>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Cake className="h-3.5 w-3.5 text-stone-400" /> Product / Flavour *
                </label>
                <span className="text-[10px] text-stone-500 font-medium bg-stone-100 px-1.5 py-0.5 rounded">
                  {products.length} Products in Menu
                </span>
              </div>

              {/* Product Selector Button Trigger */}
              <button
                type="button"
                onClick={() => setIsProductPickerOpen(!isProductPickerOpen)}
                className="w-full h-9 px-3 text-xs bg-white border border-stone-300 rounded-md flex items-center justify-between hover:border-amber-800 transition-colors text-left focus:outline-none focus:ring-1 focus:ring-amber-800"
              >
                <div className="flex items-center gap-2 truncate">
                  {flavour === "Custom" ? (
                    <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      {customFlavour ? customFlavour : "Custom Specified Flavour"}
                    </span>
                  ) : currentSelectedProduct ? (
                    <>
                      <span className="font-semibold text-stone-900 truncate">
                        {currentSelectedProduct.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-normal">
                        {currentSelectedProduct.category}
                      </span>
                      <span className="text-[11px] font-bold text-amber-900">
                        ₹{currentSelectedProduct.price}
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold text-stone-900 truncate">{flavour}</span>
                  )}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-stone-400 shrink-0 ml-1" />
              </button>

              {/* Backdrop to close picker on outside click */}
              {isProductPickerOpen && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProductPickerOpen(false)}
                />
              )}

              {/* Searchable Product Dropdown Menu */}
              {isProductPickerOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[340px]">
                  {/* Search Input Box */}
                  <div className="p-2 border-b border-stone-100 bg-stone-50/80">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
                      <input
                        type="text"
                        autoFocus
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search all cakes, brownies, bagels, cheesecakes..."
                        className="w-full h-8 pl-8 pr-7 text-xs bg-white border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-800"
                      />
                      {productSearch && (
                        <button
                          type="button"
                          onClick={() => setProductSearch("")}
                          className="absolute right-2 top-2 text-stone-400 hover:text-stone-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex items-center gap-1 mt-1.5 overflow-x-auto pb-1 text-[10px]">
                      {availableCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategoryFilter(cat)}
                          className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                            selectedCategoryFilter === cat
                              ? "bg-amber-900 text-white font-semibold"
                              : "bg-white text-stone-600 hover:bg-stone-200 border border-stone-200"
                          }`}
                        >
                          {cat === "all" ? "All Items" : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scrollable Product List */}
                  <div className="overflow-y-auto p-1 divide-y divide-stone-100 flex-1">
                    {/* Pinned Custom Flavour Option */}
                    <button
                      type="button"
                      onClick={handleSelectCustom}
                      className={`w-full flex items-center justify-between p-2 rounded-md text-xs text-left hover:bg-amber-50 transition-colors ${
                        flavour === "Custom"
                          ? "bg-amber-50 text-amber-950 font-bold"
                          : "text-amber-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-amber-100 flex items-center justify-center text-amber-800">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold">+ Custom Specified Flavour / Bespoke Cake</div>
                          <div className="text-[10px] text-stone-500 font-normal">
                            Type any custom cake flavour or bespoke design
                          </div>
                        </div>
                      </div>
                      {flavour === "Custom" && <Check className="h-4 w-4 text-amber-800" />}
                    </button>

                    {/* Filtered Catalogue Items */}
                    {filteredProducts.map((p) => {
                      const isSelected = flavour === p.name;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectProduct(p)}
                          className={`w-full flex items-center justify-between p-2 rounded-md text-xs text-left hover:bg-amber-50/80 transition-colors ${
                            isSelected
                              ? "bg-amber-50 font-semibold text-amber-950"
                              : "text-stone-800"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate pr-2">
                            <div className="h-8 w-8 rounded-md bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                              <img
                                src={p.imageUrl || "/images/hero-truffle.jpg"}
                                alt={p.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/images/hero-truffle.jpg";
                                }}
                              />
                            </div>
                            <div className="truncate">
                              <div className="truncate font-medium">{p.name}</div>
                              <div className="text-[10px] text-stone-400 flex items-center gap-1.5 font-normal">
                                <span>{p.category}</span>
                                {p.isEggless && (
                                  <span className="text-emerald-700 font-medium">🌱 Eggless</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-stone-900">₹{p.price}</span>
                            {isSelected && <Check className="h-4 w-4 text-amber-800" />}
                          </div>
                        </button>
                      );
                    })}

                    {filteredProducts.length === 0 && (
                      <div className="p-4 text-center text-xs text-stone-500">
                        No products match &ldquo;{productSearch}&rdquo;. Choose &ldquo;Custom Specified Flavour&rdquo; above.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Custom Flavour Input Field */}
              {flavour === "Custom" && (
                <div className="mt-1.5">
                  <Input
                    value={customFlavour}
                    onChange={(e) => setCustomFlavour(e.target.value)}
                    placeholder="Enter bespoke flavour (e.g. Pistachio Rose Raspberry / Lavender Earl Grey)..."
                    className="h-8 text-xs border-amber-300 focus:border-amber-800"
                  />
                </div>
              )}
            </div>

            {/* Weight / Variant Selection */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Weight / Size *
              </label>
              <Select value={weightKg} onValueChange={setWeightKg}>
                <SelectTrigger className="h-9 text-xs border-stone-300">
                  <SelectValue placeholder="Select Weight" />
                </SelectTrigger>
                <SelectContent>
                  {WEIGHT_OPTIONS.map((w) => (
                    <SelectItem key={w} value={w} className="text-xs">
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section 4: Inscription & Eggless */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Cake Inscription / Message
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="modal-eggless"
                  checked={isEggless}
                  onChange={(e) => setIsEggless(e.target.checked)}
                  className="h-3.5 w-3.5 accent-emerald-600 rounded"
                />
                <label htmlFor="modal-eggless" className="text-xs font-medium text-emerald-800 cursor-pointer">
                  100% Dedicated Eggless
                </label>
              </div>
            </div>
            <Input
              value={cakeMessage}
              onChange={(e) => setCakeMessage(e.target.value)}
              placeholder="e.g. Happy 30th Birthday! / Best Wishes"
              className="h-9 text-xs border-stone-300"
            />
          </div>

          {/* Section 5: Assigned Chef & Reference Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <ChefHat className="h-3.5 w-3.5 text-stone-400" /> Assign Kitchen Station
              </label>
              <Select
                value={assignedChef}
                onValueChange={(val: any) => setAssignedChef(val)}
              >
                <SelectTrigger className="h-9 text-xs border-stone-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Selva (Head Chef)" className="text-xs">
                    Selva (Head Chef - Sponge & Tiering)
                  </SelectItem>
                  <SelectItem value="Anbu (Confectionery Chef)" className="text-xs">
                    Anbu (Confectionery Chef - Piping & Deco)
                  </SelectItem>
                  <SelectItem value="General Kitchen" className="text-xs">
                    General Kitchen (Both Stations)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-stone-400" /> Reference Archive Photo
              </label>
              <Select
                value={selectedReferenceSample}
                onValueChange={setSelectedReferenceSample}
              >
                <SelectTrigger className="h-9 text-xs border-stone-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_CAKES.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.title} ({c.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Kitchen Prep Instructions & Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specific instructions for Chef Selva or Chef Anbu..."
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-800 resize-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Total Price (₹)
              </label>
              <Input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="h-9 text-xs border-stone-300 font-bold text-amber-950"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs border-stone-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="h-9 text-xs font-bold bg-amber-900 hover:bg-amber-950 text-white shadow-xs"
            >
              {loading ? "Dispatching..." : "⚡ Dispatch to Kitchen Display"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
