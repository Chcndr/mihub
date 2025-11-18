# MIHUB Backend API

Backend Node.js per il sistema MIHUB Multi-Agent Coordination.

## 🚀 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express
- **API**: tRPC
- **Database**: Drizzle ORM + Neon Postgres
- **Cache**: Upstash Redis
- **Deploy**: Railway

---

## 📁 Struttura

```
api/
├── src/
│   └── server.ts          # Entry point Railway
├── server/
│   ├── _core/             # tRPC config, context
│   ├── routers.ts         # Router principale
│   ├── db.ts              # Database functions
│   ├── eventBus.ts        # Event system
│   └── mihubRouter.ts     # MIHUB multi-agent API
├── drizzle/
│   └── schema.ts          # Database schema (47 tabelle)
└── package.json
```

---

## 🛠️ Development

### Install
```bash
pnpm install
```

### Environment Variables
```bash
cp .env.example .env
# Edit .env with your credentials
```

### Run Dev Server
```bash
pnpm dev
```

Server runs on `http://localhost:3000`

### Build
```bash
pnpm build
```

### Start Production
```bash
pnpm start
```

---

## 🗄️ Database

### Push Schema
```bash
pnpm db:push
```

### Generate Migration
```bash
pnpm db:generate
```

### Run Migration
```bash
pnpm db:migrate
```

### Studio (GUI)
```bash
pnpm db:studio
```

---

## 🚂 Deploy to Railway

### Prerequisites
- Railway CLI installed
- Railway account linked

### Deploy
```bash
railway up
```

### Environment Variables (Railway)
```
DATABASE_URL=postgresql://...@...neon.tech/...
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://mihub.vercel.app
```

---

## 📡 API Endpoints

### Health Check
```
GET /health
```

### tRPC
```
POST /trpc/<procedure>
```

### Available Routers
- `mihub.*` - Multi-agent coordination
- `mioAgent.*` - MIO Agent operations
- `analytics.*` - Analytics data
- `carbonCredits.*` - Carbon credits
- `dmsHub.*` - DMS Hub operations
- `integrations.*` - External integrations

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment | No (default: development) |
| `DATABASE_URL` | Neon Postgres connection | Yes |
| `UPSTASH_REDIS_REST_URL` | Redis URL | Yes |
| `UPSTASH_REDIS_REST_TOKEN` | Redis token | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | No |

---

## 📊 Database Schema

47 tabelle totali:
- 40 tabelle esistenti (markets, shops, analytics, ecc.)
- 7 tabelle MIHUB (agent_tasks, agent_messages, system_events, ecc.)

---

## 🧪 Testing

```bash
pnpm test
```

---

## 📝 License

Private - All Rights Reserved
