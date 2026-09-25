"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Cake,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navItems } from "./sidebar";
import { cn } from "@/lib/utils";

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/admin/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSignOut = () => {
    router.push("/admin/login");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-stone-200 bg-white/90 px-4 sm:px-6 backdrop-blur-md">
        {/* Mobile menu trigger */}
        <Button
          variant="outline"
          size="icon"
          className="sm:hidden h-9 w-9 border-stone-300"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5 text-stone-700" />
        </Button>

        {/* Brand indicator for mobile */}
        <div className="flex items-center gap-2 sm:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-900 text-amber-50">
            <Cake className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-stone-900">Kichees Ops</span>
        </div>

        {/* Global Admin Search (PRODUCT.md Section 48) */}
        <form
          onSubmit={handleSearch}
          className="relative hidden flex-1 max-w-md sm:block"
        >
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <Input
            type="search"
            placeholder="Search orders, products, SKUs, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 h-9 border-stone-200 bg-stone-50/70 focus-visible:bg-white text-sm"
          />
        </form>

        <div className="ml-auto flex items-center gap-3">
          {/* Notification Center Trigger (PRODUCT.md Section 49) */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-600 ring-2 ring-white" />
          </Button>

          {/* User Account Menu with Candidate Role Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative flex items-center gap-2 h-9 px-2 hover:bg-stone-100 rounded-lg"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-900 text-amber-50 text-xs font-semibold">
                  KO
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-semibold text-stone-900">Admin Account</p>
                  <p className="text-[10px] text-stone-500">Super Admin</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold text-stone-900 leading-none">Bakery Operations</p>
                  <p className="text-[11px] text-stone-500">Station & role navigation</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/kitchen" className="cursor-pointer flex items-center justify-between text-xs py-2">
                  <span className="font-semibold text-amber-900">👨‍🍳 Selva (Head Chef)</span>
                  <span className="text-[10px] text-stone-400">Kitchen KDS</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/kitchen" className="cursor-pointer flex items-center justify-between text-xs py-2">
                  <span className="font-semibold text-purple-900">🎂 Anbu (Confectionery Chef)</span>
                  <span className="text-[10px] text-stone-400">Deco Station</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/orders" className="cursor-pointer flex items-center justify-between text-xs py-2">
                  <span className="font-semibold text-emerald-900">📋 Sara Harrisons (Manager)</span>
                  <span className="text-[10px] text-stone-400">Orders & Dispatch</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin" className="cursor-pointer flex items-center justify-between text-xs py-2">
                  <span className="font-semibold text-stone-900">🛡️ Super Admin</span>
                  <span className="text-[10px] text-stone-400">Main Ops</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/account/orders" className="cursor-pointer flex items-center justify-between text-xs py-2">
                  <span className="font-semibold text-blue-900">🛍️ Priya (Shop User)</span>
                  <span className="text-[10px] text-stone-400">Customer View</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="cursor-pointer text-xs">
                  System Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/" target="_blank" className="cursor-pointer text-xs">
                  <ExternalLink className="mr-2 h-3.5 w-3.5" />
                  View Storefront
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-red-600 focus:text-red-700 text-xs"
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign Out / Role Selection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex sm:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 flex w-72 flex-col bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-900 text-amber-50">
                  <Cake className="h-5 w-5" />
                </div>
                <span className="font-bold text-stone-900">Kichees Ops</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
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
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-amber-900/10 text-amber-900 font-semibold"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-stone-100">
              <Link
                href="/"
                className="flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                <ExternalLink className="h-4 w-4" />
                Open Live Storefront
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
