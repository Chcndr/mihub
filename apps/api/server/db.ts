import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      _db = drizzle(sql);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Dashboard PA Analytics Helpers
import { count, sql, desc, eq, gte, lt, and, or, sum } from "drizzle-orm";
import * as schema from "../drizzle/schema";

export async function getOverviewStats() {
  const db = await getDb();
  if (!db) return null;

  // Conteggi totali
  const [usersCount] = await db.select({ count: count() }).from(schema.users);
  const [marketsCount] = await db.select({ count: count() }).from(schema.markets);
  const [shopsCount] = await db.select({ count: count() }).from(schema.shops);
  const [transactionsCount] = await db.select({ count: count() }).from(schema.transactions);

  // Mercati attivi (con geometria configurata)
  const [activeMarketsCount] = await db
    .select({ count: count() })
    .from(schema.marketGeometry)
    .where(sql`container_geojson IS NOT NULL`);

  // Transazioni oggi
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [todayTransactions] = await db
    .select({ count: count() })
    .from(schema.transactions)
    .where(gte(schema.transactions.createdAt, today));

  // Transazioni ieri per calcolo crescita
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const [yesterdayTransactions] = await db
    .select({ count: count() })
    .from(schema.transactions)
    .where(and(
      gte(schema.transactions.createdAt, yesterday),
      lt(schema.transactions.createdAt, today)
    ));

  // Calcolo crescita transazioni
  const transactionGrowth = yesterdayTransactions.count > 0
    ? ((todayTransactions.count - yesterdayTransactions.count) / yesterdayTransactions.count) * 100
    : 0;

  // Utenti attivi oggi (con transazioni o check-in)
  const activeUsersToday = await db
    .selectDistinct({ userId: schema.transactions.userId })
    .from(schema.transactions)
    .where(gte(schema.transactions.createdAt, today));

  // Crescita utenti (ultimi 7 giorni vs 7 giorni precedenti)
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [usersLastWeek] = await db
    .select({ count: count() })
    .from(schema.users)
    .where(gte(schema.users.createdAt, sevenDaysAgo));

  const [usersPrevWeek] = await db
    .select({ count: count() })
    .from(schema.users)
    .where(and(
      gte(schema.users.createdAt, fourteenDaysAgo),
      lt(schema.users.createdAt, sevenDaysAgo)
    ));

  const userGrowth = usersPrevWeek.count > 0
    ? ((usersLastWeek.count - usersPrevWeek.count) / usersPrevWeek.count) * 100
    : 0;

  // TCC distribuiti (somma ecocredits)
  const [tccSum] = await db
    .select({ total: sum(schema.ecocredits.tccConverted) })
    .from(schema.ecocredits);

  // CO₂ risparmiata (mock per ora, da calcolare da transazioni sostenibili)
  const co2Saved = Math.round((Number(tccSum.total) || 0) * 0.5); // 1 TCC = 0.5 kg CO₂

  // Rating sostenibilità (percentuale prodotti BIO/KM0)
  const [bioProducts] = await db
    .select({ count: count() })
    .from(schema.products)
    .where(or(
      eq(schema.products.certifications, 'BIO'),
      eq(schema.products.certifications, 'KM0')
    ));

  const sustainabilityRating = shopsCount.count > 0
    ? (bioProducts.count / shopsCount.count) * 10
    : 0;

  return {
    totalUsers: usersCount.count,
    userGrowth: Math.round(userGrowth * 10) / 10,
    activeMarkets: activeMarketsCount.count || marketsCount.count,
    totalShops: shopsCount.count,
    totalTransactions: transactionsCount.count,
    transactionGrowth: Math.round(transactionGrowth * 10) / 10,
    sustainabilityRating: Math.round(sustainabilityRating * 10) / 10,
    co2Saved,
    todayTransactions: todayTransactions.count,
    activeUsersToday: activeUsersToday.length || 0,
    tccDistributed: tccSum.total || 0,
  };
}

export async function getMarkets() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.markets).where(eq(schema.markets.active, 1));
}

export async function getShops() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.shops);
}

export async function getTransactions(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.transactions).orderBy(desc(schema.transactions.createdAt)).limit(limit);
}

export async function getCheckins(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.checkins).orderBy(desc(schema.checkins.createdAt)).limit(limit);
}

export async function getCarbonCreditsConfig() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(schema.carbonCreditsConfig).limit(1);
  return result[0] || null;
}

export async function getFundTransactions(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.fundTransactions).orderBy(desc(schema.fundTransactions.createdAt)).limit(limit);
}

export async function getReimbursements(status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (status) {
    return await db.select().from(schema.reimbursements).where(eq(schema.reimbursements.status, status));
  }
  return await db.select().from(schema.reimbursements).orderBy(desc(schema.reimbursements.createdAt));
}

export async function getSystemLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.systemLogs).orderBy(desc(schema.systemLogs.createdAt)).limit(limit);
}

export async function getProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.products);
}

export async function getProductTracking() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.productTracking);
}

export async function getUserAnalytics() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.userAnalytics);
}

export async function getSustainabilityMetrics() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.sustainabilityMetrics).orderBy(desc(schema.sustainabilityMetrics.date));
}

export async function getBusinessAnalytics() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.businessAnalytics).orderBy(desc(schema.businessAnalytics.totalRevenue));
}

export async function getInspections() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.inspections).orderBy(desc(schema.inspections.scheduledDate));
}

export async function getNotifications() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.notifications).orderBy(desc(schema.notifications.createdAt));
}

export async function getCivicReports() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.civicReports).orderBy(desc(schema.civicReports.createdAt));
}

export async function getMobilityData() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.mobilityData).orderBy(desc(schema.mobilityData.updatedAt));
}


// ============================================
// MIO Agent Logs
// ============================================

export async function createMioAgentLog(log: {
  agent: string;
  action: string;
  status: "success" | "error" | "warning" | "info";
  message?: string;
  details?: Record<string, any>;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create MIO Agent log: database not available");
    return null;
  }

  try {
    const result = await db.insert(schema.mioAgentLogs).values({
      agent: log.agent,
      action: log.action,
      status: log.status,
      message: log.message || null,
      details: log.details ? JSON.stringify(log.details) : null,
      timestamp: new Date(),
    });

    return {
      success: true,
      id: result[0].insertId,
      message: "Log created successfully",
    };
  } catch (error) {
    console.error("[Database] Error creating MIO Agent log:", error);
    throw new Error("Failed to create log");
  }
}

export async function getMioAgentLogs() {
  console.log("[DEBUG] getMioAgentLogs called");
  const db = await getDb();
  if (!db) {
    console.warn("[DEBUG] Database not available in getMioAgentLogs");
    return [];
  }

  try {
    console.log("[DEBUG] Executing SELECT query on mio_agent_logs");
    const logs = await db
      .select()
      .from(schema.mioAgentLogs)
      .orderBy(desc(schema.mioAgentLogs.timestamp));

    console.log(`[DEBUG] Query returned ${logs.length} logs`);
    if (logs.length > 0) {
      console.log("[DEBUG] First log:", JSON.stringify(logs[0]));
    }

    // Parse JSON details field
    const parsedLogs = logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    }));
    
    console.log(`[DEBUG] Returning ${parsedLogs.length} parsed logs`);
    return parsedLogs;
  } catch (error) {
    console.error("[Database] Error fetching MIO Agent logs:", error);
    console.error("[DEBUG] Error stack:", error instanceof Error ? error.stack : "No stack");
    return [];
  }
}

export async function getMioAgentLogById(id: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const logs = await db
      .select()
      .from(schema.mioAgentLogs)
      .where(eq(schema.mioAgentLogs.id, id))
      .limit(1);

    if (logs.length === 0) return null;

    const log = logs[0];
    return {
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    };
  } catch (error) {
    console.error("[Database] Error fetching MIO Agent log by ID:", error);
    return null;
  }
}


export async function initMioAgentLogsTable() {
  console.log("[DEBUG] initMioAgentLogsTable called");
  const db = await getDb();
  if (!db) {
    console.warn("[DEBUG] Database not available in initMioAgentLogsTable");
    return {
      success: false,
      message: "Database not available",
    };
  }

  try {
    console.log("[DEBUG] Checking if mio_agent_logs table exists");
    // Verifica se la tabella esiste
    const checkTableQuery = `
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'mio_agent_logs'
    `;
    
    const result: any = await db.execute(checkTableQuery);
    console.log("[DEBUG] Check table result:", JSON.stringify(result));
    const tableExists = result[0]?.count > 0;
    console.log(`[DEBUG] Table exists: ${tableExists}`);

    if (tableExists) {
      console.log("[DEBUG] Table already exists, skipping creation");
      return {
        success: true,
        message: "Table mio_agent_logs already exists",
        status: "existing",
      };
    }

    console.log("[DEBUG] Table does not exist, creating...");

    // Crea la tabella
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS mio_agent_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent VARCHAR(100) NOT NULL COMMENT 'Nome agente (MIO, Manus, etc.)',
        action VARCHAR(255) NOT NULL COMMENT 'Azione eseguita',
        status ENUM('success', 'error', 'warning', 'info') NOT NULL COMMENT 'Stato operazione',
        message TEXT COMMENT 'Messaggio descrittivo',
        details TEXT COMMENT 'Dettagli aggiuntivi in formato JSON',
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp evento',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data creazione record',
        INDEX idx_agent (agent),
        INDEX idx_status (status),
        INDEX idx_timestamp (timestamp DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log degli agenti AI (MIO, Manus, etc.)'
    `;

    console.log("[DEBUG] Executing CREATE TABLE query");
    await db.execute(createTableQuery);
    console.log("[DEBUG] Table created successfully");

    // Inserisci log di inizializzazione
    console.log("[DEBUG] Inserting initialization log");
    await db.insert(schema.mioAgentLogs).values({
      agent: "System",
      action: "init_schema",
      status: "success",
      message: "Tabella mio_agent_logs creata automaticamente",
      details: JSON.stringify({
        version: "1.0",
        timestamp: new Date().toISOString(),
      }),
      timestamp: new Date(),
    });

    console.log("[DEBUG] Initialization log inserted");
    return {
      success: true,
      message: "Table mio_agent_logs created successfully",
      status: "created",
    };
  } catch (error) {
    console.error("[Database] Error initializing mio_agent_logs table:", error);
    console.error("[DEBUG] Error stack:", error instanceof Error ? error.stack : "No stack");
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      status: "error",
    };
  }
}


// ============================================
// Database Diagnostics
// ============================================

export async function testDatabaseConnection() {
  console.log("[DIAGNOSTIC] Testing database connection...");
  
  // Check DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  console.log("[DIAGNOSTIC] DATABASE_URL exists:", !!databaseUrl);
  if (databaseUrl) {
    // Log only the protocol and host (hide credentials)
    const urlMatch = databaseUrl.match(/^([^:]+):\/\/([^@]+@)?([^\/]+)/);
    if (urlMatch) {
      console.log(`[DIAGNOSTIC] Database protocol: ${urlMatch[1]}`);
      console.log(`[DIAGNOSTIC] Database host: ${urlMatch[3]}`);
    }
  }
  
  const db = await getDb();
  if (!db) {
    console.error("[DIAGNOSTIC] Database connection failed: getDb() returned null");
    return {
      success: false,
      message: "Database not available",
      details: {
        databaseUrlExists: !!databaseUrl,
        error: "getDb() returned null",
      },
    };
  }
  
  console.log("[DIAGNOSTIC] Database connection established");
  
  try {
    // Test simple query
    console.log("[DIAGNOSTIC] Executing SELECT 1 test query");
    const result: any = await db.execute("SELECT 1 as test");
    console.log("[DIAGNOSTIC] Test query result:", JSON.stringify(result));
    
    // Test database name
    console.log("[DIAGNOSTIC] Getting current database name");
    const dbNameResult: any = await db.execute("SELECT DATABASE() as db_name");
    const dbName = dbNameResult[0]?.db_name;
    console.log(`[DIAGNOSTIC] Current database: ${dbName}`);
    
    // Check if mio_agent_logs table exists
    console.log("[DIAGNOSTIC] Checking if mio_agent_logs table exists");
    const tableCheckResult: any = await db.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'mio_agent_logs'
    `);
    const tableExists = tableCheckResult[0]?.count > 0;
    console.log(`[DIAGNOSTIC] Table mio_agent_logs exists: ${tableExists}`);
    
    // If table exists, count rows
    let rowCount = 0;
    if (tableExists) {
      console.log("[DIAGNOSTIC] Counting rows in mio_agent_logs");
      const countResult: any = await db.execute("SELECT COUNT(*) as count FROM mio_agent_logs");
      rowCount = countResult[0]?.count || 0;
      console.log(`[DIAGNOSTIC] Row count: ${rowCount}`);
    }
    
    return {
      success: true,
      message: "Database connection successful",
      details: {
        databaseUrlExists: !!databaseUrl,
        connectionEstablished: true,
        databaseName: dbName,
        tableExists,
        rowCount,
      },
    };
  } catch (error) {
    console.error("[DIAGNOSTIC] Database test failed:", error);
    console.error("[DIAGNOSTIC] Error stack:", error instanceof Error ? error.stack : "No stack");
    return {
      success: false,
      message: "Database test failed",
      details: {
        databaseUrlExists: !!databaseUrl,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
    };
  }
}
