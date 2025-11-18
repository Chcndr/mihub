import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, tinyint } from "drizzle-orm/mysql-core";
/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
    /**
     * Surrogate primary key. Auto-incremented numeric value managed by the database.
     * Use this for relations between tables.
     */
    id: int("id").autoincrement().primaryKey(),
    /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
// Extended users table with wallet and sustainability
export const extendedUsers = mysqlTable("extended_users", {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").notNull().references(() => users.id),
    walletBalance: int("wallet_balance").default(0).notNull(), // TCC disponibili
    sustainabilityRating: int("sustainability_rating").default(0), // 0-100
    transportPreference: varchar("transport_preference", { length: 50 }), // bike, car, bus, walk
    phone: varchar("phone", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export const markets = mysqlTable("markets", {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    address: text("address").notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    lat: varchar("lat", { length: 20 }).notNull(), // Store as string for precision
    lng: varchar("lng", { length: 20 }).notNull(),
    openingHours: text("opening_hours"), // JSON string
    active: int("active").default(1).notNull(), // 1=true, 0=false
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const shops = mysqlTable("shops", {
    id: int("id").autoincrement().primaryKey(),
    marketId: int("market_id").references(() => markets.id),
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 100 }), // bio, km0, dop, standard
    certifications: text("certifications"), // JSON array ["BIO", "KM0"]
    pendingReimbursement: int("pending_reimbursement").default(0).notNull(),
    totalReimbursed: int("total_reimbursed").default(0).notNull(),
    bankAccount: varchar("bank_account", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const transactions = mysqlTable("transactions", {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").references(() => users.id),
    shopId: int("shop_id").references(() => shops.id),
    type: varchar("type", { length: 50 }).notNull(), // earn, spend, refund
    amount: int("amount").notNull(), // TCC
    euroValue: int("euro_value"), // Store as cents (€1.50 = 150)
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const checkins = mysqlTable("checkins", {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").references(() => users.id),
    marketId: int("market_id").references(() => markets.id),
    transport: varchar("transport", { length: 50 }), // bike, car, bus, walk
    lat: varchar("lat", { length: 20 }), // Anonimizzata (griglia 100m)
    lng: varchar("lng", { length: 20 }),
    carbonSaved: int("carbon_saved"), // grams CO₂ (1500 = 1.5kg)
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const carbonCreditsConfig = mysqlTable("carbon_credits_config", {
    id: int("id").autoincrement().primaryKey(),
    baseValue: int("base_value").notNull(), // Cents (€1.50 = 150)
    areaBoosts: text("area_boosts"), // JSON {"Grosseto": 0, "Follonica": -10}
    categoryBoosts: text("category_boosts"), // JSON {"BIO": 20, "KM0": 15}
    updatedBy: varchar("updated_by", { length: 255 }),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export const fundTransactions = mysqlTable("fund_transactions", {
    id: int("id").autoincrement().primaryKey(),
    type: varchar("type", { length: 50 }).notNull(), // income, expense
    source: varchar("source", { length: 255 }).notNull(),
    amount: int("amount").notNull(), // Cents
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const reimbursements = mysqlTable("reimbursements", {
    id: int("id").autoincrement().primaryKey(),
    shopId: int("shop_id").references(() => shops.id),
    credits: int("credits").notNull(),
    euros: int("euros").notNull(), // Cents
    status: varchar("status", { length: 50 }).default("pending").notNull(),
    batchId: varchar("batch_id", { length: 100 }),
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const civicReports = mysqlTable("civic_reports", {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").references(() => users.id),
    type: varchar("type", { length: 100 }).notNull(),
    description: text("description").notNull(),
    lat: varchar("lat", { length: 20 }),
    lng: varchar("lng", { length: 20 }),
    photoUrl: text("photo_url"),
    status: varchar("status", { length: 50 }).default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const products = mysqlTable("products", {
    id: int("id").autoincrement().primaryKey(),
    shopId: int("shop_id").references(() => shops.id),
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 100 }),
    certifications: text("certifications"), // JSON array
    price: int("price"), // Cents
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const productTracking = mysqlTable("product_tracking", {
    id: int("id").autoincrement().primaryKey(),
    productId: int("product_id").references(() => products.id),
    tpassId: varchar("tpass_id", { length: 255 }).unique(),
    originCountry: varchar("origin_country", { length: 3 }),
    originCity: varchar("origin_city", { length: 255 }),
    transportMode: varchar("transport_mode", { length: 50 }),
    distanceKm: int("distance_km"),
    co2Kg: int("co2_kg"), // grams
    dppHash: varchar("dpp_hash", { length: 255 }),
    customsCleared: int("customs_cleared").default(0).notNull(),
    ivaVerified: int("iva_verified").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const carbonFootprint = mysqlTable("carbon_footprint", {
    id: int("id").autoincrement().primaryKey(),
    productId: int("product_id").references(() => products.id),
    lifecycleCo2: int("lifecycle_co2"), // grams
    transportCo2: int("transport_co2"),
    packagingCo2: int("packaging_co2"),
    totalCo2: int("total_co2"),
    calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});
export const ecocredits = mysqlTable("ecocredits", {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").references(() => users.id),
    tccConverted: int("tcc_converted").notNull(),
    ecocreditAmount: int("ecocredit_amount").notNull(), // Cents
    tpasFundId: varchar("tpas_fund_id", { length: 255 }),
    conversionRate: int("conversion_rate").notNull(), // Cents
    convertedAt: timestamp("converted_at").defaultNow().notNull(),
});
export const auditLogs = mysqlTable("audit_logs", {
    id: int("id").autoincrement().primaryKey(),
    userEmail: varchar("user_email", { length: 255 }),
    action: varchar("action", { length: 255 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }),
    entityId: int("entity_id"),
    oldValue: text("old_value"), // JSON
    newValue: text("new_value"), // JSON
    ipAddress: varchar("ip_address", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const systemLogs = mysqlTable("system_logs", {
    id: int("id").autoincrement().primaryKey(),
    app: varchar("app", { length: 100 }).notNull(),
    level: varchar("level", { length: 50 }).notNull(), // info, warning, error
    type: varchar("type", { length: 100 }),
    message: text("message").notNull(),
    userEmail: varchar("user_email", { length: 255 }),
    ipAddress: varchar("ip_address", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const userAnalytics = mysqlTable("user_analytics", {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").references(() => users.id),
    transport: varchar("transport", { length: 50 }), // bike, car, bus, walk
    origin: varchar("origin", { length: 255 }), // City/region
    sustainabilityRating: int("sustainability_rating"), // 0-100
    co2Saved: int("co2_saved"), // grams
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const sustainabilityMetrics = mysqlTable("sustainability_metrics", {
    id: int("id").autoincrement().primaryKey(),
    date: timestamp("date").notNull(),
    populationRating: int("population_rating").notNull(), // 0-100
    totalCo2Saved: int("total_co2_saved").notNull(), // kg
    localPurchases: int("local_purchases").notNull(),
    ecommercePurchases: int("ecommerce_purchases").notNull(),
    avgCo2Local: int("avg_co2_local").notNull(), // grams
    avgCo2Ecommerce: int("avg_co2_ecommerce").notNull(), // grams
});
export const notifications = mysqlTable("notifications", {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    type: varchar("type", { length: 50 }).notNull(), // push, email, sms
    targetUsers: text("target_users"), // JSON array of user IDs
    sent: int("sent").notNull().default(0),
    delivered: int("delivered").notNull().default(0),
    opened: int("opened").notNull().default(0),
    clicked: int("clicked").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const inspections = mysqlTable("inspections", {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("business_id"),
    businessName: varchar("business_name", { length: 255 }).notNull(),
    type: varchar("type", { length: 100 }).notNull(), // DURC, HACCP, Sicurezza, etc.
    inspector: varchar("inspector", { length: 255 }),
    status: varchar("status", { length: 50 }).notNull(), // scheduled, completed, violation
    scheduledDate: timestamp("scheduled_date"),
    completedDate: timestamp("completed_date"),
    violationFound: tinyint("violation_found").default(0),
    fineAmount: int("fine_amount"), // Cents
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const businessAnalytics = mysqlTable("business_analytics", {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("business_id"),
    businessName: varchar("business_name", { length: 255 }).notNull(),
    category: varchar("category", { length: 100 }),
    totalSales: int("total_sales").notNull().default(0),
    totalCredits: int("total_credits").notNull().default(0), // TCC issued
    totalRevenue: int("total_revenue").notNull().default(0), // Cents
    rating: int("rating").default(0), // 0-5 stars
    isActive: tinyint("is_active").default(1),
    lastSaleAt: timestamp("last_sale_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const mobilityData = mysqlTable("mobility_data", {
    id: int("id").autoincrement().primaryKey(),
    type: varchar("type", { length: 50 }).notNull(), // bus, tram, parking
    lineNumber: varchar("line_number", { length: 20 }),
    lineName: varchar("line_name", { length: 255 }),
    stopName: varchar("stop_name", { length: 255 }),
    lat: varchar("lat", { length: 20 }),
    lng: varchar("lng", { length: 20 }),
    status: varchar("status", { length: 50 }).default("active"), // active, delayed, suspended
    occupancy: int("occupancy"), // 0-100%
    availableSpots: int("available_spots"), // For parking
    totalSpots: int("total_spots"), // For parking
    nextArrival: int("next_arrival"), // Minutes
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
