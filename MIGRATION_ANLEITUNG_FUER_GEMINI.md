# 🚨 MIGRATIONS-ANLEITUNG FÜR GEMINI 3 PRO 🚨

> **WARNUNG an Gemini 3 Pro**: Dies ist ein **KRITISCHES Dokument**. Lies es **VOLLSTÄNDIG** durch, bevor du irgendeinen Code änderst. Bei jedem Schritt gibt es **Sicherheits-Checklisten**, die du ABARBEITEN MUSST, bevor du weitermachst.

---

## 🔴 ABSOLUTE PRIORITÄT: KEINE DATEN VERLIEREN!

Auf dem Coolify-Server läuft bereits die Produktions-App mit **echten Benutzerdaten** in einem Docker-Volume. Diese Daten dürfen **UNTER KEINEN UMSTÄNDEN** verloren gehen!

### Aktuelle Architektur (verstehe das ZUERST):
```
Coolify Server (Production)
├── Docker Container "lernpfad"
│   └── /app/data/ (gemounted als Volume)
│       ├── courses.json  ← ECHTE USER-DATEN!
│       └── stats.json    ← ECHTE USER-DATEN!
│
└── Volume: lernpfad-data  ← HIER LIEGT ALLES!
```

### Was lokal passiert:
```
Lokaler Computer
├── /Users/.../Lernpfad/
│   └── data/  ← In .gitignore, wird NICHT gepusht
```

**WICHTIG**: `data/` ist in `.gitignore` – das heißt, wenn du lokal änderst und pushst, werden die Server-Daten NICHT überschrieben. Das ist GUT. Aber: Wenn du an der Datenbank-Struktur änderst, musst du die bestehenden Daten MIGRIEREN, nicht ersetzen!

---

# 📋 SCHRITT-FÜR-SCHRITT MIGRATIONS-ANLEITUNG

---

## SCHRITT 1: SQLite statt JSON-Dateien (🔴 KRITISCH)

### 1.1 VOR-SICHERUNG (ZUERST MACHEN!)

**STOP!** Bevor du IRGENDETWAS am Code änderst, musst du:

1. **SSH auf den Coolify-Server** und sichere die aktuellen Daten:
```bash
# Verbinde dich mit dem Server (User muss dir das Passwort/Key geben)
ssh [user]@[coolify-server-ip]

# Finde den Docker Container
docker ps | grep lernpfad

# Kopiere die Daten aus dem Container heraus auf den Server
docker cp lernpfad:/app/data/courses.json ~/backup_courses_$(date +%Y%m%d_%H%M%S).json
docker cp lernpfad:/app/data/stats.json ~/backup_stats_$(date +%Y%m%d_%H%M%S).json

# VERIFIZIERE, dass das Backup existiert
ls -la ~/backup_*

# Zeige den Inhalt an, um sicherzugehen, dass es Daten sind
cat ~/backup_courses_*.json | head -50
```

**✅ CHECKLISTE:**
- [ ] SSH-Zugang funktioniert
- [ ] Backup-Dateien erstellt
- [ ] Backup enthält echte Daten (nicht leer, nicht `[]`)

---

### 1.2 Neue Dependencies installieren

**Welches ORM benutzen?** Für dieses Projekt empfehle ich **better-sqlite3** mit **Drizzle ORM**, weil:
- SQLite = keine externe Datenbank nötig
- Drizzle = typsicher, leichtgewichtig
- Perfekt für Single-User-Apps

**In `package.json` hinzufügen:**

```json
{
  "dependencies": {
    "better-sqlite3": "^11.0.0",
    "drizzle-orm": "^0.29.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.0",
    "@types/better-sqlite3": "^7.6.8"
  }
}
```

**WICHTIG:** Benutze diese Befehle zum Installieren:
```bash
npm install better-sqlite3 drizzle-orm
npm install -D drizzle-kit @types/better-sqlite3
```

---

### 1.3 Datenbankschema erstellen

**Erstelle neue Datei: `server/db/schema.ts`**

```typescript
// server/db/schema.ts
import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

// Kurse und Ordner Tabelle
export const dashboardItems = sqliteTable('dashboard_items', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['course', 'folder'] }).notNull(),
  name: text('name').notNull(),
  themeColor: text('theme_color'),
  parentFolderId: text('parent_folder_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$default(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$default(() => new Date()),
  
  // Nur für Kurse
  units: text('units', { mode: 'json' }),  // JSON-string für Units-Array
  courseProgress: text('course_progress', { mode: 'json' }),
  
  // Nur für Ordner
  sortOrder: integer('sort_order'),
});

// User Stats Tabelle
export const userStats = sqliteTable('user_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  stars: integer('stars').default(0),
  streak: integer('streak').default(0),
  lastActivity: text('last_activity'),
  systemPrompt: text('system_prompt'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$default(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$default(() => new Date()),
});
```

**WICHTIG – Konventionen:**
- Tabellennamen: `snake_case` (z.B. `dashboard_items`)
- Primärschlüssel immer `id` nennen
- Timestamps für jede Tabelle (`createdAt`, `updatedAt`)
- JSON-Felder als `text` mit `mode: 'json'` speichern

---

### 1.4 Datenbank-Verbindung erstellen

**Erstelle neue Datei: `server/db/index.ts`**

```typescript
// server/db/index.ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

// WICHTIG: Pfad zur Datenbank im DATA_DIR!
const DATA_DIR = process.env.DATA_DIR || './data';
const DB_PATH = path.join(DATA_DIR, 'lernpfad.db');

// Erstelle SQLite Verbindung
const sqlite = new Database(DB_PATH);

// Aktiviere WAL-Modus für bessere Performance
sqlite.pragma('journal_mode = WAL');

// Erstelle Drizzle-Instanz
export const db = drizzle(sqlite, { schema });

// Exportiere auch die rohe SQLite-Verbindung für Migrations
export { sqlite };
```

---

### 1.5 Migrations-Script für bestehende Daten (🚨 SUPER KRITISCH!)

**Erstelle neue Datei: `server/db/migrate-from-json.ts`**

```typescript
// server/db/migrate-from-json.ts
// DIESES SCRIPT MIGRIERT DIE BESTEHENDEN JSON-DATEN IN DIE SQLITE-DATENBANK!

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || './data';
const DB_PATH = path.join(DATA_DIR, 'lernpfad.db');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

// Schritt 1: Prüfe ob JSON-Dateien existieren
function checkJsonFilesExist(): boolean {
  const coursesExist = fs.existsSync(COURSES_FILE);
  const statsExist = fs.existsSync(STATS_FILE);
  
  console.log('📁 Prüfe JSON-Dateien...');
  console.log(`   courses.json: ${coursesExist ? '✅ GEFUNDEN' : '❌ NICHT GEFUNDEN'}`);
  console.log(`   stats.json: ${statsExist ? '✅ GEFUNDEN' : '❌ NICHT GEFUNDEN'}`);
  
  return coursesExist;  // Stats sind optional
}

// Schritt 2: Lese JSON-Daten
function readJsonData() {
  console.log('\n📖 Lese JSON-Daten...');
  
  let courses = [];
  let stats = null;
  
  if (fs.existsSync(COURSES_FILE)) {
    const raw = fs.readFileSync(COURSES_FILE, 'utf-8');
    courses = JSON.parse(raw);
    console.log(`   ${courses.length} Elemente in courses.json gefunden`);
  }
  
  if (fs.existsSync(STATS_FILE)) {
    const raw = fs.readFileSync(STATS_FILE, 'utf-8');
    stats = JSON.parse(raw);
    console.log(`   Stats gefunden: ${JSON.stringify(stats).substring(0, 100)}...`);
  }
  
  return { courses, stats };
}

// Schritt 3: Erstelle Datenbank-Tabellen
function createTables(db: Database.Database) {
  console.log('\n🏗️  Erstelle Tabellen...');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS dashboard_items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('course', 'folder')),
      name TEXT NOT NULL,
      theme_color TEXT,
      parent_folder_id TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      
      -- Kurs-spezifisch (NULL für Ordner)
      units TEXT,
      course_progress TEXT,
      
      -- Ordner-spezifisch
      sort_order INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stars INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      last_activity TEXT,
      system_prompt TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    -- Erstelle Index für parent_folder_id für schnelle Folder-Abfragen
    CREATE INDEX IF NOT EXISTS idx_parent_folder ON dashboard_items(parent_folder_id);
  `);
  
  console.log('   ✅ Tabellen erstellt');
}

// Schritt 4: Migriere Daten
function migrateData(db: Database.Database, courses: any[], stats: any) {
  console.log('\n📥 Migriere Daten...');
  
  // Transaction starten für Atomarität!
  const insertItem = db.prepare(`
    INSERT OR REPLACE INTO dashboard_items 
    (id, type, name, theme_color, parent_folder_id, units, course_progress, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertStats = db.prepare(`
    INSERT OR REPLACE INTO user_stats 
    (id, stars, streak, last_activity, system_prompt)
    VALUES (1, ?, ?, ?, ?)
  `);
  
  // Alle Inserts in einer Transaction
  const migrateAll = db.transaction(() => {
    // Kurse und Ordner migrieren
    for (const item of courses) {
      const isCourse = item.type === 'course';
      
      insertItem.run(
        item.id,
        item.type || 'course',  // Fallback für alte Daten ohne type
        item.name || item.title || 'Unbenannt',  // Kompatibilität
        item.themeColor || null,
        item.parentFolderId || null,
        isCourse && item.units ? JSON.stringify(item.units) : null,
        isCourse && item.courseProgress ? JSON.stringify(item.courseProgress) : null,
        item.sortOrder || null
      );
      
      console.log(`   ✅ ${item.type || 'course'}: "${item.name || item.title}"`);
    }
    
    // Stats migrieren
    if (stats) {
      insertStats.run(
        stats.stars || 0,
        stats.streak || 0,
        stats.lastActivity || null,
        stats.systemPrompt || null
      );
      console.log('   ✅ User Stats migriert');
    }
  });
  
  migrateAll();
  
  console.log(`\n🎉 Migration abgeschlossen! ${courses.length} Elemente migriert.`);
}

// Schritt 5: Verifiziere Migration
function verifyMigration(db: Database.Database, originalCount: number) {
  console.log('\n🔍 Verifiziere Migration...');
  
  const dbCount = db.prepare('SELECT COUNT(*) as count FROM dashboard_items').get() as any;
  
  if (dbCount.count === originalCount) {
    console.log(`   ✅ Alle ${originalCount} Elemente erfolgreich migriert!`);
    return true;
  } else {
    console.error(`   ❌ FEHLER: Erwartet ${originalCount}, gefunden ${dbCount.count}`);
    return false;
  }
}

// HAUPTFUNKTION
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║         LERNPFAD JSON → SQLITE MIGRATION                  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  // Prüfe Voraussetzungen
  if (!checkJsonFilesExist()) {
    console.log('\n⚠️  Keine JSON-Dateien gefunden. Migration nicht nötig.');
    process.exit(0);
  }
  
  // Backup erstellen
  console.log('\n💾 Erstelle Backup...');
  if (fs.existsSync(COURSES_FILE)) {
    fs.copyFileSync(COURSES_FILE, `${COURSES_FILE}.backup-before-sqlite`);
    console.log('   ✅ courses.json gesichert');
  }
  if (fs.existsSync(STATS_FILE)) {
    fs.copyFileSync(STATS_FILE, `${STATS_FILE}.backup-before-sqlite`);
    console.log('   ✅ stats.json gesichert');
  }
  
  // Lese Daten
  const { courses, stats } = readJsonData();
  
  // Verbinde mit Datenbank (erstellt sie bei Bedarf)
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  
  // Erstelle Tabellen
  createTables(db);
  
  // Migriere Daten
  migrateData(db, courses, stats);
  
  // Verifiziere
  if (verifyMigration(db, courses.length)) {
    console.log('\n✅ ✅ ✅ MIGRATION ERFOLGREICH! ✅ ✅ ✅');
    console.log('\nDie JSON-Dateien wurden NICHT gelöscht (Sicherheit).');
    console.log('Du kannst sie manuell entfernen, wenn alles funktioniert.');
  } else {
    console.error('\n❌ MIGRATION FEHLGESCHLAGEN! JSON-Dateien wurden NICHT verändert.');
    process.exit(1);
  }
  
  db.close();
}

main().catch(console.error);
```

---

### 1.6 Dockerfile anpassen

**WICHTIG:** SQLite benötigt native Binaries, die im Alpine-Image kompiliert werden müssen.

**Ändere die `Dockerfile`:**

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# WICHTIG: Python und Build-Tools für native Module (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# WICHTIG: Auch hier brauchen wir Build-Tools für better-sqlite3
RUN apk add --no-cache wget python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY server.js ./
COPY server/ ./server/  # NEU: Server-Ordner kopieren

RUN mkdir -p /app/data && chown -R node:node /app/data

USER node

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# GEÄNDERT: Führe zuerst Migration aus, dann starte Server
CMD ["sh", "-c", "node server/db/migrate-from-json.js && node server.js"]
```

---

### 1.7 Server.js anpassen

**WICHTIG:** Der Server muss jetzt die SQLite-Datenbank statt JSON nutzen.

**Neuer `server.js`:**

```javascript
// server.js - NEUE VERSION MIT SQLITE
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Datenbank-Import
import { db } from './server/db/index.js';
import { dashboardItems, userStats } from './server/db/schema.js';
import { eq } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Static files
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
}

// ============ COURSES API ============

// GET all courses/folders
app.get('/api/courses', async (req, res) => {
    try {
        const items = await db.select().from(dashboardItems);
        
        // Konvertiere JSON-Strings zurück zu Objekten
        const formatted = items.map(item => ({
            ...item,
            units: item.units ? JSON.parse(item.units) : undefined,
            courseProgress: item.courseProgress ? JSON.parse(item.courseProgress) : undefined,
        }));
        
        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('GET /api/courses error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST save all courses (Bulk-Update)
app.post('/api/courses', async (req, res) => {
    try {
        const items = req.body;
        
        // Transaction: Lösche alle und füge neu ein
        // ACHTUNG: Das ist ein Kompromiss für Kompatibilität mit dem alten Frontend
        await db.transaction(async (tx) => {
            await tx.delete(dashboardItems);
            
            for (const item of items) {
                await tx.insert(dashboardItems).values({
                    id: item.id,
                    type: item.type || 'course',
                    name: item.name || item.title,
                    themeColor: item.themeColor,
                    parentFolderId: item.parentFolderId,
                    units: item.units ? JSON.stringify(item.units) : null,
                    courseProgress: item.courseProgress ? JSON.stringify(item.courseProgress) : null,
                    sortOrder: item.sortOrder,
                });
            }
        });
        
        res.json({ success: true, message: 'Courses saved' });
    } catch (error) {
        console.error('POST /api/courses error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE a specific course
app.delete('/api/courses/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        await db.delete(dashboardItems).where(eq(dashboardItems.id, courseId));
        
        const remaining = await db.select().from(dashboardItems);
        res.json({ success: true, data: remaining, message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST add a new course
app.post('/api/courses/add', async (req, res) => {
    try {
        const newItem = req.body;
        
        await db.insert(dashboardItems).values({
            id: newItem.id,
            type: newItem.type || 'course',
            name: newItem.name || newItem.title,
            themeColor: newItem.themeColor,
            parentFolderId: newItem.parentFolderId,
            units: newItem.units ? JSON.stringify(newItem.units) : null,
            courseProgress: newItem.courseProgress ? JSON.stringify(newItem.courseProgress) : null,
            sortOrder: newItem.sortOrder,
        });
        
        const all = await db.select().from(dashboardItems);
        res.json({ success: true, data: all, message: 'Course added' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST move items
app.post('/api/courses/move', async (req, res) => {
    try {
        const { itemIds, targetFolderId } = req.body;
        
        for (const id of itemIds) {
            await db.update(dashboardItems)
                .set({ parentFolderId: targetFolderId })
                .where(eq(dashboardItems.id, id));
        }
        
        const all = await db.select().from(dashboardItems);
        res.json({ success: true, data: all, message: 'Items moved' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ USER STATS API ============

app.get('/api/stats', async (req, res) => {
    try {
        const stats = await db.select().from(userStats).limit(1);
        res.json({ success: true, data: stats[0] || null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/stats', async (req, res) => {
    try {
        const newStats = req.body;
        
        // Upsert: Update wenn existiert, sonst Insert
        const existing = await db.select().from(userStats).limit(1);
        
        if (existing.length > 0) {
            await db.update(userStats)
                .set({
                    stars: newStats.stars,
                    streak: newStats.streak,
                    lastActivity: newStats.lastActivity,
                    systemPrompt: newStats.systemPrompt,
                })
                .where(eq(userStats.id, 1));
        } else {
            await db.insert(userStats).values({
                stars: newStats.stars || 0,
                streak: newStats.streak || 0,
                lastActivity: newStats.lastActivity,
                systemPrompt: newStats.systemPrompt,
            });
        }
        
        res.json({ success: true, message: 'Stats saved' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// ============ SPA FALLBACK ============
app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ success: false, message: 'API endpoint not found' });
    }
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('App not built. Run npm run build first.');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 LernPfad Server gestartet! (SQLite Backend)');
    console.log(`   URL: http://localhost:${PORT}`);
});
```

---

### 1.8 Deployment-Prozess (🚨 EXTREM KRITISCH!)

**SCHRITT-FÜR-SCHRITT Deployment:**

#### A) Lokal testen
```bash
# 1. Erstelle lokale Test-Daten
mkdir -p data
echo '[{"id":"test1","type":"course","name":"Test Kurs"}]' > data/courses.json
echo '{"stars":100,"streak":5}' > data/stats.json

# 2. Baue und starte lokal
npm run build
node server.js

# 3. Teste im Browser: http://localhost:3000
# 4. Prüfe ob die Daten angezeigt werden
```

#### B) Git vorbereiten
```bash
# Stelle sicher, dass die Datenbank NICHT gepusht wird
echo "data/*.db" >> .gitignore
echo "data/*.db-wal" >> .gitignore
echo "data/*.db-shm" >> .gitignore

git add .
git commit -m "feat: Migrate from JSON to SQLite database"
```

#### C) Deployment auf Coolify
```bash
# 1. BEVOR du pushst: SSH auf Server und sichere Daten (siehe 1.1)

# 2. Push den Code
git push origin main

# 3. Coolify wird automatisch neu deployen
# 4. Das Migrations-Script läuft automatisch beim Container-Start

# 5. SSH auf Server und verifiziere:
ssh [user]@[server]
docker logs lernpfad | tail -50
# Suche nach "MIGRATION ERFOLGREICH"
```

#### D) Rollback-Plan (falls etwas schiefgeht!)
```bash
# Auf dem Server:
# 1. Stoppe den Container
docker stop lernpfad

# 2. Stelle die JSON-Backups wieder her
docker cp ~/backup_courses_*.json lernpfad:/app/data/courses.json
docker cp ~/backup_stats_*.json lernpfad:/app/data/stats.json

# 3. Lösche die SQLite-Datenbank
docker exec lernpfad rm /app/data/lernpfad.db

# 4. Deploye alte Version von Git (revert commit)
cd /path/to/repo
git revert HEAD
git push origin main
```

---

## ✅ CHECKLISTE NACH SCHRITT 1

- [ ] Lokale Tests bestanden
- [ ] Backup der Coolify-Daten erstellt
- [ ] Code gepusht
- [ ] Migration erfolgreich gelaufen (Logs prüfen)
- [ ] App funktioniert auf Coolify
- [ ] Alte JSON-Dateien als Backup behalten

---

---

## SCHRITT 2: React Query für State Management (🟠 MITTEL)

### 2.1 Installation

```bash
npm install @tanstack/react-query
```

### 2.2 Query Client erstellen

**Neue Datei: `src/lib/queryClient.ts`**

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 Minuten Cache
      retry: 2,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### 2.3 App.tsx anpassen

```tsx
// src/App.tsx - NUR DEN IMPORT UND PROVIDER ÄNDERN
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Rest der App bleibt gleich */}
    </QueryClientProvider>
  );
}
```

### 2.4 Custom Hooks erstellen

**Neue Datei: `src/hooks/useCourses.ts`**

```typescript
// src/hooks/useCourses.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/api';
import { DashboardItem, Course, Folder } from '../types';

// Query Keys - IMMER als Konstanten definieren!
export const QUERY_KEYS = {
  courses: ['courses'] as const,
  stats: ['stats'] as const,
};

// Kurse laden
export function useCourses() {
  return useQuery({
    queryKey: QUERY_KEYS.courses,
    queryFn: api.loadCourses,
  });
}

// Kurs hinzufügen
export function useAddCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.addCourse,
    onSuccess: () => {
      // Cache invalidieren → automatischer Refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses });
    },
  });
}

// Kurs löschen
export function useDeleteCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.deleteCourse,
    // Optimistic Update für bessere UX
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.courses });
      
      const previous = queryClient.getQueryData<DashboardItem[]>(QUERY_KEYS.courses);
      
      queryClient.setQueryData<DashboardItem[]>(QUERY_KEYS.courses, (old) =>
        old?.filter((item) => item.id !== courseId)
      );
      
      return { previous };
    },
    onError: (err, courseId, context) => {
      // Bei Fehler: Rollback
      queryClient.setQueryData(QUERY_KEYS.courses, context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses });
    },
  });
}

// Kurse speichern (Bulk)
export function useSaveCourses() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.saveCourses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses });
    },
  });
}
```

### 2.5 Komponenten umstellen

**WICHTIG:** Stelle die Komponenten SCHRITTWEISE um, nicht alle auf einmal!

**Beispiel Dashboard.tsx vorher:**
```tsx
// ALT - mit Zustand Store
const { courses, isLoading, loadInitialData } = useAppStore();

useEffect(() => {
  loadInitialData();
}, []);
```

**Dashboard.tsx nachher:**
```tsx
// NEU - mit React Query
import { useCourses, useDeleteCourse } from '../hooks/useCourses';

function Dashboard() {
  const { data: courses, isLoading, error } = useCourses();
  const deleteMutation = useDeleteCourse();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };
  
  return (
    // ... Rest der Komponente
  );
}
```

---

## SCHRITT 3: Zod Validation (🟠 MITTEL)

### 3.1 Installation

```bash
npm install zod
```

### 3.2 Schemas definieren

**Neue Datei: `src/schemas/course.schema.ts`**

```typescript
// src/schemas/course.schema.ts
import { z } from 'zod';

// Verfügbare Theme Colors
export const themeColorSchema = z.enum([
  'brand-purple',
  'brand-blue', 
  'brand-green',
  'brand-orange',
  'brand-red',
  'brand-sky',
]);

// Level/Frage Schema
export const levelSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['quiz', 'flashcard', 'theory', 'summary']),
  question: z.string().optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.number().optional(),
  content: z.string().optional(),
});

// Unit Schema
export const unitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Unit Name ist erforderlich'),
  themeColor: themeColorSchema.optional(),
  levels: z.array(levelSchema),
});

// Kurs Schema
export const courseSchema = z.object({
  id: z.string().min(1),
  type: z.literal('course'),
  name: z.string().min(1, 'Kursname ist erforderlich'),
  themeColor: themeColorSchema,
  parentFolderId: z.string().nullable().optional(),
  units: z.array(unitSchema),
  courseProgress: z.object({
    currentUnit: z.number(),
    currentLevel: z.number(),
    unlockedLevels: z.record(z.number()),
    completedLevels: z.record(z.array(z.number())),
  }).optional(),
});

// Ordner Schema  
export const folderSchema = z.object({
  id: z.string().min(1),
  type: z.literal('folder'),
  name: z.string().min(1, 'Ordnername ist erforderlich'),
  themeColor: themeColorSchema.optional(),
  parentFolderId: z.string().nullable().optional(),
});

// Dashboard Item = Kurs ODER Ordner
export const dashboardItemSchema = z.discriminatedUnion('type', [
  courseSchema,
  folderSchema,
]);

// Type Exports (aus Zod generiert!)
export type ThemeColor = z.infer<typeof themeColorSchema>;
export type Level = z.infer<typeof levelSchema>;
export type Unit = z.infer<typeof unitSchema>;
export type Course = z.infer<typeof courseSchema>;
export type Folder = z.infer<typeof folderSchema>;
export type DashboardItem = z.infer<typeof dashboardItemSchema>;
```

### 3.3 Server-Validation

**In `server.js` bei den POST-Endpoints:**

```javascript
import { z } from 'zod';

// Schema für neuen Kurs
const newCourseSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['course', 'folder']),
  name: z.string().min(1),
  themeColor: z.string().optional(),
  // ... weitere Felder
});

app.post('/api/courses/add', async (req, res) => {
  try {
    // Validiere zuerst!
    const result = newCourseSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: result.error.issues 
      });
    }
    
    // Jetzt mit validierten Daten weitermachen
    const newItem = result.data;
    // ... Rest der Logik
  } catch (error) {
    // ...
  }
});
```

---

## SCHRITT 4: CI/CD Pipeline (🟠 MITTEL)

### 4.1 GitHub Actions erstellen

**Neue Datei: `.github/workflows/ci.yml`**

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  # Job 1: Lint und Type-Check
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run TypeScript check
        run: npx tsc --noEmit
        
      # Optional: ESLint wenn konfiguriert
      # - name: Run ESLint
      #   run: npm run lint

  # Job 2: Tests
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
  # Job 3: Build
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [lint, test]  # Wartet auf lint und test
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7

  # Job 4: Deploy (nur auf main)
  deploy:
    name: Deploy to Coolify
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - name: Trigger Coolify Webhook
        run: |
          curl -X POST "${{ secrets.COOLIFY_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            --fail
```

### 4.2 Secrets in GitHub konfigurieren

**Gehe zu: GitHub Repo → Settings → Secrets → Actions**

Füge hinzu:
- `COOLIFY_WEBHOOK_URL` - Die Webhook-URL von Coolify (findest du in den Coolify-Settings deiner App)

---

## SCHRITT 5: Strukturiertes Logging (🟡 OPTIONAL)

### 5.1 Installation

```bash
npm install pino pino-pretty
```

### 5.2 Logger erstellen

**Neue Datei: `server/lib/logger.js`**

```javascript
// server/lib/logger.js
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  transport: isDev ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    },
  } : undefined,
});

// Request Logger Middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  
  next();
};
```

### 5.3 In Server einbinden

```javascript
// server.js
import { logger, requestLogger } from './server/lib/logger.js';

app.use(requestLogger);

// Statt console.log:
logger.info('Server gestartet');
logger.error({ err: error }, 'Datenbankfehler');
```

---

# 🎯 ZUSAMMENFASSUNG: KRITISCHE REGELN

1. **IMMER BACKUP ZUERST** - Bevor du IRGENDETWAS auf Production änderst
2. **TESTEN, TESTEN, TESTEN** - Lokal alles durchspielen bevor du pushst
3. **TRANSACTIONS NUTZEN** - Bei Datenbank-Änderungen immer Transactions
4. **ROLLBACK-PLAN HABEN** - Wissen wie man zurückrollt wenn etwas schiefgeht
5. **LOGS PRÜFEN** - Nach jedem Deployment die Container-Logs checken
6. **INKREMENTELL ÄNDERN** - Nicht alles auf einmal, Schritt für Schritt
7. **GITIGNORE BEACHTEN** - `data/` Ordner darf NIEMALS gepusht werden

---

# 📞 HILFE WENN ETWAS SCHIEFGEHT

Falls die App nach einem Deployment nicht mehr funktioniert:

1. **Sofort Logs checken**: `docker logs lernpfad`
2. **Health-Endpoint testen**: `curl http://[server]/api/health`
3. **Backup wiederherstellen** (siehe Rollback-Plan)
4. **NICHT panisch weitere Änderungen machen** - erst verstehen was schief ging

---

*Erstellt am: 2026-01-07*
*Für: Gemini 3 Pro*
*Von: Senior Developer*
