/**
 * Event Bus - Sistema centralizzato per gestione eventi
 * Traccia tutti gli eventi del sistema (click, API calls, task completions, agent messages)
 * Permette comunicazione real-time tra frontend, backend e agenti
 */
import { getDb } from "./db";
import { systemEvents } from "../drizzle/schema";
import { eq } from "drizzle-orm";
/**
 * Emette un evento nel sistema
 */
export async function emitEvent(event) {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const db = await getDb();
    if (!db)
        throw new Error("Database not available");
    await db.insert(systemEvents).values({
        eventId,
        eventType: event.eventType,
        source: event.source,
        target: event.target,
        payload: event.payload ? JSON.stringify(event.payload) : null,
        metadata: event.metadata ? JSON.stringify(event.metadata) : null,
        processed: false,
    });
    console.log(`[EventBus] Event emitted: ${event.eventType} from ${event.source}`);
    return eventId;
}
/**
 * Recupera eventi non processati
 */
export async function getPendingEvents(limit = 100) {
    const db = await getDb();
    if (!db)
        return [];
    const events = await db
        .select()
        .from(systemEvents)
        .where(eq(systemEvents.processed, false))
        .limit(limit);
    return events.map(e => ({
        ...e,
        payload: e.payload ? JSON.parse(e.payload) : null,
        metadata: e.metadata ? JSON.parse(e.metadata) : null,
    }));
}
/**
 * Marca un evento come processato
 */
export async function markEventAsProcessed(eventId) {
    const db = await getDb();
    if (!db)
        return;
    await db
        .update(systemEvents)
        .set({
        processed: true,
        processedAt: new Date(),
    })
        .where(eq(systemEvents.eventId, eventId));
}
/**
 * Recupera eventi per tipo
 */
export async function getEventsByType(eventType, limit = 50) {
    const db = await getDb();
    if (!db)
        return [];
    const events = await db
        .select()
        .from(systemEvents)
        .where(eq(systemEvents.eventType, eventType))
        .limit(limit);
    return events.map(e => ({
        ...e,
        payload: e.payload ? JSON.parse(e.payload) : null,
        metadata: e.metadata ? JSON.parse(e.metadata) : null,
    }));
}
/**
 * Recupera eventi per sorgente
 */
export async function getEventsBySource(source, limit = 50) {
    const db = await getDb();
    if (!db)
        return [];
    const events = await db
        .select()
        .from(systemEvents)
        .where(eq(systemEvents.source, source))
        .limit(limit);
    return events.map(e => ({
        ...e,
        payload: e.payload ? JSON.parse(e.payload) : null,
        metadata: e.metadata ? JSON.parse(e.metadata) : null,
    }));
}
