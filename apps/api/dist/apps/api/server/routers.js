import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { dmsHubRouter } from "./dmsHubRouter";
import { integrationsRouter } from "./integrationsRouter";
import { mioAgentRouter } from "./mioAgentRouter";
import { mihubRouter } from "./mihubRouter";
import { guardianRouter } from "./guardianRouter";
export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
    system: systemRouter,
    auth: router({
        me: publicProcedure.query(opts => opts.ctx.user),
        logout: publicProcedure.mutation(({ ctx }) => {
            const cookieOptions = getSessionCookieOptions(ctx.req);
            ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
            return {
                success: true,
            };
        }),
    }),
    // Dashboard PA Analytics
    analytics: router({
        overview: publicProcedure.query(async () => {
            const { getOverviewStats } = await import("./db");
            return await getOverviewStats();
        }),
        markets: publicProcedure.query(async () => {
            const { getMarkets } = await import("./db");
            return await getMarkets();
        }),
        shops: publicProcedure.query(async () => {
            const { getShops } = await import("./db");
            return await getShops();
        }),
        transactions: publicProcedure.query(async () => {
            const { getTransactions } = await import("./db");
            return await getTransactions();
        }),
        checkins: publicProcedure.query(async () => {
            const { getCheckins } = await import("./db");
            return await getCheckins();
        }),
        products: publicProcedure.query(async () => {
            const { getProducts } = await import("./db");
            return await getProducts();
        }),
        productTracking: publicProcedure.query(async () => {
            const { getProductTracking } = await import("./db");
            return await getProductTracking();
        }),
    }),
    // Carbon Credits Management
    carbonCredits: router({
        config: publicProcedure.query(async () => {
            const { getCarbonCreditsConfig } = await import("./db");
            return await getCarbonCreditsConfig();
        }),
        fundTransactions: publicProcedure.query(async () => {
            const { getFundTransactions } = await import("./db");
            return await getFundTransactions();
        }),
        reimbursements: publicProcedure.query(async () => {
            const { getReimbursements } = await import("./db");
            return await getReimbursements();
        }),
    }),
    // System Logs
    logs: router({
        system: publicProcedure.query(async () => {
            const { getSystemLogs } = await import("./db");
            return await getSystemLogs();
        }),
    }),
    // User Analytics
    users: router({
        analytics: publicProcedure.query(async () => {
            const { getUserAnalytics } = await import("./db");
            return await getUserAnalytics();
        }),
    }),
    // Sustainability Metrics
    sustainability: router({
        metrics: publicProcedure.query(async () => {
            const { getSustainabilityMetrics } = await import("./db");
            return await getSustainabilityMetrics();
        }),
    }),
    // Business Management
    businesses: router({
        list: publicProcedure.query(async () => {
            const { getBusinessAnalytics } = await import("./db");
            return await getBusinessAnalytics();
        }),
    }),
    // Inspections & Violations
    inspections: router({
        list: publicProcedure.query(async () => {
            const { getInspections } = await import("./db");
            return await getInspections();
        }),
    }),
    // Notifications
    notifications: router({
        list: publicProcedure.query(async () => {
            const { getNotifications } = await import("./db");
            return await getNotifications();
        }),
    }),
    // Civic Reports
    civicReports: router({
        list: publicProcedure.query(async () => {
            const { getCivicReports } = await import("./db");
            return await getCivicReports();
        }),
    }),
    // Mobility Data (TPER Bologna)
    mobility: router({
        list: publicProcedure.query(async () => {
            const { getMobilityData } = await import("./db");
            return await getMobilityData();
        }),
    }),
    // DMS HUB - Sistema Gestione Mercati Completo
    dmsHub: dmsHubRouter,
    // Integrazioni - API Keys, Webhook, Monitoring
    integrations: integrationsRouter,
    // MIO Agent - Log e Monitoraggio Agenti
    mioAgent: mioAgentRouter,
    // MIHUB - Multi-Agent System (MIO, Manus, Abacus, Zapier)
    mihub: mihubRouter,
    // API Guardian - Controllo Permessi e Log
    guardian: guardianRouter,
});
