// server/db/migrate-from-json.ts
// DIESES SCRIPT MIGRIERT DIE BESTEHENDEN JSON-DATEN IN DIE SQLITE-DATENBANK!

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { initDb } from './init.js'; // Use shared init logic

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
      
      console.log(`   ✅ ${item.type || 'course'}: "${item.name || item.title}"`);
    }
    
    // Stats migrieren mit Mapping
    if (stats) {
      insertStats.run(
        stats.totalXp ?? stats.stars ?? 0, // MAP: stars -> total_xp
        stats.coins ?? 0,
        stats.currentStreak ?? stats.streak ?? 0, // MAP: streak -> current_streak
        stats.lastStudyDate ?? stats.lastActivity ?? null, // MAP: lastActivity -> last_study_date
        JSON.stringify(stats.purchasedItems ?? []),
        stats.activeAvatar ?? '🦸',
        stats.darkMode ? 1 : 0,
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
          const hasTable = db.prepare("SELECT count(*) as c FROM sqlite_master WHERE type='table' AND name='dashboard_items'").get() as any;
          if (hasTable.c > 0) {
               const count = db.prepare('SELECT count(*) as c FROM dashboard_items').get() as any;
               if (count.c > 0) {
                   console.log('ℹ️  Datenbank enthält bereits Daten. Import übersprungen.');
                   db.close();
                   process.exit(0);
               }
          }
      } catch (e) {
          // Tabelle existiert vermutlich noch nicht
      }
      db.close();
  }

  // Prüfe Voraussetzungen
  if (!checkJsonFilesExist()) {
    console.log('\n⚠️  Keine courses.json gefunden. Import nicht möglich.');
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
  
  // Verbinde mit Datenbank
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  
  // Erstelle Tabellen (Nutzung der Shared Logic)
  // Wir nutzen initDb nicht direkt, da es `sqlite` importiert, was eine Verbindung öffnet.
  // Wir wollen hier explizit die `db` Instanz nutzen.
  // Aber initDb nutzt `sqlite` vom index.js.
  // Das ist ok, es wird dieselbe DB sein.
  initDb();
  
  // Migriere Daten
  migrateData(db, courses, stats);
  
  // Verifiziere
  if (verifyMigration(db, courses.length)) {
    console.log('\n✅ ✅ ✅ IMPORT ERFOLGREICH! ✅ ✅ ✅');
  } else {
    console.error('\n❌ IMPORT FEHLGESCHLAGEN!');
    process.exit(1);
  }
  
  db.close();
}

main().catch(console.error);
