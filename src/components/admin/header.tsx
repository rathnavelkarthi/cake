"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Cake,
  ExternalLink,
  MessageSquare,
  Users,
  ChefHat,
  Receipt,
  Shield,
  Clock,
  Mail,
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
import { QuickEmailModal } from "./QuickEmailModal";

interface AdminHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export function AdminHeader({ user: initialUser }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const currentUser = {
    name: session?.user?.name || initialUser?.name || "Staff Member",
    email: session?.user?.email || initialUser?.email || "admin@kicheesbakeddelights.in",
    role: (session?.user as any)?.role || initialUser?.role || "SUPER_ADMIN",
  };

  // Derive role label & initials
  let roleTitle = "Super Admin";
  let stationName = "Executive Operations";
  let stationHref = "/admin";

  const emailLower = (currentUser.email || "").toLowerCase();
  const roleCode = currentUser.role || "";

  if (emailLower.includes("bakery") || (roleCode === "HEAD_CHEF" && emailLower.includes("bakery"))) {
    roleTitle = "Bakery Head Chef";
    stationName = "Hot Kitchen & Deck Ovens";
    stationHref = "/admin/kitchen";
  } else if (emailLower.includes("confectionery") || (roleCode === "HEAD_CHEF" && emailLower.includes("confectionery"))) {
    roleTitle = "Confectionery Head Chef";
    stationName = "Patisserie & Custom Studio";
    stationHref = "/admin/kitchen";
  } else if (emailLower.includes("cafe") || roleCode === "BILLING_STAFF") {
    roleTitle = "Kichees Cafe Staff";
    stationName = "Front POS & Billing Counter";
    stationHref = "/admin/billing";
  } else if (roleCode === "SUPER_ADMIN" || emailLower.includes("admin")) {
    roleTitle = "Super Admin";
    stationName = "Executive Management";
    stationHref = "/admin";
  }

  // Derive initials
  const initials = currentUser.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "KO";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/admin/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/admin/login" });
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

        {/* Global Admin Search */}
        <form
          onSubmit={handleSearch}
          className="relative hidden flex-1 max-w-md sm:block"
        >
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <Input
            type="search"
            placeholder="Search orders, products, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 h-9 border-stone-200 bg-stone-50/70 focus-visible:bg-white text-sm"
          />
        </form>

        <div className="ml-auto flex items-center gap-2.5">
          {/* Internal Team Chat Shortcut */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden sm:flex items-center gap-1.5 h-9 px-3 text-stone-700 hover:text-amber-950 hover:bg-amber-50/70 border border-stone-200 rounded-lg text-xs font-semibold"
          >
            <Link href="/admin/chat">
              <MessageSquare className="h-4 w-4 text-amber-800" />
              <span>Team Chat</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </Link>
          </Button>

          {/* Owner Quick Send Email Shortcut */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEmailModalOpen(true)}
            className="flex items-center gap-1.5 h-9 px-3 text-stone-700 hover:text-amber-950 hover:bg-amber-50/70 border border-stone-200 rounded-lg text-xs font-semibold"
            title="Compose & Send Email (billing@kicheesbakeddelights.in)"
          >
            <Mail className="h-4 w-4 text-amber-800" />
            <span className="hidden sm:inline">Send Email</span>
          </Button>

          {/* Notification Center Trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-600 ring-2 ring-white" />
          </Button>

          {/* User Account Menu: ONLY SHOW THE LOGGED IN USER */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative flex items-center gap-2.5 h-10 px-2 hover:bg-stone-100 rounded-xl transition-colors border border-transparent hover:border-stone-200"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-950 text-amber-100 text-xs font-bold shadow-xs">
                  {initials}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-bold text-stone-900 leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-amber-900 font-medium">
                    {roleTitle}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-72 p-2">
              {/* Authenticated User Profile Summary */}
              <DropdownMenuLabel className="p-2.5 bg-stone-50 rounded-xl mb-1 border border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-950 text-amber-50 text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-900 truncate leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-stone-500 truncate font-mono">
                      {currentUser.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        On Duty
                      </span>
                      <span className="text-[9px] text-stone-400 font-mono">
                        {roleTitle}
                      </span>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* Station Navigation tailored to logged-in employee */}
              <DropdownMenuItem asChild>
                <Link
                  href={stationHref}
                  className="cursor-pointer flex items-center justify-between text-xs py-2 px-2.5 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4 text-amber-800" />
                    <span className="font-semibold text-stone-800">My Station</span>
                  </div>
                  <span className="text-[10px] text-stone-400 truncate max-w-[110px]">
                    {stationName}
                  </span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/admin/staff"
                  className="cursor-pointer flex items-center justify-between text-xs py-2 px-2.5 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-stone-600" />
                    <span className="font-semibold text-stone-800">Staff Workload Hub</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold">Live</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/admin/chat"
                  className="cursor-pointer flex items-center justify-between text-xs py-2 px-2.5 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-stone-600" />
                    <span className="font-semibold text-stone-800">Internal Team Chat</span>
                  </div>
                  <span className="text-[10px] text-stone-400">5 Channels</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/"
                  target="_blank"
                  className="cursor-pointer flex items-center justify-between text-xs py-2 px-2.5 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-stone-600" />
                    <span className="font-semibold text-stone-800">View Storefront</span>
                  </div>
                  <span className="text-[10px] text-stone-400">Customer View</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Functional Sign Out */}
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 text-xs py-2 px-2.5 rounded-lg font-semibold flex items-center gap-2"
              >
                <LogOut className="h-4 w-4 text-red-600" />
                <span>Sign Out ({currentUser.name})</span>
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

            <div className="pt-4 border-t border-stone-100 space-y-2">
              <div className="p-2 rounded-lg bg-stone-50 border border-stone-100 text-xs">
                <p className="font-bold text-stone-900">{currentUser.name}</p>
                <p className="text-[10px] text-stone-500">{roleTitle}</p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Owner Global Email Dispatcher Modal */}
      <QuickEmailModal open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen} />
    </>
  );
}
