/**
 * GIS Router - Integrazione Pepe GIS / Editor v3
 * 
 * Endpoint minimale per servire i dati della mappa mercato
 * generati da Slot Editor v3 in formato GeoJSON.
 */

import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

/**
 * GET /api/gis/market-map
 * 
 * Restituisce i dati della mappa del mercato in formato Editor v3.
 * Per ora legge da file locale (editor-v3-sample.json).
 * 
 * Response format:
 * {
 *   success: true,
 *   data: {
 *     container: [[lat, lng], ...],
 *     center: { lat, lng },
 *     stalls_geojson: { type: "FeatureCollection", features: [...] },
 *     markers_geojson: { type: "FeatureCollection", features: [...] },
 *     areas_geojson: { type: "FeatureCollection", features: [...] }
 *   },
 *   meta: {
 *     endpoint: 'gis.marketMap',
 *     timestamp: ISO string,
 *     source: 'editor-v3-sample.json'
 *   }
 * }
 */
router.get('/market-map', async (req, res) => {
  try {
    // Leggi il file JSON dell'Editor v3
    const dataPath = path.join(__dirname, '../data/editor-v3-sample.json');
    
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({
        success: false,
        error: 'Market map data file not found',
        path: dataPath
      });
    }
    
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const editorData = JSON.parse(rawData);
    
    // Validazione base del formato
    if (!editorData.container || !editorData.center || !editorData.stalls_geojson) {
      return res.status(500).json({
        success: false,
        error: 'Invalid Editor v3 format: missing required fields',
        required: ['container', 'center', 'stalls_geojson']
      });
    }
    
    // Risposta in formato standard
    res.json({
      success: true,
      data: {
        container: editorData.container,
        center: editorData.center,
        stalls_geojson: editorData.stalls_geojson,
        markers_geojson: editorData.markers_geojson || { type: "FeatureCollection", features: [] },
        areas_geojson: editorData.areas_geojson || { type: "FeatureCollection", features: [] },
        gcp: editorData.gcp || [],
        png: editorData.png || { url: "", metadata: {} }
      },
      meta: {
        endpoint: 'gis.marketMap',
        timestamp: new Date().toISOString(),
        source: 'editor-v3-sample.json',
        stalls_count: editorData.stalls_geojson?.features?.length || 0
      }
    });
    
  } catch (error) {
    console.error('[GIS Router] Error in market-map:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      endpoint: 'gis.marketMap'
    });
  }
});

/**
 * GET /api/gis/health
 * 
 * Health check per il modulo GIS
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    module: 'GIS Router',
    version: '1.0.0',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

export default router;
