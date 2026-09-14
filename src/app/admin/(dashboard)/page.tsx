import React from "react";
import Link from "next/link";
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Plus,
  ArrowRight,
  Package,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDashboardMetrics, getAdminOrders, getAdminInventory } from "@/lib/db/admin-data";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();
  const recentOrders = await getAdminOrders();
  const inventoryItems = await getAdminInventory();
  const lowStockItems = inventoryItems.filter((i) => i.status !== "IN_STOCK");

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Operations Overview
          </h1>
          <p className="text-sm text-stone-500">
            Real-time sales, order fulfillment, and inventory metrics for Kichees.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="h-9">
            <Link href="/admin/inventory">
              <Package className="mr-2 h-4 w-4" />
              Adjust Stock
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="h-9 bg-amber-900 hover:bg-amber-950 text-white shadow-sm"
          >
            <Link href="/admin/products">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards (PRODUCT.md Section 44) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Sales */}
        <Card className="border-stone-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-stone-500 tracking-wider">
              Today's Sales
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <IndianRupee className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900">
              ₹{metrics.todaySales.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span>Paid online & storefront orders</span>
            </p>
          </CardContent>
        </Card>

        {/* Today's Orders */}
        <Card className="border-stone-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-stone-500 tracking-wider">
              Today's Orders
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900">
              {metrics.todayOrders}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Across pickup & local delivery
            </p>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="border-stone-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-stone-500 tracking-wider">
              Pending Fulfillment
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {metrics.pendingOrders}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Needs preparation or dispatch
            </p>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="border-stone-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-stone-500 tracking-wider">
              Low Stock Alerts
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700">
              {metrics.lowStockCount}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Items at or below threshold
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders Table (PRODUCT.md Section 44) */}
        <Card className="lg:col-span-2 border-stone-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-stone-900">
                Recent Orders
              </CardTitle>
              <CardDescription>
                Latest incoming customer orders and pickup schedules.
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
              <Link href="/admin/orders">
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-stone-50/70">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Order</TableHead>
                  <TableHead className="text-xs font-semibold">Customer</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.slice(0, 5).map((order) => (
                  <TableRow key={order.id} className="hover:bg-stone-50/50">
                    <TableCell className="font-medium text-xs">
                      <div>{order.orderNumber}</div>
                      <div className="text-[10px] text-stone-400">
                        {order.fulfilmentType} • {order.itemsCount} items
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-medium text-stone-900">{order.customerName}</div>
                      <div className="text-[11px] text-stone-500">{order.customerMobile}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.orderStatus === "COMPLETED"
                            ? "success"
                            : order.orderStatus === "PREPARING"
                            ? "warning"
                            : order.orderStatus === "READY_FOR_PICKUP"
                            ? "default"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {order.orderStatus.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-xs text-stone-900">
                      ₹{order.total.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Low Stock Items Attention Box */}
        <Card className="border-stone-200 shadow-xs flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-stone-900">
                Inventory Alerts
              </CardTitle>
              <Badge variant="destructive" className="text-[10px]">
                {lowStockItems.length} Needs Attention
              </Badge>
            </div>
            <CardDescription>
              Ingredients & bakery items needing restock.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 space-y-3">
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-stone-500">All stock levels healthy.</p>
            ) : (
              lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-stone-100 bg-stone-50/50"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-stone-900">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      SKU: {item.sku} • {item.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold ${
                        item.stock === 0 ? "text-red-600" : "text-amber-700"
                      }`}
                    >
                      {item.stock} left
                    </span>
                    <p className="text-[10px] text-stone-400">
                      Min: {item.lowStockThreshold}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>

          <div className="p-4 border-t border-stone-100 bg-stone-50/30">
            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link href="/admin/inventory">
                Open Stock Management
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
