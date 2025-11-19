/**
 * MIHUB Router - API per Multi-Agent System
 * Gestisce comunicazione tra MIO, Manus, Abacus, Zapier
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { 
  agentTasks, 
  agentProjects, 
  agentBrain, 
  agentMessages, 
  agentContext,
  dataBag 
} from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { emitEvent } from "./eventBus";
import { orchestrate, getAgentConversation, getAllConversations } from "./orchestrator/index";

export const mihubRouter = router({
  // ============================================================================
  // AGENT TASKS
  // ============================================================================
  
  createTask: publicProcedure
    .input(z.object({
      agentAssigned: z.string().optional(),
      taskType: z.string(),
      priority: z.number().min(1).max(10).default(5),
      input: z.any().optional(),
      parentTaskId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const [task] = await db.insert(agentTasks).values({
        taskId,
        agentAssigned: input.agentAssigned,
        taskType: input.taskType,
        priority: input.priority,
        status: "pending",
        input: input.input ? JSON.stringify(input.input) : null,
        parentTaskId: input.parentTaskId,
      }).returning();

      // Emetti evento
      await emitEvent({
        eventType: "task_created",
        source: "mihub",
        target: input.agentAssigned,
        payload: { taskId, taskType: input.taskType },
      });

      return task;
    }),

  getTasks: publicProcedure
    .input(z.object({
      agentAssigned: z.string().optional(),
      status: z.string().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(agentTasks);

      if (input.agentAssigned) {
        query = query.where(eq(agentTasks.agentAssigned, input.agentAssigned)) as any;
      }
      if (input.status) {
        query = query.where(eq(agentTasks.status, input.status)) as any;
      }

      const tasks = await query.limit(input.limit).orderBy(desc(agentTasks.createdAt));
      
      return tasks.map(t => ({
        ...t,
        input: t.input ? JSON.parse(t.input) : null,
        output: t.output ? JSON.parse(t.output) : null,
      }));
    }),

  updateTaskStatus: publicProcedure
    .input(z.object({
      taskId: z.string(),
      status: z.enum(["pending", "in_progress", "completed", "failed"]),
      output: z.any().optional(),
      error: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updates: any = {
        status: input.status,
        updatedAt: new Date(),
      };

      if (input.status === "in_progress") {
        updates.startedAt = new Date();
      }
      if (input.status === "completed" || input.status === "failed") {
        updates.completedAt = new Date();
      }
      if (input.output) {
        updates.output = JSON.stringify(input.output);
      }
      if (input.error) {
        updates.error = input.error;
      }

      await db
        .update(agentTasks)
        .set(updates)
        .where(eq(agentTasks.taskId, input.taskId));

      // Emetti evento
      await emitEvent({
        eventType: "task_status_changed",
        source: "mihub",
        payload: { taskId: input.taskId, status: input.status },
      });

      return { success: true };
    }),

  // ============================================================================
  // AGENT MESSAGES (Chat Multi-Agente)
  // ============================================================================

  sendMessage: publicProcedure
    .input(z.object({
      conversationId: z.string(),
      sender: z.string(),
      content: z.string(),
      recipients: z.array(z.string()).optional(),
      messageType: z.enum(["text", "task", "notification", "error"]).default("text"),
      attachments: z.any().optional(),
      metadata: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const [message] = await db.insert(agentMessages).values({
        messageId,
        conversationId: input.conversationId,
        sender: input.sender,
        recipients: input.recipients ? JSON.stringify(input.recipients) : null,
        messageType: input.messageType,
        content: input.content,
        attachments: input.attachments ? JSON.stringify(input.attachments) : null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        readBy: JSON.stringify([input.sender]), // Sender ha già letto
      }).returning();

      // Emetti evento
      await emitEvent({
        eventType: "agent_message",
        source: input.sender,
        target: input.recipients ? input.recipients.join(",") : "all",
        payload: { messageId, conversationId: input.conversationId, content: input.content },
      });

      return message;
    }),

  getMessages: publicProcedure
    .input(z.object({
      conversationId: z.string(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const messages = await db
        .select()
        .from(agentMessages)
        .where(eq(agentMessages.conversationId, input.conversationId))
        .orderBy(desc(agentMessages.createdAt))
        .limit(input.limit);

      return messages.map(m => ({
        ...m,
        recipients: m.recipients ? JSON.parse(m.recipients) : null,
        attachments: m.attachments ? JSON.parse(m.attachments) : null,
        metadata: m.metadata ? JSON.parse(m.metadata) : null,
        readBy: m.readBy ? JSON.parse(m.readBy) : [],
      }));
    }),

  markMessageAsRead: publicProcedure
    .input(z.object({
      messageId: z.string(),
      agent: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [message] = await db
        .select()
        .from(agentMessages)
        .where(eq(agentMessages.messageId, input.messageId));

      if (!message) {
        throw new Error("Message not found");
      }

      const readBy = message.readBy ? JSON.parse(message.readBy) : [];
      if (!readBy.includes(input.agent)) {
        readBy.push(input.agent);
      }

      await db
        .update(agentMessages)
        .set({ readBy: JSON.stringify(readBy) })
        .where(eq(agentMessages.messageId, input.messageId));

      return { success: true };
    }),

  // ============================================================================
  // DATA BAG (Storage Condiviso)
  // ============================================================================

  setBagValue: publicProcedure
    .input(z.object({
      key: z.string(),
      value: z.any(),
      valueType: z.enum(["json", "string", "number", "boolean"]).default("json"),
      owner: z.string().optional(),
      accessLevel: z.enum(["private", "shared", "public"]).default("shared"),
      ttl: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const expiresAt = input.ttl ? new Date(Date.now() + input.ttl * 1000) : null;

      await db.insert(dataBag).values({
        key: input.key,
        value: typeof input.value === "string" ? input.value : JSON.stringify(input.value),
        valueType: input.valueType,
        owner: input.owner,
        accessLevel: input.accessLevel,
        ttl: input.ttl,
        expiresAt,
      }).onConflictDoUpdate({
        target: dataBag.key,
        set: {
          value: typeof input.value === "string" ? input.value : JSON.stringify(input.value),
          valueType: input.valueType,
          owner: input.owner,
          accessLevel: input.accessLevel,
          ttl: input.ttl,
          expiresAt,
          updatedAt: new Date(),
        },
      });

      return { success: true };
    }),

  getBagValue: publicProcedure
    .input(z.object({
      key: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [item] = await db
        .select()
        .from(dataBag)
        .where(eq(dataBag.key, input.key));

      if (!item) {
        return null;
      }

      // Check TTL
      if (item.expiresAt && item.expiresAt < new Date()) {
        await db.delete(dataBag).where(eq(dataBag.key, input.key));
        return null;
      }

      let value = item.value;
      if (item.valueType === "json") {
        try {
          value = JSON.parse(item.value);
        } catch (e) {
          // Keep as string if parse fails
        }
      } else if (item.valueType === "number") {
        value = parseFloat(item.value);
      } else if (item.valueType === "boolean") {
        value = item.value === "true";
      }

      return {
        ...item,
        value,
      };
    }),

  deleteBagValue: publicProcedure
    .input(z.object({
      key: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(dataBag).where(eq(dataBag.key, input.key));
      return { success: true };
    }),

  // ============================================================================
  // AGENT BRAIN (Memoria e Decisioni)
  // ============================================================================

  saveBrainMemory: publicProcedure
    .input(z.object({
      agent: z.string(),
      memoryType: z.enum(["decision", "context", "learning", "history"]),
      key: z.string(),
      value: z.any(),
      confidence: z.number().min(0).max(100).default(100),
      expiresAt: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(agentBrain).values({
        agent: input.agent,
        memoryType: input.memoryType,
        key: input.key,
        value: JSON.stringify(input.value),
        confidence: input.confidence,
        expiresAt: input.expiresAt,
      });

      return { success: true };
    }),

  getBrainMemory: publicProcedure
    .input(z.object({
      agent: z.string(),
      memoryType: z.string().optional(),
      key: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(agentBrain).where(eq(agentBrain.agent, input.agent));

      if (input.memoryType) {
        query = query.where(and(
          eq(agentBrain.agent, input.agent),
          eq(agentBrain.memoryType, input.memoryType)
        )) as any;
      }
      if (input.key) {
        query = query.where(and(
          eq(agentBrain.agent, input.agent),
          eq(agentBrain.key, input.key)
        )) as any;
      }

      const memories = await query.orderBy(desc(agentBrain.createdAt));

      return memories.map(m => ({
        ...m,
        value: JSON.parse(m.value),
      }));
    }),

  // ============================================================================
  // ORCHESTRATOR (Multi-Agent Coordination)
  // ============================================================================

  orchestrator: publicProcedure
    .input(z.object({
      message: z.string(),
      userId: z.string(),
      targetAgent: z.enum(["mio_dev", "abacus", "zapier", "manus_worker"]).optional(),
      mode: z.enum(["auto", "manual"]),
      context: z.object({
        dashboardTab: z.string().optional(),
        previousMessages: z.array(z.any()).optional(),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      // DEBUG: Log input completo
      console.log("[mihubRouter] Orchestrator input:", JSON.stringify(input, null, 2));
      console.log("[mihubRouter] Input fields:", {
        message: typeof input.message,
        userId: typeof input.userId,
        targetAgent: input.targetAgent,
        mode: input.mode,
        context: input.context,
      });

      try {
        const response = await orchestrate({
          message: input.message,
          userId: input.userId,
          targetAgent: input.targetAgent,
          mode: input.mode,
          context: input.context,
        });

        // DEBUG: Log response
        console.log("[mihubRouter] Orchestrator response:", JSON.stringify(response, null, 2));

        return response;
      } catch (error) {
        console.error("[mihubRouter] Orchestrator error:", error);
        console.error("[mihubRouter] Error stack:", error instanceof Error ? error.stack : 'No stack');
        throw new Error(error instanceof Error ? error.message : "Orchestrator failed");
      }
    }),

  getConversation: publicProcedure
    .input(z.object({
      userId: z.string(),
      agentId: z.enum(["mio_dev", "abacus", "zapier", "manus_worker"]),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      try {
        const messages = await getAgentConversation(input.userId, input.agentId, input.limit);
        return messages;
      } catch (error) {
        console.error("[mihubRouter] Get conversation error:", error);
        return [];
      }
    }),

  getAllConversations: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const conversations = await getAllConversations(input.userId);
        return conversations;
      } catch (error) {
        console.error("[mihubRouter] Get all conversations error:", error);
        return {
          mio_dev: [],
          abacus: [],
          zapier: [],
          manus_worker: [],
        };
      }
    }),
});
