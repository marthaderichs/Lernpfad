# Track Specification: Nested Folders and Persistence

## Overview
Implement a robust organizational system using nested folders. Users can group courses into folders, and folders into other folders. This system must be persistent (backend-stored), reorderable, and visually integrated into the existing "Duolingo-style" UI.

## Requirements

### 1. Data Model & Persistence
- **JSON Structure (`courses.json`):**
    - The top-level structure should support both `Course` objects and `Folder` objects.
    - A `Folder` object contains:
        - `id`: Unique identifier.
        - `title`: Display name.
        - `type`: `"folder"`.
        - `items`: An ordered array of `Course` IDs or nested `Folder` objects (or IDs).
        - `settings`: Same as courses (theme, icon/emoji, etc.).
- **Backend API:**
    - The Express server (`server.js`) must correctly save and serve the updated recursive or flat-with-parents structure.

### 2. UI/UX (Frontend)
- **Folder Cards:**
    - Folders appear on the Dashboard like course cards.
    - Visually distinct (e.g., folder icon or specific border style).
    - Clicking a folder opens a "Sub-Dashboard" showing only the contents of that folder.
- **Navigation:**
    - Breadcrumbs or a "Back" button to navigate up from nested folders.
    - Smooth transitions between dashboard levels.
- **Edit Mode:**
    - New "Add Folder" button in the dashboard edit view.
    - Ability to drag/move courses into folders.
    - Reordering items (courses and folders) within the same level.

### 3. Aesthetics (Design System)
- Follow the "Gamified & Tactile" rules from `GEMINI.md`.
- Folders use `rounded-2xl`, `border-b-4`, and tactile press effects.
- Brand colors for folder themes (Sky Blue, Green, Purple, etc.).

## Technical Constraints
- **State Management:** Use Zustand (`useAppStore.ts`).
- **Persistence:** Local JSON files via existing Node.js backend.
- **Testing:** TDD approach for all new logic (store actions, backend transformations).
