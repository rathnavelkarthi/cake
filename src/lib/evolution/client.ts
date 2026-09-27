// Evolution API integration for Kichee's Baked Delights
// Sends order confirmations, UPI payment QR codes, kitchen status alerts, and customer login OTPs.

export interface EvolutionSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export function formatWhatsAppNumber(phone: string): string {
  // Strip non-numeric characters
  let cleaned = phone.replace(/\D/g, "");
  // If 10 digits (Indian standard), prepend 91
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }
  // If starts with 0 and has 11 digits
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = `91${cleaned.slice(1)}`;
  }
  return cleaned;
}

export async function sendWhatsAppMessage(
  phone: string,
  text: string
): Promise<EvolutionSendResult> {
  const apiUrl =
    process.env.EVOLUTION_API_URL ||
    "https://evolution-evolution-api.tn0bwj.easypanel.host";
  const apiKey = process.env.EVOLUTION_API_KEY || "Desmond@123";
  const instance = process.env.EVOLUTION_INSTANCE || "Cake";

  const targetNumber = formatWhatsAppNumber(phone);

  try {
    const res = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number: targetNumber,
        text,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Evolution API sendText failed:", res.status, data);
      return { success: false, error: data?.response?.message || "Failed to send message" };
    }

    return {
      success: true,
      messageId: data?.key?.id || data?.messageId,
    };
  } catch (err: any) {
    console.error("Evolution API network error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function sendWhatsAppMedia(
  phone: string,
  mediaUrl: string,
  caption: string,
  fileName: string = "kichees-upi-qr.png"
): Promise<EvolutionSendResult> {
  const apiUrl =
    process.env.EVOLUTION_API_URL ||
    "https://evolution-evolution-api.tn0bwj.easypanel.host";
  const apiKey = process.env.EVOLUTION_API_KEY || "Desmond@123";
  const instance = process.env.EVOLUTION_INSTANCE || "Cake";

  const targetNumber = formatWhatsAppNumber(phone);

  try {
    const res = await fetch(`${apiUrl}/message/sendMedia/${instance}`, {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number: targetNumber,
        mediatype: "image",
        mimetype: "image/png",
        caption,
        media: mediaUrl,
        fileName,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Evolution API sendMedia failed:", res.status, data);
      return { success: false, error: data?.response?.message || "Failed to send media" };
    }

    return {
      success: true,
      messageId: data?.key?.id || data?.messageId,
    };
  } catch (err: any) {
    console.error("Evolution API media error:", err.message);
    return { success: false, error: err.message };
  }
}

export function generateUpiDetails(orderNumber: string, amount: number) {
  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "kichees@upi";
  const payeeName = process.env.NEXT_PUBLIC_UPI_NAME || "Kichees Baked Delights";
  
  // Standard UPI URI format
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${orderNumber}`)}`;

  // High-res QR code image URL for scanning
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    upiUri
  )}&format=png&color=451a03&bgcolor=faf7f2`;

  return { upiId, payeeName, upiUri, qrImageUrl };
}

export async function sendOrderConfirmationWhatsApp(order: {
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  total: number;
  fulfilmentType: "PICKUP" | "DELIVERY";
  branchName?: string;
  branchAddress?: string;
  deliveryAddress?: string;
  deliveryDistanceKm?: number;
  deliveryFee?: number;
  items: string[];
}) {
  const { upiId, payeeName, upiUri, qrImageUrl } = generateUpiDetails(
    order.orderNumber,
    order.total
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kicheesbakeddelights.in";

  const fulfillmentDetails =
    order.fulfilmentType === "PICKUP"
      ? `📍 *Self-Collection / Counter Pickup:*\n🏢 ${order.branchName || "Kichee's Bakery"}\n📌 ${
          order.branchAddress || "Harrisons Hotel / Nungambakkam, Chennai"
        }`
      : `🚚 *Home Delivery across Chennai:*\n📌 Address: ${order.deliveryAddress || "As registered"}\n📏 Est. Distance: ${
          order.deliveryDistanceKm || "N/A"
        } km\n🛵 Delivery Charge: ${order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}`;

  const itemsList = order.items.map((item, idx) => `  ${idx + 1}. ${item}`).join("\n");

  const messageText = `🍰 *ORDER RECEIVED - KICHEE'S BAKED DELIGHTS*

Dear *${order.customerName}*, thank you for choosing Kichee's! We have logged your order and reserved kitchen capacity.

📋 *Order Details:*
• *Order Number:* ${order.orderNumber}
• *Total Payable:* ₹${order.total.toLocaleString("en-IN")}

🧁 *Items:*
${itemsList}

${fulfillmentDetails}

━━━━━━━━━━━━━━━━━━━━
💳 *PAYMENT INSTRUCTIONS (UPI)*
• *UPI ID:* \`${upiId}\`
• *Payee:* ${payeeName}
• *Amount:* ₹${order.total.toLocaleString("en-IN")}
• *Direct UPI Link:* ${upiUri}

📸 *NEXT STEP:*
Once payment is completed, *please reply to this message with your payment screenshot*!
Our manager will verify the transaction and immediately push your order to our chefs for baking.

Track your orders anytime:
👉 ${siteUrl}/orders
━━━━━━━━━━━━━━━━━━━━`;

  // Send ONE complete confirmation message (with QR image if supported, otherwise text)
  if (messageText.length <= 1024) {
    try {
      const mediaResult = await sendWhatsAppMedia(
        order.customerMobile,
        qrImageUrl,
        messageText,
        `order-${order.orderNumber}-upi.png`
      );
      if (mediaResult.success) {
        return { mediaResult, textResult: mediaResult };
      }
    } catch (err) {
      console.warn("Media WhatsApp send failed, falling back to text:", err);
    }
  }

  // Fallback or long message: send single text invoice with direct UPI link
  const textResult = await sendWhatsAppMessage(order.customerMobile, messageText);
  return { textResult };
}

export async function sendPaymentConfirmedWhatsApp(order: {
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  assignedChef?: string;
  fulfilmentType?: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kicheesbakeddelights.in";

  const message = `✨ *PAYMENT CONFIRMED & PUSHED TO KITCHEN!*

Dear *${order.customerName}*, our manager has verified your UPI payment for Order *${order.orderNumber}*!

👩‍🍳 *Kitchen Update:*
Your order has been assigned to our baking station (${order.assignedChef || "Head Chef Selva & Confectionery Chef Anbu"}). The oven is preheating and artisanal decoration will begin promptly!

You can check real-time oven & decorating progress on your customer portal:
👉 ${siteUrl}/orders

Thank you for trusting Kichee's Baked Delights! ❤️`;

  return await sendWhatsAppMessage(order.customerMobile, message);
}

export async function sendCustomerOtpWhatsApp(phone: string, otp: string) {
  const message = `🔐 *Kichee's Baked Delights Login Code*

Your verification code is: *${otp}*

Enter this code on the website to view your past orders, active bakes, and tracking details.
This code will expire in 10 minutes.`;

  return await sendWhatsAppMessage(phone, message);
}

export async function sendKitchenStatusUpdateWhatsApp(order: {
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  stage: string;
  assignedChef?: string;
  fulfilmentType?: string;
  branchName?: string;
  deliveryAddress?: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kicheesbakeddelights.in";
  let message = "";

  switch (order.stage) {
    case "IN_OVEN":
      message = `🔥 *IN THE OVEN - KICHEE'S BAKERY*

Hi *${order.customerName}*! Your order (*${order.orderNumber}*) is now inside the oven at our baking counter. 

Chef ${order.assignedChef?.includes("Selva") ? "Selva" : "Selva & team"} is baking it to golden perfection. Once rested and cooled, it heads straight to the artisan decorating table!

Track live bake status:
👉 ${siteUrl}/orders`;
      break;

    case "COOLING":
      message = `🌿 *FRESH OUT OF THE OVEN*

Hi *${order.customerName}*, your bake just finished in the oven! We're letting it rest on our marble cooling counter so the sponge sets with a tender crumb before delicate piping begins.`;
      break;

    case "DECORATING":
      message = `🎨 *DECORATING STATION - HANDCRAFTED FINISH*

Hi *${order.customerName}*! Your cake has moved to the decoration counter with Chef ${order.assignedChef?.includes("Anbu") ? "Anbu" : "Anbu & decorators"}.

We're piping the fresh frosting layers and handcrafted design details right now. It's looking beautiful! ✨

Track your bake:
👉 ${siteUrl}/orders`;
      break;

    case "READY":
    case "READY_FOR_PICKUP":
      if (order.fulfilmentType === "DELIVERY") {
        message = `✨ *QUALITY CHECK PASSED & PACKED!*

Dear *${order.customerName}*, your order (*${order.orderNumber}*) has passed chef inspection and is carefully packed in our temperature-controlled box! 

Our delivery driver is collecting it for dispatch. 🚗💨

Live tracker:
👉 ${siteUrl}/orders`;
      } else {
        message = `🎂 *READY FOR PICKUP AT THE COUNTER!*

Dear *${order.customerName}*, your cake (*${order.orderNumber}*) is freshly packaged and waiting for you!

📍 *Collection Point:* ${order.branchName || "Kichee's Bakery (Harrisons Hotel, Nungambakkam)"}
⏰ Feel free to pick it up anytime today. We can't wait to hand it over!

Live details:
👉 ${siteUrl}/orders`;
      }
      break;

    case "OUT_FOR_DELIVERY":
      message = `🛵 *OUT FOR DELIVERY - ON THE WAY!*

Hi *${order.customerName}*, your cake is in transit!

📌 *Delivery to:* ${order.deliveryAddress || "Your registered address"}
Please keep your phone handy for our driver. Handle with love and refrigerate upon arrival! 🍰`;
      break;

    case "COMPLETED":
      message = `🎉 *ENJOY YOUR CELEBRATION!*

Dear *${order.customerName}*, your order (*${order.orderNumber}*) is marked completed.

From our ovens to your celebrations, thank you for trusting Kichee's Baked Delights. We hope every slice brings joy! 

Tag us in your cake-cutting photos or reply with your feedback right here ❤️`;
      break;

    default:
      return null;
  }

  return await sendWhatsAppMessage(order.customerMobile, message);
}

