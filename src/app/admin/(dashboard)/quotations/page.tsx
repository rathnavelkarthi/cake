"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Plus,
  Search,
  Share2,
  Printer,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  Edit2,
  IndianRupee,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Cake,
  Eye,
  Check,
  X,
  RefreshCw,
  Send,
  Building2,
  Layers,
  ShoppingBag,
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
  getQuotations,
  subscribeQuotations,
  createQuotation,
  updateQuotation,
  updateQuotationStatus,
  deleteQuotation,
  convertQuotationToOrder,
  generateQuotationHtml,
  getWhatsAppShareUrl,
  Quotation,
  QuotationLineItem,
  QuotationStatus,
} from "@/lib/quotations/quotation-store";
import { getInventoryProducts, AdminProductItem } from "@/lib/db/admin-data";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { toast } from "sonner";

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [inventoryProducts, setInventoryProducts] = useState<AdminProductItem[]>([]);

  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [previewQuote, setPreviewQuote] = useState<Quotation | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [occasion, setOccasion] = useState("Wedding Reception");
  const [eventDate, setEventDate] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [validDays, setValidDays] = useState(14);
  const [includeGst, setIncludeGst] = useState(true);
  const [gstRate, setGstRate] = useState(5);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [setupFee, setSetupFee] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [advancePercent, setAdvancePercent] = useState<number>(50);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentTerms, setPaymentTerms] = useState(
    "50% advance required upon quote approval to reserve kitchen slot. Balance upon setup/delivery."
  );

  // Line Items in Form
  const [formItems, setFormItems] = useState<QuotationLineItem[]>([
    {
      id: "item-1",
      name: "",
      description: "",
      flavour: "Belgian Chocolate Truffle",
      weightKg: "2.0 KG",
      quantity: 1,
      unitPrice: 3200,
      totalPrice: 3200,
      isEggless: true,
      category: "Custom Cake",
    },
  ]);

  // Subscribe to live Quotation changes
  useEffect(() => {
    const unsub = subscribeQuotations((quotes) => {
      setQuotations(quotes);
    });
    setInventoryProducts(getInventoryProducts());
    return () => unsub();
  }, []);

  // Filtered Quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const matchSearch =
        q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customerMobile.includes(searchQuery) ||
        q.occasion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.eventVenue && q.eventVenue.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === "ALL" || q.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [quotations, searchQuery, statusFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalQuotes = quotations.length;
    const approvedQuotes = quotations.filter((q) => q.status === "APPROVED");
    const sentQuotes = quotations.filter((q) => q.status === "SENT");
    const convertedQuotes = quotations.filter((q) => q.status === "CONVERTED");

    const totalValue = quotations.reduce((acc, q) => acc + q.grandTotal, 0);
    const convertedValue = convertedQuotes.reduce((acc, q) => acc + q.grandTotal, 0);

    return {
      totalQuotes,
      pendingCount: sentQuotes.length + quotations.filter((q) => q.status === "DRAFT").length,
      approvedCount: approvedQuotes.length,
      convertedCount: convertedQuotes.length,
      totalValue,
      convertedValue,
    };
  }, [quotations]);

  // Calculations for Form
  const formSubtotal = useMemo(() => {
    return formItems.reduce((acc, it) => acc + (it.unitPrice * it.quantity || 0), 0);
  }, [formItems]);

  const formTax = useMemo(() => {
    if (!includeGst) return 0;
    return (formSubtotal * gstRate) / 100;
  }, [formSubtotal, includeGst, gstRate]);

  const formGrandTotal = useMemo(() => {
    const total = formSubtotal + formTax + (Number(deliveryFee) || 0) + (Number(setupFee) || 0) - (Number(discount) || 0);
    return Math.max(0, total);
  }, [formSubtotal, formTax, deliveryFee, setupFee, discount]);

  const formAdvanceAmount = useMemo(() => {
    return Math.round((formGrandTotal * advancePercent) / 100);
  }, [formGrandTotal, advancePercent]);

  // Handle Form Item Modification
  const updateFormItem = (index: number, updates: Partial<QuotationLineItem>) => {
    setFormItems((prev) => {
      const next = [...prev];
      const current = next[index];
      const merged = { ...current, ...updates };
      merged.totalPrice = merged.quantity * merged.unitPrice;
      next[index] = merged;
      return next;
    });
  };

  const addFormItem = () => {
    setFormItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${prev.length + 1}`,
        name: "",
        description: "",
        flavour: "Belgian Chocolate",
        weightKg: "1.0 KG",
        quantity: 1,
        unitPrice: 1500,
        totalPrice: 1500,
        isEggless: true,
        category: "Custom Cake",
      },
    ]);
  };

  const removeFormItem = (index: number) => {
    if (formItems.length <= 1) {
      toast.error("Quotation must contain at least one item");
      return;
    }
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Reset form
  const resetForm = () => {
    setEditingQuoteId(null);
    setCustomerName("");
    setCustomerMobile("");
    setCustomerEmail("");
    setOccasion("Wedding Reception");
    setEventDate("");
    setEventVenue("");
    setValidDays(14);
    setIncludeGst(true);
    setGstRate(5);
    setDeliveryFee(0);
    setSetupFee(0);
    setDiscount(0);
    setAdvancePercent(50);
    setSpecialInstructions("");
    setPaymentTerms(
      "50% advance required upon quote approval to reserve kitchen slot. Balance upon setup/delivery."
    );
    setFormItems([
      {
        id: "item-1",
        name: "",
        description: "",
        flavour: "Belgian Chocolate Truffle",
        weightKg: "2.0 KG",
        quantity: 1,
        unitPrice: 3200,
        totalPrice: 3200,
        isEggless: true,
        category: "Custom Cake",
      },
    ]);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditDialog = (quote: Quotation) => {
    setEditingQuoteId(quote.id);
    setCustomerName(quote.customerName);
    setCustomerMobile(quote.customerMobile);
    setCustomerEmail(quote.customerEmail || "");
    setOccasion(quote.occasion);
    setEventDate(quote.eventDate);
    setEventVenue(quote.eventVenue || "");
    setIncludeGst(quote.includeGst);
    setGstRate(quote.gstRate);
    setDeliveryFee(quote.deliveryFee);
    setSetupFee(quote.setupFee);
    setDiscount(quote.discount);
    setAdvancePercent(quote.advanceRequiredPercentage);
    setSpecialInstructions(quote.specialInstructions || "");
    setPaymentTerms(quote.paymentTerms || "");
    setFormItems(quote.items);
    setIsCreateOpen(true);
  };

  // Save Quotation
  const handleSaveQuotation = (status: QuotationStatus = "DRAFT") => {
    if (!customerName.trim()) {
      toast.error("Please enter the customer name");
      return;
    }
    if (!customerMobile.trim()) {
      toast.error("Please enter customer contact number");
      return;
    }
    if (formItems.some((it) => !it.name.trim())) {
      toast.error("Please specify a name for all line items");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + validDays);
    const validUntilStr = validUntilDate.toISOString().split("T")[0];

    const quoteData = {
      customerName: customerName.trim(),
      customerMobile: customerMobile.trim(),
      customerEmail: customerEmail.trim() || undefined,
      occasion,
      eventDate: eventDate || todayStr,
      eventVenue: eventVenue.trim() || undefined,
      validUntil: validUntilStr,
      date: todayStr,
      items: formItems,
      subtotal: formSubtotal,
      includeGst,
      gstRate,
      tax: formTax,
      deliveryFee: Number(deliveryFee) || 0,
      setupFee: Number(setupFee) || 0,
      discount: Number(discount) || 0,
      grandTotal: formGrandTotal,
      advanceRequiredPercentage: advancePercent,
      advanceAmount: formAdvanceAmount,
      status,
      specialInstructions: specialInstructions.trim() || undefined,
      paymentTerms: paymentTerms.trim() || undefined,
    };

    if (editingQuoteId) {
      updateQuotation(editingQuoteId, quoteData);
      toast.success("Quotation updated successfully");
    } else {
      const created = createQuotation(quoteData);
      toast.success(`Quotation ${created.quotationNumber} created!`);
    }

    setIsCreateOpen(false);
    resetForm();
  };

  // Status Change
  const handleStatusChange = (id: string, newStatus: QuotationStatus) => {
    updateQuotationStatus(id, newStatus);
    toast.success(`Quotation status marked as ${newStatus}`);
  };

  // Convert to Order
  const handleConvertToOrder = (quote: Quotation) => {
    const res = convertQuotationToOrder(quote.id);
    if (res.success) {
      toast.success(
        `Quotation ${quote.quotationNumber} converted to active Order ${res.orderNumber}!`,
        {
          description: "Kitchen has been notified and scheduled for baking.",
        }
      );
    } else {
      toast.error(res.error || "Failed to convert quotation");
    }
  };

  // Delete
  const handleDelete = (id: string, quoteNum: string) => {
    if (confirm(`Are you sure you want to delete Quotation ${quoteNum}?`)) {
      deleteQuotation(id);
      toast.success(`Quotation ${quoteNum} deleted`);
    }
  };

  // Print / PDF
  const handlePrint = (quote: Quotation) => {
    const html = generateQuotationHtml(quote);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    } else {
      toast.error("Pop-up blocked. Please allow popups to print quotation.");
    }
  };

  // Share via WhatsApp
  const handleWhatsApp = (quote: Quotation) => {
    const url = getWhatsAppShareUrl(quote);
    window.open(url, "_blank");
    updateQuotationStatus(quote.id, "SENT");
    toast.success("Quotation opened in WhatsApp. Status marked as SENT.");
  };

  // Email Quotation to Client via Hostinger SMTP
  const handleEmailQuotation = async (quote: Quotation) => {
    const recipient = quote.customerEmail?.trim();
    if (!recipient) {
      toast.error("Customer has no email address. Please click Edit to add an email.");
      return;
    }

    const toastId = toast.loading(`Sending quote ${quote.quotationNumber} to ${recipient}...`);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom",
          recipientEmail: recipient,
          recipientName: quote.customerName,
          subject: `Bespoke Cake Quotation ${quote.quotationNumber} - Kichee's Baked Delights`,
          customMessage: generateQuotationHtml(quote),
          ccOwner: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.dismiss(toastId);
        toast.success(`Quotation ${quote.quotationNumber} emailed to ${recipient}! Copy sent to billing.`);
        updateQuotationStatus(quote.id, "SENT");
      } else {
        toast.dismiss(toastId);
        toast.error(data.error || "Failed to send quotation email");
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Failed to dispatch email");
    }
  };

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0">Approved</Badge>;
      case "CONVERTED":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-0">Converted to Order</Badge>;
      case "SENT":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-0">Sent to Client</Badge>;
      case "DRAFT":
        return <Badge className="bg-stone-100 text-stone-700 hover:bg-stone-200 border-0">Draft</Badge>;
      case "REJECTED":
        return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-0">Declined</Badge>;
      case "EXPIRED":
        return <Badge className="bg-stone-200 text-stone-500 hover:bg-stone-300 border-0">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-serif">
            Quotations & Estimates
          </h1>
          <p className="text-sm text-stone-500">
            Create, track, and convert custom cake & bulk event estimates into confirmed kitchen bakes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={openCreateDialog}
            className="bg-amber-900 hover:bg-amber-800 text-white rounded-xl shadow-sm gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Quotation</span>
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-stone-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Active Estimates
            </CardTitle>
            <FileText className="h-4 w-4 text-stone-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900">{metrics.totalQuotes}</div>
            <p className="text-xs text-stone-500 mt-1">
              ₹{metrics.totalValue.toLocaleString("en-IN")} pipeline value
            </p>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Awaiting Approval
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{metrics.pendingCount}</div>
            <p className="text-xs text-stone-500 mt-1">Sent to client or draft</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Client Approved
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{metrics.approvedCount}</div>
            <p className="text-xs text-stone-500 mt-1">Ready for 50% advance / order</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Converted Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{metrics.convertedCount}</div>
            <p className="text-xs text-stone-500 mt-1">
              ₹{metrics.convertedValue.toLocaleString("en-IN")} in kitchen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-stone-200 shadow-sm bg-white p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quotation #, customer, phone, or occasion..."
              className="pl-9 bg-stone-50/50 border-stone-200 rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {["ALL", "APPROVED", "SENT", "DRAFT", "CONVERTED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-amber-900 text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                }`}
              >
                {st === "ALL" ? "All Quotes" : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Quotations List */}
      <Card className="border-stone-200 shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-stone-50/75">
              <TableRow>
                <TableHead className="font-semibold text-stone-700">Quote Ref & Date</TableHead>
                <TableHead className="font-semibold text-stone-700">Customer</TableHead>
                <TableHead className="font-semibold text-stone-700">Occasion & Event</TableHead>
                <TableHead className="font-semibold text-stone-700">Items Preview</TableHead>
                <TableHead className="font-semibold text-stone-700 text-right">Grand Total</TableHead>
                <TableHead className="font-semibold text-stone-700 text-center">Status</TableHead>
                <TableHead className="font-semibold text-stone-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-stone-500">
                    <Cake className="h-10 w-10 text-stone-300 mx-auto mb-2" />
                    <p className="font-medium">No quotations found matching your filter</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Create a new quotation for a custom celebration cake or bulk inquiry.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotations.map((quote) => (
                  <TableRow key={quote.id} className="hover:bg-amber-50/20 transition-colors">
                    {/* Ref & Date */}
                    <TableCell className="align-top py-3.5">
                      <div className="font-bold text-stone-900 text-sm">{quote.quotationNumber}</div>
                      <div className="text-xs text-stone-500 mt-0.5">{quote.date}</div>
                      <div className="text-[11px] text-stone-400">Valid: {quote.validUntil}</div>
                    </TableCell>

                    {/* Customer */}
                    <TableCell className="align-top py-3.5">
                      <div className="font-semibold text-stone-900 text-sm">{quote.customerName}</div>
                      <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-stone-400" />
                        <span>{quote.customerMobile}</span>
                      </div>
                      {quote.customerEmail && (
                        <div className="text-[11px] text-stone-400 truncate max-w-[180px]">
                          {quote.customerEmail}
                        </div>
                      )}
                    </TableCell>

                    {/* Occasion */}
                    <TableCell className="align-top py-3.5">
                      <div className="font-medium text-stone-800 text-xs bg-stone-100 px-2 py-0.5 rounded inline-block">
                        {quote.occasion}
                      </div>
                      <div className="text-xs text-stone-600 mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-amber-700" />
                        <span>Event: {quote.eventDate}</span>
                      </div>
                      {quote.eventVenue && (
                        <div className="text-[11px] text-stone-500 truncate max-w-[200px] flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-stone-400 flex-shrink-0" />
                          <span className="truncate">{quote.eventVenue}</span>
                        </div>
                      )}
                    </TableCell>

                    {/* Items */}
                    <TableCell className="align-top py-3.5">
                      <div className="text-xs font-medium text-stone-800">
                        {quote.items[0]?.name || "Custom Items"}
                      </div>
                      {quote.items.length > 1 && (
                        <div className="text-[11px] text-amber-800 font-semibold mt-0.5">
                          + {quote.items.length - 1} more item{quote.items.length > 2 ? "s" : ""}
                        </div>
                      )}
                      <div className="text-[11px] text-stone-500 mt-1">
                        Advance: ₹{quote.advanceAmount.toLocaleString("en-IN")} ({quote.advanceRequiredPercentage}%)
                      </div>
                    </TableCell>

                    {/* Total */}
                    <TableCell className="align-top py-3.5 text-right">
                      <div className="font-bold text-stone-900 text-base">
                        ₹{quote.grandTotal.toLocaleString("en-IN")}
                      </div>
                      {quote.includeGst && (
                        <div className="text-[10px] text-stone-400">incl. 5% GST</div>
                      )}
                      {quote.convertedOrderNumber && (
                        <div className="text-[11px] font-semibold text-purple-700 mt-1">
                          #{quote.convertedOrderNumber}
                        </div>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="align-top py-3.5 text-center">
                      {getStatusBadge(quote.status)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="align-top py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* WhatsApp Share */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleWhatsApp(quote)}
                          title="Share via WhatsApp"
                          className="h-8 w-8 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>

                        {/* Email to Client */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEmailQuotation(quote)}
                          title="Email Quotation to Client"
                          className="h-8 w-8 text-amber-800 hover:text-amber-950 hover:bg-amber-50 rounded-lg"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>

                        {/* Print / PDF */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePrint(quote)}
                          title="Print / Save A4 PDF"
                          className="h-8 w-8 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>

                        {/* Preview in modal */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPreviewQuote(quote)}
                          title="View Details"
                          className="h-8 w-8 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(quote)}
                          title="Edit Quotation"
                          className="h-8 w-8 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        {/* Convert to Order if not already converted */}
                        {quote.status !== "CONVERTED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleConvertToOrder(quote)}
                            title="Convert to Active Order"
                            className="h-8 w-8 text-purple-700 hover:text-purple-800 hover:bg-purple-50 rounded-lg"
                          >
                            <ShoppingBag className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(quote.id, quote.quotationNumber)}
                          title="Delete"
                          className="h-8 w-8 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* CREATE / EDIT QUOTATION DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif font-bold text-stone-900">
              {editingQuoteId ? "Edit Commercial Quotation" : "Create New Quotation & Estimate"}
            </DialogTitle>
            <DialogDescription className="text-sm text-stone-500">
              Prepare a luxury cake & event estimate with itemized pricing, advance terms, and GST breakdown.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-3">
            {/* Customer & Event Details */}
            <div className="bg-stone-50/70 p-4 rounded-xl border border-stone-200/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                1. Customer & Occasion Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Customer Name *
                  </label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Priya Sundaram"
                    className="bg-white border-stone-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    WhatsApp / Mobile *
                  </label>
                  <Input
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="+91 98402 44123"
                    className="bg-white border-stone-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Email (Optional)
                  </label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="priya@example.com"
                    className="bg-white border-stone-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Occasion / Event
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full text-sm border border-stone-200 rounded-md px-3 py-2 bg-white text-stone-900 outline-none"
                  >
                    <option value="Wedding Reception">Wedding Reception</option>
                    <option value="Engagement Ceremony">Engagement Ceremony</option>
                    <option value="Baby Shower / 1st Birthday">Baby Shower / 1st Birthday</option>
                    <option value="Milestone Birthday">Milestone Birthday (18th / 50th)</option>
                    <option value="Anniversary Celebration">Anniversary Celebration</option>
                    <option value="Corporate Gifting & Hampers">Corporate Gifting & Hampers</option>
                    <option value="Bespoke Celebration Gateau">Bespoke Celebration Gateau</option>
                    <option value="Bulk Party Order">Bulk Party Order</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Event Date
                  </label>
                  <Input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="bg-white border-stone-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Quote Validity (Days)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={validDays}
                    onChange={(e) => setValidDays(Number(e.target.value))}
                    className="bg-white border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Delivery Venue / Event Address
                </label>
                <Input
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  placeholder="e.g. Mayor Ramanathan Chettiar Hall, MRC Nagar, Chennai"
                  className="bg-white border-stone-200"
                />
              </div>
            </div>

            {/* Line Items Builder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  2. Cake & Patisserie Specifications
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFormItem}
                  className="gap-1 text-xs text-amber-900 border-amber-900/30 hover:bg-amber-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Line Item</span>
                </Button>
              </div>

              <div className="space-y-3">
                {formItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6">
                          <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                            Item Title *
                          </label>
                          <Input
                            value={item.name}
                            onChange={(e) => updateFormItem(idx, { name: e.target.value })}
                            placeholder="e.g. 3-Tier Luxury Callebaut Truffle Gateau"
                            className="text-sm font-medium"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                            Flavour Profile
                          </label>
                          <Input
                            value={item.flavour || ""}
                            onChange={(e) => updateFormItem(idx, { flavour: e.target.value })}
                            placeholder="e.g. Belgian Truffle & Praline"
                            className="text-xs"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                            Weight / Portions
                          </label>
                          <Input
                            value={item.weightKg || ""}
                            onChange={(e) => updateFormItem(idx, { weightKg: e.target.value })}
                            placeholder="e.g. 5.0 KG (3 Tiers)"
                            className="text-xs"
                          />
                        </div>
                      </div>

                      {formItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFormItem(idx)}
                          className="text-stone-400 hover:text-rose-600 p-1 rounded-md"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-6">
                        <Input
                          value={item.description || ""}
                          onChange={(e) => updateFormItem(idx, { description: e.target.value })}
                          placeholder="Detailed specifications, flower dressing, tiers, custom edible gold leaf..."
                          className="text-xs text-stone-600"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-stone-500">Qty:</span>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateFormItem(idx, { quantity: Math.max(1, Number(e.target.value)) })
                            }
                            className="text-xs w-16 text-center font-bold"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-stone-500">Rate (₹):</span>
                          <Input
                            type="number"
                            min={0}
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateFormItem(idx, { unitPrice: Math.max(0, Number(e.target.value)) })
                            }
                            className="text-xs text-right font-bold"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2 text-right">
                        <span className="text-xs font-bold text-stone-900">
                          ₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                        </span>
                        <div className="mt-1">
                          <label className="inline-flex items-center gap-1 text-[10px] text-stone-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.isEggless}
                              onChange={(e) => updateFormItem(idx, { isEggless: e.target.checked })}
                              className="rounded text-amber-900 accent-amber-900"
                            />
                            <span>100% Eggless</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Totals & Advance Settings */}
            <div className="bg-stone-50/70 p-4 rounded-xl border border-stone-200 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                3. Financial Breakdown & Payment Terms
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Delivery Fee (₹)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    className="bg-white border-stone-200 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    On-Site Setup / Dowels (₹)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={setupFee}
                    onChange={(e) => setSetupFee(Number(e.target.value))}
                    className="bg-white border-stone-200 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Discount / Courtesy (₹)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="bg-white border-stone-200 text-xs text-rose-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Advance Required (%)
                  </label>
                  <Input
                    type="number"
                    min={10}
                    max={100}
                    value={advancePercent}
                    onChange={(e) => setAdvancePercent(Number(e.target.value))}
                    className="bg-white border-stone-200 text-xs font-bold text-amber-900"
                  />
                </div>
              </div>

              {/* GST Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeGst}
                    onChange={(e) => setIncludeGst(e.target.checked)}
                    className="rounded text-amber-900 accent-amber-900 h-4 w-4"
                  />
                  <span>Calculate GST (5% Bakery Confectionery Slab)</span>
                </label>

                {includeGst && (
                  <span className="text-xs font-semibold text-stone-600">
                    + ₹{formTax.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Grand Total Summary Box */}
              <div className="bg-amber-900/5 border border-amber-900/20 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
                <div>
                  <div className="text-xs text-stone-600">
                    Subtotal: <strong>₹{formSubtotal.toLocaleString("en-IN")}</strong>
                    {includeGst && ` + Tax: ₹${formTax.toLocaleString("en-IN")}`}
                    {deliveryFee > 0 && ` + Delivery: ₹${deliveryFee}`}
                    {discount > 0 && ` - Discount: ₹${discount}`}
                  </div>
                  <div className="text-xs text-amber-900 font-semibold mt-0.5">
                    Advance to block date ({advancePercent}%): ₹{formAdvanceAmount.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider text-stone-500 block">
                    Estimated Grand Total
                  </span>
                  <span className="text-2xl font-bold font-serif text-amber-950">
                    ₹{formGrandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Special Instructions / Kitchen Notes
                </label>
                <Input
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Stage delivery strictly by 4:00 PM. Bride requested pastel edible roses."
                  className="bg-white border-stone-200 text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleSaveQuotation("DRAFT")}
              className="w-full sm:w-auto text-stone-700"
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSaveQuotation("SENT")}
              className="w-full sm:w-auto bg-amber-900 hover:bg-amber-800 text-white font-semibold"
            >
              Save & Ready to Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PREVIEW MODAL */}
      {previewQuote && (
        <Dialog open={!!previewQuote} onOpenChange={() => setPreviewQuote(null)}>
          <DialogContent className="max-w-2xl bg-white p-6 rounded-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold text-stone-900">
                    {previewQuote.quotationNumber}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-stone-500">
                    {previewQuote.occasion} · Prepared on {previewQuote.date}
                  </DialogDescription>
                </div>
                {getStatusBadge(previewQuote.status)}
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs grid grid-cols-2 gap-3">
                <div>
                  <span className="text-stone-400 block uppercase tracking-wider text-[10px]">Client</span>
                  <span className="font-bold text-stone-900">{previewQuote.customerName}</span>
                  <div className="text-stone-600 mt-0.5">{previewQuote.customerMobile}</div>
                </div>
                <div>
                  <span className="text-stone-400 block uppercase tracking-wider text-[10px]">Event Date & Venue</span>
                  <span className="font-semibold text-stone-900">{previewQuote.eventDate}</span>
                  <div className="text-stone-600 truncate mt-0.5">{previewQuote.eventVenue || "Counter Pickup"}</div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Items</h4>
                <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                  {previewQuote.items.map((it, i) => (
                    <div
                      key={it.id}
                      className={`p-3 flex justify-between items-start ${
                        i > 0 ? "border-t border-stone-100" : ""
                      }`}
                    >
                      <div>
                        <div className="font-bold text-stone-900">{it.name}</div>
                        {it.description && <div className="text-stone-500 mt-0.5">{it.description}</div>}
                        <div className="text-stone-400 text-[11px] mt-1">
                          {it.flavour && `Flavour: ${it.flavour}`} · {it.weightKg && `Weight: ${it.weightKg}`} · Qty: {it.quantity}
                        </div>
                      </div>
                      <div className="text-right font-bold text-stone-900">
                        ₹{it.totalPrice.toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-amber-900/5 p-3.5 rounded-xl border border-amber-900/15 flex justify-between items-center text-xs">
                <div>
                  <div className="text-stone-600">
                    Subtotal: ₹{previewQuote.subtotal.toLocaleString("en-IN")}
                    {previewQuote.includeGst && ` · GST: ₹${previewQuote.tax}`}
                  </div>
                  <div className="text-amber-900 font-semibold mt-0.5">
                    Required Advance: ₹{previewQuote.advanceAmount.toLocaleString("en-IN")} ({previewQuote.advanceRequiredPercentage}%)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-stone-400 uppercase tracking-wider">Grand Total</div>
                  <div className="text-xl font-bold font-serif text-amber-950">
                    ₹{previewQuote.grandTotal.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Status Switcher & Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200">
                <Button
                  size="sm"
                  onClick={() => handleWhatsApp(previewQuote)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs rounded-lg"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Send on WhatsApp</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePrint(previewQuote)}
                  className="gap-1.5 text-xs rounded-lg"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print A4 Quotation</span>
                </Button>

                {previewQuote.status !== "APPROVED" && previewQuote.status !== "CONVERTED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleStatusChange(previewQuote.id, "APPROVED");
                      setPreviewQuote((prev) => (prev ? { ...prev, status: "APPROVED" } : null));
                    }}
                    className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 text-xs rounded-lg"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    <span>Mark Approved</span>
                  </Button>
                )}

                {previewQuote.status !== "CONVERTED" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      handleConvertToOrder(previewQuote);
                      setPreviewQuote(null);
                    }}
                    className="bg-purple-700 hover:bg-purple-800 text-white gap-1.5 text-xs rounded-lg"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Convert to Order</span>
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
