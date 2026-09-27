"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  MessageSquare,
  X,
  Send,
  Maximize2,
  AlertCircle,
  Hash,
  Flame,
  Cake,
  Package,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import {
  CHANNELS,
  TeamMessage,
  getTeamMessages,
  sendTeamMessage,
  subscribeTeamStore,
} from "@/lib/team/team-store";

export function InternalTeamChatWidget() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState("general");
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [taggedOrder, setTaggedOrder] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync messages
  const reloadMessages = () => {
    const list = getTeamMessages(activeChannelId);
    setMessages(list);
  };

  useEffect(() => {
    reloadMessages();
    const unsubscribe = subscribeTeamStore(() => {
      reloadMessages();
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    });
    return () => unsubscribe();
  }, [activeChannelId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages]);

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

  const QUICK_REPLIES = [
    "🔥 Sponge out of oven & chilling",
    "🎂 Custom piping completed",
    "📦 Box packed for pickup at counter",
    "🛵 Delivery driver has arrived",
    "⚠️ Ganache running low",
  ];

  const getChannelIcon = (id: string) => {
    switch (id) {
      case "kitchen":
        return <Flame className="w-3.5 h-3.5 text-amber-500" />;
      case "confectionery":
        return <Cake className="w-3.5 h-3.5 text-pink-500" />;
      case "pos-dispatch":
        return <Package className="w-3.5 h-3.5 text-emerald-500" />;
      case "urgent":
        return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <Hash className="w-3.5 h-3.5 text-stone-500" />;
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-3 bg-amber-950 text-amber-50 rounded-full shadow-2xl hover:bg-stone-900 border border-amber-800/40 transition-all hover:scale-105 group"
          title="Open Bakery Internal Team Chat"
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-amber-400 group-hover:rotate-6 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-amber-950 animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-xs font-bold tracking-wide">Team Comms</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-950" />
        </button>
      )}

      {/* Floating Chat Dock Modal */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] sm:w-[410px] h-[550px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-stone-900 text-white p-3.5 flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-900/80 text-amber-300 text-sm">
                💬
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-stone-100">Bakery Internal Comms</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-stone-400 font-mono">
                  #{currentChannel.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/admin/chat"
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                title="Open full page chat"
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                title="Close dock"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Channel Selector Bar */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-stone-50 border-b border-stone-200 overflow-x-auto no-scrollbar text-xs">
            {CHANNELS.map((ch) => {
              const active = ch.id === activeChannelId;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full whitespace-nowrap text-[11px] font-semibold transition-all ${
                    active
                      ? "bg-amber-900 text-amber-50 shadow-xs"
                      : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                  }`}
                >
                  <span>{ch.icon}</span>
                  <span>{ch.name}</span>
                </button>
              );
            })}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#fdfbf7]">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-stone-400 text-xs">
                <p>No messages yet in #{currentChannel.name}.</p>
                <p className="text-[10px] mt-1">Start the conversation with your shift team.</p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe =
                  session?.user?.email &&
                  m.senderEmail.toLowerCase() === session.user.email.toLowerCase();

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-xs">{m.senderAvatar}</span>
                      <span className="text-[11px] font-bold text-stone-700">
                        {isMe ? "You" : m.senderName}
                      </span>
                      <span className="text-[9px] px-1 py-0.2 rounded-sm bg-stone-200 text-stone-600 font-mono">
                        {m.senderRole}
                      </span>
                      <span className="text-[9px] text-stone-400">{m.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                        m.isUrgent
                          ? "bg-red-50 text-red-950 border border-red-200 font-medium"
                          : isMe
                          ? "bg-amber-900 text-white rounded-tr-xs"
                          : "bg-white text-stone-800 border border-stone-200/80 rounded-tl-xs"
                      }`}
                    >
                      {m.isUrgent && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-red-700 uppercase mb-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Urgent Shift Notice</span>
                        </div>
                      )}

                      <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>

                      {m.taggedOrderNumber && (
                        <div className="mt-1.5 inline-block">
                          <Link
                            href="/admin/orders"
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isMe
                                ? "bg-amber-800/80 text-amber-200 hover:bg-amber-800"
                                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                            }`}
                          >
                            <span>📦 Order:</span>
                            <span className="underline">{m.taggedOrderNumber}</span>
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

          {/* Quick Replies Bar */}
          <div className="px-3 py-1.5 bg-stone-100/70 border-t border-stone-200 flex gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_REPLIES.map((reply, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setInputText(reply);
                }}
                className="text-[10px] font-medium text-stone-600 bg-white hover:bg-amber-50 hover:text-amber-900 px-2 py-0.5 rounded-full border border-stone-200 whitespace-nowrap transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input & Sender Controls */}
          <form
            onSubmit={handleSend}
            className="p-2.5 bg-white border-t border-stone-200 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message #${currentChannel.name}...`}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-800"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="h-8 px-3 rounded-xl bg-amber-900 text-white text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-40 hover:bg-amber-950 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-stone-500 px-1">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="accent-red-600 rounded-sm"
                  />
                  <span className={isUrgent ? "text-red-600 font-bold" : ""}>
                    Urgent Alert
                  </span>
                </label>

                <div className="flex items-center gap-1">
                  <span>Tag:</span>
                  <input
                    type="text"
                    value={taggedOrder}
                    onChange={(e) => setTaggedOrder(e.target.value)}
                    placeholder="#ORD-..."
                    className="w-20 px-1.5 py-0.5 text-[10px] rounded border border-stone-200 bg-stone-50 uppercase"
                  />
                </div>
              </div>

              <span className="text-[10px] text-stone-400">
                Logged in as: <strong>{session?.user?.name || "Staff"}</strong>
              </span>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
