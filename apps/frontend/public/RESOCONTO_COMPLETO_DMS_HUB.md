# 📋 RESOCONTO COMPLETO ECOSISTEMA DMS HUB

**Data**: 9 Novembre 2025  
**Progetto**: Digital Market System - Gemello Digitale del Commercio Nazionale  
**Versione**: 1.0 - Sistema Completo Integrato

---

## 🎯 VISIONE GENERALE

Il **DMS HUB** è un ecosistema completo per la digitalizzazione e gestione dei mercati e del commercio locale sostenibile in Italia. Il sistema integra:

- 🌍 **Sito Pubblico** - Homepage nazionale con musica ambient e animazioni
- 👥 **App Cittadini** - Mappa mercati, wallet TCC, route planner, vetrine, civic reporting
- 🏪 **Hub Operatore** - Dashboard per commercianti e ambulanti
- 📊 **Dashboard Admin** - Centro controllo completo con 22 sezioni analytics
- 🚌 **BUS HUB** - Tool editor per configurazione mercati
- 🗺️ **Core Map** - Mappa GIS operativa (Grosseto)
- 📰 **DMS News** - Piattaforma notizie
- 🚀 **Gestionale DMS** - Piattaforma Heroku per concessioni

---

## 🏗️ ARCHITETTURA SISTEMA

### **Stack Tecnologico**

#### Frontend
- **React 19** - UI framework
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library
- **Wouter** - Routing
- **Leaflet** - Mappe interattive
- **Turf.js** - Operazioni geospaziali
- **Web Audio API** - Musica generativa

#### Backend
- **Node.js 22** - Runtime
- **tRPC** - Type-safe API
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Autenticazione
- **S3** - Storage file

#### DevOps
- **GitHub Pages** - Hosting static
- **Manus.space** - Hosting full-stack
- **Heroku** - Gestionale legacy
- **Vercel** - Deployment futuro

---

## 📱 APPLICAZIONI WEB

### 1. 🌍 **SITO PUBBLICO DMS HUB**
**URL**: `https://chcndr.github.io/dms-gemello-core/`

**Descrizione**: Homepage nazionale del Gemello Digitale del Commercio

**Features**:
- 🎵 Musica ambient generativa (Web Audio API)
- ✨ Animazioni fluide e particelle background
- 📊 Counter animati statistiche real-time
- 🎯 3 sezioni target:
  - 👥 **Cittadini** → link a App Cittadini
  - 🏪 **Commercianti** → link a Hub Operatore
  - 🏛️ **PA/Admin** → link a Dashboard PA
- 🌈 Glassmorphism design
- 📱 Mobile-first responsive
- 🎨 Gradients e glow effects

**Tecnologie**: HTML5, CSS3, JavaScript vanilla, Web Audio API

---

### 2. 👥 **APP CITTADINI**
**URL**: `https://dmshubapp-hkvujnro.manus.space/`

**Descrizione**: Applicazione per cittadini per shopping sostenibile

**Features**:
- 🗺️ **Mappa Mercati** - Visualizza mercati e negozi sostenibili
- 💰 **Wallet TCC** - Gestione Toscana Carbon Credits
- 🛣️ **Route Planner** - Percorsi ottimizzati shopping eco-friendly
- 🏪 **Vetrine Digitali** - Catalogo prodotti locali
- 🏛️ **Civic Reporting** - Segnalazioni cittadine
- 🌍 **Pulsante Ecosistema** - Link al Sito Pubblico

**Database**: PostgreSQL con tabelle users, transactions, civic_reports

**API**: tRPC endpoints per mappe, wallet, route, vetrine

---

### 3. 🏪 **HUB OPERATORE**
**URL**: `https://dmshubapp-hkvujnro.manus.space/hub-operatore`

**Descrizione**: Dashboard per commercianti e ambulanti

**Features**:
- ⏰ **Check-in/Check-out** - Presenza giornaliera
- 📊 **Dashboard Vendite** - Analytics real-time
- 💰 **TCC Guadagnati** - Crediti carbonio accumulati
- 📦 **Gestione Prodotti** - Catalogo e inventario
- 🎯 **Gestione Posteggio** - Stato e prenotazioni
- 🌍 **Pulsante Ecosistema** - Link al Sito Pubblico

**Integrazione**: Collegato a Gestionale Heroku per concessioni

---

### 4. 📊 **DASHBOARD ADMIN PA** (Centro Controllo)
**URL**: `https://dmshubapp-hkvujnro.manus.space/dashboard-pa`

**Descrizione**: Dashboard completa per amministratori con 22 sezioni

**22 Sezioni**:

#### Analytics (8 sezioni)
1. **Overview** - KPI generali e crescita
2. **Clienti** - Analytics utenti
3. **Mercati** - Statistiche mercati attivi
4. **Prodotti** - Categorie e certificazioni
5. **Sostenibilità** - Metriche eco e CO₂
6. **TPAS** - Third Party Application Services
7. **Carbon Credits** - Sistema TCC completo
8. **Real-time** - Dati live

#### Gestione (7 sezioni)
9. **Log Sistema** - Audit logs e system logs
10. **Notifiche** - Sistema notifiche push
11. **Segnalazioni** - Civic reports
12. **Controlli** - Ispezioni Polizia
13. **Imprese** - Anagrafica attività
14. **Utenti** - Gestione utenti
15. **Centro Mobilità** - Mappa TPER Bologna

#### Strumenti (7 sezioni)
16. **Chat AI** - Assistente intelligente
17. **Report** - Export dati
18. **Integrazioni** - API esterne
19. **Impostazioni** - Configurazione
20. **Debug** - Console sviluppatore
21. **Documentazione** - Guide uso
22. **🆕 Gestione Mercati** - Sistema DMS HUB completo

**Quick Access Bar** (12 pulsanti):
- Home, Mappa, Wallet, Route, Segnala, Vetrine, Hub Operatore
- 🔧 BUS HUB (viola)
- 🗺️ Core Map (arancione)
- 🌍 Sito Pubblico (verde)
- 📰 DMS News (blu)
- 🚀 Gestionale DMS (rosso)

---

### 5. 🚌 **BUS HUB** (Business Unit Setup HUB)
**URL**: `https://chcndr.github.io/dms-gemello-core/tools/bus_hub.html`

**Descrizione**: Centro controllo workflow per configurazione mercati

**Features**:
- 🔄 **Workflow 2 Step**:
  1. **PNG Transparent Tool** - Rimozione sfondo pianta
  2. **Slot Editor v3 Unified** - Editor completo
- 💾 **Banca Mappe** - Salva/carica configurazioni
  - Salva configurazione con nome
  - Lista configurazioni con statistiche
  - Carica, Esporta JSON, Elimina
  - Importa da file JSON
- 📊 **Dashboard Stato** - Progress workflow
- 🗺️ **Preview Mappa** - Anteprima 500px
- 🔗 **Collegamenti**:
  - 🌍 Sito Pubblico
  - 🗺️ Core Map Grosseto
  - 📊 Dashboard Admin

**Storage**: localStorage browser per configurazioni temporanee

---

### 6. 🗺️ **CORE MAP GROSSETO**
**URL**: `https://chcndr.github.io/dms-gemello-core/index-grosseto.html`

**Descrizione**: Mappa GIS operativa mercato Grosseto

**Features**:
- 🗺️ Mappa Leaflet con layer mercato
- 📍 Posteggi numerati interattivi
- 🎨 Aree mercato colorate
- 🔍 Ricerca indirizzo
- 📊 Layer toggle (Aree, Posteggi, Italia)
- 🔗 **Ecosistema DMS** (4 link):
  - 🌍 Sito Pubblico
  - 📊 Dashboard Admin
  - 🚌 BUS HUB
  - 🗺️ Mappa Pubblica

**Uso**: Tool operativo per visualizzazione mercato configurato

---

### 7. 📰 **DMS NEWS**
**URL**: `https://chcndr.github.io/dms-gemello-news/landing/home.html`

**Descrizione**: Piattaforma notizie DMS

**Features**: News e aggiornamenti sistema

---

### 8. 🚀 **GESTIONALE DMS** (Heroku)
**URL**: `https://lapsy-dms.herokuapp.com/index.html`

**Descrizione**: Piattaforma legacy gestione concessioni

**Features**:
- 📜 Gestione concessioni ambulanti
- 💰 Pagamenti e scadenze
- 📄 Documenti e permessi
- 👥 Anagrafica operatori

**Integrazione Futura**: API bridge con DMS HUB per sincronizzazione bidirezionale

---

## 🔧 TOOL EDITOR

### **PNG Transparent Tool**
**URL**: `https://chcndr.github.io/dms-gemello-core/tools/stalls_alpha_tool.html`

**Funzione**: Rimozione sfondo da pianta mercato

**Workflow**:
1. Upload immagine pianta
2. Rimozione automatica sfondo
3. Preview risultato
4. Salva nel BUS
5. → Vai a Slot Editor v3

---

### **Slot Editor v3 Unified**
**URL**: `https://chcndr.github.io/dms-gemello-core/tools/slot_editor_v3_unified.html`

**Funzione**: Editor completo mercati

**Features**:
- 📍 **Georeferenziazione** - 4 GCP per allineamento
- 🏪 **Container Mercato** - Definizione area totale
- 🅿️ **Posteggi** - Creazione rettangoli numerati
- 📌 **Marker Personalizzati** - POI custom
- 🗺️ **Aree Custom** - Zone speciali
- 💾 **Export JSON** - Formato completo per import
- 📤 **Invia a Dashboard Admin** - Import diretto

**Output JSON**:
```json
{
  "container": { "type": "Polygon", "coordinates": [...] },
  "centerMarket": { "lat": 42.xxx, "lng": 11.xxx },
  "areaMarket": { "type": "Polygon", "coordinates": [...] },
  "areaHub": { "type": "Polygon", "coordinates": [...] },
  "stalls": [
    {
      "number": 1,
      "lat": 42.xxx,
      "lng": 11.xxx,
      "category": "Alimentari",
      "areaMq": 12.5
    }
  ],
  "customMarkers": [...],
  "customAreas": [...]
}
```

---

## 💾 SISTEMA DMS HUB (NUOVO!)

### **Database Schema** (13 Tabelle)

#### **Mercati e Geometria**
```sql
-- Geometria mercati da Slot Editor v3
CREATE TABLE market_geometry (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT,
  container_geojson JSON NOT NULL,
  center_lat DECIMAL(10, 8),
  center_lng DECIMAL(11, 8),
  area_market_geojson JSON,
  area_hub_geojson JSON,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Posteggi
CREATE TABLE stalls (
  id SERIAL PRIMARY KEY,
  market_id INTEGER REFERENCES market_geometry(id),
  number INTEGER NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  category VARCHAR(100),
  area_mq DECIMAL(6, 2),
  status VARCHAR(50) DEFAULT 'free',
  -- free, occupied, booked, reserved, maintenance
  created_at TIMESTAMP DEFAULT NOW()
);

-- Marker personalizzati
CREATE TABLE custom_markers (
  id SERIAL PRIMARY KEY,
  market_id INTEGER REFERENCES market_geometry(id),
  name VARCHAR(255),
  type VARCHAR(100),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  description TEXT,
  icon_url TEXT
);

-- Aree custom
CREATE TABLE custom_areas (
  id SERIAL PRIMARY KEY,
  market_id INTEGER REFERENCES market_geometry(id),
  name VARCHAR(255),
  geojson JSON NOT NULL,
  color VARCHAR(20),
  description TEXT
);
```

#### **Operatori e Concessioni**
```sql
-- Operatori/Ambulanti
CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  fiscal_code VARCHAR(16) UNIQUE,
  vat_number VARCHAR(11),
  email VARCHAR(255),
  phone VARCHAR(20),
  business_name VARCHAR(255),
  business_type VARCHAR(100),
  ateco_code VARCHAR(10),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(2),
  postal_code VARCHAR(5),
  bank_iban VARCHAR(34),
  bank_account VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  -- active, suspended, inactive
  created_at TIMESTAMP DEFAULT NOW()
);

-- Concessioni (chi ha diritto permanente a quale posteggio)
CREATE TABLE concessions (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  stall_id INTEGER REFERENCES stalls(id),
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  -- active, expired, suspended, revoked
  annual_fee DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documenti operatori
CREATE TABLE vendor_documents (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  document_type VARCHAR(100) NOT NULL,
  -- license, health_cert, insurance, tax_clearance
  document_number VARCHAR(100),
  issue_date DATE,
  expiry_date DATE,
  file_url TEXT,
  status VARCHAR(50) DEFAULT 'valid',
  -- valid, expired, pending_renewal
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **Prenotazioni e Presenze**
```sql
-- Prenotazioni posteggi
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  stall_id INTEGER REFERENCES stalls(id),
  user_id INTEGER,
  vendor_id INTEGER REFERENCES vendors(id),
  booking_time TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  -- pending, confirmed, cancelled, expired
  notes TEXT
);

-- Presenze giornaliere (check-in/check-out)
CREATE TABLE vendor_presences (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  stall_id INTEGER REFERENCES stalls(id),
  date DATE NOT NULL,
  checkin_time TIMESTAMP,
  checkout_time TIMESTAMP,
  is_substitute BOOLEAN DEFAULT false,
  -- true se è uno spuntista
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **Controlli e Verbali**
```sql
-- Controlli Polizia Municipale
CREATE TABLE inspections_detailed (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  stall_id INTEGER REFERENCES stalls(id),
  inspector_name VARCHAR(255) NOT NULL,
  inspector_badge VARCHAR(50),
  inspection_date TIMESTAMP DEFAULT NOW(),
  type VARCHAR(100) NOT NULL,
  -- routine, complaint, random, targeted
  checklist JSON,
  -- { hygiene: true, permits: true, products: false }
  photos_urls JSON,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  result VARCHAR(50) NOT NULL,
  -- passed, failed, warning
  notes TEXT
);

-- Verbali/Sanzioni
CREATE TABLE violations (
  id SERIAL PRIMARY KEY,
  inspection_id INTEGER REFERENCES inspections_detailed(id),
  vendor_id INTEGER REFERENCES vendors(id),
  stall_id INTEGER REFERENCES stalls(id),
  violation_date TIMESTAMP DEFAULT NOW(),
  violation_type VARCHAR(100) NOT NULL,
  -- hygiene, permits, products, behavior, other
  violation_code VARCHAR(50),
  description TEXT NOT NULL,
  fine_amount DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'issued',
  -- issued, paid, appealed, cancelled
  due_date DATE,
  paid_date DATE
);
```

#### **Pagamenti**
```sql
-- Pagamenti concessioni
CREATE TABLE concession_payments (
  id SERIAL PRIMARY KEY,
  concession_id INTEGER REFERENCES concessions(id),
  vendor_id INTEGER REFERENCES vendors(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50),
  -- bank_transfer, cash, card, check
  reference_number VARCHAR(100),
  status VARCHAR(50) DEFAULT 'completed',
  -- pending, completed, failed, refunded
  notes TEXT
);
```

---

### **API Backend** (25+ Endpoint)

#### **Router: dmsHub.markets**
```typescript
// Import JSON da Slot Editor v3
dmsHub.markets.importFromSlotEditor({
  marketName: string,
  city: string,
  address: string,
  slotEditorData: JSON
}) → { success, marketId, stallsCreated, markersCreated, areasCreated }

// Lista mercati con statistiche
dmsHub.markets.list()
→ [{ id, name, city, totalStalls, occupiedStalls, freeStalls, active }]

// Dettagli mercato completo
dmsHub.markets.getById({ marketId })
→ { market, stalls, markers, areas, statistics }
```

#### **Router: dmsHub.stalls**
```typescript
// Lista posteggi per mercato
dmsHub.stalls.listByMarket({ marketId })
→ [{ id, number, lat, lng, category, areaMq, status }]

// Aggiorna stato posteggio
dmsHub.stalls.updateStatus({ stallId, status })
→ { success }

// Stati real-time
dmsHub.stalls.getStatuses({ marketId })
→ [{ stallId, status, vendorName }]
```

#### **Router: dmsHub.vendors**
```typescript
// Lista operatori
dmsHub.vendors.list()
→ [{ id, firstName, lastName, businessName, businessType, status }]

// Crea operatore
dmsHub.vendors.create({ ...vendorData })
→ { success, vendorId }

// Aggiorna operatore
dmsHub.vendors.update({ vendorId, data })
→ { success }

// Dettagli completi (per Polizia)
dmsHub.vendors.getFullDetails({ vendorId })
→ {
  vendor,
  documents: [...],
  concessions: [...],
  presences: [...],
  violations: [...],
  stats: { totalPresences, totalViolations, activeConcessions }
}
```

#### **Router: dmsHub.bookings**
```typescript
// Prenota posteggio
dmsHub.bookings.create({ stallId, userId, vendorId, notes })
→ { success, bookingId, expiresAt }

// Lista prenotazioni attive
dmsHub.bookings.listActive()
→ [{ id, stallId, expiresAt, status }]

// Conferma check-in
dmsHub.bookings.confirmCheckin({ bookingId, vendorId, lat, lng })
→ { success }

// Cancella prenotazione
dmsHub.bookings.cancel({ bookingId })
→ { success }
```

#### **Router: dmsHub.presences**
```typescript
// Check-out operatore
dmsHub.presences.checkout({ presenceId, notes })
→ { success, duration }

// Presenze oggi per mercato
dmsHub.presences.getTodayByMarket({ marketId })
→ [{ vendorName, stallNumber, checkinTime, isSubstitute }]
```

#### **Router: dmsHub.inspections**
```typescript
// Crea controllo
dmsHub.inspections.create({
  vendorId,
  stallId,
  inspectorName,
  inspectorBadge,
  type,
  checklist,
  photosUrls,
  gpsLat,
  gpsLng,
  result,
  notes
}) → { success, inspectionId }

// Lista controlli
dmsHub.inspections.list({ vendorId?, startDate?, endDate? })
→ [{ id, vendorName, inspectorName, date, type, result }]
```

#### **Router: dmsHub.violations**
```typescript
// Emetti verbale
dmsHub.violations.create({
  inspectionId,
  vendorId,
  stallId,
  violationType,
  violationCode,
  description,
  fineAmount,
  dueDate
}) → { success, violationId }

// Lista verbali
dmsHub.violations.list({ vendorId?, status? })
→ [{ id, vendorName, violationType, fineAmount, status, dueDate }]
```

---

### **Sistema Logging Automatico**

Tutte le operazioni DMS HUB loggano automaticamente in:

#### **audit_logs**
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  old_value JSON,
  new_value JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **system_logs**
```sql
CREATE TABLE system_logs (
  id SERIAL PRIMARY KEY,
  app VARCHAR(50) DEFAULT 'DMS_HUB',
  level VARCHAR(20) NOT NULL,
  -- info, warning, error
  type VARCHAR(100),
  message TEXT NOT NULL,
  user_email VARCHAR(255),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Operazioni Loggiate**:
1. `IMPORT_SLOT_EDITOR` - Import JSON
2. `UPDATE_STALL_STATUS` - Cambio stato posteggio
3. `CREATE_VENDOR` - Creazione operatore
4. `UPDATE_VENDOR` - Modifica operatore
5. `CREATE_BOOKING` - Prenotazione
6. `CONFIRM_CHECKIN` - Check-in
7. `CANCEL_BOOKING` - Cancellazione
8. `CHECKOUT_VENDOR` - Check-out
9. `CREATE_INSPECTION` - Controllo
10. `CREATE_VIOLATION` - Verbale

**Visualizzazione**: Dashboard PA → Tab "Log Sistema"

---

### **UI Gestione Mercati** (Dashboard PA - Tab 22)

#### **4 Sottosezioni**

##### **1. Mercati**
- Lista mercati con card
- Statistiche per mercato:
  - Posteggi totali
  - Occupati (rosso)
  - Liberi (verde)
  - Stato attivo/inattivo
- Click card → Seleziona mercato

##### **2. Posteggi**
- Visualizza dopo selezione mercato
- Griglia posteggi con:
  - Numero posteggio
  - Badge stato colorato:
    - 🟢 Libero (verde)
    - 🔴 Occupato (rosso)
    - 🟡 Prenotato (giallo)
    - ⚫ Riservato (grigio)
    - 🔵 Manutenzione (blu)
  - Categoria (es. Alimentari)
  - Area m²
  - Pulsanti azione:
    - "Libera" - Imposta libero
    - "Manutenzione" - Imposta manutenzione

##### **3. Operatori**
- Lista operatori registrati
- Card con:
  - Nome completo
  - Ragione sociale
  - Tipo attività
  - Badge stato (attivo/sospeso/inattivo)
  - Pulsante "Dettagli"
- Pulsante "Nuovo Operatore"

##### **4. Prenotazioni**
- Lista prenotazioni attive
- Card con:
  - Numero posteggio
  - Scadenza (data/ora)
  - Badge stato
  - Tempo rimanente

#### **Dialog Import JSON**
- Campo "Nome Mercato" *
- Campo "Città" *
- Campo "Indirizzo" *
- Textarea JSON (12 righe, font mono)
- Validazione JSON automatica
- Preview statistiche import:
  - Posteggi creati
  - Marker creati
  - Aree create
- Pulsante "Importa Mercato"
- Loading state durante import
- Toast success/error

---

## 🔄 SISTEMA POSTEGGI COMPLETO

### **Tipologie Posteggi**

#### **1. Posteggi Fissi con Concessione**
**Ambulanti Titolari**:
- Hanno concessione permanente su posteggio specifico
- Esempio: Mario Rossi ha sempre posteggio #5
- **Se presente**: Check-in → Stato OCCUPATO (🔴 rosso)
- **Se assente**: Stato RISERVATO (⚫ grigio) ma disponibile per spuntisti

**Tabelle coinvolte**:
- `concessions` - Chi ha diritto permanente
- `vendor_presences` - Presenza giornaliera

#### **2. Posteggi Spuntisti**
**Quando titolare assente**:
- Posteggio RISERVATO diventa disponibile per "spunta"
- Primo arrivato fa check-in → Occupa per la giornata
- Campo `is_substitute = true` in `vendor_presences`
- Fine giornata → Check-out → Torna RISERVATO per titolare

**Workflow**:
```
Mattina: Posteggio #5 RISERVATO (Mario Rossi assente)
       ↓
08:00: Luca Bianchi (spuntista) arriva
       ↓
08:05: Check-in → Posteggio #5 OCCUPATO (Luca Bianchi)
       ↓
18:00: Check-out → Posteggio #5 RISERVATO (Mario Rossi)
```

#### **3. Posteggi Liberi**
**Senza concessione**:
- Sempre disponibili per spuntisti
- Check-in/Check-out giornaliero
- Prenotazione possibile (30 min timeout)
- Stato: LIBERO (🟢 verde) quando vuoto

#### **4. Negozi HUB**
**Attività permanenti**:
- Sempre stesso operatore
- Sempre aperti (orari fissi)
- No check-in/check-out
- No spuntisti
- Stato: sempre OCCUPATO

---

### **Stati Posteggi**

| Stato | Colore | Descrizione | Azioni Possibili |
|-------|--------|-------------|------------------|
| **free** | 🟢 Verde | Libero, disponibile | Prenota, Check-in |
| **occupied** | 🔴 Rosso | Occupato, operatore presente | Visualizza info |
| **booked** | 🟡 Giallo | Prenotato (max 30 min) | Conferma check-in, Cancella |
| **reserved** | ⚫ Grigio | Riservato per titolare assente | Spuntisti possono occupare |
| **maintenance** | 🔵 Blu | In manutenzione | Nessuna |

---

### **Workflow Prenotazione**

```
1. Cittadino/Operatore vede posteggio LIBERO
       ↓
2. Click "Prenota" → Dialog conferma
       ↓
3. Conferma → POST /api/dmsHub/bookings/create
       ↓
4. Database: Crea booking + Aggiorna stall status = "booked"
       ↓
5. Stato → PRENOTATO (🟡) per 30 minuti
       ↓
6. Operatore arriva → Check-in
       ↓
7. POST /api/dmsHub/bookings/confirmCheckin
       ↓
8. Database: Crea presence + Aggiorna stall status = "occupied"
       ↓
9. Stato → OCCUPATO (🔴)
       ↓
10. Fine giornata → Check-out
       ↓
11. POST /api/dmsHub/presences/checkout
       ↓
12. Database: Aggiorna presence.checkout_time + stall status = "free"
       ↓
13. Stato → LIBERO (🟢)
```

**Timeout Automatico**:
- Se dopo 30 minuti non c'è check-in
- Booking status → "expired"
- Stall status → "free"
- Notifica operatore: "Prenotazione scaduta"

---

## 🔗 COLLEGAMENTI ECOSISTEMA

### **Schema Completo**

```
┌─────────────────────────────────────────────────────────┐
│              🌍 SITO PUBBLICO DMS HUB                   │
│         (Homepage Nazionale con Musica)                 │
│                                                         │
│  🎯 3 Sezioni Target:                                   │
│  ├─→ 👥 Cittadini → App Cittadini                      │
│  ├─→ 🏪 Commercianti → Hub Operatore                   │
│  └─→ 🏛️ PA/Admin → Dashboard Admin                     │
└─────────────────────────────────────────────────────────┘
                         ↓
     ┌───────────────────┴───────────────────┐
     ↓                   ↓                   ↓
┌──────────┐      ┌──────────┐      ┌──────────────┐
│ 👥 APP   │      │ 🏪 HUB   │      │ 📊 DASHBOARD │
│ CITTADINI│      │ OPERATORE│      │   ADMIN PA   │
│          │      │          │      │  (22 tab)    │
│ - Mappa  │      │ - Check  │      │              │
│ - Wallet │      │ - Vendite│      │ Quick Access:│
│ - Route  │      │ - TCC    │      │ ├─ 7 App    │
│ - Vetrine│      │ - Prodotti│     │ ├─ BUS HUB  │
│ - Civic  │      │          │      │ ├─ Core Map │
│          │      │ 🌍 Ecosist│     │ ├─ Sito Pub │
│ 🌍 Ecosist│     └──────────┘      │ ├─ DMS News │
└──────────┘                        │ └─ Gestionale│
                                    │              │
                                    │ Tab 22:      │
                                    │ 🗺️ GESTIONE │
                                    │   MERCATI    │
                                    └──────┬───────┘
                                           │
                                           ↓
                                    ┌──────────────┐
                                    │ 🚌 BUS HUB   │
                                    │              │
                                    │ - PNG Tool   │
                                    │ - Slot Ed v3 │
                                    │ - Banca Mappe│
                                    │              │
                                    │ 🔗 Link:     │
                                    │ ├─ Sito Pub  │
                                    │ ├─ Core Map  │
                                    │ └─ Dashboard │
                                    └──────┬───────┘
                                           │
                                           ↓
                                    ┌──────────────┐
                                    │ 🗺️ CORE MAP │
                                    │  GROSSETO    │
                                    │              │
                                    │ - Mappa GIS  │
                                    │ - Posteggi   │
                                    │ - Layer      │
                                    │              │
                                    │ 🔗 Ecosistema│
                                    │ ├─ Sito Pub  │
                                    │ ├─ Dashboard │
                                    │ ├─ BUS HUB   │
                                    │ └─ Mappa Pub │
                                    └──────────────┘

┌─────────────────────────────────────────────────────────┐
│         🚀 GESTIONALE DMS (Heroku)                      │
│                                                         │
│  - Concessioni ambulanti                               │
│  - Pagamenti e scadenze                                │
│  - Documenti e permessi                                │
│  - Anagrafica operatori                                │
│                                                         │
│  ⏳ Integrazione Futura: API bridge bidirezionale      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│         📰 DMS NEWS (GitHub Pages)                      │
│                                                         │
│  - News e aggiornamenti                                │
│  - Comunicazioni pubbliche                             │
└─────────────────────────────────────────────────────────┘
```

---

### **Matrice Collegamenti**

|  | Sito Pub | App Citt | Hub Op | Dashboard | BUS HUB | Core Map | News | Gestionale |
|---|---|---|---|---|---|---|---|---|
| **Sito Pubblico** | - | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **App Cittadini** | ✅ | - | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Hub Operatore** | ✅ | ❌ | - | ❌ | ❌ | ❌ | ❌ | ⏳ |
| **Dashboard PA** | ✅ | ✅ | ✅ | - | ✅ | ✅ | ✅ | ✅ |
| **BUS HUB** | ✅ | ❌ | ❌ | ✅ | - | ✅ | ❌ | ❌ |
| **Core Map** | ✅ | ❌ | ❌ | ✅ | ✅ | - | ❌ | ❌ |
| **DMS News** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | - | ❌ |
| **Gestionale** | ❌ | ❌ | ⏳ | ✅ | ❌ | ❌ | ❌ | - |

✅ = Collegamento attivo  
❌ = Nessun collegamento  
⏳ = Integrazione futura

---

## 🎯 ARCHITETTURA ACCESSI

### **Livelli di Accesso**

#### **👤 SUPER ADMIN (Tu)**
**Accesso Completo a**:
- ✅ Dashboard Admin (tutte le 22 sezioni)
- ✅ BUS HUB (tool editor)
- ✅ Core Map (mappa operativa)
- ✅ Gestionale DMS (Heroku)
- ✅ DMS News
- ✅ Tutte le altre app

**Funzionalità Esclusive**:
- Import JSON da Slot Editor v3
- Configurazione mercati
- Gestione concessioni
- Emissione verbali
- Modifica anagrafica operatori
- Accesso log sistema
- Configurazione TCC

---

#### **🏛️ PA (Amministrazione Pubblica)**
**Accesso Limitato a**:
- ✅ Dashboard PA (versione limitata - FUTURA)
- ✅ App Cittadini (visualizzazione)
- ❌ NO BUS HUB
- ❌ NO Core Map operativa
- ❌ NO Gestionale DMS

**Funzionalità**:
- Visualizzazione analytics
- Consultazione dati aggregati
- Report export
- Monitoraggio sostenibilità
- Nessuna modifica configurazione

---

#### **👥 CITTADINI**
**Accesso a**:
- ✅ Sito Pubblico
- ✅ App Cittadini
- ❌ NO Dashboard PA
- ❌ NO BUS HUB
- ❌ NO Core Map
- ❌ NO Gestionale

**Funzionalità**:
- Visualizzazione mercati
- Prenotazione posteggi (se abilitata)
- Wallet TCC
- Route planner
- Civic reporting
- Vetrine digitali

---

#### **🏪 OPERATORI (Negozianti + Ambulanti)**
**Accesso a**:
- ✅ Hub Operatore
- ✅ App DMS (Heroku) - per concessioni
- ❌ NO Dashboard PA
- ❌ NO BUS HUB
- ❌ NO Core Map

**Funzionalità**:
- Check-in/Check-out giornaliero
- Gestione prodotti
- Visualizzazione vendite
- TCC guadagnati
- Richiesta posteggio spuntista
- Consultazione concessioni

---

#### **👮 POLIZIA MUNICIPALE**
**Accesso a** (FUTURO):
- ✅ App Polizia (tablet)
- ✅ Dashboard PA (sezione Controlli)
- ❌ NO BUS HUB
- ❌ NO configurazione mercati

**Funzionalità**:
- Mappa interattiva mercato
- Click posteggio → Scheda operatore completa
- Registrazione controlli
- Emissione verbali
- Consultazione documenti
- Alert automatici (documenti scaduti, verbali aperti)

---

## 📊 FLUSSO DATI COMPLETO

### **Centralizzazione su Dashboard Admin**

```
┌─────────────────────────────────────────────────────────┐
│                 DASHBOARD ADMIN                         │
│              (Centro Controllo Unico)                   │
│                                                         │
│  📦 Database PostgreSQL (Master):                       │
│  ├─ Mercati e geometria (da Slot Editor v3)            │
│  ├─ Posteggi e stati real-time                         │
│  ├─ Operatori (anagrafica master)                      │
│  ├─ Concessioni                                        │
│  ├─ Prenotazioni e presenze                            │
│  ├─ Controlli e verbali                                │
│  └─ Log sistema completo                               │
│                                                         │
│  🔌 API tRPC (25+ endpoint):                            │
│  ├─ Import/Export dati                                 │
│  ├─ CRUD completo                                      │
│  ├─ Query analytics                                    │
│  └─ Sincronizzazione                                   │
└────────────┬────────────────────────────────────────────┘
             │
             │ ↕️ SINCRONIZZAZIONE BIDIREZIONALE
             │
     ┌───────┴────────┬──────────────┬──────────────┐
     ↓                ↓              ↓              ↓
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│ APP        │  │ HUB        │  │ GESTIONALE │  │ APP        │
│ CITTADINI  │  │ OPERATORE  │  │ HEROKU     │  │ POLIZIA    │
│            │  │            │  │            │  │ (FUTURA)   │
│ Read-only  │  │ Read/Write │  │ Read/Write │  │ Read/Write │
│ - Mercati  │  │ - Check-in │  │ - Concess. │  │ - Controlli│
│ - Posteggi │  │ - Presenze │  │ - Pagamenti│  │ - Verbali  │
│ - Prenota  │  │ - Vendite  │  │ - Documenti│  │ - Schede   │
└────────────┘  └────────────┘  └────────────┘  └────────────┘
```

---

### **Sincronizzazione Gestionale Heroku** (FUTURA)

```
┌─────────────────────────────────────────────────────────┐
│              GESTIONALE HEROKU                          │
│         (Sistema Master Concessioni)                    │
│                                                         │
│  - Anagrafica operatori (master)                       │
│  - Concessioni posteggi                                │
│  - Presenze/Check-in real-time                         │
│  - Pagamenti                                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ ↕️ API SYNC BIDIREZIONALE
                 │
┌────────────────┴────────────────────────────────────────┐
│              DATABASE MANUS (DMS HUB)                   │
│                                                         │
│  - Geometria mercati (da Slot Editor v3)               │
│  - Posteggi (posizione, numero, area_mq)               │
│  - Assegnazioni (sync da Gestionale)                   │
│  - Stati occupazione (sync da Gestionale)              │
│  - Controlli e verbali (solo DMS HUB)                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ ↕️ DISTRIBUISCE DATI
                 │
     ┌───────────┴───────────┬───────────────┐
     ↓                       ↓               ↓
┌──────────┐         ┌──────────┐    ┌──────────┐
│ SITO     │         │ APP      │    │ APP      │
│ PUBBLICO │         │ CITTADINI│    │ POLIZIA  │
│          │         │          │    │          │
│ - Mappa  │         │ - Prenota│    │ - Schede │
│ - Stati  │         │ - Wallet │    │ - Verbali│
└──────────┘         └──────────┘    └──────────┘
```

**Dati Sincronizzati**:
- **Gestionale → DMS HUB**:
  - Anagrafica operatori (master)
  - Concessioni attive
  - Presenze check-in/check-out
  - Stati occupazione posteggi
  - Pagamenti concessioni

- **DMS HUB → Gestionale**:
  - Geometria mercati (nuovi mercati creati)
  - Posteggi disponibili
  - Modifiche anagrafica (da Dashboard Admin)
  - Controlli Polizia
  - Verbali emessi

**Frequenza Sync**:
- Real-time: Presenze, stati occupazione (webhook)
- Ogni 5 minuti: Anagrafica, concessioni (polling)
- On-demand: Geometria mercati (trigger manuale)

**Gestione Conflitti**:
- **Anagrafica**: Gestionale sempre master
- **Presenze**: Ultimo aggiornamento vince
- **Geometria**: DMS HUB sempre master
- **Controlli/Verbali**: Solo DMS HUB (no sync)

---

## 🚀 WORKFLOW COMPLETO

### **Creazione Nuovo Mercato**

```
1. ADMIN: Apre BUS HUB
   https://chcndr.github.io/dms-gemello-core/tools/bus_hub.html
       ↓
2. PNG Tool: Upload pianta mercato
       ↓
3. Rimozione sfondo automatica
       ↓
4. Salva nel BUS → Passa a Slot Editor v3
       ↓
5. Slot Editor v3:
   a. Georeferenziazione (4 GCP)
   b. Disegna Container mercato
   c. Crea posteggi numerati
   d. Aggiungi marker personalizzati
   e. Definisci aree custom
       ↓
6. Export JSON completo
       ↓
7. Click "Invia a Dashboard Admin"
       ↓
8. Dashboard Admin → Tab "Gestione Mercati"
       ↓
9. Dialog import JSON:
   - Nome mercato: "Mercato Centrale Grosseto"
   - Città: "Grosseto"
   - Indirizzo: "Piazza del Mercato, 1"
   - JSON: [incolla JSON da Slot Editor]
       ↓
10. Click "Importa Mercato"
       ↓
11. Backend: POST /api/dmsHub/markets/importFromSlotEditor
       ↓
12. Database:
    - Crea market_geometry
    - Crea N stalls
    - Crea M custom_markers
    - Crea K custom_areas
       ↓
13. Log automatico: IMPORT_SLOT_EDITOR
       ↓
14. Toast success: "Mercato importato! 45 posteggi, 8 marker, 3 aree"
       ↓
15. Lista mercati aggiornata → Vedi nuovo mercato
       ↓
16. Click mercato → Vedi posteggi su mappa
       ↓
17. Sito Pubblico aggiornato automaticamente
```

---

### **Operatore Check-in Giornaliero**

```
1. OPERATORE: Apre Hub Operatore
   https://dmshubapp-hkvujnro.manus.space/hub-operatore
       ↓
2. Login con credenziali
       ↓
3. Dashboard: Vede posteggio assegnato
   "Posteggio #5 - Mercato Centrale"
   Stato: RISERVATO (grigio)
       ↓
4. Click "Check-in"
       ↓
5. Conferma posizione GPS
       ↓
6. POST /api/dmsHub/bookings/confirmCheckin
       ↓
7. Database:
   - Crea vendor_presences (checkin_time = NOW)
   - Aggiorna stalls.status = "occupied"
       ↓
8. Log: CONFIRM_CHECKIN
       ↓
9. Stato posteggio → OCCUPATO (🔴 rosso)
       ↓
10. Sito Pubblico: Mappa aggiornata real-time
       ↓
11. Dashboard Admin: Vede presenza in "Presenze Oggi"
       ↓
12. Fine giornata: Click "Check-out"
       ↓
13. POST /api/dmsHub/presences/checkout
       ↓
14. Database:
    - Aggiorna vendor_presences.checkout_time = NOW
    - Calcola duration
    - Aggiorna stalls.status = "reserved"
       ↓
15. Log: CHECKOUT_VENDOR
       ↓
16. Stato posteggio → RISERVATO (⚫ grigio)
```

---

### **Spuntista Occupa Posteggio**

```
1. SPUNTISTA: Arriva al mercato ore 08:00
       ↓
2. Vede posteggio #5 RISERVATO (titolare assente)
       ↓
3. Apre App Cittadini → Mappa
       ↓
4. Click posteggio #5 → Popup:
   "Posteggio #5 - RISERVATO per Mario Rossi
    Disponibile per spuntisti"
       ↓
5. Click "Prenota per Spunta"
       ↓
6. POST /api/dmsHub/bookings/create
   { stallId: 5, vendorId: 999, isSubstitute: true }
       ↓
7. Database:
   - Crea booking (expires_at = +30 min)
   - Aggiorna stalls.status = "booked"
       ↓
8. Stato → PRENOTATO (🟡 giallo) per 30 min
       ↓
9. Spuntista arriva fisicamente → Check-in
       ↓
10. POST /api/dmsHub/bookings/confirmCheckin
       ↓
11. Database:
    - Crea vendor_presences (is_substitute = true)
    - Aggiorna stalls.status = "occupied"
       ↓
12. Stato → OCCUPATO (🔴 rosso)
       ↓
13. Dashboard Admin: Vede "Luca Bianchi (spuntista) - Posteggio #5"
       ↓
14. Fine giornata: Check-out
       ↓
15. Stato → RISERVATO (⚫ grigio) per titolare
```

---

### **Polizia Controllo** (FUTURO)

```
1. POLIZIA: Apre App Polizia su tablet
       ↓
2. Mappa mercato con posteggi colorati
       ↓
3. Click posteggio #5 OCCUPATO (🔴 rosso)
       ↓
4. Popup Scheda Operatore Completa:
   ┌─────────────────────────────────┐
   │ 👤 OPERATORE                    │
   │ Mario Rossi                     │
   │ CF: RSSMRA75H12D612K            │
   │ P.IVA: 01234567890              │
   │                                 │
   │ 🏢 ATTIVITÀ                     │
   │ Bio Frutta Srl                  │
   │ Frutta e Verdura Biologica      │
   │                                 │
   │ 📜 CONCESSIONE                  │
   │ Attiva dal 01/01/2024           │
   │ Scadenza: 31/12/2026            │
   │                                 │
   │ 📄 DOCUMENTI                    │
   │ ✅ Licenza commercio            │
   │ ✅ HACCP (scad. 15/06/2025)     │
   │ ⚠️ Assicurazione (scad. 10/01/25)│
   │                                 │
   │ ⚠️ VERBALI APERTI: 1            │
   │ - Mancata esposizione prezzi    │
   │   (€150, scad. 20/12/2024)      │
   │                                 │
   │ [📝 Nuovo Controllo]            │
   │ [⚠️ Emetti Verbale]             │
   └─────────────────────────────────┘
       ↓
5. Click "Nuovo Controllo"
       ↓
6. Form controllo:
   - Tipo: Routine / Segnalazione / Random
   - Checklist:
     ☑ Igiene posteggio
     ☑ Permessi esposti
     ☐ Prodotti conformi
     ☑ Comportamento
   - Foto (opzionale)
   - GPS automatico
   - Esito: Superato / Non superato / Warning
   - Note
       ↓
7. Click "Registra Controllo"
       ↓
8. POST /api/dmsHub/inspections/create
       ↓
9. Database: Crea inspections_detailed
       ↓
10. Log: CREATE_INSPECTION
       ↓
11. Se esito "Non superato" → Dialog "Emetti Verbale?"
       ↓
12. Form verbale:
    - Tipo violazione: Igiene / Permessi / Prodotti / Comportamento
    - Codice violazione: (autocomplete)
    - Descrizione dettagliata
    - Importo multa: €150
    - Scadenza pagamento: +30 giorni
       ↓
13. POST /api/dmsHub/violations/create
       ↓
14. Database: Crea violations
       ↓
15. Log: CREATE_VIOLATION
       ↓
16. Notifica operatore: "Verbale emesso - €150"
       ↓
17. Dashboard Admin: Vede nuovo verbale in "Controlli"
       ↓
18. Gestionale Heroku: Sync verbale per gestione pagamento
```

---

## 📈 STATISTICHE SISTEMA

### **Metriche Disponibili**

#### **Dashboard Admin - Overview**
- Utenti totali: 15.847 (+8.5%)
- Mercati attivi: 12
- Negozi totali: 156
- Transazioni: 24.150 (+12.3%)
- Rating sostenibilità: 7.8/10
- CO₂ risparmiata: 4.654 kg

#### **Mercati**
Per ogni mercato:
- Posteggi totali
- Occupati (%)
- Liberi (%)
- Prenotati (%)
- Riservati (%)
- In manutenzione (%)
- Visite giornaliere
- Durata media permanenza

#### **Operatori**
- Totali registrati
- Attivi oggi
- Presenze mensili
- TCC guadagnati
- Verbali aperti
- Documenti in scadenza

#### **Sostenibilità**
- Trasporti: A piedi (41%), Bici (20%), Bus (18%), Auto (16%), Elettrico (5%)
- Certificazioni: BIO (52%), KM0 (41%), DOP/IGP (19%), Fair Trade (9%)
- CO₂ risparmiata per modalità trasporto
- E-commerce vs Fisico: 40% vs 60%

#### **Carbon Credits (TCC)**
- Fondo disponibile: €125.000
- Burn rate: €8.500/mese
- Mesi rimanenti: 14.7
- TCC emessi: 125.000
- TCC spesi: 78.000
- Velocità circolazione: 62.4%
- Rimborsi necessari: €15.600
- CO₂ risparmiata: 4.680 kg
- Alberi equivalenti: 213

---

## 🔮 ROADMAP FUTURA

### **FASE 1: Completamento Base** (Q1 2025)
- ✅ Database schema completo
- ✅ API backend complete
- ✅ Dashboard Admin con Gestione Mercati
- ✅ Sistema logging automatico
- ⏳ Test import JSON da Slot Editor v3
- ⏳ Mappa interattiva posteggi in Dashboard
- ⏳ Sistema prenotazioni frontend completo

### **FASE 2: Integrazione Gestionale** (Q2 2025)
- ⏳ API bridge Gestionale Heroku ↔ DMS HUB
- ⏳ Sincronizzazione bidirezionale
- ⏳ Webhook real-time presenze
- ⏳ Migrazione anagrafica operatori
- ⏳ Gestione concessioni unificata

### **FASE 3: App Polizia Municipale** (Q2 2025)
- ⏳ UI tablet ottimizzata
- ⏳ Scheda operatore completa
- ⏳ Sistema controlli e verbali
- ⏳ Alert automatici
- ⏳ Integrazione GPS
- ⏳ Upload foto controlli

### **FASE 4: Sistema Prenotazioni Pubblico** (Q3 2025)
- ⏳ Prenotazione posteggi da App Cittadini
- ⏳ Timeout automatico 30 minuti
- ⏳ Notifiche push
- ⏳ Pagamento online prenotazione
- ⏳ QR code check-in

### **FASE 5: Dashboard PA Limitata** (Q3 2025)
- ⏳ Versione PA con permessi limitati
- ⏳ Solo visualizzazione analytics
- ⏳ No configurazione mercati
- ⏳ No accesso BUS HUB
- ⏳ Export report automatici

### **FASE 6: Ottimizzazioni** (Q4 2025)
- ⏳ PWA (Progressive Web App)
- ⏳ Offline-first per operatori
- ⏳ Ottimizzazione performance
- ⏳ Cache intelligente
- ⏳ Compressione immagini
- ⏳ CDN per assets statici

### **FASE 7: AI e Analytics Avanzate** (2026)
- ⏳ Predizione affluenza mercati
- ⏳ Suggerimenti posteggi ottimali
- ⏳ Analisi sentiment cittadini
- ⏳ Chatbot assistenza operatori
- ⏳ Dashboard predittiva PA

---

## 🔐 SICUREZZA E PRIVACY

### **Autenticazione**
- JWT token con scadenza 24h
- Refresh token per sessioni lunghe
- Password hashing con bcrypt
- 2FA opzionale per admin

### **Autorizzazione**
- Role-based access control (RBAC)
- Permessi granulari per API
- Audit log completo
- IP whitelisting per admin

### **Privacy**
- GDPR compliant
- Dati personali criptati
- Anonimizzazione analytics
- Consenso esplicito utenti
- Right to be forgotten

### **Backup**
- Backup automatico database (daily)
- Retention 30 giorni
- Backup incrementali (hourly)
- Disaster recovery plan

---

## 📞 CONTATTI E SUPPORTO

### **Documentazione**
- Dashboard Admin → Tab "Documentazione"
- Guide uso per ogni sezione
- Video tutorial
- FAQ

### **Supporto Tecnico**
- Email: support@dmshub.it
- Ticket system integrato
- Chat AI assistente
- Forum community

### **Sviluppo**
- GitHub: https://github.com/chcndr/dms-gemello-core
- Issues tracker
- Pull requests
- Changelog

---

## 🎉 CONCLUSIONI

Il **DMS HUB** rappresenta un ecosistema completo e integrato per la digitalizzazione del commercio locale sostenibile in Italia. Con:

- **8 applicazioni web** interconnesse
- **5 tool editor** professionali
- **22 sezioni analytics** nella Dashboard Admin
- **13 tabelle database** per gestione completa
- **25+ API endpoint** type-safe
- **Sistema logging** automatico completo
- **Architettura scalabile** e modulare

Il sistema è pronto per:
1. ✅ Test import JSON da Slot Editor v3
2. ✅ Configurazione primi mercati
3. ✅ Onboarding operatori
4. ⏳ Integrazione Gestionale Heroku
5. ⏳ Lancio App Polizia
6. ⏳ Apertura al pubblico

---

**Versione Documento**: 1.0  
**Data**: 9 Novembre 2025  
**Autore**: Manus AI Assistant  
**Progetto**: DMS HUB - Digital Market System

---

*Questo documento è un resoconto completo dell'ecosistema DMS HUB al 9 novembre 2025. Per aggiornamenti e modifiche, consultare la documentazione tecnica nella Dashboard Admin.*
