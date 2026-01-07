# Specification: Backend Migration to SQLite

## Overview
This track involves migrating the "LernPfad AI" backend from a file-based JSON storage system to a robust SQLite database using `better-sqlite3` and `drizzle-orm`. This is a critical infrastructure change to improve performance, data integrity, and future-proof the application's architecture.

## Functional Requirements
- **Database Schema:** Implement a schema in `server/db/schema.ts` that mirrors the current `courses.json` and `stats.json` structures.
- **Data Migration:** Create a robust migration script (`server/db/migrate-from-json.ts`) that:
    - Verifies existing JSON data.
    - Creates necessary SQLite tables if they don't exist.
    - Atomically migrates data from JSON to SQLite using transactions.
    - Verifies the integrity of migrated data.
    - Keeps original JSON files as backups.
- **API Update:** Refactor `server.js` to perform CRUD operations against the SQLite database using Drizzle ORM instead of synchronous JSON file I/O.
- **Docker Integration:** Update `Dockerfile` to include necessary build tools for native SQLite bindings and to run the migration script on container startup.
- **Deployment Safety:** Update deployment instructions and documentation to ensure production data is backed up before migration.

## Non-Functional Requirements
- **Performance:** Utilize WAL (Write-Ahead Logging) mode in SQLite for improved concurrent performance.
- **Safety:** Use transactions for all database modifications to prevent data corruption.
- **Reliability:** The migration script must be idempotent (safe to run multiple times).
- **Backwards Compatibility:** API request/response format must remain unchanged to avoid frontend modifications.

## Acceptance Criteria
- [ ] `better-sqlite3` and `drizzle-orm` are successfully installed and configured.
- [ ] Database schema is defined and matches existing data structures.
- [ ] Migration script successfully transfers all courses and user stats from local JSON to `lernpfad.db`.
- [ ] Migration script verifies record count matches after migration.
- [ ] JSON Import (AiImportModal) works correctly with new backend.
- [ ] All API endpoints (`/api/courses`, `/api/stats`, etc.) are functional and powered by SQLite.
- [ ] `Dockerfile` successfully builds and starts the application with the new backend.
- [ ] The application remains fully functional with no regressions in features.

## Out of Scope
- Migrating the frontend to React Query (this is a separate step in the larger migration plan).
- Adding new features beyond the infrastructure migration.
- Server-side SSH/Backup operations (user responsibility before deployment).
- CI/CD Pipeline (GitHub Actions) - separate migration step.
