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

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

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

// Export types
export type ExtendedUser = typeof extendedUsers.$inferSelect;
export type Market = typeof markets.$inferSelect;
export type Shop = typeof shops.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Checkin = typeof checkins.$inferSelect;
export type CarbonCreditsConfig = typeof carbonCreditsConfig.$inferSelect;
export type FundTransaction = typeof fundTransactions.$inferSelect;
export type Reimbursement = typeof reimbursements.$inferSelect;
export type CivicReport = typeof civicReports.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductTracking = typeof productTracking.$inferSelect;
export type CarbonFootprint = typeof carbonFootprint.$inferSelect;
export type Ecocredit = typeof ecocredits.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type SystemLog = typeof systemLogs.$inferSelect;
export type UserAnalytics = typeof userAnalytics.$inferSelect;
export type SustainabilityMetric = typeof sustainabilityMetrics.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Inspection = typeof inspections.$inferSelect;
export type BusinessAnalytics = typeof businessAnalytics.$inferSelect;
export type MobilityData = typeof mobilityData.$inferSelect;
// ============================================
// DMS HUB - Sistema Gestione Mercati Completo
// ============================================

// Geometria mercati estesa (da Slot Editor v3)
export const marketGeometry = mysqlTable("market_geometry", {
  id: int("id").autoincrement().primaryKey(),
  marketId: int("market_id").references(() => markets.id).notNull(),
  containerGeojson: text("container_geojson"), // Container mercato
  centerLat: varchar("center_lat", { length: 20 }).notNull(),
  centerLng: varchar("center_lng", { length: 20 }).notNull(),
  hubAreaGeojson: text("hub_area_geojson"), // Area HUB
  marketAreaGeojson: text("market_area_geojson"), // Area mercato
  gcpData: text("gcp_data"), // Ground Control Points (JSON)
  pngUrl: text("png_url"), // URL pianta trasparente
  pngMetadata: text("png_metadata"), // Metadati PNG (JSON)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Posteggi (stalls)
export const stalls = mysqlTable("stalls", {
  id: int("id").autoincrement().primaryKey(),
  marketId: int("market_id").references(() => markets.id).notNull(),
  number: varchar("number", { length: 20 }).notNull(), // Numero posteggio
  lat: varchar("lat", { length: 20 }).notNull(),
  lng: varchar("lng", { length: 20 }).notNull(),
  areaMq: int("area_mq"), // Area in metri quadrati
  status: varchar("status", { length: 50 }).default("free").notNull(), // free, reserved, occupied, booked, maintenance
  category: varchar("category", { length: 100 }), // alimentari, abbigliamento, artigianato, etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Operatori/Ambulanti (vendors)
export const vendors = mysqlTable("vendors", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id), // Link a utente se registrato
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  fiscalCode: varchar("fiscal_code", { length: 16 }).unique(),
  vatNumber: varchar("vat_number", { length: 20 }).unique(),
  businessName: varchar("business_name", { length: 255 }),
  businessType: varchar("business_type", { length: 100 }), // Tipo attività
  atecoCode: varchar("ateco_code", { length: 20 }), // Codice ATECO
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  bankAccount: varchar("bank_account", { length: 100 }), // IBAN
  photoUrl: text("photo_url"),
  status: varchar("status", { length: 50 }).default("active").notNull(), // active, suspended, inactive
  rating: int("rating").default(0), // 0-5 stars (x100 per decimali)
  totalSales: int("total_sales").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Concessioni
export const concessions = mysqlTable("concessions", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendor_id").references(() => vendors.id).notNull(),
  stallId: int("stall_id").references(() => stalls.id),
  marketId: int("market_id").references(() => markets.id).notNull(),
  concessionNumber: varchar("concession_number", { length: 100 }).unique().notNull(),
  type: varchar("type", { length: 50 }).notNull(), // daily, monthly, yearly, permanent
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: varchar("status", { length: 50 }).default("active").notNull(), // active, expired, suspended, revoked
  fee: int("fee"), // Cents
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"), // pending, paid, overdue
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Documenti operatori
export const vendorDocuments = mysqlTable("vendor_documents", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendor_id").references(() => vendors.id).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // id_card, business_license, haccp, insurance, health_cert, etc.
  documentNumber: varchar("document_number", { length: 100 }),
  issueDate: timestamp("issue_date"),
  expiryDate: timestamp("expiry_date"),
  fileUrl: text("file_url"),
  status: varchar("status", { length: 50 }).default("valid").notNull(), // valid, expired, missing, pending
  verifiedBy: varchar("verified_by", { length: 255 }), // Email verificatore
  verifiedAt: timestamp("verified_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Prenotazioni posteggi
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  stallId: int("stall_id").references(() => stalls.id).notNull(),
  userId: int("user_id").references(() => users.id), // Cittadino che prenota
  vendorId: int("vendor_id").references(() => vendors.id), // Operatore assegnato
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, confirmed, completed, cancelled, expired
  bookingDate: timestamp("booking_date").notNull(), // Data prenotazione
  expiresAt: timestamp("expires_at").notNull(), // Scadenza prenotazione (es. +30 min)
  checkedInAt: timestamp("checked_in_at"), // Quando operatore fa check-in
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Presenze operatori (check-in/check-out)
export const vendorPresences = mysqlTable("vendor_presences", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendor_id").references(() => vendors.id).notNull(),
  stallId: int("stall_id").references(() => stalls.id).notNull(),
  bookingId: int("booking_id").references(() => bookings.id),
  checkinTime: timestamp("checkin_time").notNull(),
  checkoutTime: timestamp("checkout_time"),
  duration: int("duration"), // Minuti
  lat: varchar("lat", { length: 20 }), // GPS check-in
  lng: varchar("lng", { length: 20 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Controlli dettagliati (per Polizia Municipale)
export const inspectionsDetailed = mysqlTable("inspections_detailed", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendor_id").references(() => vendors.id).notNull(),
  stallId: int("stall_id").references(() => stalls.id),
  inspectorName: varchar("inspector_name", { length: 255 }).notNull(),
  inspectorBadge: varchar("inspector_badge", { length: 100 }),
  type: varchar("type", { length: 100 }).notNull(), // routine, complaint, random, targeted
  checklist: text("checklist"), // JSON checklist items
  photosUrls: text("photos_urls"), // JSON array URLs
  gpsLat: varchar("gps_lat", { length: 20 }),
  gpsLng: varchar("gps_lng", { length: 20 }),
  result: varchar("result", { length: 50 }).notNull(), // compliant, violation, warning
  notes: text("notes"),
  signatureUrl: text("signature_url"), // Firma digitale operatore
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Verbali/Sanzioni
export const violations = mysqlTable("violations", {
  id: int("id").autoincrement().primaryKey(),
  inspectionId: int("inspection_id").references(() => inspectionsDetailed.id),
  vendorId: int("vendor_id").references(() => vendors.id).notNull(),
  stallId: int("stall_id").references(() => stalls.id),
  violationType: varchar("violation_type", { length: 100 }).notNull(), // late_checkin, missing_doc, hygiene, unauthorized, etc.
  violationCode: varchar("violation_code", { length: 50 }),
  description: text("description").notNull(),
  fineAmount: int("fine_amount"), // Cents
  status: varchar("status", { length: 50 }).default("issued").notNull(), // issued, paid, appealed, cancelled
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  paymentReference: varchar("payment_reference", { length: 255 }),
  appealNotes: text("appeal_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Pagamenti concessioni
export const concessionPayments = mysqlTable("concession_payments", {
  id: int("id").autoincrement().primaryKey(),
  concessionId: int("concession_id").references(() => concessions.id).notNull(),
  vendorId: int("vendor_id").references(() => vendors.id).notNull(),
  amount: int("amount").notNull(), // Cents
  paymentMethod: varchar("payment_method", { length: 50 }), // bank_transfer, cash, card, etc.
  paymentReference: varchar("payment_reference", { length: 255 }),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, completed, failed, refunded
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Marker personalizzati (da Slot Editor v3)
export const customMarkers = mysqlTable("custom_markers", {
  id: int("id").autoincrement().primaryKey(),
  marketId: int("market_id").references(() => markets.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }), // entrance, exit, wc, info, parking, etc.
  lat: varchar("lat", { length: 20 }).notNull(),
  lng: varchar("lng", { length: 20 }).notNull(),
  icon: varchar("icon", { length: 100 }), // Nome icona
  color: varchar("color", { length: 20 }), // Colore marker
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Aree custom (da Slot Editor v3)
export const customAreas = mysqlTable("custom_areas", {
  id: int("id").autoincrement().primaryKey(),
  marketId: int("market_id").references(() => markets.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }), // food, clothing, handicraft, services, etc.
  geojson: text("geojson").notNull(), // Polygon GeoJSON
  color: varchar("color", { length: 20 }), // Colore area
  opacity: int("opacity").default(50), // 0-100
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Export types per le nuove tabelle
export type MarketGeometry = typeof marketGeometry.$inferSelect;
export type Stall = typeof stalls.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type Concession = typeof concessions.$inferSelect;
export type VendorDocument = typeof vendorDocuments.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type VendorPresence = typeof vendorPresences.$inferSelect;
export type InspectionDetailed = typeof inspectionsDetailed.$inferSelect;
export type Violation = typeof violations.$inferSelect;
export type ConcessionPayment = typeof concessionPayments.$inferSelect;
export type CustomMarker = typeof customMarkers.$inferSelect;
export type CustomArea = typeof customAreas.$inferSelect;

// ============================================
// SISTEMA INTEGRAZIONI - API Keys, Webhook, Monitoring
// ============================================

// API Keys per autenticazione applicazioni esterne
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // Es: "App Cittadini - Production"
  key: varchar("key", { length: 255 }).notNull().unique(), // dms_live_xxxxx o dms_test_xxxxx
  environment: varchar("environment", { length: 50 }).default("production").notNull(), // production, development, staging
  status: varchar("status", { length: 50 }).default("active").notNull(), // active, inactive, revoked
  permissions: text("permissions"), // JSON array ["markets.read", "stalls.write", etc.]
  rateLimit: int("rate_limit").default(1000).notNull(), // Richieste per minuto
  lastUsedAt: timestamp("last_used_at"),
  lastUsedIp: varchar("last_used_ip", { length: 50 }),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Metriche utilizzo API per monitoraggio performance
export const apiMetrics = mysqlTable("api_metrics", {
  id: int("id").autoincrement().primaryKey(),
  apiKeyId: int("api_key_id").references(() => apiKeys.id),
  endpoint: varchar("endpoint", { length: 255 }).notNull(), // /api/dmsHub/markets/list
  method: varchar("method", { length: 10 }).notNull(), // GET, POST, PUT, DELETE
  statusCode: int("status_code").notNull(), // 200, 404, 500, etc.
  responseTime: int("response_time").notNull(), // Millisecondi
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Webhook configurati per notifiche real-time
export const webhooks = mysqlTable("webhooks", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // Es: "Notifica Nuova Prenotazione"
  url: varchar("url", { length: 500 }).notNull(), // Endpoint destinazione
  events: text("events").notNull(), // JSON array ["booking.created", "vendor.updated"]
  status: varchar("status", { length: 50 }).default("active").notNull(), // active, inactive, pending
  secret: varchar("secret", { length: 255 }), // Per firma HMAC
  headers: text("headers"), // JSON object custom headers
  retryPolicy: text("retry_policy"), // JSON {maxRetries: 3, backoff: "exponential"}
  lastTriggeredAt: timestamp("last_triggered_at"),
  successCount: int("success_count").default(0).notNull(),
  failureCount: int("failure_count").default(0).notNull(),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Log esecuzioni webhook per debugging
export const webhookLogs = mysqlTable("webhook_logs", {
  id: int("id").autoincrement().primaryKey(),
  webhookId: int("webhook_id").references(() => webhooks.id).notNull(),
  event: varchar("event", { length: 100 }).notNull(), // booking.created
  payload: text("payload").notNull(), // JSON dati inviati
  statusCode: int("status_code"), // Response HTTP status
  responseBody: text("response_body"),
  responseTime: int("response_time"), // Millisecondi
  success: int("success").default(0).notNull(), // 1=success, 0=failure
  errorMessage: text("error_message"),
  retryCount: int("retry_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Stato connessioni esterne (ARPAE, TPER, TPAS, Heroku)
export const externalConnections = mysqlTable("external_connections", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // ARPAE, TPER, TPAS, Gestionale Heroku
  type: varchar("type", { length: 100 }).notNull(), // api, database, webhook, sftp
  endpoint: varchar("endpoint", { length: 500 }), // Base URL
  status: varchar("status", { length: 50 }).default("disconnected").notNull(), // connected, disconnected, pending, error
  lastCheckAt: timestamp("last_check_at"),
  lastSyncAt: timestamp("last_sync_at"),
  lastError: text("last_error"),
  healthCheckInterval: int("health_check_interval").default(300).notNull(), // Secondi
  config: text("config"), // JSON configurazione specifica
  features: text("features"), // JSON array funzionalità
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Export types
export type ApiKey = typeof apiKeys.$inferSelect;
export type ApiMetric = typeof apiMetrics.$inferSelect;
export type Webhook = typeof webhooks.$inferSelect;
export type WebhookLog = typeof webhookLogs.$inferSelect;
export type ExternalConnection = typeof externalConnections.$inferSelect;

// MIO Agent Logs - Sistema di logging per agenti AI
export const mioAgentLogs = mysqlTable("mio_agent_logs", {
  id: int("id").autoincrement().primaryKey(),
  agent: varchar("agent", { length: 100 }).notNull(), // Nome agente (MIO, Manus, etc.)
  action: varchar("action", { length: 255 }).notNull(), // Azione eseguita
  status: mysqlEnum("status", ["success", "error", "warning", "info"]).notNull(),
  message: text("message"), // Messaggio descrittivo
  details: text("details"), // JSON con dettagli aggiuntivi
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MioAgentLog = typeof mioAgentLogs.$inferSelect;
export type InsertMioAgentLog = typeof mioAgentLogs.$inferInsert;
