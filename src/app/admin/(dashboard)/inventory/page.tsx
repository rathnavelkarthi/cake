"use client";

import React, { useState } from "react";
import {
  Package,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  History,
  CheckCircle2,
  ChefHat,
  Scale,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  localRawMaterials,
  produceProductBatch,
  AdminProductItem,
  RawMaterialItem,
  getInventoryProducts,
  subscribeInventory,
  addRawMaterial,
} from "@/lib/db/admin-data";

interface StockMovement {
  id: number;
  itemName: string;
  category: "Product" | "Raw Material";
  type: "PRODUCTION" | "PURCHASE" | "DAMAGE" | "ADJUSTMENT" | "SALE";
  quantity: string;
  reason: string;
  timestamp: string;
}

export default function AdminInventoryPage() {
  const [activeInventoryTab, setActiveInventoryTab] = useState<
    "products" | "raw_materials"
  >("products");

  // Inventories State from Unified Inventory Store
  const [products, setProducts] = useState<AdminProductItem[]>(getInventoryProducts);
  const [rawMaterials, setRawMaterials] = useState<RawMaterialItem[]>(
    localRawMaterials
  );

  React.useEffect(() => {
    return subscribeInventory(() => {
      setProducts(getInventoryProducts());
      setRawMaterials([...localRawMaterials]);
    });
  }, []);

  const [movements, setMovements] = useState<StockMovement[]>([
    {
      id: 1,
      itemName: "Belgian Dark Chocolate Truffle",
      category: "Product",
      type: "PRODUCTION",
      quantity: "+10 units",
      reason: "Kitchen morning bake batch (consumed 3.5kg Callebaut, 2.5kg Flour)",
      timestamp: "Today, 08:30 AM",
    },
    {
      id: 2,
      itemName: "54% Callebaut Dark Belgian Chocolate",
      category: "Raw Material",
      type: "PRODUCTION",
      quantity: "-3.50 kg",
      reason: "Deducted for Truffle Cake batch #104",
      timestamp: "Today, 08:30 AM",
    },
    {
      id: 3,
      itemName: "High-Gluten Bread Flour (for Bagels)",
      category: "Raw Material",
      type: "PURCHASE",
      quantity: "+25.0 kg",
      reason: "Wholesale mill supplier delivery",
      timestamp: "Yesterday, 04:00 PM",
    },
  ]);

  const [search, setSearch] = useState("");

  // Production / Bake Batch Modal State
  const [isBakeOpen, setIsBakeOpen] = useState(false);
  const [selectedBakeProductId, setSelectedBakeProductId] = useState<string>(
    products[0]?.id.toString() || "1"
  );
  const [bakeUnits, setBakeUnits] = useState("5");
  const [productionSuccess, setProductionSuccess] = useState<string | null>(null);

  // Manual Adjust Modal
  const [selectedAdjustItem, setSelectedAdjustItem] = useState<{
    id: number | string;
    name: string;
    stock: number;
    unit: string;
    isRaw: boolean;
  } | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("5");
  const [adjustType, setAdjustType] = useState<"ADD" | "SUBTRACT">("ADD");
  const [adjustReason, setAdjustReason] = useState("Manual correction");

  // New Raw Material Modal
  const [isAddRawOpen, setIsAddRawOpen] = useState(false);
  const [newRawName, setNewRawName] = useState("");
  const [newRawCategory, setNewRawCategory] = useState("Flours & Grains");
  const [newRawStock, setNewRawStock] = useState("20");
  const [newRawUnit, setNewRawUnit] = useState<"kg" | "l" | "pcs">("kg");
  const [newRawThreshold, setNewRawThreshold] = useState("5");

  // Selected Bake Product Calculations
  const selectedProduct = products.find(
    (p) => p.id.toString() === selectedBakeProductId
  );
  const unitsToBake = parseInt(bakeUnits, 10) || 0;

  const rawConsumptionPreview = (selectedProduct?.recipe || []).map((ing) => {
    const raw = rawMaterials.find((r) => r.id === ing.rawMaterialId);
    let total = ing.amount * unitsToBake;
    let displayTotal = "";

    if (ing.unit === "g") {
      displayTotal = total >= 1000 ? `${(total / 1000).toFixed(2)} kg` : `${total} g`;
    } else if (ing.unit === "ml") {
      displayTotal = total >= 1000 ? `${(total / 1000).toFixed(2)} L` : `${total} ml`;
    } else {
      displayTotal = `${total} ${ing.unit}`;
    }

    const available = raw ? raw.stock : 0;
    const requiredInBase = ing.unit === "g" || ing.unit === "ml" ? total / 1000 : total;
    const sufficient = available >= requiredInBase;

    return {
      name: ing.rawMaterialName,
      perUnit: `${ing.amount} ${ing.unit}`,
      batchTotal: displayTotal,
      available: raw ? `${raw.stock} ${raw.unit}` : "Unknown",
      sufficient,
    };
  });

  const handleExecuteProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || unitsToBake <= 0) return;

    try {
      const result = await produceProductBatch(selectedProduct.id, unitsToBake);

      // Refresh product stock
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProduct.id ? { ...p, stock: result.newProductStock } : p
        )
      );

      // Refresh raw materials
      setRawMaterials([...localRawMaterials]);

      // Add movement logs
      const newMovement: StockMovement = {
        id: movements.length + 1,
        itemName: selectedProduct.name,
        category: "Product",
        type: "PRODUCTION",
        quantity: `+${unitsToBake} units`,
        reason: `Bake batch completed. Auto-deducted ${result.deductions.length} raw materials.`,
        timestamp: "Just now",
      };

      setMovements([newMovement, ...movements]);
      setIsBakeOpen(false);
      setProductionSuccess(
        `Successfully produced ${unitsToBake} units of "${selectedProduct.name}"! Raw materials deducted.`
      );
      setTimeout(() => setProductionSuccess(null), 5000);
    } catch {
      // handled
    }
  };

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdjustItem) return;

    const num = parseFloat(adjustAmount) || 0;
    const delta = adjustType === "ADD" ? num : -num;

    if (selectedAdjustItem.isRaw) {
      setRawMaterials((prev) =>
        prev.map((r) => {
          if (r.id !== selectedAdjustItem.id) return r;
          const nextStock = Math.max(0, Math.round((r.stock + delta) * 100) / 100);
          return { ...r, stock: nextStock };
        })
      );
    } else {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== selectedAdjustItem.id) return p;
          const nextStock = Math.max(0, Math.round(p.stock + delta));
          return { ...p, stock: nextStock };
        })
      );
    }

    setMovements([
      {
        id: movements.length + 1,
        itemName: selectedAdjustItem.name,
        category: selectedAdjustItem.isRaw ? "Raw Material" : "Product",
        type: adjustType === "ADD" ? "PURCHASE" : "ADJUSTMENT",
        quantity: `${delta > 0 ? `+${delta}` : delta} ${selectedAdjustItem.unit}`,
        reason: adjustReason || "Manual adjustment",
        timestamp: "Just now",
      },
      ...movements,
    ]);

    setSelectedAdjustItem(null);
  };

  const handleCreateRawMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRawName.trim()) return;

    addRawMaterial({
      name: newRawName.trim(),
      sku: `RAW-${newRawCategory.slice(0, 3).toUpperCase()}-${rawMaterials.length + 1}`,
      category: newRawCategory,
      stock: parseFloat(newRawStock) || 0,
      unit: newRawUnit,
      minThreshold: parseFloat(newRawThreshold) || 5,
      costPerUnit: 120,
    });

    setIsAddRawOpen(false);
    setNewRawName("");
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Dual Inventory Management
          </h1>
          <p className="text-sm text-stone-500">
            Finished product stock & raw material inventory with automatic consumption calculations.
          </p>
        </div>

        {/* Kitchen Bake Production Action */}
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsBakeOpen(true)}
            className="bg-amber-900 hover:bg-amber-950 text-white font-medium text-xs h-9 shadow-sm"
          >
            <ChefHat className="mr-1.5 h-4 w-4" />
            Bake / Produce Batch
          </Button>
        </div>
      </div>

      {productionSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{productionSuccess}</span>
        </div>
      )}

      {/* Dual Inventory Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Tabs
            value={activeInventoryTab}
            onValueChange={(v) =>
              setActiveInventoryTab(v as "products" | "raw_materials")
            }
          >
            <TabsList className="bg-stone-100">
              <TabsTrigger value="products" className="text-xs">
                Product Inventory ({products.length} Items)
              </TabsTrigger>
              <TabsTrigger value="raw_materials" className="text-xs">
                Raw Material Inventory ({rawMaterials.length} Items)
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
              <Input
                type="search"
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-xs border-stone-200 bg-white"
              />
            </div>

            {activeInventoryTab === "raw_materials" && (
              <Button
                size="sm"
                onClick={() => setIsAddRawOpen(true)}
                variant="outline"
                className="h-9 text-xs gap-1 border-stone-300"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Raw Material
              </Button>
            )}
          </div>
        </div>

        {/* TAB 1: PRODUCT INVENTORY */}
        {activeInventoryTab === "products" && (
          <div className="rounded-xl border border-stone-200 bg-white shadow-xs overflow-hidden">
            <Table>
              <TableHeader className="bg-stone-50/70">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Product Name</TableHead>
                  <TableHead className="text-xs font-semibold">SKU</TableHead>
                  <TableHead className="text-xs font-semibold">Category</TableHead>
                  <TableHead className="text-xs font-semibold">Recipe Components</TableHead>
                  <TableHead className="text-xs font-semibold">Finished Stock</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(search.toLowerCase()) ||
                      p.sku.toLowerCase().includes(search.toLowerCase()) ||
                      p.category.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((item) => {
                    const isOutOfStock = item.stock === 0;
                    const isLowStock = item.stock <= item.lowStockThreshold;

                    return (
                      <TableRow key={item.id} className="hover:bg-stone-50/50">
                        <TableCell className="font-semibold text-xs text-stone-900">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-stone-500">
                          {item.sku}
                        </TableCell>
                        <TableCell className="text-xs text-stone-600">
                          {item.category}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {item.recipe && item.recipe.length > 0 ? (
                              item.recipe.slice(0, 3).map((r, i) => (
                                <span
                                  key={i}
                                  className="inline-block bg-stone-100 text-stone-700 rounded px-1.5 py-0.5 text-[10px]"
                                >
                                  {r.rawMaterialName.split(" ")[0]}: {r.amount}{r.unit}
                                </span>
                              ))
                            ) : (
                              <span className="text-stone-400 text-[10px]">None</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-bold">
                          <span
                            className={
                              isOutOfStock
                                ? "text-red-600"
                                : isLowStock
                                ? "text-amber-700"
                                : "text-stone-900"
                            }
                          >
                            {item.stock} units
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              isOutOfStock
                                ? "destructive"
                                : isLowStock
                                ? "warning"
                                : "success"
                            }
                            className="text-[10px]"
                          >
                            {isOutOfStock
                              ? "Out of Stock"
                              : isLowStock
                              ? "Low Stock"
                              : "In Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setSelectedAdjustItem({
                                id: item.id,
                                name: item.name,
                                stock: item.stock,
                                unit: "units",
                                isRaw: false,
                              })
                            }
                            className="h-7 text-xs border-stone-300 hover:bg-stone-100"
                          >
                            Adjust Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* TAB 2: RAW MATERIAL INVENTORY */}
        {activeInventoryTab === "raw_materials" && (
          <div className="rounded-xl border border-stone-200 bg-white shadow-xs overflow-hidden">
            <Table>
              <TableHeader className="bg-stone-50/70">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Raw Material / Ingredient</TableHead>
                  <TableHead className="text-xs font-semibold">SKU</TableHead>
                  <TableHead className="text-xs font-semibold">Category</TableHead>
                  <TableHead className="text-xs font-semibold">Available Stock</TableHead>
                  <TableHead className="text-xs font-semibold">Min Threshold</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rawMaterials
                  .filter(
                    (r) =>
                      r.name.toLowerCase().includes(search.toLowerCase()) ||
                      r.sku.toLowerCase().includes(search.toLowerCase()) ||
                      r.category.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((raw) => {
                    const isLow = raw.stock <= raw.minThreshold;
                    const isOut = raw.stock <= 0;

                    return (
                      <TableRow key={raw.id} className="hover:bg-stone-50/50">
                        <TableCell className="font-semibold text-xs text-stone-900">
                          {raw.name}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-stone-500">
                          {raw.sku}
                        </TableCell>
                        <TableCell className="text-xs text-stone-600">
                          {raw.category}
                        </TableCell>
                        <TableCell className="text-xs font-bold">
                          <span
                            className={
                              isOut
                                ? "text-red-600"
                                : isLow
                                ? "text-amber-700"
                                : "text-emerald-700"
                            }
                          >
                            {raw.stock} {raw.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-stone-500">
                          {raw.minThreshold} {raw.unit}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isOut ? "destructive" : isLow ? "warning" : "success"}
                            className="text-[10px]"
                          >
                            {isOut ? "Depleted" : isLow ? "Low Stock" : "Sufficient"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setSelectedAdjustItem({
                                id: raw.id,
                                name: raw.name,
                                stock: raw.stock,
                                unit: raw.unit,
                                isRaw: true,
                              })
                            }
                            className="h-7 text-xs border-stone-300 hover:bg-stone-100"
                          >
                            Receive / Adjust
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* MODAL 1: BAKE / PRODUCE BATCH (Automatic Raw Material Calculation & Deduction) */}
      <Dialog open={isBakeOpen} onOpenChange={setIsBakeOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-amber-900" />
              Kitchen Production Batch
            </DialogTitle>
            <DialogDescription>
              Select a product and batch quantity. The system calculates and deducts raw materials automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleExecuteProduction} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Product to Produce
              </label>
              <Select
                value={selectedBakeProductId}
                onValueChange={setSelectedBakeProductId}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()} className="text-xs">
                      {p.name} ({p.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Quantity to Bake / Produce
              </label>
              <Input
                type="number"
                min="1"
                value={bakeUnits}
                onChange={(e) => setBakeUnits(e.target.value)}
                required
              />
            </div>

            {/* Calculated Raw Materials Requirement */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                <span className="flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-amber-800" />
                  Calculated Raw Material Deduction:
                </span>
                <span>{unitsToBake} units batch</span>
              </div>

              <div className="space-y-1 text-xs pt-1">
                {rawConsumptionPreview.length === 0 ? (
                  <p className="text-stone-500 italic">No recipe linked to this product.</p>
                ) : (
                  rawConsumptionPreview.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1 px-2 rounded bg-white border border-amber-100 text-stone-800"
                    >
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-2 font-bold">
                        <span className="text-amber-950">- {item.batchTotal}</span>
                        <span
                          className={`text-[10px] font-normal ${
                            item.sufficient ? "text-emerald-700" : "text-red-600"
                          }`}
                        >
                          ({item.available} in stock)
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBakeOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={unitsToBake <= 0}
                className="bg-amber-900 hover:bg-amber-950 text-white font-bold"
              >
                Complete Bake & Deduct Raw Materials
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: MANUAL ADJUSTMENT */}
      {selectedAdjustItem && (
        <Dialog
          open={!!selectedAdjustItem}
          onOpenChange={() => setSelectedAdjustItem(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Adjust Stock: {selectedAdjustItem.name}
              </DialogTitle>
              <DialogDescription>
                Updates {selectedAdjustItem.isRaw ? "Raw Material" : "Finished Product"} inventory and creates audit log.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleApplyAdjustment} className="space-y-4 py-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-xs font-medium text-stone-600">
                  Current Stock
                </span>
                <span className="text-sm font-bold text-stone-900">
                  {selectedAdjustItem.stock} {selectedAdjustItem.unit}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={adjustType === "ADD" ? "default" : "outline"}
                    onClick={() => setAdjustType("ADD")}
                    className="h-9 text-xs"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Receive / Add
                  </Button>
                  <Button
                    type="button"
                    variant={adjustType === "SUBTRACT" ? "default" : "outline"}
                    onClick={() => setAdjustType("SUBTRACT")}
                    className="h-9 text-xs"
                  >
                    <Minus className="mr-1.5 h-3.5 w-3.5" />
                    Waste / Deduct
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Quantity ({selectedAdjustItem.unit})
                </label>
                <Input
                  type="number"
                  step="any"
                  min="0.01"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Reason for Adjustment
                </label>
                <Input
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Supplier delivery or spill wastage"
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedAdjustItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-900 hover:bg-amber-950 text-white"
                >
                  Confirm Adjustment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL 3: ADD NEW RAW MATERIAL */}
      <Dialog open={isAddRawOpen} onOpenChange={setIsAddRawOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Raw Material / Ingredient</DialogTitle>
            <DialogDescription>
              Register a new raw ingredient into the bakery inventory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRawMaterial} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Material Name
              </label>
              <Input
                placeholder="e.g. Organic Rolled Oats, Matcha Powder"
                value={newRawName}
                onChange={(e) => setNewRawName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Category
                </label>
                <Input
                  value={newRawCategory}
                  onChange={(e) => setNewRawCategory(e.target.value)}
                  placeholder="Flours, Dairy, Flavours"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Base Measurement Unit
                </label>
                <Select
                  value={newRawUnit}
                  onValueChange={(v) => setNewRawUnit(v as "kg" | "l" | "pcs")}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg (Kilograms)</SelectItem>
                    <SelectItem value="l">l (Litres)</SelectItem>
                    <SelectItem value="pcs">pcs (Pieces)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Initial Stock
                </label>
                <Input
                  type="number"
                  step="any"
                  value={newRawStock}
                  onChange={(e) => setNewRawStock(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Low Stock Threshold
                </label>
                <Input
                  type="number"
                  step="any"
                  value={newRawThreshold}
                  onChange={(e) => setNewRawThreshold(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddRawOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-amber-900 hover:bg-amber-950 text-white"
              >
                Register Raw Material
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Movement Audit Log */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-stone-500" />
          <h2 className="text-base font-semibold text-stone-900">
            Combined Movement Audit Logs (Finished Products & Raw Materials)
          </h2>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white shadow-xs overflow-hidden">
          <Table>
            <TableHeader className="bg-stone-50/70">
              <TableRow>
                <TableHead className="text-xs font-semibold">Timestamp</TableHead>
                <TableHead className="text-xs font-semibold">Item</TableHead>
                <TableHead className="text-xs font-semibold">Inventory</TableHead>
                <TableHead className="text-xs font-semibold">Type</TableHead>
                <TableHead className="text-xs font-semibold">Change</TableHead>
                <TableHead className="text-xs font-semibold">Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => (
                <TableRow key={m.id} className="hover:bg-stone-50/50">
                  <TableCell className="text-xs text-stone-500">
                    {m.timestamp}
                  </TableCell>
                  <TableCell className="font-medium text-xs text-stone-900">
                    {m.itemName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={m.category === "Product" ? "default" : "outline"}
                      className="text-[10px]"
                    >
                      {m.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">
                      {m.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold">
                    <span
                      className={
                        m.quantity.startsWith("+")
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }
                    >
                      {m.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-stone-600">
                    {m.reason}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
