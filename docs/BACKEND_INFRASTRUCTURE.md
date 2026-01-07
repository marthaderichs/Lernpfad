# Backend Infrastructure (SQLite)

Das Projekt wurde von einer JSON-Datei-basierten Speicherung auf **SQLite** migriert (Jan 2026), um die Datenintegrität und Performance zu verbessern.

## Architektur
*   **Datenbank:** SQLite (`data/lernpfad.db`)
*   **ORM:** Drizzle ORM
*   **Driver:** `better-sqlite3`
*   **Mode:** WAL (Write-Ahead Logging) aktiviert für bessere Concurrency.

## Migration (Wichtig für Deployment!)
Beim Start des Servers (bzw. Containers) wird automatisch das Skript `server/db/migrate-from-json.ts` ausgeführt.
Dieses Skript:
1.  Prüft, ob `courses.json` und `stats.json` existieren.
2.  Erstellt Backups (`.backup-before-sqlite`).
3.  Erstellt die SQLite-Tabellen (`dashboard_items`, `user_stats`).
4.  Importiert alle Daten in die Datenbank.
5.  Verifiziert den Erfolg.

## Rollback Procedure (Notfallplan)
Sollte die SQLite-Migration kritische Fehler verursachen, kann wie folgt zurückgerollt werden:

1.  **Server stoppen.**
2.  **Code revertieren:** `git revert` auf den Commit vor der Migration (`chore: Add SQLite files to .gitignore` oder früher).
3.  **Daten wiederherstellen:**
    *   Die SQLite-Datenbank (`data/lernpfad.db`) löschen oder umbenennen.
    *   Die Backup-Dateien wiederherstellen:
        ```bash
        mv data/courses.json.backup-before-sqlite data/courses.json
        mv data/stats.json.backup-before-sqlite data/stats.json
        ```
4.  **Server neu starten:** Der alte Code nutzt wieder die JSON-Dateien.

## Debugging
Um lokal in die Datenbank zu schauen:
1.  Installiere ein Tool wie "DB Browser for SQLite".
2.  Öffne `data/lernpfad.db`.
