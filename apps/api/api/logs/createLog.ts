import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { mioAgentLogs } from '../../drizzle/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { agent, action, status, message, details } = req.body;

    // Validate required fields
    if (!agent || !action || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: agent, action, status'
      });
    }

    // Validate status enum
    const validStatuses = ['success', 'error', 'warning', 'info'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    console.log('[createLog] Creating log:', { agent, action, status });

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

    // Insert log
    const result = await db.insert(mioAgentLogs).values({
      agent,
      action,
      status,
      message: message || null,
      details: details ? JSON.stringify(details) : null,
      timestamp: new Date(),
    });

    console.log('[createLog] Log created:', result);

    await connection.end();

    return res.status(200).json({
      success: true,
      log: {
        id: result[0].insertId,
        agent,
        action,
        status,
        message,
        details
      }
    });
  } catch (error: any) {
    console.error('[createLog] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create log',
      stack: error.stack
    });
  }
}
