import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import * as schema from "../drizzle/schema";

/**
 * Helper per logging automatico di tutte le operazioni
 */
async function logAction(
  action: string,
  entityType: string,
  entityId: number | null,
  userEmail: string | null,
  oldValue: any = null,
  newValue: any = null,
  ipAddress: string | null = null
) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(schema.auditLogs).values({
      userEmail: userEmail || "system",
      action,
      entityType,
      entityId,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      ipAddress,
    });

    // Log anche in system_logs per visibilità Dashboard
    await db.insert(schema.systemLogs).values({
      app: "DMS_HUB",
      level: "info",
      type: action,
      message: `${action} - ${entityType} #${entityId || "N/A"}`,
      userEmail: userEmail || "system",
      ipAddress,
    });
  } catch (error) {
    console.error("[DMS HUB] Failed to log action:", error);
  }
}

/**
 * Converti formato Slot Editor v3 GeoJSON in formato database
 */
function convertSlotEditorV3Format(data: any) {
  // Se è già nel formato corretto, ritorna così
  if (data.stalls && data.center) {
    return data;
  }

  // Altrimenti converti da GeoJSON v3
  const result: any = {
    container: data.container || [],
    stalls: [],
    customMarkers: [],
    customAreas: [],
    gcp: [],
    png: { url: "", metadata: {} },
  };

  // Calcola centro dal container
  if (data.container && data.container.length > 0) {
    const lats = data.container.map((p: any) => p[0]);
    const lngs = data.container.map((p: any) => p[1]);
    result.center = {
      lat: (Math.max(...lats) + Math.min(...lats)) / 2,
      lng: (Math.max(...lngs) + Math.min(...lngs)) / 2,
    };
  } else {
    result.center = { lat: 0, lng: 0 };
  }

  // Converti posteggi da GeoJSON
  if (data.stalls_geojson?.features) {
    result.stalls = data.stalls_geojson.features.map((f: any) => {
      const props = f.properties || {};
      const coords = f.geometry.coordinates;
      
      // Estrai area da dimensions (es. "4m × 8m")
      let areaMq = null;
      if (props.dimensions) {
        const match = props.dimensions.match(/([\d.]+)m.*?([\d.]+)m/);
        if (match) {
          areaMq = Math.round(parseFloat(match[1]) * parseFloat(match[2]));
        }
      }

      return {
        number: String(props.number || props.id || 0),
        lat: coords[1],
        lng: coords[0],
        areaMq,
        category: props.kind || props.category || null,
      };
    });
  }

  // Converti marker personalizzati
  if (data.markers_geojson?.features) {
    result.customMarkers = data.markers_geojson.features.map((f: any) => {
      const props = f.properties || {};
      const coords = f.geometry.coordinates;
      return {
        name: props.name || props.label || "Marker",
        type: props.type || "marker",
        lat: coords[1],
        lng: coords[0],
        icon: props.icon || null,
        color: props.color || null,
        description: props.description || null,
      };
    });
  }

  // Converti aree custom
  if (data.areas_geojson?.features) {
    result.customAreas = data.areas_geojson.features.map((f: any) => {
      const props = f.properties || {};
      return {
        name: props.name || props.label || "Area",
        type: props.type || "area",
        geojson: f.geometry,
        color: props.color || null,
        opacity: props.opacity || 50,
        description: props.description || null,
      };
    });
  }

  // Preserva metadati pianta
  if (data.plant_rotation || data.plant_scale) {
    result.png.metadata = {
      rotation: data.plant_rotation,
      scale: data.plant_scale,
    };
  }

  return result;
}

/**
 * DMS HUB Router
 * 
 * API centralizzate per gestione completa mercati, posteggi, operatori
 * Integrazione con Slot Editor v3, Gestionale Heroku, Piattaforma DMS, App Polizia
 */

export const dmsHubRouter = router({
  // ============================================
  // MERCATI - Import da Slot Editor v3
  // ============================================
  
  markets: router({
    // Import JSON completo da Slot Editor v3
    importFromSlotEditor: publicProcedure
      .input(z.object({
        marketName: z.string(),
        city: z.string(),
        address: z.string(),
        slotEditorData: z.object({
          container: z.any(),
          center: z.object({ lat: z.number(), lng: z.number() }),
          hubArea: z.any().optional(),
          marketArea: z.any().optional(),
          gcp: z.array(z.any()),
          png: z.object({
            url: z.string(),
            metadata: z.any(),
          }),
          stalls: z.array(z.object({
            number: z.string(),
            lat: z.number(),
            lng: z.number(),
            areaMq: z.number().optional(),
            category: z.string().optional(),
          })),
          customMarkers: z.array(z.object({
            name: z.string(),
            type: z.string(),
            lat: z.number(),
            lng: z.number(),
            icon: z.string().optional(),
            color: z.string().optional(),
            description: z.string().optional(),
          })).optional(),
          customAreas: z.array(z.object({
            name: z.string(),
            type: z.string(),
            geojson: z.any(),
            color: z.string().optional(),
            opacity: z.number().optional(),
            description: z.string().optional(),
          })).optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // 1. Crea o aggiorna mercato
        const [market] = await db.insert(schema.markets).values({
          name: input.marketName,
          address: input.address,
          city: input.city,
          lat: input.slotEditorData.center.lat.toString(),
          lng: input.slotEditorData.center.lng.toString(),
          active: 1,
        }).onDuplicateKeyUpdate({
          set: {
            name: input.marketName,
            address: input.address,
            lat: input.slotEditorData.center.lat.toString(),
            lng: input.slotEditorData.center.lng.toString(),
          },
        });

        const marketId = market.insertId;

        // 2. Salva geometria mercato
        await db.insert(schema.marketGeometry).values({
          marketId: Number(marketId),
          containerGeojson: JSON.stringify(input.slotEditorData.container),
          centerLat: input.slotEditorData.center.lat.toString(),
          centerLng: input.slotEditorData.center.lng.toString(),
          hubAreaGeojson: input.slotEditorData.hubArea ? JSON.stringify(input.slotEditorData.hubArea) : null,
          marketAreaGeojson: input.slotEditorData.marketArea ? JSON.stringify(input.slotEditorData.marketArea) : null,
          gcpData: JSON.stringify(input.slotEditorData.gcp),
          pngUrl: input.slotEditorData.png.url,
          pngMetadata: JSON.stringify(input.slotEditorData.png.metadata),
        }).onDuplicateKeyUpdate({
          set: {
            containerGeojson: JSON.stringify(input.slotEditorData.container),
            pngUrl: input.slotEditorData.png.url,
          },
        });

        // 3. Crea posteggi
        for (const stall of input.slotEditorData.stalls) {
          await db.insert(schema.stalls).values({
            marketId: Number(marketId),
            number: stall.number,
            lat: stall.lat.toString(),
            lng: stall.lng.toString(),
            areaMq: stall.areaMq || null,
            category: stall.category || null,
            status: "free",
          });
        }

        // 4. Crea marker personalizzati
        if (input.slotEditorData.customMarkers) {
          for (const marker of input.slotEditorData.customMarkers) {
            await db.insert(schema.customMarkers).values({
              marketId: Number(marketId),
              name: marker.name,
              type: marker.type,
              lat: marker.lat.toString(),
              lng: marker.lng.toString(),
              icon: marker.icon || null,
              color: marker.color || null,
              description: marker.description || null,
            });
          }
        }

        // 5. Crea aree custom
        if (input.slotEditorData.customAreas) {
          for (const area of input.slotEditorData.customAreas) {
            await db.insert(schema.customAreas).values({
              marketId: Number(marketId),
              name: area.name,
              type: area.type,
              geojson: JSON.stringify(area.geojson),
              color: area.color || null,
              opacity: area.opacity || 50,
              description: area.description || null,
            });
          }
        }

        // Log operazione
        await logAction(
          "IMPORT_SLOT_EDITOR",
          "market",
          Number(marketId),
          null, // TODO: prendere da ctx.user quando disponibile
          null,
          {
            marketName: input.marketName,
            stallsCreated: input.slotEditorData.stalls.length,
            markersCreated: input.slotEditorData.customMarkers?.length || 0,
            areasCreated: input.slotEditorData.customAreas?.length || 0,
          }
        );

        return {
          success: true,
          marketId: Number(marketId),
          stallsCreated: input.slotEditorData.stalls.length,
          markersCreated: input.slotEditorData.customMarkers?.length || 0,
          areasCreated: input.slotEditorData.customAreas?.length || 0,
        };
      }),

    // Import automatico da Slot Editor v3 (senza richiedere nome/città)
    importAuto: publicProcedure
      .input(z.object({
        slotEditorData: z.any(), // JSON grezzo da Slot Editor v3
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Converti formato Slot Editor v3 se necessario
        const convertedData = convertSlotEditorV3Format(input.slotEditorData);

        // Genera nome automatico dal timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const marketName = `Mercato_${timestamp}`;
        const city = "Da specificare";
        const address = "Da specificare";

        // 1. Crea mercato
        const [market] = await db.insert(schema.markets).values({
          name: marketName,
          address,
          city,
          lat: convertedData.center.lat.toString(),
          lng: convertedData.center.lng.toString(),
          active: 1,
        });

        const marketId = market.insertId;

        // 2. Salva geometria
        await db.insert(schema.marketGeometry).values({
          marketId: Number(marketId),
          containerGeojson: JSON.stringify(convertedData.container),
          centerLat: convertedData.center.lat.toString(),
          centerLng: convertedData.center.lng.toString(),
          gcpData: JSON.stringify(convertedData.gcp),
          pngUrl: convertedData.png.url,
          pngMetadata: JSON.stringify(convertedData.png.metadata),
        });

        // 3. Crea posteggi
        for (const stall of convertedData.stalls) {
          await db.insert(schema.stalls).values({
            marketId: Number(marketId),
            number: stall.number,
            lat: stall.lat.toString(),
            lng: stall.lng.toString(),
            areaMq: stall.areaMq || null,
            category: stall.category || null,
            status: "free",
          });
        }

        // 4. Marker personalizzati
        if (convertedData.customMarkers) {
          for (const marker of convertedData.customMarkers) {
            await db.insert(schema.customMarkers).values({
              marketId: Number(marketId),
              name: marker.name,
              type: marker.type,
              lat: marker.lat.toString(),
              lng: marker.lng.toString(),
              icon: marker.icon || null,
              color: marker.color || null,
              description: marker.description || null,
            });
          }
        }

        // 5. Aree custom
        if (convertedData.customAreas) {
          for (const area of convertedData.customAreas) {
            await db.insert(schema.customAreas).values({
              marketId: Number(marketId),
              name: area.name,
              type: area.type,
              geojson: JSON.stringify(area.geojson),
              color: area.color || null,
              opacity: area.opacity || 50,
              description: area.description || null,
            });
          }
        }

        await logAction(
          "AUTO_IMPORT_SLOT_EDITOR",
          "market",
          Number(marketId),
          null,
          null,
          {
            marketName,
            stallsCreated: convertedData.stalls.length,
            markersCreated: convertedData.customMarkers?.length || 0,
            areasCreated: convertedData.customAreas?.length || 0,
          }
        );

        return {
          success: true,
          marketId: Number(marketId),
          marketName,
          stallsCreated: convertedData.stalls.length,
          markersCreated: convertedData.customMarkers?.length || 0,
          areasCreated: convertedData.customAreas?.length || 0,
        };
      }),

    // Lista tutti i mercati
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      
      const markets = await db.select().from(schema.markets).where(eq(schema.markets.active, 1));
      
      // Per ogni mercato, conta i posteggi
      const marketsWithStats = await Promise.all(markets.map(async (market) => {
        const [stallsCount] = await db.select({ count: sql<number>`count(*)` })
          .from(schema.stalls)
          .where(eq(schema.stalls.marketId, market.id));
        
        const [occupiedCount] = await db.select({ count: sql<number>`count(*)` })
          .from(schema.stalls)
          .where(and(
            eq(schema.stalls.marketId, market.id),
            eq(schema.stalls.status, "occupied")
          ));

        return {
          ...market,
          totalStalls: Number(stallsCount.count) || 0,
          occupiedStalls: Number(occupiedCount.count) || 0,
          freeStalls: (Number(stallsCount.count) || 0) - (Number(occupiedCount.count) || 0),
        };
      }));

      return marketsWithStats;
    }),

    // Dettagli mercato con geometria
    getById: publicProcedure
      .input(z.object({ marketId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;

        const [market] = await db.select().from(schema.markets)
          .where(eq(schema.markets.id, input.marketId));
        
        if (!market) return null;

        const [geometry] = await db.select().from(schema.marketGeometry)
          .where(eq(schema.marketGeometry.marketId, input.marketId));

        const stalls = await db.select().from(schema.stalls)
          .where(eq(schema.stalls.marketId, input.marketId));

        const markers = await db.select().from(schema.customMarkers)
          .where(eq(schema.customMarkers.marketId, input.marketId));

        const areas = await db.select().from(schema.customAreas)
          .where(eq(schema.customAreas.marketId, input.marketId));

        return {
          market,
          geometry: geometry ? {
            ...geometry,
            containerGeojson: geometry.containerGeojson ? JSON.parse(geometry.containerGeojson) : null,
            hubAreaGeojson: geometry.hubAreaGeojson ? JSON.parse(geometry.hubAreaGeojson) : null,
            marketAreaGeojson: geometry.marketAreaGeojson ? JSON.parse(geometry.marketAreaGeojson) : null,
            gcpData: geometry.gcpData ? JSON.parse(geometry.gcpData) : null,
            pngMetadata: geometry.pngMetadata ? JSON.parse(geometry.pngMetadata) : null,
          } : null,
          stalls,
          markers,
          areas: areas.map(a => ({
            ...a,
            geojson: a.geojson ? JSON.parse(a.geojson) : null,
          })),
        };
      }),
  }),

  // ============================================
  // POSTEGGI - Gestione e stati
  // ============================================
  
  stalls: router({
    // Lista posteggi per mercato
    listByMarket: publicProcedure
      .input(z.object({ marketId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        return await db.select().from(schema.stalls)
          .where(eq(schema.stalls.marketId, input.marketId));
      }),

    // Aggiorna stato posteggio
    updateStatus: publicProcedure
      .input(z.object({
        stallId: z.number(),
        status: z.enum(["free", "reserved", "occupied", "booked", "maintenance"]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Ottieni valore vecchio per log
        const [oldStall] = await db.select().from(schema.stalls)
          .where(eq(schema.stalls.id, input.stallId));

        await db.update(schema.stalls)
          .set({ status: input.status })
          .where(eq(schema.stalls.id, input.stallId));

        // Log operazione
        await logAction(
          "UPDATE_STALL_STATUS",
          "stall",
          input.stallId,
          null,
          { status: oldStall?.status },
          { status: input.status }
        );

        return { success: true };
      }),

    // Stati real-time tutti i posteggi di un mercato
    getStatuses: publicProcedure
      .input(z.object({ marketId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        const stalls = await db.select({
          id: schema.stalls.id,
          number: schema.stalls.number,
          status: schema.stalls.status,
          lat: schema.stalls.lat,
          lng: schema.stalls.lng,
        }).from(schema.stalls)
          .where(eq(schema.stalls.marketId, input.marketId));

        return stalls;
      }),
  }),

  // ============================================
  // OPERATORI - Anagrafica e gestione
  // ============================================
  
  vendors: router({
    // Lista tutti gli operatori
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];

      return await db.select().from(schema.vendors)
        .orderBy(desc(schema.vendors.createdAt));
    }),

    // Crea nuovo operatore
    create: publicProcedure
      .input(z.object({
        firstName: z.string(),
        lastName: z.string(),
        fiscalCode: z.string().optional(),
        vatNumber: z.string().optional(),
        businessName: z.string().optional(),
        businessType: z.string().optional(),
        atecoCode: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        bankAccount: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const [result] = await db.insert(schema.vendors).values({
          ...input,
          status: "active",
        });

        const vendorId = Number(result.insertId);

        // Log operazione
        await logAction(
          "CREATE_VENDOR",
          "vendor",
          vendorId,
          null,
          null,
          { ...input, status: "active" }
        );

        return { success: true, vendorId };
      }),

    // Aggiorna operatore
    update: publicProcedure
      .input(z.object({
        vendorId: z.number(),
        data: z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          fiscalCode: z.string().optional(),
          vatNumber: z.string().optional(),
          businessName: z.string().optional(),
          businessType: z.string().optional(),
          atecoCode: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().email().optional(),
          address: z.string().optional(),
          bankAccount: z.string().optional(),
          status: z.enum(["active", "suspended", "inactive"]).optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Ottieni valore vecchio per log
        const [oldVendor] = await db.select().from(schema.vendors)
          .where(eq(schema.vendors.id, input.vendorId));

        await db.update(schema.vendors)
          .set(input.data)
          .where(eq(schema.vendors.id, input.vendorId));

        // Log operazione
        await logAction(
          "UPDATE_VENDOR",
          "vendor",
          input.vendorId,
          null,
          oldVendor,
          input.data
        );

        return { success: true };
      }),

    // Dettagli operatore completi (per App Polizia)
    getFullDetails: publicProcedure
      .input(z.object({ vendorId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;

        const [vendor] = await db.select().from(schema.vendors)
          .where(eq(schema.vendors.id, input.vendorId));

        if (!vendor) return null;

        // Documenti
        const documents = await db.select().from(schema.vendorDocuments)
          .where(eq(schema.vendorDocuments.vendorId, input.vendorId));

        // Concessioni
        const concessions = await db.select().from(schema.concessions)
          .where(eq(schema.concessions.vendorId, input.vendorId))
          .orderBy(desc(schema.concessions.createdAt));

        // Presenze ultimo mese
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const presences = await db.select().from(schema.vendorPresences)
          .where(and(
            eq(schema.vendorPresences.vendorId, input.vendorId),
            sql`${schema.vendorPresences.checkinTime} >= ${thirtyDaysAgo}`
          ))
          .orderBy(desc(schema.vendorPresences.checkinTime));

        // Verbali
        const violations = await db.select().from(schema.violations)
          .where(eq(schema.violations.vendorId, input.vendorId))
          .orderBy(desc(schema.violations.createdAt));

        return {
          vendor,
          documents,
          concessions,
          presences,
          violations,
          stats: {
            totalPresences: presences.length,
            totalViolations: violations.length,
            activeConcessions: concessions.filter(c => c.status === "active").length,
          },
        };
      }),
  }),

  // ============================================
  // PRENOTAZIONI - Sistema booking posteggi
  // ============================================
  
  bookings: router({
    // Crea prenotazione
    create: publicProcedure
      .input(z.object({
        stallId: z.number(),
        userId: z.number().optional(),
        vendorId: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verifica che posteggio sia libero
        const [stall] = await db.select().from(schema.stalls)
          .where(eq(schema.stalls.id, input.stallId));

        if (!stall || stall.status !== "free") {
          throw new Error("Posteggio non disponibile");
        }

        // Crea prenotazione con scadenza 30 minuti
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

        const [result] = await db.insert(schema.bookings).values({
          stallId: input.stallId,
          userId: input.userId || null,
          vendorId: input.vendorId || null,
          status: "pending",
          bookingDate: now,
          expiresAt,
          notes: input.notes || null,
        });

        // Aggiorna stato posteggio
        await db.update(schema.stalls)
          .set({ status: "booked" })
          .where(eq(schema.stalls.id, input.stallId));

        const bookingId = Number(result.insertId);

        // Log operazione
        await logAction(
          "CREATE_BOOKING",
          "booking",
          bookingId,
          null,
          null,
          { stallId: input.stallId, userId: input.userId, vendorId: input.vendorId, expiresAt }
        );

        return {
          success: true,
          bookingId,
          expiresAt,
        };
      }),

    // Lista prenotazioni attive
    listActive: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];

      return await db.select().from(schema.bookings)
        .where(eq(schema.bookings.status, "pending"))
        .orderBy(desc(schema.bookings.createdAt));
    }),

    // Conferma check-in
    confirmCheckin: publicProcedure
      .input(z.object({
        bookingId: z.number(),
        vendorId: z.number(),
        lat: z.string().optional(),
        lng: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const now = new Date();

        // Aggiorna booking
        await db.update(schema.bookings)
          .set({
            status: "confirmed",
            checkedInAt: now,
          })
          .where(eq(schema.bookings.id, input.bookingId));

        // Ottieni info booking
        const [booking] = await db.select().from(schema.bookings)
          .where(eq(schema.bookings.id, input.bookingId));

        if (!booking) throw new Error("Booking not found");

        // Crea presenza
        await db.insert(schema.vendorPresences).values({
          vendorId: input.vendorId,
          stallId: booking.stallId,
          bookingId: input.bookingId,
          checkinTime: now,
          lat: input.lat || null,
          lng: input.lng || null,
        });

        // Aggiorna stato posteggio
        await db.update(schema.stalls)
          .set({ status: "occupied" })
          .where(eq(schema.stalls.id, booking.stallId));

        // Log operazione
        await logAction(
          "CONFIRM_CHECKIN",
          "booking",
          input.bookingId,
          null,
          { status: "pending" },
          { status: "confirmed", vendorId: input.vendorId }
        );

        return { success: true };
      }),

    // Cancella prenotazione
    cancel: publicProcedure
      .input(z.object({ bookingId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const [booking] = await db.select().from(schema.bookings)
          .where(eq(schema.bookings.id, input.bookingId));

        if (!booking) throw new Error("Booking not found");

        // Aggiorna booking
        await db.update(schema.bookings)
          .set({ status: "cancelled" })
          .where(eq(schema.bookings.id, input.bookingId));

        // Libera posteggio
        await db.update(schema.stalls)
          .set({ status: "free" })
          .where(eq(schema.stalls.id, booking.stallId));

        // Log operazione
        await logAction(
          "CANCEL_BOOKING",
          "booking",
          input.bookingId,
          null,
          { status: booking.status },
          { status: "cancelled" }
        );

        return { success: true };
      }),
  }),

  // ============================================
  // PRESENZE - Check-in/Check-out
  // ============================================
  
  presences: router({
    // Check-out operatore
    checkout: publicProcedure
      .input(z.object({
        presenceId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const now = new Date();

        // Ottieni presenza
        const [presence] = await db.select().from(schema.vendorPresences)
          .where(eq(schema.vendorPresences.id, input.presenceId));

        if (!presence) throw new Error("Presence not found");

        // Calcola durata in minuti
        const duration = Math.floor((now.getTime() - new Date(presence.checkinTime).getTime()) / 60000);

        // Aggiorna presenza
        await db.update(schema.vendorPresences)
          .set({
            checkoutTime: now,
            duration,
            notes: input.notes || presence.notes,
          })
          .where(eq(schema.vendorPresences.id, input.presenceId));

        // Libera posteggio
        await db.update(schema.stalls)
          .set({ status: "free" })
          .where(eq(schema.stalls.id, presence.stallId));

        // Log operazione
        await logAction(
          "CHECKOUT_VENDOR",
          "presence",
          input.presenceId,
          null,
          { checkoutTime: null },
          { checkoutTime: now, duration }
        );

        return { success: true, duration };
      }),

    // Presenze oggi per mercato
    getTodayByMarket: publicProcedure
      .input(z.object({ marketId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const presences = await db.select({
          presence: schema.vendorPresences,
          vendor: schema.vendors,
          stall: schema.stalls,
        })
          .from(schema.vendorPresences)
          .innerJoin(schema.vendors, eq(schema.vendorPresences.vendorId, schema.vendors.id))
          .innerJoin(schema.stalls, eq(schema.vendorPresences.stallId, schema.stalls.id))
          .where(and(
            eq(schema.stalls.marketId, input.marketId),
            sql`${schema.vendorPresences.checkinTime} >= ${today}`
          ))
          .orderBy(desc(schema.vendorPresences.checkinTime));

        return presences;
      }),
  }),

  // ============================================
  // CONTROLLI E VERBALI - Per App Polizia
  // ============================================
  
  inspections: router({
    // Crea controllo
    create: publicProcedure
      .input(z.object({
        vendorId: z.number(),
        stallId: z.number().optional(),
        inspectorName: z.string(),
        inspectorBadge: z.string().optional(),
        type: z.enum(["routine", "complaint", "random", "targeted"]),
        checklist: z.any().optional(),
        photosUrls: z.array(z.string()).optional(),
        gpsLat: z.string().optional(),
        gpsLng: z.string().optional(),
        result: z.enum(["compliant", "violation", "warning"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const [result] = await db.insert(schema.inspectionsDetailed).values({
          vendorId: input.vendorId,
          stallId: input.stallId || null,
          inspectorName: input.inspectorName,
          inspectorBadge: input.inspectorBadge || null,
          type: input.type,
          checklist: input.checklist ? JSON.stringify(input.checklist) : null,
          photosUrls: input.photosUrls ? JSON.stringify(input.photosUrls) : null,
          gpsLat: input.gpsLat || null,
          gpsLng: input.gpsLng || null,
          result: input.result,
          notes: input.notes || null,
        });

        const inspectionId = Number(result.insertId);

        // Log operazione
        await logAction(
          "CREATE_INSPECTION",
          "inspection",
          inspectionId,
          input.inspectorName,
          null,
          { vendorId: input.vendorId, result: input.result, type: input.type }
        );

        return { success: true, inspectionId };
      }),

    // Lista controlli
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];

      return await db.select().from(schema.inspectionsDetailed)
        .orderBy(desc(schema.inspectionsDetailed.createdAt));
    }),
  }),

  violations: router({
    // Crea verbale
    create: publicProcedure
      .input(z.object({
        inspectionId: z.number().optional(),
        vendorId: z.number(),
        stallId: z.number().optional(),
        violationType: z.string(),
        violationCode: z.string().optional(),
        description: z.string(),
        fineAmount: z.number().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const [result] = await db.insert(schema.violations).values({
          inspectionId: input.inspectionId || null,
          vendorId: input.vendorId,
          stallId: input.stallId || null,
          violationType: input.violationType,
          violationCode: input.violationCode || null,
          description: input.description,
          fineAmount: input.fineAmount || null,
          status: "issued",
          dueDate: input.dueDate || null,
        });

        const violationId = Number(result.insertId);

        // Log operazione
        await logAction(
          "CREATE_VIOLATION",
          "violation",
          violationId,
          null,
          null,
          { vendorId: input.vendorId, violationType: input.violationType, fineAmount: input.fineAmount }
        );

        return { success: true, violationId };
      }),

    // Lista verbali
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];

      return await db.select().from(schema.violations)
        .orderBy(desc(schema.violations.createdAt));
    }),
  }),
});

export type DmsHubRouter = typeof dmsHubRouter;
