# Implementation Plan - Backend Migration to SQLite

## Phase 1: Setup & Dependencies
- [x] Task: Install Dependencies [452d9bb]
    - Install `better-sqlite3`, `drizzle-orm` as dependencies.
    - Install `drizzle-kit`, `@types/better-sqlite3` as dev dependencies.
- [ ] Task: Update `.gitignore`
    - Add `data/*.db`, `data/*.db-wal`, `data/*.db-shm` to prevent SQLite files from being committed.
- [ ] Task: Docker Configuration
    - Update `Dockerfile` to include build tools (python3, make, g++) for `better-sqlite3`.
    - Ensure `Dockerfile` exposes `DATA_DIR` environment variable.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Setup & Dependencies' (Protocol in workflow.md)

## Phase 2: Database Layer Implementation
- [ ] Task: Define Database Schema (`server/db/schema.ts`)
    - Define `dashboard_items` table (id, type, name, themeColor, parentFolderId, units, courseProgress, sortOrder, timestamps).
    - Define `user_stats` table (id, stars, streak, lastActivity, systemPrompt, timestamps).
- [ ] Task: Database Connection (`server/db/index.ts`)
    - Implement SQLite connection using `better-sqlite3`.
    - Enable WAL mode.
    - Initialize Drizzle ORM instance.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Database Layer Implementation' (Protocol in workflow.md)

## Phase 3: Migration Logic
- [ ] Task: Create Migration Script (`server/db/migrate-from-json.ts`)
    - Implement logic to check for existing JSON files.
    - Implement `createTables` function (using raw SQL or Drizzle).
    - Implement `migrateData` function with transaction support.
    - Implement verification step (count comparison).
    - Add backup logic (copy `.json` to `.json.backup-before-sqlite`).
- [ ] Task: Test Migration Script
    - Create a test utility to generate dummy `courses.json` and `stats.json`.
    - Run migration script locally.
    - Verify data in `lernpfad.db` using Drizzle or raw SQL queries.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Migration Logic' (Protocol in workflow.md)

## Phase 4: API Refactoring
- [ ] Task: Refactor Server Entry Point (`server.js`)
    - Import DB connection and schema.
    - Remove old file-based I/O functions.
- [ ] Task: Refactor Course Endpoints
    - `GET /api/courses`: Select from `dashboard_items` and parse JSON fields.
    - `POST /api/courses`: Transactional delete + insert (bulk update).
    - `DELETE /api/courses/:id`: Delete by ID.
    - `POST /api/courses/add`: Insert single item.
    - `POST /api/courses/move`: Update `parentFolderId`.
- [ ] Task: Refactor Stats Endpoints
    - `GET /api/stats`: Select from `user_stats`.
    - `POST /api/stats`: Upsert logic for `user_stats`.
- [ ] Task: Integrate Migration on Startup
    - Update `Dockerfile` CMD to run migration before server: `CMD ["sh", "-c", "node server/db/migrate-from-json.js && node server.js"]`
    - Alternative: Import and run migration at top of `server.js` (synchronous).
- [ ] Task: Conductor - User Manual Verification 'Phase 4: API Refactoring' (Protocol in workflow.md)

## Phase 5: Verification & Cleanup
- [ ] Task: Full System Test
    - Start application locally.
    - Verify frontend loads data correctly.
    - Create a new course (verify persistence).
    - **Test JSON Import**: Open AiImportModal, paste valid course JSON, verify it saves to SQLite.
    - Update stats (verify persistence).
    - Restart server (verify data retention).
- [ ] Task: Document Rollback Procedure
    - Note: If issues arise, revert server.js to use JSON files, delete `lernpfad.db`.
- [ ] Task: Documentation
    - Update `README.md` or `PROJEKT_ANALYSE.md` with new DB info.
    - Document how to access the SQLite DB for debugging.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Verification & Cleanup' (Protocol in workflow.md)
