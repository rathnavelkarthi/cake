import { NextRequest, NextResponse } from "next/server";
import {
  sendEmail,
  generateOrderConfirmationEmail,
  generateOwnerOrderAlertEmail,
  generateBillingInvoiceEmail,
  generatePurchaseOrderEmail,
  generateExpenseReportEmail,
  generateCustomOwnerEmail,
} from "@/lib/email/mailer";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, recipientEmail, subject: customSubject, payload, customMessage, recipientName, ccOwner = true } = body;

    if (!recipientEmail && type !== "owner_order_alert" && type !== "expense_report") {
      return NextResponse.json(
        { error: "recipientEmail is required" },
        { status: 400 }
      );
    }

    const ownerEmail = process.env.SMTP_USER || "billing@kicheesbakeddelights.in";
    let emailSubject = customSubject || "Update from Kichee's Baked Delights";
    let emailHtml = "";
    let finalTo = recipientEmail || ownerEmail;
    let bcc: string | undefined = undefined;

    switch (type) {
      case "order_confirmation": {
        const gen = generateOrderConfirmationEmail(payload);
        emailSubject = customSubject || gen.subject;
        emailHtml = gen.html;
        if (ccOwner && finalTo !== ownerEmail) {
          bcc = ownerEmail;
        }
        break;
      }

      case "owner_order_alert": {
        const gen = generateOwnerOrderAlertEmail(payload);
        emailSubject = customSubject || gen.subject;
        emailHtml = gen.html;
        finalTo = ownerEmail;
        break;
      }

      case "pos_invoice": {
        const gen = generateBillingInvoiceEmail(payload);
        emailSubject = customSubject || gen.subject;
        emailHtml = gen.html;
        if (ccOwner && finalTo !== ownerEmail) {
          bcc = ownerEmail;
        }
        break;
      }

      case "purchase_order": {
        const gen = generatePurchaseOrderEmail(payload);
        emailSubject = customSubject || gen.subject;
        emailHtml = gen.html;
        if (ccOwner) {
          bcc = ownerEmail;
        }
        break;
      }

      case "expense_report": {
        const gen = generateExpenseReportEmail(payload);
        emailSubject = customSubject || gen.subject;
        emailHtml = gen.html;
        finalTo = recipientEmail || ownerEmail;
        break;
      }

      case "custom": {
        const gen = generateCustomOwnerEmail({
          recipientName,
          subject: emailSubject,
          messageHtml: customMessage || payload?.messageHtml || "<p>Thank you for connecting with us.</p>",
          senderTitle: payload?.senderTitle,
        });
        emailSubject = gen.subject;
        emailHtml = gen.html;
        if (ccOwner && finalTo !== ownerEmail) {
          bcc = ownerEmail;
        }
        break;
      }

      default: {
        return NextResponse.json(
          { error: `Unsupported email type: ${type}` },
          { status: 400 }
        );
      }
    }

    // Send the email
    const result = await sendEmail({
      to: finalTo,
      subject: emailSubject,
      html: emailHtml,
      bcc,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }

    // Optionally log into Supabase if table exists
    try {
      await supabaseAdmin.from("email_logs").insert({
        recipient: finalTo,
        subject: emailSubject,
        email_type: type,
        status: "SENT",
        sent_at: new Date().toISOString(),
      });
    } catch {
      // Non-fatal if table not created yet
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      recipient: finalTo,
      subject: emailSubject,
    });
  } catch (err: any) {
    console.error("Error in /api/email/send:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
