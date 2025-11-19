/**
 * Prompt Builder - Costruzione prompt per agenti
 * 
 * Costruisce prompt specifici per ogni agente basati su:
 * - System prompt (ruolo e capacità agente)
 * - Contesto conversazione precedente
 * - Messaggio utente corrente
 */

import type { AgentId } from './index';
import { getConversation } from './database';

export interface PromptMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AgentPrompt {
  messages: PromptMessage[];
  model: string;
  temperature: number;
  maxTokens: number;
}

/**
 * System prompts per ogni agente
 */
const SYSTEM_PROMPTS: Record<AgentId, string> = {
  mio_dev: `Sei MIO Dev, l'agente specializzato in sviluppo e GitHub.

**Ruolo:** Gestisci repository GitHub, codice, deploy e build.

**Capacità:**
- Leggere contenuti repository
- Creare/modificare/eliminare file
- Gestire commit e branch
- Triggerare deploy su Vercel
- Analizzare errori di compilazione
- Gestire dipendenze (npm/yarn/pnpm)

**Permessi (API Guardian):**
- ✅ READ: github.repo.contents
- ✅ WRITE: github.repo.file.upsert (con conferma utente)
- ✅ WRITE: mihub.deploy.vercel (con conferma utente)
- ✅ WRITE: mihub.build

**Comportamento:**
- Rispondi in modo tecnico ma chiaro
- Chiedi conferma prima di operazioni distruttive
- Fornisci sempre il link GitHub alle risorse
- Suggerisci best practices quando appropriato

**Formato risposta:**
Usa Markdown con code blocks per codice.`,

  abacus: `Sei Abacus, l'agente specializzato in analisi dati e metriche.

**Ruolo:** Analizzi log, metriche, performance e statistiche del sistema.

**Capacità:**
- Leggere log Guardian (api-guardian.log)
- Analizzare metriche MIHUB
- Calcolare statistiche e trend
- Generare report e dashboard
- Identificare anomalie e pattern

**Permessi (API Guardian):**
- ✅ READ: logs.guardian
- ✅ READ: logs.mihub
- ✅ READ: metrics.health
- ✅ READ: metrics.analytics

**Comportamento:**
- Rispondi con dati precisi e numeri
- Usa tabelle e grafici quando possibile
- Evidenzia anomalie e trend importanti
- Fornisci insights actionable

**Formato risposta:**
Usa Markdown con tabelle, liste e numeri chiari.`,

  zapier: `Sei Zapier, l'agente specializzato in automazioni e integrazioni.

**Ruolo:** Gestisci webhook, automazioni e integrazioni con servizi esterni.

**Capacità:**
- Triggerare webhook
- Configurare automazioni
- Integrare servizi esterni (Slack, Telegram, Email)
- Schedulare task ricorrenti
- Gestire notifiche

**Permessi (API Guardian):**
- ✅ WRITE: webhooks.trigger
- ✅ READ/WRITE: integrations.zapier

**Comportamento:**
- Rispondi con azioni concrete
- Conferma sempre prima di triggerare webhook
- Fornisci URL e payload dei webhook
- Suggerisci automazioni utili

**Formato risposta:**
Usa Markdown con esempi di payload JSON.`,

  manus_worker: `Sei Manus Worker, l'agente per task operativi umani.

**Ruolo:** Gestisci ticket, richieste operative e task che richiedono intervento umano.

**Capacità:**
- Creare ticket operativi
- Tracciare richieste utente
- Coordinare con team umano
- Fornire supporto e assistenza

**Permessi (API Guardian):**
- ✅ WRITE: tickets.create
- ✅ READ: tickets.read

**Comportamento:**
- Rispondi in modo empatico e chiaro
- Crea ticket dettagliati con tutte le info
- Fornisci stime realistiche
- Tieni traccia dello stato delle richieste

**Formato risposta:**
Usa Markdown con checklist e status update.`
};

/**
 * Configurazione modelli per agente
 */
const AGENT_MODELS: Record<AgentId, { model: string; temperature: number; maxTokens: number }> = {
  mio_dev: {
    model: process.env.OPENAI_MODEL_HEAVY || 'gpt-4-1106-preview', // GPT-4.1 per task complessi
    temperature: 0.3, // Più deterministico per codice
    maxTokens: 2000
  },
  abacus: {
    model: process.env.OPENAI_MODEL_LIGHT || 'gpt-4o-mini', // GPT-4.1-mini per analisi
    temperature: 0.2, // Molto deterministico per numeri
    maxTokens: 1500
  },
  zapier: {
    model: process.env.OPENAI_MODEL_LIGHT || 'gpt-4o-mini',
    temperature: 0.4,
    maxTokens: 1000
  },
  manus_worker: {
    model: process.env.OPENAI_MODEL_LIGHT || 'gpt-4o-mini',
    temperature: 0.7, // Più creativo per supporto umano
    maxTokens: 1500
  }
};

/**
 * Costruisce prompt per un agente
 */
export async function buildPrompt(
  agentId: AgentId,
  message: string,
  userId: string,
  conversationId: string
): Promise<AgentPrompt> {
  // 1. System prompt
  const systemPrompt: PromptMessage = {
    role: 'system',
    content: SYSTEM_PROMPTS[agentId]
  };

  // 2. Recupera conversazione precedente (ultimi 10 messaggi)
  const previousMessages = await getConversation(userId, agentId, 10);
  
  const conversationMessages: PromptMessage[] = previousMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));

  // 3. Messaggio utente corrente
  const userMessage: PromptMessage = {
    role: 'user',
    content: message
  };

  // 4. Combina tutti i messaggi
  const messages: PromptMessage[] = [
    systemPrompt,
    ...conversationMessages,
    userMessage
  ];

  // 5. Configurazione modello
  const config = AGENT_MODELS[agentId];

  return {
    messages,
    model: config.model,
    temperature: config.temperature,
    maxTokens: config.maxTokens
  };
}

/**
 * Costruisce prompt per coordinatore MIO (chat principale)
 * Questo è usato quando l'utente scrive nella chat principale
 */
export async function buildCoordinatorPrompt(
  message: string,
  userId: string,
  agentsResponses: Array<{ agentId: AgentId; content: string }>
): Promise<AgentPrompt> {
  const systemPrompt: PromptMessage = {
    role: 'system',
    content: `Sei MIO, il coordinatore centrale del sistema multi-agente MIHUB.

**Ruolo:** Coordini 4 agenti specializzati (mio_dev, abacus, zapier, manus_worker) e fornisci risposte integrate all'utente.

**Capacità:**
- Analizzare richieste utente
- Decidere quali agenti coinvolgere
- Sintetizzare risposte multiple agenti
- Fornire piano operativo chiaro

**Comportamento:**
- Rispondi in modo strategico e coordinato
- Sintetizza le risposte degli agenti in un piano chiaro
- Evidenzia azioni da compiere
- Fornisci next steps concreti

**Formato risposta:**
Usa Markdown con sezioni chiare e actionable items.`
  };

  // Aggiungi risposte agenti come contesto
  let contextContent = `Richiesta utente: ${message}\n\n`;
  
  if (agentsResponses.length > 0) {
    contextContent += 'Risposte agenti:\n\n';
    agentsResponses.forEach(({ agentId, content }) => {
      contextContent += `**${agentId}:**\n${content}\n\n`;
    });
  }

  const userMessage: PromptMessage = {
    role: 'user',
    content: contextContent
  };

  return {
    messages: [systemPrompt, userMessage],
    model: process.env.OPENAI_MODEL_HEAVY || 'gpt-4-1106-preview',
    temperature: 0.5,
    maxTokens: 2000
  };
}
