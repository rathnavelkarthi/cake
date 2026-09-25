"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Home,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@kicheesbakeddelights.in");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password. Please verify your credentials.");
        setLoading(false);
      } else {
        setLoginSuccess(true);
        setTimeout(() => {
          router.push("/admin");
          router.refresh();
        }, 600);
      }
    } catch {
      setError("An unexpected authentication error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#faf7f2] px-4 py-12 relative overflow-hidden">
      {/* Subtle Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-100/60 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block transition-transform hover:scale-105 duration-200">
            <img
              src="https://kicheesbakeddelights.com/wp-content/uploads/2025/02/kichees-baked-delights-bakery-logo.png"
              alt="Kichee's Baked Delights"
              width={180}
              height={70}
              className="mx-auto h-16 w-auto object-contain drop-shadow-xs"
            />
          </Link>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-800">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Executive Management Portal</span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-stone-200/80 shadow-xl bg-white/95 backdrop-blur-xs rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800" />
          
          <CardHeader className="pt-6 pb-4 text-center">
            <CardTitle className="text-xl font-serif font-bold text-stone-900">
              Sign In to Bakery Studio
            </CardTitle>
            <CardDescription className="text-xs text-stone-500">
              Secure authentication for CMS, products, orders & bakery management
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2 pb-6 px-6">
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {loginSuccess && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Authenticated! Redirecting to dashboard...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700" htmlFor="admin-email">
                  Staff / Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <Input
                    id="admin-email"
                    type="email"
                    required
                    placeholder="admin@kicheesbakeddelights.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11 text-xs border-stone-200 focus-visible:ring-amber-800"
                    disabled={loading || loginSuccess}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-stone-700" htmlFor="admin-password">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-11 text-xs border-stone-200 focus-visible:ring-amber-800"
                    disabled={loading || loginSuccess}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 focus:outline-hidden"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-amber-900 hover:bg-amber-950 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md mt-2"
                disabled={loading || loginSuccess}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Enter Management Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer info & link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-amber-900 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Kichee's Customer Storefront</span>
          </Link>
          <p className="mt-3 text-[11px] text-stone-400">
            Protected by Supabase Row-Level Security & Role-Based Access Control
          </p>
        </div>
      </div>
    </div>
  );
}
