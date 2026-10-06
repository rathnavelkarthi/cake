"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Eye,
  ChevronDown,
  Plus,
  Zap,
  ChefHat,
  Calendar,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  subscribeOrders,
  updateOrderStatus,
  confirmPaymentAndPushToKitchen,
  OrderItem,
} from "@/lib/orders/order-store";
import { ManualOrderModal } from "@/components/admin/ManualOrderModal";
import { Phone, MessageSquare, Check, AlertCircle as AlertIcon } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [dbOrders, setDbOrders] = useState<OrderItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Map a raw Supabase row to our OrderItem shape
  const mapDbRow = (row: any): OrderItem => {
    let effectiveStatus = (row.order_status as OrderItem["orderStatus"]) || "PENDING_PAYMENT";
    if (effectiveStatus === "PREPARING" && row.admin_notes) {
      const match = row.admin_notes.match(/\[STAGE:([A-Z_]+)\]/);
      if (match && match[1]) {
        effectiveStatus = match[1] as OrderItem["orderStatus"];
      }
    }
    return {
      id: row.id,
      orderNumber: row.order_number,
      customerName: row.customer_name,
      customerMobile: row.customer_mobile,
      customerEmail: row.customer_email || undefined,
      total: Number(row.total),
      paymentStatus: (row.payment_status as OrderItem["paymentStatus"]) || "PENDING",
      orderStatus: effectiveStatus,
      fulfilmentType: (row.fulfilment_type as "PICKUP" | "DELIVERY") || "PICKUP",
      branchId: row.branch_id || undefined,
      branchName: row.branch_name || undefined,
      deliveryDistanceKm: row.delivery_distance_km || undefined,
      deliveryAddress: row.delivery_address || undefined,
      deliveryFee: row.delivery_fee || undefined,
      itemsCount: Array.isArray(row.items) ? row.items.length : 1,
      date: new Date(row.created_at).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      deliveryDate: row.requested_date || "Today",
      deliveryTimeSlot: row.requested_time || "ASAP",
      flavour: Array.isArray(row.items) && row.items[0]
        ? (typeof row.items[0] === "string" ? row.items[0] : row.items[0].name || "Custom Cake")
        : "Custom Cake",
      weightKg: Array.isArray(row.items) && row.items[0]?.variantLabel
        ? row.items[0].variantLabel
        : "1 kg",
      isEggless: Array.isArray(row.items) && row.items[0]?.isEggless !== undefined ? Boolean(row.items[0].isEggless) : false,
      cakeMessage: row.customer_notes || undefined,
      assignedChef: (() => {
        const match = row.admin_notes?.match(/\[CHEF:\s*([^\]]+)\]/);
        return match ? match[1].trim() : (row.assigned_chef || "Selva (Head Chef)");
      })(),
      isInstantOrder: Boolean(
        row.is_instant_order ||
        (row.admin_notes && (row.admin_notes.includes("INSTANT") || row.admin_notes.includes("RUSH"))) ||
        (row.requested_time && row.requested_time.includes("Rush Instant"))
      ),
      notes: row.admin_notes || undefined,
      items: Array.isArray(row.items)
        ? row.items.map((i: any) => (typeof i === "string" ? i : `${i.quantity || 1}x ${i.name || "Item"}`))
        : [],
      createdAt: row.created_at,
    };
  };

  const fetchFromDb = async (quiet = false) => {
    if (!quiet) setIsSyncing(true);
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.orders) && data.orders.length > 0) {
        setDbOrders(data.orders.map(mapDbRow));
      }
    } catch (err) {
      console.error("Failed to fetch orders from DB:", err);
    } finally {
      if (!quiet) setIsSyncing(false);
    }
  };

  // Merge: DB orders first (real), then local orders not already in DB (by orderNumber)
  const mergedOrders = React.useMemo(() => {
    const dbNums = new Set(dbOrders.map((o) => o.orderNumber));
    const localOnly = orders.filter((o) => !dbNums.has(o.orderNumber));
    return [...dbOrders, ...localOnly];
  }, [dbOrders, orders]);

  // Real-time Daily Sales & Operations KPI
  const todayMetrics = React.useMemo(() => {
    const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

    const isTodayOrder = (o: OrderItem) => {
      if (o.createdAt) {
        try {
          const dStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(o.createdAt));
          if (dStr === todayStr) return true;
        } catch {}
      }
      if (o.date && (o.date.toLowerCase().includes("today") || o.date.includes(todayStr))) return true;
      if (o.deliveryDate === todayStr || o.deliveryDate === "Today") return true;
      return false;
    };

    const todayOrders = mergedOrders.filter(isTodayOrder);
    const paidTodayOrders = todayOrders.filter((o) => o.paymentStatus === "PAID");

    const dailySales = paidTodayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const instantPaidOrders = paidTodayOrders.filter(
      (o) => o.isInstantOrder || (o.notes && (o.notes.includes("INSTANT") || o.notes.includes("RUSH")))
    );
    const instantSales = instantPaidOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const activeKitchen = mergedOrders.filter(
      (o) =>
        o.orderStatus === "CONFIRMED" ||
        o.orderStatus === "IN_OVEN" ||
        o.orderStatus === "COOLING" ||
        o.orderStatus === "DECORATING" ||
        o.orderStatus === "PREPARING"
    ).length;

    const fulfilledCount = todayOrders.filter(
      (o) =>
        o.orderStatus === "READY_FOR_PICKUP" ||
        o.orderStatus === "READY" ||
        o.orderStatus === "COMPLETED" ||
        o.orderStatus === "OUT_FOR_DELIVERY"
    ).length;

    return {
      dailySales,
      instantSales,
      paidCount: paidTodayOrders.length,
      instantCount: instantPaidOrders.length,
      activeKitchen,
      fulfilledCount,
    };
  }, [mergedOrders]);

  useEffect(() => {
    // Subscribe to local store for instant order changes
    const unsub = subscribeOrders((allOrders) => {
      setOrders(allOrders);
    });

    // Fetch from Supabase immediately then every 15s
    fetchFromDb();
    const interval = setInterval(() => fetchFromDb(true), 15000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const handleConfirmPaymentAndPush = async (order: OrderItem) => {
    try {
      // Optimistically update React state immediately
      setDbOrders((prev) =>
        prev.map((o) =>
          o.id === order.id || o.orderNumber === order.orderNumber
            ? {
                ...o,
                paymentStatus: "PAID",
                orderStatus: "PREPARING",
                assignedChef: order.assignedChef || "Selva (Head Chef)",
              }
            : o
        )
      );

      // Update local store immediately for instant UI feedback
      confirmPaymentAndPushToKitchen(order.id, order.assignedChef || "Selva (Head Chef)");

      // Persist to Supabase and send WhatsApp confirmation
      const res = await fetch("/api/orders/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerMobile: order.customerMobile,
          customerName: order.customerName,
          assignedChef: order.assignedChef || "Selva (Head Chef)",
        }),
      });

      if (res.ok) {
        // Re-fetch DB orders so the verified status shows immediately
        await fetchFromDb(true);
      }

      setActionSuccess(`Payment verified. Order ${order.orderNumber} dispatched to kitchen.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error("Payment confirmation failed:", err);
    }
  };

  const filteredOrders = mergedOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.customerMobile.includes(search) ||
      order.flavour?.toLowerCase().includes(search.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "unpaid")
      return matchesSearch && (order.paymentStatus !== "PAID" || order.orderStatus === "PENDING_PAYMENT");
    if (activeTab === "rush") return matchesSearch && order.isInstantOrder;
    if (activeTab === "pending")
      return (
        matchesSearch &&
        (order.orderStatus === "CONFIRMED" ||
          order.orderStatus === "IN_OVEN" ||
          order.orderStatus === "COOLING" ||
          order.orderStatus === "DECORATING" ||
          order.orderStatus === "PREPARING" ||
          order.orderStatus === "PENDING_PAYMENT")
      );
    if (activeTab === "ready")
      return (
        matchesSearch &&
        (order.orderStatus === "READY_FOR_PICKUP" ||
          order.orderStatus === "READY" ||
          order.orderStatus === "OUT_FOR_DELIVERY")
      );
    if (activeTab === "completed")
      return matchesSearch && order.orderStatus === "COMPLETED";

    return matchesSearch;
  });

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderItem["orderStatus"]
  ) => {
    // 1. Optimistically update local react state
    setDbOrders((prev) =>
      prev.map((o) =>
        o.id === orderId || o.orderNumber === orderId
          ? { ...o, orderStatus: newStatus }
          : o
      )
    );

    // 2. Update local order store
    updateOrderStatus(orderId, newStatus);

    // 3. Persist to API
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          orderStatus: newStatus,
        }),
      });
      fetchFromDb(true);
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              Order Fulfillment & Kitchen Dispatch
            </h1>
            <Badge className="bg-amber-100 text-amber-900 border-amber-200 text-xs font-semibold">
              Live Sync
            </Badge>
          </div>
          <p className="text-sm text-stone-500">
            Manager & Admin operations. Dispatches directly to Head Chef Selva and Confectionery Chef Anbu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsManualModalOpen(true)}
            className="h-9 text-xs font-bold bg-amber-900 hover:bg-amber-950 text-white shadow-xs flex items-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>Create Instant Order</span>
          </Button>
        </div>
      </div>

      {/* Daily Sales & Operational KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Daily Sales (Today) */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Today's Daily Sales
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">
            ₹{todayMetrics.dailySales.toLocaleString("en-IN")}
          </div>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-stone-500">
            <TrendingUp className="h-3 w-3 text-emerald-600" />
            <span>{todayMetrics.paidCount} paid orders today (online + counter)</span>
          </p>
        </div>

        {/* Instant / Rush Sales */}
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-900">
              Instant Order Sales
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <Zap className="h-4 w-4 fill-amber-500 text-amber-600" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-950">
            ₹{todayMetrics.instantSales.toLocaleString("en-IN")}
          </div>
          <p className="mt-1 text-[11px] text-amber-800 font-medium">
            {todayMetrics.instantCount} counter / urgent dispatches today
          </p>
        </div>

        {/* Active Kitchen Queue */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Active Kitchen Queue
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <ChefHat className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">
            {todayMetrics.activeKitchen}
          </div>
          <p className="mt-1 text-[11px] text-stone-500">
            Baking, cooling & confectionery
          </p>
        </div>

        {/* Fulfilled / Ready */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Fulfilled / Ready
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">
            {todayMetrics.fulfilledCount}
          </div>
          <p className="mt-1 text-[11px] text-stone-500">
            Dispatched or completed today
          </p>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-stone-100">
            <TabsTrigger value="all" className="text-xs">
              All ({mergedOrders.length})
            </TabsTrigger>
            <TabsTrigger value="unpaid" className="text-xs text-rose-800 font-semibold">
              Verify Payment ({mergedOrders.filter((o) => o.paymentStatus !== "PAID").length})
            </TabsTrigger>
            <TabsTrigger value="rush" className="text-xs text-amber-800 font-semibold">
              ⚡ Rush Orders ({mergedOrders.filter((o) => o.isInstantOrder).length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">
              In Kitchen (
              {
                mergedOrders.filter(
                  (o) =>
                    o.orderStatus === "CONFIRMED" ||
                    o.orderStatus === "IN_OVEN" ||
                    o.orderStatus === "COOLING" ||
                    o.orderStatus === "DECORATING" ||
                    o.orderStatus === "PREPARING"
                ).length
              }
              )
            </TabsTrigger>
            <TabsTrigger value="ready" className="text-xs">
              Ready for Dispatch (
              {
                mergedOrders.filter(
                  (o) =>
                    o.orderStatus === "READY_FOR_PICKUP" ||
                    o.orderStatus === "READY" ||
                    o.orderStatus === "OUT_FOR_DELIVERY"
                ).length
              }
              )
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              Completed (
              {mergedOrders.filter((o) => o.orderStatus === "COMPLETED").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
          <Input
            type="search"
            placeholder="Search by order #, phone, cake..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-xs border-stone-200 bg-white"
          />
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-stone-400 hover:text-stone-700">
            ×
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-stone-50/70">
            <TableRow>
              <TableHead className="text-xs font-semibold">Order #</TableHead>
              <TableHead className="text-xs font-semibold">Customer</TableHead>
              <TableHead className="text-xs font-semibold">Cake Details</TableHead>
              <TableHead className="text-xs font-semibold">Outlet / Delivery</TableHead>
              <TableHead className="text-xs font-semibold">Assigned Station</TableHead>
              <TableHead className="text-xs font-semibold">Status & Stage</TableHead>
              <TableHead className="text-right text-xs font-semibold">Payment & Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-stone-500 text-sm">
                  No orders match this filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-stone-50/50">
                  {/* Order Number & Rush alert */}
                  <TableCell className="font-semibold text-xs text-stone-900">
                    <div className="flex items-center gap-1.5">
                      <span>{order.orderNumber}</span>
                      {order.isInstantOrder && (
                        <span className="rounded bg-amber-100 text-amber-900 px-1 py-0.2 text-[9px] font-extrabold">
                          ⚡ RUSH
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-400 font-normal mt-0.5">
                      {order.date}
                    </div>
                  </TableCell>

                  {/* Customer */}
                  <TableCell className="text-xs">
                    <div className="font-medium text-stone-900">{order.customerName}</div>
                    <div className="text-[11px] text-stone-500">{order.customerMobile}</div>
                  </TableCell>

                  {/* Cake Specs */}
                  <TableCell className="text-xs">
                    <div className="font-semibold text-stone-900">
                      {order.flavour || order.items[0]}
                    </div>
                    <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                      <span className="font-bold text-amber-900">{order.weightKg}</span>
                      {order.isEggless && (
                        <span className="text-emerald-700 font-medium">• Eggless</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Fulfillment Type & Scheduled Date */}
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-stone-800">
                      {order.fulfilmentType === "DELIVERY" ? (
                        <Truck className="h-3.5 w-3.5 text-amber-800 shrink-0" />
                      ) : (
                        <MapPin className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                      )}
                      <span className="font-semibold line-clamp-1">
                        {order.fulfilmentType === "PICKUP"
                          ? (order.branchName || "Casablanca Studio (Nungambakkam)")
                          : `Delivery (${order.deliveryDistanceKm || "3"} km)`}
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-2.5 w-2.5 text-stone-400" />
                      <span>{order.deliveryDate || "Today"}</span>
                      {order.deliveryFee ? (
                        <span>• Fee: ₹{order.deliveryFee}</span>
                      ) : null}
                    </div>
                  </TableCell>

                  {/* Station / Chef */}
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-1 text-stone-700 font-medium">
                      <ChefHat className="h-3.5 w-3.5 text-stone-400" />
                      <span>{order.assignedChef?.split(" ")[0] || "Kitchen"}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 font-normal">
                      ₹{order.total.toLocaleString("en-IN")} •{" "}
                      <span className={order.paymentStatus === "PAID" ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </TableCell>

                  {/* Order Status with Quick Change Dropdown */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs flex items-center gap-1 hover:bg-stone-100"
                        >
                          <Badge
                            className={`text-[10px] font-semibold ${
                              order.orderStatus === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : order.orderStatus === "IN_OVEN"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : order.orderStatus === "COOLING"
                                ? "bg-sky-100 text-sky-800 border-sky-200"
                                : order.orderStatus === "DECORATING"
                                ? "bg-purple-100 text-purple-800 border-purple-200"
                                : order.orderStatus === "READY" ||
                                  order.orderStatus === "READY_FOR_PICKUP"
                                ? "bg-stone-900 text-white"
                                : "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {order.orderStatus.replace(/_/g, " ")}
                          </Badge>
                          <ChevronDown className="h-3 w-3 text-stone-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48 text-xs">
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(order.id, "CONFIRMED")}
                        >
                          Queue: Confirmed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(order.id, "IN_OVEN")}
                        >
                          Oven: Baking (Selva)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(order.id, "COOLING")}
                        >
                          Counter: Cooling
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(order.id, "DECORATING")}
                        >
                          Decorating: Piping (Anbu)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(order.id, "READY")}
                        >
                          Mark Ready for Dispatch
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                        >
                          Mark Completed / Handed Over
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                          className="text-red-600 focus:text-red-700"
                        >
                          Mark Cancelled
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>

                  {/* Actions: Quick verify & View Details Dialog */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {order.paymentStatus !== "PAID" && (
                        <Button
                          size="sm"
                          onClick={() => handleConfirmPaymentAndPush(order)}
                          className="h-7 px-2 text-[10px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs flex items-center gap-1"
                          title="Confirm UPI payment & push to Kitchen chefs"
                        >
                          <Check className="h-3 w-3" />
                          <span>Push to Kitchen</span>
                        </Button>
                      )}

                      <a
                        href={`tel:${order.customerMobile}`}
                        className="h-7 w-7 rounded-md border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                        title={`Call customer at ${order.customerMobile}`}
                      >
                        <Phone className="h-3 w-3" />
                      </a>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        className="h-7 w-7 p-0 hover:bg-stone-100"
                      >
                        <Eye className="h-3.5 w-3.5 text-stone-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Detail View Modal */}
      {selectedOrder && (
        <Dialog
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
        >
          <DialogContent className="max-w-md bg-white border-stone-200 p-6">
            <DialogHeader className="pb-3 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-bold text-stone-900">
                  {selectedOrder.orderNumber}
                </DialogTitle>
                {selectedOrder.isInstantOrder && (
                  <Badge className="bg-amber-600 text-white text-[10px]">
                    ⚡ INSTANT KITCHEN ORDER
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-xs text-stone-500">
                Created: {selectedOrder.date}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              {/* Customer */}
              <div className="rounded-lg bg-stone-50 p-3 space-y-1">
                <div className="font-bold text-stone-900 text-sm">
                  {selectedOrder.customerName}
                </div>
                <div className="text-stone-600">{selectedOrder.customerMobile}</div>
                {selectedOrder.customerEmail && (
                  <div className="text-stone-500">{selectedOrder.customerEmail}</div>
                )}
                <div className="text-stone-700 pt-1 font-semibold flex items-center gap-1">
                  <span>Fulfillment: {selectedOrder.fulfilmentType}</span>
                  <span>•</span>
                  <span>Target: {selectedOrder.deliveryDate} ({selectedOrder.deliveryTimeSlot})</span>
                </div>
              </div>

              {/* Cake Details */}
              <div className="rounded-lg border border-stone-200 p-3 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-900 text-sm">
                    {selectedOrder.flavour}
                  </span>
                  <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded">
                    {selectedOrder.weightKg}
                  </span>
                </div>
                {selectedOrder.cakeMessage && (
                  <div className="italic text-stone-700 bg-stone-50 p-2 rounded">
                    &ldquo;{selectedOrder.cakeMessage}&rdquo;
                  </div>
                )}
                <div className="text-stone-500 flex justify-between pt-1">
                  <span>Preparation: {selectedOrder.isEggless ? "100% Eggless" : "Traditional"}</span>
                  <span>Station: {selectedOrder.assignedChef}</span>
                </div>
              </div>

              {/* Reference image if present */}
              {selectedOrder.referenceImage && (
                <div className="rounded-lg border border-stone-200 p-2.5 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedOrder.referenceImage}
                    alt="Ref"
                    className="h-14 w-14 rounded-md object-cover border border-stone-200"
                  />
                  <div>
                    <div className="font-semibold text-stone-900">
                      {selectedOrder.referenceImageName || "Design Reference"}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Used by kitchen for decorating reference
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="p-2.5 rounded bg-amber-50/60 border border-amber-200/60 text-amber-950">
                  <span className="font-bold">Staff Notes: </span>
                  {selectedOrder.notes}
                </div>
              )}

              {/* Total & Status */}
              <div className="flex justify-between items-center pt-2 border-t border-stone-100 font-bold text-sm">
                <span>Total Amount:</span>
                <span>₹{selectedOrder.total.toLocaleString("en-IN")} ({selectedOrder.paymentStatus})</span>
              </div>

              {/* Payment verification action */}
              {selectedOrder.paymentStatus !== "PAID" && (
                <div className="pt-3 border-t border-stone-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        handleConfirmPaymentAndPush(selectedOrder);
                        setSelectedOrder((prev) =>
                          prev ? { ...prev, paymentStatus: "PAID", orderStatus: "PREPARING" } : null
                        );
                      }}
                      className="flex-1 h-9 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Payment & Push to Kitchen</span>
                    </Button>
                    <a href={`tel:${selectedOrder.customerMobile}`} className="shrink-0">
                      <Button variant="outline" className="h-9 px-3 text-xs border-stone-300 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Guest</span>
                      </Button>
                    </a>
                  </div>
                  <p className="text-[10px] text-stone-400 text-center">
                    Triggers Evolution WhatsApp confirmation to {selectedOrder.customerMobile} and alerts kitchen queue.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Manual Instant Order Modal */}
      <ManualOrderModal
        open={isManualModalOpen}
        onOpenChange={setIsManualModalOpen}
        onOrderCreated={() => {
          fetchFromDb(true);
        }}
      />
    </div>
  );
}
