export type AnalyticsEvent =
  | { name: "page_view"; path: string }
  | { name: "view_product"; productId: string; productName: string; price: number }
  | { name: "select_category"; categoryId: string }
  | { name: "add_to_cart"; productId: string; variantId: string; productName: string; price: number; quantity: number }
  | { name: "remove_from_cart"; cartItemId: string; itemName: string }
  | { name: "view_cart"; totalItems: number; subtotal: number }
  | { name: "begin_checkout"; totalItems: number; total: number; fulfilment: "delivery" | "pickup" }
  | { name: "select_delivery_method"; method: "delivery" | "pickup" }
  | { name: "click_whatsapp"; source: string; context?: string }
  | { name: "click_phone"; source: string }
  | { name: "click_directions"; source: string }
  | { name: "begin_custom_cake" }
  | { name: "submit_custom_cake"; flavour: string; weight: string; date: string }
  | { name: "purchase"; orderId: string; total: number };

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  try {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Kichees Analytics] 📊 ${event.name}`, event);
    }

    const win = window as unknown as { dataLayer?: Record<string, unknown>[] };
    if (Array.isArray(win.dataLayer)) {
      win.dataLayer.push({
        event: event.name,
        ...event,
      });
    }
  } catch (error) {
    console.warn("Analytics error:", error);
  }
}
