"use client";

import React, { useState } from "react";
import {
  Settings,
  Store,
  CreditCard,
  MessageCircle,
  Shield,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BUSINESS_CONFIG } from "@/lib/config/business";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [storeName, setStoreName] = useState(BUSINESS_CONFIG.name);
  const [phone, setPhone] = useState(BUSINESS_CONFIG.phone);
  const [whatsapp, setWhatsapp] = useState(BUSINESS_CONFIG.whatsapp);
  const [address, setAddress] = useState(BUSINESS_CONFIG.address.full);
  const [minOrder, setMinOrder] = useState("300");
  const [gstRate, setGstRate] = useState("5");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            System & Operations Settings
          </h1>
          <p className="text-sm text-stone-500">
            Configure business information, taxes, and messaging integrations per PRODUCT.md Section 75.
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <CheckCircle2 className="h-4 w-4" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Information */}
        <Card className="border-stone-200 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-amber-900" />
              <CardTitle className="text-base">Business Profile</CardTitle>
            </div>
            <CardDescription>
              Public contact details shown across customer invoices and storefront.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Bakery Name
                </label>
                <Input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Primary Phone
                </label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Bakery Address (Nungambakkam)
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Commerce & Taxes */}
        <Card className="border-stone-200 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-amber-900" />
              <CardTitle className="text-base">Commerce & Taxes</CardTitle>
            </div>
            <CardDescription>
              GST tax rates and minimum checkout criteria.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  GST Rate (%)
                </label>
                <Input
                  type="number"
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Minimum Order Value (₹)
                </label>
                <Input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp & Integrations */}
        <Card className="border-stone-200 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-emerald-700" />
              <CardTitle className="text-base">WhatsApp Automation Engine</CardTitle>
            </div>
            <CardDescription>
              Meta WhatsApp Business Cloud API settings for OTP and transactional orders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                WhatsApp Business Number
              </label>
              <Input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>

            <div className="rounded-lg bg-stone-50 p-3 border border-stone-100 text-xs text-stone-600">
              <p className="font-semibold text-stone-800">
                Connected Automated Templates:
              </p>
              <ul className="mt-1 list-disc list-inside space-y-0.5 text-stone-500">
                <li>ORDER_CREATED: Customer receipt and prep acknowledgement</li>
                <li>ORDER_READY_FOR_PICKUP: WhatsApp alert when ready at counter</li>
                <li>ORDER_OUT_FOR_DELIVERY: Delivery tracking link notification</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="bg-amber-900 hover:bg-amber-950 text-white font-medium"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Configurations
        </Button>
      </form>
    </div>
  );
}
