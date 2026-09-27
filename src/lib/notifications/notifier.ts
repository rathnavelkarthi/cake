// Kichees Admin Notification Engine
// Plays distinct sounds and shows browser push notifications for orders and chat messages.
// No external audio files required — tones are synthesized via Web Audio API.

export type NotificationType = "new_order" | "new_message" | "urgent_message";

// ─── Sound synthesis ────────────────────────────────────────────────────────

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
}

/** Plays a short two-tone "ding" for new orders */
function playOrderSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [
    { freq: 880, start: 0, duration: 0.12 },
    { freq: 1108.73, start: 0.14, duration: 0.18 },
  ];

  notes.forEach(({ freq, start, duration }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + start);
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration);
  });
}

/** Plays a single soft "pop" for chat messages */
function playMessageSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(660, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

/** Plays an urgent triple-beep for urgent chat flags */
function playUrgentSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  [0, 0.18, 0.36].forEach((start) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + 0.12);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + 0.13);
  });
}

// ─── Browser push notification ───────────────────────────────────────────────

async function requestPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function showBrowserNotification(title: string, body: string, tag: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      tag,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      silent: true, // We handle sound ourselves
    });
  } catch {
    // Notification API blocked or unavailable
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function initNotifications() {
  await requestPermission();
}

export function notifyNewOrder(orderNumber: string, customerName: string, total: number) {
  playOrderSound();
  showBrowserNotification(
    `New Order — ${orderNumber}`,
    `${customerName} · ₹${total.toLocaleString("en-IN")}`,
    `order-${orderNumber}`
  );
}

export function notifyNewMessage(
  senderName: string,
  channelName: string,
  preview: string,
  urgent = false
) {
  if (urgent) {
    playUrgentSound();
    showBrowserNotification(
      `URGENT — #${channelName}`,
      `${senderName}: ${preview.slice(0, 80)}`,
      `chat-urgent-${Date.now()}`
    );
  } else {
    playMessageSound();
    showBrowserNotification(
      `#${channelName}`,
      `${senderName}: ${preview.slice(0, 80)}`,
      `chat-${Date.now()}`
    );
  }
}
