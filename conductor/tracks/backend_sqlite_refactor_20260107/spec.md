# Specification: SQLite Backend Refactoring & Fixes

## Overview
This track addresses critical data integrity issues and code quality improvements identified in the initial SQLite migration. The primary goals are to align the database schema with the frontend `UserStats` interface, enforce DRY principles, and ensure robust JSON handling.

## Functional Requirements
- **Schema Synchronization (`server/db/schema.ts`):**
    - Update `user_stats` table to match `src/types/index.ts` exactly.
    - **Add Fields:** `totalXp`, `coins`, `purchasedItems` (JSON text), `activeAvatar`, `darkMode` (integer boolean).
    - **Rename Fields:** `streak` -> `currentStreak`, `lastActivity` -> `lastStudyDate`.
    - **Remove:** Drizzle `{ mode: 'json' }` from text fields to opt for manual control.
- **Migration Update:** Update `server/db/migrate-from-json.ts` to map legacy JSON fields to the new schema column names.
    - Map `stars` (old) -> `totalXp` (new) if applicable.
    - Provide sensible defaults for completely new fields (`coins: 0`, `purchasedItems: []`, `activeAvatar: '🦸'`, `darkMode: false`).
- **API Refactoring (`server.js`):**
    - **Upsert Logic:** Update `/api/stats` to use `onConflictDoUpdate` (if supported) or the current check-then-update logic with the NEW field names.
    - **Helper Function:** Implement `formatItem(item)` to centralize JSON parsing logic and reuse it across all 4 endpoints.
    - **Timestamps:** Ensure `updatedAt` is manually set to `new Date()` on every update operation.
- **Migration Safety:** Update `migrate-from-json.ts` to check if the database is already populated before running.

## Non-Functional Requirements
- **Data Integrity:** The backend `UserStats` model must be a 100% match with the Frontend type definition.
- **Code Maintainability:** Reduce code duplication via helper functions.
- **Predictability:** Use manual JSON parsing/stringifying to avoid "magic" behavior from ORM layers.

## Acceptance Criteria
- [ ] `server/db/schema.ts` accurately reflects the `UserStats` interface.
- [ ] `migrate-from-json.ts` correctly maps old data to the new schema fields.
- [ ] Migration script handles missing/legacy fields gracefully with default values.
- [ ] `server.js` uses `formatItem` helper for all response formatting.
- [ ] `server.js` manually handles JSON parsing/stringifying (no `mode: 'json'` in schema).
- [ ] Updating a course or stats record updates the `updatedAt` timestamp.
- [ ] Running the migration script on a populated DB does nothing (idempotency).
- [ ] API endpoints `/api/stats` and `/api/courses` work correctly with the new schema.

## Out of Scope
- Frontend changes (Frontend types should remain as the source of truth).
