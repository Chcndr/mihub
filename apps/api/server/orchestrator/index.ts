/**
 * MIHUB Multi-Agent Orchestrator
 * 
 * Sistema centrale che coordina 4 agenti specializzati:
 * - mio_dev: GitHub connector e sviluppo
 * - abacus: Analisi log e metriche
 * - zapier: Automazioni e webhook
 * - manus_worker: Ticket operativi umani
 * 
 * Architettura:
 * 1. Riceve messaggio da frontend (mode: auto | manual)
 * 2. Decide quali agenti coinvolgere (router)
 * 3. Costruisce prompt per ogni agente
 * 4. Chiama OpenAI API per ogni agente
 * 5. Salva conversazioni in DB (agent_messages)
 * 6. Genera risposta finale per utente
 * 7. Log in Guardian
 */

import { analyzeMessage } from './router';
import { buildPrompt } from './promptBuilder';
import { callAgent } from '../agents/base';
import { saveMessage, getConversation } from './database';
import { generateFinalResponse } from './responseGenerator';
import { logToGuardian } from './guardian';

export type AgentId = 'mio_dev' | 'abacus' | 'zapier' | 'manus_worker';

export interface OrchestratorRequest {
  message: string;
  userId: string;
  targetAgent?: AgentId;
  mode: 'auto' | 'manual';
  context?: {
    dashboardTab?: string;
    previousMessages?: any[];
  };
}

export interface OrchestratorResponse {
  success: boolean;
  message: string;
  agentsUsed: AgentId[];
  conversationId: string;
  timestamp: string; // ISO string
  error?: string;
}

export interface AgentResponse {
  agentId: AgentId;
  content: string;
  metadata?: any;
  error?: string;
}

/**
 * Funzione principale orchestratore
 */
export async function orchestrate(request: OrchestratorRequest): Promise<OrchestratorResponse> {
  const { message, userId, targetAgent, mode, context } = request;
  const conversationId = `conv_${userId}_${Date.now()}`;

  try {
    // 1. Determina quali agenti coinvolgere
    let agentsToUse: AgentId[];
    
    if (mode === 'manual' && targetAgent) {
      // Modalità manuale: usa solo l'agente specificato
      agentsToUse = [targetAgent];
      console.log(`[Orchestrator] Mode: manual, target: ${targetAgent}`);
    } else {
      // Modalità auto: analizza messaggio e decide
      agentsToUse = await analyzeMessage(message);
      console.log(`[Orchestrator] Mode: auto, agents selected: ${agentsToUse.join(', ')}`);
    }

    // 2. Per ogni agente, costruisci prompt e chiama
    const agentResponses: AgentResponse[] = [];
    
    for (const agentId of agentsToUse) {
      try {
        console.log(`[Orchestrator] Calling agent: ${agentId}`);
        
        // Costruisci prompt specifico per agente
        const prompt = await buildPrompt(agentId, message, userId, conversationId);
        
        // Salva messaggio di delega MIO → Agente
        await saveMessage({
          conversationId,
          sender: 'mio',
          content: prompt,
          messageType: 'text',
          recipients: [agentId],
          metadata: { delegatedFrom: 'user', originalMessage: message }
        });
        console.log(`[Orchestrator] Delegation message saved: mio → ${agentId}`);
        
        // Chiama agente (OpenAI API + eventuali azioni)
        const response = await callAgent(agentId, prompt);
        
        // Salva risposta Agente → MIO
        await saveMessage({
          conversationId,
          sender: agentId,
          content: response.content,
          messageType: 'text',
          recipients: ['mio'],
          metadata: response.metadata
        });
        console.log(`[Orchestrator] Agent response saved: ${agentId} → mio`);
        
        agentResponses.push({
          agentId,
          content: response.content,
          metadata: response.metadata
        });
        
        console.log(`[Orchestrator] Agent ${agentId} responded successfully`);
      } catch (error) {
        console.error(`[Orchestrator] Error calling agent ${agentId}:`, error);
        
        agentResponses.push({
          agentId,
          content: `Errore durante l'esecuzione dell'agente ${agentId}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // 3. Genera risposta finale per l'utente
    const finalResponse = await generateFinalResponse(message, agentResponses, mode);

    // 4. Log in API Guardian
    await logToGuardian({
      agent: 'orchestrator',
      method: 'POST',
      path: '/mihub/orchestrator',
      status: 'allowed',
      metadata: {
        userId,
        agentsUsed: agentsToUse,
        mode,
        conversationId
      }
    });

    return {
      success: true,
      message: finalResponse,
      agentsUsed: agentsToUse,
      conversationId,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Orchestrator] Fatal error:', error);
    
    // Log errore in Guardian
    await logToGuardian({
      agent: 'orchestrator',
      method: 'POST',
      path: '/mihub/orchestrator',
      status: 'error',
      metadata: {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    return {
      success: false,
      message: 'Si è verificato un errore durante l\'elaborazione della richiesta',
      agentsUsed: [],
      conversationId,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Recupera conversazione per agente
 */
export async function getAgentConversation(userId: string, agentId: AgentId, limit: number = 50) {
  return await getConversation(userId, agentId, limit);
}

/**
 * Recupera tutte le conversazioni di un utente
 */
export async function getAllConversations(userId: string) {
  const agents: AgentId[] = ['mio_dev', 'abacus', 'zapier', 'manus_worker'];
  const conversations: Record<AgentId, any[]> = {
    mio_dev: [],
    abacus: [],
    zapier: [],
    manus_worker: []
  };

  for (const agentId of agents) {
    conversations[agentId] = await getConversation(userId, agentId, 10);
  }

  return conversations;
}
