/**
 * API Guardian Router - Controllo Permessi e Log API
 * Gestisce permessi per MIO, Manus, Abacus, Zapier
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import fs from "fs/promises";
import path from "path";

// Path ai file JSON Guardian in MIO-hub
const MIO_HUB_PATH = process.env.MIO_HUB_PATH || "/root/MIO-hub";
const API_INDEX_PATH = path.join(MIO_HUB_PATH, "api/index.json");
const PERMISSIONS_PATH = path.join(MIO_HUB_PATH, "agents/permissions.json");
const GUARDIAN_CONFIG_PATH = path.join(MIO_HUB_PATH, "config/api-guardian.json");
const GUARDIAN_LOG_PATH = path.join(MIO_HUB_PATH, "logs/api-guardian.log");

// Cache per i file JSON (ricaricati ogni 60 secondi)
let apiIndexCache: any = null;
let permissionsCache: any = null;
let guardianConfigCache: any = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 60000; // 60 secondi

async function loadGuardianConfig() {
  const now = Date.now();
  if (apiIndexCache && permissionsCache && guardianConfigCache && (now - lastCacheUpdate) < CACHE_TTL) {
    return { apiIndex: apiIndexCache, permissions: permissionsCache, config: guardianConfigCache };
  }

  try {
    const [apiIndexData, permissionsData, configData] = await Promise.all([
      fs.readFile(API_INDEX_PATH, "utf-8"),
      fs.readFile(PERMISSIONS_PATH, "utf-8"),
      fs.readFile(GUARDIAN_CONFIG_PATH, "utf-8"),
    ]);

    apiIndexCache = JSON.parse(apiIndexData);
    permissionsCache = JSON.parse(permissionsData);
    guardianConfigCache = JSON.parse(configData);
    lastCacheUpdate = now;

    return { apiIndex: apiIndexCache, permissions: permissionsCache, config: guardianConfigCache };
  } catch (error) {
    console.error("[Guardian] Error loading config files:", error);
    throw new Error("Failed to load Guardian configuration");
  }
}

async function logApiCall(logEntry: {
  timestamp: string;
  agent: string;
  endpoint_id: string;
  method: string;
  path: string;
  status: "allowed" | "denied" | "error";
  reason?: string;
  risk_level?: string;
  require_confirmation?: boolean;
}) {
  try {
    const logLine = JSON.stringify(logEntry) + "\n";
    await fs.appendFile(GUARDIAN_LOG_PATH, logLine, "utf-8");
  } catch (error) {
    console.error("[Guardian] Error writing log:", error);
  }
}

export const guardianRouter = router({
  // ============================================================================
  // ENDPOINT CATALOG
  // ============================================================================

  getEndpoints: publicProcedure
    .query(async () => {
      const { apiIndex } = await loadGuardianConfig();
      return apiIndex;
    }),

  getEndpointById: publicProcedure
    .input(z.object({
      endpointId: z.string(),
    }))
    .query(async ({ input }) => {
      const { apiIndex } = await loadGuardianConfig();
      
      for (const service of apiIndex.services) {
        const endpoint = service.endpoints.find((e: any) => e.id === input.endpointId);
        if (endpoint) {
          return {
            ...endpoint,
            service: {
              id: service.id,
              display_name: service.display_name,
              base_url: service.base_url,
              env: service.env,
            },
          };
        }
      }
      
      return null;
    }),

  // ============================================================================
  // PERMISSIONS
  // ============================================================================

  getAgentPermissions: publicProcedure
    .input(z.object({
      agentId: z.string(),
    }))
    .query(async ({ input }) => {
      const { permissions } = await loadGuardianConfig();
      
      const agent = permissions.agents.find((a: any) => a.id === input.agentId);
      if (!agent) {
        return {
          agent_id: input.agentId,
          found: false,
          rules: [],
          defaults: permissions.defaults,
        };
      }

      return {
        agent_id: agent.id,
        display_name: agent.display_name,
        roles: agent.roles,
        found: true,
        rules: agent.rules,
        defaults: permissions.defaults,
      };
    }),

  checkPermission: publicProcedure
    .input(z.object({
      agentId: z.string(),
      endpointId: z.string(),
      mode: z.enum(["read", "write"]),
    }))
    .mutation(async ({ input }) => {
      const { permissions, apiIndex } = await loadGuardianConfig();
      
      // Trova l'agente
      const agent = permissions.agents.find((a: any) => a.id === input.agentId);
      if (!agent) {
        const logEntry = {
          timestamp: new Date().toISOString(),
          agent: input.agentId,
          endpoint_id: input.endpointId,
          method: input.mode.toUpperCase(),
          path: "",
          status: "denied" as const,
          reason: "Unknown agent",
        };
        await logApiCall(logEntry);
        
        return {
          allowed: false,
          reason: "Unknown agent",
          require_confirmation: false,
        };
      }

      // Trova l'endpoint
      let endpoint: any = null;
      let service: any = null;
      for (const svc of apiIndex.services) {
        const ep = svc.endpoints.find((e: any) => e.id === input.endpointId);
        if (ep) {
          endpoint = ep;
          service = svc;
          break;
        }
      }

      if (!endpoint) {
        const logEntry = {
          timestamp: new Date().toISOString(),
          agent: input.agentId,
          endpoint_id: input.endpointId,
          method: input.mode.toUpperCase(),
          path: "",
          status: "denied" as const,
          reason: "Unknown endpoint",
        };
        await logApiCall(logEntry);

        return {
          allowed: permissions.defaults.unknown_endpoint.allow,
          reason: "Unknown endpoint",
          require_confirmation: false,
        };
      }

      // Trova la regola per questo endpoint
      const rule = agent.rules.find((r: any) => r.endpoint_id === input.endpointId);
      if (!rule) {
        const logEntry = {
          timestamp: new Date().toISOString(),
          agent: input.agentId,
          endpoint_id: input.endpointId,
          method: endpoint.method,
          path: endpoint.path,
          status: "denied" as const,
          reason: "No permission rule found",
          risk_level: endpoint.risk,
        };
        await logApiCall(logEntry);

        return {
          allowed: false,
          reason: "No permission rule found for this endpoint",
          require_confirmation: false,
        };
      }

      // Verifica mode
      if (!rule.modes.includes(input.mode)) {
        const logEntry = {
          timestamp: new Date().toISOString(),
          agent: input.agentId,
          endpoint_id: input.endpointId,
          method: endpoint.method,
          path: endpoint.path,
          status: "denied" as const,
          reason: `Mode ${input.mode} not allowed`,
          risk_level: endpoint.risk,
        };
        await logApiCall(logEntry);

        return {
          allowed: false,
          reason: `Mode ${input.mode} not allowed for this endpoint`,
          require_confirmation: false,
        };
      }

      // Verifica risk level
      const riskLevels = ["low", "medium", "high"];
      const endpointRiskIndex = riskLevels.indexOf(endpoint.risk);
      const maxRiskIndex = riskLevels.indexOf(rule.max_risk);

      if (endpointRiskIndex > maxRiskIndex) {
        const logEntry = {
          timestamp: new Date().toISOString(),
          agent: input.agentId,
          endpoint_id: input.endpointId,
          method: endpoint.method,
          path: endpoint.path,
          status: "denied" as const,
          reason: `Risk level ${endpoint.risk} exceeds max allowed ${rule.max_risk}`,
          risk_level: endpoint.risk,
        };
        await logApiCall(logEntry);

        return {
          allowed: false,
          reason: `Risk level ${endpoint.risk} exceeds maximum allowed ${rule.max_risk}`,
          require_confirmation: false,
        };
      }

      // Permesso concesso
      const logEntry = {
        timestamp: new Date().toISOString(),
        agent: input.agentId,
        endpoint_id: input.endpointId,
        method: endpoint.method,
        path: endpoint.path,
        status: "allowed" as const,
        risk_level: endpoint.risk,
        require_confirmation: rule.require_confirmation,
      };
      await logApiCall(logEntry);

      return {
        allowed: true,
        reason: "Permission granted",
        require_confirmation: rule.require_confirmation,
        endpoint: {
          id: endpoint.id,
          method: endpoint.method,
          path: endpoint.path,
          description: endpoint.description,
          risk: endpoint.risk,
          base_url: service.base_url,
        },
      };
    }),

  // ============================================================================
  // LOGS
  // ============================================================================

  getLogs: publicProcedure
    .input(z.object({
      limit: z.number().default(100),
      agent: z.string().optional(),
      status: z.enum(["allowed", "denied", "error"]).optional(),
    }))
    .query(async ({ input }) => {
      try {
        const logContent = await fs.readFile(GUARDIAN_LOG_PATH, "utf-8");
        const lines = logContent.trim().split("\n").filter(l => l.trim());
        
        let logs = lines.map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        }).filter(Boolean);

        // Filtra per agent
        if (input.agent) {
          logs = logs.filter((log: any) => log.agent === input.agent);
        }

        // Filtra per status
        if (input.status) {
          logs = logs.filter((log: any) => log.status === input.status);
        }

        // Ordina per timestamp decrescente e limita
        logs = logs.reverse().slice(0, input.limit);

        return logs;
      } catch (error) {
        // Se il file non esiste ancora, ritorna array vuoto
        return [];
      }
    }),

  getDebugLogs: publicProcedure
    .input(z.object({
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      try {
        const logContent = await fs.readFile(GUARDIAN_LOG_PATH, "utf-8");
        const lines = logContent.trim().split("\n").filter(l => l.trim());
        
        let logs = lines.map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        }).filter(Boolean);

        // Solo errori e denied
        logs = logs.filter((log: any) => log.status === "denied" || log.status === "error");

        // Ordina per timestamp decrescente e limita
        logs = logs.reverse().slice(0, input.limit);

        return logs;
      } catch (error) {
        return [];
      }
    }),

  // ============================================================================
  // CONFIG
  // ============================================================================

  getConfig: publicProcedure
    .query(async () => {
      const { config } = await loadGuardianConfig();
      return config;
    }),
});
