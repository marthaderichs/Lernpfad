# LernPfad AI

An interactive learning platform with AI support, designed to create and play educational courses.

## Project Overview

*   **Type:** Full-stack Web Application (React + Node.js)
*   **Frontend:** React (Vite), TypeScript, Tailwind CSS, Zustand (State Management).
*   **Backend:** Node.js, Express.
*   **Data Storage:** Local JSON files (`data/courses.json`, `data/stats.json`) served via the backend.
*   **Infrastructure:** Docker, Docker Compose, Coolify-ready.

## Architecture & Key Files

### Backend (`server.js`)
*   A minimalist Express server providing a REST API.
*   Handles persistence by reading/writing to JSON files in the `data/` directory.
*   **Note:** Currently uses synchronous file I/O (`fs.readFileSync`), which is identified as a point for future refactoring (see `PROJEKT_ANALYSE.md`).

### Frontend
*   **`src/App.tsx`**: The main entry point and orchestrator. Handles routing and high-level state.
*   **`src/stores/useAppStore.ts`**: Global state management using Zustand.
*   **`src/components/LevelPlayer.tsx`**: Core logic for playing through course levels (Quiz, Flashcards, etc.).
*   **`src/services/api.ts` & `src/services/storageService.ts`**: Handles API communication with the backend.

### Data
*   **`data/`**: Contains the persistent state of the application (`courses.json`, `stats.json`).

## Development

### Prerequisites
*   Node.js >= 18
*   npm

### Setup & Run
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development environment (Frontend + Backend):
    ```bash
    npm run dev:all
    ```
    *   Frontend: `http://localhost:5173`
    *   Backend: `http://localhost:3000`

### Individual Commands
*   **Frontend only:** `npm run dev`
*   **Backend only:** `npm run dev:server`
*   **Build:** `npm run build`

### Docker
*   Start: `docker-compose up -d`
*   Stop: `docker-compose down`
*   Logs: `docker-compose logs -f`

## Conventions & Roadmap

*   **Code Style:** TypeScript strict mode. Functional React components with Hooks.
*   **State Management:** Moving away from prop-drilling towards Zustand (in progress).
*   **Refactoring:** See `PROJEKT_ANALYSE.md` and `REFACTORING_PLAN.md` for detailed architectural analysis and planned improvements (e.g., modularizing `App.tsx`, improving backend I/O).

## UX/UI Design System & Rules

This project follows a strict **"Gamified & Tactile"** design language (similar to Duolingo). All UI changes must adhere to these rules to maintain a universal, clean, and uniform appearance.

### 1. Core Philosophy
*   **Tactile & 3D:** Interactive elements are not flat. They have depth (`border-b`) and physical movement on press (`active:translate-y`).
*   **Playful & Round:** Avoid sharp corners. Use `rounded-2xl` for almost everything (cards, buttons, inputs).
*   **High Contrast & Colorful:** Use the specific `brand-*` color palette. Avoid washed-out or standard HTML colors.
*   **Chunking:** Information is presented in bite-sized cards, never in long, unbroken walls of text.

### 2. Color System
Use these exact Tailwind classes for consistency. Do not hardcode hex values.

| Semantic | Color Name | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Action** | Sky Blue | `bg-brand-sky` | Main "Continue" buttons, active states. |
| **Success / Safe** | Green | `bg-brand-green` | Correct answers, "Math/Logic" themes, buy buttons. |
| **Danger / Error** | Red | `bg-brand-red` | Delete actions, wrong answers. |
| **UI / Magic** | Purple | `bg-brand-purple` | System messages, "Theory" themes. |
| **Warning / Highlight**| Orange | `bg-brand-orange` | "Summary" themes, alerts. |
| **Neutral** | Gray | `bg-gray-200` | Disabled states, placeholders (Text: `text-gray-500`). |

### 3. Component Standards

#### A. The "Universal Button"
Every primary button must follow this structure:
```tsx
className="
  font-extrabold 
  uppercase 
  tracking-wide 
  py-3 px-6 
  rounded-2xl 
  border-b-4 
  transition-all 
  active:translate-y-1 
  active:shadow-none
  [variant-specific-colors]
"
```
*   **Normal State:** High saturation color + Darker border (`border-*-600`) + Light shadow (`shadow-*-200`).
*   **Hover State:** Slightly lighter background (`hover:bg-*-400`).
*   **Active State:** Moves down (`translate-y-1`), shadow disappears.

#### B. Cards & Containers
*   **Border:** `border-2 border-gray-200` or `border-b-4` for interactive cards.
*   **Radius:** Always `rounded-2xl`.
*   **Padding:** Minimum `p-4` or `p-6`.
*   **Background:** White (`bg-white`) on a light gray page background (`bg-gray-50` or similar).

### 4. Typography
*   **Headings:** Bold or Extrabold. No serifs.
*   **Buttons:** Always **UPPERCASE** and `font-extrabold` with `tracking-wide`.
*   **Body:** Clean sans-serif. High readability (line-height 1.5+).
*   **Markdown Content:** Headers (`h1`, `h2`, `h3`) inside markdown must match the app's heading styles (bold, distinct).

### 5. Iconography
*   **Library:** `lucide-react`.
*   **Style:** Simple, outlined icons (default Lucide style).
*   **Size:** Standard icon size is `w-5 h-5` or `w-6 h-6`.
*   **Avatars/Shop:** Emojis are used for avatars and badges to keep the "gamified" feel lightweight.

### 6. Layout & Spacing
*   **Mobile First:** All layouts must work on mobile.
*   **Grid:** Use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for item lists (courses, shop items).
*   **Gap:** Standard gap is `gap-4` or `gap-6`.
*   **Max Width:** Main content is centered with `max-w-x` constraints (e.g., `max-w-2xl` for lessons) to ensure readability.

