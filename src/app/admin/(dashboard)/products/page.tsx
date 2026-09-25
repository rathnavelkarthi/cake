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
  Pencil,
  Eye,
  EyeOff,
  Check,
  Sparkles,
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

const QUICK_BAKERY_IMAGES = [
  { label: "Belgian Truffle", url: "/images/hero-truffle.jpg" },
  { label: "Fudge Brownies", url: "/images/fudge-brownies.jpg" },
  { label: "Pistachio Rose", url: "/images/celebration-cake.jpg" },
  { label: "Bakery Counter", url: "/images/bakery-counter.jpg" },
  { label: "Red Velvet", url: "/custom-cakes/cake-2.jpg" },
  { label: "Ferrero Rocher", url: "/custom-cakes/cake-3.jpg" },
  { label: "Rasmalai Melts", url: "/custom-cakes/cake-4.jpg" },
  { label: "Caramel Drip", url: "/custom-cakes/cake-5.jpg" },
  { label: "Korean Garlic Bun", url: "/custom-cakes/cake-6.jpg" },
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

  // Edit Product Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("Cakes");
  const [editPrice, setEditPrice] = useState("750");
  const [editSalePrice, setEditSalePrice] = useState("");
  const [editStock, setEditStock] = useState("10");
  const [editLowStockThreshold, setEditLowStockThreshold] = useState("5");
  const [editImageUrl, setEditImageUrl] = useState("/images/hero-truffle.jpg");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");
  const [editFeatured, setEditFeatured] = useState(false);
  const [editBestSeller, setEditBestSeller] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editIsEggless, setEditIsEggless] = useState(true);

  const handleOpenEditProduct = (prod: AdminProductItem) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditCategory(prod.category || "Cakes");
    setEditPrice(String(prod.price || 0));
    setEditSalePrice(prod.salePrice ? String(prod.salePrice) : "");
    setEditStock(String(prod.stock || 0));
    setEditLowStockThreshold(String(prod.lowStockThreshold || 5));
    setEditImageUrl(prod.imageUrl || "/images/hero-truffle.jpg");
    setEditStatus(prod.status === "active" ? "active" : "inactive");
    setEditFeatured(Boolean(prod.featured));
    setEditBestSeller(Boolean(prod.bestSeller));
    setEditDescription(prod.description || "");
    setEditIsEggless(prod.isEggless !== false);
    setIsEditOpen(true);
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateInventoryProduct(editingProduct.id, {
      name: editName.trim(),
      category: editCategory,
      price: parseFloat(editPrice) || 0,
      salePrice: editSalePrice ? parseFloat(editSalePrice) : undefined,
      stock: parseInt(editStock, 10) || 0,
      lowStockThreshold: parseInt(editLowStockThreshold, 10) || 5,
      imageUrl: editImageUrl,
      status: editStatus,
      featured: editFeatured,
      bestSeller: editBestSeller,
      description: editDescription,
      isEggless: editIsEggless,
    });

    setIsEditOpen(false);
    setEditingProduct(null);
  };

  const handleToggleStatus = (id: number | string) => {
    const prod = productsList.find((p) => String(p.id) === String(id));
    if (!prod) return;
    const nextStatus = prod.status === "active" ? "inactive" : "active";
    updateInventoryProduct(id, { status: nextStatus });
  };

  const handleDeleteProduct = (id: number | string) => {
    if (confirm("Are you sure you want to delete this product from the database?")) {
      deleteInventoryProduct(id);
    }
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

                  {/* Status & Show/Hide Toggle */}
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(product.id)}
                      title={product.status === "active" ? "Click to hide from website" : "Click to show on website"}
                      className="inline-flex items-center gap-1.5 cursor-pointer group"
                    >
                      <Badge
                        variant={
                          product.status === "active"
                            ? "success"
                            : product.status === "inactive"
                            ? "secondary"
                            : "destructive"
                        }
                        className={`text-[10px] font-medium transition-all group-hover:scale-105 shadow-2xs ${
                          product.status === "active"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                            : "bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200"
                        }`}
                      >
                        {product.status === "active" ? (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-emerald-600" />
                            Live on Site
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <EyeOff className="w-3 h-3 text-stone-400" />
                            Hidden from Site
                          </span>
                        )}
                      </Badge>
                    </button>
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
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditProduct(product)}
                        title="Edit Product"
                        className="h-8 w-8 text-stone-600 hover:text-amber-900 hover:bg-amber-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit Product</span>
                      </Button>

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
                        <DropdownMenuContent align="end" className="w-48 text-xs">
                          <DropdownMenuLabel>Product Controls</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleOpenEditProduct(product)}
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-3.5 w-3.5 text-stone-600" />
                            Edit Details & Price
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(product.id)}
                            className="cursor-pointer"
                          >
                            {product.status === "active" ? (
                              <>
                                <EyeOff className="mr-2 h-3.5 w-3.5 text-stone-500" />
                                Hide from Website
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-3.5 w-3.5 text-emerald-600" />
                                Show on Website
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteProduct(product.id)}
                            className="cursor-pointer text-red-600 focus:text-red-700"
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Product Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Pencil className="w-4 h-4 text-amber-800" />
              <span>Edit Product & Storefront Visibility</span>
            </DialogTitle>
            <DialogDescription>
              Modify pricing, description, stock levels, and control whether this product is shown on the live website.
            </DialogDescription>
          </DialogHeader>

          {editingProduct && (
            <form onSubmit={handleSaveEditProduct} className="space-y-5 py-2">
              {/* Product Basic Info */}
              <div className="space-y-4 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700">
                    Product Title
                  </label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">
                      Menu Category
                    </label>
                    <Select value={editCategory} onValueChange={setEditCategory}>
                      <SelectTrigger className="bg-white text-xs h-9">
                        <SelectValue placeholder="Category" />
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
                      Standard Price (₹)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">
                      Sale Price (₹, optional)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 699"
                      value={editSalePrice}
                      onChange={(e) => setEditSalePrice(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">
                      Current In-Stock Quantity
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">
                      Low Stock Threshold Alert
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={editLowStockThreshold}
                      onChange={(e) => setEditLowStockThreshold(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Visibility and Flags */}
              <div className="space-y-3 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Storefront Visibility & Merchandising
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">
                      Website Status (Show or Hide)
                    </label>
                    <Select
                      value={editStatus}
                      onValueChange={(v) => setEditStatus(v as "active" | "inactive")}
                    >
                      <SelectTrigger className="bg-white text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active" className="text-xs font-semibold text-emerald-700">
                          ✓ Show on Website (Active)
                        </SelectItem>
                        <SelectItem value="inactive" className="text-xs font-semibold text-stone-500">
                          ✕ Hide from Website (Hidden / Draft)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col justify-center gap-2 pt-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFeatured}
                        onChange={(e) => setEditFeatured(e.target.checked)}
                        className="rounded border-stone-300 text-amber-900 focus:ring-amber-800"
                      />
                      <span>Feature on Storefront Homepage</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editBestSeller}
                        onChange={(e) => setEditBestSeller(e.target.checked)}
                        className="rounded border-stone-300 text-amber-900 focus:ring-amber-800"
                      />
                      <span>Mark as Best Seller Badge</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsEggless}
                        onChange={(e) => setEditIsEggless(e.target.checked)}
                        className="rounded border-stone-300 text-amber-900 focus:ring-amber-800"
                      />
                      <span>100% Pure Eggless Bake</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Image Selection with Quick Gallery */}
              <div className="space-y-3 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-amber-800" />
                    Product Photography
                  </h4>
                  <span className="text-[11px] text-stone-400">Click any image to select</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 rounded-xl border border-stone-300 overflow-hidden shrink-0 bg-stone-100">
                    <Image
                      src={editImageUrl || "/images/hero-truffle.jpg"}
                      alt={editName || "Product"}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-semibold text-stone-600">
                      Image URL / Path
                    </label>
                    <Input
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="/images/hero-truffle.jpg"
                      className="bg-white text-xs h-8"
                    />
                  </div>
                </div>

                {/* Quick Picker Thumbnails */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-stone-500 font-medium">Quick Bakery Photos:</span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {QUICK_BAKERY_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditImageUrl(img.url)}
                        className={`group relative aspect-square rounded-lg overflow-hidden border transition-all ${
                          editImageUrl === img.url
                            ? "border-amber-800 ring-2 ring-amber-800/20"
                            : "border-stone-200 hover:border-amber-600"
                        }`}
                        title={img.label}
                      >
                        <Image src={img.url} alt={img.label} fill sizes="48px" className="object-cover" />
                        {editImageUrl === img.url && (
                          <div className="absolute inset-0 bg-amber-900/30 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white drop-shadow-sm" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Product Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  placeholder="Artisanal recipe details, Belgian chocolate percentage, flavor notes..."
                  className="w-full text-xs rounded-md border border-stone-200 bg-white p-2.5 focus:outline-hidden focus:ring-1 focus:ring-amber-900"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-amber-900 hover:bg-amber-950 text-white font-medium shadow-sm"
                >
                  Save Changes to Database
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

