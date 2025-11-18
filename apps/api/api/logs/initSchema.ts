import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('[initSchema] Starting...');
    
    // Check DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('[initSchema] DATABASE_URL not found');
      return res.status(500).json({
        success: false,
        error: 'DATABASE_URL not configured'
      });
    }
    
    console.log('[initSchema] DATABASE_URL found, connecting...');
    
    // Create MySQL connection
    const connection = await mysql.createConnection(databaseUrl);
    const db = drizzle(connection);
    
    console.log('[initSchema] Checking if table exists...');
    
    // Check if table exists
    const [rows] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'mio_agent_logs'
    `);
    
    const tableExists = (rows as any)[0]?.count > 0;
    
    console.log(`[initSchema] Table exists: ${tableExists}`);
    
    if (tableExists) {
      await connection.end();
      return res.status(200).json({
        success: true,
        message: 'Table mio_agent_logs already exists',
        status: 'existing'
      });
    }
    
    console.log('[initSchema] Creating table...');
    
    // Create table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS mio_agent_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent VARCHAR(100) NOT NULL COMMENT 'Nome agente (MIO, Manus, etc.)',
        action VARCHAR(255) NOT NULL COMMENT 'Azione eseguita',
        status ENUM('success', 'error', 'warning', 'info') NOT NULL COMMENT 'Stato operazione',
        message TEXT COMMENT 'Messaggio descrittivo',
        details TEXT COMMENT 'Dettagli aggiuntivi in formato JSON',
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp evento',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data creazione record',
        INDEX idx_agent (agent),
        INDEX idx_status (status),
        INDEX idx_timestamp (timestamp DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log degli agenti AI (MIO, Manus, etc.)'
    `);
    
    console.log('[initSchema] Table created successfully');
    
    await connection.end();
    
    return res.status(200).json({
      success: true,
      message: 'Table mio_agent_logs created successfully',
      status: 'created'
    });
  } catch (error: any) {
    console.error('[initSchema] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to initialize schema',
      stack: error.stack
    });
  }
}
