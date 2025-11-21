import { pgTable, pgEnum, text, timestamp, varchar, integer, boolean, serial, json, jsonb, real, index } from "drizzle-orm/pg-core";

// Enum definitions
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const statusEnum = pgEnum("status", ["success", "error", "warning", "info"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Extended users table with wallet and sustainability
export const extendedUsers = pgTable("extended_users", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  walletBalance: integer("wallet_balance").default(0).notNull(), // TCC disponibili
  sustainabilityRating: integer("sustainability_rating").default(0), // 0-100
  transportPreference: varchar("transport_preference", { length: 50 }), // bike, car, bus, walk
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const markets = pgTable("markets", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  lat: varchar("lat", { length: 20 }).notNull(), // Store as string for precision
  lng: varchar("lng", { length: 20 }).notNull(),
  openingHours: text("opening_hours"), // JSON string
  active: integer("active").default(1).notNull(), // 1=true, 0=false
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shops = pgTable("shops", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  marketId: integer("market_id").references(() => markets.id),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }), // bio, km0, dop, standard
  certifications: text("certifications"), // JSON array ["BIO", "KM0"]
  pendingReimbursement: integer("pending_reimbursement").default(0).notNull(),
  totalReimbursed: integer("total_reimbursed").default(0).notNull(),
  bankAccount: varchar("bank_account", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("user_id").references(() => users.id),
  shopId: integer("shop_id").references(() => shops.id),
  type: varchar("type", { length: 50 }).notNull(), // earn, spend, refund
  amount: integer("amount").notNull(), // TCC
  euroValue: integer("euro_value"), // Store as cents (€1.50 = 150)
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const checkins = pgTable("checkins", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("user_id").references(() => users.id),
  marketId: integer("market_id").references(() => markets.id),
  transport: varchar("transport", { length: 50 }), // bike, car, bus, walk
  lat: varchar("lat", { length: 20 }), // Anonimizzata (griglia 100m)
  lng: varchar("lng", { length: 20 }),
  carbonSaved: integer("carbon_saved"), // grams CO₂ (1500 = 1.5kg)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const carbonCreditsConfig = pgTable("carbon_credits_config", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  baseValue: integer("base_value").notNull(), // Cents (€1.50 = 150)
  areaBoosts: text("area_boosts"), // JSON {"Grosseto": 0, "Follonica": -10}
  categoryBoosts: text("category_boosts"), // JSON {"BIO": 20, "KM0": 15}
  updatedBy: varchar("updated_by", { length: 255 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fundTransactions = pgTable("fund_transactions", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // income, expense
  source: varchar("source", { length: 255 }).notNull(),
  amount: integer("amount").notNull(), // Cents
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reimbursements = pgTable("reimbursements", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  shopId: integer("shop_id").references(() => shops.id),
  credits: integer("credits").notNull(),
  euros: integer("euros").notNull(), // Cents
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  batchId: varchar("batch_id", { length: 100 }),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const civicReports = pgTable("civic_reports", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: varchar("type", { length: 100 }).notNull(),
  description: text("description").notNull(),
  lat: varchar("lat", { length: 20 }),
  lng: varchar("lng", { length: 20 }),
  photoUrl: text("photo_url"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  shopId: integer("shop_id").references(() => shops.id),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  certifications: text("certifications"), // JSON array
  price: integer("price"), // Cents
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productTracking = pgTable("product_tracking", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  productId: integer("product_id").references(() => products.id),
  tpassId: varchar("tpass_id", { length: 255 }).unique(),
  originCountry: varchar("origin_country", { length: 3 }),
  originCity: varchar("origin_city", { length: 255 }),
  transportMode: varchar("transport_mode", { length: 50 }),
  distanceKm: integer("distance_km"),
  co2Kg: integer("co2_kg"), // grams
  dppHash: varchar("dpp_hash", { length: 255 }),
  customsCleared: integer("customs_cleared").default(0).notNull(),
  ivaVerified: integer("iva_verified").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const carbonFootprint = pgTable("carbon_footprint", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  productId: integer("product_id").references(() => products.id),
  lifecycleCo2: integer("lifecycle_co2"), // grams
  transportCo2: integer("transport_co2"),
  packagingCo2: integer("packaging_co2"),
  totalCo2: integer("total_co2"),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

export const ecocredits = pgTable("ecocredits", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("user_id").references(() => users.id),
  tccConverted: integer("tcc_converted").notNull(),
  ecocreditAmount: integer("ecocredit_amount").notNull(), // Cents
  tpasFundId: varchar("tpas_fund_id", { length: 255 }),
  conversionRate: integer("conversion_rate").notNull(), // Cents
  convertedAt: timestamp("converted_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userEmail: varchar("user_email", { length: 255 }),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: integer("entity_id"),
  oldValue: text("old_value"), // JSON
  newValue: text("new_value"), // JSON
  ipAddress: varchar("ip_address", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemLogs = pgTable("system_logs", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  app: varchar("app", { length: 100 }).notNull(),
  level: varchar("level", { length: 50 }).notNull(), // info, warning, error
  type: varchar("type", { length: 100 }),
  message: text("message").notNull(),
  userEmail: varchar("user_email", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAnalytics = pgTable("user_analytics", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("user_id").references(() => users.id),
  transport: varchar("transport", { length: 50 }), // bike, car, bus, walk
  origin: varchar("origin", { length: 255 }), // City/region
  sustainabilityRating: integer("sustainability_rating"), // 0-100
  co2Saved: integer("co2_saved"), // grams
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sustainabilityMetrics = pgTable("sustainability_metrics", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  date: timestamp("date").notNull(),
  populationRating: integer("population_rating").notNull(), // 0-100
  totalCo2Saved: integer("total_co2_saved").notNull(), // kg
  localPurchases: integer("local_purchases").notNull(),
  ecommercePurchases: integer("ecommerce_purchases").notNull(),
  avgCo2Local: integer("avg_co2_local").notNull(), // grams
  avgCo2Ecommerce: integer("avg_co2_ecommerce").notNull(), // grams
});

export const notifications = pgTable("notifications", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // push, email, sms
  targetUsers: text("target_users"), // JSON array of user IDs
  sent: integer("sent").notNull().default(0),
  delivered: integer("delivered").notNull().default(0),
  opened: integer("opened").notNull().default(0),
  clicked: integer("clicked").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inspections = pgTable("inspections", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  businessId: integer("business_id"),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // DURC, HACCP, Sicurezza, etc.
  inspector: varchar("inspector", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull(), // scheduled, completed, violation
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  violationFound: boolean("violation_found").default(false),
  fineAmount: integer("fine_amount"), // Cents
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businessAnalytics = pgTable("business_analytics", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  businessId: integer("business_id"),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  totalSales: integer("total_sales").notNull().default(0),
  totalCredits: integer("total_credits").notNull().default(0), // TCC issued
  totalRevenue: integer("total_revenue").notNull().default(0), // Cents
  rating: integer("rating").default(0), // 0-5 stars
  isActive: boolean("is_active").default(true),
  lastSaleAt: timestamp("last_sale_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mobilityData = pgTable("mobility_data", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // bus, tram, parking
  lineNumber: varchar("line_number", { length: 20 }),
  lineName: varchar("line_name", { length: 255 }),
  stopName: varchar("stop_name", { length: 255 }),
  lat: varchar("lat", { length: 20 }),
  lng: varchar("lng", { length: 20 }),
  status: varchar("status", { length: 50 }).default("active"), // active, delayed, suspended
  occupancy: integer("occupancy"), // 0-100%
  availableSpots: integer("available_spots"), // For parking
  totalSpots: integer("total_spots"), // For parking
  nextArrival: integer("next_arrival"), // Minutes
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
export const marketGeometry = pgTable("market_geometry", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  marketId: integer("market_id").references(() => markets.id).notNull(),
  containerGeojson: text("container_geojson"), // Container mercato
  centerLat: varchar("center_lat", { length: 20 }).notNull(),
  centerLng: varchar("center_lng", { length: 20 }).notNull(),
  hubAreaGeojson: text("hub_area_geojson"), // Area HUB
  marketAreaGeojson: text("market_area_geojson"), // Area mercato
  gcpData: text("gcp_data"), // Ground Control Points (JSON)
  pngUrl: text("png_url"), // URL pianta trasparente
  pngMetadata: text("png_metadata"), // Metadati PNG (JSON)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Posteggi (stalls)
export const stalls = pgTable("stalls", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  marketId: integer("market_id").references(() => markets.id).notNull(),
  number: varchar("number", { length: 20 }).notNull(), // Numero posteggio
  lat: varchar("lat", { length: 20 }).notNull(),
  lng: varchar("lng", { length: 20 }).notNull(),
  areaMq: integer("area_mq"), // Area in metri quadrati
  status: varchar("status", { length: 50 }).default("free").notNull(), // free, reserved, occupied, booked, maintenance
  category: varchar("category", { length: 100 }), // alimentari, abbigliamento, artigianato, etc.
  notes: text("notes"),
  // Campi GIS (Pepe GIS / Editor v3)
  orientation: real("orientation"), // Angolo di rotazione in gradi
  kind: varchar("kind", { length: 50 }), // Tipo piazzola (es. slot)
  widthM: real("width_m"), // Larghezza in metri
  depthM: real("depth_m"), // Profondità in metri
  rawGeojson: jsonb("raw_geojson"), // Feature GeoJSON completa dall'Editor v3
  legacyId: varchar("legacy_id", { length: 255 }), // ID dal sistema legacy DMS (Heroku)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Operatori/Ambulanti (vendors)
export const vendors = pgTable("vendors", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("user_id").references(() => users.id), // Link a utente se registrato
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
  rating: integer("rating").default(0), // 0-5 stars (x100 per decimali)
  totalSales: integer("total_sales").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Concessioni
export const concessions = pgTable("concessions", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  stallId: integer("stall_id").references(() => stalls.id),
  marketId: integer("market_id").references(() => markets.id).notNull(),
  concessionNumber: varchar("concession_number", { length: 100 }).unique().notNull(),
  type: varchar("type", { length: 50 }).notNull(), // daily, monthly, yearly, permanent
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: varchar("status", { length: 50 }).default("active").notNull(), // active, expired, suspended, revoked
  fee: integer("fee"), // Cents
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"), // pending, paid, overdue
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Documenti operatori
export const vendorDocuments = pgTable("vendor_documents", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Prenotazioni posteggi
export const bookings = pgTable("bookings", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  stallId: integer("stall_id").references(() => stalls.id).notNull(),
  userId: integer("user_id").references(() => users.id), // Cittadino che prenota
  vendorId: integer("vendor_id").references(() => vendors.id), // Operatore assegnato
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, confirmed, completed, cancelled, expired
  bookingDate: timestamp("booking_date").notNull(), // Data prenotazione
  expiresAt: timestamp("expires_at").notNull(), // Scadenza prenotazione (es. +30 min)
  checkedInAt: timestamp("checked_in_at"), // Quando operatore fa check-in
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Presenze operatori (check-in/check-out)
export const vendorPresences = pgTable("vendor_presences", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  stallId: integer("stall_id").references(() => stalls.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id),
  checkinTime: timestamp("checkin_time").notNull(),
  checkoutTime: timestamp("checkout_time"),
  duration: integer("duration"), // Minuti
  lat: varchar("lat", { length: 20 }), // GPS check-in
  lng: varchar("lng", { length: 20 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Controlli dettagliati (per Polizia Municipale)
export const inspectionsDetailed = pgTable("inspections_detailed", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  stallId: integer("stall_id").references(() => stalls.id),
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
export const violations = pgTable("violations", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  inspectionId: integer("inspection_id").references(() => inspectionsDetailed.id),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  stallId: integer("stall_id").references(() => stalls.id),
  violationType: varchar("violation_type", { length: 100 }).notNull(), // late_checkin, missing_doc, hygiene, unauthorized, etc.
  violationCode: varchar("violation_code", { length: 50 }),
  description: text("description").notNull(),
  fineAmount: integer("fine_amount"), // Cents
  status: varchar("status", { length: 50 }).default("issued").notNull(), // issued, paid, appealed, cancelled
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  paymentReference: varchar("payment_reference", { length: 255 }),
  appealNotes: text("appeal_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Pagamenti concessioni
export const concessionPayments = pgTable("concession_payments", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  concessionId: integer("concession_id").references(() => concessions.id).notNull(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  amount: integer("amount").notNull(), // Cents
  paymentMethod: varchar("payment_method", { length: 50 }), // bank_transfer, cash, card, etc.
  paymentReference: varchar("payment_reference", { length: 255 }),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, completed, failed, refunded
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Marker personalizzati (da Slot Editor v3)
export const customMarkers = pgTable("custom_markers", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  marketId: integer("market_id").references(() => markets.id).notNull(),
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
export const customAreas = pgTable("custom_areas", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  marketId: integer("market_id").references(() => markets.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }), // food, clothing, handicraft, services, etc.
  geojson: text("geojson").notNull(), // Polygon GeoJSON
  color: varchar("color", { length: 20 }), // Colore area
  opacity: integer("opacity").default(50), // 0-100
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
export const apiKeys = pgTable("api_keys", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // Es: "App Cittadini - Production"
  key: varchar("key", { length: 255 }).notNull().unique(), // dms_live_xxxxx o dms_test_xxxxx
  environment: varchar("environment", { length: 50 }).default("production").notNull(), // production, development, staging
  status: varchar("status", { length: 50 }).default("active").notNull(), // active, inactive, revoked
  permissions: text("permissions"), // JSON array ["markets.read", "stalls.write", etc.]
  rateLimit: integer("rate_limit").default(1000).notNull(), // Richieste per minuto
  lastUsedAt: timestamp("last_used_at"),
  lastUsedIp: varchar("last_used_ip", { length: 50 }),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Metriche utilizzo API per monitoraggio performance
export const apiMetrics = pgTable("api_metrics", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  apiKeyId: integer("api_key_id").references(() => apiKeys.id),
  endpoint: varchar("endpoint", { length: 255 }).notNull(), // /api/dmsHub/markets/list
  method: varchar("method", { length: 10 }).notNull(), // GET, POST, PUT, DELETE
  statusCode: integer("status_code").notNull(), // 200, 404, 500, etc.
  responseTime: integer("response_time").notNull(), // Millisecondi
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Webhook configurati per notifiche real-time
export const webhooks = pgTable("webhooks", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // Es: "Notifica Nuova Prenotazione"
  url: varchar("url", { length: 500 }).notNull(), // Endpoint destinazione
  events: text("events").notNull(), // JSON array ["booking.created", "vendor.updated"]
  status: varchar("status", { length: 50 }).default("active").notNull(), // active, inactive, pending
  secret: varchar("secret", { length: 255 }), // Per firma HMAC
  headers: text("headers"), // JSON object custom headers
  retryPolicy: text("retry_policy"), // JSON {maxRetries: 3, backoff: "exponential"}
  lastTriggeredAt: timestamp("last_triggered_at"),
  successCount: integer("success_count").default(0).notNull(),
  failureCount: integer("failure_count").default(0).notNull(),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Log esecuzioni webhook per debugging
export const webhookLogs = pgTable("webhook_logs", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  webhookId: integer("webhook_id").references(() => webhooks.id).notNull(),
  event: varchar("event", { length: 100 }).notNull(), // booking.created
  payload: text("payload").notNull(), // JSON dati inviati
  statusCode: integer("status_code"), // Response HTTP status
  responseBody: text("response_body"),
  responseTime: integer("response_time"), // Millisecondi
  success: integer("success").default(0).notNull(), // 1=success, 0=failure
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Stato connessioni esterne (ARPAE, TPER, TPAS, Heroku)
export const externalConnections = pgTable("external_connections", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // ARPAE, TPER, TPAS, Gestionale Heroku
  type: varchar("type", { length: 100 }).notNull(), // api, database, webhook, sftp
  endpoint: varchar("endpoint", { length: 500 }), // Base URL
  status: varchar("status", { length: 50 }).default("disconnected").notNull(), // connected, disconnected, pending, error
  lastCheckAt: timestamp("last_check_at"),
  lastSyncAt: timestamp("last_sync_at"),
  lastError: text("last_error"),
  healthCheckInterval: integer("health_check_interval").default(300).notNull(), // Secondi
  config: text("config"), // JSON configurazione specifica
  features: text("features"), // JSON array funzionalità
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Export types
export type ApiKey = typeof apiKeys.$inferSelect;
export type ApiMetric = typeof apiMetrics.$inferSelect;
export type Webhook = typeof webhooks.$inferSelect;
export type WebhookLog = typeof webhookLogs.$inferSelect;
export type ExternalConnection = typeof externalConnections.$inferSelect;

// MIO Agent Logs - Sistema di logging per agenti AI
export const mioAgentLogs = pgTable("mio_agent_logs", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  agent: varchar("agent", { length: 100 }).notNull(), // Nome agente (MIO, Manus, etc.)
  action: varchar("action", { length: 255 }).notNull(), // Azione eseguita
  status: statusEnum("status").notNull(),
  message: text("message"), // Messaggio descrittivo
  details: text("details"), // JSON con dettagli aggiuntivi
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MioAgentLog = typeof mioAgentLogs.$inferSelect;
export type InsertMioAgentLog = typeof mioAgentLogs.$inferInsert;

// ============================================================================
// MIHUB MULTI-AGENT SYSTEM TABLES
// ============================================================================

// 1. Agent Tasks - Task engine per coordinamento agenti
export const agentTasks = pgTable("agent_tasks", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  taskId: varchar("task_id", { length: 100 }).notNull().unique(), // UUID task
  agentAssigned: varchar("agent_assigned", { length: 100 }), // MIO, Manus, Abacus, Zapier
  taskType: varchar("task_type", { length: 100 }).notNull(), // analyze, execute, integrate, coordinate
  priority: integer("priority").default(5).notNull(), // 1-10
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, in_progress, completed, failed
  input: text("input"), // JSON con input del task
  output: text("output"), // JSON con output del task
  error: text("error"), // Messaggio errore se failed
  parentTaskId: varchar("parent_task_id", { length: 100 }), // Task padre se subtask
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Agent Projects - Registry progetti tracciati
export const agentProjects = pgTable("agent_projects", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  projectId: varchar("project_id", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("active").notNull(), // active, paused, completed, archived
  metadata: text("metadata"), // JSON con metadata progetto
  tags: text("tags"), // JSON array di tags
  createdBy: varchar("created_by", { length: 100 }), // Agent che ha creato
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. Agent Brain - Memoria e decisioni agenti
export const agentBrain = pgTable("agent_brain", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  agent: varchar("agent", { length: 100 }).notNull(), // MIO, Manus, Abacus, Zapier
  memoryType: varchar("memory_type", { length: 50 }).notNull(), // decision, context, learning, history
  key: varchar("key", { length: 255 }).notNull(), // Chiave memoria
  value: text("value").notNull(), // JSON con valore
  confidence: integer("confidence").default(100), // 0-100
  expiresAt: timestamp("expires_at"), // TTL opzionale
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 4. System Events - Event bus centralizzato
export const systemEvents = pgTable("system_events", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  eventId: varchar("event_id", { length: 100 }).notNull().unique(),
  eventType: varchar("event_type", { length: 100 }).notNull(), // click, api_call, task_completed, agent_message
  source: varchar("source", { length: 100 }).notNull(), // frontend, backend, agent_name, external_app
  target: varchar("target", { length: 100 }), // Destinatario evento
  payload: text("payload"), // JSON con dati evento
  metadata: text("metadata"), // JSON con metadata
  processed: boolean("processed").default(false).notNull(),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Data Bag - Storage condiviso tra agenti
export const dataBag = pgTable("data_bag", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value").notNull(), // JSON con valore
  valueType: varchar("value_type", { length: 50 }).default("json").notNull(), // json, string, number, boolean
  owner: varchar("owner", { length: 100 }), // Agent proprietario
  accessLevel: varchar("access_level", { length: 50 }).default("shared").notNull(), // private, shared, public
  ttl: integer("ttl"), // Time to live in secondi
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 6. Agent Messages - Chat multi-agente con shared context
export const agentMessages = pgTable("agent_messages", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  messageId: varchar("message_id", { length: 100 }).notNull().unique(),
  conversationId: varchar("conversation_id", { length: 100 }).notNull(), // Raggruppa messaggi conversazione
  sender: varchar("sender", { length: 100 }).notNull(), // MIO, Manus, Abacus, Zapier, user
  recipients: text("recipients"), // JSON array di destinatari (tutti se null)
  messageType: varchar("message_type", { length: 50 }).default("text").notNull(), // text, task, notification, error
  content: text("content").notNull(),
  attachments: text("attachments"), // JSON array di allegati
  metadata: text("metadata"), // JSON con metadata
  readBy: text("read_by"), // JSON array di agenti che hanno letto
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 7. Agent Context - Shared context tra agenti
export const agentContext = pgTable("agent_context", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  contextId: varchar("context_id", { length: 100 }).notNull().unique(),
  conversationId: varchar("conversation_id", { length: 100 }).notNull(), // Link a conversation
  contextType: varchar("context_type", { length: 50 }).notNull(), // global, conversation, task, project
  key: varchar("key", { length: 255 }).notNull(),
  value: text("value").notNull(), // JSON con valore
  visibility: text("visibility"), // JSON array di agenti che possono vedere (tutti se null)
  priority: integer("priority").default(5).notNull(), // 1-10 per ordinamento
  createdBy: varchar("created_by", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Export types for MIHUB tables
export type AgentTask = typeof agentTasks.$inferSelect;
export type InsertAgentTask = typeof agentTasks.$inferInsert;

export type AgentProject = typeof agentProjects.$inferSelect;
export type InsertAgentProject = typeof agentProjects.$inferInsert;

export type AgentBrain = typeof agentBrain.$inferSelect;
export type InsertAgentBrain = typeof agentBrain.$inferInsert;

export type SystemEvent = typeof systemEvents.$inferSelect;
export type InsertSystemEvent = typeof systemEvents.$inferInsert;

export type DataBag = typeof dataBag.$inferSelect;
export type InsertDataBag = typeof dataBag.$inferInsert;

export type AgentMessage = typeof agentMessages.$inferSelect;
export type InsertAgentMessage = typeof agentMessages.$inferInsert;

export type AgentContext = typeof agentContext.$inferSelect;
export type InsertAgentContext = typeof agentContext.$inferInsert;
