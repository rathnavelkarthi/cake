"use client";

import React, { useState, useEffect } from "react";
import {
  ChefHat,
  Flame,
  Wind,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  Phone,
  Calendar,
  Eye,
  Plus,
  ArrowRight,
  Filter,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  subscribeOrders,
  updateOrderStatus,
  OrderItem,
} from "@/lib/orders/order-store";
import { ManualOrderModal } from "@/components/admin/ManualOrderModal";

const KITCHEN_STAGES: {
  id: OrderItem["orderStatus"];
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    id: "CONFIRMED",
    label: "Queue / Incoming",
    sublabel: "Awaiting Prep",
    icon: Clock,
    color: "border-stone-300 bg-stone-50/70",
  },
  {
    id: "IN_OVEN",
    label: "In Oven / Baking",
    sublabel: "Chef Selva Station",
    icon: Flame,
    color: "border-amber-300 bg-amber-50/50",
  },
  {
    id: "COOLING",
    label: "Cooling & Crumb",
    sublabel: "Resting Counter",
    icon: Wind,
    color: "border-sky-300 bg-sky-50/50",
  },
  {
    id: "DECORATING",
    label: "Artisanal Decorating",
    sublabel: "Chef Anbu Station",
    icon: Sparkles,
    color: "border-purple-300 bg-purple-50/50",
  },
  {
    id: "READY",
    label: "Ready for Dispatch",
    sublabel: "Passed QA",
    icon: CheckCircle2,
    color: "border-emerald-300 bg-emerald-50/60",
  },
];

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [selectedStation, setSelectedStation] = useState<"ALL" | "SELVA" | "ANBU">("ALL");
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    return subscribeOrders((updatedOrders) => {
      setOrders(updatedOrders);
    });
  }, []);

  const filteredOrders = orders.filter((order) => {
    // Filter out completed or cancelled from active kitchen board
    if (order.orderStatus === "COMPLETED" || order.orderStatus === "CANCELLED") {
      return false;
    }

    if (selectedStation === "SELVA") {
      return (
        order.assignedChef?.includes("Selva") ||
        order.orderStatus === "IN_OVEN" ||
        order.orderStatus === "CONFIRMED"
      );
    }
    if (selectedStation === "ANBU") {
      return (
        order.assignedChef?.includes("Anbu") ||
        order.orderStatus === "DECORATING" ||
        order.orderStatus === "COOLING"
      );
    }
    return true;
  });

  const getOrdersForStage = (stageId: OrderItem["orderStatus"]) => {
    return filteredOrders.filter((order) => {
      if (stageId === "CONFIRMED") {
        return (
          order.orderStatus === "CONFIRMED" ||
          order.orderStatus === "PREPARING" ||
          order.orderStatus === "PENDING_PAYMENT"
        );
      }
      if (stageId === "READY") {
        return (
          order.orderStatus === "READY" ||
          order.orderStatus === "READY_FOR_PICKUP" ||
          order.orderStatus === "OUT_FOR_DELIVERY"
        );
      }
      return order.orderStatus === stageId;
    });
  };

  const advanceOrderStatus = (
    orderId: string,
    currentStatus: OrderItem["orderStatus"]
  ) => {
    let nextStatus: OrderItem["orderStatus"] = "CONFIRMED";
    if (
      currentStatus === "CONFIRMED" ||
      currentStatus === "PREPARING" ||
      currentStatus === "PENDING_PAYMENT"
    ) {
      nextStatus = "IN_OVEN";
    } else if (currentStatus === "IN_OVEN") {
      nextStatus = "COOLING";
    } else if (currentStatus === "COOLING") {
      nextStatus = "DECORATING";
    } else if (currentStatus === "DECORATING") {
      nextStatus = "READY";
    } else if (
      currentStatus === "READY" ||
      currentStatus === "READY_FOR_PICKUP"
    ) {
      nextStatus = "COMPLETED";
    }

    updateOrderStatus(orderId, nextStatus);
  };

  const activeRushCount = orders.filter(
    (o) => o.isInstantOrder && o.orderStatus !== "COMPLETED"
  ).length;

  return (
    <div className="space-y-6">
      {/* Kitchen Header & Station Switcher */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-2 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-900 text-amber-50 shadow-xs">
              <ChefHat className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              Kitchen Display System (KDS)
            </h1>
            {activeRushCount > 0 && (
              <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-bold animate-pulse text-xs px-2.5 py-0.5">
                ⚡ {activeRushCount} Rush Active
              </Badge>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Real-time pastry & baking workstation live feed for Head Chef{" "}
            <strong>Selva</strong> and Confectionery Chef <strong>Anbu</strong>.
          </p>
        </div>

        {/* Station Filters & Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Station Selector */}
          <div className="flex rounded-lg border border-stone-200 bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setSelectedStation("ALL")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedStation === "ALL"
                  ? "bg-stone-900 text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              All Stations
            </button>
            <button
              type="button"
              onClick={() => setSelectedStation("SELVA")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedStation === "SELVA"
                  ? "bg-amber-900 text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              👨‍🍳 Selva (Head Chef)
            </button>
            <button
              type="button"
              onClick={() => setSelectedStation("ANBU")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedStation === "ANBU"
                  ? "bg-purple-900 text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              🎂 Anbu (Confectionery Chef)
            </button>
          </div>

          {/* Sound alert toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-9 text-xs border-stone-200 text-stone-700"
            title={soundEnabled ? "Mute order sound" : "Enable order sound"}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <VolumeX className="h-4 w-4 text-stone-400" />
            )}
          </Button>

          {/* Instant Order Button */}
          <Button
            size="sm"
            onClick={() => setIsManualModalOpen(true)}
            className="h-9 text-xs font-bold bg-amber-900 hover:bg-amber-950 text-white shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Instant Order
          </Button>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
        {KITCHEN_STAGES.map((stage) => {
          const stageOrders = getOrdersForStage(stage.id);
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className={`flex flex-col rounded-xl border ${stage.color} min-h-[550px] shadow-2xs transition-all`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-stone-200/70 bg-white/70 backdrop-blur-xs rounded-t-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-stone-100 text-stone-700">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">
                      {stage.label}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      {stage.sublabel}
                    </div>
                  </div>
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-200 text-[11px] font-bold text-stone-700">
                  {stageOrders.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="p-2.5 space-y-3 flex-1 overflow-y-auto max-h-[75vh]">
                {stageOrders.length === 0 ? (
                  <div className="py-12 text-center text-[11px] text-stone-400">
                    No active tickets
                  </div>
                ) : (
                  stageOrders.map((order) => {
                    const isRush = order.isInstantOrder;

                    return (
                      <div
                        key={order.id}
                        className={`rounded-lg border bg-white p-3.5 shadow-xs transition-all space-y-2.5 ${
                          isRush
                            ? "border-amber-400 ring-2 ring-amber-300/40"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        {/* Card Top: Order # & Rush Badge */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-xs font-bold text-stone-900">
                            {order.orderNumber}
                          </span>
                          {isRush ? (
                            <Badge className="bg-amber-600 text-white text-[10px] px-1.5 py-0 font-bold">
                              ⚡ INSTANT
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-stone-400 font-medium">
                              {order.date}
                            </span>
                          )}
                        </div>

                        {/* Customer & Delivery Schedule */}
                        <div className="text-xs">
                          <div className="font-semibold text-stone-800 flex items-center justify-between">
                            <span>{order.customerName}</span>
                            <span className="text-[11px] text-stone-500 font-normal">
                              {order.fulfilmentType}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5">
                            <Calendar className="h-3 w-3 text-stone-400" />
                            <span>{order.deliveryDate}</span>
                            <span>•</span>
                            <span className="font-medium text-stone-700 truncate max-w-[120px]">
                              {order.deliveryTimeSlot.split(" ")[0]}
                            </span>
                          </div>
                        </div>

                        {/* Cake Core Spec: Flavour & KG */}
                        <div className="rounded-md bg-stone-50 p-2 border border-stone-150">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-900 leading-tight">
                              {order.flavour}
                            </span>
                            <span className="text-xs font-extrabold text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded">
                              {order.weightKg}
                            </span>
                          </div>

                          {order.isEggless && (
                            <div className="mt-1 text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                              <span>✓ 100% Dedicated Eggless</span>
                            </div>
                          )}

                          {order.cakeMessage && (
                            <div className="mt-1.5 text-[11px] text-stone-600 italic bg-white p-1 rounded border border-stone-200">
                              &ldquo;{order.cakeMessage}&rdquo;
                            </div>
                          )}
                        </div>

                        {/* Reference Image Thumbnail & Assigned Chef */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 text-[11px]">
                          <div className="flex items-center gap-1.5 text-stone-600 truncate">
                            <ChefHat className="h-3 w-3 text-stone-400 shrink-0" />
                            <span className="truncate">
                              {order.assignedChef?.split(" ")[0] || "Kitchen"}
                            </span>
                          </div>

                          {order.referenceImage && (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(order.referenceImage || null)}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 hover:text-amber-950"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={order.referenceImage}
                                alt="Ref"
                                className="h-4 w-4 rounded-xs object-cover border border-stone-300"
                              />
                              <span>Ref Photo</span>
                            </button>
                          )}
                        </div>

                        {/* Action: Transition to next stage */}
                        <div className="pt-1">
                          <Button
                            size="sm"
                            onClick={() =>
                              advanceOrderStatus(order.id, order.orderStatus)
                            }
                            className="w-full h-7 text-[11px] font-semibold bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <span>
                              {stage.id === "CONFIRMED" && "Send to Oven (Selva)"}
                              {stage.id === "IN_OVEN" && "Start Cooling"}
                              {stage.id === "COOLING" && "Send to Deco (Anbu)"}
                              {stage.id === "DECORATING" && "Pass QA & Mark Ready"}
                              {stage.id === "READY" && "Complete Order"}
                            </span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Instant Order Modal */}
      <ManualOrderModal
        open={isManualModalOpen}
        onOpenChange={setIsManualModalOpen}
        defaultChef={
          selectedStation === "SELVA"
            ? "Selva (Head Chef)"
            : selectedStation === "ANBU"
            ? "Anbu (Confectionery Chef)"
            : "General Kitchen"
        }
      />

      {/* Reference Image Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 z-10"
            >
              <X className="h-4 w-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Kitchen Reference"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
