"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  MessageSquare,
  Send,
  Hash,
  Flame,
  Cake,
  Package,
  AlertTriangle,
  Users,
  Shield,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  ChevronRight,
  Pin,
  ExternalLink,
} from "lucide-react";
import {
  CHANNELS,
  TeamMessage,
  StaffMember,
  getTeamMessages,
  sendTeamMessage,
  getStaffMembers,
  subscribeTeamStore,
} from "@/lib/team/team-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminTeamChatPage() {
  const { data: session } = useSession();
  const [activeChannelId, setActiveChannelId] = useState("general");
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [inputText, setInputText] = useState("");
  const [taggedOrder, setTaggedOrder] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const reloadData = () => {
    setMessages(getTeamMessages(activeChannelId));
    setStaffList(getStaffMembers());
  };

  useEffect(() => {
    reloadData();
    const unsubscribe = subscribeTeamStore(() => {
      reloadData();
    });
    return () => unsubscribe();
  }, [activeChannelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentChannel = CHANNELS.find((c) => c.id === activeChannelId) || CHANNELS[0];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const senderName = session?.user?.name || "Staff Member";
    const senderEmail = session?.user?.email || "staff@kicheesbakeddelights.in";
    const role = (session?.user as any)?.role || "HEAD_CHEF";

    let senderRole = "Bakery Staff";
    let senderAvatar = "👨‍🍳";

    if (role === "SUPER_ADMIN" || senderEmail.includes("admin")) {
      senderRole = "Super Admin";
      senderAvatar = "🛡️";
    } else if (senderEmail.includes("confectionery")) {
      senderRole = "Confectionery Head Chef";
      senderAvatar = "🎂";
    } else if (senderEmail.includes("bakery")) {
      senderRole = "Bakery Head Chef";
      senderAvatar = "👨‍🍳";
    } else if (senderEmail.includes("cafe") || role === "BILLING_STAFF") {
      senderRole = "Kichees Cafe Staff";
      senderAvatar = "☕";
    }

    sendTeamMessage({
      channelId: activeChannelId,
      senderName,
      senderRole,
      senderEmail,
      senderAvatar,
      text: inputText.trim(),
      taggedOrderNumber: taggedOrder.trim() || undefined,
      isUrgent,
    });

    setInputText("");
    setTaggedOrder("");
    setIsUrgent(false);
  };

  const QUICK_ANNOUNCEMENTS = [
    "🔥 Sponge load is ready for cooling rack",
    "🎂 Bespoke piping cream matches lookbook",
    "📦 Order boxed and ready at pickup counter",
    "🛵 Express delivery driver dispatched",
    "⚠️ Ganache 54% Callebaut running low in storage",
  ];

  const filteredMessages = messages.filter((m) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      m.text.toLowerCase().includes(q) ||
      m.senderName.toLowerCase().includes(q) ||
      m.taggedOrderNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Navigation Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-900 text-amber-50">
              <MessageSquare className="w-5 h-5" />
            </span>
            <span>Bakery Operations Team Chat</span>
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Real-time internal communication between Hot Kitchen, Confectionery, Billing Counter & Super Admin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="h-9">
            <Link href="/admin/staff">
              <Users className="w-4 h-4 mr-1.5 text-stone-600" />
              <span>Staff Workload Hub</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="h-9 bg-amber-900 hover:bg-amber-950 text-white">
            <Link href="/admin/kitchen">
              <Flame className="w-4 h-4 mr-1.5" />
              <span>Kitchen KDS</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-230px)] min-h-[580px]">
        {/* Left Column: Channels & Online Staff */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-stone-100 bg-stone-50/70">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Bakery Channels
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                5 Active
              </span>
            </div>
          </div>

          {/* Channel List */}
          <div className="p-2.5 space-y-1 overflow-y-auto">
            {CHANNELS.map((ch) => {
              const active = ch.id === activeChannelId;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                    active
                      ? "bg-amber-900 text-white shadow-xs"
                      : "text-stone-700 hover:bg-stone-100/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">{ch.icon}</span>
                    <div className="truncate">
                      <p className="text-xs font-bold leading-tight truncate">
                        #{ch.name}
                      </p>
                      <p
                        className={`text-[10px] truncate ${
                          active ? "text-amber-200" : "text-stone-400"
                        }`}
                      >
                        {ch.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 ${
                      active ? "text-amber-200" : "text-stone-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Active Shift Members Divider */}
          <div className="mt-auto border-t border-stone-100 p-3.5 bg-stone-50/50">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-stone-500" /> On-Duty Shift
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {staffList.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-white"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm">{s.avatar}</span>
                    <div className="truncate">
                      <p className="text-[11px] font-bold text-stone-800 truncate">
                        {s.name}
                      </p>
                      <p className="text-[9px] text-stone-400 truncate">
                        {s.roleTitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium shrink-0">
                    On Duty
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Active Conversation */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex flex-col overflow-hidden">
          {/* Channel Header Bar */}
          <div className="p-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{currentChannel.icon}</span>
              <div>
                <h2 className="text-sm font-bold text-stone-900 leading-tight">
                  #{currentChannel.name}
                </h2>
                <p className="text-[11px] text-stone-500">
                  {currentChannel.description}
                </p>
              </div>
            </div>

            {/* Quick Search in Channel */}
            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-stone-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-800"
              />
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#faf7f2]/60">
            {filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                <MessageSquare className="w-10 h-10 text-stone-300 mb-2 stroke-1" />
                <p className="text-sm font-semibold text-stone-600">
                  No messages found in #{currentChannel.name}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Type a message below to broadcast an operational update to the team.
                </p>
              </div>
            ) : (
              filteredMessages.map((m) => {
                const isMe =
                  session?.user?.email &&
                  m.senderEmail.toLowerCase() === session.user.email.toLowerCase();

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-sm">{m.senderAvatar}</span>
                      <span className="text-xs font-bold text-stone-800">
                        {isMe ? "You" : m.senderName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200/70 text-stone-700 font-mono">
                        {m.senderRole}
                      </span>
                      <span className="text-[10px] text-stone-400">{m.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                        m.isUrgent
                          ? "bg-red-50 text-red-950 border border-red-200 font-medium"
                          : isMe
                          ? "bg-amber-900 text-white rounded-tr-xs"
                          : "bg-white text-stone-900 border border-stone-200/90 rounded-tl-xs"
                      }`}
                    >
                      {m.isUrgent && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-700 uppercase mb-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Urgent Shift Priority</span>
                        </div>
                      )}

                      <p className="leading-relaxed whitespace-pre-wrap text-sm">
                        {m.text}
                      </p>

                      {m.taggedOrderNumber && (
                        <div className="mt-2 inline-block">
                          <Link
                            href="/admin/orders"
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                              isMe
                                ? "bg-amber-800 text-amber-100 hover:bg-amber-700"
                                : "bg-stone-100 text-stone-800 hover:bg-stone-200"
                            }`}
                          >
                            <span>📦 Linked Order:</span>
                            <span className="underline font-mono">
                              {m.taggedOrderNumber}
                            </span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Announcement Chips */}
          <div className="p-2.5 bg-stone-100/70 border-t border-stone-200 flex gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_ANNOUNCEMENTS.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInputText(q)}
                className="text-[11px] font-medium text-stone-600 bg-white hover:bg-amber-50 hover:text-amber-950 px-2.5 py-1 rounded-full border border-stone-200 whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-stone-200 flex flex-col gap-2.5"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Post update to #${currentChannel.name}...`}
                className="flex-1 text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/80 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-800"
              />
              <Button
                type="submit"
                disabled={!inputText.trim()}
                className="h-10 px-4 bg-amber-900 hover:bg-amber-950 text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 rounded-xl shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 px-1">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span className={isUrgent ? "text-red-600 font-bold" : ""}>
                    🚨 Mark as Urgent Shift Notice
                  </span>
                </label>

                <div className="flex items-center gap-1.5">
                  <span className="text-stone-400">Tag Order:</span>
                  <input
                    type="text"
                    value={taggedOrder}
                    onChange={(e) => setTaggedOrder(e.target.value)}
                    placeholder="e.g. KCH-2026-0901"
                    className="w-36 px-2 py-0.5 text-xs rounded border border-stone-200 bg-stone-50 focus:bg-white uppercase font-mono"
                  />
                </div>
              </div>

              <span className="text-[11px] text-stone-400">
                Sending as: <strong>{session?.user?.name || "Staff"}</strong>
              </span>
            </div>
          </form>
        </div>

        {/* Right Column: Station Overview & Operational Status */}
        <div className="lg:col-span-3 space-y-4">
          {/* Station Operating Status */}
          <Card className="border-stone-200/80 shadow-xs p-4 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Shift Operations</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-amber-950 flex items-center gap-1">
                    <span>🔥</span> Deck Ovens 1 & 2
                  </span>
                  <span className="text-[10px] font-bold text-amber-800">175°C</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Head Chef Selva aerating chocolate sponges. On schedule.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-200/60">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-purple-950 flex items-center gap-1">
                    <span>🎂</span> Patisserie Turntables
                  </span>
                  <span className="text-[10px] font-bold text-purple-800">3 Active</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Chef Anbu finishing custom Lambeth piping for afternoon slot.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-emerald-950 flex items-center gap-1">
                    <span>☕</span> Counter & POS
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800">Active</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Express pickup ready. Walk-in queue clear.
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Guidelines Card */}
          <Card className="border-stone-200/80 shadow-xs p-4 bg-white text-xs">
            <h3 className="font-bold text-stone-800 mb-2 flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5 text-amber-700" />
              <span>Kitchen Protocol</span>
            </h3>
            <ul className="space-y-1.5 text-stone-600 text-[11px] list-disc list-inside">
              <li>Tag order numbers so stations can jump to the recipe or ticket.</li>
              <li>Use 🚨 Urgent flag only for time-critical orders under 30 mins.</li>
              <li>Mark sponge cooling times in #hot-kitchen-baking.</li>
              <li>Confirm customer pickups in #pos-dispatch before dispatch.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
