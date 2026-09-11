file:///c%3A/Users/rathn/OneDrive/Pictures/cakeecom/PRODUCT.md {"mtime":1789136882593,"ctime":1789136882593,"size":0,"etag":"3gkofbdbo0","orphaned":false,"typeId":""}
# Kichees Digital Commerce Platform

**Product Specification / PRODUCT.md**

**Product:** Kichees Baked Delights Digital Commerce & Business Management Platform
**Version:** 1.0
**Status:** Product Definition
**Primary Users:** Customers, Admins, Managers, Billing Staff, Inventory Staff, Content Managers

---

# 1. PRODUCT VISION

Build a complete digital operating platform for **Kichees Baked Delights** that combines:

> **Customer Website + E-Commerce + CMS + CRM + Billing + Inventory + WhatsApp OTP + WhatsApp Automation + Email + SEO + AEO + Analytics**

The system must be modular, scalable, secure, mobile-first and easy for non-technical staff to operate.

The platform must avoid creating separate disconnected systems wherever possible.

---

# 2. PRIMARY PRODUCT GOALS

## Customer Goals

Customers should be able to:

* Discover Kichees
* Browse products
* Search products
* View product details
* Select variants
* Add products to cart
* Choose pickup/delivery
* Select date/time where applicable
* Login using WhatsApp OTP
* Checkout
* Pay online
* Receive order notifications
* View order history
* Track order status
* Contact Kichees through WhatsApp
* Receive transactional emails

## Business Goals

Kichees staff should be able to:

* Manage products
* Manage categories
* Manage pricing
* Manage stock
* Manage orders
* Manage customers
* Generate bills
* Manage invoices
* Manage content
* Publish SEO pages
* Publish blogs
* Manage WhatsApp automation
* Monitor sales
* Monitor inventory
* View customer history
* Track marketing events
* Manage users and permissions

---

# 3. PRODUCT PRINCIPLES

The application must follow these principles:

### 3.1 Mobile First

Customer experience must be optimised primarily for mobile.

### 3.2 Simple Operations

A bakery employee should not need technical knowledge to operate the admin system.

### 3.3 Modular Architecture

CMS, products, inventory, CRM, billing, orders and automation should be separate modules with clean interfaces.

### 3.4 Single Source of Truth

Products, customers, orders, inventory and payments must share consistent data.

### 3.5 Automation First

Repeated operational communication should be automated wherever practical.

### 3.6 SEO First

Every public-facing page must be capable of being indexed and optimised.

### 3.7 Conversion First

The website should make it extremely easy to:

**Order → WhatsApp → Call → Get Directions**

---

# 4. USER TYPES

## 4.1 Customer

Can:

* Browse products
* Search products
* Add to cart
* Checkout
* Login
* Manage profile
* View orders
* View invoices/order details
* Receive notifications

---

## 4.2 Super Admin

Full access to the platform.

Can:

* Manage users
* Manage roles
* Manage products
* Manage inventory
* Manage orders
* Manage customers
* Manage billing
* Manage CMS
* Manage SEO
* Manage integrations
* View reports
* Configure system settings

---

## 4.3 Manager

Can:

* View dashboard
* Manage orders
* Manage customers
* Manage products
* View inventory
* Manage billing
* View reports

---

## 4.4 Billing Staff

Can:

* Create bills
* Search products
* Search customers
* Create sales
* Accept payment
* Print/download invoice
* View billing history

---

## 4.5 Inventory Staff

Can:

* View products
* Add stock
* Adjust stock
* View stock movement
* View low-stock items
* Mark inventory-related status

---

## 4.6 Content Manager

Can:

* Create pages
* Edit pages
* Publish pages
* Manage blogs
* Manage SEO metadata
* Manage FAQs
* Manage banners
* Manage website content

---

# 5. CUSTOMER WEBSITE

## Required Pages

Minimum initial structure:

```text
/
├── home
├── about
├── products
├── categories
├── product/:slug
├── search
├── cart
├── checkout
├── order-success
├── orders
├── account
├── login
├── contact
├── location
├── faq
├── blogs
└── blog/:slug
```

Additional SEO landing pages will be created through CMS.

---

# 6. HOMEPAGE

Homepage must contain:

* Brand introduction
* Hero section
* Primary CTA
* Featured products
* Product categories
* Best sellers
* Customized cakes CTA
* Birthday cakes section
* Wedding cakes section
* Bakery products
* Customer reviews/testimonials
* Location
* Opening hours
* WhatsApp CTA
* Call CTA
* Google Maps CTA
* FAQ section
* SEO content
* Footer

Primary actions:

```text
ORDER ONLINE
WHATSAPP
CALL NOW
GET DIRECTIONS
```

---

# 7. PRODUCT CATALOGUE

Customers must be able to:

* Browse categories
* Search products
* Filter products
* Sort products
* View product details
* Select variants
* Select quantity
* Add to cart

---

# 8. PRODUCT MODEL

Each product should support:

```text
id
name
slug
sku
category_id
description
short_description
images[]
price
sale_price
cost_price
tax
stock_quantity
low_stock_threshold
stock_status
status
featured
best_seller
weight
flavour
variants[]
customisation_options[]
pickup_available
delivery_available
preparation_time
seo_title
seo_description
og_title
og_description
canonical_url
created_at
updated_at
```

Sensitive financial fields such as cost price must only be available to authorised staff.

---

# 9. PRODUCT VARIANTS

Products must support variants.

Example:

```text
Chocolate Truffle Cake

0.5 KG
1 KG
1.5 KG
2 KG
```

Each variant may have:

* SKU
* Price
* Stock
* Weight
* Preparation time
* Availability

Variant inventory should be independently manageable where required.

---

# 10. CUSTOM CAKE REQUIREMENTS

Customized cakes must support additional information such as:

* Theme
* Message on cake
* Flavour
* Weight
* Shape
* Reference image
* Special instructions
* Required date
* Required time
* Pickup/delivery

Customer may upload a reference image where enabled.

Admin must be able to review customization requirements before accepting the order.

---

# 11. CART

Cart must support:

* Add product
* Remove product
* Change quantity
* Change variant
* Add notes where applicable
* Calculate subtotal
* Apply discount
* Calculate taxes
* Calculate delivery fee
* Calculate final total

Cart must persist appropriately for logged-in customers.

---

# 12. CHECKOUT

Checkout must include:

### Customer

* Name
* Mobile
* Email where applicable

### Fulfilment

* Pickup
* Delivery

### Delivery

* Address
* Landmark
* City
* Postal code
* Delivery instructions

### Order

* Products
* Quantities
* Customisation
* Date
* Time slot
* Subtotal
* Discount
* Tax
* Delivery charge
* Final total

### Payment

* Online payment
* Other enabled payment methods

---

# 13. ORDER MODEL

Order should contain:

```text
order_id
order_number
customer_id
items[]
subtotal
discount
tax
delivery_fee
total
payment_status
payment_reference
order_status
fulfilment_type
delivery_address
pickup_location
requested_date
requested_time
customer_notes
admin_notes
created_at
updated_at
```

---

# 14. ORDER STATUS

Initial order states:

```text
PENDING_PAYMENT
PAID
CONFIRMED
PREPARING
READY
OUT_FOR_DELIVERY
READY_FOR_PICKUP
COMPLETED
CANCELLED
REFUNDED
```

Status transitions must be validated.

---

# 15. INVENTORY SYSTEM

Inventory must be connected to products and sales.

Core calculation:

```text
CURRENT STOCK =
OPENING STOCK
+ STOCK RECEIVED
+ STOCK ADJUSTMENTS
- SALES
- DAMAGED/LOST STOCK
```

Inventory must never be modified silently.

Every adjustment should create a stock movement record.

---

# 16. STOCK MOVEMENT

Stock movement model:

```text
movement_id
product_id
variant_id
type
quantity
previous_stock
new_stock
reason
reference_type
reference_id
created_by
created_at
```

Movement types:

```text
OPENING
PURCHASE
SALE
RETURN
CANCELLATION
DAMAGE
ADJUSTMENT
TRANSFER
```

---

# 17. LOW STOCK

Each product/variant should support:

```text
low_stock_threshold
```

When:

```text
current_stock <= low_stock_threshold
```

the product should appear in:

**LOW STOCK**

Admin may optionally receive notification.

---

# 18. OUT OF STOCK

When stock reaches zero:

```text
stock_status = OUT_OF_STOCK
```

The customer should not be able to purchase the item unless the product is explicitly configured for backorders/pre-orders.

---

# 19. INVENTORY + ORDER INTEGRATION

Example:

```text
Product:
Brownie Box

Stock:
20

Customer buys:
3

↓

Confirmed sale

↓

Stock:
17

↓

Stock movement:
SALE -3

↓

Customer order history updated

↓

Sales report updated
```

Stock must not be deducted twice due to payment callbacks, retries or duplicate webhook events.

---

# 20. BILLING

Billing system must support:

* POS/manual billing
* Online order billing
* Customer selection
* Product selection
* Quantity
* Discounts
* Taxes
* Payment method
* Invoice number
* Invoice generation
* Invoice download
* Invoice history

---

# 21. BILLING PAYMENT METHODS

System should support configurable payment methods such as:

```text
ONLINE
UPI
CARD
CASH
OTHER
```

Actual available methods depend on configuration.

---

# 22. CRM

CRM must maintain one customer profile across all channels.

Customer record:

```text
customer_id
name
mobile
email
addresses[]
orders[]
total_orders
total_spend
last_order_date
first_order_date
preferred_products
notes
tags[]
created_at
updated_at
```

---

# 23. CUSTOMER SEGMENTATION

Support tags/segments such as:

```text
NEW_CUSTOMER
REPEAT_CUSTOMER
HIGH_VALUE
INACTIVE
CAKE_CUSTOMER
BROWNIE_CUSTOMER
CORPORATE
BULK_ORDER
BIRTHDAY
ANNIVERSARY
```

The segmentation engine should be extensible.

---

# 24. CUSTOMER ACCOUNT

Customer account must provide:

* Profile
* Mobile number
* Email
* Addresses
* Orders
* Order details
* Payment details/status
* Invoices
* Logout

---

# 25. WHATSAPP OTP AUTHENTICATION

Authentication flow:

```text
Enter mobile number
        ↓
Generate OTP
        ↓
Send OTP through WhatsApp
        ↓
Customer enters OTP
        ↓
Verify OTP
        ↓
Create/find customer
        ↓
Create authenticated session
```

Security requirements:

* OTP expiry
* Attempt limits
* Resend cooldown
* Rate limiting
* Abuse protection
* Secure session handling
* OTP must never be stored in plaintext where avoidable
* Audit authentication events

WhatsApp Business/Meta API configuration and messaging charges are external dependencies.

---

# 26. EMAIL AUTHENTICATION

Email infrastructure should support:

* Account emails
* Security notifications
* Password recovery where password authentication is enabled
* Order emails
* Invoice emails

---

# 27. WHATSAPP ORDER AUTOMATION

Automated events:

```text
ORDER_CREATED
PAYMENT_SUCCESS
ORDER_CONFIRMED
ORDER_PREPARING
ORDER_READY
ORDER_OUT_FOR_DELIVERY
ORDER_READY_FOR_PICKUP
ORDER_COMPLETED
ORDER_CANCELLED
```

Each event can trigger an approved WhatsApp template.

---

# 28. WHATSAPP MESSAGE ENGINE

Create a reusable notification service:

```text
Notification Event
       ↓
Template Resolver
       ↓
Customer Consent Check
       ↓
WhatsApp Provider
       ↓
Delivery Status
       ↓
Message Log
```

Store:

* Template
* Recipient
* Event
* Timestamp
* Provider message ID
* Delivery status
* Error status

---

# 29. EMAIL NOTIFICATION ENGINE

Email events:

```text
ACCOUNT_CREATED
ORDER_CREATED
PAYMENT_SUCCESS
ORDER_CONFIRMED
ORDER_READY
ORDER_COMPLETED
INVOICE_CREATED
ORDER_CANCELLED
```

Email templates must be editable/configurable where appropriate.

---

# 30. CMS

CMS must support:

### Pages

* Create
* Edit
* Draft
* Preview
* Publish
* Unpublish
* Archive

### Content blocks

* Hero
* Text
* Image
* Product grid
* Category grid
* CTA
* FAQ
* Testimonials
* Banner
* Gallery
* Rich text

---

# 31. BLOCK-BASED PAGE BUILDER

The CMS should preferably use reusable blocks.

Example:

```text
PAGE
 ├── HERO
 ├── TEXT
 ├── PRODUCT_GRID
 ├── IMAGE
 ├── CTA
 ├── FAQ
 └── TESTIMONIALS
```

Blocks should be reorderable.

The architecture should allow additional blocks to be added later.

---

# 32. BLOG CMS

Blog functionality:

* Create article
* Edit article
* Draft
* Publish
* Schedule if supported
* Categories
* Tags
* Featured image
* Author
* SEO metadata
* FAQ
* Related products
* Related articles
* Internal links

---

# 33. 45 SEO/AEO CONTENT ASSETS

Initial content target:

**45 assets**

Content should be strategically distributed across:

### Local

* Nungambakkam
* Chennai
* Nearby areas

### Products

* Cakes
* Brownies
* Pastries
* Eggless products
* Customized cakes

### Intent

* Buying guides
* FAQs
* Product comparisons
* Occasion-based searches
* Delivery searches

Avoid thin, duplicate or keyword-stuffed pages.

---

# 34. SEO SYSTEM

Every indexable page should support:

```text
SEO title
Meta description
Slug
Canonical URL
Robots directive
Open Graph title
Open Graph description
Social image
Structured data
```

---

# 35. STRUCTURED DATA

Where appropriate, implement structured data for:

* Organization
* LocalBusiness
* Product
* Breadcrumb
* Article
* FAQ where eligible/appropriate

Structured data must accurately represent visible page content.

---

# 36. GOOGLE SEARCH CONSOLE

Setup:

* Property verification
* Sitemap submission
* Indexing configuration
* URL inspection
* Search performance monitoring

The application should expose no fake claim of guaranteed indexing/ranking.

---

# 37. SITEMAP

Automatically generate sitemap.

Include eligible:

* Pages
* Products
* Categories
* Blogs
* SEO landing pages

Exclude:

* Cart
* Checkout
* Account
* Login
* Admin
* Private/customer pages

---

# 38. ROBOTS.TXT

Robots configuration should prevent crawling of private/system areas while allowing search engines to discover public content.

---

# 39. AEO FOUNDATION

Content architecture must support question-based discovery.

Examples:

```text
Where can I order a birthday cake in Nungambakkam?

Where can I get an eggless cake in Chennai?

How much does a customized cake cost?

Where can I order brownies online?
```

Answers should be factual, concise and backed by actual Kichees information.

---

# 40. ANALYTICS

Implement Google Analytics with ecommerce tracking.

Track:

```text
page_view
view_item
search
add_to_cart
remove_from_cart
begin_checkout
add_payment_info
purchase
login
sign_up
whatsapp_click
phone_click
directions_click
```

---

# 41. GOOGLE TAG MANAGER

Google Tag Manager must be installed through the website.

Events should be structured consistently so marketing tags can be managed centrally.

---

# 42. META PIXEL

Track appropriate events:

```text
PageView
ViewContent
AddToCart
InitiateCheckout
Purchase
```

Pixel IDs and configuration must be environment-specific.

---

# 43. CONSENT & PRIVACY

Tracking and marketing technologies must respect applicable privacy/consent requirements.

The system should provide a mechanism to:

* Display privacy policy
* Display cookie/tracking information where required
* Respect applicable consent choices
* Avoid sending unnecessary personal information to third parties

---

# 44. ADMIN DASHBOARD

Dashboard should display:

```text
Today's Sales
Today's Orders
Pending Orders
Completed Orders
Customers
Online Orders
Low Stock
Revenue
Recent Orders
Recent Customers
```

Dashboard widgets should be permission-aware.

---

# 45. REPORTING

## Sales Reports

* Daily
* Weekly
* Monthly
* Product-wise
* Category-wise
* Payment-wise

## Inventory

* Current stock
* Low stock
* Out of stock
* Stock movement

## Customer

* New customers
* Repeat customers
* Customer spending
* Order frequency

## Orders

* Pending
* Confirmed
* Preparing
* Completed
* Cancelled
* Refunded

---

# 46. ROLE-BASED ACCESS CONTROL

Permission system should use:

```text
USER
ROLE
PERMISSION
RESOURCE
ACTION
```

Example:

```text
inventory.view
inventory.create
inventory.update
inventory.adjust
orders.view
orders.update
billing.create
customers.view
cms.create
cms.publish
```

Never rely only on frontend hiding for security.

Permissions must be enforced server-side.

---

# 47. AUDIT LOG

Important admin actions must be logged.

Examples:

* Product price changed
* Stock adjusted
* Order cancelled
* Bill modified
* Customer data changed
* User created
* Role changed
* CMS page published

Audit record:

```text
user
action
resource
resource_id
old_value
new_value
timestamp
ip/device information where appropriate
```

---

# 48. SEARCH

Global/admin search should support:

* Products
* Customers
* Orders
* Bills
* SKUs

Customer website search should support:

* Product name
* Category
* Relevant product attributes

---

# 49. NOTIFICATION CENTER

Admin notification center may include:

* New order
* Payment failure
* Low stock
* Out-of-stock
* Failed WhatsApp message
* Failed email
* System alert

Notifications should be prioritised.

---

# 50. ERROR HANDLING

All external integrations must fail gracefully.

Examples:

### Payment gateway unavailable

Show:

> Payment could not be completed. Please try again.

Do not create a falsely paid order.

### WhatsApp unavailable

Order must still exist.

Communication should be retried/logged.

### Email failure

Order must not fail because email delivery failed.

---

# 51. PAYMENT WEBHOOK IDEMPOTENCY

Payment callbacks/webhooks may be delivered more than once.

Implementation must guarantee:

```text
Same webhook
+
Same transaction reference
=
One payment state transition
```

Never duplicate:

* Orders
* Payments
* Stock deductions
* Invoices

---

# 52. ORDER IDEMPOTENCY

Order creation must protect against:

* Double-click
* Browser retry
* Network retry
* Payment retry
* API retry

Use idempotency keys or equivalent architecture.

---

# 53. SECURITY

Minimum security requirements:

* HTTPS
* Secure cookies
* Password hashing if passwords are used
* OTP protection
* Rate limiting
* CSRF protection where applicable
* Input validation
* Output encoding
* SQL injection protection
* XSS protection
* RBAC
* Secure API authentication
* Secure secrets management
* Webhook signature verification
* Audit logs

---

# 54. BACKUPS

Database backup strategy must be established before production launch.

Recommended:

```text
Daily backup
+
Retention policy
+
Off-site backup
+
Restore testing
```

---

# 55. ENVIRONMENT MANAGEMENT

Minimum environments:

```text
LOCAL
DEVELOPMENT
STAGING
PRODUCTION
```

Production secrets must never be committed to source control.

---

# 56. CONFIGURATION

The following should be environment/config driven:

* Database
* WhatsApp credentials
* Email credentials
* Payment gateway
* Google Analytics ID
* GTM ID
* Meta Pixel ID
* Storage
* Domain
* API URLs

---

# 57. FILE / IMAGE MANAGEMENT

Media system should support:

* Product images
* Blog images
* CMS images
* Customer uploads where applicable

Requirements:

* File type validation
* File size limits
* Secure upload
* Image optimisation
* Responsive images
* CDN/storage-ready architecture

---

# 58. PERFORMANCE

Target:

* Fast mobile load
* Optimised images
* Lazy loading
* CDN-ready assets
* Caching
* Efficient API requests
* Database indexing
* Pagination
* Optimised queries

Avoid loading the entire product catalogue when only a page is required.

---

# 59. ACCESSIBILITY

The website should follow modern accessibility practices.

Include:

* Semantic HTML
* Keyboard navigation
* Accessible forms
* Labels
* Alt text
* Focus states
* Sufficient contrast
* Screen-reader-friendly structure

---

# 60. SEO URL STRUCTURE

Examples:

```text
/products
/products/cakes
/products/cakes/chocolate-truffle-cake

/customized-cakes
/birthday-cakes
/wedding-cakes
/eggless-cakes
/cakes-in-nungambakkam

/blog
/blog/best-birthday-cakes-in-chennai
```

URLs must be readable and stable.

---

# 61. INTERNAL LINKING

CMS should allow internal links between:

* Products
* Categories
* Blogs
* Landing pages
* FAQs

Example:

```text
Blog
 ↓
Birthday Cakes
 ↓
Product
 ↓
Order
```

---

# 62. CUSTOMER CONVERSION CTAs

Public pages should support configurable CTAs:

```text
ORDER NOW
WHATSAPP US
CALL NOW
GET DIRECTIONS
CUSTOMIZE YOUR CAKE
VIEW MENU
```

---

# 63. WHATSAPP CTA

WhatsApp CTA should be available throughout important customer journeys.

Examples:

* Homepage
* Product page
* Customized cake page
* Contact page
* Checkout support

The CTA should preserve appropriate context where possible.

---

# 64. ORDER NOTIFICATION FLOW

```text
CUSTOMER
   ↓
ORDER
   ↓
PAYMENT
   ↓
PAYMENT WEBHOOK
   ↓
ORDER CONFIRMED
   ↓
INVENTORY
   ↓
CRM
   ↓
WHATSAPP
   ↓
EMAIL
   ↓
ADMIN
```

---

# 65. CUSTOMER DATA FLOW

```text
Customer
   ↓
WhatsApp OTP
   ↓
Customer Account
   ↓
Order
   ↓
CRM
   ↓
Billing
   ↓
Purchase History
   ↓
Segmentation
```

---

# 66. ADMIN DATA FLOW

```text
Admin
 ↓
Dashboard
 ├── Orders
 ├── Products
 ├── Inventory
 ├── Customers
 ├── Billing
 ├── CMS
 ├── Blogs
 ├── SEO
 ├── Automation
 └── Reports
```

---

# 67. API MODULES

Recommended backend module structure:

```text
/auth
/users
/customers
/products
/categories
/inventory
/orders
/payments
/billing
/cms
/blogs
/seo
/notifications
/whatsapp
/email
/analytics
/reports
/settings
/audit
```

---

# 68. DATABASE CORE ENTITIES

Minimum entities:

```text
users
roles
permissions

customers
customer_addresses

products
product_variants
categories

inventory
inventory_movements

orders
order_items

payments
payment_transactions

invoices
invoice_items

cms_pages
cms_blocks

blogs
blog_categories
blog_tags

seo_metadata

notification_templates
notification_logs

audit_logs

settings
```

---

# 69. FUTURE-READY ENTITIES

Architecture should allow future addition of:

```text
suppliers
purchases
purchase_orders
expenses
employees
branches
delivery_agents
loyalty_accounts
coupons
gift_cards
subscriptions
corporate_accounts
```

These are not required for V1 unless explicitly included.

---

# 70. MULTI-OUTLET READINESS

V1 may operate with one outlet.

However, architecture should avoid hard-coding a single location.

Future model:

```text
business
   ↓
branches
   ↓
inventory per branch
   ↓
orders per branch
```

---

# 71. CORPORATE ORDER READINESS

Architecture should allow future:

* Corporate accounts
* Bulk orders
* Custom quotations
* Bulk pricing
* Company billing
* GST/business information
* Dedicated account management

---

# 72. CUSTOMER REVIEW FLOW

After completed order:

```text
ORDER COMPLETED
      ↓
WAIT / CONFIGURED DELAY
      ↓
WHATSAPP FOLLOW-UP
      ↓
REVIEW REQUEST
```

The system must not fabricate reviews or selectively manipulate customer ratings.

---

# 73. AUTOMATION ENGINE

Automation should be event-driven.

Example:

```text
EVENT:
ORDER_COMPLETED

RULE:
wait 4 hours

ACTION:
send WhatsApp template

THEN:
wait configured duration

ACTION:
send review request
```

Future automation rules should be configurable rather than hard-coded wherever practical.

---

# 74. AUTOMATION LOGS

Every automation should record:

```text
event
rule
customer
channel
template
status
provider_response
timestamp
```

Statuses:

```text
QUEUED
SENT
DELIVERED
FAILED
SKIPPED
```

---

# 75. ADMIN SETTINGS

Settings should include:

### Business

* Business name
* Logo
* Phone
* Email
* Address
* Opening hours

### Commerce

* Currency
* Taxes
* Delivery charges
* Minimum order
* Order settings

### Notifications

* WhatsApp
* Email
* Templates

### SEO

* Default SEO title
* Default description
* Sitemap
* Robots

### Analytics

* GA ID
* GTM ID
* Meta Pixel ID

---

# 76. ORDER FULFILMENT

Support:

```text
PICKUP
DELIVERY
```

Future:

```text
MULTI_BRANCH_PICKUP
THIRD_PARTY_DELIVERY
OWN_DELIVERY
```

---

# 77. DATE/TIME ORDERING

Certain products may require advance preparation.

Product/category should optionally support:

```text
minimum_preparation_time
advance_order_required
same_day_available
```

Checkout must prevent impossible preparation windows.

---

# 78. CUSTOM ORDER VALIDATION

For customized cakes:

```text
Required date
+
Required time
+
Weight
+
Flavour
+
Customization details
```

must be collected before final confirmation where configured as mandatory.

---

# 79. PRODUCT AVAILABILITY

Product availability should consider:

```text
active status
+
stock
+
pickup availability
+
delivery availability
+
date/time constraints
```

---

# 80. ADMIN UX REQUIREMENTS

Admin dashboard must prioritise:

1. Orders
2. Billing
3. Inventory
4. Customers
5. Products
6. Reports
7. CMS
8. Automation
9. Settings

Frequently used operations should require minimal clicks.

---

# 81. CUSTOMER UX REQUIREMENTS

Primary journey:

```text
LAND
 ↓
DISCOVER
 ↓
PRODUCT
 ↓
ADD TO CART
 ↓
CHECKOUT
 ↓
LOGIN/OTP
 ↓
PAY
 ↓
CONFIRM
```

Avoid unnecessary registration barriers.

---

# 82. SUCCESS CRITERIA

The product is considered V1-ready when:

### Website

* All public pages work
* Mobile responsive
* Product browsing works
* Search works
* Cart works
* Checkout works

### Commerce

* Orders can be created
* Payments can be verified
* Order status works
* Inventory updates correctly
* Billing works

### CRM

* Customers are created automatically
* Order history is available
* Customer records are searchable

### WhatsApp

* OTP works
* Transactional notifications work
* Logs are available

### CMS

* Admin can create/edit/publish pages
* Blogs can be managed
* SEO metadata can be edited

### SEO

* Sitemap works
* Robots works
* Canonicals work
* Metadata works
* Search Console configured
* 45 content assets published/configured

### Analytics

* GA events fire
* GTM installed
* Meta Pixel events fire

---

# 83. TESTING REQUIREMENTS

Testing must cover:

### Functional

* Login
* OTP
* Products
* Cart
* Checkout
* Payment
* Orders
* Billing
* Inventory
* CRM
* CMS

### Integration

* WhatsApp
* Email
* Payment gateway
* Google Analytics
* GTM
* Meta Pixel

### Security

* Authentication
* Authorisation
* Input validation
* Rate limiting
* Webhook verification

### Responsive

* Mobile
* Tablet
* Desktop

### Edge Cases

* Payment failure
* Payment retry
* Duplicate payment webhook
* Duplicate order request
* Out-of-stock purchase
* Cancelled order
* Partial failures
* WhatsApp failure
* Email failure

---

# 84. ANALYTICS SUCCESS EVENTS

The implementation must make these measurable:

```text
website_visit
product_view
search
whatsapp_click
call_click
directions_click
add_to_cart
begin_checkout
login
sign_up
payment_started
purchase
```

---

# 85. NON-FUNCTIONAL REQUIREMENTS

The platform must be:

* Secure
* Scalable
* Maintainable
* Modular
* Responsive
* SEO-friendly
* API-driven
* Observable
* Backup-ready
* Integration-ready

---

# 86. V1 SCOPE

## INCLUDED

* Customer website
* Admin dashboard
* CMS
* Product management
* Product variants
* Product-level inventory
* Online ordering
* Cart
* Checkout
* Payment gateway integration
* CRM
* Billing
* Invoices
* WhatsApp OTP
* WhatsApp transactional automation
* Email notifications
* 45 SEO/AEO content assets
* Technical SEO
* Google Search Console setup
* Sitemap
* Robots.txt
* Structured data foundation
* Google Analytics
* Google Tag Manager
* Meta Pixel
* Reports
* Role-based access
* Audit logs
* Production deployment
* Testing

---

# 87. V1 EXCLUSIONS

Unless separately approved:

* Native Android application
* Native iOS application
* Multi-branch operations
* Advanced delivery fleet management
* Supplier management
* Purchase orders
* Full accounting system
* Payroll
* HR
* Advanced loyalty program
* Gift card system
* Subscription engine
* Franchise management
* Marketplace integrations
* Advanced AI chatbot
* AI-generated content automation
* Server-side Meta Conversions API
* Advanced marketing automation platform

---

# 88. THIRD-PARTY DEPENDENCIES

The platform may depend on:

* WhatsApp Business/Meta API
* Payment gateway
* Email provider
* Hosting/cloud provider
* Google Analytics
* Google Tag Manager
* Google Search Console
* Meta
* Object/file storage
* CDN

Third-party availability, approval, pricing and API changes are outside the application's control.

---

# 89. THIRD-PARTY COSTS

The following are separate from development unless specifically included commercially:

* WhatsApp messaging/API charges
* Payment gateway transaction fees
* Email provider fees
* Hosting
* Domain
* CDN/storage
* Premium APIs
* SMS services
* Third-party software subscriptions

---

# 90. DEFINITION OF DONE

A feature is considered complete only when:

1. UI is implemented.
2. Backend logic is implemented.
3. Database changes are implemented.
4. Permissions are enforced.
5. Validation exists.
6. Error states exist.
7. Loading states exist.
8. Mobile behaviour is tested.
9. Analytics events are implemented where applicable.
10. Relevant audit logs exist.
11. Integration failures are handled.
12. Tests pass.
13. Feature is deployed to staging.
14. Acceptance criteria are verified.

---

# 91. PRODUCT NORTH STAR

The entire platform should ultimately support one simple business loop:

```text
DISCOVER
   ↓
VISIT WEBSITE
   ↓
BROWSE
   ↓
LOGIN
   ↓
ORDER
   ↓
PAY
   ↓
FULFIL
   ↓
BILL
   ↓
UPDATE INVENTORY
   ↓
UPDATE CRM
   ↓
WHATSAPP FOLLOW-UP
   ↓
REVIEW
   ↓
REPEAT CUSTOMER
```

---

# 92. FINAL PRODUCT DEFINITION

Kichees is not being built as a simple bakery website.

It is a **Digital Commerce & Business Operating Platform**.

The core ecosystem is:

```text
                 KICHEES PLATFORM
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     CUSTOMER        COMMERCE       OPERATIONS
        │              │              │
     Website          Orders        Inventory
     Login            Payments      Billing
     WhatsApp         Cart          CRM
     Email            Checkout      Reports
        │              │              │
        └──────────────┼──────────────┘
                       │
                   GROWTH LAYER
                       │
             SEO / AEO / Analytics
                       │
                WhatsApp Automation
                       │
                Customer Retention
```

## CORE PRINCIPLE

**One Customer. One Account. One Order History. One CRM. One Inventory. One Commerce Platform.**

The system should be designed so that Kichees can operate its digital business from one central platform today and expand into multiple outlets, advanced CRM, delivery, loyalty, corporate ordering and mobile applications in the future without replacing the core architecture.
