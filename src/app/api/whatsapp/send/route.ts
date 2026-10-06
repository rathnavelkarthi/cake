import { NextRequest, NextResponse } from "next/server";
import {
  sendWhatsAppMessage,
  sendWhatsAppMedia,
  generatePurchaseOrderWhatsAppText,
  generateBillingInvoiceWhatsAppText,
  generateQuotationWhatsAppText,
} from "@/lib/evolution/client";

// POST /api/whatsapp/send
// Dispatches messages via Evolution API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, phone, text, payload, mediaUrl, caption, fileName } = body;

    let targetPhone = phone;

    switch (type) {
      case "purchase_order": {
        if (!payload) {
          return NextResponse.json(
            { error: "Payload is required for purchase_order" },
            { status: 400 }
          );
        }
        targetPhone = phone || payload.supplier?.phone;
        if (!targetPhone) {
          return NextResponse.json(
            { error: "Supplier phone is required" },
            { status: 400 }
          );
        }
        const generatedText = generatePurchaseOrderWhatsAppText(payload);
        const result = await sendWhatsAppMessage(targetPhone, text || generatedText);
        if (!result.success) {
          return NextResponse.json(
            { error: result.error || "Evolution API error" },
            { status: 502 }
          );
        }
        return NextResponse.json({
          success: true,
          messageId: result.messageId,
          text: generatedText,
        });
      }

      case "billing_invoice": {
        if (!payload) {
          return NextResponse.json(
            { error: "Payload is required for billing_invoice" },
            { status: 400 }
          );
        }
        targetPhone = phone || payload.customerMobile;
        if (!targetPhone) {
          return NextResponse.json(
            { error: "Customer mobile is required" },
            { status: 400 }
          );
        }
        const generatedText = generateBillingInvoiceWhatsAppText(payload);
        const result = await sendWhatsAppMessage(targetPhone, text || generatedText);
        if (!result.success) {
          return NextResponse.json(
            { error: result.error || "Evolution API error" },
            { status: 502 }
          );
        }
        return NextResponse.json({
          success: true,
          messageId: result.messageId,
          text: generatedText,
        });
      }

      case "quotation": {
        if (!payload) {
          return NextResponse.json(
            { error: "Payload is required for quotation" },
            { status: 400 }
          );
        }
        targetPhone = phone || payload.customerMobile;
        if (!targetPhone) {
          return NextResponse.json(
            { error: "Customer mobile is required" },
            { status: 400 }
          );
        }
        const generatedText = generateQuotationWhatsAppText(payload);
        const result = await sendWhatsAppMessage(targetPhone, text || generatedText);
        if (!result.success) {
          return NextResponse.json(
            { error: result.error || "Evolution API error" },
            { status: 502 }
          );
        }
        return NextResponse.json({
          success: true,
          messageId: result.messageId,
          text: generatedText,
        });
      }

      case "media": {
        if (!targetPhone || !mediaUrl) {
          return NextResponse.json(
            { error: "phone and mediaUrl are required for media dispatch" },
            { status: 400 }
          );
        }
        const result = await sendWhatsAppMedia(
          targetPhone,
          mediaUrl,
          caption || "",
          fileName || "file.png"
        );
        if (!result.success) {
          return NextResponse.json(
            { error: result.error || "Evolution API error" },
            { status: 502 }
          );
        }
        return NextResponse.json({
          success: true,
          messageId: result.messageId,
        });
      }

      case "text":
      default: {
        if (!targetPhone || !text) {
          return NextResponse.json(
            { error: "phone and text are required for WhatsApp dispatch" },
            { status: 400 }
          );
        }
        const result = await sendWhatsAppMessage(targetPhone, text);
        if (!result.success) {
          return NextResponse.json(
            { error: result.error || "Evolution API error" },
            { status: 502 }
          );
        }
        return NextResponse.json({
          success: true,
          messageId: result.messageId,
        });
      }
    }
  } catch (err: any) {
    console.error("API error in POST /api/whatsapp/send:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
