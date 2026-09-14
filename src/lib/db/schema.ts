import {
  pgTable,
  serial,
  text,
  numeric,
  integer,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums based on PRODUCT.md
export const statusEnum = pgEnum("status", ["active", "inactive", "archived"]);
export const userRoleEnum = pgEnum("user_role", [
  "SUPER_ADMIN",
  "MANAGER",
  "BILLING_STAFF",
  "INVENTORY_STAFF",
  "CONTENT_MANAGER",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING_PAYMENT",
  "PAID",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
]);
export const fulfilmentTypeEnum = pgEnum("fulfilment_type", ["PICKUP", "DELIVERY"]);
export const movementTypeEnum = pgEnum("movement_type", [
  "OPENING",
  "PURCHASE",
  "SALE",
  "RETURN",
  "CANCELLATION",
  "DAMAGE",
  "ADJUSTMENT",
  "TRANSFER",
]);

// 1. Staff / Admin Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").default("MANAGER").notNull(),
  avatarUrl: text("avatar_url"),
  status: statusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sku: text("sku").notNull().unique(),
  categoryId: integer("category_id").references(() => categories.id),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  lowStockThreshold: integer("low_stock_threshold").default(5).notNull(),
  status: statusEnum("status").default("active").notNull(),
  featured: boolean("featured").default(false).notNull(),
  bestSeller: boolean("best_seller").default(false).notNull(),
  availableAt: timestamp("available_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 4. Product Variants
export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  name: text("name").notNull(), // e.g., "0.5 KG", "1 KG"
  sku: text("sku").notNull(),
  weight: text("weight"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").default(0).notNull(),
  available: boolean("available").default(true).notNull(),
});

// 5. Customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  mobile: text("mobile").notNull().unique(),
  email: text("email"),
  totalOrders: integer("total_orders").default(0).notNull(),
  totalSpend: numeric("total_spend", { precision: 10, scale: 2 }).default("0.00").notNull(),
  tags: text("tags"), // comma-separated e.g. "REPEAT_CUSTOMER,CAKE_CUSTOMER"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 6. Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  customerMobile: text("customer_mobile").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  tax: numeric("tax", { precision: 10, scale: 2 }).default("0.00").notNull(),
  deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 }).default("0.00").notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("PENDING").notNull(),
  paymentReference: text("payment_reference"),
  orderStatus: orderStatusEnum("order_status").default("PENDING_PAYMENT").notNull(),
  fulfilmentType: fulfilmentTypeEnum("fulfilment_type").default("PICKUP").notNull(),
  deliveryAddress: text("delivery_address"),
  requestedDate: text("requested_date"),
  requestedTime: text("requested_time"),
  customerNotes: text("customer_notes"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 7. Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id)
    .notNull(),
  productId: integer("product_id").references(() => products.id),
  variantId: integer("variant_id").references(() => productVariants.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  customizationNotes: text("customization_notes"),
});

// 8. Inventory Movements (PRODUCT.md Section 16)
export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  variantId: integer("variant_id").references(() => productVariants.id),
  type: movementTypeEnum("type").notNull(),
  quantity: integer("quantity").notNull(),
  previousStock: integer("previous_stock").notNull(),
  newStock: integer("new_stock").notNull(),
  reason: text("reason").notNull(),
  referenceId: text("reference_id"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 9. Audit Logs (PRODUCT.md Section 47)
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(), // e.g. "product.price_changed", "stock.adjusted"
  resource: text("resource").notNull(),
  resourceId: text("resource_id").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type User = typeof users.$inferSelect;
