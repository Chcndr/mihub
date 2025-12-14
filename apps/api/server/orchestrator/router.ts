/**
 * Router - Decisione Agenti
 * 
 * Analizza il messaggio dell'utente e decide quali agenti coinvolgere.
 * 
 * Strategia attuale: Keyword-based (semplice per MVP)
 * Futuro: LLM-based classification per decisioni più intelligenti
 */

import type { AgentId } from './index';

/**
 * Analizza messaggio e restituisce lista agenti da coinvolgere
 */
export async function analyzeMessage(message: string): Promise<AgentId[]> {
  const messageLower = message.toLowerCase();
  const agents: AgentId[] = [];

  // ============================================================================
  // PRIORITÀ ESPLICITA: Se il messaggio inizia con il nome di un agente
  // ============================================================================
  if (messageLower.startsWith('manus,') || messageLower.startsWith('manus ')) {
    console.log('[Router] Explicit agent detected: manus_worker');
    return ['manus_worker'];
  }
  if (messageLower.startsWith('gpt dev,') || messageLower.startsWith('gpt dev ') || messageLower.startsWith('gptdev,') || messageLower.startsWith('gptdev ')) {
    console.log('[Router] Explicit agent detected: mio_dev');
    return ['mio_dev'];
  }
  if (messageLower.startsWith('abacus,') || messageLower.startsWith('abacus ')) {
    console.log('[Router] Explicit agent detected: abacus');
    return ['abacus'];
  }
  if (messageLower.startsWith('zapier,') || messageLower.startsWith('zapier ')) {
    console.log('[Router] Explicit agent detected: zapier');
    return ['zapier'];
  }

  // ============================================================================
  // MANUS_WORKER - Comandi server, SSH, PM2, operazioni sistema
  // ============================================================================
  const manusWorkerKeywords = [
    'manus',
    'server',
    'ssh',
    'pm2',
    'restart',
    'riavvia',
    'esegui',
    'execute',
    'comando',
    'command',
    'deploy',  // Spostato da mio_dev a manus_worker
    'git pull',
    'pull',
    'logs',
    'stato',
    'status',
    'verifica',
    'check',
    'directory',
    'file system',
    'processo',
    'process'
  ];

  if (manusWorkerKeywords.some(keyword => messageLower.includes(keyword))) {
    agents.push('manus_worker');
  }

  // ============================================================================
  // MIO_DEV - GitHub connector e sviluppo (CODE, non deploy)
  // ============================================================================
  const mioDevKeywords = [
    'github',
    'codice',
    'code',
    'commit',
    'repo',
    'repository',
    'branch',
    'pull request',
    'pr',
    'merge',
    'file',
    'modifica',
    'crea file',
    'elimina file',
    'build',
    'compilazione',
    'errore compilazione',
    'dependency',
    'dipendenza',
    'package.json',
    'npm',
    'yarn',
    'pnpm'
  ];

  if (mioDevKeywords.some(keyword => messageLower.includes(keyword))) {
    agents.push('mio_dev');
  }

  // ============================================================================
  // ABACUS - Analisi log e metriche
  // ============================================================================
  const abacusKeywords = [
    'analizza',
    'analyze',
    'log',
    'logs',
    'metriche',
    'metrics',
    'errori',
    'errors',
    'statistiche',
    'statistics',
    'guardian',
    'api guardian',
    'performance',
    'latency',
    'response time',
    'quanti',
    'how many',
    'count',
    'conta',
    'dashboard',
    'report',
    'analisi',
    'analysis',
    'trend',
    'grafico',
    'chart'
  ];

  if (abacusKeywords.some(keyword => messageLower.includes(keyword))) {
    agents.push('abacus');
  }

  // ============================================================================
  // ZAPIER - Automazioni e webhook
  // ============================================================================
  const zapierKeywords = [
    'automazione',
    'automation',
    'webhook',
    'integrazione',
    'integration',
    'zapier',
    'trigger',
    'action',
    'workflow',
    'notifica',
    'notification',
    'email',
    'slack',
    'telegram',
    'discord',
    'api call',
    'chiamata api',
    'schedule',
    'pianifica',
    'cron'
  ];

  if (zapierKeywords.some(keyword => messageLower.includes(keyword))) {
    agents.push('zapier');
  }



  // ============================================================================
  // Default: se nessun agente specifico, usa mio_dev come coordinatore
  // ============================================================================
  if (agents.length === 0) {
    console.log('[Router] No specific agent detected, defaulting to mio_dev');
    agents.push('mio_dev');
  }

  // ============================================================================
  // Rimuovi duplicati (se un messaggio triggera più volte lo stesso agente)
  // ============================================================================
  const uniqueAgents = [...new Set(agents)];

  console.log(`[Router] Message: "${message.substring(0, 50)}..."`);
  console.log(`[Router] Selected agents: ${uniqueAgents.join(', ')}`);

  return uniqueAgents;
}

/**
 * Verifica se un messaggio richiede un agente specifico
 * (per future ottimizzazioni)
 */
export function requiresAgent(message: string, agentId: AgentId): boolean {
  const messageLower = message.toLowerCase();

  const agentKeywords: Record<AgentId, string[]> = {
    mio_dev: ['github', 'codice', 'deploy', 'commit'],
    abacus: ['analizza', 'log', 'metriche', 'errori'],
    zapier: ['automazione', 'webhook', 'integrazione'],
    manus_worker: ['ticket', 'operativo', 'manuale', 'umano']
  };

  return agentKeywords[agentId].some(keyword => messageLower.includes(keyword));
}

/**
 * Calcola priorità agente per un messaggio (1-10)
 * (per future ottimizzazioni di scheduling)
 */
export function calculateAgentPriority(message: string, agentId: AgentId): number {
  const messageLower = message.toLowerCase();
  let priority = 5; // Default

  // Parole urgenti aumentano priorità
  const urgentKeywords = ['urgente', 'urgent', 'critico', 'critical', 'subito', 'now', 'immediately'];
  if (urgentKeywords.some(keyword => messageLower.includes(keyword))) {
    priority += 3;
  }

  // Parole di analisi diminuiscono priorità (non urgenti)
  const analysisKeywords = ['analizza', 'analyze', 'report', 'statistiche'];
  if (analysisKeywords.some(keyword => messageLower.includes(keyword))) {
    priority -= 2;
  }

  // Clamp tra 1 e 10
  return Math.max(1, Math.min(10, priority));
}
