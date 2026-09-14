"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Cake,
  Lock,
  Mail,
  ShieldAlert,
  ArrowLeft,
  ChefHat,
  Sparkles,
  UserCheck,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DemoCandidate {
  name: string;
  role: string;
  email: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  destination: string;
  description: string;
}

const DEMO_CANDIDATES: DemoCandidate[] = [
  {
    name: "Selva",
    role: "Head Chef",
    email: "selva@kichees.com",
    badge: "Head Pastry Chef",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
    icon: ChefHat,
    destination: "/admin/kitchen",
    description: "Sponge aeration, oven scheduling, and kitchen live display dispatch.",
  },
  {
    name: "Anbu",
    role: "Confectionery Chef",
    email: "anbu@kichees.com",
    badge: "Pastry & Piping Artisan",
    badgeColor: "bg-purple-100 text-purple-900 border-purple-200",
    icon: Sparkles,
    destination: "/admin/kitchen",
    description: "Custom cake decorating, intricate Lambeth piping, and bespoke finishing.",
  },
  {
    name: "Sara Harrisons",
    role: "Store Manager",
    email: "sara@kichees.com",
    badge: "General Manager",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-200",
    icon: UserCheck,
    destination: "/admin/orders",
    description: "Order fulfillment, customer CRM, and manual instant order dispatch.",
  },
  {
    name: "Super Admin",
    role: "Admin",
    email: "admin@kichees.com",
    badge: "Full System Access",
    badgeColor: "bg-stone-100 text-stone-900 border-stone-300",
    icon: ShieldCheck,
    destination: "/admin",
    description: "Executive controls: CMS, Inventory, Billing POS, Products & Settings.",
  },
  {
    name: "Priya Sundaram",
    role: "Normal Shop User",
    email: "customer@kichees.com",
    badge: "Customer Account",
    badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
    icon: ShoppingBag,
    destination: "/account/orders",
    description: "Customer portal to view order history, custom cake tracking & receipts.",
  },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@kichees.com");
  const [password, setPassword] = useState("kichees2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeQuickLogging, setActiveQuickLogging] = useState<string | null>(null);

  const handleLoginWithCredentials = async (
    loginEmail: string,
    loginPass: string,
    destination = "/admin"
  ) => {
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email: loginEmail,
        password: loginPass,
        redirect: false,
      });

      if (res?.error) {
        // For customer demo or fallback, if redirect still desired:
        if (loginEmail === "customer@kichees.com") {
          router.push(destination);
          return;
        }
        setError("Invalid email or password. Please check your credentials.");
      } else {
        router.push(destination);
        router.refresh();
      }
    } catch {
      setError("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
      setActiveQuickLogging(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLoginWithCredentials(email, password, "/admin");
  };

  const handleOneClickCandidate = async (candidate: DemoCandidate) => {
    setActiveQuickLogging(candidate.email);
    setEmail(candidate.email);
    setPassword("kichees2026");
    await handleLoginWithCredentials(candidate.email, "kichees2026", candidate.destination);
  };

  return (
    <div className="min-h-screen bg-stone-50/70 px-4 py-12 flex flex-col justify-center items-center">
      <div className="w-full max-w-4xl space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-900 text-amber-50 shadow-md">
            <Cake className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 font-serif">
            Kichees Portal Access
          </h1>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Artisanal Commerce, Kitchen Display & Customer Operations.
            Select a candidate role below for instant demo access.
          </p>
        </div>

        {/* 1-Click Candidate Demo Roles Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
              <span>One-Click Candidate Demo Switcher</span>
            </div>
            <span className="text-[11px] text-stone-400">
              No password needed for testing
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {DEMO_CANDIDATES.map((cand) => {
              const Icon = cand.icon;
              const isLogging = activeQuickLogging === cand.email;

              return (
                <div
                  key={cand.email}
                  onClick={() => !loading && handleOneClickCandidate(cand)}
                  className={`group relative rounded-xl border p-4 bg-white shadow-2xs hover:shadow-md hover:border-amber-900/40 transition-all cursor-pointer flex flex-col justify-between ${
                    cand.role === "Normal Shop User"
                      ? "border-blue-200 bg-blue-50/30 md:col-span-2 lg:col-span-1"
                      : "border-stone-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 group-hover:bg-amber-900 group-hover:text-white transition-colors text-stone-700">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-stone-900 group-hover:text-amber-950 transition-colors">
                            {cand.name}
                          </div>
                          <div className="text-[11px] font-medium text-stone-500">
                            {cand.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-2.5">
                      <Badge
                        className={`text-[10px] font-semibold border ${cand.badgeColor}`}
                      >
                        {cand.badge}
                      </Badge>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {cand.description}
                    </p>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-amber-900 group-hover:text-amber-950">
                    <span>{isLogging ? "Signing in..." : "Launch Demo Workspace"}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manual Credentials Sign-in Card */}
        <div className="w-full max-w-md mx-auto pt-2">
          <Card className="border-stone-200 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-stone-900">
                Direct Credential Login
              </CardTitle>
              <CardDescription className="text-xs text-stone-500">
                Or enter any staff or customer email manually.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-800 border border-red-200">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-stone-600 tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="staff@kichees.com"
                      required
                      className="pl-9 h-9 text-xs border-stone-300 focus-visible:ring-amber-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-stone-600 tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="pl-9 h-9 text-xs border-stone-300 focus-visible:ring-amber-800"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-9 bg-amber-900 hover:bg-amber-950 text-white font-medium text-xs shadow-xs transition-all"
                >
                  {loading ? "Signing in..." : "Sign In with Credentials"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
