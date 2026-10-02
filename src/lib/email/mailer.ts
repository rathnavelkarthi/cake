import nodemailer from "nodemailer";
import { BUSINESS_CONFIG } from "@/lib/config/business";

// Create reusable transporter
export function getMailTransporter() {
  const host = process.env.SMTP_HOST || "smtp.hostinger.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER || "billing@kicheesbakeddelights.in";
  const pass = process.env.SMTP_PASS || "Lams@12345";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    // Pool connections to avoid handshake delays
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
}

export async function sendEmail(options: SendMailOptions) {
  try {
    const transporter = getMailTransporter();
    const fromName = process.env.SMTP_FROM_NAME || "Kichee's Baked Delights";
    const fromEmail = process.env.SMTP_FROM_EMAIL || "billing@kicheesbakeddelights.in";

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>?/gm, ""),
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(", ") : options.cc) : undefined,
      bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(", ") : options.bcc) : undefined,
      replyTo: options.replyTo || fromEmail,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: %s to %s", info.messageId, mailOptions.to);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Failed to send email via SMTP:", error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}

// -------------------------------------------------------------
// Base HTML Email Wrapper for Brand Consistency
// -------------------------------------------------------------
function wrapInEmailLayout(contentHtml: string, title = "Kichee's Baked Delights"): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f7f3ee; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    .container { max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #3d2314 0%, #20120a 100%); padding: 32px 24px; text-align: center; }
    .logo-badge { display: inline-block; background-color: #fef3c7; color: #78350f; font-weight: 800; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 8px; }
    .brand-title { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: 0.5px; }
    .brand-sub { color: #d6c7be; font-size: 13px; margin-top: 4px; }
    .body-content { padding: 32px 28px; color: #292524; font-size: 14px; line-height: 1.6; }
    .footer { background-color: #fdfbf7; padding: 24px 28px; text-align: center; border-top: 1px solid #ebd9c8; color: #78716c; font-size: 12px; line-height: 1.5; }
    .divider { height: 1px; background-color: #f0e6dc; margin: 24px 0; }
    .btn { display: inline-block; background-color: #78350f; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; margin: 16px 0; }
    .card { background-color: #fbf8f5; border: 1px solid #ebd9c8; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-success { background-color: #dcfce7; color: #15803d; }
    .badge-amber { background-color: #fef3c7; color: #b45309; }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f7f3ee;">
  <center>
    <div class="container" style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e7dbce;">
      <!-- Header -->
      <div class="header" style="background: #3d2314; padding: 28px 20px; text-align: center;">
        <div class="logo-badge" style="background-color: #fef3c7; color: #78350f; font-weight: 800; font-size: 11px; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 6px;">ARTISANAL PATISSERIE</div>
        <h1 class="brand-title" style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0;">Kichee's Baked Delights</h1>
        <p class="brand-sub" style="color: #d6c7be; font-size: 12px; margin: 4px 0 0 0;">Nungambakkam High Road, Chennai · Pure Elegance</p>
      </div>

      <!-- Main Body -->
      <div class="body-content" style="padding: 28px 24px; text-align: left; color: #292524; font-size: 14px; line-height: 1.6;">
        ${contentHtml}
      </div>

      <!-- Footer -->
      <div class="footer" style="background-color: #faf6f0; padding: 20px 24px; text-align: center; border-top: 1px solid #eee4da; color: #78716c; font-size: 11.5px;">
        <p style="margin: 0 0 6px 0; font-weight: 600; color: #44403c;">Kichee's Baked Delights Pvt. Ltd.</p>
        <p style="margin: 0 0 6px 0;">No. 18/4, Wheatcrofts Road, Nungambakkam, Chennai - 600034</p>
        <p style="margin: 0 0 8px 0;"><strong>GSTIN:</strong> 33AAECP8821M1Z4 · <strong>FSSAI:</strong> 12423002001550 · <strong>Tel:</strong> +91 98400 12345</p>
        <p style="margin: 0; color: #a8a29e;">This email was sent from the official billing system (billing@kicheesbakeddelights.in).</p>
      </div>
    </div>
  </center>
</body>
</html>`;
}

// -------------------------------------------------------------
// 1. Customer Order Confirmation & Receipt Email
// -------------------------------------------------------------
export function generateOrderConfirmationEmail(order: {
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  items: Array<{ name: string; quantity: number; price?: number; variant?: string; isEggless?: boolean }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  fulfilmentType: "PICKUP" | "DELIVERY" | string;
  deliveryAddress?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  paymentMethod?: string;
}): { subject: string; html: string } {
  const isDelivery = order.fulfilmentType === "DELIVERY";

  const itemsRows = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f0e6dc;">
        <td style="padding: 12px 0; vertical-align: top;">
          <strong style="color: #382013; font-size: 14px;">${item.name}</strong>
          ${item.variant ? `<div style="font-size: 12px; color: #78716c;">Variant: ${item.variant}</div>` : ""}
          <div style="font-size: 11px; color: #15803d; font-weight: 600;">${item.isEggless !== false ? "🌱 100% Pure Eggless" : "Contains Egg"}</div>
        </td>
        <td style="padding: 12px 8px; text-align: center; vertical-align: top; font-weight: 700; color: #44403c;">${item.quantity}</td>
        <td style="padding: 12px 0; text-align: right; vertical-align: top; font-weight: 700; color: #382013;">
          ₹${((item.price || 0) * item.quantity).toLocaleString("en-IN")}
        </td>
      </tr>
    `
    )
    .join("");

  const content = `
    <div style="margin-bottom: 20px;">
      <span style="background-color: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px; text-transform: uppercase;">
        Order Confirmed
      </span>
      <h2 style="font-size: 20px; font-weight: 700; color: #292524; margin: 10px 0 4px 0;">Thank you for your order, ${order.customerName}!</h2>
      <p style="margin: 0; color: #78716c; font-size: 13px;">Order Number: <strong style="color: #78350f;">#${order.orderNumber}</strong></p>
    </div>

    <p>Our pastry chefs have received your order and are preparing to handcraft your baked delicacies with the finest ingredients.</p>

    <!-- Fulfilment Card -->
    <div style="background-color: #faf6f0; border: 1px solid #ebd9c8; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <h4 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; color: #78350f; letter-spacing: 0.5px;">
        ${isDelivery ? "🚚 Doorstep Chilled Delivery" : "🏬 Bakery Counter Pickup"}
      </h4>
      <p style="margin: 0 0 4px 0; font-size: 13px;">
        <strong>Recipient:</strong> ${order.customerName} (${order.customerMobile})
      </p>
      ${
        isDelivery
          ? `<p style="margin: 0 0 4px 0; font-size: 13px;"><strong>Delivery Destination:</strong> ${order.deliveryAddress || "Nungambakkam & Central Chennai"}</p>`
          : `<p style="margin: 0 0 4px 0; font-size: 13px;"><strong>Pickup Location:</strong> Central Kitchen, Wheatcrofts Rd, Nungambakkam</p>`
      }
      ${order.deliveryDate ? `<p style="margin: 0; font-size: 13px;"><strong>Scheduled Time:</strong> ${order.deliveryDate} ${order.deliveryTime ? `(${order.deliveryTime})` : ""}</p>` : ""}
    </div>

    <!-- Items Table -->
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="border-bottom: 2px solid #ebd9c8; color: #78716c; font-size: 12px; text-transform: uppercase;">
          <th style="text-align: left; padding-bottom: 8px;">Item Details</th>
          <th style="text-align: center; padding-bottom: 8px; width: 60px;">Qty</th>
          <th style="text-align: right; padding-bottom: 8px; width: 90px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding-top: 14px; text-align: right; color: #78716c; font-size: 13px;">Subtotal:</td>
          <td style="padding-top: 14px; text-align: right; font-weight: 600; color: #44403c;">₹${order.subtotal.toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 4px 0; text-align: right; color: #78716c; font-size: 13px;">Delivery Fee:</td>
          <td style="padding: 4px 0; text-align: right; font-weight: 600; color: ${order.deliveryFee === 0 ? "#15803d" : "#44403c"};">
            ${order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
          </td>
        </tr>
        <tr style="border-top: 2px solid #ebd9c8;">
          <td colspan="2" style="padding: 12px 0; text-align: right; font-weight: 800; font-size: 16px; color: #292524;">Total Paid:</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 800; font-size: 16px; color: #78350f;">₹${order.total.toLocaleString("en-IN")}</td>
        </tr>
      </tfoot>
    </table>

    <div style="text-align: center; margin: 24px 0 10px 0;">
      <a href="https://kicheesbakeddelights.in/account/orders" style="display: inline-block; background-color: #3d2314; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 13px; padding: 12px 24px; border-radius: 6px;">
        Track Your Order Status
      </a>
    </div>

    <p style="font-size: 12px; color: #a8a29e; text-align: center; margin-top: 16px;">
      Need adjustments or have special baking instructions? WhatsApp us directly at +91 98400 12345 with your order ID #${order.orderNumber}.
    </p>
  `;

  return {
    subject: `Order Confirmation #${order.orderNumber} - Kichee's Baked Delights`,
    html: wrapInEmailLayout(content, `Order #${order.orderNumber}`),
  };
}

// -------------------------------------------------------------
// 2. Owner New Order Alert Notification Email
// -------------------------------------------------------------
export function generateOwnerOrderAlertEmail(order: {
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  items: Array<{ name: string; quantity: number; price?: number }>;
  total: number;
  fulfilmentType: string;
  deliveryAddress?: string;
  paymentMethod?: string;
}): { subject: string; html: string } {
  const content = `
    <div style="background-color: #fef3c7; border-left: 4px solid #b45309; padding: 14px 16px; margin-bottom: 20px;">
      <strong style="color: #92400e; font-size: 15px;">🔔 New Customer Order Received!</strong>
      <div style="font-size: 13px; color: #78350f; margin-top: 4px;">A new purchase has just been placed and requires kitchen / counter action.</div>
    </div>

    <div style="background-color: #faf6f0; border: 1px solid #ebd9c8; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <table style="width: 100%; font-size: 13px;">
        <tr><td style="padding: 4px 0; color: #78716c; width: 140px;"><strong>Order ID:</strong></td><td><strong>#${order.orderNumber}</strong></td></tr>
        <tr><td style="padding: 4px 0; color: #78716c;"><strong>Customer:</strong></td><td>${order.customerName}</td></tr>
        <tr><td style="padding: 4px 0; color: #78716c;"><strong>Contact Mobile:</strong></td><td>${order.customerMobile}</td></tr>
        <tr><td style="padding: 4px 0; color: #78716c;"><strong>Customer Email:</strong></td><td>${order.customerEmail || "Not provided"}</td></tr>
        <tr><td style="padding: 4px 0; color: #78716c;"><strong>Total Value:</strong></td><td><strong style="color: #15803d; font-size: 15px;">₹${order.total.toLocaleString("en-IN")}</strong></td></tr>
        <tr><td style="padding: 4px 0; color: #78716c;"><strong>Fulfilment:</strong></td><td>${order.fulfilmentType}</td></tr>
        ${order.deliveryAddress ? `<tr><td style="padding: 4px 0; color: #78716c;"><strong>Address:</strong></td><td>${order.deliveryAddress}</td></tr>` : ""}
      </table>
    </div>

    <h4 style="margin: 16px 0 8px 0; font-size: 13px; text-transform: uppercase; color: #78350f;">Ordered Items:</h4>
    <ul style="padding-left: 20px; margin: 0 0 20px 0; font-size: 13px;">
      ${order.items.map((it) => `<li style="margin-bottom: 4px;"><strong>${it.quantity}x</strong> ${it.name} ${it.price ? `(₹${it.price * it.quantity})` : ""}</li>`).join("")}
    </ul>

    <div style="text-align: center; margin: 20px 0;">
      <a href="https://kicheesbakeddelights.in/admin/kitchen" style="display: inline-block; background-color: #78350f; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 13px; padding: 10px 20px; border-radius: 6px; margin-right: 8px;">
        Open Kitchen KDS
      </a>
      <a href="https://kicheesbakeddelights.in/admin/orders" style="display: inline-block; background-color: #3d2314; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 13px; padding: 10px 20px; border-radius: 6px;">
        Manage in Admin Orders
      </a>
    </div>
  `;

  return {
    subject: `🚨 [NEW ORDER] #${order.orderNumber} - ₹${order.total.toLocaleString("en-IN")} from ${order.customerName}`,
    html: wrapInEmailLayout(content, `New Order Alert #${order.orderNumber}`),
  };
}

// -------------------------------------------------------------
// 3. POS Billing Invoice Email (For Counter Sales)
// -------------------------------------------------------------
export function generateBillingInvoiceEmail(invoice: {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerMobile: string;
  paymentMethod: string;
  items: Array<{ name: string; quantity: number; price: number; isEggless?: boolean; notes?: string }>;
  subtotal: number;
  tax: number;
  gstRate: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
}): { subject: string; html: string } {
  const itemRows = invoice.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f0e6dc;">
        <td style="padding: 10px 0; vertical-align: top;">
          <strong style="color: #292524; font-size: 13px;">${item.name}</strong>
          ${item.notes ? `<div style="font-size: 11px; color: #78716c; font-style: italic;">* ${item.notes}</div>` : ""}
          <div style="font-size: 11px; color: #15803d;">${item.isEggless !== false ? "Veg / Eggless" : "Contains Egg"}</div>
        </td>
        <td style="padding: 10px 8px; text-align: center; vertical-align: top; font-weight: 700;">${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; vertical-align: top;">₹${item.price}</td>
        <td style="padding: 10px 0; text-align: right; vertical-align: top; font-weight: 700; color: #382013;">
          ₹${(item.price * item.quantity).toLocaleString("en-IN")}
        </td>
      </tr>
    `
    )
    .join("");

  const content = `
    <div style="margin-bottom: 20px;">
      <span style="background-color: #e0e7ff; color: #3730a3; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px; text-transform: uppercase;">
        Tax Invoice / Cash Receipt
      </span>
      <h2 style="font-size: 20px; font-weight: 700; color: #292524; margin: 10px 0 4px 0;">Tax Invoice: ${invoice.invoiceNumber}</h2>
      <p style="margin: 0; color: #78716c; font-size: 13px;">Date: ${invoice.date}</p>
    </div>

    <div style="background-color: #faf6f0; border: 1px solid #ebd9c8; border-radius: 8px; padding: 14px 16px; margin: 16px 0; font-size: 13px;">
      <table style="width: 100%;">
        <tr><td style="color: #78716c; width: 130px;"><strong>Billed To:</strong></td><td><strong>${invoice.customerName}</strong></td></tr>
        <tr><td style="color: #78716c;"><strong>Mobile:</strong></td><td>${invoice.customerMobile}</td></tr>
        <tr><td style="color: #78716c;"><strong>Payment Mode:</strong></td><td><strong style="color: #15803d;">${invoice.paymentMethod} (PAID)</strong></td></tr>
      </table>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
      <thead>
        <tr style="border-bottom: 2px solid #ebd9c8; color: #78716c; font-size: 11.5px; text-transform: uppercase;">
          <th style="text-align: left; padding-bottom: 8px;">Item Description</th>
          <th style="text-align: center; padding-bottom: 8px; width: 50px;">Qty</th>
          <th style="text-align: right; padding-bottom: 8px; width: 70px;">Rate</th>
          <th style="text-align: right; padding-bottom: 8px; width: 80px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding-top: 12px; text-align: right; color: #78716c;">Subtotal:</td>
          <td style="padding-top: 12px; text-align: right; font-weight: 600;">₹${invoice.subtotal.toLocaleString("en-IN")}</td>
        </tr>
        ${
          invoice.tax > 0
            ? `<tr>
                <td colspan="3" style="padding: 4px 0; text-align: right; color: #78716c;">GST (${invoice.gstRate}%):</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 600;">₹${invoice.tax.toLocaleString("en-IN")}</td>
              </tr>`
            : ""
        }
        ${
          invoice.discount > 0
            ? `<tr>
                <td colspan="3" style="padding: 4px 0; text-align: right; color: #15803d;">Discount Applied:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #15803d;">-₹${invoice.discount.toLocaleString("en-IN")}</td>
              </tr>`
            : ""
        }
        ${
          invoice.deliveryFee > 0
            ? `<tr>
                <td colspan="3" style="padding: 4px 0; text-align: right; color: #78716c;">Delivery / Packaging:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 600;">₹${invoice.deliveryFee.toLocaleString("en-IN")}</td>
              </tr>`
            : ""
        }
        <tr style="border-top: 2px solid #ebd9c8;">
          <td colspan="3" style="padding: 12px 0; text-align: right; font-weight: 800; font-size: 16px; color: #292524;">Grand Total:</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 800; font-size: 16px; color: #78350f;">₹${invoice.grandTotal.toLocaleString("en-IN")}</td>
        </tr>
      </tfoot>
    </table>

    <div style="background-color: #f5f5f4; border-radius: 6px; padding: 12px; font-size: 11.5px; color: #78716c; text-align: center; margin-top: 20px;">
      This is a system generated computer invoice issued by Kichee's Baked Delights POS. Thank you for your patronage!
    </div>
  `;

  return {
    subject: `Tax Invoice #${invoice.invoiceNumber} - Kichee's Baked Delights`,
    html: wrapInEmailLayout(content, `Invoice #${invoice.invoiceNumber}`),
  };
}

// -------------------------------------------------------------
// 4. Official Purchase Order (PO) to Supplier Email
// -------------------------------------------------------------
export function generatePurchaseOrderEmail(po: {
  poNumber: string;
  date: string;
  expectedDate?: string;
  supplier: {
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    gstin?: string;
    address?: string;
  };
  deliveryLocation: string;
  paymentTerms: string;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    taxPercent?: number;
    totalPrice: number;
    sku?: string;
  }>;
  subtotal: number;
  taxTotal: number;
  shippingFee: number;
  grandTotal: number;
  notes?: string;
}): { subject: string; html: string } {
  const itemRows = po.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f0e6dc;">
        <td style="padding: 10px 0; vertical-align: top;">
          <strong style="color: #292524; font-size: 13px;">${item.name}</strong>
          ${item.sku ? `<div style="font-size: 11px; color: #78716c;">SKU: ${item.sku}</div>` : ""}
        </td>
        <td style="padding: 10px 8px; text-align: center; vertical-align: top; font-weight: 700;">
          ${item.quantity} ${item.unit}
        </td>
        <td style="padding: 10px 0; text-align: right; vertical-align: top;">₹${item.unitPrice}</td>
        <td style="padding: 10px 0; text-align: right; vertical-align: top;">${item.taxPercent ? `${item.taxPercent}%` : "0%"}</td>
        <td style="padding: 10px 0; text-align: right; vertical-align: top; font-weight: 700; color: #382013;">
          ₹${item.totalPrice.toLocaleString("en-IN")}
        </td>
      </tr>
    `
    )
    .join("");

  const content = `
    <div style="margin-bottom: 20px;">
      <span style="background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px; text-transform: uppercase;">
        Official Purchase Order
      </span>
      <h2 style="font-size: 20px; font-weight: 700; color: #292524; margin: 10px 0 4px 0;">Purchase Order: ${po.poNumber}</h2>
      <p style="margin: 0; color: #78716c; font-size: 13px;">Date: ${po.date} | Expected Delivery: <strong>${po.expectedDate || "Immediate"}</strong></p>
    </div>

    <!-- Vendor and Delivery Specs Grid -->
    <table style="width: 100%; margin: 16px 0; border-collapse: separate; border-spacing: 12px 0;">
      <tr>
        <td style="width: 50%; background-color: #faf6f0; border: 1px solid #ebd9c8; border-radius: 8px; padding: 14px; vertical-align: top; font-size: 12.5px;">
          <h4 style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; color: #78350f;">Vendor / Supplier:</h4>
          <p style="margin: 0 0 3px 0; font-weight: 700; font-size: 14px; color: #292524;">${po.supplier.name}</p>
          ${po.supplier.contactPerson ? `<p style="margin: 0 0 3px 0;">Attn: ${po.supplier.contactPerson}</p>` : ""}
          ${po.supplier.phone ? `<p style="margin: 0 0 3px 0;">Tel: ${po.supplier.phone}</p>` : ""}
          ${po.supplier.email ? `<p style="margin: 0 0 3px 0;">Email: ${po.supplier.email}</p>` : ""}
          ${po.supplier.gstin ? `<p style="margin: 0;">GSTIN: <strong>${po.supplier.gstin}</strong></p>` : ""}
        </td>
        <td style="width: 50%; background-color: #faf6f0; border: 1px solid #ebd9c8; border-radius: 8px; padding: 14px; vertical-align: top; font-size: 12.5px;">
          <h4 style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; color: #78350f;">Delivery & Invoicing Terms:</h4>
          <p style="margin: 0 0 3px 0;"><strong>Ship To:</strong> ${po.deliveryLocation}</p>
          <p style="margin: 0 0 3px 0;"><strong>Payment Terms:</strong> ${po.paymentTerms}</p>
          <p style="margin: 0 0 3px 0;"><strong>Bill To:</strong> Kichee's Baked Delights</p>
          <p style="margin: 0;"><strong>Buyer GSTIN:</strong> 33AAECP8821M1Z4</p>
        </td>
      </tr>
    </table>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12.5px;">
      <thead>
        <tr style="border-bottom: 2px solid #ebd9c8; color: #78716c; font-size: 11px; text-transform: uppercase;">
          <th style="text-align: left; padding-bottom: 8px;">Material / Specifications</th>
          <th style="text-align: center; padding-bottom: 8px; width: 70px;">Quantity</th>
          <th style="text-align: right; padding-bottom: 8px; width: 70px;">Rate</th>
          <th style="text-align: right; padding-bottom: 8px; width: 50px;">Tax</th>
          <th style="text-align: right; padding-bottom: 8px; width: 85px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4" style="padding-top: 12px; text-align: right; color: #78716c;">Subtotal:</td>
          <td style="padding-top: 12px; text-align: right; font-weight: 600;">₹${po.subtotal.toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td colspan="4" style="padding: 4px 0; text-align: right; color: #78716c;">Taxes / GST:</td>
          <td style="padding: 4px 0; text-align: right; font-weight: 600;">₹${po.taxTotal.toLocaleString("en-IN")}</td>
        </tr>
        ${
          po.shippingFee > 0
            ? `<tr>
                <td colspan="4" style="padding: 4px 0; text-align: right; color: #78716c;">Freight / Logistics:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 600;">₹${po.shippingFee.toLocaleString("en-IN")}</td>
              </tr>`
            : ""
        }
        <tr style="border-top: 2px solid #ebd9c8;">
          <td colspan="4" style="padding: 12px 0; text-align: right; font-weight: 800; font-size: 15px; color: #292524;">Total PO Value:</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 800; font-size: 15px; color: #78350f;">₹${po.grandTotal.toLocaleString("en-IN")}</td>
        </tr>
      </tfoot>
    </table>

    ${
      po.notes
        ? `<div style="background-color: #fffbeb; border: 1px dashed #d97706; border-radius: 6px; padding: 12px; font-size: 12px; color: #92400e; margin: 16px 0;">
            <strong>Special Procurement Notes:</strong> ${po.notes}
          </div>`
        : ""
    }

    <p style="font-size: 12px; color: #78716c; margin-top: 20px;">
      Please acknowledge receipt of this purchase order and confirm dispatch date. Email all invoices and delivery challans to <strong>billing@kicheesbakeddelights.in</strong> referencing PO #${po.poNumber}.
    </p>
  `;

  return {
    subject: `Purchase Order ${po.poNumber} - Kichee's Baked Delights to ${po.supplier.name}`,
    html: wrapInEmailLayout(content, `Purchase Order ${po.poNumber}`),
  };
}

// -------------------------------------------------------------
// 5. Expense Summary Report Email (Periodic / Monthly)
// -------------------------------------------------------------
export function generateExpenseReportEmail(data: {
  period: string;
  totalExpenses: number;
  totalSales?: number;
  netProfit?: number;
  categories: Array<{ category: string; amount: number; percentage: number }>;
  topExpenses: Array<{ title: string; category: string; amount: number; date: string; vendor?: string }>;
}): { subject: string; html: string } {
  const categoryRows = data.categories
    .map(
      (cat) => `
      <tr style="border-bottom: 1px solid #f0e6dc;">
        <td style="padding: 8px 0; color: #292524;"><strong>${cat.category}</strong></td>
        <td style="padding: 8px 0; text-align: right; font-weight: 600;">₹${cat.amount.toLocaleString("en-IN")}</td>
        <td style="padding: 8px 0; text-align: right; color: #78716c;">${cat.percentage.toFixed(1)}%</td>
      </tr>
    `
    )
    .join("");

  const topRows = data.topExpenses
    .map(
      (exp) => `
      <tr style="border-bottom: 1px solid #f0e6dc; font-size: 12.5px;">
        <td style="padding: 8px 0;">
          <strong>${exp.title}</strong>
          <div style="font-size: 11px; color: #78716c;">${exp.vendor || "N/A"} · ${exp.date}</div>
        </td>
        <td style="padding: 8px 0; text-align: center;"><span style="background-color: #f5f5f4; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${exp.category}</span></td>
        <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #b91c1c;">₹${exp.amount.toLocaleString("en-IN")}</td>
      </tr>
    `
    )
    .join("");

  const content = `
    <div style="margin-bottom: 20px;">
      <span style="background-color: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px; text-transform: uppercase;">
        Executive Financial Summary
      </span>
      <h2 style="font-size: 20px; font-weight: 700; color: #292524; margin: 10px 0 4px 0;">Bakery Expense Report: ${data.period}</h2>
      <p style="margin: 0; color: #78716c; font-size: 13px;">Generated for Bakery Leadership & Store Ownership</p>
    </div>

    <!-- P&L Snapshot Grid -->
    <table style="width: 100%; border-collapse: separate; border-spacing: 10px 0; margin: 20px 0;">
      <tr>
        <td style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px; text-align: center;">
          <div style="font-size: 11px; text-transform: uppercase; color: #991b1b; font-weight: 700;">Total Expenses</div>
          <div style="font-size: 22px; font-weight: 800; color: #b91c1c; margin-top: 4px;">₹${data.totalExpenses.toLocaleString("en-IN")}</div>
        </td>
        ${
          data.totalSales !== undefined
            ? `<td style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; text-align: center;">
                <div style="font-size: 11px; text-transform: uppercase; color: #166534; font-weight: 700;">Revenue / Sales</div>
                <div style="font-size: 22px; font-weight: 800; color: #15803d; margin-top: 4px;">₹${data.totalSales.toLocaleString("en-IN")}</div>
              </td>`
            : ""
        }
        ${
          data.netProfit !== undefined
            ? `<td style="background-color: ${data.netProfit >= 0 ? "#eff6ff" : "#fff1f2"}; border: 1px solid ${data.netProfit >= 0 ? "#bfdbfe" : "#fecdd3"}; border-radius: 8px; padding: 14px; text-align: center;">
                <div style="font-size: 11px; text-transform: uppercase; color: ${data.netProfit >= 0 ? "#1e40af" : "#9f1239"}; font-weight: 700;">Net Balance</div>
                <div style="font-size: 22px; font-weight: 800; color: ${data.netProfit >= 0 ? "#1d4ed8" : "#be123c"}; margin-top: 4px;">₹${data.netProfit.toLocaleString("en-IN")}</div>
              </td>`
            : ""
        }
      </tr>
    </table>

    <h4 style="margin: 24px 0 8px 0; font-size: 13px; text-transform: uppercase; color: #78350f;">Expense Distribution by Category</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
      <thead>
        <tr style="border-bottom: 2px solid #ebd9c8; color: #78716c; font-size: 11px; text-transform: uppercase;">
          <th style="text-align: left; padding-bottom: 6px;">Category</th>
          <th style="text-align: right; padding-bottom: 6px; width: 110px;">Amount</th>
          <th style="text-align: right; padding-bottom: 6px; width: 70px;">Share</th>
        </tr>
      </thead>
      <tbody>
        ${categoryRows}
      </tbody>
    </table>

    <h4 style="margin: 20px 0 8px 0; font-size: 13px; text-transform: uppercase; color: #78350f;">Significant Expenditures</h4>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="border-bottom: 2px solid #ebd9c8; color: #78716c; font-size: 11px; text-transform: uppercase;">
          <th style="text-align: left; padding-bottom: 6px;">Description</th>
          <th style="text-align: center; padding-bottom: 6px; width: 120px;">Category</th>
          <th style="text-align: right; padding-bottom: 6px; width: 100px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${topRows}
      </tbody>
    </table>
  `;

  return {
    subject: `📊 Bakery Financial Report (${data.period}) - Kichee's Baked Delights`,
    html: wrapInEmailLayout(content, `Financial Report - ${data.period}`),
  };
}

// -------------------------------------------------------------
// 6. Generic Custom Email (Owner to Anyone)
// -------------------------------------------------------------
export function generateCustomOwnerEmail(params: {
  recipientName?: string;
  subject: string;
  messageHtml: string;
  senderTitle?: string;
}): { subject: string; html: string } {
  const content = `
    ${params.recipientName ? `<p style="font-size: 15px; margin: 0 0 16px 0;">Dear <strong>${params.recipientName}</strong>,</p>` : ""}
    <div style="font-size: 14px; line-height: 1.7; color: #292524;">
      ${params.messageHtml}
    </div>
    <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #ebd9c8; font-size: 13px; color: #57534e;">
      Warm regards,<br>
      <strong style="color: #3d2314; font-size: 14px;">Kichee's Baked Delights Operations & Management</strong><br>
      <span style="font-size: 12px; color: #78716c;">${params.senderTitle || "Executive Office & Billing Desk"}</span>
    </div>
  `;

  return {
    subject: params.subject,
    html: wrapInEmailLayout(content, params.subject),
  };
}
