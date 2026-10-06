"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ClipboardList,
  Plus,
  Mail,
  Printer,
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  Search,
  AlertCircle,
  Eye,
  Trash2,
  ExternalLink,
  Phone,
  FileCheck,
  PackagePlus,
  Send,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { toast } from "sonner";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import {
  PurchaseOrder,
  PurchaseOrderItem,
  Supplier,
  POStatus,
  getPurchaseOrders,
  getSuppliers,
  addSupplier,
  createPurchaseOrder,
  updatePOStatus,
  generatePOHtml,
  subscribePurchaseOrders,
} from "@/lib/purchase-orders/po-store";
import { localRawMaterials } from "@/lib/db/admin-data";

function WhatsAppIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function AdminPurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // Email sending state
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailCustomNote, setEmailCustomNote] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // WhatsApp sending state (Evolution API)
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsappRecipientPhone, setWhatsappRecipientPhone] = useState("");
  const [whatsappCustomNote, setWhatsappCustomNote] = useState("");
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  // New PO Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [expectedDate, setExpectedDate] = useState<string>("");
  const [deliveryLocation, setDeliveryLocation] = useState(
    `${BUSINESS_CONFIG.billingName} Central Kitchen, 18/4 Wheatcrofts Rd, Nungambakkam, Chennai - 600034`
  );
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [poNotes, setPoNotes] = useState("");
  const [shippingFee, setShippingFee] = useState<number>(0);

  // Line items state for new PO
  const [poItems, setPoItems] = useState<
    Array<{
      name: string;
      sku?: string;
      rawMaterialId?: number;
      quantity: number;
      unit: "kg" | "l" | "pcs" | "boxes" | "bags";
      unitPrice: number;
      taxPercent: number;
    }>
  >([
    {
      name: "54% Callebaut Dark Belgian Chocolate",
      sku: "RAW-CHOC-01",
      rawMaterialId: 3,
      quantity: 15,
      unit: "kg",
      unitPrice: 850,
      taxPercent: 5,
    },
  ]);

  // New Supplier Form State
  const [newSupName, setNewSupName] = useState("");
  const [newSupContact, setNewSupContact] = useState("");
  const [newSupEmail, setNewSupEmail] = useState("");
  const [newSupPhone, setNewSupPhone] = useState("");
  const [newSupGstin, setNewSupGstin] = useState("");
  const [newSupAddress, setNewSupAddress] = useState("");
  const [newSupCategory, setNewSupCategory] = useState("Raw Materials & Ingredients");
  const [newSupTerms, setNewSupTerms] = useState("Net 30 Days");

  useEffect(() => {
    setPurchaseOrders(getPurchaseOrders());
    setSuppliers(getSuppliers());
    return subscribePurchaseOrders(() => {
      setPurchaseOrders(getPurchaseOrders());
      setSuppliers(getSuppliers());
    });
  }, []);

  // Filtered POs
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchesTab = activeTab === "all" || po.status === activeTab;
      const matchesSearch =
        !searchQuery ||
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTab && matchesSearch;
    });
  }, [purchaseOrders, activeTab, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalValue = purchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0);
    const activeCount = purchaseOrders.filter(
      (po) => po.status === "SENT_TO_SUPPLIER" || po.status === "PARTIALLY_RECEIVED"
    ).length;
    const receivedCount = purchaseOrders.filter((po) => po.status === "RECEIVED").length;
    const draftCount = purchaseOrders.filter((po) => po.status === "DRAFT").length;

    return { totalValue, activeCount, receivedCount, draftCount };
  }, [purchaseOrders]);

  // Calculations for New PO
  const subtotal = useMemo(() => {
    return poItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [poItems]);

  const taxTotal = useMemo(() => {
    return poItems.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice * (item.taxPercent || 0)) / 100,
      0
    );
  }, [poItems]);

  const grandTotal = subtotal + taxTotal + Number(shippingFee || 0);

  // Add line item
  const handleAddLineItem = () => {
    setPoItems([
      ...poItems,
      {
        name: "",
        quantity: 1,
        unit: "kg",
        unitPrice: 0,
        taxPercent: 5,
      },
    ]);
  };

  // Remove line item
  const handleRemoveLineItem = (index: number) => {
    if (poItems.length <= 1) {
      toast.error("A purchase order must have at least one line item.");
      return;
    }
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  // Select item from raw materials catalog
  const handleSelectRawMaterial = (index: number, rawIdStr: string) => {
    const rawId = Number(rawIdStr);
    const mat = localRawMaterials.find((m) => m.id === rawId);
    if (!mat) return;

    const updated = [...poItems];
    updated[index] = {
      ...updated[index],
      name: mat.name,
      sku: mat.sku,
      rawMaterialId: mat.id,
      unit: mat.unit,
      unitPrice: mat.costPerUnit || 100,
    };
    setPoItems(updated);
  };

  // Handle Create PO Submission
  const handleCreatePO = (status: POStatus = "DRAFT") => {
    if (!selectedSupplierId) {
      toast.error("Please select a supplier");
      return;
    }

    const sup = suppliers.find((s) => s.id === selectedSupplierId);
    if (!sup) {
      toast.error("Supplier not found");
      return;
    }

    if (poItems.some((it) => !it.name.trim() || it.quantity <= 0)) {
      toast.error("Please fill in valid item names and quantities");
      return;
    }

    const mappedItems: PurchaseOrderItem[] = poItems.map((it, idx) => ({
      id: `poi-${Date.now()}-${idx}`,
      name: it.name.trim(),
      sku: it.sku,
      rawMaterialId: it.rawMaterialId,
      quantity: Number(it.quantity),
      unit: it.unit,
      unitPrice: Number(it.unitPrice),
      taxPercent: Number(it.taxPercent || 0),
      totalPrice: Number(
        (it.quantity * it.unitPrice * (1 + (it.taxPercent || 0) / 100)).toFixed(2)
      ),
    }));

    const newPO = createPurchaseOrder({
      supplierId: sup.id,
      supplier: sup,
      date: new Date().toISOString().split("T")[0],
      expectedDeliveryDate: expectedDate || "Within 3 business days",
      deliveryLocation,
      paymentTerms: paymentTerms || sup.paymentTerms,
      items: mappedItems,
      subtotal,
      taxTotal,
      shippingFee: Number(shippingFee || 0),
      grandTotal,
      status,
      notes: poNotes.trim() || undefined,
    });

    toast.success(`Purchase order ${newPO.poNumber} created successfully!`);
    setIsCreateModalOpen(false);

    // If status is SENT, open email dialog immediately
    if (status === "SENT_TO_SUPPLIER") {
      handleOpenEmailModal(newPO);
    }
  };

  // Handle Mark as Received (Updates Inventory Stock!)
  const handleMarkAsReceived = (po: PurchaseOrder) => {
    if (confirm(`Mark PO ${po.poNumber} as RECEIVED?\n\nThis will automatically increment stock quantities in your Raw Materials Inventory for all items.`)) {
      updatePOStatus(po.id, "RECEIVED");
      toast.success(`PO ${po.poNumber} marked as RECEIVED. Inventory stock successfully updated!`);
    }
  };

  // Handle Print PO Document
  const handlePrintPO = (po: PurchaseOrder) => {
    const html = generatePOHtml(po);
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(html);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }, 400);
  };

  // Open Email Dialog
  const handleOpenEmailModal = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setEmailRecipient(po.supplier.email || "");
    setEmailCustomNote(
      `Please find attached our official Purchase Order ${po.poNumber} for ${BUSINESS_CONFIG.billingName}. Kindly confirm dispatch schedule.`
    );
    setIsEmailModalOpen(true);
  };

  // Open WhatsApp Dialog (Evolution API)
  const handleOpenWhatsAppModal = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setWhatsappRecipientPhone(po.supplier.phone || "");
    setWhatsappCustomNote(
      `Please find our official Purchase Order ${po.poNumber} from ${BUSINESS_CONFIG.billingName}. Kindly confirm order acceptance and dispatch schedule.`
    );
    setIsWhatsAppModalOpen(true);
  };

  // Send PO via Evolution API WhatsApp
  const handleSendPOWhatsApp = async () => {
    if (!selectedPO || !whatsappRecipientPhone.trim()) {
      toast.error("Please enter a valid recipient WhatsApp phone number");
      return;
    }

    setIsSendingWhatsApp(true);
    const toastId = toast.loading(`Dispatching PO ${selectedPO.poNumber} via Evolution API...`);

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "purchase_order",
          phone: whatsappRecipientPhone,
          payload: {
            poNumber: selectedPO.poNumber,
            date: selectedPO.date,
            expectedDate: selectedPO.expectedDeliveryDate,
            supplier: selectedPO.supplier,
            deliveryLocation: selectedPO.deliveryLocation,
            paymentTerms: selectedPO.paymentTerms,
            items: selectedPO.items,
            subtotal: selectedPO.subtotal,
            taxTotal: selectedPO.taxTotal,
            shippingFee: selectedPO.shippingFee,
            grandTotal: selectedPO.grandTotal,
            notes: whatsappCustomNote || selectedPO.notes,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.dismiss(toastId);
        toast.success(`Purchase Order ${selectedPO.poNumber} sent to ${whatsappRecipientPhone} via WhatsApp!`);
        updatePOStatus(selectedPO.id, "SENT_TO_SUPPLIER", {
          sentAt: new Date().toISOString(),
        });
        setIsWhatsAppModalOpen(false);
      } else {
        toast.dismiss(toastId);
        toast.error(data.error || "Evolution WhatsApp dispatch failed. You can use Open Web Chat fallback.");
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "WhatsApp dispatch failed");
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  // WhatsApp Web Fallback
  const handleOpenPOWhatsAppWeb = () => {
    if (!selectedPO || !whatsappRecipientPhone.trim()) return;
    const clean = whatsappRecipientPhone.replace(/[^0-9]/g, "");
    const fullNumber = clean.startsWith("91") ? clean : `91${clean}`;
    const text = encodeURIComponent(
      `*PURCHASE ORDER: ${selectedPO.poNumber}*\n` +
      `From: ${BUSINESS_CONFIG.billingName}\n` +
      `Supplier: ${selectedPO.supplier.name}\n` +
      `Total: ₹${selectedPO.grandTotal.toLocaleString("en-IN")}\n` +
      `Delivery Date: ${selectedPO.expectedDeliveryDate}\n\n` +
      `${whatsappCustomNote || "Kindly confirm dispatch schedule."}`
    );
    window.open(`https://wa.me/${fullNumber}?text=${text}`, "_blank");
  };

  // Send Email via Hostinger SMTP
  const handleSendPOEmail = async () => {
    if (!selectedPO || !emailRecipient) {
      toast.error("Please enter a valid recipient email address");
      return;
    }

    setIsSendingEmail(true);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "purchase_order",
          recipientEmail: emailRecipient,
          subject: `Purchase Order ${selectedPO.poNumber} - ${BUSINESS_CONFIG.billingName}`,
          payload: {
            poNumber: selectedPO.poNumber,
            date: selectedPO.date,
            expectedDate: selectedPO.expectedDeliveryDate,
            supplier: selectedPO.supplier,
            deliveryLocation: selectedPO.deliveryLocation,
            paymentTerms: selectedPO.paymentTerms,
            items: selectedPO.items,
            subtotal: selectedPO.subtotal,
            taxTotal: selectedPO.taxTotal,
            shippingFee: selectedPO.shippingFee,
            grandTotal: selectedPO.grandTotal,
            notes: emailCustomNote || selectedPO.notes,
          },
          ccOwner: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Purchase order emailed to ${emailRecipient}! Copy sent to billing.`);
        updatePOStatus(selectedPO.id, "SENT_TO_SUPPLIER", {
          sentAt: new Date().toISOString(),
        });
        setIsEmailModalOpen(false);
      } else {
        toast.error(data.error || "Failed to send purchase order email");
      }
    } catch (err: any) {
      toast.error(err.message || "Email dispatch failed");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Save New Supplier
  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim() || !newSupEmail.trim() || !newSupPhone.trim()) {
      toast.error("Name, email and phone are required for suppliers");
      return;
    }

    const sup = addSupplier({
      name: newSupName.trim(),
      contactPerson: newSupContact.trim() || undefined,
      email: newSupEmail.trim(),
      phone: newSupPhone.trim(),
      gstin: newSupGstin.trim() || undefined,
      address: newSupAddress.trim() || "Chennai, Tamil Nadu",
      category: newSupCategory,
      paymentTerms: newSupTerms,
    });

    setSuppliers(getSuppliers());
    setSelectedSupplierId(sup.id);
    toast.success(`Supplier "${sup.name}" added successfully!`);
    setIsSupplierModalOpen(false);

    // Reset form
    setNewSupName("");
    setNewSupContact("");
    setNewSupEmail("");
    setNewSupPhone("");
    setNewSupGstin("");
    setNewSupAddress("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-900/10 text-amber-900">
              <ClipboardList className="h-5 w-5" />
            </div>
            <span>Purchase Orders & Procurement</span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Issue supplier purchase orders, track deliveries, and automate inventory replenishment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSupplierModalOpen(true)}
            className="border-stone-300 text-stone-700 hover:bg-stone-100"
          >
            <Building2 className="mr-1.5 h-4 w-4 text-stone-500" />
            Suppliers ({suppliers.length})
          </Button>

          <Button
            size="sm"
            onClick={() => {
              if (suppliers.length > 0 && !selectedSupplierId) {
                setSelectedSupplierId(suppliers[0].id);
              }
              setIsCreateModalOpen(true);
            }}
            className="bg-amber-900 hover:bg-amber-950 text-white shadow-xs"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Purchase Order
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-stone-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Active Orders
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-amber-900">
              {metrics.activeCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-stone-500">
            <span>Awaiting delivery from vendors</span>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Procurement Value
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-stone-900">
              ₹{metrics.totalValue.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-stone-500">
            <span>Total across all POs</span>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Stock Received
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-emerald-700">
              {metrics.receivedCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Delivered & updated in inventory</span>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Draft Orders
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-stone-700">
              {metrics.draftCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-stone-500">
            <span>Pending approval to dispatch</span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search Filter */}
      <Card className="border-stone-200 shadow-xs bg-white">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-stone-100 p-1">
                  <TabsTrigger value="all" className="text-xs">
                    All POs ({purchaseOrders.length})
                  </TabsTrigger>
                  <TabsTrigger value="SENT_TO_SUPPLIER" className="text-xs">
                    Sent
                  </TabsTrigger>
                  <TabsTrigger value="RECEIVED" className="text-xs">
                    Received
                  </TabsTrigger>
                  <TabsTrigger value="DRAFT" className="text-xs">
                    Drafts
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search PO #, supplier, or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PO Table */}
      <Card className="border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-stone-50/80">
              <TableRow className="border-stone-200">
                <TableHead className="w-[130px]">PO Number</TableHead>
                <TableHead>Supplier Particulars</TableHead>
                <TableHead>Items Ordered</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead className="text-right">Total (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[160px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPOs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-stone-500">
                    No purchase orders found matching this tab or filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPOs.map((po) => (
                  <TableRow key={po.id} className="border-stone-100 hover:bg-stone-50/60">
                    <TableCell className="font-bold text-xs text-stone-900">
                      <div className="flex items-center gap-1.5">
                        <FileCheck className="h-3.5 w-3.5 text-amber-800" />
                        <span>{po.poNumber}</span>
                      </div>
                      <div className="text-[11px] text-stone-400 font-normal mt-0.5">
                        {po.date}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-stone-900 text-xs">
                        {po.supplier.name}
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                        <span>{po.supplier.contactPerson}</span>
                        <span>•</span>
                        <span>{po.supplier.phone}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-stone-800 font-medium">
                        {po.items.length} item{po.items.length > 1 ? "s" : ""}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate max-w-xs">
                        {po.items.map((it) => `${it.quantity} ${it.unit} ${it.name}`).join(", ")}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-stone-600">
                      {po.expectedDeliveryDate || "Immediate"}
                    </TableCell>

                    <TableCell className="text-right font-extrabold text-stone-900 text-xs">
                      ₹{po.grandTotal.toLocaleString("en-IN")}
                    </TableCell>

                    <TableCell>
                      {po.status === "RECEIVED" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          RECEIVED
                        </span>
                      ) : po.status === "SENT_TO_SUPPLIER" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          <Truck className="h-3 w-3" />
                          SENT TO VENDOR
                        </span>
                      ) : po.status === "DRAFT" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                          <Clock className="h-3 w-3" />
                          DRAFT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          CANCELLED
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Print / View */}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Print Purchase Order"
                          onClick={() => handlePrintPO(po)}
                          className="h-7 w-7 text-stone-600 hover:text-stone-900"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>

                        {/* Email to Supplier */}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Email PO to Supplier"
                          onClick={() => handleOpenEmailModal(po)}
                          className="h-7 w-7 text-amber-800 hover:text-amber-950 hover:bg-amber-50"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </Button>

                        {/* WhatsApp to Supplier (Evolution API) */}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Send PO on WhatsApp (Evolution API)"
                          onClick={() => handleOpenWhatsAppModal(po)}
                          className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        >
                          <WhatsAppIcon className="h-3.5 w-3.5" />
                        </Button>

                        {/* Mark Received & Update Stock */}
                        {po.status !== "RECEIVED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Mark as Received & Update Stock"
                            onClick={() => handleMarkAsReceived(po)}
                            className="h-7 w-7 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                          >
                            <PackagePlus className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* New Purchase Order Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-amber-900" />
              <span>Create Purchase Order (PO)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500">
              Procure raw materials from certified bakery vendors. Prices and stock will link to inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Supplier & Logistics Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Select Supplier *</label>
                <div className="flex gap-2">
                  <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Choose supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="text-xs">
                          {s.name} ({s.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSupplierModalOpen(true)}
                    className="text-xs shrink-0"
                  >
                    + New
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Expected Delivery Date</label>
                <Input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Delivery Destination</label>
                <Input
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Payment Terms</label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 30 Days">Net 30 Days</SelectItem>
                    <SelectItem value="Net 15 Days">Net 15 Days</SelectItem>
                    <SelectItem value="Immediate / Advance">Immediate / Advance</SelectItem>
                    <SelectItem value="Cash on Delivery (COD)">Cash on Delivery (COD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Line Items Builder */}
            <div className="border border-stone-200 rounded-lg p-3 space-y-3 bg-stone-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Procurement Line Items
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLineItem}
                  className="h-7 text-xs border-amber-300 text-amber-900 bg-white hover:bg-amber-50"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
                </Button>
              </div>

              <div className="space-y-2.5">
                {poItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-md border border-stone-200/80 text-xs"
                  >
                    {/* Raw Material Catalog Select or Custom Name */}
                    <div className="col-span-12 sm:col-span-4 space-y-1">
                      <Select
                        onValueChange={(val) => handleSelectRawMaterial(idx, val)}
                        value={item.rawMaterialId ? String(item.rawMaterialId) : undefined}
                      >
                        <SelectTrigger className="h-8 text-xs bg-stone-50">
                          <SelectValue placeholder="Catalog Ingredient..." />
                        </SelectTrigger>
                        <SelectContent>
                          {localRawMaterials.map((rm) => (
                            <SelectItem key={rm.id} value={String(rm.id)} className="text-xs">
                              {rm.name} ({rm.stock} {rm.unit} in stock)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Item name / specification"
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...poItems];
                          updated[idx].name = e.target.value;
                          setPoItems(updated);
                        }}
                        className="h-7 text-xs"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <span className="text-[10px] text-stone-500 font-semibold">Qty</span>
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...poItems];
                          updated[idx].quantity = Number(e.target.value);
                          setPoItems(updated);
                        }}
                        className="h-7 text-xs"
                      />
                    </div>

                    {/* Unit */}
                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <span className="text-[10px] text-stone-500 font-semibold">Unit</span>
                      <Select
                        value={item.unit}
                        onValueChange={(val) => {
                          const updated = [...poItems];
                          updated[idx].unit = val as any;
                          setPoItems(updated);
                        }}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="l">l</SelectItem>
                          <SelectItem value="pcs">pcs</SelectItem>
                          <SelectItem value="boxes">boxes</SelectItem>
                          <SelectItem value="bags">bags</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <span className="text-[10px] text-stone-500 font-semibold">Rate (₹)</span>
                      <Input
                        type="number"
                        placeholder="Rate"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const updated = [...poItems];
                          updated[idx].unitPrice = Number(e.target.value);
                          setPoItems(updated);
                        }}
                        className="h-7 text-xs"
                      />
                    </div>

                    {/* Total & Delete */}
                    <div className="col-span-12 sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-4">
                      <span className="font-bold text-stone-900 text-xs">
                        ₹{(item.quantity * item.unitPrice).toLocaleString("en-IN")}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="h-7 w-7 text-stone-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals & Freight Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Special Instructions / Notes</label>
                <Input
                  placeholder="e.g. Temperature monitoring required / Deliver before 9 AM"
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="bg-stone-50 rounded-lg p-3 border border-stone-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-stone-800">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Estimated GST:</span>
                  <span className="font-semibold text-stone-800">₹{taxTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>Freight / Delivery Fee:</span>
                  <Input
                    type="number"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(Number(e.target.value) || 0)}
                    className="h-6 w-24 text-right text-xs"
                  />
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-1.5 text-sm font-bold text-amber-900">
                  <span>Total Purchase Order:</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="text-stone-600"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleCreatePO("DRAFT")}
              className="border-stone-300 text-stone-700"
            >
              Save Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleCreatePO("SENT_TO_SUPPLIER")}
              className="bg-amber-900 hover:bg-amber-950 text-white font-medium"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Save & Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Supplier Modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Mail className="h-5 w-5 text-amber-900" />
              <span>Email PO #{selectedPO?.poNumber} to Supplier</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500">
              Dispatches the branded purchase order directly from billing@kicheesbakeddelights.in.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Vendor / Supplier</label>
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 font-medium">
                {selectedPO?.supplier.name} ({selectedPO?.supplier.contactPerson})
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Recipient Email Address *</label>
              <Input
                type="email"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                placeholder="supplier@vendor.com"
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Accompanying Note</label>
              <Input
                value={emailCustomNote}
                onChange={(e) => setEmailCustomNote(e.target.value)}
                placeholder="Message for supplier..."
                className="text-xs"
              />
            </div>

            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-950 space-y-1">
              <div className="font-bold">Summary of PO details being sent:</div>
              <div>• Total Order Value: <strong>₹{selectedPO?.grandTotal.toLocaleString("en-IN")}</strong></div>
              <div>• Delivery To: <strong>{selectedPO?.deliveryLocation}</strong></div>
              <div>• Terms: <strong>{selectedPO?.paymentTerms}</strong></div>
              <div>• CC: <strong>billing@kicheesbakeddelights.in</strong></div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmailModalOpen(false)}
              className="text-stone-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendPOEmail}
              disabled={isSendingEmail}
              className="bg-amber-900 hover:bg-amber-950 text-white font-medium"
            >
              {isSendingEmail ? "Sending PO..." : "Send PO to Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Supplier Modal (Evolution API) */}
      <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <WhatsAppIcon className="h-4 w-4" />
              </div>
              <span>Send PO #{selectedPO?.poNumber} via WhatsApp</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500">
              Dispatches the branded purchase order directly to the supplier using Evolution API.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Vendor / Supplier</label>
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 font-medium flex justify-between items-center">
                <span>{selectedPO?.supplier.name}</span>
                <span className="text-[11px] text-stone-500">{selectedPO?.supplier.contactPerson}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 flex justify-between items-center">
                <span>Recipient WhatsApp Phone *</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Evolution API Active
                </span>
              </label>
              <Input
                type="tel"
                value={whatsappRecipientPhone}
                onChange={(e) => setWhatsappRecipientPhone(e.target.value)}
                placeholder="+91 98201 55210"
                className="text-xs font-mono"
              />
              <p className="text-[10px] text-stone-400">
                Include country code or 10-digit mobile number (e.g. +91 98201 55210)
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Accompanying Note</label>
              <Input
                value={whatsappCustomNote}
                onChange={(e) => setWhatsappCustomNote(e.target.value)}
                placeholder="Message for supplier..."
                className="text-xs"
              />
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>PO Details to be dispatched:</span>
              </div>
              <div className="text-[11px] space-y-0.5 pt-1 text-emerald-900/90 max-h-32 overflow-y-auto pr-1">
                {selectedPO?.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>• {item.quantity} {item.unit} {item.name}</span>
                    <span className="font-semibold">₹{(item.quantity * item.unitPrice).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-emerald-200 pt-1.5 mt-1.5 text-xs flex justify-between font-bold text-emerald-950">
                <span>Grand Total:</span>
                <span>₹{selectedPO?.grandTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="text-[10px] text-emerald-800 pt-1">
                Expected: <strong>{selectedPO?.expectedDeliveryDate}</strong> · Terms: <strong>{selectedPO?.paymentTerms}</strong>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleOpenPOWhatsAppWeb}
              className="text-stone-700 text-xs border-stone-200 hover:bg-stone-50"
              title="Open chat directly in WhatsApp Web"
            >
              Open Web Chat
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="text-stone-600 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendPOWhatsApp}
                disabled={isSendingWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs gap-1.5"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                {isSendingWhatsApp ? "Sending via Evolution..." : "Send via Evolution API"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Suppliers Modal */}
      <Dialog open={isSupplierModalOpen} onOpenChange={setIsSupplierModalOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-amber-900" />
              <span>Bakery Suppliers & Vendors</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500">
              Manage verified vendors for chocolates, dairy, packaging, and fine flours.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Add New Supplier Accordion / Form */}
            <form onSubmit={handleAddSupplier} className="rounded-lg bg-stone-50 border border-stone-200 p-3 space-y-3">
              <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                + Register New Supplier
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Input
                  placeholder="Supplier / Company Name *"
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
                <Input
                  placeholder="Contact Person (e.g. Sales Mgr)"
                  value={newSupContact}
                  onChange={(e) => setNewSupContact(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Input
                  type="email"
                  placeholder="Official Email Address *"
                  value={newSupEmail}
                  onChange={(e) => setNewSupEmail(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
                <Input
                  placeholder="Phone / WhatsApp *"
                  value={newSupPhone}
                  onChange={(e) => setNewSupPhone(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Input
                  placeholder="GSTIN (Tax ID)"
                  value={newSupGstin}
                  onChange={(e) => setNewSupGstin(e.target.value)}
                  className="h-8 text-xs"
                />
                <Select value={newSupCategory} onValueChange={setNewSupCategory}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chocolates & Cocoa">Chocolates & Cocoa</SelectItem>
                    <SelectItem value="Dairy & Fats">Dairy & Fats</SelectItem>
                    <SelectItem value="Flours & Grains">Flours & Grains</SelectItem>
                    <SelectItem value="Flavours & Vanilla">Flavours & Vanilla</SelectItem>
                    <SelectItem value="Packaging & Boxes">Packaging & Boxes</SelectItem>
                    <SelectItem value="Kitchen Equipment">Kitchen Equipment</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newSupTerms} onValueChange={setNewSupTerms}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 30 Days">Net 30 Days</SelectItem>
                    <SelectItem value="Net 15 Days">Net 15 Days</SelectItem>
                    <SelectItem value="Immediate / Advance">Immediate / Advance</SelectItem>
                    <SelectItem value="Cash on Delivery (COD)">COD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Warehouse / Dispatch Address"
                value={newSupAddress}
                onChange={(e) => setNewSupAddress(e.target.value)}
                className="h-8 text-xs"
              />

              <Button
                type="submit"
                size="sm"
                className="w-full bg-amber-900 hover:bg-amber-950 text-white text-xs h-8"
              >
                Save Supplier
              </Button>
            </form>

            {/* List Existing Suppliers */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Current Registered Vendors ({suppliers.length})
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {suppliers.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-lg border border-stone-200 bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-stone-900">{s.name}</div>
                      <div className="text-stone-500 text-[11px]">
                        {s.contactPerson} • {s.email} • {s.phone}
                      </div>
                      <div className="text-[10px] text-amber-900 font-semibold mt-0.5">
                        {s.category} • Terms: {s.paymentTerms}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-stone-200">
                      {s.gstin || "GST Unregistered"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSupplierModalOpen(false)}
              className="text-stone-600 text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
