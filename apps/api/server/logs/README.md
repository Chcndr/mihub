# MIO Agent Logs

Questa cartella contiene i log generati dinamicamente dagli agenti (MIO, Manus, etc.).

## 📝 Formato Log

Ogni log è un file JSON con la seguente struttura:

```json
{
  "timestamp": "2025-11-17T16:30:00.000Z",
  "agent": "MIO",
  "action": "deploy",
  "status": "success",
  "message": "Deploy completato con successo",
  "details": {
    "commit": "d7e933d",
    "branch": "master",
    "duration": "45s"
  }
}
```

## 🔧 Endpoint API

### `mioAgent.createLog` (Mutation)

Crea un nuovo log nella cartella `server/logs/`.

**Input:**
```typescript
{
  agent: string;           // Nome dell'agente (es. "MIO", "Manus")
  action: string;          // Azione eseguita (es. "deploy", "fix_errors")
  status: "success" | "error" | "warning" | "info";
  message?: string;        // Messaggio descrittivo (opzionale)
  details?: Record<string, any>; // Dettagli aggiuntivi (opzionale)
}
```

**Output:**
```typescript
{
  success: true;
  filename: string;        // Nome file generato
  timestamp: string;       // ISO 8601 timestamp
  message: string;         // Messaggio di conferma
}
```

**Esempio d'uso (tRPC):**
```typescript
const result = await trpc.mioAgent.createLog.mutate({
  agent: "MIO",
  action: "deploy",
  status: "success",
  message: "Deploy completato con successo",
  details: {
    commit: "d7e933d",
    branch: "master",
    duration: "45s"
  }
});
```

**Esempio d'uso (curl):**
```bash
curl -X POST https://dms-hub-app-new.vercel.app/api/trpc/mioAgent.createLog \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "MIO",
    "action": "deploy",
    "status": "success",
    "message": "Deploy completato",
    "details": {"commit": "d7e933d"}
  }'
```

### `mioAgent.getLogs` (Query)

Recupera tutti i log dalla cartella `server/logs/`.

**Output:**
```typescript
Array<{
  filename: string;
  timestamp: string;
  content: any;
  size: number;
  modified: string;
}>
```

### `mioAgent.getLogByFilename` (Query)

Recupera un singolo log per nome file.

**Input:** `string` (filename)

**Output:**
```typescript
{
  filename: string;
  timestamp: string;
  content: any;
  size: number;
  modified: string;
}
```

## 🔒 Sicurezza

- I file log sono **ignorati da git** (`.gitignore`)
- Solo file `.json` vengono letti/scritti
- Filename sanitizzato automaticamente (rimuove caratteri speciali)
- Validazione input obbligatoria (agent, action, status)

## 📊 Naming Convention

I file log seguono questo pattern:
```
{agent}-{action}-{timestamp}.json
```

Esempio:
```
mio-deploy-1731859200000.json
manus-fix-errors-1731859300000.json
```

## 🚀 Integrazione con Agenti

### MIO Agent
MIO può creare log automaticamente dopo ogni azione:
- Deploy completati
- Task eseguiti
- Errori riscontrati
- Operazioni di manutenzione

### Manus AI
Manus può tracciare le sue operazioni:
- Fix di bug
- Implementazioni di feature
- Refactoring
- Deploy su Vercel

### Zapier
Zapier può inviare log tramite webhook:
- Eventi esterni
- Integrazioni con servizi terzi
- Notifiche automatiche

## 📈 Monitoraggio

I log sono visualizzabili nella **Dashboard PA** nel tab **"MIO Agent"**:
- Lista completa dei log
- Filtro per agente/status
- Dettaglio JSON completo
- Timestamp e dimensione file
