"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingDown,
  Plus,
  Download,
  Mail,
  Search,
  Calendar,
  Tag,
  CreditCard,
  Building,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  PieChart,
  ArrowUpRight,
  Filter,
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
import { toast } from "sonner";
import {
  Expense,
  ExpenseCategory,
  PaymentMode,
  ExpenseStatus,
  EXPENSE_CATEGORIES,
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  exportExpensesToCsv,
  subscribeExpenses,
} from "@/lib/expenses/expense-store";

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("month");

  // Add/Edit Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<ExpenseCategory>("Raw Materials & Ingredients");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formPaymentMode, setFormPaymentMode] = useState<PaymentMode>("UPI");
  const [formVendor, setFormVendor] = useState("");
  const [formInvoiceNumber, setFormInvoiceNumber] = useState("");
  const [formStatus, setFormStatus] = useState<ExpenseStatus>("PAID");
  const [formRecordedBy, setFormRecordedBy] = useState("Desmond (Manager)");
  const [formNotes, setFormNotes] = useState("");

  // Email Report Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [reportRecipient, setReportRecipient] = useState("billing@kicheesbakeddelights.in");
  const [reportPeriod, setReportPeriod] = useState("October 2026 - Current Month");
  const [isSendingReport, setIsSendingReport] = useState(false);

  useEffect(() => {
    setExpenses(getExpenses());
    return subscribeExpenses(() => {
      setExpenses(getExpenses());
    });
  }, []);

  // Filter expenses based on controls
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    return expenses.filter((e) => {
      // Search
      const matchesSearch =
        !searchQuery ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.invoiceNumber && e.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category
      const matchesCategory =
        selectedCategory === "all" || e.category === selectedCategory;

      // Status
      const matchesStatus =
        selectedStatus === "all" || e.status === selectedStatus;

      // Payment Mode
      const matchesPayment =
        selectedPaymentMode === "all" || e.paymentMode === selectedPaymentMode;

      // Date Filter
      let matchesDate = true;
      if (dateFilter === "today") {
        matchesDate = e.date === todayStr;
      } else if (dateFilter === "week") {
        const itemDate = new Date(e.date);
        const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
        matchesDate = diffDays >= 0 && diffDays <= 7;
      } else if (dateFilter === "month") {
        const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        matchesDate = e.date.startsWith(currentMonthPrefix);
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesPayment && matchesDate;
    });
  }, [expenses, searchQuery, selectedCategory, selectedStatus, selectedPaymentMode, dateFilter]);

  const summary = useMemo(() => {
    return getExpenseSummary(expenses);
  }, [expenses]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  // Open modal for new expense
  const handleOpenAddModal = () => {
    setEditingExpenseId(null);
    setFormTitle("");
    setFormCategory("Raw Materials & Ingredients");
    setFormAmount("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormPaymentMode("UPI");
    setFormVendor("");
    setFormInvoiceNumber("");
    setFormStatus("PAID");
    setFormNotes("");
    setIsAddModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setFormTitle(exp.title);
    setFormCategory(exp.category);
    setFormAmount(String(exp.amount));
    setFormDate(exp.date);
    setFormPaymentMode(exp.paymentMode);
    setFormVendor(exp.vendor);
    setFormInvoiceNumber(exp.invoiceNumber || "");
    setFormStatus(exp.status);
    setFormRecordedBy(exp.recordedBy);
    setFormNotes(exp.notes || "");
    setIsAddModalOpen(true);
  };

  // Save Expense (Create or Update)
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAmount || isNaN(Number(formAmount))) {
      toast.error("Please provide a valid title and amount");
      return;
    }

    const payload = {
      title: formTitle.trim(),
      category: formCategory,
      amount: Number(formAmount),
      date: formDate,
      paymentMode: formPaymentMode,
      vendor: formVendor.trim() || "General Vendor",
      invoiceNumber: formInvoiceNumber.trim() || undefined,
      status: formStatus,
      recordedBy: formRecordedBy,
      notes: formNotes.trim() || undefined,
    };

    if (editingExpenseId) {
      updateExpense(editingExpenseId, payload);
      toast.success("Expense updated successfully");
    } else {
      addExpense(payload);
      toast.success("Expense recorded successfully");
    }

    setIsAddModalOpen(false);
  };

  // Delete Expense
  const handleDeleteExpense = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete expense "${title}"?`)) {
      deleteExpense(id);
      toast.success("Expense deleted");
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    const csv = exportExpensesToCsv(filteredExpenses);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `kichees-expenses-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Expenses exported to CSV!");
  };

  // Send Financial Report Email
  const handleSendReportEmail = async () => {
    if (!reportRecipient) {
      toast.error("Please specify a recipient email");
      return;
    }

    setIsSendingReport(true);
    try {
      const top5 = [...filteredExpenses]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
        .map((e) => ({
          title: e.title,
          category: e.category,
          amount: e.amount,
          date: e.date,
          vendor: e.vendor,
        }));

      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "expense_report",
          recipientEmail: reportRecipient,
          subject: `Bakery Financial Report (${reportPeriod}) - Kichee's Baked Delights`,
          payload: {
            period: reportPeriod,
            totalExpenses: filteredTotal,
            totalSales: 84500, // Estimated current sales from POS & Online
            netProfit: 84500 - filteredTotal,
            categories: summary.categoryBreakdown.map((c) => ({
              category: c.category,
              amount: c.amount,
              percentage: c.percentage,
            })),
            topExpenses: top5,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Expense report emailed to ${reportRecipient}!`);
        setIsEmailModalOpen(false);
      } else {
        toast.error(data.error || "Failed to send expense report email");
      }
    } catch (err: any) {
      toast.error(err.message || "Email dispatch error");
    } finally {
      setIsSendingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-900/10 text-amber-900">
              <TrendingDown className="h-5 w-5" />
            </div>
            <span>Bakery Expense Tracker</span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Track ingredient procurement, utilities, staff wages, and operational costs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="border-stone-300 text-stone-700 hover:bg-stone-100"
          >
            <Download className="mr-1.5 h-4 w-4 text-stone-500" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEmailModalOpen(true)}
            className="border-amber-300 text-amber-900 bg-amber-50/50 hover:bg-amber-100/60"
          >
            <Mail className="mr-1.5 h-4 w-4 text-amber-800" />
            Email Report
          </Button>

          <Button
            size="sm"
            onClick={handleOpenAddModal}
            className="bg-amber-900 hover:bg-amber-950 text-white shadow-xs"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-stone-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              This Month's Spend
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-stone-900">
              ₹{summary.thisMonthTotal.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-stone-500 flex items-center justify-between">
            <span>October 2026</span>
            <Badge variant="outline" className="bg-stone-50 text-stone-700 border-stone-200">
              Active Month
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Filtered Total
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-amber-900">
              ₹{filteredTotal.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-stone-500">
            <span>{filteredExpenses.length} entries selected</span>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Today's Expenses
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-stone-900">
              ₹{summary.todayTotal.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-stone-500">
            <span>Daily kitchen ops</span>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Pending Invoices
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-amber-700">
              ₹{summary.pendingAmount.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-amber-700 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{summary.pendingCount} unpaid supplier bills</span>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown Progress */}
      {summary.categoryBreakdown.length > 0 && (
        <Card className="border-stone-200/80 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-amber-900" />
                <CardTitle className="text-base font-bold text-stone-900">
                  Top Spending Categories
                </CardTitle>
              </div>
              <span className="text-xs text-stone-500">Overall distribution</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {summary.categoryBreakdown.slice(0, 6).map((cat) => (
                <div
                  key={cat.category}
                  className="rounded-lg bg-stone-50/80 border border-stone-200/60 p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800 truncate pr-2">
                      {cat.category}
                    </span>
                    <span className="font-bold text-stone-900">
                      ₹{cat.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-800 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-500">
                    <span>{cat.count} bills</span>
                    <span>{cat.percentage.toFixed(1)}% of total</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter and Search Bar */}
      <Card className="border-stone-200 shadow-xs bg-white">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search description, vendor, invoice #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>

            {/* Category Select */}
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Select */}
            <div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REIMBURSED">Reimbursed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Mode */}
            <div>
              <Select value={selectedPaymentMode} onValueChange={setSelectedPaymentMode}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="All Payment Modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Date Range Tabs */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-stone-100 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-stone-600">
              <Calendar className="h-3.5 w-3.5 text-stone-400" />
              <span className="font-medium">Date Range:</span>
              <div className="inline-flex rounded-md shadow-2xs border border-stone-200 p-0.5 bg-stone-50">
                {(["month", "week", "today", "all"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDateFilter(mode)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                      dateFilter === mode
                        ? "bg-amber-900 text-white shadow-xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    {mode === "month"
                      ? "This Month"
                      : mode === "week"
                      ? "This Week"
                      : mode === "today"
                      ? "Today"
                      : "All Time"}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-stone-500 font-medium">
              Showing <strong>{filteredExpenses.length}</strong> of <strong>{expenses.length}</strong> expenses
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card className="border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-stone-50/80">
              <TableRow className="border-stone-200">
                <TableHead className="w-[110px]">Date</TableHead>
                <TableHead>Description & Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor / Payee</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
                <TableHead className="w-[90px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-stone-500">
                    No expense records found matching the filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((exp) => (
                  <TableRow key={exp.id} className="border-stone-100 hover:bg-stone-50/60">
                    <TableCell className="font-medium text-xs text-stone-600">
                      {exp.date}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-stone-900 text-sm">
                        {exp.title}
                      </div>
                      {exp.notes && (
                        <div className="text-xs text-stone-500 mt-0.5 line-clamp-1 italic">
                          {exp.notes}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200/50">
                        {exp.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-stone-800">
                        {exp.vendor}
                      </div>
                      {exp.invoiceNumber && (
                        <div className="text-[11px] text-stone-400">
                          Ref: {exp.invoiceNumber}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px] font-semibold border-stone-200 text-stone-700">
                        {exp.paymentMode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {exp.status === "PAID" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          PAID
                        </span>
                      ) : exp.status === "PENDING" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertCircle className="h-3 w-3" />
                          PENDING
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          REIMBURSED
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-stone-900 text-sm">
                      ₹{exp.amount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditModal(exp)}
                          className="h-7 w-7 text-stone-500 hover:text-stone-900"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteExpense(exp.id, exp.title)}
                          className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Add / Edit Expense Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900">
              {editingExpenseId ? "Edit Bakery Expense" : "Record New Bakery Expense"}
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500">
              Enter expense particulars, payment mode, and vendor invoice references.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveExpense} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Expense Description / Title *
              </label>
              <Input
                placeholder="e.g. Barry Callebaut 54% Dark Chocolate 25kg"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Category *</label>
                <Select
                  value={formCategory}
                  onValueChange={(val) => setFormCategory(val as ExpenseCategory)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Amount (₹) *</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Date *</label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Payment Mode</label>
                <Select
                  value={formPaymentMode}
                  onValueChange={(val) => setFormPaymentMode(val as PaymentMode)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Status</label>
                <Select
                  value={formStatus}
                  onValueChange={(val) => setFormStatus(val as ExpenseStatus)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REIMBURSED">Reimbursed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Vendor / Payee</label>
                <Input
                  placeholder="e.g. Barry Callebaut / Milky Mist"
                  value={formVendor}
                  onChange={(e) => setFormVendor(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Invoice / Bill Number</label>
                <Input
                  placeholder="e.g. INV-2026-904"
                  value={formInvoiceNumber}
                  onChange={(e) => setFormInvoiceNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Notes / Audit Remarks</label>
              <Input
                placeholder="Optional delivery details, batch #, or kitchen station notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-amber-900 hover:bg-amber-950 text-white font-medium"
              >
                {editingExpenseId ? "Save Changes" : "Record Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Email Financial Report Dialog */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Mail className="h-5 w-5 text-amber-900" />
              <span>Email Bakery Financial Report</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500">
              Sends an executive summary breakdown of expenses directly via Hostinger SMTP.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Recipient Email Address</label>
              <Input
                type="email"
                value={reportRecipient}
                onChange={(e) => setReportRecipient(e.target.value)}
                placeholder="billing@kicheesbakeddelights.in"
              />
              <p className="text-[11px] text-stone-400">
                Defaults to the configured bakery ownership and billing address.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Report Period Label</label>
              <Input
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                placeholder="e.g. October 2026 - MTD Summary"
              />
            </div>

            <div className="rounded-lg bg-amber-50/70 border border-amber-200/60 p-3 text-xs text-amber-900 space-y-1">
              <div className="font-bold">What will be sent:</div>
              <div>• Total recorded expenses: <strong>₹{filteredTotal.toLocaleString("en-IN")}</strong></div>
              <div>• Category distribution breakdown</div>
              <div>• Top 5 largest procurement items</div>
              <div>• Sent from: <strong>billing@kicheesbakeddelights.in</strong></div>
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
              onClick={handleSendReportEmail}
              disabled={isSendingReport}
              className="bg-amber-900 hover:bg-amber-950 text-white font-medium"
            >
              {isSendingReport ? "Sending Report..." : "Send Report via Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
