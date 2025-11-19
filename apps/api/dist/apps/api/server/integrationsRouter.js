import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { eq, desc, gte, sql } from "drizzle-orm";
import * as schema from "../drizzle/schema";
import { nanoid } from "nanoid";
/**
 * Router per gestione Integrazioni:
 * - API Keys Manager
 * - Webhook Manager
 * - Statistiche API
 * - Health Check connessioni esterne
 * - Sync Status
 */
export const integrationsRouter = router({
    // ============================================
    // API KEYS MANAGER
    // ============================================
    apiKeys: router({
        // Lista tutte le API keys
        list: publicProcedure.query(async () => {
            const db = await getDb();
            if (!db)
                return [];
            return await db.select().from(schema.apiKeys).orderBy(desc(schema.apiKeys.createdAt));
        }),
        // Crea nuova API key
        create: publicProcedure
            .input(z.object({
            name: z.string(),
            environment: z.enum(["production", "development", "staging"]).default("production"),
            permissions: z.array(z.string()).optional(),
            rateLimit: z.number().default(1000),
        }))
            .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database non disponibile");
            // Genera chiave API univoca
            const prefix = input.environment === "production" ? "dms_live_" : "dms_test_";
            const key = prefix + nanoid(24);
            const [result] = await db.insert(schema.apiKeys).values({
                name: input.name,
                key,
                environment: input.environment,
                status: "active",
                permissions: input.permissions ? JSON.stringify(input.permissions) : null,
                rateLimit: input.rateLimit,
                createdBy: "admin", // TODO: prendere da ctx.user
            });
            return { id: result.insertId, key };
        }),
        // Rigenera API key
        regenerate: publicProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database non disponibile");
            // Trova key esistente
            const [existing] = await db.select().from(schema.apiKeys).where(eq(schema.apiKeys.id, input.id)).limit(1);
            if (!existing)
                throw new Error("API Key non trovata");
            // Genera nuova chiave
            const prefix = existing.environment === "production" ? "dms_live_" : "dms_test_";
            const newKey = prefix + nanoid(24);
            await db.update(schema.apiKeys)
                .set({ key: newKey })
                .where(eq(schema.apiKeys.id, input.id));
            return { key: newKey };
        }),
        // Elimina API key
        delete: publicProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database non disponibile");
            await db.delete(schema.apiKeys).where(eq(schema.apiKeys.id, input.id));
            return { success: true };
        }),
        // Aggiorna status API key
        updateStatus: publicProcedure
            .input(z.object({
            id: z.number(),
            status: z.enum(["active", "inactive", "revoked"]),
        }))
            .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database non disponibile");
            await db.update(schema.apiKeys)
                .set({ status: input.status })
                .where(eq(schema.apiKeys.id, input.id));
            return { success: true };
        }),
    }),
    // ============================================
    // STATISTICHE API
    // ============================================
    apiStats: router({
        // Statistiche oggi
        today: publicProcedure.query(async () => {
            const db = await getDb();
            if (!db)
                return { requestsToday: 0, avgResponseTime: 0, successRate: 0, errors: 0 };
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            // Query aggregata per statistiche
            const [stats] = await db.select({
                totalRequests: sql `COUNT(*)`,
                avgResponseTime: sql `AVG(${schema.apiMetrics.responseTime})`,
                successCount: sql `SUM(CASE WHEN ${schema.apiMetrics.statusCode} < 400 THEN 1 ELSE 0 END)`,
                errorCount: sql `SUM(CASE WHEN ${schema.apiMetrics.statusCode} >= 400 THEN 1 ELSE 0 END)`,
            })
                .from(schema.apiMetrics)
                .where(gte(schema.apiMetrics.createdAt, today));
            const successRate = stats.totalRequests > 0
                ? (stats.successCount / stats.totalRequests) * 100
                : 0;
            return {
                requestsToday: stats.totalRequests || 0,
                avgResponseTime: Math.round(stats.avgResponseTime || 0),
                successRate: parseFloat(successRate.toFixed(1)),
                errors: stats.errorCount || 0,
            };
        }),
        // Statistiche per endpoint (top 10)
        byEndpoint: publicProcedure.query(async () => {
            const db = await getDb();
            if (!db)
                return [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return await db.select({
                endpoint: schema.apiMetrics.endpoint,
                requests: sql `COUNT(*)`,
                avgResponseTime: sql `AVG(${schema.apiMetrics.responseTime})`,
            })
                .from(schema.apiMetrics)
                .where(gte(schema.apiMetrics.createdAt, today))
                .groupBy(schema.apiMetrics.endpoint)
                .orderBy(desc(sql `COUNT(*)`))
                .limit(10);
        }),
    }),
    // ============================================
    // WEBHOOK MANAGER
    // ============================================
    webhooks: router({
        // Lista webhook
        list: publicProcedure.query(async () => {
            const db = await getDb();
            if (!db)
                return [];
            return await db.select().from(schema.webhooks).orderBy(desc(schema.webhooks.createdAt));
        }),
        // Crea webhook
        create: publicProcedure
            .input(z.object({
            name: z.string(),
            url: z.string().url(),
            events: z.array(z.string()),
            secret: z.string().optional(),
            headers: z.record(z.string(), z.string()).optional(),
        }))
            .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database non disponibile");
            const [result] = await db.insert(schema.webhooks).values({
                name: input.name,
                url: input.url,
                events: JSON.stringify(input.events),
                secret: input.secret || nanoid(32),
                headers: input.headers ? JSON.stringify(input.headers) : null,
                status: "active",
                createdBy: "admin", // TODO: prendere da ctx.user
            });
            return { id: result.insertId };
        }),
        // Elimina webhook
        delete: publicProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database non disponibile");
            await db.delete(schema.webhooks).where(eq(schema.webhooks.id, input.id));
            return { success: true };
        }),
        // Test webhook (trigger manuale)
        test: publicProcedure
            .input(z.object({
            id: z.number(),
            testPayload: z.record(z.string(), z.any()).optional(),
        }))
            .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database non disponibile");
            const [webhook] = await db.select().from(schema.webhooks).where(eq(schema.webhooks.id, input.id)).limit(1);
            if (!webhook)
                throw new Error("Webhook non trovato");
            const payload = input.testPayload || { event: "test", timestamp: new Date().toISOString() };
            try {
                const startTime = Date.now();
                const response = await fetch(webhook.url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Webhook-Secret": webhook.secret || "",
                        ...(webhook.headers ? JSON.parse(webhook.headers) : {}),
                    },
                    body: JSON.stringify(payload),
                });
                const responseTime = Date.now() - startTime;
                const responseBody = await response.text();
                // Log esecuzione
                await db.insert(schema.webhookLogs).values({
                    webhookId: webhook.id,
                    event: "test",
                    payload: JSON.stringify(payload),
                    statusCode: response.status,
                    responseBody,
                    responseTime,
                    success: response.ok ? 1 : 0,
                    errorMessage: response.ok ? null : `HTTP ${response.status}`,
                });
                return {
                    success: response.ok,
                    statusCode: response.status,
                    responseTime,
                    responseBody: responseBody.substring(0, 500), // Limita dimensione
                };
            }
            catch (error) {
                // Log errore
                await db.insert(schema.webhookLogs).values({
                    webhookId: webhook.id,
                    event: "test",
                    payload: JSON.stringify(payload),
                    success: 0,
                    errorMessage: error.message,
                });
                throw new Error(`Webhook test fallito: ${error.message}`);
            }
        }),
        // Log webhook
        logs: publicProcedure
            .input(z.object({ webhookId: z.number(), limit: z.number().default(50) }))
            .query(async ({ input }) => {
            const db = await getDb();
            if (!db)
                return [];
            return await db.select()
                .from(schema.webhookLogs)
                .where(eq(schema.webhookLogs.webhookId, input.webhookId))
                .orderBy(desc(schema.webhookLogs.createdAt))
                .limit(input.limit);
        }),
    }),
    // ============================================
    // CONNESSIONI ESTERNE
    // ============================================
    connections: router({
        // Lista connessioni
        list: publicProcedure.query(async () => {
            const db = await getDb();
            if (!db)
                return [];
            return await db.select().from(schema.externalConnections).orderBy(schema.externalConnections.name);
        }),
        // Health check singola connessione
        healthCheck: publicProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database non disponibile");
            const [connection] = await db.select()
                .from(schema.externalConnections)
                .where(eq(schema.externalConnections.id, input.id))
                .limit(1);
            if (!connection)
                throw new Error("Connessione non trovata");
            let status = "disconnected";
            let lastError = null;
            if (connection.endpoint) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);
                    const response = await fetch(connection.endpoint, {
                        method: "GET",
                        signal: controller.signal,
                    });
                    clearTimeout(timeoutId);
                    status = response.ok ? "connected" : "error";
                    if (!response.ok) {
                        lastError = `HTTP ${response.status}`;
                    }
                }
                catch (error) {
                    status = "error";
                    lastError = error.message;
                }
            }
            // Aggiorna database
            await db.update(schema.externalConnections)
                .set({
                status,
                lastCheckAt: new Date(),
                lastError,
            })
                .where(eq(schema.externalConnections.id, input.id));
            return { status, lastError };
        }),
        // Health check tutte le connessioni
        healthCheckAll: publicProcedure.mutation(async () => {
            const db = await getDb();
            if (!db)
                throw new Error("Database non disponibile");
            const connections = await db.select().from(schema.externalConnections);
            const results = await Promise.all(connections.map(async (conn) => {
                let status = "disconnected";
                let lastError = null;
                if (conn.endpoint) {
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 5000);
                        const response = await fetch(conn.endpoint, {
                            method: "GET",
                            signal: controller.signal,
                        });
                        clearTimeout(timeoutId);
                        status = response.ok ? "connected" : "error";
                        if (!response.ok) {
                            lastError = `HTTP ${response.status}`;
                        }
                    }
                    catch (error) {
                        status = "error";
                        lastError = error.message;
                    }
                }
                // Aggiorna database
                await db.update(schema.externalConnections)
                    .set({
                    status,
                    lastCheckAt: new Date(),
                    lastError,
                })
                    .where(eq(schema.externalConnections.id, conn.id));
                return { id: conn.id, name: conn.name, status, lastError };
            }));
            return results;
        }),
    }),
});
