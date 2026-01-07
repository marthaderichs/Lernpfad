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
      
      -- Felder die im Frontend erwartet werden
      icon TEXT,
      professor TEXT,
      total_progress INTEGER DEFAULT 0,
      title_pt TEXT,
      
      -- Kurs-spezifisch (NULL für Ordner)
      units TEXT,
      course_progress TEXT,
      
      -- Ordner-spezifisch
      sort_order INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      
      total_xp INTEGER DEFAULT 0,
      coins INTEGER DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      last_study_date TEXT,
      purchased_items TEXT DEFAULT '[]',
      active_avatar TEXT DEFAULT '🦸',
      dark_mode INTEGER DEFAULT 0, -- Boolean 0/1
      
      system_prompt TEXT,
      
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    -- Erstelle Index für parent_folder_id für schnelle Folder-Abfragen
    CREATE INDEX IF NOT EXISTS idx_parent_folder ON dashboard_items(parent_folder_id);
  `);

  console.log('   ✅ Tabellen erstellt (oder existieren bereits)');
}

// Schritt 4: Migriere Daten
function migrateData(db: Database.Database, courses: any[], stats: any) {
  console.log('\n📥 Migriere Daten...');

  // Transaction starten für Atomarität!
  const insertItem = db.prepare(`
    INSERT OR REPLACE INTO dashboard_items 
    (id, type, name, theme_color, parent_folder_id, icon, professor, total_progress, title_pt, units, course_progress, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertStats = db.prepare(`
    INSERT OR REPLACE INTO user_stats 
    (id, total_xp, coins, current_streak, last_study_date, purchased_items, active_avatar, dark_mode, system_prompt)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Alle Inserts in einer Transaction
  const migrateAll = db.transaction(() => {
    // Kurse und Ordner migrieren
    for (const item of courses) {
      const isCourse = item.type === 'course' || !item.type; // Fallback für alte Daten

      insertItem.run(
        item.id,
        item.type || 'course',  // Fallback für alte Daten ohne type
        item.name || item.title || 'Unbenannt',  // Kompatibilität: name oder title
        item.themeColor || null,
        item.parentFolderId || null,
        item.icon || '📚',  // Icon/Emoji - Default falls nicht vorhanden
        item.professor || null,  // Professor (nur für Kurse)
        item.totalProgress || 0,  // Fortschritt (nur für Kurse)
        item.titlePT || item.titlePt || null,  // Portugiesischer Titel
        isCourse && item.units ? JSON.stringify(item.units) : null,
        isCourse && item.courseProgress ? JSON.stringify(item.courseProgress) : null,
        item.sortOrder || null
      );

      console.log(`   ✅ ${item.type || 'course'}: "${item.name || item.title}" (${item.icon || '📚'})`);
    }

    // Stats migrieren mit Mapping
    if (stats) {
      insertStats.run(
        stats.stars || 0, // MAP: stars -> total_xp
        stats.coins || 0, // New field, default 0
        stats.streak || 0, // MAP: streak -> current_streak
        stats.lastActivity || null, // MAP: lastActivity -> last_study_date
        JSON.stringify(stats.purchasedItems || []), // New field, default []
        stats.activeAvatar || '🦸', // New field, default emoji
        stats.darkMode ? 1 : 0, // New field, map boolean to int
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

  // Idempotenz-Check: Wenn DB existiert und Daten hat, abbrechen
  if (fs.existsSync(DB_PATH)) {
    const db = new Database(DB_PATH);
    try {
      const hasData = db.prepare("SELECT count(*) as c FROM sqlite_master WHERE type='table' AND name='dashboard_items'").get() as any;
      if (hasData.c > 0) {
        const count = db.prepare('SELECT count(*) as c FROM dashboard_items').get() as any;
        if (count.c > 0) {
          console.log('⚠️  Datenbank existiert bereits und enthält Daten. Migration übersprungen.');
          db.close();
          process.exit(0);
        }
      }
    } catch (e) {
      // Tabelle existiert vermutlich noch nicht, weitermachen
    }
    db.close();
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