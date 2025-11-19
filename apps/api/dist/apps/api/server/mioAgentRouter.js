import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
/**
 * Router per MIO Agent
 * - Gestione log degli agenti (MySQL)
 * - Monitoraggio operazioni
 * - Stato task e job
 */
export const mioAgentRouter = router({
    // Test connessione database e diagnostica
    testDatabase: publicProcedure.query(async () => {
        try {
            const result = await db.testDatabaseConnection();
            return result;
        }
        catch (error) {
            console.error("Error testing database:", error);
            throw new Error("Failed to test database");
        }
    }),
    // Inizializza lo schema del database (crea tabella se non esiste)
    initSchema: publicProcedure.mutation(async () => {
        try {
            const result = await db.initMioAgentLogsTable();
            return result;
        }
        catch (error) {
            console.error("Error initializing schema:", error);
            throw new Error("Failed to initialize schema");
        }
    }),
    // Recupera tutti i log dal database
    getLogs: publicProcedure.query(async () => {
        try {
            const logs = await db.getMioAgentLogs();
            // Trasforma il formato per compatibilità con il frontend
            return logs.map(log => ({
                id: log.id,
                filename: `log-${log.id}.json`,
                timestamp: log.timestamp.toISOString(),
                content: {
                    agent: log.agent,
                    action: log.action,
                    status: log.status,
                    message: log.message || "",
                    details: log.details || {},
                },
                size: JSON.stringify(log).length,
                modified: log.createdAt.toISOString(),
            }));
        }
        catch (error) {
            console.error("Error reading logs from database:", error);
            throw new Error("Failed to read logs");
        }
    }),
    // Crea un nuovo log nel database
    createLog: publicProcedure
        .input((val) => {
        if (typeof val === "object" &&
            val !== null &&
            "agent" in val &&
            "action" in val &&
            "status" in val) {
            return val;
        }
        throw new Error("Invalid input: must include agent, action, and status");
    })
        .mutation(async ({ input }) => {
        try {
            const result = await db.createMioAgentLog({
                agent: input.agent,
                action: input.action,
                status: input.status,
                message: input.message,
                details: input.details,
            });
            if (!result) {
                throw new Error("Database not available");
            }
            return {
                success: true,
                id: result.id,
                timestamp: new Date().toISOString(),
                message: "Log created successfully in database",
            };
        }
        catch (error) {
            console.error("Error creating log in database:", error);
            throw new Error("Failed to create log");
        }
    }),
    // Recupera un singolo log per ID
    getLogById: publicProcedure
        .input((val) => {
        if (typeof val === "number")
            return val;
        throw new Error("Input must be a number (log ID)");
    })
        .query(async ({ input: id }) => {
        try {
            const log = await db.getMioAgentLogById(id);
            if (!log) {
                throw new Error("Log not found");
            }
            return {
                id: log.id,
                filename: `log-${log.id}.json`,
                timestamp: log.timestamp.toISOString(),
                content: {
                    agent: log.agent,
                    action: log.action,
                    status: log.status,
                    message: log.message || "",
                    details: log.details || {},
                },
                size: JSON.stringify(log).length,
                modified: log.createdAt.toISOString(),
            };
        }
        catch (error) {
            console.error("Error reading log from database:", error);
            throw new Error("Failed to read log");
        }
    }),
});
