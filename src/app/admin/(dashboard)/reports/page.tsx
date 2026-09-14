import React from "react";
import { BarChart3, TrendingUp, Calendar, Download, PieChart, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Sales & Operational Analytics
          </h1>
          <p className="text-sm text-stone-500">
            Revenue breakdowns, category performance, and inventory velocity per PRODUCT.md Section 45.
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" />
          Export CSV Report
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-stone-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase font-semibold text-stone-500">
              Weekly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-stone-900">₹48,920</p>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" />
              +14.2% from previous week
            </p>
          </CardContent>
        </Card>

        <Card className="border-stone-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase font-semibold text-stone-500">
              Average Order Value (AOV)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-stone-900">₹1,180</p>
            <p className="text-xs text-stone-500 mt-1 font-medium">
              Healthy margin across celebration cakes
            </p>
          </CardContent>
        </Card>

        <Card className="border-stone-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase font-semibold text-stone-500">
              Repeat Customer Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-stone-900">42.8%</p>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              Driven by WhatsApp order follow-ups
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance Breakdown */}
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="text-base font-bold text-stone-900">
            Category Sales Distribution
          </CardTitle>
          <CardDescription>
            Contribution of each bakery department to total revenue this month.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { category: "Signature & Birthday Cakes", revenue: "₹28,500", percent: 58 },
            { category: "Brownies & Blondies", revenue: "₹9,800", percent: 20 },
            { category: "Cheesecakes & Tarts", revenue: "₹6,400", percent: 13 },
            { category: "Macarons & Petite Treats", revenue: "₹4,220", percent: 9 },
          ].map((item) => (
            <div key={item.category} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-stone-800">
                <span>{item.category}</span>
                <span>{item.revenue} ({item.percent}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-amber-900 rounded-full"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
