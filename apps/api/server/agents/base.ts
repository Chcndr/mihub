/**
 * Base Agent - Chiamata OpenAI API
 * 
 * Gestisce chiamate a OpenAI API per tutti gli agenti.
 * Supporta retry, error handling e logging.
 */

import OpenAI from 'openai';
import type { AgentId } from '../orchestrator/index';
import type { AgentPrompt } from '../orchestrator/promptBuilder';
import { logToGuardian, checkRateLimit } from '../orchestrator/guardian';

// Inizializza client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface AgentCallResponse {
  content: string;
  metadata?: any;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Chiama agente (OpenAI API + eventuali azioni specifiche)
 */
export async function callAgent(
  agentId: AgentId,
  prompt: AgentPrompt
): Promise<AgentCallResponse> {
  try {
    // 1. Verifica rate limit
    const withinLimit = await checkRateLimit(agentId, 10, 60);
    if (!withinLimit) {
      throw new Error('Rate limit exceeded for agent');
    }

    // 2. Log inizio chiamata
    console.log(`[Agent ${agentId}] Calling OpenAI API with model ${prompt.model}`);
    
    const startTime = Date.now();

    // 3. Chiama OpenAI API
    const completion = await openai.chat.completions.create({
      model: prompt.model,
      messages: prompt.messages as any,
      temperature: prompt.temperature,
      max_tokens: prompt.maxTokens
    });

    const responseTime = Date.now() - startTime;

    // 4. Estrai risposta
    const content = completion.choices[0]?.message?.content || '';
    const usage = completion.usage;

    console.log(`[Agent ${agentId}] Response received in ${responseTime}ms (${usage?.total_tokens} tokens)`);

    // 5. Esegui azioni specifiche agente (se necessario)
    const actionResult = await executeAgentActions(agentId, content);

    // 6. Log successo in Guardian
    await logToGuardian({
      agent: agentId,
      method: 'POST',
      path: '/openai/chat/completions',
      status: 'allowed',
      metadata: {
        model: prompt.model,
        responseTime,
        tokens: usage?.total_tokens
      }
    });

    return {
      content,
      metadata: {
        model: prompt.model,
        responseTime,
        actions: actionResult
      },
      usage: usage ? {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      } : undefined
    };
  } catch (error) {
    console.error(`[Agent ${agentId}] Error:`, error);

    // Log errore in Guardian
    await logToGuardian({
      agent: agentId,
      method: 'POST',
      path: '/openai/chat/completions',
      status: 'error',
      reason: error instanceof Error ? error.message : 'Unknown error'
    });

    throw error;
  }
}

/**
 * Esegui azioni specifiche per agente
 * 
 * Ogni agente può avere azioni custom da eseguire dopo la risposta OpenAI.
 * Es: mio_dev può fare commit GitHub, zapier può triggerare webhook, etc.
 */
async function executeAgentActions(
  agentId: AgentId,
  content: string
): Promise<any> {
  switch (agentId) {
    case 'mio_dev':
      return await executeMioDevActions(content);
    
    case 'abacus':
      return await executeAbacusActions(content);
    
    case 'zapier':
      return await executeZapierActions(content);
    
    case 'manus_worker':
      return await executeManusWorkerActions(content);
    
    default:
      return null;
  }
}

/**
 * Azioni MIO Dev (GitHub)
 */
async function executeMioDevActions(content: string): Promise<any> {
  // TODO: Implementare azioni GitHub
  // - Creare/modificare file
  // - Fare commit
  // - Triggerare deploy Vercel
  // - etc.
  
  console.log('[MIO Dev] No actions to execute (not implemented yet)');
  return null;
}

/**
 * Azioni Abacus (Analisi)
 */
async function executeAbacusActions(content: string): Promise<any> {
  // TODO: Implementare azioni analisi
  // - Leggere log Guardian
  // - Calcolare metriche
  // - Generare grafici
  // - etc.
  
  console.log('[Abacus] No actions to execute (not implemented yet)');
  return null;
}

/**
 * Azioni Zapier (Automazioni)
 */
async function executeZapierActions(content: string): Promise<any> {
  // TODO: Implementare azioni automazioni
  // - Triggerare webhook
  // - Inviare notifiche
  // - etc.
  
  console.log('[Zapier] No actions to execute (not implemented yet)');
  return null;
}

/**
 * Azioni Manus Worker (Ticket)
 */
async function executeManusWorkerActions(content: string): Promise<any> {
  // TODO: Implementare azioni ticket
  // - Creare ticket
  // - Aggiornare stato
  // - etc.
  
  console.log('[Manus Worker] No actions to execute (not implemented yet)');
  return null;
}

/**
 * Retry con exponential backoff
 */
export async function callAgentWithRetry(
  agentId: AgentId,
  prompt: AgentPrompt,
  maxRetries: number = 3
): Promise<AgentCallResponse> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callAgent(agentId, prompt);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`[Agent ${agentId}] Attempt ${attempt}/${maxRetries} failed:`, lastError.message);

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`[Agent ${agentId}] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Failed after retries');
}
