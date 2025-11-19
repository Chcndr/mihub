import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../server/routers.js';
import { createContext } from '../server/_core/trpc.js';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'mihub-api'
    });
});
// tRPC middleware
app.use('/trpc', createExpressMiddleware({
    router: appRouter,
    createContext,
}));
// Start server
app.listen(PORT, () => {
    console.log(`🚀 MIHUB API Server running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
    console.log(`📍 tRPC: http://localhost:${PORT}/trpc`);
});
export default app;
