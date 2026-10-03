"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
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
  MapPin,
  Copy,
  ExternalLink,
  ChefHat,
  BookOpen,
  Camera,
  Loader2,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { exportProducts } from "@/lib/bulk-import/export";
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
  getDefaultRecipeForProduct,
} from "@/lib/db/admin-data";

const RECIPE_PRESETS: {
  label: string;
  icon: string;
  category: string;
  description: string;
  ingredients: RecipeIngredient[];
}[] = [
  {
    label: "Belgian Chocolate Truffle",
    icon: "🍫",
    category: "Cakes",
    description: "Multi-layered Dutch dark chocolate sponge steeped in single-origin syrup and blanketed in 54% Callebaut ganache.",
    ingredients: [
      { rawMaterialId: 3, rawMaterialName: "54% Callebaut Dark Belgian Chocolate", amount: 300, unit: "g" },
      { rawMaterialId: 1, rawMaterialName: "Refined Wheat Flour (Maida)", amount: 250, unit: "g" },
      { rawMaterialId: 4, rawMaterialName: "Unsalted Dairy Butter", amount: 180, unit: "g" },
      { rawMaterialId: 5, rawMaterialName: "Granulated White Sugar", amount: 150, unit: "g" },
      { rawMaterialId: 8, rawMaterialName: "Heavy Dairy Whipping Cream", amount: 200, unit: "ml" },
    ],
  },
  {
    label: "Artisanal Sesame Bagel",
    icon: "🥯",
    category: "Bagels",
    description: "Boiled and stone-baked chewy sourdough bagel crusted with aromatic toasted white sesame seeds.",
    ingredients: [
      { rawMaterialId: 2, rawMaterialName: "High-Gluten Bread Flour (for Bagels)", amount: 350, unit: "g" },
      { rawMaterialId: 6, rawMaterialName: "Active Dry Yeast", amount: 8, unit: "g" },
      { rawMaterialId: 10, rawMaterialName: "Toasted White Sesame Seeds", amount: 20, unit: "g" },
      { rawMaterialId: 5, rawMaterialName: "Granulated White Sugar", amount: 20, unit: "g" },
      { rawMaterialId: 4, rawMaterialName: "Unsalted Dairy Butter", amount: 30, unit: "g" },
    ],
  },
  {
    label: "Fudge Brownie",
    icon: "🍪",
    category: "Brownies",
    description: "Dense, crackly-top fudge brownies baked with brown butter and melted Belgian chocolate.",
    ingredients: [
      { rawMaterialId: 3, rawMaterialName: "54% Callebaut Dark Belgian Chocolate", amount: 250, unit: "g" },
      { rawMaterialId: 4, rawMaterialName: "Unsalted Dairy Butter", amount: 150, unit: "g" },
      { rawMaterialId: 5, rawMaterialName: "Granulated White Sugar", amount: 180, unit: "g" },
      { rawMaterialId: 1, rawMaterialName: "Refined Wheat Flour (Maida)", amount: 120, unit: "g" },
    ],
  },
  {
    label: "Philadelphia Cheesecake",
    icon: "🍰",
    category: "Cheesecakes & Tarts",
    description: "Silky slow-baked cream cheese on a crushed butter-biscuit crust scented with Madagascar vanilla extract.",
    ingredients: [
      { rawMaterialId: 7, rawMaterialName: "Philadelphia Cream Cheese", amount: 350, unit: "g" },
      { rawMaterialId: 8, rawMaterialName: "Heavy Dairy Whipping Cream", amount: 200, unit: "ml" },
      { rawMaterialId: 5, rawMaterialName: "Granulated White Sugar", amount: 120, unit: "g" },
      { rawMaterialId: 4, rawMaterialName: "Unsalted Dairy Butter", amount: 100, unit: "g" },
      { rawMaterialId: 9, rawMaterialName: "Pure Madagascar Vanilla Extract", amount: 10, unit: "ml" },
    ],
  },
  {
    label: "Classic Vanilla / Tea Cake",
    icon: "🧁",
    category: "Cakes",
    description: "Classic golden buttery tea cake infused with real vanilla and dairy richness, perfect for evening chai.",
    ingredients: [
      { rawMaterialId: 1, rawMaterialName: "Refined Wheat Flour (Maida)", amount: 250, unit: "g" },
      { rawMaterialId: 4, rawMaterialName: "Unsalted Dairy Butter", amount: 160, unit: "g" },
      { rawMaterialId: 5, rawMaterialName: "Granulated White Sugar", amount: 150, unit: "g" },
      { rawMaterialId: 8, rawMaterialName: "Heavy Dairy Whipping Cream", amount: 100, unit: "ml" },
      { rawMaterialId: 9, rawMaterialName: "Pure Madagascar Vanilla Extract", amount: 15, unit: "ml" },
    ],
  },
];

const MENU_CATEGORIES = [
  "Cakes",
  "Bagels",
  "Brownies",
  "Pastries",
  "Cheesecakes & Tarts",
  "Artisanal Breads",
  "Cookies & Macarons",
];

const SUPABASE_CDN = "https://uiftoqlzlarfkfzqnedk.supabase.co/storage/v1/object/public/custom-cakes";

const QUICK_BAKERY_IMAGES = [
  { label: "Belgian Truffle", url: `${SUPABASE_CDN}/cake-1.jpg` },
  { label: "Red Velvet", url: `${SUPABASE_CDN}/cake-2.jpg` },
  { label: "Ferrero Rocher", url: `${SUPABASE_CDN}/cake-3.jpg` },
  { label: "Rasmalai Melts", url: `${SUPABASE_CDN}/cake-4.jpg` },
  { label: "Rosemilk Cake", url: `${SUPABASE_CDN}/cake-5.jpg` },
  { label: "Korean Garlic Bun", url: `${SUPABASE_CDN}/cake-6.jpg` },
  { label: "Pineapple Bliss", url: `${SUPABASE_CDN}/cake-7.jpg` },
  { label: "Choco Lava", url: `${SUPABASE_CDN}/cake-8.jpg` },
  { label: "Fruit Tart", url: `${SUPABASE_CDN}/cake-9.jpg` },
  { label: "Madras Ghee Cake", url: `${SUPABASE_CDN}/cake-10.jpg` },
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
  const [newProductBranch, setNewProductBranch] = useState("all");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newProductIsEggless, setNewProductIsEggless] = useState(true);
  const [rawSelectKey, setRawSelectKey] = useState(0);

  // Post-Creation Success Modal & Copy URL state
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [createdSuccessProduct, setCreatedSuccessProduct] = useState<AdminProductItem | null>(null);
  const [isCreatedSuccessOpen, setIsCreatedSuccessOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<AdminProductItem | null>(null);

  const handleViewProduct = (product: AdminProductItem) => {
    setViewingProduct(product);
  };

  const getProductUrl = (prod: AdminProductItem | { slug?: string; id: string | number; name: string }) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const identifier = prod.slug || String(prod.id);
    return `${origin}/shop?product=${encodeURIComponent(identifier)}`;
  };

  const handleCopyProductUrl = async (prod: AdminProductItem | { slug?: string; id: string | number; name: string }) => {
    const url = getProductUrl(prod);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else if (typeof document !== "undefined") {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopiedProductId(String(prod.id));
      setToastMessage(url);
      setTimeout(() => setCopiedProductId(null), 2500);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

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

  const handleApplyPreset = (preset: (typeof RECIPE_PRESETS)[0]) => {
    setRecipeIngredients([...preset.ingredients]);
    if (!newProductDescription) {
      setNewProductDescription(preset.description);
    }
    if (!newProductName) {
      setNewProductName(preset.label);
    }
    setNewProductCategory(preset.category);
  };

  const handleAddRawPill = (rawId: number) => {
    const raw = localRawMaterials.find((r) => r.id === rawId);
    if (!raw) return;
    if (recipeIngredients.some((i) => i.rawMaterialId === raw.id)) return;
    setRecipeIngredients((prev) => [
      ...prev,
      {
        rawMaterialId: raw.id,
        rawMaterialName: raw.name,
        amount: raw.unit === "kg" ? 200 : raw.unit === "l" ? 150 : 1,
        unit: raw.unit === "kg" ? "g" : raw.unit === "l" ? "ml" : "pcs",
      },
    ]);
  };

  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      if (selectedTab === "all") return matchesSearch;
      if (selectedTab === "veg") return matchesSearch && product.isEggless !== false;
      if (selectedTab === "nonveg") return matchesSearch && product.isEggless === false;
      return matchesSearch && product.status === selectedTab;
    });
  }, [productsList, search, selectedTab]);

  // Image upload states & references
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);
  const [uploadingRowProductId, setUploadingRowProductId] = useState<string | number | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const rowFileInputRef = useRef<HTMLInputElement>(null);
  const [rowTargetProduct, setRowTargetProduct] = useState<AdminProductItem | null>(null);

  // Common helper to upload any image file to /api/upload (Supabase storage)
  const uploadImageFile = async (file: File): Promise<string | null> => {
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          return data.url;
        }
      } else {
        const errData = await res.json().catch(() => null);
        console.error("Upload error:", errData?.error || res.statusText);
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
    }
    return null;
  };

  // Handle local image selection and auto-upload for Add Product modal
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediate local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);

    try {
      setIsUploadingImage(true);
      const uploadedUrl = await uploadImageFile(file);
      if (uploadedUrl) {
        setImagePreview(uploadedUrl);
      }
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  // Handle local image selection and auto-upload for Edit Product modal
  const handleEditImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediate local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setEditImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);

    try {
      setIsUploadingEditImage(true);
      const uploadedUrl = await uploadImageFile(file);
      if (uploadedUrl) {
        setEditImageUrl(uploadedUrl);
      }
    } finally {
      setIsUploadingEditImage(false);
      e.target.value = "";
    }
  };

  // Handle 1-click photo upload directly from products table row
  const handleRowUploadClick = (product: AdminProductItem) => {
    setRowTargetProduct(product);
    rowFileInputRef.current?.click();
  };

  const handleRowFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !rowTargetProduct) return;

    try {
      setUploadingRowProductId(rowTargetProduct.id);
      const uploadedUrl = await uploadImageFile(file);
      if (uploadedUrl) {
        updateInventoryProduct(rowTargetProduct.id, {
          imageUrl: uploadedUrl,
        });
      }
    } finally {
      setUploadingRowProductId(null);
      setRowTargetProduct(null);
      e.target.value = "";
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

    if (!recipeIngredients.some((i) => i.rawMaterialId === raw.id)) {
      setRecipeIngredients((prev) => [
        ...prev,
        {
          rawMaterialId: raw.id,
          rawMaterialName: raw.name,
          amount: raw.unit === "kg" ? 200 : raw.unit === "l" ? 150 : 1,
          unit: raw.unit === "kg" ? "g" : raw.unit === "l" ? "ml" : "pcs",
        },
      ]);
    }
    setRawSelectKey((k) => k + 1);
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
    const created = addInventoryProduct({
      name: newProductName.trim(),
      category: newProductCategory,
      price: parseFloat(newProductPrice) || 0,
      stock: initialStock,
      lowStockThreshold: 5,
      imageUrl: imagePreview,
      description: newProductDescription.trim(),
      isEggless: newProductIsEggless,
      recipe: recipeIngredients,
      availableBranches: newProductBranch,
      branchIds: ["nungambakkam"],
    });

    setIsAddOpen(false);

    // Reset form
    setNewProductName("");
    setNewProductPrice("750");
    setNewProductStock("10");
    setNewProductDescription("");
    setNewProductIsEggless(true);
    setNewProductBranch("all");
    setRecipeIngredients(getDefaultRecipeForProduct(newProductCategory, ""));

    // Open post-creation success modal with prominent Copy Product URL button
    setCreatedSuccessProduct(created);
    setIsCreatedSuccessOpen(true);
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
  const [editBranch, setEditBranch] = useState("all");
  const [editRecipe, setEditRecipe] = useState<RecipeIngredient[]>([]);
  const [editRawSelectKey, setEditRawSelectKey] = useState(0);

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
    setEditBranch(prod.availableBranches || "all");
    setEditRecipe(
      prod.recipe && prod.recipe.length > 0
        ? [...prod.recipe]
        : getDefaultRecipeForProduct(prod.category, prod.name)
    );
    setIsEditOpen(true);
  };

  const handleAddEditIngredient = (rawIdStr: string) => {
    const rawId = parseInt(rawIdStr, 10);
    const raw = localRawMaterials.find((r) => r.id === rawId);
    if (!raw) return;

    if (!editRecipe.some((i) => i.rawMaterialId === raw.id)) {
      setEditRecipe((prev) => [
        ...prev,
        {
          rawMaterialId: raw.id,
          rawMaterialName: raw.name,
          amount: raw.unit === "kg" ? 200 : raw.unit === "l" ? 150 : 1,
          unit: raw.unit === "kg" ? "g" : raw.unit === "l" ? "ml" : "pcs",
        },
      ]);
    }
    setEditRawSelectKey((k) => k + 1);
  };

  const handleUpdateEditIngredientAmount = (index: number, newAmount: number) => {
    setEditRecipe((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, amount: Math.max(1, newAmount) } : item
      )
    );
  };

  const handleUpdateEditIngredientUnit = (
    index: number,
    newUnit: "g" | "kg" | "ml" | "l" | "pcs"
  ) => {
    setEditRecipe((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, unit: newUnit } : item))
    );
  };

  const handleRemoveEditIngredient = (index: number) => {
    setEditRecipe((prev) => prev.filter((_, idx) => idx !== index));
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
      recipe: editRecipe,
      availableBranches: editBranch,
      branchIds: ["nungambakkam"],
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

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export All Products to Excel / CSV */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 border-stone-300 bg-white text-xs font-semibold text-stone-800 shadow-sm hover:bg-stone-50"
              >
                <Download className="h-4 w-4 text-stone-600" />
                Export Products ({productsList.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 text-xs">
              <DropdownMenuLabel>Export All Products</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => exportProducts(productsList, "xlsx")}
                className="cursor-pointer"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
                <span>Export as Excel (.xlsx)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportProducts(productsList, "csv")}
                className="cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4 text-blue-600" />
                <span>Export as CSV (.csv)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bulk upload is the fast path for a whole menu or stock list. */}
          <Link
            href="/admin/bulk-upload?tab=products"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-xs font-semibold text-stone-800 shadow-sm transition-colors hover:bg-stone-50"
          >
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Link>

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

                {/* Bakery Outlet / Location Selection */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
                    <span>Bakery Outlet / Inventory Location</span>
                    <span className="text-[10px] text-amber-800 font-medium">Casablanca Studio</span>
                  </label>
                  <Select
                    value={newProductBranch}
                    onValueChange={setNewProductBranch}
                  >
                    <SelectTrigger className="bg-white text-xs h-9 border-stone-200">
                      <SelectValue placeholder="Select Outlet Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs font-semibold">
                        📍 Kichee's @ Casablanca Studio (Dr. Thirumoorthy Nagar)
                      </SelectItem>
                      <SelectItem value="nungambakkam" className="text-xs">
                        📍 Kichee's @ Casablanca Studio (Dr. Thirumoorthy Nagar)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-stone-400">
                    Determines which outlet will show pickup stock when customers order.
                  </p>
                </div>

                {/* Dietary Preference: Veg vs Non-Veg */}
                <div className="space-y-2 pt-2 border-t border-stone-200/70">
                  <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                    <span>Dietary Classification (Veg / Non-Veg)</span>
                    <span className="text-[10px] text-stone-500 font-normal">
                      Shows the green veg mark on customer menu & bills
                    </span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Vegetarian (100% Eggless) Card */}
                    <button
                      type="button"
                      onClick={() => setNewProductIsEggless(true)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        newProductIsEggless
                          ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/20 shadow-xs"
                          : "border-stone-200 bg-white hover:border-stone-300"
                      }`}
                    >
                      <div className="mt-0.5 inline-flex items-center justify-center w-4 h-4 border-2 border-emerald-600 rounded-[3px] bg-white p-[2px] shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-emerald-950 flex items-center justify-between">
                          <span>Vegetarian (Veg)</span>
                          <span className="text-[9px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded px-1.5 py-0.2">
                            100% Eggless
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-800/80 mt-0.5">
                          Dedicated pure-veg station, no eggs used.
                        </p>
                      </div>
                    </button>

                    {/* Non-Vegetarian (Contains Egg) Card */}
                    <button
                      type="button"
                      onClick={() => setNewProductIsEggless(false)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        !newProductIsEggless
                          ? "border-amber-800 bg-amber-50/80 ring-2 ring-amber-800/20 shadow-xs"
                          : "border-stone-200 bg-white hover:border-stone-300"
                      }`}
                    >
                      <div className="mt-0.5 inline-flex items-center justify-center w-4 h-4 border-2 border-amber-800 rounded-[3px] bg-white p-[2px] shrink-0">
                        <span className="w-2 h-2 rounded-full bg-amber-800"></span>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-amber-950 flex items-center justify-between">
                          <span>Non-Vegetarian</span>
                          <span className="text-[9px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 rounded px-1.5 py-0.2">
                            Contains Egg
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-900/80 mt-0.5">
                          Baked with eggs for classic bakery sponge.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: Image Upload & Preview */}
              <div className="space-y-3 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-amber-800" />
                    Product Photography & Upload
                  </h3>
                  {isUploadingImage ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800">
                      <Loader2 className="h-3 w-3 animate-spin" /> Uploading to Cloud...
                    </span>
                  ) : (
                    <span className="text-[11px] text-stone-400">Upload file or pick preset</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative h-24 w-24 rounded-xl overflow-hidden border-2 border-stone-200 bg-white shadow-xs shrink-0">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="h-8 text-xs gap-1.5 bg-amber-900 text-white hover:bg-amber-950 hover:text-white border-amber-900 font-semibold"
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-3.5 w-3.5" />
                            Upload Photo
                          </>
                        )}
                      </Button>
                      <span className="text-[11px] text-stone-400">or enter image URL</span>
                    </div>

                    <Input
                      value={imagePreview}
                      onChange={(e) => setImagePreview(e.target.value)}
                      placeholder="/images/hero-truffle.jpg or https://..."
                      className="bg-white text-xs h-8 text-stone-900 border-stone-300"
                    />

                    <p className="text-[10px] text-stone-500">
                      Uploads directly to cloud storage. Supports PNG, JPG, WebP up to 5MB.
                    </p>
                  </div>
                </div>

                {/* Quick Picker Thumbnails for Add Product */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-stone-500 font-medium">Quick Bakery Photos:</span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {QUICK_BAKERY_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImagePreview(img.url)}
                        className={`group relative aspect-square rounded-lg overflow-hidden border transition-all ${
                          imagePreview === img.url
                            ? "border-amber-800 ring-2 ring-amber-800/20"
                            : "border-stone-200 hover:border-amber-600"
                        }`}
                        title={img.label}
                      >
                        <Image
                          src={img.url}
                          alt={img.label}
                          fill
                          sizes="64px"
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[9px] text-white truncate text-center">
                          {img.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Recipe Story & Chef Preparation Instructions */}
              <div className="space-y-3 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-amber-800" />
                    Recipe Story & Chef Preparation Notes
                  </h3>
                  <span className="text-[11px] text-stone-400">Customer menu & chef instructions</span>
                </div>

                <div className="space-y-1.5">
                  <textarea
                    rows={3}
                    value={newProductDescription}
                    onChange={(e) => setNewProductDescription(e.target.value)}
                    placeholder="Artisanal recipe details: Single-origin Belgian chocolate percentage, butter aeration, oven temperature, crumb texture, and signature garnish..."
                    className="w-full text-xs rounded-md border border-stone-300 bg-white p-2.5 text-stone-900 placeholder:text-stone-500 font-sans outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800/20 shadow-2xs resize-y"
                  />
                  <p className="text-[10px] text-stone-500">
                    Document the baking technique, temperatures, and key flavor nuances for the kitchen team and customer discovery.
                  </p>
                </div>
              </div>

              {/* Section 4: Raw Material Inventory & Recipe (Bill of Materials) */}
              <div className="space-y-4 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                        <Scale className="h-3.5 w-3.5 text-amber-800" />
                        Raw Materials Recipe (Bill of Materials)
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Exact quantities of raw ingredients deducted from inventory to bake 1 unit.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Add existing raw material */}
                      <Select
                        key={rawSelectKey}
                        onValueChange={(val) => handleAddExistingIngredient(val)}
                      >
                        <SelectTrigger className="h-7 text-[11px] bg-white border-stone-300 text-stone-900 w-48 shadow-2xs">
                          <SelectValue placeholder="+ Add Raw Material" />
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
                        className="h-7 text-[11px] px-2 bg-white border-stone-300 text-stone-800"
                      >
                        + New Ingredient
                      </Button>
                    </div>
                  </div>

                  {/* Quick Recipe Presets */}
                  <div className="pt-2 border-t border-stone-200/60">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="w-3 h-3 text-amber-700" />
                      <span className="text-[11px] font-semibold text-stone-600">Quick Recipe Presets (1-Click Load):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {RECIPE_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 transition-colors shadow-2xs cursor-pointer"
                        >
                          <span>{preset.icon}</span>
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fast Ingredient Add Pills */}
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    <span className="text-[10px] text-stone-400 font-medium mr-1">Fast Add:</span>
                    {localRawMaterials.slice(0, 7).map((mat) => (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => handleAddRawPill(mat.id)}
                        disabled={recipeIngredients.some((i) => i.rawMaterialId === mat.id)}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                          recipeIngredients.some((i) => i.rawMaterialId === mat.id)
                            ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                            : "bg-white text-stone-700 border-stone-300 hover:border-amber-700 hover:text-amber-900 cursor-pointer shadow-2xs"
                        }`}
                      >
                        + {mat.name.split("(")[0].trim().split(" ").slice(0, 2).join(" ")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inline New Byproduct Form */}
                {showAddCustomRaw && (
                  <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 space-y-2">
                    <p className="text-xs font-semibold text-amber-900">
                      Add Custom Byproduct / Ingredient to Inventory
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input
                        placeholder="Ingredient name (e.g. Yeast)"
                        value={customRawName}
                        onChange={(e) => setCustomRawName(e.target.value)}
                        className="h-8 text-xs bg-white border-stone-300 text-stone-900"
                      />
                      <Input
                        type="number"
                        placeholder="Volume / Weight"
                        value={customRawAmount}
                        onChange={(e) => setCustomRawAmount(e.target.value)}
                        className="h-8 text-xs bg-white border-stone-300 text-stone-900"
                      />
                      <div className="flex gap-2">
                        <Select
                          value={customRawUnit}
                          onValueChange={(v) =>
                            setCustomRawUnit(v as "g" | "kg" | "ml" | "l")
                          }
                        >
                          <SelectTrigger className="h-8 text-xs bg-white border-stone-300 text-stone-900">
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
                          className="h-8 text-xs bg-amber-900 text-white hover:bg-amber-950 font-semibold"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Recipe Items List */}
                <div className="space-y-2">
                  {recipeIngredients.length === 0 ? (
                    <div className="p-4 rounded-lg border border-dashed border-stone-300 text-center bg-white/60">
                      <p className="text-xs text-stone-500 font-medium">No ingredients added to this recipe yet.</p>
                      <p className="text-[11px] text-stone-400">Click a preset recipe above or select ingredients from the dropdown.</p>
                    </div>
                  ) : (
                    recipeIngredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200 bg-white gap-3 shadow-2xs"
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
                              className="h-7 text-xs text-right pr-2 bg-white border-stone-300 text-stone-900"
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
                            <SelectTrigger className="h-7 w-20 text-xs bg-white border-stone-300 text-stone-900">
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
                    ))
                  )}
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
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-stone-100 flex-wrap h-auto p-1">
            <TabsTrigger value="all" className="text-xs">
              All ({productsList.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              Active ({productsList.filter((p) => p.status === "active").length})
            </TabsTrigger>
            <TabsTrigger value="veg" className="text-xs text-emerald-800 data-[state=active]:text-emerald-950 data-[state=active]:bg-emerald-50">
              🟢 Veg ({productsList.filter((p) => p.isEggless !== false).length})
            </TabsTrigger>
            <TabsTrigger value="nonveg" className="text-xs text-amber-900 data-[state=active]:text-amber-950 data-[state=active]:bg-amber-50">
              🟤 Non-Veg ({productsList.filter((p) => p.isEggless === false).length})
            </TabsTrigger>
            <TabsTrigger value="inactive" className="text-xs">
              Draft ({productsList.filter((p) => p.status === "inactive").length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="text-xs">
              Archived ({productsList.filter((p) => p.status === "archived").length})
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

      {/* Products Table with Quick Photo Upload */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-xs overflow-hidden">
        {/* Hidden Row File Input for 1-Click Photo Upload */}
        <input
          type="file"
          ref={rowFileInputRef}
          onChange={handleRowFileChange}
          accept="image/*"
          className="hidden"
        />

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
                  {/* Thumbnail with Click to View & Photo Upload */}
                  <TableCell>
                    <div className="relative group/thumb flex items-center">
                      <div
                        className="group relative h-11 w-11 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer shadow-2xs hover:ring-2 hover:ring-amber-800/40 transition-all"
                        onClick={() => handleViewProduct(product)}
                        title="Click to view product details"
                      >
                        <Image
                          src={product.imageUrl || "/images/hero-truffle.jpg"}
                          alt={product.name}
                          fill
                          sizes="44px"
                          className="object-cover group-hover/thumb:scale-105 transition-transform"
                        />
                        {uploadingRowProductId === product.id ? (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 text-white animate-spin" />
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="h-4 w-4 text-white drop-shadow" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowUploadClick(product);
                        }}
                        title="Upload new photo"
                        className="absolute -bottom-1 -right-1 z-10 w-5 h-5 rounded-full bg-stone-900/90 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:bg-amber-900 shadow-xs"
                      >
                        <Camera className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </TableCell>

                  {/* Name and SKU - Click to View */}
                  <TableCell
                    className="cursor-pointer group/cell"
                    onClick={() => handleViewProduct(product)}
                    title="Click to view product details"
                  >
                    <div className="font-semibold text-stone-900 text-xs flex items-center gap-1.5 group-hover/cell:text-amber-900 transition-colors">
                      {product.isEggless !== false ? (
                        <span
                          className="inline-flex items-center justify-center w-3.5 h-3.5 border border-emerald-600 rounded-[2px] bg-white p-[1px] shrink-0"
                          title="Vegetarian (100% Eggless)"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center justify-center w-3.5 h-3.5 border border-amber-800 rounded-[2px] bg-white p-[1px] shrink-0"
                          title="Non-Vegetarian (Contains Egg)"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-800"></span>
                        </span>
                      )}
                      <span className="group-hover/cell:underline decoration-amber-800/40 underline-offset-2">{product.name}</span>
                    </div>
                    <div className="text-[10px] font-mono text-stone-400 pl-5">
                      {product.sku}
                    </div>
                    <div className="text-[10px] text-amber-800 font-medium flex items-center gap-1 mt-0.5 pl-5">
                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                      <span>
                        Casablanca Studio
                      </span>
                    </div>
                  </TableCell>

                  {/* Menu Category & Dietary Tag */}
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <Badge variant="outline" className="text-[10px] bg-stone-50">
                        {product.category}
                      </Badge>
                      {product.isEggless !== false ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Veg
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-800"></span>
                          Non-Veg
                        </span>
                      )}
                    </div>
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

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Direct View Product Details Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewProduct(product)}
                        title="View Product Details"
                        className="h-8 w-8 text-stone-600 hover:text-amber-900 hover:bg-amber-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="sr-only">View Product</span>
                      </Button>

                      {/* Quick Copy Product URL Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyProductUrl(product)}
                        title="Copy Product URL"
                        className="h-8 w-8 text-stone-500 hover:text-amber-900 hover:bg-amber-50"
                      >
                        {copiedProductId === product.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        <span className="sr-only">Copy Product URL</span>
                      </Button>

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
                        <DropdownMenuContent align="end" className="w-52 text-xs">
                          <DropdownMenuLabel>Product Controls</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewProduct(product)}
                            className="cursor-pointer font-medium text-amber-900 focus:bg-amber-50"
                          >
                            <Eye className="mr-2 h-3.5 w-3.5 text-amber-800" />
                            <span>View Product Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleCopyProductUrl(product)}
                            className="cursor-pointer"
                          >
                            {copiedProductId === product.id ? (
                              <>
                                <Check className="mr-2 h-3.5 w-3.5 text-emerald-600" />
                                <span className="text-emerald-700 font-semibold">URL Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="mr-2 h-3.5 w-3.5 text-stone-600" />
                                <span>Copy Product URL</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.open(getProductUrl(product), "_blank")}
                            className="cursor-pointer"
                          >
                            <ExternalLink className="mr-2 h-3.5 w-3.5 text-stone-500" />
                            View on Website
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleOpenEditProduct(product)}
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-3.5 w-3.5 text-stone-600" />
                            Edit Details & Price
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRowUploadClick(product)}
                            className="cursor-pointer"
                          >
                            <Camera className="mr-2 h-3.5 w-3.5 text-stone-600" />
                            Upload New Photo
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

      {/* Product Quick View Modal */}
      <Dialog open={Boolean(viewingProduct)} onOpenChange={(open) => !open && setViewingProduct(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 overflow-hidden rounded-2xl border-stone-200">
          {viewingProduct && (
            <div>
              {/* Header Banner */}
              <div className="relative bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 pr-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {viewingProduct.isEggless !== false ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-full px-2.5 py-0.5 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          100% Eggless (Pure Veg)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 rounded-full px-2.5 py-0.5 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          Contains Egg (Non-Veg)
                        </span>
                      )}

                      <span className="text-[10px] font-medium bg-white/10 text-stone-200 border border-white/10 rounded-full px-2.5 py-0.5">
                        {viewingProduct.category}
                      </span>

                      {viewingProduct.status === "active" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full px-2 py-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-stone-500/20 text-stone-300 border border-stone-500/30 rounded-full px-2 py-0.5">
                          <EyeOff className="w-3 h-3" /> Hidden
                        </span>
                      )}

                      {viewingProduct.bestSeller && (
                        <span className="text-[10px] font-bold bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-full px-2 py-0.5">
                          ★ Best Seller
                        </span>
                      )}

                      {viewingProduct.featured && (
                        <span className="text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-500/40 rounded-full px-2 py-0.5">
                          Featured
                        </span>
                      )}
                    </div>

                    <DialogTitle className="text-xl font-bold tracking-tight text-white mt-2">
                      {viewingProduct.name}
                    </DialogTitle>
                    <p className="text-xs text-stone-300 font-mono flex items-center gap-2">
                      <span>SKU: {viewingProduct.sku}</span>
                      <span>•</span>
                      <span className="text-amber-300 flex items-center gap-1 font-sans">
                        <MapPin className="w-3 h-3" /> Casablanca Studio (Dr. Thirumoorthy Nagar)
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column: Image & Photo Controls */}
                  <div className="md:col-span-5 space-y-3">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-xs">
                      <Image
                        src={viewingProduct.imageUrl || "/images/hero-truffle.jpg"}
                        alt={viewingProduct.name}
                        fill
                        sizes="320px"
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const target = viewingProduct;
                        setViewingProduct(null);
                        handleRowUploadClick(target);
                      }}
                      className="w-full text-xs h-8 gap-1.5 text-stone-700 hover:text-amber-900 border-stone-200"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Upload New Photo
                    </Button>
                  </div>

                  {/* Right Column: Pricing, Inventory & Details */}
                  <div className="md:col-span-7 space-y-4">
                    {/* Price & Stock Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl border border-stone-100 bg-stone-50/80">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                          Selling Price
                        </span>
                        <div className="text-xl font-extrabold text-stone-900 mt-0.5">
                          ₹{viewingProduct.price.toLocaleString("en-IN")}
                        </div>
                        {viewingProduct.salePrice && viewingProduct.salePrice < viewingProduct.price ? (
                          <div className="text-[11px] text-stone-400 line-through">
                            MRP ₹{viewingProduct.salePrice.toLocaleString("en-IN")}
                          </div>
                        ) : null}
                      </div>

                      <div className="p-3.5 rounded-xl border border-stone-100 bg-stone-50/80">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                          Current Stock
                        </span>
                        <div
                          className={`text-xl font-extrabold mt-0.5 ${
                            viewingProduct.stock === 0
                              ? "text-red-600"
                              : viewingProduct.stock <= (viewingProduct.lowStockThreshold || 5)
                              ? "text-amber-700"
                              : "text-emerald-700"
                          }`}
                        >
                          {viewingProduct.stock} units
                        </div>
                        <div className="text-[10px] text-stone-400">
                          Low alert at {viewingProduct.lowStockThreshold || 5} units
                        </div>
                      </div>
                    </div>

                    {/* Description / Story */}
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                        Description & Story
                      </h4>
                      <p className="text-xs text-stone-700 leading-relaxed bg-stone-50/50 p-3 rounded-xl border border-stone-100">
                        {viewingProduct.description || "Freshly baked handcrafted item made with premium ingredients."}
                      </p>
                    </div>

                    {/* Outlet Availability */}
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                        Kitchen & Outlet Location
                      </h4>
                      <div className="text-xs text-stone-800 bg-stone-50/50 p-2.5 rounded-xl border border-stone-100 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                        <span>Kichee's @ Casablanca Studio, Dr. Thirumoorthy Nagar, Nungambakkam</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recipe / Bill of Materials (if any) */}
                {viewingProduct.recipe && viewingProduct.recipe.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-amber-800" />
                      Recipe / Bill of Materials (Per 1 Unit Baked)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {viewingProduct.recipe.map((ing, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg border border-stone-100 bg-stone-50 text-xs"
                        >
                          <span className="font-medium text-stone-800 truncate mr-2">
                            {ing.rawMaterialName}
                          </span>
                          <span className="font-mono text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200 shrink-0">
                            {ing.amount} {ing.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getProductUrl(viewingProduct), "_blank")}
                    className="h-8 text-xs gap-1.5 bg-white text-stone-700 hover:text-amber-900 border-stone-300 font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Storefront
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyProductUrl(viewingProduct)}
                    className="h-8 text-xs gap-1.5 bg-white text-stone-700 hover:text-amber-900 border-stone-300 font-medium"
                  >
                    {copiedProductId === String(viewingProduct.id) ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const target = viewingProduct;
                      setViewingProduct(null);
                      handleOpenEditProduct(target);
                    }}
                    className="h-8 text-xs gap-1.5 bg-amber-900 hover:bg-amber-950 text-white font-semibold shadow-xs"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Product
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewingProduct(null)}
                    className="h-8 text-xs text-stone-500 hover:text-stone-900"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
            <div>
              <DialogTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-amber-800" />
                <span>Edit Product & Storefront Visibility</span>
              </DialogTitle>
              <DialogDescription>
                Modify pricing, description, stock levels, and control whether this product is shown on the live website.
              </DialogDescription>
            </div>
            {editingProduct && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyProductUrl(editingProduct)}
                  className="h-8 text-xs gap-1.5 bg-stone-50 hover:bg-stone-100"
                >
                  {copiedProductId === editingProduct.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-stone-600" />
                      <span>Copy URL</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(getProductUrl(editingProduct), "_blank")}
                  className="h-8 text-xs gap-1 text-stone-600 hover:text-stone-900"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </Button>
              </div>
            )}
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

                {/* Bakery Outlet / Location Selection for Edit */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
                    <span>Bakery Outlet / Inventory Location</span>
                    <span className="text-[10px] text-amber-800 font-medium">Casablanca Studio</span>
                  </label>
                  <Select value={editBranch} onValueChange={setEditBranch}>
                    <SelectTrigger className="bg-white text-xs h-9 border-stone-200">
                      <SelectValue placeholder="Select Outlet Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs font-semibold">
                        📍 Kichee's @ Casablanca Studio (Dr. Thirumoorthy Nagar)
                      </SelectItem>
                      <SelectItem value="nungambakkam" className="text-xs">
                        📍 Kichee's @ Casablanca Studio (Dr. Thirumoorthy Nagar)
                      </SelectItem>
                    </SelectContent>
                  </Select>
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

                  </div>
                </div>

                {/* Dietary Preference: Veg vs Non-Veg */}
                <div className="space-y-2 pt-2 border-t border-stone-200/70">
                  <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                    <span>Dietary Classification (Veg / Non-Veg)</span>
                    <span className="text-[10px] text-stone-500 font-normal">
                      Shows the green veg mark on customer menu & bills
                    </span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Vegetarian (100% Eggless) Card */}
                    <button
                      type="button"
                      onClick={() => setEditIsEggless(true)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        editIsEggless
                          ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/20 shadow-xs"
                          : "border-stone-200 bg-white hover:border-stone-300"
                      }`}
                    >
                      <div className="mt-0.5 inline-flex items-center justify-center w-4 h-4 border-2 border-emerald-600 rounded-[3px] bg-white p-[2px] shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-emerald-950 flex items-center justify-between">
                          <span>Vegetarian (Veg)</span>
                          <span className="text-[9px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded px-1.5 py-0.2">
                            100% Eggless
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-800/80 mt-0.5">
                          Dedicated pure-veg station, no eggs used.
                        </p>
                      </div>
                    </button>

                    {/* Non-Vegetarian (Contains Egg) Card */}
                    <button
                      type="button"
                      onClick={() => setEditIsEggless(false)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        !editIsEggless
                          ? "border-amber-800 bg-amber-50/80 ring-2 ring-amber-800/20 shadow-xs"
                          : "border-stone-200 bg-white hover:border-stone-300"
                      }`}
                    >
                      <div className="mt-0.5 inline-flex items-center justify-center w-4 h-4 border-2 border-amber-800 rounded-[3px] bg-white p-[2px] shrink-0">
                        <span className="w-2 h-2 rounded-full bg-amber-800"></span>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-amber-950 flex items-center justify-between">
                          <span>Non-Vegetarian</span>
                          <span className="text-[9px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 rounded px-1.5 py-0.2">
                            Contains Egg
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-900/80 mt-0.5">
                          Baked with eggs for classic bakery sponge.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Selection with Upload & Quick Gallery */}
              <div className="space-y-3 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-amber-800" />
                    Product Photography & Upload
                  </h4>
                  {isUploadingEditImage ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800">
                      <Loader2 className="h-3 w-3 animate-spin" /> Uploading to Cloud...
                    </span>
                  ) : (
                    <span className="text-[11px] text-stone-400">Upload new photo or pick preset</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative h-20 w-20 rounded-xl border-2 border-stone-200 overflow-hidden shrink-0 bg-stone-100 shadow-xs">
                    <Image
                      src={editImageUrl || "/images/hero-truffle.jpg"}
                      alt={editName || "Product"}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                    {isUploadingEditImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full text-center sm:text-left">
                    <input
                      type="file"
                      ref={editFileInputRef}
                      onChange={handleEditImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploadingEditImage}
                        onClick={() => editFileInputRef.current?.click()}
                        className="h-8 text-xs gap-1.5 bg-amber-900 text-white hover:bg-amber-950 hover:text-white border-amber-900 font-semibold"
                      >
                        {isUploadingEditImage ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-3.5 w-3.5" />
                            Upload New Photo
                          </>
                        )}
                      </Button>
                      <span className="text-[11px] text-stone-400">or enter image URL</span>
                    </div>

                    <Input
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="/images/hero-truffle.jpg or https://..."
                      className="bg-white text-xs h-8 text-stone-900 border-stone-300"
                    />
                    <p className="text-[10px] text-stone-500">
                      Uploads directly to cloud storage. Supports PNG, JPG, WebP up to 5MB.
                    </p>
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

              {/* Description & Recipe Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-amber-800" />
                    Recipe Story & Product Description
                  </span>
                  <span className="text-[11px] text-stone-400">Storefront & kitchen ticket</span>
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  placeholder="Artisanal recipe details, Belgian chocolate percentage, flavor notes, oven temperature..."
                  className="w-full text-xs rounded-md border border-stone-300 bg-white p-2.5 text-stone-900 placeholder:text-stone-500 font-sans outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800/20 shadow-2xs resize-y"
                />
              </div>

              {/* Section: Raw Material Inventory & Recipe (Bill of Materials) */}
              <div className="space-y-3 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                      <Scale className="h-3.5 w-3.5 text-amber-800" />
                      Recipe Ingredients (Bill of Materials)
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Raw materials deducted per 1 unit baked.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      key={editRawSelectKey}
                      onValueChange={(val) => handleAddEditIngredient(val)}
                    >
                      <SelectTrigger className="h-7 text-[11px] bg-white border-stone-300 text-stone-900 w-44 shadow-2xs">
                        <SelectValue placeholder="+ Add Ingredient" />
                      </SelectTrigger>
                      <SelectContent>
                        {localRawMaterials.map((r) => (
                          <SelectItem key={r.id} value={r.id.toString()} className="text-xs">
                            {r.name} ({r.stock} {r.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Selected Edit Recipe Items List */}
                <div className="space-y-2">
                  {editRecipe.length === 0 ? (
                    <div className="p-3 rounded-lg border border-dashed border-stone-300 text-center bg-white/60">
                      <p className="text-xs text-stone-500">No raw materials linked to this product.</p>
                      <p className="text-[10px] text-stone-400">Select an ingredient from the dropdown above.</p>
                    </div>
                  ) : (
                    editRecipe.map((ing, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg border border-stone-200 bg-white gap-2 shadow-2xs"
                      >
                        <span className="text-xs font-semibold text-stone-900 flex-1 truncate">
                          {ing.rawMaterialName}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="w-20">
                            <Input
                              type="number"
                              min="1"
                              value={ing.amount}
                              onChange={(e) =>
                                handleUpdateEditIngredientAmount(
                                  idx,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="h-7 text-xs text-right pr-2 bg-white border-stone-300 text-stone-900"
                            />
                          </div>

                          <Select
                            value={ing.unit}
                            onValueChange={(val) =>
                              handleUpdateEditIngredientUnit(
                                idx,
                                val as "g" | "kg" | "ml" | "l" | "pcs"
                              )
                            }
                          >
                            <SelectTrigger className="h-7 w-16 text-xs bg-white border-stone-300 text-stone-900 px-1.5">
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
                            onClick={() => handleRemoveEditIngredient(idx)}
                            className="h-7 w-7 text-stone-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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

      {/* Product Created Success Dialog with Direct Copy URL Action */}
      <Dialog open={isCreatedSuccessOpen} onOpenChange={setIsCreatedSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-2">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-stone-900">
              Product Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-center text-stone-600 text-xs">
              Your new product is live in the inventory and on the public storefront. You can now copy and share its direct product URL.
            </DialogDescription>
          </DialogHeader>

          {createdSuccessProduct && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50">
                <img
                  src={createdSuccessProduct.imageUrl || "/images/hero-truffle.jpg"}
                  alt={createdSuccessProduct.name}
                  className="w-14 h-14 rounded-lg object-cover border border-stone-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate">
                    {createdSuccessProduct.name}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {createdSuccessProduct.category} • ₹{createdSuccessProduct.price} • {createdSuccessProduct.stock} units
                  </p>
                  <Badge variant="outline" className="mt-1 text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                    Live on Website
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                  Storefront Product URL
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={getProductUrl(createdSuccessProduct)}
                    className="text-xs bg-stone-50 font-mono text-stone-700 select-all"
                  />
                  <Button
                    type="button"
                    onClick={() => handleCopyProductUrl(createdSuccessProduct)}
                    className="shrink-0 gap-1.5 bg-amber-900 hover:bg-amber-950 text-white font-medium text-xs px-3"
                  >
                    {copiedProductId === createdSuccessProduct.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-row items-center justify-between sm:justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (createdSuccessProduct) {
                  window.open(getProductUrl(createdSuccessProduct), "_blank");
                }
              }}
              className="text-xs gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
              Open Storefront
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsCreatedSuccessOpen(false)}
              className="text-xs bg-stone-900 hover:bg-stone-800 text-white"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Instant Floating Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-stone-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-white">Product URL Copied to Clipboard!</p>
            <p className="text-stone-300 font-mono text-[11px] truncate max-w-xs">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

