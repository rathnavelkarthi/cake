import { NextResponse } from "next/server";
import { getMailTransporter } from "@/lib/email/mailer";

export async function GET() {
  try {
    const transporter = getMailTransporter();
    await transporter.verify();
    return NextResponse.json({
      success: true,
      message: "SMTP Hostinger server connection verified successfully.",
      config: {
        host: process.env.SMTP_HOST || "smtp.hostinger.com",
        port: process.env.SMTP_PORT || "465",
        user: process.env.SMTP_USER || "billing@kicheesbakeddelights.in",
        status: "CONNECTED",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to verify SMTP server connection",
      },
      { status: 500 }
    );
  }
}
