"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Receipt,
  Plus,
  Trash2,
  Printer,
  CreditCard,
  IndianRupee,
  CheckCircle2,
  Search,
  RotateCcw,
  Sparkles,
  Share2,
  ShoppingBag,
  Edit2,
  FileText,
  User,
  Phone,
  Percent,
  Truck,
  MessageCircle,
  Cake,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getInventoryProducts,
  subscribeInventory,
  AdminProductItem,
} from "@/lib/db/admin-data";

interface BillItem {
  id: string;
  name: string;
  originalPrice: number;
  price: number;
  quantity: number;
  isCustom?: boolean;
  notes?: string;
  isEggless?: boolean;
  category?: string;
}

export default function AdminBillingPage() {
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerMobile, setCustomerMobile] = useState("+91 98400 00000");
  const [paymentMethod, setPaymentMethod] = useState<
    "UPI" | "CASH" | "CARD" | "ONLINE"
  >("UPI");
  const [products, setProducts] = useState<AdminProductItem[]>(getInventoryProducts);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  
  // Customization & calculation controls
  const [discount, setDiscount] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [includeGst, setIncludeGst] = useState<boolean>(true);
  const [invoiceSuccess, setInvoiceSuccess] = useState<string | null>(null);
  const [invoiceDate, setInvoiceDate] = useState<string>("");

  // Product catalog search and category filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Custom Item Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");
  const [customItemQty, setCustomItemQty] = useState("1");
  const [customItemIsEggless, setCustomItemIsEggless] = useState(true);
  const [customItemNotes, setCustomItemNotes] = useState("");

  // Inline Note Editor State
  const [editingNoteItemId, setEditingNoteItemId] = useState<string | null>(null);
  const [itemNoteInput, setItemNoteInput] = useState("");

  useEffect(() => {
    return subscribeInventory(() => {
      const live = getInventoryProducts();
      setProducts(live);
    });
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["all", ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCategory === "all" || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, selectedCategory]);

  const subtotal = billItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = includeGst ? Math.round(subtotal * 0.05) : 0; // 5% bakery GST
  const grandTotal = Math.max(0, subtotal + tax + deliveryFee - discount);

  // Add existing product from catalog
  const handleAddItem = (productId: string | number) => {
    const prod = products.find((p) => String(p.id) === String(productId));
    if (!prod) return;

    const basePrice = prod.price ?? 650;

    setBillItems((prev) => {
      const existing = prev.find((i) => String(i.id) === String(prod.id));
      if (existing) {
        return prev.map((i) =>
          String(i.id) === String(prod.id) ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: String(prod.id),
          name: prod.name,
          originalPrice: basePrice,
          price: basePrice,
          quantity: 1,
          isEggless: prod.isEggless !== false,
          category: prod.category || "Cakes",
        },
      ];
    });
  };

  // Add ad-hoc custom item/cake
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) return;

    const price = parseFloat(customItemPrice) || 0;
    const qty = Math.max(1, parseInt(customItemQty, 10) || 1);
    const newId = `custom-item-${Date.now()}`;

    setBillItems((prev) => [
      ...prev,
      {
        id: newId,
        name: customItemName.trim(),
        originalPrice: price,
        price,
        quantity: qty,
        isCustom: true,
        notes: customItemNotes.trim(),
        isEggless: customItemIsEggless,
        category: "Custom Order",
      },
    ]);

    // Reset custom modal form
    setCustomItemName("");
    setCustomItemPrice("");
    setCustomItemQty("1");
    setCustomItemIsEggless(true);
    setCustomItemNotes("");
    setIsCustomModalOpen(false);
  };

  // Price adjustment handler
  const handlePriceChange = (id: string, newPrice: number) => {
    setBillItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, price: Math.max(0, newPrice) } : item
      )
    );
  };

  // Quantity adjustment handler
  const handleQuantityChange = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setBillItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    setBillItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Reset item price back to standard catalog price
  const handleResetPrice = (id: string) => {
    setBillItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, price: item.originalPrice } : item
      )
    );
  };

  // Save customization note
  const handleSaveItemNote = (id: string) => {
    setBillItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, notes: itemNoteInput.trim() } : item
      )
    );
    setEditingNoteItemId(null);
    setItemNoteInput("");
  };

  // Reset entire bill
  const handleResetBill = () => {
    if (billItems.length === 0 || confirm("Clear all items and start a fresh bill?")) {
      setBillItems([]);
      setDiscount(0);
      setDeliveryFee(0);
      setCustomerName("Walk-in Customer");
      setCustomerMobile("+91 98400 00000");
      setInvoiceSuccess(null);
    }
  };

  // Generate completed invoice
  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (billItems.length === 0) return;
    const invNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    setInvoiceDate(now);
    setInvoiceSuccess(invNum);
  };

  // WhatsApp share link generator
  const getWhatsAppShareUrl = () => {
    const cleanPhone = customerMobile.replace(/[^0-9]/g, "");
    const lines = [
      `*KICHEE'S BAKED DELIGHTS* 🎂`,
      `_Artisanal Cakes & Patisserie_`,
      `--------------------------------`,
      `*Bill / Tax Invoice:* #${invoiceSuccess || "INV"}`,
      `*Customer:* ${customerName}`,
      `*Date:* ${invoiceDate || new Date().toLocaleDateString("en-IN")}`,
      `--------------------------------`,
      `*Ordered Items:*`,
      ...billItems.map(
        (item) =>
          `• ${item.quantity}x ${item.name} (${item.isEggless !== false ? "Veg/Eggless" : "Contains Egg"}) @ ₹${item.price} = *₹${item.price * item.quantity}*${
            item.notes ? `\n  _${item.notes}_` : ""
          }`
      ),
      `--------------------------------`,
      `Subtotal: ₹${subtotal.toLocaleString("en-IN")}`,
      includeGst ? `GST (5%): ₹${tax.toLocaleString("en-IN")}` : `GST: Included`,
      deliveryFee > 0 ? `Delivery / Packaging: ₹${deliveryFee}` : null,
      discount > 0 ? `Special Discount: -₹${discount}` : null,
      `*GRAND TOTAL: ₹${grandTotal.toLocaleString("en-IN")}*`,
      `*Payment Method:* ${paymentMethod} (Paid)`,
      `--------------------------------`,
      `Thank you for baking sweet memories with Kichee's!`,
      `📍 Harrisons Hotel & Casablanca Studio, Chennai`,
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join("\n"));
    return `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <Receipt className="h-6 w-6 text-amber-800" />
            <span>Billing & Custom POS Counter</span>
          </h1>
          <p className="text-xs text-stone-500">
            Create standard or fully customized bills, adjust item prices on the fly, add custom cakes, and print receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCustomModalOpen(true)}
            className="h-9 text-xs bg-amber-900 text-white hover:bg-amber-950 hover:text-white border-amber-900 font-semibold gap-1.5 shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            + Add Custom Cake / Item
          </Button>

          {billItems.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetBill}
              className="h-9 text-xs border-stone-300 text-stone-700 hover:text-red-700 hover:bg-red-50"
            >
              Clear Bill
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Success Banner */}
      {invoiceSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm text-emerald-950">
                  Invoice #{invoiceSuccess} generated successfully!
                </p>
                <p className="text-xs text-emerald-800">
                  Total: <strong>₹{grandTotal.toLocaleString("en-IN")}</strong> • Paid via {paymentMethod} • Customer: {customerName} ({customerMobile})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => window.print()}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5 h-8 font-semibold shadow-xs"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Receipt
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(getWhatsAppShareUrl(), "_blank")}
                className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs gap-1.5 h-8 font-semibold"
              >
                <Share2 className="h-3.5 w-3.5 text-emerald-600" />
                WhatsApp Bill
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleResetBill}
                className="text-emerald-900 hover:bg-emerald-100/60 text-xs h-8"
              >
                New Sale
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Quick Item Selector & Catalog (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-stone-200 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4 text-amber-800" />
                  <span>Bakery Menu & Catalog</span>
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCustomModalOpen(true)}
                  className="h-7 text-[11px] text-amber-900 hover:bg-amber-50 font-semibold px-2"
                >
                  + Custom Item
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
                <Input
                  type="search"
                  placeholder="Search cake, brownie, bagel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-stone-50 border-stone-200 text-stone-900"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pt-2 pb-0.5 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? "bg-amber-900 text-white border-amber-900 font-semibold"
                        : "bg-white text-stone-600 border-stone-200 hover:border-amber-700"
                    }`}
                  >
                    {cat === "all" ? "All Items" : cat}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-3 max-h-[520px] overflow-y-auto space-y-1.5 divide-y divide-stone-100">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  No baked items match your search.
                </div>
              ) : (
                filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 transition-colors pt-2"
                  >
                    <div className="space-y-0.5 pr-2 flex-1">
                      <div className="flex items-center gap-1.5">
                        {prod.isEggless !== false ? (
                          <span
                            className="inline-flex items-center justify-center w-3 h-3 border border-emerald-600 rounded-[2px] bg-white p-[1px] shrink-0"
                            title="Vegetarian / Eggless"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center justify-center w-3 h-3 border border-amber-800 rounded-[2px] bg-white p-[1px] shrink-0"
                            title="Contains Egg"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-800"></span>
                          </span>
                        )}
                        <p className="text-xs font-semibold text-stone-900 line-clamp-1">
                          {prod.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <span className="font-bold text-amber-950">
                          ₹{(prod.price ?? 650).toLocaleString("en-IN")}
                        </span>
                        <span>•</span>
                        <span className="text-[10px] text-stone-400">{prod.category}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddItem(prod.id)}
                      className="h-7 px-2.5 text-xs shrink-0 bg-white border-stone-200 hover:border-amber-800 hover:bg-amber-50 hover:text-amber-900 font-semibold"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Active Bill with Custom Price Editing (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-stone-200 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <Receipt className="h-4 w-4 text-amber-800" />
                    <span>Current Bill & Custom Pricing</span>
                  </CardTitle>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Click and edit any item price directly in the table to apply custom discounts or special client rates.
                  </p>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200 text-xs">
                  {billItems.length} {billItems.length === 1 ? "Item" : "Items"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* Customer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-stone-50/70 border border-stone-100">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                    <User className="w-3 h-3 text-stone-400" />
                    Customer Name
                  </label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="h-8 text-xs bg-white border-stone-300 text-stone-900 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-stone-400" />
                    Mobile Number (for WhatsApp Bill)
                  </label>
                  <Input
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="+91 98400 00000"
                    className="h-8 text-xs bg-white border-stone-300 text-stone-900 font-medium"
                  />
                </div>
              </div>

              {/* Items Table with Direct Price Editing */}
              <div className="rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
                <Table>
                  <TableHeader className="bg-stone-50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold text-stone-700">Item Description</TableHead>
                      <TableHead className="text-xs font-semibold text-center text-stone-700 w-24">Qty</TableHead>
                      <TableHead className="text-xs font-semibold text-right text-stone-700 w-32">
                        Unit Price (₹)
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-right text-stone-700 w-24">Line Total</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-stone-400 text-xs">
                          No items added yet. Click &quot;Add&quot; from the catalog or &quot;+ Add Custom Cake&quot; to begin.
                        </TableCell>
                      </TableRow>
                    ) : (
                      billItems.map((item) => {
                        const isPriceCustomized = item.price !== item.originalPrice && !item.isCustom;
                        return (
                          <React.Fragment key={item.id}>
                            <TableRow className="hover:bg-stone-50/50">
                              {/* Item Description */}
                              <TableCell className="text-xs">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    {item.isEggless !== false ? (
                                      <span
                                        className="inline-flex items-center justify-center w-3 h-3 border border-emerald-600 rounded-[2px] bg-white p-[1px] shrink-0"
                                        title="Vegetarian / Eggless"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                      </span>
                                    ) : (
                                      <span
                                        className="inline-flex items-center justify-center w-3 h-3 border border-amber-800 rounded-[2px] bg-white p-[1px] shrink-0"
                                        title="Contains Egg"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-800"></span>
                                      </span>
                                    )}
                                    <span className="font-semibold text-stone-900">
                                      {item.name}
                                    </span>
                                    {item.isCustom && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded">
                                        Custom Item
                                      </span>
                                    )}
                                  </div>

                                  {/* Custom Note or Add Note Button */}
                                  {item.notes ? (
                                    <p className="text-[10px] text-amber-900 font-medium italic pl-4">
                                      Note: {item.notes}
                                    </p>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingNoteItemId(item.id);
                                        setItemNoteInput(item.notes || "");
                                      }}
                                      className="text-[10px] text-stone-400 hover:text-amber-800 underline pl-4"
                                    >
                                      + Add cake inscription / chef note
                                    </button>
                                  )}
                                </div>
                              </TableCell>

                              {/* Quantity Stepper */}
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    className="h-6 w-6 text-stone-600 bg-white border-stone-300 hover:bg-stone-100"
                                  >
                                    -
                                  </Button>
                                  <span className="w-6 text-center font-bold text-xs text-stone-900">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    className="h-6 w-6 text-stone-600 bg-white border-stone-300 hover:bg-stone-100"
                                  >
                                    +
                                  </Button>
                                </div>
                              </TableCell>

                              {/* Editable Unit Price */}
                              <TableCell className="text-right">
                                <div className="flex flex-col items-end gap-1">
                                  <div className="flex items-center justify-end gap-1">
                                    <span className="text-stone-400 text-xs font-semibold">₹</span>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="any"
                                      value={item.price}
                                      onChange={(e) =>
                                        handlePriceChange(item.id, parseFloat(e.target.value) || 0)
                                      }
                                      title="Edit customized price"
                                      className={`h-8 w-24 text-right text-xs font-bold bg-white text-stone-900 border transition-all ${
                                        isPriceCustomized
                                          ? "border-amber-600 ring-2 ring-amber-600/20 bg-amber-50/40"
                                          : "border-stone-300 focus:border-amber-800"
                                      }`}
                                    />
                                    {isPriceCustomized && (
                                      <button
                                        type="button"
                                        onClick={() => handleResetPrice(item.id)}
                                        title={`Reset to standard price (₹${item.originalPrice})`}
                                        className="text-stone-400 hover:text-amber-800 p-1"
                                      >
                                        <RotateCcw className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>

                                  {isPriceCustomized && (
                                    <span className="text-[9px] text-amber-800 font-semibold bg-amber-50 border border-amber-200 rounded px-1">
                                      Custom Price (std ₹{item.originalPrice})
                                    </span>
                                  )}
                                </div>
                              </TableCell>

                              {/* Total for this item */}
                              <TableCell className="text-xs text-right font-bold text-stone-900">
                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                              </TableCell>

                              {/* Delete button */}
                              <TableCell className="text-right p-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="h-7 w-7 text-stone-400 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>

                            {/* Inline Note Editor Row */}
                            {editingNoteItemId === item.id && (
                              <TableRow className="bg-amber-50/50">
                                <TableCell colSpan={5} className="py-2 px-3">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      size={1}
                                      value={itemNoteInput}
                                      onChange={(e) => setItemNoteInput(e.target.value)}
                                      placeholder="e.g. Inscription: 'Happy Birthday John' | Golden pearl border | 5 PM pickup"
                                      className="h-7 text-xs bg-white border-amber-300 text-stone-900 flex-1"
                                    />
                                    <Button
                                      size="sm"
                                      type="button"
                                      onClick={() => handleSaveItemNote(item.id)}
                                      className="h-7 text-xs bg-amber-900 text-white hover:bg-amber-950 px-2.5 font-semibold"
                                    >
                                      Save Note
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      type="button"
                                      onClick={() => setEditingNoteItemId(null)}
                                      className="h-7 text-xs text-stone-500"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Extra Customization Calculations */}
              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2.5 text-xs">
                {/* Subtotal */}
                <div className="flex justify-between text-stone-700 font-medium">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-stone-900">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                {/* GST Toggle and Calculation */}
                <div className="flex items-center justify-between text-stone-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeGst}
                      onChange={(e) => setIncludeGst(e.target.checked)}
                      className="rounded border-stone-300 text-amber-900 focus:ring-amber-800"
                    />
                    <span>Add 5% Bakery GST</span>
                  </label>
                  <span className="font-semibold text-stone-800">
                    {includeGst ? `₹${tax.toLocaleString("en-IN")}` : "Exempt / Included"}
                  </span>
                </div>

                {/* Custom Discount Input */}
                <div className="flex items-center justify-between text-stone-700">
                  <span className="flex items-center gap-1 font-medium">
                    <Percent className="h-3.5 w-3.5 text-amber-800" />
                    Special Discount / Bill Rebate (₹)
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-stone-400 font-medium">- ₹</span>
                    <Input
                      type="number"
                      min="0"
                      value={discount === 0 ? "" : discount}
                      onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="0"
                      className="h-7 w-24 text-right text-xs bg-white border-stone-300 text-stone-900 font-semibold"
                    />
                  </div>
                </div>

                {/* Custom Delivery / Special Packaging */}
                <div className="flex items-center justify-between text-stone-700">
                  <span className="flex items-center gap-1 font-medium">
                    <Truck className="h-3.5 w-3.5 text-amber-800" />
                    Custom Delivery / Packaging (₹)
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-stone-400 font-medium">+ ₹</span>
                    <Input
                      type="number"
                      min="0"
                      value={deliveryFee === 0 ? "" : deliveryFee}
                      onChange={(e) => setDeliveryFee(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="0"
                      className="h-7 w-24 text-right text-xs bg-white border-stone-300 text-stone-900 font-semibold"
                    />
                  </div>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Grand Total (Net Payable)</span>
                  <span className="text-xl text-amber-950 font-extrabold">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-stone-700">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["UPI", "CASH", "CARD", "ONLINE"] as const).map((method) => (
                    <Button
                      key={method}
                      type="button"
                      variant={paymentMethod === method ? "default" : "outline"}
                      onClick={() => setPaymentMethod(method)}
                      className={`h-8 text-xs font-bold transition-all ${
                        paymentMethod === method
                          ? "bg-amber-900 hover:bg-amber-950 text-white border-amber-900 shadow-xs"
                          : "bg-white text-stone-700 border-stone-300 hover:border-amber-700"
                      }`}
                    >
                      {method}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleCreateBill}
                  disabled={billItems.length === 0}
                  className="flex-1 h-11 bg-amber-900 hover:bg-amber-950 text-white font-bold text-sm shadow-xs"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Complete Sale & Generate Bill (₹{grandTotal.toLocaleString("en-IN")})
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Custom Cake / Item Modal */}
      <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddCustomItem} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-800" />
                <span>Add Custom Cake / Ad-Hoc Item</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500">
                Add bespoke custom tiers, fondant figurines, party platters, or off-menu bakery orders with personalized pricing.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-1">
              {/* Item Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  Custom Item Name / Design Title *
                </label>
                <Input
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  placeholder="e.g. 2-Tier Belgian Chocolate Truffle with Fondant Flowers"
                  required
                  className="h-8 text-xs bg-white border-stone-300 text-stone-900"
                />
              </div>

              {/* Custom Price & Qty */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Custom Price (₹) *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(e.target.value)}
                    placeholder="e.g. 2400"
                    required
                    className="h-8 text-xs bg-white border-stone-300 text-stone-900 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={customItemQty}
                    onChange={(e) => setCustomItemQty(e.target.value)}
                    className="h-8 text-xs bg-white border-stone-300 text-stone-900 font-medium"
                  />
                </div>
              </div>

              {/* Quick Price Shortcuts */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-stone-400 font-medium">Quick Pricing:</span>
                {[500, 750, 1000, 1500, 2000, 2500, 3500].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCustomItemPrice(String(p))}
                    className="text-[10px] px-2 py-0.5 rounded border border-stone-200 bg-stone-50 hover:bg-amber-50 hover:border-amber-700 hover:text-amber-900 transition-colors font-medium cursor-pointer"
                  >
                    ₹{p}
                  </button>
                ))}
              </div>

              {/* Dietary Classification: Veg vs Non-Veg */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-stone-700">
                  Dietary Classification
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomItemIsEggless(true)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs text-left transition-all ${
                      customItemIsEggless
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-600"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-3 h-3 border border-emerald-600 rounded-[2px] bg-white p-[1px] shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    </span>
                    <span>100% Eggless (Veg)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomItemIsEggless(false)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs text-left transition-all ${
                      !customItemIsEggless
                        ? "border-amber-800 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-800"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-3 h-3 border border-amber-800 rounded-[2px] bg-white p-[1px] shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-800"></span>
                    </span>
                    <span>Contains Egg</span>
                  </button>
                </div>
              </div>

              {/* Customization Details & Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  Custom Inscription / Chef Notes
                </label>
                <textarea
                  value={customItemNotes}
                  onChange={(e) => setCustomItemNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Message: 'Happy 25th Silver Jubilee' | Light sugar | Garnish with roasted hazelnuts"
                  className="w-full text-xs rounded-md border border-stone-300 bg-white p-2 text-stone-900 placeholder:text-stone-400 outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800/20"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCustomModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs"
              >
                Add Custom Item to Bill
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
