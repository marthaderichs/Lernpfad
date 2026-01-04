# Track Specification: Bilingual Support (German/Portuguese)

## Overview
Enable courses to support two languages: German (Primary) and Portuguese (Secondary). If a course contains data for both languages, a toggle switch allows users to switch the content language instantly within the course view.

## Requirements

### 1. Data Model (`src/types/index.ts`)
- Extend `LevelContent` to support localized content.
- **Proposed Structure:**
    - The existing `content` field remains as the "Primary/Fallback" (or strictly German).
    - Add an optional `contentPT?: LevelContent` (or similar structure) to `Level`.
    - **Better Approach:**
        - Change `Level` to allow `content` to be polymorphic OR add a wrapper.
        - `content` (default/DE)
        - `contentPT` (optional/PT)
- **AI Import:**
    - Update the System Prompt to allow generating `contentPT` if requested.
    - Add a UI toggle in `AiImportModal` to "Generate Portuguese Translation".

### 2. UI/UX
- **Language Switch:**
    - **Location:** Sticky header in `LevelPlayer` or `CourseMap`.
    - **Visibility:** ONLY visible if the current level/course has Portuguese content.
    - **Behavior:** Toggles instantaneously between DE and PT content.
- **State:**
    - Persist the user's language preference (per course or global?) -> Let's make it Global for the session, or per Course.
    - Default to DE.

### 3. Creation / Import
- **AI Import Modal:**
    - Checkbox: "Add Portuguese Translation".
    - If checked, the AI Prompt is updated to request `content` AND `contentPT`.
- **JSON Editor:**
    - Show tabs for "DE" and "PT" if the option is active, or just two editor panes.

## Technical Constraints
- **Backward Compatibility:** Existing courses (DE only) must work exactly as before without errors.
- **Type Safety:** TypeScript interfaces must reflect the optional nature of the second language.
