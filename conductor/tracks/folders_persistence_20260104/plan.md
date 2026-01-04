# Implementation Plan: Nested Folders and Persistence

This plan outlines the steps to implement nested folders for course organization with backend persistence.

## Phase 1: Data Model & Backend Updates
Goal: Update the data structure and ensure the backend can handle nested folders.

- [x] Task: Define the new `Folder` type and update `Course` type in `src/types/index.ts`. 399ab13
- [x] Task: Create a migration utility or manual update for `data/courses.json` to support the new structure. 399ab13
- [x] Task: Write tests for backend data validation (ensure folders are correctly parsed/saved). 399ab13
- [x] Task: Update `server.js` if necessary to handle deep nesting or specific folder API endpoints. 399ab13
- [x] Task: Conductor - User Manual Verification 'Data Model & Backend Updates' (Protocol in workflow.md) 399ab13

## Phase 2: Frontend State (Zustand)
Goal: Update the global store to manage folder navigation and structure.

- [x] Task: Write tests for `useAppStore` folder actions (addFolder, moveItem, etc.). 544c02a
- [x] Task: Implement `addFolder` and `deleteFolder` actions in `useAppStore.ts`. 544c02a
- [x] Task: Implement folder navigation state (current folder context) in `useAppStore.ts`. 544c02a
- [x] Task: Conductor - User Manual Verification 'Frontend State' (Protocol in workflow.md) 544c02a

## Phase 3: Dashboard UI & Folder Navigation
Goal: Render folders on the dashboard and allow users to enter them.

- [x] Task: Create `FolderCard` component based on existing `CourseCard` styling. 60986be
- [x] Task: Update `Dashboard.tsx` to render both courses and folders. 60986be
- [x] Task: Implement "Sub-Dashboard" view logic (filtering display items by `parentFolderId`). 60986be
- [x] Task: Add breadcrumbs or a "Back" button for navigating out of folders. 60986be
- [x] Task: Conductor - User Manual Verification 'Dashboard UI & Folder Navigation' (Protocol in workflow.md) 60986be

## Phase 4: Reordering & Organization (Edit Mode)
Goal: Allow users to move courses and folders.

- [ ] Task: Implement "Edit Mode" toggles for folder creation.
- [ ] Task: Implement reordering logic (up/down or drag-and-drop) for courses and folders.
- [ ] Task: Implement "Move to Folder" functionality.
- [ ] Task: Ensure all changes are persisted back to the backend on update.
- [ ] Task: Conductor - User Manual Verification 'Reordering & Organization' (Protocol in workflow.md)
