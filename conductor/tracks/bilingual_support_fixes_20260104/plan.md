# Implementation Plan: Bilingual Support & Fixes

## Phase 1: Bug Fix - Course Creation Stability
*Goal: Fix the broken "Kurs erstellen" button and ensure backend persistence.*

- [x] Task: Create a reproduction test case for `addCourse` in `useAppStore.test.ts`. 62c80fe
- [x] Task: Fix `AiImportModal.tsx` and `useAppStore.ts` to ensure `addCourse` correctly calls the backend and updates local state. 62c80fe
- [x] Task: Verify backend logs and `courses.json` persistence after a successful import. 62c80fe
- [x] Task: Conductor - User Manual Verification 'Bug Fix - Course Creation Stability' (Protocol in workflow.md) [checkpoint: bd45188]

## Phase 2: Portuguese Translation Interface in CourseMap
*Goal: Add the UI for importing translations to existing courses.*

- [x] Task: Create tests for the new "Translation Mode" in `CourseMap.test.tsx`. bd45188
- [x] Task: Update the Settings Modal in `CourseMap.tsx` to include an "Add/Edit Portuguese" button. bd45188
- [x] Task: Implement a Split-Pane view (Base JSON vs. Translation JSON) within the Settings Modal. ccb8359
- [x] Task: Conductor - User Manual Verification 'Portuguese Translation Interface' (Protocol in workflow.md) [checkpoint: ccb8359]

## Phase 3: Translation Merge Logic & Persistence
*Goal: Implement the logic to merge Portuguese JSON into existing courses.*

- [x] Task: Write unit tests for the translation merge logic in a new utility test file. 81dc1ef
- [x] Task: Refactor and extract `mergeTranslations` from `AiImportModal.tsx` into a reusable utility (`src/utils/courseUtils.ts`). 81dc1ef
- [x] Task: Implement the "Save Translation" action in `CourseMap.tsx` that triggers the merge and saves the course. 81dc1ef
- [x] Task: Conductor - User Manual Verification 'Merge Logic & Persistence' (Protocol in workflow.md) [checkpoint: 81dc1ef]

## Phase 4: Final Polish & Verification
*Goal: Ensure UI consistency and verify the bilingual toggle works with newly added translations.*

- [x] Task: Verify that the `LanguageToggle` appears correctly after adding a translation to an existing course. 81dc1ef
- [x] Task: Run full test suite to ensure no regressions in course navigation or dashboard. 81dc1ef
- [x] Task: Conductor - User Manual Verification 'Final Polish & Verification' (Protocol in workflow.md) [checkpoint: 81dc1ef]
