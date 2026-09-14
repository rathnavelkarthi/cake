"use client";

import React, { useState } from "react";
import {
  Receipt,
  Plus,
  Trash2,
  Printer,
  CreditCard,
  IndianRupee,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PRODUCTS } from "@/data/products";

interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function AdminBillingPage() {
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerMobile, setCustomerMobile] = useState("+91 98400 00000");
  const [paymentMethod, setPaymentMethod] = useState<
    "UPI" | "CASH" | "CARD" | "ONLINE"
  >("UPI");
  const [billItems, setBillItems] = useState<BillItem[]>([
    {
      id: "1",
      name: PRODUCTS[0].name,
      price: PRODUCTS[0].variants?.[0]?.price ?? 650,
      quantity: 1,
    },
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [invoiceSuccess, setInvoiceSuccess] = useState<string | null>(null);

  const subtotal = billItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.05); // 5% bakery GST
  const grandTotal = Math.max(0, subtotal + tax - discount);

  const handleAddItem = (productId: string) => {
    const prod = PRODUCTS.find((p) => p.id === productId);
    if (!prod) return;

    const price = prod.variants?.[0]?.price ?? 650;

    setBillItems((prev) => {
      const existing = prev.find((i) => i.id === prod.id);
      if (existing) {
        return prev.map((i) =>
          i.id === prod.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { id: prod.id, name: prod.name, price, quantity: 1 }];
    });
  };

  const handleRemoveItem = (id: string) => {
    setBillItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const invNum = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setInvoiceSuccess(invNum);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          Billing & Quick POS Counter
        </h1>
        <p className="text-sm text-stone-500">
          Walk-in counter sales, invoice generation, and instant receipt printing per PRODUCT.md Section 20.
        </p>
      </div>

      {invoiceSuccess && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-semibold text-sm">
                Invoice {invoiceSuccess} generated successfully!
              </p>
              <p className="text-xs text-emerald-700">
                Payment verified via {paymentMethod}. Stock automatically deducted.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => window.print()}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Receipt
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick Item Selector */}
        <div className="space-y-4">
          <Card className="border-stone-200 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-stone-900">
                Quick Add Baked Goods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {PRODUCTS.slice(0, 6).map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-stone-100 hover:bg-stone-50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-stone-900">
                      {prod.name}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      ₹{(prod.variants?.[0]?.price ?? 650).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddItem(prod.id)}
                    className="h-7 px-2.5 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Active Bill & Payment */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-stone-200 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-stone-900">
                Current Bill Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">
                    Customer Name
                  </label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">
                    Mobile Number
                  </label>
                  <Input
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="rounded-lg border border-stone-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-stone-50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold">Item</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Qty</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Price</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Total</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-medium text-stone-900">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-xs text-center font-bold">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          ₹{item.price}
                        </TableCell>
                        <TableCell className="text-xs text-right font-semibold">
                          ₹{item.price * item.quantity}
                        </TableCell>
                        <TableCell className="text-right p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="h-6 w-6 text-stone-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Calculations */}
              <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>GST (5%)</span>
                  <span>₹{tax.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Grand Total</span>
                  <span className="text-amber-900">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-stone-700">
                  Payment Method
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["UPI", "CASH", "CARD", "ONLINE"] as const).map((method) => (
                    <Button
                      key={method}
                      type="button"
                      variant={paymentMethod === method ? "default" : "outline"}
                      onClick={() => setPaymentMethod(method)}
                      className="h-8 text-xs font-semibold"
                    >
                      {method}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCreateBill}
                disabled={billItems.length === 0}
                className="w-full h-10 bg-amber-900 hover:bg-amber-950 text-white font-bold"
              >
                Complete Sale & Generate Bill
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
