# Implementation Plan: Bilingual Support

## Phase 1: Data Model & Types
Goal: Update TypeScript definitions to support secondary language content.

- [x] Task: Update `Level` interface in `src/types/index.ts` to include optional `contentPT`. d536109
- [x] Task: Update `Course` or `Unit` interfaces if titles/descriptions also need translation (Scope: Let's focus on Level Content first, maybe Unit titles too). d536109
- [x] Task: Conductor - User Manual Verification 'Data Model & Types' d536109

## Phase 2: State & Store
Goal: Manage the active language state.

- [ ] Task: Add `contentLanguage` ('DE' | 'PT') to `useAppStore` (Global setting).
- [ ] Task: Add action `toggleContentLanguage`.
- [ ] Task: Conductor - User Manual Verification 'State & Store'

## Phase 3: AI Import & Creation
Goal: Allow generating bilingual courses.

- [ ] Task: Update `AiImportModal.tsx` with a checkbox "Include Portuguese".
- [ ] Task: Update `SYSTEM_PROMPT` in `src/constants/index.ts` to instruct AI on the new JSON structure for bilingual content.
- [ ] Task: Verify AI generation produces valid JSON with `contentPT`.
- [ ] Task: Conductor - User Manual Verification 'AI Import & Creation'

## Phase 4: UI Implementation (Level Player)
Goal: Show the toggle and render the correct language.

- [ ] Task: Create a `LanguageToggle` component (Flag/Text switch).
- [ ] Task: Update `LevelPlayer.tsx` to conditionally render `content` or `contentPT` based on store state.
- [ ] Task: Ensure fallback to DE if PT is missing but selected.
- [ ] Task: Show `LanguageToggle` in the header ONLY if PT content exists.
- [ ] Task: Conductor - User Manual Verification 'UI Implementation'
