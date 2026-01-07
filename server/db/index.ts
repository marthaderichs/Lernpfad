import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import path from 'path';

// WICHTIG: Pfad zur Datenbank im DATA_DIR!
// Fallback auf ./data für lokale Entwicklung
const DATA_DIR = process.env.DATA_DIR || './data';
const DB_PATH = path.join(DATA_DIR, 'lernpfad.db');

// Stelle sicher, dass das Verzeichnis existiert (wichtig für den ersten Start)
import fs from 'fs';
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Erstelle SQLite Verbindung
const sqlite = new Database(DB_PATH);

// Aktiviere WAL-Modus für bessere Performance
sqlite.pragma('journal_mode = WAL');

// Erstelle Drizzle-Instanz
export const db = drizzle(sqlite, { schema });

// Exportiere auch die rohe SQLite-Verbindung für Migrations
export { sqlite };
