"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Sparkles,
  Search,
  X,
  Check,
  Plus,
  Trash2,
  Minus,
  ShoppingBag,
} from "lucide-react";
import { addInstantOrder, OrderItem } from "@/lib/orders/order-store";
import { SAMPLE_CAKES } from "@/data/sample-cakes";
import {
  getInventoryProducts,
  subscribeInventory,
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

export interface SelectedOrderItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  variant: string;
  isEggless: boolean;
  imageUrl?: string;
  isCustom?: boolean;
}

// Built-in baseline catalogue so dropdown is instant & robust even before DB hydration
const DEFAULT_CATALOGUE: ProductOption[] = [
  // Signature Cakes
  { id: "cat-1", name: "Belgian Dark Chocolate Truffle", category: "Signature Cakes", price: 650, isEggless: true, imageUrl: "/images/hero-truffle.jpg" },
  { id: "cat-2", name: "Classic Red Velvet Gateau", category: "Signature Cakes", price: 708, isEggless: true, imageUrl: "/custom-cakes/cake-2.jpg" },
  { id: "cat-3", name: "Ferrero Rocher Grandeur", category: "Signature Cakes", price: 872, isEggless: true, imageUrl: "/custom-cakes/cake-3.jpg" },
  { id: "cat-4", name: "Rasmalai Melts Celebration Cake", category: "Signature Cakes", price: 817, isEggless: true, imageUrl: "/custom-cakes/cake-4.jpg" },
  { id: "cat-5", name: "Mascarpone & Fresh Fig", category: "Signature Cakes", price: 850, isEggless: true, imageUrl: "/custom-cakes/cake-2.jpg" },
  { id: "cat-6", name: "Roasted Hazelnut Praline", category: "Signature Cakes", price: 820, isEggless: true, imageUrl: "/custom-cakes/cake-1.jpg" },
  { id: "cat-7", name: "Alphonso Mango (Seasonal)", category: "Signature Cakes", price: 750, isEggless: true, imageUrl: "/custom-cakes/cake-4.jpg" },
  { id: "cat-8", name: "Fresh Strawberry Chantilly", category: "Signature Cakes", price: 800, isEggless: true, imageUrl: "/custom-cakes/cake-5.jpg" },
  { id: "cat-9", name: "Madras Ghee Celebration Cake", category: "Signature Cakes", price: 620, isEggless: true, imageUrl: "/images/hero-truffle.jpg" },
  
  // Cheesecakes & Tarts
  { id: "cat-10", name: "Basque Burnt Cheesecake", category: "Cheesecakes & Tarts", price: 890, isEggless: false, imageUrl: "/custom-cakes/cake-3.jpg" },
  { id: "cat-11", name: "Philadelphia Slow-Baked Cheesecake", category: "Cheesecakes & Tarts", price: 850, isEggless: false, imageUrl: "/custom-cakes/cake-1.jpg" },
  { id: "cat-12", name: "Belgian Dark Ganache Fruit Tart", category: "Cheesecakes & Tarts", price: 280, isEggless: true, imageUrl: "/custom-cakes/cake-2.jpg" },

  // Brownies & Desserts
  { id: "cat-13", name: "Classic Molten Fudge Walnut Brownies (Box of 4)", category: "Brownies & Desserts", price: 450, isEggless: true, imageUrl: "/images/fudge-brownies.jpg" },
  { id: "cat-14", name: "Nutella Sea Salt Brownies (Box of 4)", category: "Brownies & Desserts", price: 520, isEggless: true, imageUrl: "/images/fudge-brownies.jpg" },
  { id: "cat-15", name: "Lotus Biscoff Fudgy Blondies (Box of 4)", category: "Brownies & Desserts", price: 480, isEggless: true, imageUrl: "/images/fudge-brownies.jpg" },

  // Artisanal Bagels
  { id: "cat-16", name: "Artisanal Toasted Sesame Bagels (Pack of 4)", category: "Artisanal Bagels", price: 320, isEggless: true, imageUrl: "/images/bagels.jpg" },
  { id: "cat-17", name: "Everything Garlic & Onion Bagels (Pack of 4)", category: "Artisanal Bagels", price: 340, isEggless: true, imageUrl: "/images/bagels.jpg" },

  // Savouries & Buns
  { id: "cat-18", name: "Korean Cream Cheese Garlic Bun", category: "Savouries & Buns", price: 220, isEggless: true, imageUrl: "/images/korean-bun.jpg" },
  { id: "cat-19", name: "Paneer Tikka Flaky Brioche Puff", category: "Savouries & Buns", price: 180, isEggless: true, imageUrl: "/images/korean-bun.jpg" },

  // French Pastries
  { id: "cat-20", name: "Classic French Opera Pastry Slice", category: "French Pastries", price: 280, isEggless: true, imageUrl: "/custom-cakes/cake-3.jpg" },
  { id: "cat-21", name: "Pure Belgian Dark Truffle Pastry", category: "French Pastries", price: 240, isEggless: true, imageUrl: "/images/hero-truffle.jpg" },
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
  const [isEggless, setIsEggless] = useState(true);
  const [cakeMessage, setCakeMessage] = useState("");
  const [assignedChef, setAssignedChef] = useState<
    "Selva (Head Chef)" | "Anbu (Confectionery Chef)" | "General Kitchen"
  >(defaultChef);
  const [isRush, setIsRush] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedReferenceSample, setSelectedReferenceSample] = useState(SAMPLE_CAKES[0].id);
  const [loading, setLoading] = useState(false);

  // Products Catalogue State
  const [products, setProducts] = useState<ProductOption[]>(DEFAULT_CATALOGUE);
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Selected Order Items
  const [selectedItems, setSelectedItems] = useState<SelectedOrderItem[]>([
    {
      id: "item-default",
      name: "Belgian Dark Chocolate Truffle",
      category: "Signature Cakes",
      price: 1850,
      quantity: 1,
      variant: "1.5 kg",
      isEggless: true,
      imageUrl: "/images/hero-truffle.jpg",
    },
  ]);

  // Custom Bespoke Item Draft state
  const [showCustomItemForm, setShowCustomItemForm] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("1850");
  const [customItemVariant, setCustomItemVariant] = useState("1.5 kg");

  // Custom Total Override
  const [customPriceOverride, setCustomPriceOverride] = useState<string>("");

  // Sync Products from Inventory & Supabase
  useEffect(() => {
    const syncFromInventory = () => {
      const inv = getInventoryProducts();
      if (inv && inv.length > 0) {
        setProducts((prev) => {
          const map = new Map<string, ProductOption>();
          DEFAULT_CATALOGUE.forEach((p) => map.set(p.name.toLowerCase().trim(), p));
          prev.forEach((p) => map.set(p.name.toLowerCase().trim(), p));
          inv.forEach((item) => {
            map.set(item.name.toLowerCase().trim(), {
              id: item.id,
              name: item.name,
              category: item.category || "Signature Cakes",
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
                    : "Signature Cakes"),
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

  // Calculate items subtotal
  const itemsSubtotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [selectedItems]);

  // Final effective price (respect manual override if set, else itemsSubtotal)
  const finalCalculatedPrice = useMemo(() => {
    if (customPriceOverride !== "") {
      const parsed = parseInt(customPriceOverride, 10);
      return isNaN(parsed) ? itemsSubtotal : parsed;
    }
    return itemsSubtotal;
  }, [customPriceOverride, itemsSubtotal]);

  // Helper to calculate price based on variant
  const getCalculatedItemPrice = (basePrice: number, variant: string, category: string) => {
    const isCake = category.toLowerCase().includes("cake");
    if (!isCake) return basePrice;

    if (variant === "0.5 kg") return Math.round(basePrice * 0.65);
    if (variant === "1.0 kg") return basePrice;
    if (variant === "1.5 kg") return Math.round(basePrice * 1.5);
    if (variant === "2.0 kg") return Math.round(basePrice * 2.0);
    if (variant.includes("3.0")) return Math.round(basePrice * 3.0);
    if (variant.includes("4.0")) return Math.round(basePrice * 4.0);
    if (variant.includes("5.0")) return Math.round(basePrice * 5.0);
    if (variant.includes("Single")) return Math.round(basePrice * 0.4);
    return basePrice;
  };

  // Add Product to Selected Items
  const handleAddProduct = (p: ProductOption) => {
    // Check if already in order
    const existingIndex = selectedItems.findIndex((it) => it.name.toLowerCase() === p.name.toLowerCase());
    if (existingIndex >= 0) {
      // Increment quantity
      setSelectedItems((prev) =>
        prev.map((it, idx) =>
          idx === existingIndex ? { ...it, quantity: it.quantity + 1 } : it
        )
      );
    } else {
      const defaultVariant = p.category.toLowerCase().includes("cake") ? "1.0 kg" : "Standard Box / Pack";
      const calculatedPrice = getCalculatedItemPrice(p.price, defaultVariant, p.category);
      setSelectedItems((prev) => [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: p.name,
          category: p.category,
          price: calculatedPrice,
          quantity: 1,
          variant: defaultVariant,
          isEggless: p.isEggless,
          imageUrl: p.imageUrl,
        },
      ]);
    }

    // Sync reference sample image if matches
    if (p.imageUrl) {
      const match = SAMPLE_CAKES.find(
        (c) =>
          c.title.toLowerCase().includes(p.name.toLowerCase()) ||
          c.recommendedFlavours?.some((rf) => rf.toLowerCase() === p.name.toLowerCase())
      );
      if (match) setSelectedReferenceSample(match.id);
    }
  };

  // Add Custom Bespoke Item
  const handleAddCustomItem = () => {
    if (!customItemName.trim()) return;
    const priceNum = parseInt(customItemPrice, 10) || 1850;
    setSelectedItems((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: customItemName.trim(),
        category: "Bespoke Cake",
        price: priceNum,
        quantity: 1,
        variant: customItemVariant,
        isEggless: isEggless,
        imageUrl: "/images/hero-truffle.jpg",
        isCustom: true,
      },
    ]);
    setCustomItemName("");
    setCustomItemPrice("1850");
    setShowCustomItemForm(false);
  };

  // Quantity controls
  const handleUpdateQuantity = (id: string, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((it) => {
          if (it.id === id) {
            const nextQty = it.quantity + delta;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter(Boolean) as SelectedOrderItem[]
    );
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Update Item Variant
  const handleUpdateVariant = (id: string, newVariant: string) => {
    setSelectedItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const matchedProd = products.find((p) => p.name.toLowerCase() === it.name.toLowerCase());
          const basePrice = matchedProd ? matchedProd.price : it.price;
          const updatedPrice = getCalculatedItemPrice(basePrice, newVariant, it.category);
          return {
            ...it,
            variant: newVariant,
            price: updatedPrice,
          };
        }
        return it;
      })
    );
  };

  // Submit Order Dispatch
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerMobile.trim()) return;
    if (selectedItems.length === 0) {
      alert("Please select at least one product for the kitchen order.");
      return;
    }

    setLoading(true);

    const refCake = SAMPLE_CAKES.find((c) => c.id === selectedReferenceSample);
    const primaryItem = selectedItems[0];
    const chosenFlavour = primaryItem ? primaryItem.name : "Belgian Dark Chocolate Truffle";
    const chosenWeight = primaryItem ? primaryItem.variant : "1.5 kg";
    const finalImage = primaryItem?.imageUrl || refCake?.image || "/images/hero-truffle.jpg";

    const formattedItemStrings = selectedItems.map(
      (it) => `${it.quantity}x ${it.name} (${it.variant}) - ₹${it.price * it.quantity}`
    );

    const apiItemsPayload = selectedItems.map((it) => ({
      name: it.name,
      quantity: it.quantity,
      price: it.price,
      variantLabel: it.variant,
      isEggless: it.isEggless,
    }));

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
        weightKg: chosenWeight,
        isEggless,
        cakeMessage: cakeMessage.trim(),
        referenceImage: finalImage,
        referenceImageName: refCake?.title || chosenFlavour,
        assignedChef,
        notes: `${isRush ? "[RUSH INSTANT ORDER] " : ""}${notes.trim()}`,
        price: finalCalculatedPrice,
        items: formattedItemStrings,
        itemsCount: selectedItems.length,
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
            subtotal: finalCalculatedPrice,
            total: finalCalculatedPrice,
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
            items: apiItemsPayload,
          }),
        });
      } catch (dbErr) {
        console.warn("Failed to write instant order to DB:", dbErr);
      }

      if (onOrderCreated) {
        onOrderCreated(order);
      }

      onOpenChange(false);
      // Reset form
      setCustomerName("");
      setCustomerMobile("+91 ");
      setCakeMessage("");
      setNotes("");
      setIsRush(false);
      setCustomPriceOverride("");
      setSelectedItems([
        {
          id: "item-default",
          name: "Belgian Dark Chocolate Truffle",
          category: "Signature Cakes",
          price: 1850,
          quantity: 1,
          variant: "1.5 kg",
          isEggless: true,
          imageUrl: "/images/hero-truffle.jpg",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto bg-white border-stone-200 p-6 sm:p-7">
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
                Manager & Admin order dispatch. Routes directly to Head Chef Selva and Confectionery Chef Anbu.
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

          {/* Section 3: ORDER PRODUCTS & ITEMS (CORE SECTION) */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-amber-100 text-amber-900">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <label className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Order Items ({selectedItems.length})
                </label>
                <span className="text-[11px] font-semibold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-full">
                  ₹{itemsSubtotal.toLocaleString("en-IN")} Subtotal
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCustomItemForm(!showCustomItemForm)}
                className="h-7 text-[11px] border-amber-300 text-amber-900 hover:bg-amber-50"
              >
                <Sparkles className="h-3 w-3 mr-1 text-amber-600" />
                {showCustomItemForm ? "Close Bespoke Form" : "+ Add Custom Bespoke Cake"}
              </Button>
            </div>

            {/* Custom Bespoke Item Entry Form */}
            {showCustomItemForm && (
              <div className="p-3 bg-white border border-amber-200 rounded-lg space-y-2">
                <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  Add Custom Bespoke Cake / Product
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    placeholder="Bespoke Cake Name (e.g. Pistachio Raspberry 3-Tier)"
                    className="h-8 text-xs border-stone-300 sm:col-span-2"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={customItemPrice}
                      onChange={(e) => setCustomItemPrice(e.target.value)}
                      placeholder="Price (₹)"
                      className="h-8 text-xs border-stone-300 w-24"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCustomItem}
                      className="h-8 text-xs bg-amber-900 hover:bg-amber-950 text-white shrink-0"
                    >
                      Add Item
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Items List */}
            {selectedItems.length === 0 ? (
              <div className="p-4 bg-white border border-dashed border-stone-300 rounded-lg text-center text-xs text-stone-500">
                No items added yet. Search and click &ldquo;+ Add to Order&rdquo; from the product catalogue below.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-2.5 bg-white border border-stone-200 rounded-lg shadow-2xs hover:border-amber-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate w-full sm:w-auto">
                      <div className="h-10 w-10 rounded-md bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                        <img
                          src={item.imageUrl || "/images/hero-truffle.jpg"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/hero-truffle.jpg";
                          }}
                        />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-stone-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <span className="bg-stone-100 px-1.5 py-0.2 rounded text-stone-600">
                            {item.category}
                          </span>
                          {item.isEggless && (
                            <span className="text-emerald-700 font-medium">🌱 Eggless</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      {/* Weight / Variant Select */}
                      <div className="w-32">
                        <Select
                          value={item.variant}
                          onValueChange={(val) => handleUpdateVariant(item.id, val)}
                        >
                          <SelectTrigger className="h-7 text-[11px] border-stone-200 bg-stone-50/50">
                            <SelectValue />
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

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-stone-200 rounded-md bg-stone-50">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="h-7 w-6 flex items-center justify-center text-stone-600 hover:bg-stone-200 rounded-l transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="h-7 px-2 flex items-center justify-center text-xs font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="h-7 w-6 flex items-center justify-center text-stone-600 hover:bg-stone-200 rounded-r transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Item Total Price */}
                      <div className="w-16 text-right">
                        <span className="text-xs font-bold text-stone-900">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Delete Item */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* BROWSE & ADD PRODUCTS SECTION */}
            <div className="pt-2 border-t border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Cake className="h-3.5 w-3.5 text-stone-400" />
                  Product Catalogue ({products.length} Items Available)
                </label>
                <span className="text-[10px] text-stone-500">
                  Click any product to add to order
                </span>
              </div>

              {/* Product Search Box */}
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products (e.g. Belgian Truffle, Red Velvet, Fudge Brownies, Bagels)..."
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
              <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-2 text-[10px]">
                {availableCategories.slice(0, 10).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                      selectedCategoryFilter === cat
                        ? "bg-amber-900 text-white font-semibold"
                        : "bg-white text-stone-600 hover:bg-stone-200 border border-stone-200"
                    }`}
                  >
                    {cat === "all" ? "All Products" : cat}
                  </button>
                ))}
              </div>

              {/* Scrollable Products Grid / List */}
              <div className="max-h-52 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2 border border-stone-200 rounded-lg p-2 bg-white">
                {filteredProducts.map((p) => {
                  const isInCart = selectedItems.some((it) => it.name.toLowerCase() === p.name.toLowerCase());
                  const cartItem = selectedItems.find((it) => it.name.toLowerCase() === p.name.toLowerCase());

                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                        isInCart
                          ? "border-amber-300 bg-amber-50/50"
                          : "border-stone-150 hover:border-stone-300 hover:bg-stone-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-1">
                        <div className="h-8 w-8 rounded bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
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
                          <div className="text-xs font-semibold text-stone-900 truncate">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-stone-500 flex items-center gap-1.5">
                            <span>₹{p.price}</span>
                            <span>•</span>
                            <span className="text-stone-400">{p.category}</span>
                            {p.isEggless && (
                              <span className="text-emerald-700 font-medium">🌱</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleAddProduct(p)}
                        className={`h-7 px-2.5 text-[11px] font-semibold shrink-0 ${
                          isInCart
                            ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                            : "bg-stone-900 text-white hover:bg-amber-900"
                        }`}
                      >
                        {isInCart ? (
                          <>
                            <Check className="h-3 w-3 mr-1 text-emerald-600" />
                            Added ({cartItem?.quantity})
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3 mr-0.5" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <div className="col-span-2 p-4 text-center text-xs text-stone-500">
                    No products match &ldquo;{productSearch}&rdquo;. Try another search or use &ldquo;+ Add Custom Bespoke Cake&rdquo; above.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Inscription & Eggless Guarantee */}
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
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Total Price (₹)
                </label>
                {customPriceOverride !== "" && (
                  <button
                    type="button"
                    onClick={() => setCustomPriceOverride("")}
                    className="text-[10px] text-amber-800 hover:underline"
                  >
                    Reset Auto
                  </button>
                )}
              </div>
              <Input
                type="number"
                value={customPriceOverride !== "" ? customPriceOverride : finalCalculatedPrice.toString()}
                onChange={(e) => setCustomPriceOverride(e.target.value)}
                placeholder={itemsSubtotal.toString()}
                className="h-9 text-xs border-stone-300 font-bold text-amber-950"
              />
              <p className="text-[10px] text-stone-400">
                Auto-calculated from items (editable for manual discounts)
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <div className="text-xs text-stone-500">
              <span className="font-semibold text-stone-900">{selectedItems.length} Item(s)</span> in order • Total:{" "}
              <span className="font-bold text-amber-900">₹{finalCalculatedPrice.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center gap-2.5">
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
                disabled={loading || selectedItems.length === 0}
                className="h-9 text-xs font-bold bg-amber-900 hover:bg-amber-950 text-white shadow-xs"
              >
                {loading ? "Dispatching..." : "⚡ Dispatch to Kitchen Display"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
