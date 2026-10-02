"use client";

import React, { useState } from "react";
import {
  Mail,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Tag,
  CreditCard,
  ChefHat,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface QuickEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRecipient?: string;
  defaultSubject?: string;
}

export function QuickEmailModal({
  open,
  onOpenChange,
  defaultRecipient = "",
  defaultSubject = "",
}: QuickEmailModalProps) {
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [recipientName, setRecipientName] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [preset, setPreset] = useState("custom");
  const [message, setMessage] = useState("");
  const [discountCode, setDiscountCode] = useState("KICHEES15");
  const [isSending, setIsSending] = useState(false);

  // Quick preset template filler
  const handleSelectPreset = (value: string) => {
    setPreset(value);
    switch (value) {
      case "discount_code":
        setSubject("Special Celebration Gift: 15% Off Your Next Gateau!");
        setMessage(
          `<p>We are delighted to share an exclusive celebration coupon with you for being a valued part of our patisserie community!</p>
          <div style="background-color: #fef3c7; border: 2px dashed #b45309; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #78350f;">Your Exclusive Discount Code</div>
            <div style="font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #3d2314; margin: 6px 0;">${discountCode}</div>
            <div style="font-size: 12px; color: #92400e;">Use code at checkout on kicheesbakeddelights.in for 15% off any handcrafted cake or patisserie box.</div>
          </div>
          <p>Valid for the next 30 days on online orders or counter pickups.</p>`
        );
        break;

      case "billing_payment":
        setSubject("Invoice & Payment Acknowledgement - Kichee's Baked Delights");
        setMessage(
          `<p>Thank you for choosing Kichee's Baked Delights. This note confirms your recent order and payment transaction with our bakery.</p>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin: 16px 0;">
            <div style="font-size: 12px; font-weight: 700; color: #15803d;">Payment Received & Verified</div>
            <div style="font-size: 13px; color: #166534; margin-top: 4px;">Your order has been forwarded to our Head Pâtissier for artisanal crafting.</div>
          </div>
          <p>If you require a formal tax invoice receipt or have custom requests, our team is at your service.</p>`
        );
        break;

      case "kitchen_update":
        setSubject("Baking Update: Your Custom Cake is in Progress! 🎂");
        setMessage(
          `<p>Exciting news from our central kitchen station in Nungambakkam!</p>
          <p>Our pastry chefs have begun crafting your celebratory bakes using fresh dairy butter and fine couverture chocolate. Your order will be decorated, blast-chilled to maintain flawless structure, and prepared for temperature-controlled dispatch.</p>
          <p>We will alert you as soon as your order departs our kitchen.</p>`
        );
        break;

      case "vip_greeting":
        setSubject("A Personal Thank You from Kichee's Bakery Leadership");
        setMessage(
          `<p>On behalf of our entire baking and confectionery family, we want to personally thank you for celebrating your milestones with Kichee's.</p>
          <p>We strive to bring pure French patisserie techniques and artisanal perfection to every crumb. If you have any feedback or wish to discuss a bespoke celebration cake, please reply directly to this email.</p>`
        );
        break;

      default:
        setSubject("Message from Kichee's Baked Delights");
        setMessage("<p>Dear Customer / Partner,</p><p>We are writing to you regarding your inquiry with Kichee's Baked Delights.</p>");
        break;
    }
  };

  const handleSend = async () => {
    if (!recipient.trim()) {
      toast.error("Please enter a recipient email address");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter an email subject");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a message to send");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom",
          recipientEmail: recipient.trim(),
          recipientName: recipientName.trim() || undefined,
          subject: subject.trim(),
          customMessage: message,
          ccOwner: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Email sent to ${recipient}! Copy archived to billing.`);
        onOpenChange(false);
        // Reset
        setRecipient("");
        setRecipientName("");
        setSubject("");
        setMessage("");
      } else {
        toast.error(data.error || "Failed to send email");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-900 text-amber-50">
              <Mail className="h-4 w-4" />
            </div>
            <span>Send Email (Owner Billing Desk)</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-500">
            Dispatch emails directly from <strong>billing@kicheesbakeddelights.in</strong> via Hostinger SMTP.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 py-2 text-xs">
          {/* Quick Preset Selector */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-800" />
              Quick Email Template / Preset
            </label>
            <Select value={preset} onValueChange={handleSelectPreset}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Choose a preset..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Blank / Custom Message</SelectItem>
                <SelectItem value="discount_code">Special Offer & Discount Coupon Code</SelectItem>
                <SelectItem value="billing_payment">Billing & Payment Receipt Confirmation</SelectItem>
                <SelectItem value="kitchen_update">Kitchen Baking Status & Order Update</SelectItem>
                <SelectItem value="vip_greeting">Executive Thank You Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recipient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Recipient Email *</label>
              <Input
                type="email"
                placeholder="customer@example.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Recipient Name (Optional)</label>
              <Input
                placeholder="e.g. Ananya Iyer"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Subject Line */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Email Subject *</label>
            <Input
              placeholder="e.g. Special Celebration Gift from Kichee's"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-xs font-medium"
              required
            />
          </div>

          {/* Discount code field if discount template selected */}
          {preset === "discount_code" && (
            <div className="space-y-1 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <label className="font-semibold text-amber-900 flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Coupon / Promo Code
              </label>
              <div className="flex gap-2">
                <Input
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value.toUpperCase());
                  }}
                  className="text-xs font-mono font-bold uppercase bg-white border-amber-300"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleSelectPreset("discount_code")}
                  className="bg-amber-900 text-white text-xs shrink-0"
                >
                  Apply Code to Message
                </Button>
              </div>
            </div>
          )}

          {/* Message HTML Editor Area */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Message Content (HTML Supported)</label>
            <textarea
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your email message here..."
              className="w-full rounded-md border border-stone-300 p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-900 font-mono"
            />
          </div>

          {/* Info callout */}
          <div className="rounded-lg bg-stone-50 border border-stone-200 p-2.5 text-[11px] text-stone-600 space-y-0.5">
            <div>• Sender: <strong>Kichee's Baked Delights (billing@kicheesbakeddelights.in)</strong></div>
            <div>• Branded signature, logo header, and Chennai address will be wrapped automatically.</div>
            <div>• A BCC archive copy will be saved to billing@kicheesbakeddelights.in.</div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-stone-600 text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending}
            className="bg-amber-900 hover:bg-amber-950 text-white font-medium text-xs gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            {isSending ? "Sending Email..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
