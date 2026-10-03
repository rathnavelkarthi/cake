"use client";

import React, { useState } from "react";
import { History, Images, Package, RefreshCw, Upload } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BulkProductsImport from "./BulkProductsImport";
import BulkRawMaterialsImport from "./BulkRawMaterialsImport";
import BulkPhotoAssignment from "./BulkPhotoAssignment";
import BulkUpdateImport from "./BulkUpdateImport";
import ImportHistory from "./ImportHistory";
import { cn } from "@/lib/utils";

export type BulkTab = "raw-materials" | "products" | "bulk-update" | "photos" | "history";

const TABS: { value: BulkTab; label: string; icon: React.ComponentType<{ className?: string }>; blurb: string }[] = [
  {
    value: "raw-materials",
    label: "Raw Materials",
    icon: Package,
    blurb: "Flour, sugar, chocolate, cream and everything else the kitchen buys.",
  },
  {
    value: "products",
    label: "Products Upload",
    icon: Upload,
    blurb: "Upload menu products with prices, stock, recipes, and photo matching.",
  },
  {
    value: "bulk-update",
    label: "Bulk Update",
    icon: RefreshCw,
    blurb: "Update prices, stock levels, or details for existing items using Excel or CSV.",
  },
  {
    value: "photos",
    label: "Photos Only",
    icon: Images,
    blurb: "Attach product photos to items you have already added.",
  },
  {
    value: "history",
    label: "Import History",
    icon: History,
    blurb: "Audit log of previous catalog imports, updates, and error logs.",
  },
];

/**
 * Which order to do things in. Raw materials first, because product recipes
 * reference them and unmatched names become new ingredients otherwise.
 */
const SUGGESTED_ORDER: BulkTab[] = ["raw-materials", "products", "bulk-update", "photos"];

export default function BulkUploadWorkspace({ initialTab }: { initialTab: BulkTab }) {
  const [tab, setTab] = useState<BulkTab>(initialTab);
  const currentIndex = SUGGESTED_ORDER.indexOf(tab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Bulk Upload</h1>
        <p className="text-sm text-stone-500">
          Add or update a whole spreadsheet of products and raw materials in one go, instead of one
          form at a time.
        </p>
      </div>

      {/* Guided order hint */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-stone-200 bg-white p-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          Recommended order
        </span>
        {SUGGESTED_ORDER.map((value, index) => {
          const item = TABS.find((t) => t.value === value)!;
          const done = index < currentIndex;
          const Icon = item.icon;
          return (
            <React.Fragment key={value}>
              {index > 0 && <span className="text-stone-300">→</span>}
              <button
                type="button"
                onClick={() => setTab(value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  tab === value
                    ? "border-amber-800 bg-amber-900 text-white"
                    : done
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300"
                )}
              >
                <Icon className="h-3 w-3" />
                {index + 1}. {item.label}
              </button>
            </React.Fragment>
          );
        })}
        <span className="ml-auto text-[11px] text-stone-500">
          Raw materials first so product recipes can find their ingredients.
        </span>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as BulkTab)}>
        <TabsList className="bg-stone-100">
          {TABS.map((item) => {
            const Icon = item.icon;
            return (
              <TabsTrigger key={item.value} value={item.value} className="gap-1.5 text-xs">
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TABS.map((item) => (
          <TabsContent key={item.value} value={item.value} className="mt-4 space-y-4">
            <p className="text-xs text-stone-500">{item.blurb}</p>
            {item.value === "raw-materials" && <BulkRawMaterialsImport />}
            {item.value === "products" && <BulkProductsImport />}
            {item.value === "bulk-update" && <BulkUpdateImport />}
            {item.value === "photos" && <BulkPhotoAssignment />}
            {item.value === "history" && <ImportHistory />}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
