# Track Specification: Bilingual Support & Fixes

## Overview
This track focuses on stabilizing the course creation process and expanding the bilingual capabilities of the platform. Specifically, it addresses a critical bug in the course creation flow and introduces a new feature to add Portuguese translations to existing courses via the Course Map's Edit Mode.

## Functional Requirements

### 1. Fix: Course Creation (AiImportModal)
*   **Issue:** The "Kurs erstellen" (Save) button in the `AiImportModal` is currently non-functional or fails to save data to the backend.
*   **Requirement:** Investigate and fix the `onImport` logic in `AiImportModal.tsx` and its interaction with the `addCourse` store action and backend API.
*   **Success Criteria:** A user can successfully paste JSON into the `AiImportModal`, click "Kurs erstellen", and have the new course appear in the dashboard and persist to `courses.json`.

### 2. Feature: Add Portuguese to Existing Course
*   **Location:** The "Settings" modal (Edit Mode) within the `CourseMap` view.
*   **UI Layout:**
    *   Expand the modal (or open a sub-modal) to show a **Split View**.
    *   **Left Pane:** Displays the *current* Course JSON (German) for reference.
    *   **Right Pane:** An empty text area for pasting the Portuguese JSON structure.
*   **Logic:**
    *   When the user pastes the Portuguese JSON and confirms, the system must **merge** this translation into the existing course object.
    *   Matching logic should be based on the structure (Units/Levels indices) to ensure translations align correctly.
*   **Persistence:** The merged course (now containing `titlePT`, `contentPT`, etc.) must be saved to `courses.json`.

## Technical Details

### Backend (`server.js`)
*   Ensure the `/api/courses/add` and `/api/courses` (update) endpoints are robust and correctly handle large JSON payloads (limit is already 10mb, but check for parsing errors).

### Frontend (`src/components/course/CourseMap.tsx`)
*   Modify the "Settings" modal to include a new button: "Add/Edit Portuguese Translation".
*   This button opens the new Split View interface (reusing `JsonEditor` components if possible).
*   Implement the merge logic (similar to `AiImportModal`'s `mergeTranslations` function).

## Out of Scope
*   Manual line-by-line editing of course content (this is a bulk JSON operation).
*   Automatic translation (the user provides the JSON).
