import { InferInsertModel, InferSelectModel, relations, sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp, boolean, pgEnum, jsonb, uniqueIndex, decimal, primaryKey } from "drizzle-orm/pg-core";

// =====================
// Enums
// =====================
export const notificationTypeEnum = pgEnum('notification_type', ['LIVE_STREAM', 'ORDER_UPDATE', 'NEW_VIDEO', 'FOLLOW']);
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
export const streamStatusEnum = pgEnum('stream_status', ['SCHEDULED', 'LIVE', 'ENDED']);

// =====================
// User & Authentication
// =====================
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});
// =====================
// Vendor Management
// =====================
export const vendor = pgTable("vendor", {
	id: text('id').primaryKey().references(() => user.id, { onDelete: "cascade" }),
	storeName: text("store_name").notNull(),
	description: text("description"),
	isApproved: boolean("is_approved").default(false),
	commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

// =====================
// Live Streaming
// =====================
export const liveStream = pgTable("live_stream", {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()).notNull(),
	vendorId: text("vendor_id").notNull().references(() => vendor.id),
	title: text("title").notNull(),
	description: text("description"),
	scheduledStart: timestamp("scheduled_start").notNull(),
	actualStart: timestamp("actual_start"),
	actualEnd: timestamp("actual_end"),
	status: streamStatusEnum("status").default('SCHEDULED'),
	viewerCount: integer("viewer_count").default(0),
	chatId: text("chat_id"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const liveStreamProduct = pgTable("live_stream_product", {
	liveStreamId: text("live_stream_id").notNull().references(() => liveStream.id),
	productId: text("product_id").notNull().references(() => product.id),
	promotedAt: timestamp("promoted_at").notNull(),
}, (table) => ({
	pk: primaryKey({ columns: [table.liveStreamId, table.productId] })
}));

// =====================
// Short Videos
// =====================
export const shortVideo = pgTable("short_video", {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()).notNull(),
	vendorId: text("vendor_id").notNull().references(() => vendor.id),
	videoUrl: text("video_url").notNull(),
	thumbnailUrl: text("thumbnail_url"),
	description: text("description"),
	duration: integer("duration").notNull(),
	views: integer("views").default(0),
	likes: integer("likes").default(0),
	shares: integer("shares").default(0),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const videoProduct = pgTable("video_product", {
	videoId: text("video_id").notNull().references(() => shortVideo.id),
	productId: text("product_id").notNull().references(() => product.id),
	position: integer("position").notNull(),
}, (table) => ({
	pk: primaryKey({ columns: [table.videoId, table.productId] })
}));

// =====================
// Enhanced Product Schema
// =====================
export const product = pgTable("product", {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()).notNull(),
	vendorId: text("vendor_id").notNull().references(() => vendor.id),
	name: text("name").notNull(),
	description: text("description"),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	stock: integer("stock").default(0).notNull(),
	sku: text("sku").unique(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const productVariant = pgTable("product_variant", {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()).notNull(),
	productId: text("product_id").notNull().references(() => product.id),
	name: text("name").notNull(),
	value: text("value").notNull(),
	priceOffset: decimal("price_offset", { precision: 10, scale: 2 }).default('0.00'),
	stock: integer("stock").default(0).notNull(),
});

// =====================
// Enhanced Order System
// =====================
export const order = pgTable("order", {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()).notNull(),
	userId: text("user_id").notNull().references(() => user.id),
	totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
	status: orderStatusEnum("status").default('PENDING'),
	shippingAddressId: text("shipping_address_id").references(() => address.id),
	paymentMethod: text("payment_method").notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const orderItem = pgTable("order_item", {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()).notNull(),
	orderId: text("order_id").notNull().references(() => order.id),
	productId: text("product_id").notNull().references(() => product.id),
	variantId: text("variant_id").references(() => productVariant.id),
	quantity: integer("quantity").notNull(),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	vendorId: text("vendor_id").notNull().references(() => vendor.id),
});

// =====================
// Enhanced Address System
// =====================
export const address = pgTable("address", {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()).notNull(),
	userId: text("user_id").notNull().references(() => user.id),
	street: text("street").notNull(),
	city: text("city").notNull(),
	state: text("state"),
	zipCode: text("zip_code").notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

// =====================
// Enhanced Notification System
// =====================
export const notification = pgTable("notification", {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()).notNull(),
	userId: text("user_id").notNull().references(() => user.id),
	type: notificationTypeEnum("type").notNull(),
	title: text("title").notNull(),
	message: text("message").notNull(),
	relatedId: text("related_id"),
	isRead: boolean("is_read").default(false),
	createdAt: timestamp("created_at").notNull(),
});

// =====================
// Social Features
// =====================
export const follower = pgTable("follower", {
	userId: text("user_id").notNull().references(() => user.id),
	vendorId: text("vendor_id").notNull().references(() => vendor.id),
	createdAt: timestamp("created_at").notNull(),
}, (table) => ({
	pk: primaryKey({ columns: [table.userId, table.vendorId] })
}));

export const comment = pgTable("comment", {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()).notNull(),
	userId: text("user_id").notNull().references(() => user.id),
	content: text("content").notNull(),
	parentId: text("parent_id"),
	entityType: text("entity_type").notNull(), // 'LIVE_STREAM' or 'VIDEO'
	entityId: text("entity_id").notNull(),
	createdAt: timestamp("created_at").notNull(),
});

// =====================
// Analytics & Tracking
// =====================
export const productView = pgTable("product_view", {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()).notNull(),
	productId: text("product_id").notNull().references(() => product.id),
	userId: text("user_id").references(() => user.id),
	timestamp: timestamp("timestamp").notNull(),
});

export const streamAnalytics = pgTable("stream_analytics", {
	streamId: text("stream_id").primaryKey().references(() => liveStream.id),
	peakViewers: integer("peak_viewers").notNull(),
	avgViewDuration: integer("avg_view_duration").notNull(),
	productsSold: integer("products_sold").default(0),
	totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default('0.00'),
});

// =====================
// Relations
// =====================
export const vendorRelations = relations(vendor, ({ many }) => ({
	products: many(product),
	liveStreams: many(liveStream),
	shortVideos: many(shortVideo),
}));

export const productRelations = relations(product, ({ many, one }) => ({
	vendor: one(vendor, { fields: [product.vendorId], references: [vendor.id] }),
	variants: many(productVariant),
	liveStreamProducts: many(liveStreamProduct),
	videoProducts: many(videoProduct),
	orderItems: many(orderItem),
}));

export const productVariantRelations = relations(productVariant, ({ one }) => ({
	product: one(product, { fields: [productVariant.productId], references: [product.id] }),
}));

export const orderRelations = relations(order, ({ many, one }) => ({
	user: one(user, { fields: [order.userId], references: [user.id] }),
	items: many(orderItem),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
	order: one(order, { fields: [orderItem.orderId], references: [order.id] }),
	product: one(product, { fields: [orderItem.productId], references: [product.id] }),
}));