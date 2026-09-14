"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { addInstantOrder, OrderItem } from "@/lib/orders/order-store";
import { SAMPLE_CAKES } from "@/data/sample-cakes";

interface ManualOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated?: (order: OrderItem) => void;
  defaultChef?: "Selva (Head Chef)" | "Anbu (Confectionery Chef)" | "General Kitchen";
}

const COMMON_FLAVOURS = [
  "Belgian Dark Chocolate Truffle",
  "Classic Red Velvet",
  "Mascarpone & Fresh Fig",
  "Roasted Hazelnut Praline",
  "Alphonso Mango (Seasonal)",
  "Basque Burnt Cheesecake",
  "Fresh Strawberry Chantilly",
];

const WEIGHT_OPTIONS = [
  "0.5 kg",
  "1.0 kg",
  "1.5 kg",
  "2.0 kg",
  "3.0 kg (Two Tier)",
  "4.0 kg (Two Tier)",
  "5.0 kg (Three Tier)",
];

const TIME_SLOTS = [
  "Morning (10:00 AM to 1:00 PM)",
  "Afternoon (1:00 PM to 5:00 PM)",
  "Evening (5:00 PM to 8:30 PM)",
  "Rush / Urgent (Next 2 Hours)",
];

export function ManualOrderModal({
  open,
  onOpenChange,
  onOrderCreated,
  defaultChef = "General Kitchen",
}: ManualOrderModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("+91 ");
  const [fulfilmentType, setFulfilmentType] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split("T")[0]);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState(TIME_SLOTS[2]);
  const [flavour, setFlavour] = useState(COMMON_FLAVOURS[0]);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerMobile.trim()) return;

    setLoading(true);

    const refCake = SAMPLE_CAKES.find((c) => c.id === selectedReferenceSample);
    const chosenFlavour = flavour === "Custom" ? customFlavour : flavour;

    try {
      const order = addInstantOrder({
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        fulfilmentType,
        deliveryDate,
        deliveryTimeSlot: isRush ? "⚡ Rush Instant Order (Immediate Kitchen Prep)" : deliveryTimeSlot,
        flavour: chosenFlavour || "Belgian Dark Chocolate Truffle",
        weightKg,
        isEggless,
        cakeMessage: cakeMessage.trim(),
        referenceImage: refCake?.image,
        referenceImageName: refCake?.title,
        assignedChef,
        notes: `${isRush ? "[RUSH INSTANT ORDER] " : ""}${notes.trim()}`,
        price: customPrice ? parseInt(customPrice) : undefined,
      });

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
                Manager & Admin order dispatch. Immediately routes to Head Chef Selva and Confectionery Chef Anbu.
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
                placeholder="e.g. Priya Sundaram / Walk-in Customer"
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

          {/* Section 3: Cake Specifications (Flavour & Weight) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Cake className="h-3.5 w-3.5 text-stone-400" /> Flavour *
              </label>
              <Select value={flavour} onValueChange={setFlavour}>
                <SelectTrigger className="h-9 text-xs border-stone-300">
                  <SelectValue placeholder="Select Flavour" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_FLAVOURS.map((f) => (
                    <SelectItem key={f} value={f} className="text-xs">
                      {f}
                    </SelectItem>
                  ))}
                  <SelectItem value="Custom" className="text-xs">
                    + Custom Specified Flavour
                  </SelectItem>
                </SelectContent>
              </Select>
              {flavour === "Custom" && (
                <Input
                  value={customFlavour}
                  onChange={(e) => setCustomFlavour(e.target.value)}
                  placeholder="Enter custom flavour name..."
                  className="mt-1 h-8 text-xs border-stone-300"
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Weight (KG) *
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
              placeholder="e.g. Happy 30th Birthday Priya! / Best Wishes"
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
                className="h-9 text-xs border-stone-300"
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
