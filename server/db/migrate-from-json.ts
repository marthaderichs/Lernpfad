// server/db/migrate-from-json.ts
// DIESES SCRIPT MIGRIERT DIE BESTEHENDEN JSON-DATEN IN DIE SQLITE-DATENBANK!

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Verwende DATA_DIR aus Environment oder Fallback auf lokales ./data
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
    console.log(`   Stats gefunden`);
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
      const isCourse = item.type === 'course' || !item.type; // Fallback für alte Daten
      
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
  
  // Stelle sicher, dass data directory existiert
  if (!fs.existsSync(DATA_DIR)) {
      console.log(`Verzeichnis ${DATA_DIR} existiert nicht. Erstelle es...`);
      fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Prüfe Voraussetzungen
  if (!checkJsonFilesExist()) {
    console.log('\n⚠️  Keine courses.json gefunden. Migration nicht nötig (oder nicht möglich).');
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
  } else {
    console.error('\n❌ MIGRATION FEHLGESCHLAGEN! JSON-Dateien wurden NICHT verändert.');
    process.exit(1);
  }
  
  db.close();
}

main().catch(console.error);
