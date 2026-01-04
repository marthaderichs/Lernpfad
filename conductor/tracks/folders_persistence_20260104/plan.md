# Implementation Plan: Nested Folders and Persistence

This plan outlines the steps to implement nested folders for course organization with backend persistence.

## Phase 1: Data Model & Backend Updates
Goal: Update the data structure and ensure the backend can handle nested folders.

- [~] Task: Define the new `Folder` type and update `Course` type in `src/types/index.ts`.
- [ ] Task: Create a migration utility or manual update for `data/courses.json` to support the new structure.
- [ ] Task: Write tests for backend data validation (ensure folders are correctly parsed/saved).
- [ ] Task: Update `server.js` if necessary to handle deep nesting or specific folder API endpoints.
- [ ] Task: Conductor - User Manual Verification 'Data Model & Backend Updates' (Protocol in workflow.md)

## Phase 2: Frontend State (Zustand)
Goal: Update the global store to manage folder navigation and structure.

- [ ] Task: Write tests for `useAppStore` folder actions (addFolder, moveItem, etc.).
- [ ] Task: Implement `addFolder` and `deleteFolder` actions in `useAppStore.ts`.
- [ ] Task: Implement folder navigation state (current folder context) in `useAppStore.ts`.
- [ ] Task: Conductor - User Manual Verification 'Frontend State' (Protocol in workflow.md)

## Phase 3: Dashboard UI & Folder Navigation
Goal: Render folders on the dashboard and allow users to enter them.

- [ ] Task: Create `FolderCard` component based on existing `CourseCard` styling.
- [ ] Task: Update `Dashboard.tsx` to render both courses and folders.
- [ ] Task: Implement "Sub-Dashboard" view logic (filtering display items by `parentFolderId`).
- [ ] Task: Add breadcrumbs or a "Back" button for navigating out of folders.
- [ ] Task: Conductor - User Manual Verification 'Dashboard UI & Folder Navigation' (Protocol in workflow.md)

## Phase 4: Reordering & Organization (Edit Mode)
Goal: Allow users to move courses and folders.

- [ ] Task: Implement "Edit Mode" toggles for folder creation.
- [ ] Task: Implement reordering logic (up/down or drag-and-drop) for courses and folders.
- [ ] Task: Implement "Move to Folder" functionality.
- [ ] Task: Ensure all changes are persisted back to the backend on update.
- [ ] Task: Conductor - User Manual Verification 'Reordering & Organization' (Protocol in workflow.md)
