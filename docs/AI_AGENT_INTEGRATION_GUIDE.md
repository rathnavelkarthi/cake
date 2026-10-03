# Kichee's Bakery AI Voice Agent — Complete Integration & Sales Playbook

This document details the live endpoints, JSON schemas, webhook tool specifications, and the system prompt for Kichee's Baked Delights AI voice agent (powered by ElevenLabs / Conversational AI).

---

## 1. High-Impact Sales & Operational Tools

The backend exposes 4 purpose-built endpoints for the AI agent:

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/cart/session` | `POST` | Generates a pre-filled checkout link with live products and one-tap celebration upsells (candles, cards, brownies), then immediately texts it to the caller via WhatsApp. |
| `/api/agent/order-status` | `GET` / `POST` | Answers "Where is my order / cake?" using caller's phone number or order ID. Returns natural spoken phrasing and optionally fires an instant WhatsApp tracking card. |
| `/api/agent/quote-request` | `POST` | Captures wedding/custom cake inquiries, texts caller asking for Pinterest/photo references, and alerts the bakery owner via Hostinger SMTP. |
| `/api/agent/cart-recovery` | `GET` / `POST` | Automated recovery engine that scans sessions older than 45 minutes and sends a friendly WhatsApp message to close the sale. |

---

## 2. Tool Specifications for ElevenLabs

Add these tools inside your ElevenLabs Agent dashboard under **Tools**:

### Tool 1: `create_prefilled_cart`
- **Description**: Creates a pre-filled bakery cart with customer's cake selection, optional add-ons (candles, card, brownies), and sends the direct checkout link to their WhatsApp.
- **Endpoint**: `https://kicheesbakeddelights.in/api/cart/session`
- **Method**: `POST`
- **Request Body (JSON)**:
```json
{
  "customerPhone": "919884631078",
  "customerName": "Aravind",
  "items": [
    {
      "name": "Belgian Chocolate Truffle Cake",
      "quantity": 1,
      "price": 850,
      "variantLabel": "0.5 kg (Eggless)",
      "customMessage": "Happy 25th Birthday Aravind"
    }
  ],
  "addCandles": true,
  "addCard": false,
  "addBrownies": false,
  "customerNotes": "Deliver around 4 PM please.",
  "sendWhatsApp": true
}
```
- **Response Handling**:
  The response contains `cartUrl`, `total`, and `whatsappSent`.
  The agent can say: *"I've sent your cart link to your WhatsApp ending in [last 4 digits]. Just tap the link, review your items, enter your delivery address, and complete your order."*

---

### Tool 2: `check_order_status`
- **Description**: Checks the live preparation and delivery status of an existing order using the customer's phone number or order number.
- **Endpoint**: `https://kicheesbakeddelights.in/api/agent/order-status`
- **Method**: `GET`
- **Query Parameters**:
  - `phone`: Caller's 10-digit mobile number
  - `orderNumber`: Optional (e.g. `KCH-2026-8642`)
  - `whatsapp`: `true` or `false` (send tracking card via WhatsApp)
- **Response Handling**:
  The response contains a ready-to-speak `voiceSummary` string:
  > *"Hi krishika, I found order #KCH-2026-8642 for 1x Black Forest Gateau. It is currently actively being baked and frosted by our pastry chefs in Nungambakkam, scheduled for delivery to address (T. Nagar). The total amount is ₹714."*

---

### Tool 3: `intake_custom_cake_quote`
- **Description**: Captures customer inquiries for multi-tier wedding cakes, customized fondant designs, or large party orders. Texts the caller to request reference photos and alerts the owner.
- **Endpoint**: `https://kicheesbakeddelights.in/api/agent/quote-request`
- **Method**: `POST`
- **Request Body (JSON)**:
```json
{
  "customerPhone": "919884631078",
  "customerName": "Sanjay & Divya",
  "occasion": "Wedding Reception",
  "eventDate": "2026-10-25",
  "guestCount": "40 guests",
  "flavourPreference": "Belgian Truffle & Raspberry",
  "locality": "Besant Nagar",
  "budget": 4500,
  "notes": "Two-tier semi-naked cake with fresh flowers",
  "sendWhatsAppImagePrompt": true
}
```
- **Response Handling**:
  The response contains `voiceSummary`:
  > *"I have logged your custom cake request for Wedding Reception on 2026-10-25. I just sent a WhatsApp message to your phone. Please reply to that WhatsApp chat with any reference photos or sketches you have, and Chef Selva will review your brief and send your custom sketch and quotation within 30 minutes."*

---

## 3. Recommended ElevenLabs System Prompt

Copy this prompt into your ElevenLabs Voice Agent configuration:

```text
You are the voice of Kichee's Baked Delights, a boutique artisanal patisserie located in Nungambakkam, Chennai. You speak warmly, politely, and efficiently in natural English (with familiar understanding of Chennai localities like Nungambakkam, T. Nagar, Anna Nagar, Alwarpet, Adyar, and Kilpauk).

KITCHEN FACTS:
- Every cake is 100% eggless, made with pure cultured butter and imported Belgian Callebaut chocolate. No artificial shortening or synthetic compounds.
- Signature cakes: Belgian Chocolate Truffle Cake (₹850 for 0.5kg, ₹1500 for 1kg), Lotus Biscoff Cheesecake, Hazelnut Praline Gateau, Red Velvet with Cream Cheese, Tiramisu Gateau, Molten Fudge Brownies.
- Delivery: Same-day delivery across Chennai within 3-4 hours via temperature-controlled 4°C chilled vans (free delivery on orders over ₹1500). Counter pickup is also available at our Nungambakkam kitchen.

CALL WORKFLOWS:

1. INBOUND ORDER PLACEMENT:
- Greet the caller warmly: "Hello, welcome to Kichee's Baked Delights, Nungambakkam. How can I help you today?"
- Collect cake flavor, size (0.5 kg serves 4-5, 1 kg serves 8-10), and any lettering message for the top.
- UPSELL NATURALLY:
  * For birthdays/anniversaries: "Would you like us to include our artisanal gold sparkler candles and wooden cake knife set for an extra ₹99?"
  * For dessert lovers: "We just baked a fresh batch of molten dark chocolate fudge brownies. Would you like a 2-piece taster box added for ₹190?"
- Confirm caller's WhatsApp phone number.
- Call the `create_prefilled_cart` tool with the selected items and add-ons.
- Inform the customer: "I've just sent your cart directly to your WhatsApp. You can tap the link to review your items, enter your delivery address, and complete your order."

2. ORDER STATUS CHECKS ("Where is my cake?"):
- Ask for their phone number or order number.
- Call `check_order_status`.
- Speak the exact `voiceSummary` returned by the tool. If they need urgent delivery changes, let them know our Baking Desk is at +91 98846 31078.

3. CUSTOM & WEDDING CAKES:
- For tiered cakes, fondant models, or events with 20+ guests, collect: occasion, date, estimated guests, and preferred flavors.
- Call `intake_custom_cake_quote`.
- Explain that you've sent them a WhatsApp message and ask them to reply directly with reference pictures or Pinterest links so Chef Selva can prepare a sketch and pricing.

4. PRICING INQUIRIES ("How much are your brownies / pastries / cakes?"):
- If the item and size are in your KITCHEN FACTS, share the exact price.
- For any item NOT explicitly listed above, do NOT ask follow-up questions to calculate a price. Instead, briefly describe what you offer, then direct them:
  "You can browse our full menu with live prices at kicheesbakeddelights.in, or drop by our Nungambakkam kitchen — we'd love to walk you through everything in person!"
- You may still offer to take their order if they already know what they want.

TONE GUIDELINES:
- Keep answers conversational, helpful, and concise. Avoid long monologues.
- Never make up prices that are not in your catalog. When in doubt, direct to the website or store.
- If caller speaks Tamil, politely respond that our kitchen desk speaks both English and Tamil, and confirm their order details clearly.
```

---

## 4. Automated Cart Recovery Cron Job

To run the cart abandonment follow-up automatically every hour, you can set a cron ping or trigger via URL:
`GET https://kicheesbakeddelights.in/api/agent/cart-recovery?minMinutes=45&maxMinutes=1440`

This automatically checks for any caller who received a cart link but didn't finish checkout within 45 minutes, and sends them a polite, friendly WhatsApp check-in from Chef Selva.
