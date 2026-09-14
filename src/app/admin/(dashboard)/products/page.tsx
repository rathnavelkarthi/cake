"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Upload,
  Layers,
  Scale,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ImageIcon,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  localRawMaterials,
  produceProductBatch,
  AdminProductItem,
  RecipeIngredient,
  getInventoryProducts,
  subscribeInventory,
  addInventoryProduct,
  updateInventoryProduct,
  deleteInventoryProduct,
} from "@/lib/db/admin-data";

const MENU_CATEGORIES = [
  "Cakes",
  "Bagels",
  "Brownies",
  "Pastries",
  "Cheesecakes & Tarts",
  "Artisanal Breads",
  "Cookies & Macarons",
];

export default function AdminProductsPage() {
  const [productsList, setProductsList] = useState<AdminProductItem[]>(getInventoryProducts);
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState<string>("all");

  React.useEffect(() => {
    return subscribeInventory(() => {
      setProductsList(getInventoryProducts());
    });
  }, []);

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("Cakes");
  const [newProductPrice, setNewProductPrice] = useState("750");
  const [newProductStock, setNewProductStock] = useState("10");

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string>("/images/hero-truffle.jpg");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recipe / Raw Material Ingredients State
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([
    {
      rawMaterialId: 1,
      rawMaterialName: "Refined Wheat Flour (Maida)",
      amount: 250,
      unit: "g",
    },
    {
      rawMaterialId: 4,
      rawMaterialName: "Unsalted Dairy Butter",
      amount: 120,
      unit: "g",
    },
  ]);

  // Custom new byproduct/raw material state
  const [customRawName, setCustomRawName] = useState("");
  const [customRawUnit, setCustomRawUnit] = useState<"g" | "kg" | "ml" | "l">("g");
  const [customRawAmount, setCustomRawAmount] = useState("100");
  const [showAddCustomRaw, setShowAddCustomRaw] = useState(false);

  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      if (selectedTab === "all") return matchesSearch;
      return matchesSearch && product.status === selectedTab;
    });
  }, [productsList, search, selectedTab]);

  // Handle local image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Raw material calculation for the initial batch
  const initialBatchCount = parseInt(newProductStock, 10) || 0;
  const calculatedDeductions = useMemo(() => {
    return recipeIngredients.map((ing) => {
      const totalAmount = ing.amount * initialBatchCount;
      let displayTotal = "";
      let inBaseUnit = totalAmount;

      if (ing.unit === "g") {
        if (totalAmount >= 1000) {
          displayTotal = `${(totalAmount / 1000).toFixed(2)} kg`;
          inBaseUnit = totalAmount / 1000;
        } else {
          displayTotal = `${totalAmount} g`;
        }
      } else if (ing.unit === "ml") {
        if (totalAmount >= 1000) {
          displayTotal = `${(totalAmount / 1000).toFixed(2)} L`;
          inBaseUnit = totalAmount / 1000;
        } else {
          displayTotal = `${totalAmount} ml`;
        }
      } else {
        displayTotal = `${totalAmount} ${ing.unit}`;
      }

      // Check available raw stock
      const raw = localRawMaterials.find((r) => r.id === ing.rawMaterialId);
      const available = raw ? raw.stock : 0;
      const isSufficient = available >= (ing.unit === "g" ? totalAmount / 1000 : totalAmount);

      return {
        name: ing.rawMaterialName,
        perUnit: `${ing.amount} ${ing.unit}`,
        batchTotal: displayTotal,
        availableStock: raw ? `${raw.stock} ${raw.unit}` : "N/A",
        isSufficient,
      };
    });
  }, [recipeIngredients, initialBatchCount]);

  const handleAddExistingIngredient = (rawIdStr: string) => {
    const rawId = parseInt(rawIdStr, 10);
    const raw = localRawMaterials.find((r) => r.id === rawId);
    if (!raw) return;

    if (recipeIngredients.some((i) => i.rawMaterialId === raw.id)) return;

    setRecipeIngredients([
      ...recipeIngredients,
      {
        rawMaterialId: raw.id,
        rawMaterialName: raw.name,
        amount: raw.unit === "kg" ? 200 : 100,
        unit: raw.unit === "kg" ? "g" : raw.unit === "l" ? "ml" : "pcs",
      },
    ]);
  };

  const handleUpdateIngredientAmount = (index: number, newAmount: number) => {
    setRecipeIngredients((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, amount: Math.max(1, newAmount) } : item
      )
    );
  };

  const handleUpdateIngredientUnit = (
    index: number,
    newUnit: "g" | "kg" | "ml" | "l" | "pcs"
  ) => {
    setRecipeIngredients((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, unit: newUnit } : item))
    );
  };

  const handleRemoveIngredient = (index: number) => {
    setRecipeIngredients((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCreateCustomRawMaterial = () => {
    if (!customRawName.trim()) return;

    const newId = localRawMaterials.length + 100;
    const amountNum = parseFloat(customRawAmount) || 100;

    // Add to active recipe
    setRecipeIngredients([
      ...recipeIngredients,
      {
        rawMaterialId: newId,
        rawMaterialName: customRawName.trim(),
        amount: amountNum,
        unit: customRawUnit,
      },
    ]);

    setCustomRawName("");
    setShowAddCustomRaw(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const initialStock = parseInt(newProductStock, 10) || 0;

    // Call unified inventory store: adds product, calculates & deducts raw materials,
    // and immediately syncs to storefront landing page
    addInventoryProduct({
      name: newProductName.trim(),
      category: newProductCategory,
      price: parseFloat(newProductPrice) || 0,
      stock: initialStock,
      lowStockThreshold: 5,
      imageUrl: imagePreview,
      recipe: recipeIngredients,
    });

    setIsAddOpen(false);

    // Reset form
    setNewProductName("");
    setNewProductPrice("750");
    setNewProductStock("10");
  };

  const handleToggleStatus = (id: number) => {
    const prod = productsList.find((p) => p.id === id);
    if (!prod) return;
    const nextStatus = prod.status === "active" ? "inactive" : "active";
    updateInventoryProduct(id, { status: nextStatus });
  };

  const handleDeleteProduct = (id: number) => {
    deleteInventoryProduct(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Products & Menu Catalogue
          </h1>
          <p className="text-sm text-stone-500">
            Finished baked goods, recipes, and real-time raw material consumption.
          </p>
        </div>

        {/* Add Product Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-900 hover:bg-amber-950 text-white font-medium shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-stone-900">
                Add New Product to Menu
              </DialogTitle>
              <DialogDescription>
                Configure item details, menu category, image, and raw material bill of materials.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveProduct} className="space-y-6 py-2">
              {/* Section 1: Basic Information & Menu Category */}
              <div className="space-y-4 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-amber-800" />
                  Product Info & Menu Category
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700">
                    Product Name
                  </label>
                  <Input
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="e.g. Artisanal Sesame Bagel or Dark Chocolate Truffle"
                    required
                    className="bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Menu Category Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">
                      Menu Category
                    </label>
                    <Select
                      value={newProductCategory}
                      onValueChange={setNewProductCategory}
                    >
                      <SelectTrigger className="bg-white text-xs h-9">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {MENU_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-xs">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">
                      Selling Price (₹)
                    </label>
                    <Input
                      type="number"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      placeholder="650"
                      required
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">
                      Initial Batch Stock
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={newProductStock}
                      onChange={(e) => setNewProductStock(e.target.value)}
                      placeholder="10"
                      required
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Image Upload & Preview */}
              <div className="space-y-3 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-amber-800" />
                  Product Image
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative h-24 w-24 rounded-xl overflow-hidden border-2 border-stone-200 bg-white shadow-xs shrink-0">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 text-xs gap-1.5 bg-white border-stone-300"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload Photo
                    </Button>
                    <p className="text-[11px] text-stone-500">
                      Supports PNG, JPG, WebP up to 5MB. Photo will appear on customer menu and POS bill.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Raw Materials / Byproducts Recipe Selection */}
              <div className="space-y-4 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                      <Scale className="h-3.5 w-3.5 text-amber-800" />
                      Raw Material Inventory & Recipe
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Select raw materials used to bake 1 unit of this product.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Add existing raw material */}
                    <Select onValueChange={handleAddExistingIngredient}>
                      <SelectTrigger className="h-7 text-[11px] bg-white w-44">
                        <SelectValue placeholder="+ Select Raw Material" />
                      </SelectTrigger>
                      <SelectContent>
                        {localRawMaterials.map((r) => (
                          <SelectItem key={r.id} value={r.id.toString()} className="text-xs">
                            {r.name} ({r.stock} {r.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddCustomRaw(!showAddCustomRaw)}
                      className="h-7 text-[11px] px-2 bg-white"
                    >
                      + New Byproduct
                    </Button>
                  </div>
                </div>

                {/* Inline New Byproduct Form */}
                {showAddCustomRaw && (
                  <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 space-y-2">
                    <p className="text-xs font-semibold text-amber-900">
                      Add Custom Byproduct / Ingredient
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input
                        placeholder="Ingredient name (e.g. Yeast)"
                        value={customRawName}
                        onChange={(e) => setCustomRawName(e.target.value)}
                        className="h-8 text-xs bg-white"
                      />
                      <Input
                        type="number"
                        placeholder="Volume / Weight"
                        value={customRawAmount}
                        onChange={(e) => setCustomRawAmount(e.target.value)}
                        className="h-8 text-xs bg-white"
                      />
                      <div className="flex gap-2">
                        <Select
                          value={customRawUnit}
                          onValueChange={(v) =>
                            setCustomRawUnit(v as "g" | "kg" | "ml" | "l")
                          }
                        >
                          <SelectTrigger className="h-8 text-xs bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="l">l</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleCreateCustomRawMaterial}
                          className="h-8 text-xs bg-amber-900 text-white"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Recipe Items List */}
                <div className="space-y-2">
                  {recipeIngredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200 bg-white gap-3"
                    >
                      <span className="text-xs font-semibold text-stone-900 flex-1">
                        {ing.rawMaterialName}
                      </span>

                      <div className="flex items-center gap-2">
                        <div className="w-24">
                          <Input
                            type="number"
                            min="1"
                            value={ing.amount}
                            onChange={(e) =>
                              handleUpdateIngredientAmount(
                                idx,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="h-7 text-xs text-right pr-2"
                          />
                        </div>

                        <Select
                          value={ing.unit}
                          onValueChange={(val) =>
                            handleUpdateIngredientUnit(
                              idx,
                              val as "g" | "kg" | "ml" | "l" | "pcs"
                            )
                          }
                        >
                          <SelectTrigger className="h-7 w-20 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="l">l</SelectItem>
                            <SelectItem value="pcs">pcs</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveIngredient(idx)}
                          className="h-7 w-7 text-stone-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Live Raw Material Consumption Calculation */}
              {initialBatchCount > 0 && recipeIngredients.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-amber-800" />
                      Calculated Raw Material Deduction
                    </span>
                    <Badge variant="outline" className="bg-amber-100 text-amber-900 text-[10px]">
                      Batch: {initialBatchCount} units
                    </Badge>
                  </div>

                  <p className="text-xs text-amber-900">
                    Producing this initial batch of <strong>{initialBatchCount} {newProductName || "product"}</strong> will automatically take the following from Raw Materials Inventory:
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {calculatedDeductions.map((ded, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white/70 border border-amber-100"
                      >
                        <span className="font-medium text-stone-800">
                          {ded.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-950">
                            - {ded.batchTotal}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            (Available: {ded.availableStock})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-900 hover:bg-amber-950 text-white font-bold"
                >
                  Save Product & Deduct Raw Materials
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-stone-100">
            <TabsTrigger value="all" className="text-xs">
              All ({productsList.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              Active (
              {productsList.filter((p) => p.status === "active").length})
            </TabsTrigger>
            <TabsTrigger value="inactive" className="text-xs">
              Draft (
              {productsList.filter((p) => p.status === "inactive").length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="text-xs">
              Archived (
              {productsList.filter((p) => p.status === "archived").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
          <Input
            type="search"
            placeholder="Search by name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-xs border-stone-200 bg-white"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-stone-50/70">
            <TableRow>
              <TableHead className="w-[70px] text-xs font-semibold">Image</TableHead>
              <TableHead className="text-xs font-semibold">Name & SKU</TableHead>
              <TableHead className="text-xs font-semibold">Menu Category</TableHead>
              <TableHead className="text-xs font-semibold">Recipe Ingredients</TableHead>
              <TableHead className="text-xs font-semibold">Status</TableHead>
              <TableHead className="text-xs font-semibold">Price</TableHead>
              <TableHead className="text-xs font-semibold">Stock</TableHead>
              <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-stone-500 text-sm">
                  No products found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-stone-50/50">
                  {/* Thumbnail */}
                  <TableCell>
                    <div className="relative h-11 w-11 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                      <Image
                        src={product.imageUrl || "/images/hero-truffle.jpg"}
                        alt={product.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                  </TableCell>

                  {/* Name and SKU */}
                  <TableCell>
                    <div className="font-semibold text-stone-900 text-xs">
                      {product.name}
                    </div>
                    <div className="text-[10px] font-mono text-stone-400">
                      {product.sku}
                    </div>
                  </TableCell>

                  {/* Menu Category */}
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] bg-stone-50">
                      {product.category}
                    </Badge>
                  </TableCell>

                  {/* Recipe Ingredients / BOM */}
                  <TableCell className="text-xs">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {product.recipe && product.recipe.length > 0 ? (
                        product.recipe.map((r, i) => (
                          <span
                            key={i}
                            className="inline-block bg-amber-50 text-amber-900 border border-amber-100 rounded px-1.5 py-0.5 text-[10px]"
                          >
                            {r.rawMaterialName.split(" ")[0]}: {r.amount}{r.unit}
                          </span>
                        ))
                      ) : (
                        <span className="text-stone-400 text-[10px]">
                          No recipe set
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "active"
                          ? "success"
                          : product.status === "inactive"
                          ? "secondary"
                          : "destructive"
                      }
                      className="text-[10px] capitalize font-medium"
                    >
                      {product.status}
                    </Badge>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="font-semibold text-stone-900 text-xs">
                    ₹{product.price.toLocaleString("en-IN")}
                  </TableCell>

                  {/* Stock Level */}
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold ${
                          product.stock === 0
                            ? "text-red-600"
                            : product.stock <= 5
                            ? "text-amber-700"
                            : "text-stone-800"
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions Dropdown */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-stone-500 hover:text-stone-900"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 text-xs">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(product.id)}
                          className="cursor-pointer"
                        >
                          {product.status === "active"
                            ? "Mark Inactive"
                            : "Set Active"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteProduct(product.id)}
                          className="cursor-pointer text-red-600 focus:text-red-700"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
