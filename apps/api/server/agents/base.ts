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

    // 2. Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn(`[Agent ${agentId}] OPENAI_API_KEY not found, using mock response`);
      return getMockResponse(agentId, prompt);
    }

    // 3. Log inizio chiamata
    console.log(`[Agent ${agentId}] Calling OpenAI API with model ${prompt.model}`);
    
    const startTime = Date.now();

    // 4. Chiama OpenAI API
    const completion = await openai.chat.completions.create({
      model: prompt.model,
      messages: prompt.messages as any,
      temperature: prompt.temperature,
      max_tokens: prompt.maxTokens
    });

    const responseTime = Date.now() - startTime;

    // 5. Estrai risposta
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

/**
 * Mock responses per test senza OPENAI_API_KEY
 */
function getMockResponse(agentId: AgentId, prompt: AgentPrompt): AgentCallResponse {
  const userMessage = prompt.messages[prompt.messages.length - 1]?.content || '';
  
  const mockResponses: Record<AgentId, string> = {
    mio_dev: `🔧 **MIO Dev (Mock Mode)**

Ho analizzato la tua richiesta: "${userMessage.substring(0, 100)}..."

### Azioni Pianificate:
1. ✅ Verifica repository GitHub
2. ✅ Analisi file modificati
3. ✅ Controllo build status

### Risultato:
- **Repository:** Chcndr/mihub
- **Branch:** master
- **Ultimo commit:** 9791f84
- **Status:** ✅ Build successful

*Nota: Questa è una risposta mock. Configura OPENAI_API_KEY per risposte reali.*`,

    abacus: `📊 **Abacus (Mock Mode)**

Analisi richiesta: "${userMessage.substring(0, 100)}..."

### Metriche Sistema:
| Metrica | Valore | Trend |
|---------|--------|-------|
| Richieste totali | 1,234 | ↗️ +12% |
| Errori | 5 | ↘️ -3% |
| Latenza media | 245ms | ↗️ +8% |
| Uptime | 99.8% | → |

### Top 5 Endpoint:
1. /api/trpc/mihub.orchestrator (45%)
2. /api/trpc/guardian.logs (23%)
3. /api/trpc/analytics.overview (15%)
4. /api/trpc/dmsHub.markets (10%)
5. /api/trpc/mioAgent.getLogs (7%)

*Nota: Dati mock. Configura OPENAI_API_KEY per analisi reali.*`,

    zapier: `⚡ **Zapier (Mock Mode)**

Richiesta automazione: "${userMessage.substring(0, 100)}..."

### Workflow Suggerito:
1. **Trigger:** Nuovo messaggio in chat
2. **Azione 1:** Analizza contenuto
3. **Azione 2:** Notifica su Slack
4. **Azione 3:** Salva in database

### Integrazioni Disponibili:
- ✅ Slack
- ✅ Telegram
- ✅ Email (SendGrid)
- ✅ Webhook custom

### Prossimi Step:
- Conferma workflow
- Configura credenziali
- Test automazione

*Nota: Mock mode. Configura OPENAI_API_KEY per automazioni reali.*`,

    manus_worker: `🎫 **Manus Worker (Mock Mode)**

Richiesta task: "${userMessage.substring(0, 100)}..."

### Ticket Creato:
- **ID:** TASK-${Date.now().toString().slice(-6)}
- **Tipo:** Operativo
- **Priorità:** Media
- **Assegnato a:** Team operativo
- **Status:** 🟡 In attesa

### Dettagli:
- **Descrizione:** ${userMessage.substring(0, 200)}
- **Creato:** ${new Date().toLocaleString('it-IT')}
- **SLA:** 24 ore

### Azioni:
- [ ] Analisi richiesta
- [ ] Pianificazione intervento
- [ ] Esecuzione
- [ ] Verifica

*Nota: Ticket mock. Configura OPENAI_API_KEY per gestione reale.*`
  };

  const content = mockResponses[agentId] || `Mock response from ${agentId}`;

  console.log(`[Agent ${agentId}] Mock response generated (${content.length} chars)`);

  return {
    content,
    metadata: {
      model: 'mock',
      responseTime: 100,
      mock: true
    },
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0
    }
  };
}
