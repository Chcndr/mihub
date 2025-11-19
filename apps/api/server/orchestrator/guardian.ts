/**
 * Guardian - Logging e permessi
 * 
 * Integrazione con API Guardian per logging operazioni orchestratore.
 * Log salvati in formato JSONL per compatibilità con Dashboard PA.
 */

import { createMioAgentLog } from '../db';

export interface GuardianLogEntry {
  agent: string;
  method: string;
  path: string;
  status: 'allowed' | 'denied' | 'error';
  metadata?: any;
  reason?: string;
}

/**
 * Log operazione in API Guardian
 * 
 * Salva nel database (mio_agent_logs) per visualizzazione in Dashboard PA
 */
export async function logToGuardian(entry: GuardianLogEntry): Promise<void> {
  try {
    const logStatus = entry.status === 'allowed' ? 'success' : 
                      entry.status === 'denied' ? 'warning' : 'error';

    await createMioAgentLog({
      agent: entry.agent,
      action: `${entry.method} ${entry.path}`,
      status: logStatus,
      message: entry.reason || `${entry.status.toUpperCase()}: ${entry.method} ${entry.path}`,
      details: entry.metadata
    });

    console.log(`[Guardian] Logged: ${entry.agent} ${entry.method} ${entry.path} - ${entry.status}`);
  } catch (error) {
    console.error('[Guardian] Error logging:', error);
    // Non propagare errore per evitare di bloccare operazioni
  }
}

/**
 * Verifica permessi agente
 * 
 * Controlla se un agente ha permesso per un'azione specifica.
 * In futuro: leggere da agents/permissions.json nel repo MIO-hub
 */
export async function checkPermission(
  agentId: string,
  resource: string,
  action: 'read' | 'write'
): Promise<boolean> {
  // TODO: Implementare lettura da agents/permissions.json
  // Per ora: permessi hardcoded
  
  const permissions: Record<string, Record<string, string[]>> = {
    mio_dev: {
      read: ['github.repo.contents', 'github.repo.file'],
      write: ['github.repo.file.upsert', 'mihub.deploy.vercel', 'mihub.build']
    },
    abacus: {
      read: ['logs.guardian', 'logs.mihub', 'metrics.health', 'metrics.analytics'],
      write: []
    },
    zapier: {
      read: ['integrations.zapier'],
      write: ['webhooks.trigger', 'integrations.zapier']
    },
    manus_worker: {
      read: ['tickets.read'],
      write: ['tickets.create']
    },
    orchestrator: {
      read: ['all'],
      write: ['agents.call']
    }
  };

  const agentPermissions = permissions[agentId];
  if (!agentPermissions) {
    console.warn(`[Guardian] Unknown agent: ${agentId}`);
    return false;
  }

  const allowedResources = agentPermissions[action] || [];
  const hasPermission = allowedResources.includes(resource) || allowedResources.includes('all');

  if (!hasPermission) {
    await logToGuardian({
      agent: agentId,
      method: action.toUpperCase(),
      path: resource,
      status: 'denied',
      reason: `No ${action} permission for ${resource}`
    });
  }

  return hasPermission;
}

/**
 * Rate limiting per agente
 * 
 * Verifica se un agente ha superato il rate limit.
 * In futuro: implementare con Redis per distributed rate limiting
 */
const rateLimitCache: Record<string, { count: number; resetAt: number }> = {};

export async function checkRateLimit(
  agentId: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<boolean> {
  const now = Date.now();
  const key = `${agentId}:${Math.floor(now / (windowSeconds * 1000))}`;

  if (!rateLimitCache[key]) {
    rateLimitCache[key] = { count: 0, resetAt: now + windowSeconds * 1000 };
  }

  const cache = rateLimitCache[key];

  // Reset se finestra scaduta
  if (now > cache.resetAt) {
    cache.count = 0;
    cache.resetAt = now + windowSeconds * 1000;
  }

  cache.count++;

  if (cache.count > limit) {
    await logToGuardian({
      agent: agentId,
      method: 'RATE_LIMIT',
      path: '/mihub/orchestrator',
      status: 'denied',
      reason: `Rate limit exceeded: ${cache.count}/${limit} in ${windowSeconds}s`,
      metadata: { count: cache.count, limit, resetAt: cache.resetAt }
    });
    return false;
  }

  return true;
}

/**
 * Cleanup cache rate limit (chiamare periodicamente)
 */
export function cleanupRateLimitCache(): void {
  const now = Date.now();
  
  for (const key in rateLimitCache) {
    if (rateLimitCache[key].resetAt < now) {
      delete rateLimitCache[key];
    }
  }
}

// Cleanup ogni 5 minuti
setInterval(cleanupRateLimitCache, 5 * 60 * 1000);
