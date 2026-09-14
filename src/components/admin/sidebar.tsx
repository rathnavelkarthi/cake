"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Receipt,
  Package,
  Users,
  Cake,
  ChefHat,
  BarChart3,
  FileText,
  Settings,
  Store,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

// Ordered strictly according to PRODUCT.md Section 80 priority
export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Kitchen (KDS)",
    href: "/admin/kitchen",
    icon: ChefHat,
    badge: "Live",
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
    badge: "4",
  },
  {
    title: "Billing & POS",
    href: "/admin/billing",
    icon: Receipt,
  },
  {
    title: "Inventory",
    href: "/admin/inventory",
    icon: Package,
    badge: "Low",
  },
  {
    title: "Customers (CRM)",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Cake,
  },
  {
    title: "Reports & Sales",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    title: "CMS & Blogs",
    href: "/admin/cms",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-stone-200 bg-white sm:flex">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-stone-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-900 text-amber-50 shadow-sm">
          <Cake className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-stone-900">
            Kichees Ops
          </span>
          <span className="text-[11px] font-medium text-stone-500">
            Artisanal Commerce
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
          Management
        </div>

        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-amber-900/10 text-amber-900 font-semibold"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-amber-900"
                      : "text-stone-500 group-hover:text-stone-900"
                  )}
                />
                <span>{item.title}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    item.badge === "Low"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-stone-200 text-stone-700"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Storefront Link */}
      <div className="p-4 border-t border-stone-100 bg-stone-50/50">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-lg p-2 text-xs font-medium text-stone-600 hover:bg-stone-200/60 hover:text-stone-900 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-stone-500" />
            <span>View Live Storefront</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
        </Link>
      </div>
    </aside>
  );
}
