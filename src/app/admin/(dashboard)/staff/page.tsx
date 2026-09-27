"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  ChefHat,
  Cake,
  Receipt,
  Truck,
  CheckCircle2,
  Clock,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Activity,
  ShieldCheck,
  Filter,
  RefreshCw,
  MessageSquare,
  AlertCircle,
  BarChart3,
  Calendar,
} from "lucide-react";
import {
  StaffMember,
  StaffActivityItem,
  getStaffMembers,
  getStaffActivities,
  updateStaffStatus,
  subscribeTeamStore,
} from "@/lib/team/team-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminStaffWorkloadPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [activities, setActivities] = useState<StaffActivityItem[]>([]);
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const reloadData = () => {
    setStaff(getStaffMembers());
    setActivities(getStaffActivities());
  };

  useEffect(() => {
    reloadData();
    const unsubscribe = subscribeTeamStore(() => {
      reloadData();
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = (staffId: string, status: StaffMember["status"]) => {
    updateStaffStatus(staffId, status);
  };

  const filteredStaff = staff.filter((s) => {
    if (filterRole === "ALL") return true;
    return s.role === filterRole;
  });

  const totalCompletedOrders = staff.reduce((sum, s) => sum + s.todayCompletedOrders, 0);
  const totalActiveTickets = staff.reduce((sum, s) => sum + s.activeTickets, 0);
  const totalBakesKg = staff.reduce((sum, s) => sum + s.todayBakesKg, 0);
  const onDutyCount = staff.filter((s) => s.status === "ON_DUTY").length;

  return (
    <div className="space-y-8">
      {/* Header & Control Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-900 text-amber-50">
              <Users className="w-5 h-5" />
            </span>
            <span>Employee Workload & Staff Productivity</span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Real-time tracking of kitchen chefs, pastry decorators, POS staff, and delivery dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={reloadData}
            className="h-9 border-stone-200 hover:bg-stone-50"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-stone-600" />
            <span>Refresh Metrics</span>
          </Button>

          <Button asChild size="sm" className="h-9 bg-amber-900 hover:bg-amber-950 text-white shadow-xs">
            <Link href="/admin/chat">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              <span>Internal Team Chat</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* On Duty Staff */}
        <Card className="border-stone-200/80 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-stone-500 tracking-wider">
              Active Shift Staff
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900">
              {onDutyCount} / {staff.length}
            </div>
            <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% Station Coverage</span>
            </p>
          </CardContent>
        </Card>

        {/* Active Work In Progress */}
        <Card className="border-stone-200/80 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-stone-500 tracking-wider">
              Active Orders In Prep
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <Flame className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900">
              {totalActiveTickets} Tickets
            </div>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <span>Baking, decorating & packaging</span>
            </p>
          </CardContent>
        </Card>

        {/* Completed Output */}
        <Card className="border-stone-200/80 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-stone-500 tracking-wider">
              Completed Orders Today
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900">
              {totalCompletedOrders} Orders
            </div>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span>{totalBakesKg.toFixed(1)} kg artisanal cake produced</span>
            </p>
          </CardContent>
        </Card>

        {/* Average Prep Speed */}
        <Card className="border-stone-200/80 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-stone-500 tracking-wider">
              Kitchen Efficiency
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900">97.6%</div>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <span>Avg prep time: 22 mins</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
        <span className="text-xs font-semibold text-stone-500 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter Station:
        </span>
        {[
          { label: "All Staff", val: "ALL" },
          { label: "Kitchen Chefs", val: "HEAD_CHEF" },
          { label: "Front POS & Dispatch", val: "BILLING_STAFF" },
          { label: "Executive Admin", val: "SUPER_ADMIN" },
        ].map((f) => (
          <button
            key={f.val}
            type="button"
            onClick={() => setFilterRole(f.val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterRole === f.val
                ? "bg-amber-900 text-white shadow-xs"
                : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredStaff.map((member) => {
          const isHighCapacity = member.capacityPercent >= 85;

          return (
            <Card
              key={member.id}
              className="border-stone-200/90 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden"
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/60 text-2xl">
                      {member.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-stone-900">
                          {member.name}
                        </h2>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            member.status === "ON_DUTY"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : member.status === "ON_BREAK"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          {member.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 font-medium">
                        {member.roleTitle}
                      </p>
                      <p className="text-[11px] text-stone-400 font-mono">
                        {member.station}
                      </p>
                    </div>
                  </div>

                  {/* Status Dropdown / Action */}
                  <select
                    value={member.status}
                    onChange={(e) =>
                      handleStatusChange(member.id, e.target.value as StaffMember["status"])
                    }
                    className="text-xs rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-stone-700 font-medium focus:outline-hidden"
                  >
                    <option value="ON_DUTY">🟢 On Duty</option>
                    <option value="ON_BREAK">☕ On Break</option>
                    <option value="OFF_DUTY">⚪ Off Duty</option>
                  </select>
                </div>

                {/* Current Active Task Banner */}
                <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-0.5">
                    Current Active Assignment
                  </span>
                  <p className="font-semibold text-stone-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                    <span>{member.currentTask}</span>
                  </p>
                </div>

                {/* Productivity Stats Grid */}
                <div className="grid grid-cols-3 gap-2.5 mt-4 text-center">
                  <div className="p-2.5 rounded-xl bg-[#faf7f2] border border-stone-200/50">
                    <p className="text-[10px] font-bold text-stone-500 uppercase">
                      Today's Output
                    </p>
                    <p className="text-sm font-bold text-stone-900 mt-0.5">
                      {member.todayBakesKg > 0
                        ? `${member.todayBakesKg} kg`
                        : `${member.todayCompletedOrders} orders`}
                    </p>
                    <p className="text-[10px] text-stone-400">
                      {member.todayCompletedOrders} done
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#faf7f2] border border-stone-200/50">
                    <p className="text-[10px] font-bold text-stone-500 uppercase">
                      In Queue
                    </p>
                    <p className="text-sm font-bold text-amber-900 mt-0.5">
                      {member.activeTickets} Tickets
                    </p>
                    <p className="text-[10px] text-stone-400">
                      {member.avgPrepTimeMin}m avg prep
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#faf7f2] border border-stone-200/50">
                    <p className="text-[10px] font-bold text-stone-500 uppercase">
                      Efficiency
                    </p>
                    <p className="text-sm font-bold text-emerald-700 mt-0.5">
                      {member.efficiencyRate}%
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium">On schedule</p>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-stone-500 font-medium">Station Workload Capacity</span>
                    <span
                      className={`font-bold ${
                        isHighCapacity ? "text-red-700" : "text-stone-800"
                      }`}
                    >
                      {member.capacityPercent}% {isHighCapacity && "(High Load)"}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHighCapacity
                          ? "bg-red-500"
                          : member.capacityPercent > 70
                          ? "bg-amber-600"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${member.capacityPercent}%` }}
                    />
                  </div>
                </div>

                {/* Footer Shift & Actions */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Shift: {member.shiftHours}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs px-2 text-amber-900">
                      <Link href="/admin/chat">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        <span>Ping Station</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Live Employee Activity Trail Section */}
      <Card className="border-stone-200/80 shadow-xs bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-stone-50/50 border-b border-stone-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-800" />
                <span>Live Employee Activity Stream</span>
              </CardTitle>
              <CardDescription className="text-xs text-stone-500">
                Audited timeline of actions performed by kitchen staff, bakers, and billing.
              </CardDescription>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Auto-updating
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-stone-100">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-4 flex items-start justify-between gap-4 hover:bg-stone-50/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{act.staffAvatar}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">
                        {act.staffName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-mono">
                        {act.type}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 mt-1">{act.action}</p>
                    {act.orderNumber && (
                      <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 mt-1"
                      >
                        <span>Ticket: #{act.orderNumber}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>

                <span className="text-[11px] text-stone-400 whitespace-nowrap shrink-0">
                  {act.timestamp}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
