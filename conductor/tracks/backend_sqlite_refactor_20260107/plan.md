# Implementation Plan - SQLite Backend Refactoring & Fixes

## Phase 1: Database Schema & Migration Update [checkpoint: 90cdde9]
- [x] Task: Update Database Schema (`server/db/schema.ts`) [cbe29f1]
    - Update `dashboard_items`: Remove `mode: 'json'` from `units` and `courseProgress`.
    - Update `user_stats`:
        - Rename `streak` -> `currentStreak`.
        - Rename `lastActivity` -> `lastStudyDate`.
        - Add `totalXp`, `coins`, `purchasedItems` (text), `activeAvatar`, `darkMode` (integer).
- [x] Task: Update Migration Script (`server/db/migrate-from-json.ts`) [e7550bf]
    - Add idempotency check (exit if DB has data).
    - Update `createTables` SQL to match new schema.
    - Update `migrateData` to map legacy fields:
        - `stars` -> `totalXp`
        - `streak` -> `currentStreak`
        - `lastActivity` -> `lastStudyDate`
    - Add default values for new fields (`coins`, `purchasedItems`, `activeAvatar`, `darkMode`).
- [~] Task: Test Migration Logic
    - Create/update `test-migration.ts` to include checks for new fields and default values.
    - Verify data mapping is correct.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Database Schema & Migration Update' (Protocol in workflow.md)

## Phase 2: API & Logic Refactoring [checkpoint: fb7f6da]
- [x] Task: Implement `formatItem` Helper (`server.js`) [6e62769]
    - Create `const formatItem = (item) => ...` to handle JSON parsing.
    - Replace duplicated parsing logic in all endpoints.
- [x] Task: Update Stats Endpoints (`server.js`) [6e62769]
    - Update GET/POST `/api/stats` to use new field names.
    - Ensure `updatedAt` is updated on changes.
    - Implement defaults for missing fields in POST requests.
- [x] Task: Update Course Endpoints (`server.js`) [6e62769]
    - Remove manual `JSON.stringify` if `formatItem` handles it? (No, `formatItem` is for output. Need to check input handling).
    - Ensure `updatedAt` is updated on `POST /api/courses` and `POST /api/courses/add`.
    - Use manual `JSON.stringify` for DB inserts (since `mode: 'json'` is removed).
- [~] Task: Conductor - User Manual Verification 'Phase 2: API & Logic Refactoring' (Protocol in workflow.md)

## Phase 3: Verification & Cleanup
- [x] Task: Full API Verification [84bdd1b]
    - Verify all endpoints (`/api/stats`, `/api/courses` etc.) with `curl`.
    - Check that `UserStats` returned matches the frontend interface exactly.
- [x] Task: Clean up [1c834b0]
    - Remove temporary test files.
    - Delete the old `data/lernpfad.db` (locally) to force a fresh migration test.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Verification & Cleanup' (Protocol in workflow.md)