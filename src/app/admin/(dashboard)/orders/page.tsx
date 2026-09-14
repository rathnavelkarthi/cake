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
  OrderItem,
} from "@/lib/orders/order-store";
import { ManualOrderModal } from "@/components/admin/ManualOrderModal";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  useEffect(() => {
    return subscribeOrders((allOrders) => {
      setOrders(allOrders);
    });
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.customerMobile.includes(search) ||
      order.flavour?.toLowerCase().includes(search.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "rush") return matchesSearch && order.isInstantOrder;
    if (activeTab === "pending")
      return (
        matchesSearch &&
        (order.orderStatus === "PENDING_PAYMENT" ||
          order.orderStatus === "CONFIRMED" ||
          order.orderStatus === "IN_OVEN" ||
          order.orderStatus === "COOLING" ||
          order.orderStatus === "DECORATING" ||
          order.orderStatus === "PREPARING")
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

  const handleUpdateStatus = (
    orderId: string,
    newStatus: OrderItem["orderStatus"]
  ) => {
    updateOrderStatus(orderId, newStatus);
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

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-stone-100">
            <TabsTrigger value="all" className="text-xs">
              All ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="rush" className="text-xs text-amber-800 font-semibold">
              ⚡ Rush Orders ({orders.filter((o) => o.isInstantOrder).length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">
              In Kitchen (
              {
                orders.filter(
                  (o) =>
                    o.orderStatus === "CONFIRMED" ||
                    o.orderStatus === "IN_OVEN" ||
                    o.orderStatus === "COOLING" ||
                    o.orderStatus === "DECORATING" ||
                    o.orderStatus === "PREPARING" ||
                    o.orderStatus === "PENDING_PAYMENT"
                ).length
              }
              )
            </TabsTrigger>
            <TabsTrigger value="ready" className="text-xs">
              Ready for Dispatch (
              {
                orders.filter(
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
              {orders.filter((o) => o.orderStatus === "COMPLETED").length})
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

      {/* Orders Table */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-stone-50/70">
            <TableRow>
              <TableHead className="text-xs font-semibold">Order #</TableHead>
              <TableHead className="text-xs font-semibold">Customer</TableHead>
              <TableHead className="text-xs font-semibold">Cake Details</TableHead>
              <TableHead className="text-xs font-semibold">Fulfillment</TableHead>
              <TableHead className="text-xs font-semibold">Assigned Station</TableHead>
              <TableHead className="text-xs font-semibold">Status & Stage</TableHead>
              <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
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
                    <div className="flex items-center gap-1.5 font-medium text-stone-700">
                      {order.fulfilmentType === "DELIVERY" ? (
                        <Truck className="h-3.5 w-3.5 text-amber-800" />
                      ) : (
                        <MapPin className="h-3.5 w-3.5 text-stone-600" />
                      )}
                      <span>{order.fulfilmentType}</span>
                    </div>
                    <div className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-2.5 w-2.5 text-stone-400" />
                      <span>{order.deliveryDate || "Today"}</span>
                    </div>
                  </TableCell>

                  {/* Station / Chef */}
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-1 text-stone-700 font-medium">
                      <ChefHat className="h-3.5 w-3.5 text-stone-400" />
                      <span>{order.assignedChef?.split(" ")[0] || "Kitchen"}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 font-normal">
                      ₹{order.total.toLocaleString("en-IN")} • {order.paymentStatus}
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

                  {/* Actions: View Details Dialog */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="h-8 w-8 p-0 hover:bg-stone-100"
                    >
                      <Eye className="h-4 w-4 text-stone-500" />
                    </Button>
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
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Manual Instant Order Modal */}
      <ManualOrderModal
        open={isManualModalOpen}
        onOpenChange={setIsManualModalOpen}
      />
    </div>
  );
}
