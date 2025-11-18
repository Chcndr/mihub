# MIHUB - Multi-Agent Coordination System

**Architettura definitiva e stabile** per il sistema MIHUB con coordinamento multi-agente (MIO, Manus, Abacus, Zapier).

## 🏗️ Architettura

### Livello 1 - Frontend/UI
- **Platform**: Vercel
- **Location**: `apps/frontend/`
- **Tech**: React + Vite + tRPC Client
- **Deploy**: Automatico su push `main`
- **URL**: https://mihub.vercel.app

### Livello 2 - Backend/Core API
- **Platform**: Railway
- **Location**: `apps/api/`
- **Tech**: Node.js + Express + tRPC Server
- **Deploy**: Automatico su push `main`
- **URL**: https://mihub-api.up.railway.app

### Livello 3 - Dati
- **Database**: Neon Postgres (serverless)
- **Cache/Queue**: Upstash Redis (serverless)
- **Storage**: Condiviso tra frontend e backend

---

## 📁 Struttura Monorepo

```
mihub/
├── apps/
│   ├── frontend/          # React UI → Vercel
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── api/               # Node.js Backend → Railway
│       ├── src/
│       │   ├── server.ts
│       │   ├── routers/
│       │   └── db/
│       └── package.json
├── packages/
│   ├── core/              # Shared types, utils
│   └── agents/            # Agent wrappers (MIO, Manus, etc.)
├── infra/
│   ├── docker/            # Dockerfiles
│   └── scripts/           # Migration, seed scripts
└── package.json           # Root workspace config
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Railway CLI
- Vercel CLI

### Install Dependencies
```bash
pnpm install
```

### Development
```bash
# Frontend (localhost:5173)
pnpm dev:frontend

# Backend (localhost:3000)
pnpm dev:api
```

### Build
```bash
pnpm build:frontend
pnpm build:api
```

### Deploy
```bash
# Frontend to Vercel
pnpm deploy:frontend

# Backend to Railway
pnpm deploy:api
```

---

## 🔐 Environment Variables

### Frontend (Vercel)
```
VITE_API_URL=https://mihub-api.up.railway.app
```

### Backend (Railway)
```
DATABASE_URL=postgresql://...@...neon.tech/...
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
PORT=3000
NODE_ENV=production
```

---

## 📊 Multi-Agent System

### Agenti Attivi
1. **MIO** (GPT-5) - Coordinatore principale
2. **Manus** - Operatore esecutivo
3. **Abacus** - Analisi dati e calcoli
4. **Zapier** - Automazioni e integrazioni

### Shared Context
Tutti gli agenti vedono tutte le chat per auto-controllo e coordinamento.

---

## 📝 Documentazione

- [Architecture](./docs/ARCHITECTURE.md)
- [API Documentation](./apps/api/README.md)
- [Frontend Guide](./apps/frontend/README.md)
- [Deployment](./docs/DEPLOYMENT.md)

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TanStack Query, tRPC Client
- **Backend**: Node.js, Express, tRPC Server, Drizzle ORM
- **Database**: Neon Postgres
- **Cache**: Upstash Redis
- **Deploy**: Vercel (frontend), Railway (backend)

---

## 📄 License

Private - All Rights Reserved
