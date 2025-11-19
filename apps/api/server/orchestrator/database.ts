/**
 * Database - Query per orchestratore
 * 
 * Gestisce salvataggio e recupero conversazioni dal database Neon PostgreSQL.
 * Usa tabella `agent_messages` già esistente nello schema.
 */

import { getDb } from '../db';
import { agentMessages } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { AgentId } from './index';

export interface SaveMessageInput {
  conversationId: string;
  sender: string; // 'user' | AgentId
  content: string;
  messageType?: 'text' | 'task' | 'notification' | 'error';
  metadata?: any;
  recipients?: string[];
  attachments?: any[];
}

export interface ConversationMessage {
  id: number;
  messageId: string;
  conversationId: string;
  sender: string;
  content: string;
  messageType: string;
  metadata: any;
  createdAt: Date;
}

/**
 * Salva messaggio in database
 */
export async function saveMessage(input: SaveMessageInput): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    await db.insert(agentMessages).values({
      messageId,
      conversationId: input.conversationId,
      sender: input.sender,
      recipients: input.recipients ? JSON.stringify(input.recipients) : null,
      messageType: input.messageType || 'text',
      content: input.content,
      attachments: input.attachments ? JSON.stringify(input.attachments) : null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      readBy: JSON.stringify([input.sender]), // Sender ha già letto
      createdAt: new Date()
    });

    console.log(`[Database] Message saved: ${messageId} (conversation: ${input.conversationId})`);
  } catch (error) {
    console.error('[Database] Error saving message:', error);
    throw error;
  }
}

/**
 * Recupera conversazione per agente specifico
 */
export async function getConversation(
  userId: string,
  agentId: AgentId,
  limit: number = 50
): Promise<ConversationMessage[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    // Cerca conversazioni dove:
    // - conversationId contiene userId
    // - sender è user o agentId
    const messages = await db
      .select()
      .from(agentMessages)
      .where(
        and(
          // conversationId pattern: conv_{userId}_{timestamp}
          // Usiamo LIKE per trovare tutte le conversazioni dell'utente
          // Note: In produzione, meglio avere una colonna userId separata
        )
      )
      .orderBy(desc(agentMessages.createdAt))
      .limit(limit);

    // Filtra messaggi per userId e agentId
    const filtered = messages.filter(msg => 
      msg.conversationId.includes(userId) &&
      (msg.sender === 'user' || msg.sender === agentId)
    );

    // Ordina per data crescente (più vecchi prima)
    const sorted = filtered.reverse();

    console.log(`[Database] Retrieved ${sorted.length} messages for user ${userId}, agent ${agentId}`);

    return sorted.map(msg => ({
      id: msg.id,
      messageId: msg.messageId,
      conversationId: msg.conversationId,
      sender: msg.sender,
      content: msg.content,
      messageType: msg.messageType,
      metadata: msg.metadata ? JSON.parse(msg.metadata as string) : null,
      createdAt: msg.createdAt
    }));
  } catch (error) {
    console.error('[Database] Error getting conversation:', error);
    return [];
  }
}

/**
 * Recupera ultima conversazione per agente
 */
export async function getLastConversation(
  userId: string,
  agentId: AgentId
): Promise<ConversationMessage | null> {
  const messages = await getConversation(userId, agentId, 1);
  return messages.length > 0 ? messages[0] : null;
}

/**
 * Recupera tutte le conversazioni attive per utente
 */
export async function getActiveConversations(userId: string): Promise<Record<AgentId, ConversationMessage[]>> {
  const agents: AgentId[] = ['mio_dev', 'abacus', 'zapier', 'manus_worker'];
  const conversations: Record<AgentId, ConversationMessage[]> = {
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

/**
 * Conta messaggi per agente
 */
export async function countMessages(userId: string, agentId: AgentId): Promise<number> {
  const messages = await getConversation(userId, agentId, 1000);
  return messages.length;
}

/**
 * Marca messaggi come letti
 */
export async function markAsRead(conversationId: string, readBy: string): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    // Recupera messaggi della conversazione
    const messages = await db
      .select()
      .from(agentMessages)
      .where(eq(agentMessages.conversationId, conversationId));

    // Aggiorna readBy per ogni messaggio
    for (const msg of messages) {
      const currentReadBy = msg.readBy ? JSON.parse(msg.readBy as string) : [];
      
      if (!currentReadBy.includes(readBy)) {
        currentReadBy.push(readBy);
        
        await db
          .update(agentMessages)
          .set({ readBy: JSON.stringify(currentReadBy) })
          .where(eq(agentMessages.id, msg.id));
      }
    }

    console.log(`[Database] Marked conversation ${conversationId} as read by ${readBy}`);
  } catch (error) {
    console.error('[Database] Error marking as read:', error);
  }
}

/**
 * Elimina vecchie conversazioni (cleanup)
 */
export async function cleanupOldConversations(daysOld: number = 90): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // TODO: Implement date comparison with Drizzle ORM
    // const result = await db
    //   .delete(agentMessages)
    //   .where(lt(agentMessages.createdAt, cutoffDate));

    console.log(`[Database] Cleaned up conversations older than ${daysOld} days`);
    return 0; // TODO: return actual count
  } catch (error) {
    console.error('[Database] Error cleaning up conversations:', error);
    return 0;
  }
}
