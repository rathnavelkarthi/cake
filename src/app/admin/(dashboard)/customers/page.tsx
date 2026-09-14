"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Phone,
  Mail,
  ShoppingBag,
  IndianRupee,
  Tag,
  Eye,
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CustomerRecord {
  id: number;
  name: string;
  mobile: string;
  email: string;
  totalOrders: number;
  totalSpend: number;
  tags: string[];
  lastOrderDate: string;
}

const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 1,
    name: "Priya Sundaram",
    mobile: "+91 98401 23456",
    email: "priya.sundaram@gmail.com",
    totalOrders: 6,
    totalSpend: 7850,
    tags: ["REPEAT_CUSTOMER", "CAKE_CUSTOMER", "HIGH_VALUE"],
    lastOrderDate: "Today",
  },
  {
    id: 2,
    name: "Karthik Raja",
    mobile: "+91 97910 88231",
    email: "karthik.raja@outlook.com",
    totalOrders: 3,
    totalSpend: 3200,
    tags: ["REPEAT_CUSTOMER", "BROWNIE_CUSTOMER"],
    lastOrderDate: "Today",
  },
  {
    id: 3,
    name: "Ananya Iyer",
    mobile: "+91 98842 11904",
    email: "ananya.iyer@gmail.com",
    totalOrders: 1,
    totalSpend: 2400,
    tags: ["NEW_CUSTOMER", "CUSTOM_CAKE"],
    lastOrderDate: "Today",
  },
  {
    id: 4,
    name: "Vikram Raman",
    mobile: "+91 98412 77334",
    email: "vikram.raman@tcs.com",
    totalOrders: 9,
    totalSpend: 11400,
    tags: ["CORPORATE", "REPEAT_CUSTOMER", "HIGH_VALUE"],
    lastOrderDate: "Today",
  },
  {
    id: 5,
    name: "Meera Krishnan",
    mobile: "+91 94441 90872",
    email: "meera.k@gmail.com",
    totalOrders: 4,
    totalSpend: 4600,
    tags: ["REPEAT_CUSTOMER", "BIRTHDAY"],
    lastOrderDate: "3 days ago",
  },
];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(
    null
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          Customer Relationship Management (CRM)
        </h1>
        <p className="text-sm text-stone-500">
          Unified customer profiles, purchase history, and segmentation tags per PRODUCT.md Section 22.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
          <Input
            type="search"
            placeholder="Search by name, phone, email, tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-xs border-stone-200 bg-white"
          />
        </div>
        <div className="text-xs text-stone-500 font-medium">
          Total Customers: {customers.length}
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-stone-50/70">
            <TableRow>
              <TableHead className="text-xs font-semibold">Customer</TableHead>
              <TableHead className="text-xs font-semibold">Contact Details</TableHead>
              <TableHead className="text-xs font-semibold">Orders</TableHead>
              <TableHead className="text-xs font-semibold">Total Spend</TableHead>
              <TableHead className="text-xs font-semibold">Segment Tags</TableHead>
              <TableHead className="text-right text-xs font-semibold">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-stone-500 text-sm">
                  No customers found matching "{search}".
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((cust) => (
                <TableRow key={cust.id} className="hover:bg-stone-50/50">
                  <TableCell className="font-semibold text-xs text-stone-900">
                    <div>{cust.name}</div>
                    <div className="text-[10px] text-stone-400 font-normal">
                      Last order: {cust.lastOrderDate}
                    </div>
                  </TableCell>

                  <TableCell className="text-xs">
                    <div className="flex items-center gap-1.5 text-stone-800">
                      <Phone className="h-3 w-3 text-stone-400" />
                      <span>{cust.mobile}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                      <Mail className="h-3 w-3 text-stone-400" />
                      <span>{cust.email}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs font-medium text-stone-700">
                    {cust.totalOrders} orders
                  </TableCell>

                  <TableCell className="text-xs font-bold text-stone-900">
                    ₹{cust.totalSpend.toLocaleString("en-IN")}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {cust.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-700 border border-stone-200"
                        >
                          {tag.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCustomer(cust)}
                      className="h-8 text-xs text-stone-600 hover:text-stone-900"
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Customer Profile Dialog */}
      {selectedCustomer && (
        <Dialog
          open={!!selectedCustomer}
          onOpenChange={() => setSelectedCustomer(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedCustomer.name}</DialogTitle>
              <DialogDescription>
                Unified profile and lifetime value breakdown
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-stone-50 border border-stone-100">
                  <p className="text-[10px] font-semibold text-stone-400 uppercase">
                    Total Orders
                  </p>
                  <p className="text-lg font-bold text-stone-900">
                    {selectedCustomer.totalOrders}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-stone-50 border border-stone-100">
                  <p className="text-[10px] font-semibold text-stone-400 uppercase">
                    Lifetime Spend
                  </p>
                  <p className="text-lg font-bold text-amber-900">
                    ₹{selectedCustomer.totalSpend.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-stone-500 uppercase">
                  Contact Information
                </p>
                <div className="text-xs space-y-1">
                  <p className="text-stone-800">
                    <span className="text-stone-400">Mobile: </span>
                    {selectedCustomer.mobile}
                  </p>
                  <p className="text-stone-800">
                    <span className="text-stone-400">Email: </span>
                    {selectedCustomer.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-stone-500 uppercase">
                  Active Segments
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCustomer.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
