import { sqlite } from './index.js';

export function initDb() {
  console.log('🏗️  Initialisiere Datenbank-Tabellen...');

  // Erstelle Tabellen falls sie nicht existieren
  sqlite.exec(`
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
      dark_mode INTEGER DEFAULT 0,
      
      system_prompt TEXT,
      
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    CREATE INDEX IF NOT EXISTS idx_parent_folder ON dashboard_items(parent_folder_id);
  `);

  // Prüfe auf fehlende Spalten (Schema Migration)
  const alterStatements = [
    "ALTER TABLE dashboard_items ADD COLUMN icon TEXT",
    "ALTER TABLE dashboard_items ADD COLUMN professor TEXT",
    "ALTER TABLE dashboard_items ADD COLUMN total_progress INTEGER DEFAULT 0",
    "ALTER TABLE dashboard_items ADD COLUMN title_pt TEXT",
    "ALTER TABLE user_stats ADD COLUMN total_xp INTEGER DEFAULT 0",
    "ALTER TABLE user_stats ADD COLUMN coins INTEGER DEFAULT 0",
    "ALTER TABLE user_stats ADD COLUMN current_streak INTEGER DEFAULT 0",
    "ALTER TABLE user_stats ADD COLUMN last_study_date TEXT",
    "ALTER TABLE user_stats ADD COLUMN purchased_items TEXT DEFAULT '[]'",
    "ALTER TABLE user_stats ADD COLUMN active_avatar TEXT DEFAULT '🦸'",
    "ALTER TABLE user_stats ADD COLUMN dark_mode INTEGER DEFAULT 0",
  ];

  let updates = 0;
  for (const stmt of alterStatements) {
    try {
      sqlite.exec(stmt);
      // console.log(`   ✅ Spalte hinzugefügt: ${stmt.split('ADD COLUMN ')[1]?.split(' ')[0]}`);
      updates++;
    } catch (e: any) {
      // "duplicate column name" ist erwartet
    }
  }
  
  if (updates > 0) {
      console.log(`   ✅ ${updates} Schema-Updates durchgeführt.`);
  } else {
      console.log('   ✅ Tabellen sind aktuell.');
  }
}
