<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LernPfad AI

Eine interaktive Lernplattform mit AI-Unterstützung.

## 🚀 Schnellstart

### Lokal entwickeln

**Voraussetzungen:** Node.js >= 18

```bash
# Dependencies installieren
npm install

# Backend-Server starten (Port 3000) - Startet auch Migrationen!
npm run dev:server

# Frontend-Dev-Server starten (in separatem Terminal)
npm run dev

# Oder beides zusammen:
npm run dev:all
```

### Mit Docker

```bash
# Container bauen und starten
docker-compose up -d

# Logs anschauen (WICHTIG: Prüfe hier auf erfolgreiche Migration!)
docker-compose logs -f

# Stoppen
docker-compose down
```

## 🌐 Deployment mit Coolify

### Automatisches Deployment

1. **Repository verbinden** - Füge dein GitHub Repository in Coolify hinzu
2. **Dockerfile auswählen** - Coolify erkennt das Dockerfile automatisch
3. **Port konfigurieren** - Stelle sicher, dass Port `3000` exposed ist
4. **Volume für Daten** - Füge ein persistentes Volume für `/app/data` hinzu
5. **Deploy!** - Beim ersten Start werden existierende JSON-Dateien automatisch migriert.

### Wichtige Einstellungen für Coolify

| Einstellung | Wert |
|-------------|------|
| Port | `3000` |
| Health Check Path | `/api/health` |
| Data Volume | `/app/data` |

### Umgebungsvariablen (optional)

```
NODE_ENV=production
PORT=3000
DATA_DIR=/app/data
GEMINI_API_KEY=dein-api-key  # Optional, für AI-Features
```

## 📁 Projektstruktur

```
├── App.tsx           # Haupt-React-Komponente
├── server.js         # Express Backend Server (nutzt server/db/*)
├── Dockerfile        # Multi-stage Docker Build mit SQLite Support
├── docker-compose.yaml
├── components/       # React Komponenten
├── services/         # API Services
├── server/
│   └── db/           # Datenbank-Logik (Schema, Migration, Connection)
└── data/             # Persistente Daten (SQLite DB: lernpfad.db)
```

## 💾 Datenbank & Migration

Seit Januar 2026 nutzt das Projekt **SQLite** statt JSON-Dateien.

*   **Migration:** Erfolgt automatisch beim Server-Start (`server/db/migrate-from-json.ts`).
*   **Backups:** JSON-Dateien werden vor der Migration als `.backup-before-sqlite` gesichert.
*   **Details:** Siehe [docs/BACKEND_INFRASTRUCTURE.md](docs/BACKEND_INFRASTRUCTURE.md).

## 🔧 API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/health` | GET | Health Check |
| `/api/courses` | GET | Alle Kurse laden |
| `/api/courses` | POST | Alle Kurse speichern (Bulk) |
| `/api/courses/add` | POST | Neuen Kurs hinzufügen |
| `/api/courses/move` | POST | Items verschieben |
| `/api/courses/:id` | DELETE | Kurs löschen |
| `/api/stats` | GET | User-Statistiken laden |
| `/api/stats` | POST | User-Statistiken speichern |

## 📝 Lizenz

MIT