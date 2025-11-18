import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    return res.status(200).json({
      success: true,
      message: 'MIO Agent API Test Endpoint',
      timestamp: new Date().toISOString(),
      environment: {
        DATABASE_URL_configured: !!databaseUrl,
        DATABASE_URL_preview: databaseUrl ? `${databaseUrl.substring(0, 20)}...` : 'NOT SET',
        NODE_ENV: process.env.NODE_ENV || 'development',
      },
      endpoints: {
        initSchema: '/api/logs/initSchema (POST)',
        createLog: '/api/logs/createLog (POST)',
        getLogs: '/api/logs/getLogs (GET)',
        test: '/api/logs/test (GET/POST)',
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
