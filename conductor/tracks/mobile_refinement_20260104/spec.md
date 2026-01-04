# Specification: Mobile UI Refinement and Gamification Core Features

## Overview
This track aims to polish the "LernPfad AI" mobile experience by adopting iOS-inspired design patterns and ensuring gamification elements are both functional and visually rewarding.

## Functional Requirements

### 1. iOS-Style Header Redesign
*   **Compact Layout:** Reduce vertical height significantly.
*   **Information Density:** Display "Streak", "XP", "Coins", and "Course Title" in a horizontal, compact layout similar to native iOS apps.
*   **Styling:** Use SF-style typography, subtle borders, and background-blur (glassmorphism) if appropriate for the iOS look.

### 2. Interactive Coin Display & Shop Navigation
*   **Interactive Balance:** Clicking/tapping the Coin balance must navigate the user to the Shop view.
*   **Shop Entry Point:** Remove any standalone "Shop" buttons from the main navigation/header.

### 3. Gamification Mechanics
*   **Functional Streak:** Fix the streak logic to correctly track daily activity.
*   **Green Path Progress:** The learning path line connecting course nodes should fill with green as the user completes levels.
*   **Node Glow:** Completed nodes and the path should have a subtle green glow effect.

### 4. Course Management Improvements
*   **Simplified Import:** Remove long instructions. Display only "Copy Prompt" button and the course text input.
*   **Editable Prompts:** Add UI and backend/storage logic to allow users to edit the AI course generation prompt.
*   **Course Aesthetics:** Assign unique colors and emojis to each course. Ensure these are editable by the user.
*   **Delete Button:** Move the delete button from the main list to the specific course detail view, making it unobtrusive.

## Non-Functional Requirements
*   **Responsiveness:** Perfect layout on iOS Safari.
*   **Performance:** Transitions and path animations must be smooth.
*   **Persistence:** Edited prompts and new course visuals must persist in `courses.json` or `stats.json`.
