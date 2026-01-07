# Initial Concept

## Primary Focus
This phase focuses on a comprehensive refinement of the "LernPfad AI" platform to enhance the mobile user experience, streamline workflows, and visual polish.

## Key Objectives

### 1. Mobile Experience & UI Polish
*   **Header Redesign:** drastically reduce the size of the header bar which currently dominates the screen. Adopt standard iOS app layout principles to compactly display Streak, XP, Coins, and Title without removing information.
*   **Visual Identity:** Move away from the generic "AI purple" gradients to a more creative and distinct design language.
*   **Shop Integration:** Remove the dedicated "Shop" button. Instead, make the "Coins" display interactive; tapping the coin balance should navigate the user to the shop.

### 2. Gamification & Progress
*   **Functional Streak:** Ensure the streak counter is fully functional and reliable.
*   **Visual Progress:** The learning path should visually fill with green as the user completes levels, providing clear progress feedback at a glance.

### 3. Course Management & Content
*   **Simplified Import:** Remove the lengthy instructions for adding new courses. Replace with a minimal interface: a "Copy Prompt" button and a text input field for the course content.
*   **Editable Prompts:** Introduce a new feature allowing users to edit the generation prompt directly within the app. These changes must be persistently saved to the database and remain stable across updates.
*   **Course Visuals:** Assign unique, colorful, and thematically appropriate colors and emojis to each course (Vorlesung). Ensure emojis are editable.
*   **Delete Functionality:** Hide the delete button from the main view. It should be accessible only within the specific course view, unobtrusive yet findable.

### 4. Infrastructure & Data Integrity
*   **Robust Persistence:** All data (courses, progress, user stats) is stored in a reliable SQLite database, replacing the previous file-based JSON system. This ensures data integrity, safe concurrent access, and persistence across deployments.
