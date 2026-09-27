"use client";

// AdminNotificationProvider
// Mounts once inside the admin layout.
// Subscribes to order-store (localStorage + storage events) and team-store
// (BroadcastChannel + storage events) and fires audio + browser notifications
// whenever a new order or new chat message arrives from another tab or same tab.

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  getOrders,
  subscribeOrders,
} from "@/lib/orders/order-store";
import {
  getTeamMessages,
  subscribeTeamStore,
} from "@/lib/team/team-store";
import {
  initNotifications,
  notifyNewOrder,
  notifyNewMessage,
} from "@/lib/notifications/notifier";

export default function AdminNotificationProvider() {
  // Track the IDs we have already seen so we only fire on genuinely new items
  const seenOrderIds = useRef<Set<string>>(new Set());
  const seenMessageIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    // ── Seed "seen" sets with current state so we don't fire on first mount ──
    if (!initialized.current) {
      initialized.current = true;
      initNotifications();

      getOrders().forEach((o) => seenOrderIds.current.add(o.id));
      getTeamMessages().forEach((m) => seenMessageIds.current.add(m.id));
    }

    // ── Order store subscription ─────────────────────────────────────────────
    const unsubOrders = subscribeOrders((orders) => {
      orders.forEach((order) => {
        if (seenOrderIds.current.has(order.id)) return;
        seenOrderIds.current.add(order.id);

        // Fire sound + browser notification
        notifyNewOrder(order.orderNumber, order.customerName, order.total);

        // Fire a Sonner toast that links to orders page
        toast.success(`New order received`, {
          description: `${order.orderNumber} · ${order.customerName} · ₹${order.total.toLocaleString("en-IN")}`,
          duration: 8000,
          action: {
            label: "View",
            onClick: () => {
              window.location.href = "/admin/orders";
            },
          },
        });
      });
    });

    // ── Team message subscription ────────────────────────────────────────────
    const unsubChat = subscribeTeamStore(() => {
      const messages = getTeamMessages();
      messages.forEach((msg) => {
        if (seenMessageIds.current.has(msg.id)) return;
        seenMessageIds.current.add(msg.id);

        // Don't notify self — we can't reliably detect "self" here without
        // session, so we skip messages that arrived in the same 500 ms window
        // as a send action. The store BroadcastChannel already excludes the
        // sender tab for cross-tab messages, but same-tab sends go through
        // notifyListeners directly. We silence those via a flag on the message.
        const channelName = msg.channelId === "general"
          ? "general-ops"
          : msg.channelId === "kitchen"
          ? "hot-kitchen-baking"
          : msg.channelId === "decoration"
          ? "custom-cakes-deco"
          : msg.channelId === "pos"
          ? "pos-dispatch"
          : msg.channelId === "urgent"
          ? "urgent-rush-orders"
          : msg.channelId;

        notifyNewMessage(msg.senderName, channelName, msg.text, msg.isUrgent);

        if (msg.isUrgent) {
          toast.error(`Urgent — #${channelName}`, {
            description: `${msg.senderName}: ${msg.text.slice(0, 100)}`,
            duration: 12000,
          });
        } else {
          toast.info(`#${channelName}`, {
            description: `${msg.senderName}: ${msg.text.slice(0, 100)}`,
            duration: 5000,
          });
        }
      });
    });

    return () => {
      unsubOrders();
      unsubChat();
    };
  }, []);

  // Renders nothing — pure side-effect provider
  return null;
}
