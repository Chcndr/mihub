import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { desc } from 'drizzle-orm';
import { mioAgentLogs } from '../../drizzle/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Parse query parameters
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    console.log('[getLogs] Fetching logs with limit:', limit, 'offset:', offset);

    // Check DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_URL not configured'
      });
    }

    // Create MySQL connection
    const connection = await mysql.createConnection(databaseUrl);
    const db = drizzle(connection);

    // Fetch logs
    const logs = await db
      .select()
      .from(mioAgentLogs)
      .orderBy(desc(mioAgentLogs.timestamp))
      .limit(limit)
      .offset(offset);

    console.log('[getLogs] Found', logs.length, 'logs');

    await connection.end();

    // Parse JSON details field
    const parsedLogs = logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    }));

    return res.status(200).json({
      success: true,
      logs: parsedLogs,
      count: parsedLogs.length
    });
  } catch (error: any) {
    console.error('[getLogs] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch logs',
      stack: error.stack
    });
  }
}
