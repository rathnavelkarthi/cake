import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get("key") || "signup_confirmation";

    const { data: template, error } = await supabaseAdmin
      .from("email_templates")
      .select("*")
      .eq("template_key", key)
      .single();

    if (error || !template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Sample substitution values
    const sampleItemsTable = `
      <table role="presentation" width="100%" cellpadding="10" cellspacing="0" style="border-collapse: collapse; font-size: 13px;">
        <tr style="background-color: #faf5ef; border-bottom: 1px solid #ebd9c8; font-weight: 700; color: #57463b;">
          <td align="left">Bake Item</td>
          <td align="center">Qty</td>
          <td align="right">Amount</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3e9df;">
          <td>
            <div style="font-weight: 700; color: #382013;">Belgian Dark Chocolate Truffle Gateau</div>
            <div style="font-size: 11px; color: #8c7667;">Size: 1.0 kg • Pure Eggless • Message: "Happy 30th Ananya!"</div>
          </td>
          <td align="center" style="font-weight: 700;">1</td>
          <td align="right" style="font-weight: 700; color: #382013;">₹1,200</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3e9df;">
          <td>
            <div style="font-weight: 700; color: #382013;">Classic Molten Fudge Walnut Brownies (Box of 4)</div>
            <div style="font-size: 11px; color: #8c7667;">Pure Callebaut Couverture Dark</div>
          </td>
          <td align="center" style="font-weight: 700;">1</td>
          <td align="right" style="font-weight: 700; color: #382013;">₹450</td>
        </tr>
        <tr style="background-color: #fffbf7;">
          <td colspan="2" align="right" style="font-size: 12px; color: #8c7667;">Delivery Fee (Chennai Express)</td>
          <td align="right" style="font-size: 12px; font-weight: 700; color: #16a34a;">FREE</td>
        </tr>
      </table>
    `;

    const sampleVars: Record<string, string> = {
      customer_name: "Priya Sundaram",
      customer_email: "priya@example.com",
      login_url: "http://localhost:3000/shop",
      discount_code: "KICHEES10",
      order_number: "KCH-2026-9481",
      items_table: sampleItemsTable,
      total_amount: "1,650",
      delivery_type: "Doorstep Temperature-Controlled Delivery",
      delivery_date: "Today, 04:30 PM - 06:30 PM",
      delivery_address: "Flat 4B, Ceebros Heritage, Nungambakkam High Rd, Chennai - 600034",
      track_url: "http://localhost:3000/account/orders",
      new_status: "Baking in Oven • 175°C Convection",
      status_message: "Our Head Pâtissier is aerating the dark chocolate sponge and layering the 54% Callebaut ganache. Your order will be dispatched on schedule.",
    };

    let renderedHtml = template.body_html;
    let renderedSubject = template.subject;

    Object.entries(sampleVars).forEach(([k, v]) => {
      const reg = new RegExp(`{{${k}}}`, "g");
      renderedHtml = renderedHtml.replace(reg, v);
      renderedSubject = renderedSubject.replace(reg, v);
    });

    return new NextResponse(renderedHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
