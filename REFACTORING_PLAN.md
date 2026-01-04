# 🔧 LernPfad AI - Vollständiger Refactoring Plan
**Version 2.0 - Enterprise-Grade Architektur**

> ⚠️ **HÖCHSTE PRIORITÄT: DATENSICHERHEIT**  
> Die bestehende Produktions-Datenbank (`data/courses.json` und `data/stats.json`) darf unter KEINEN Umständen überschrieben oder gelöscht werden!

---

## 📋 Inhaltsverzeichnis
1. [🚀 Coolify-Deployment: Warum deine Daten SICHER sind](#-coolify-deployment-warum-deine-daten-sicher-sind)
2. [Datensicherheits-Protokoll](#-1-datensicherheits-protokoll)
3. [Projekt-Setup & Branching-Strategie](#-2-projekt-setup--branching-strategie)
4. [Phase 1: Backend-Refactoring](#-phase-1-backend-refactoring)
5. [Phase 2: State Management](#-phase-2-state-management)
6. [Phase 3: Frontend-Modularisierung](#-phase-3-frontend-modularisierung)
7. [Phase 4: Services & API-Layer](#-phase-4-services--api-layer)
8. [Phase 5: Testing & Qualitätssicherung](#-phase-5-testing--qualitätssicherung)
9. [Migrations-Checkliste](#-migrations-checkliste)
10. [Neue Ordnerstruktur](#-neue-ordnerstruktur)

---

## 🚀 Coolify-Deployment: Warum deine Daten SICHER sind

### ✅ BESTÄTIGUNG: Deine Produktionsdaten sind geschützt!

Die aktuelle Docker-Konfiguration verwendet bereits **Docker Volumes**. Das bedeutet:

```
┌─────────────────────────────────────────────────────────────────┐
│                     COOLIFY SERVER                              │
│                                                                 │
│   ┌─────────────────────┐     ┌──────────────────────────┐     │
│   │   Docker Container   │     │   Docker Volume          │     │
│   │   (wird ersetzt)     │────▶│   "lernpfad-data"        │     │
│   │                      │     │                          │     │
│   │   - Node.js Server   │     │   📁 /app/data/          │     │
│   │   - Frontend (dist/) │     │   ├── courses.json  ✅   │     │
│   │   - Server.js        │     │   └── stats.json    ✅   │     │
│   │                      │     │                          │     │
│   │   🔄 ERSETZBAR       │     │   💾 PERSISTENT          │     │
│   └─────────────────────┘     └──────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Was passiert bei einem Re-Deploy auf Coolify?

| Aktion | Ergebnis |
|--------|----------|
| `git push` → Coolify baut neu | ✅ Neuer Container wird erstellt |
| Alter Container wird gestoppt | ✅ Volume bleibt unberührt |
| Neuer Container startet | ✅ Volume wird wieder gemountet |
| **Deine Kurse & XP** | ✅ **BLEIBEN ERHALTEN** |

### Warum das funktioniert (Technische Erklärung)

In deiner `docker-compose.yaml` steht:

```yaml
volumes:
  - lernpfad-data:/app/data  # ← Named Volume!
```

Das bedeutet:
- Die Daten werden **NICHT** im Container gespeichert
- Sie werden in einem **Named Volume** auf dem Host-Server gespeichert
- Coolify verwaltet dieses Volume **unabhängig** vom Container
- Selbst wenn der Container komplett gelöscht und neu gebaut wird, **bleiben die Daten**

### ⚠️ WICHTIG: Was du NICHT tun darfst

Diese Aktionen würden die Daten löschen:

| Aktion | Risiko |
|--------|--------|
| ❌ Volume in Coolify manuell löschen | **DATENVERLUST** |
| ❌ `docker volume rm lernpfad-data` auf Server | **DATENVERLUST** |
| ❌ Das Volume aus docker-compose.yaml entfernen | **DATENVERLUST** |
| ❌ `DATA_DIR` Environment Variable ändern | Daten werden ignoriert |

### ✅ Was du SICHER tun kannst

| Aktion | Ergebnis |
|--------|----------|
| ✅ Code ändern & pushen | Container wird ersetzt, Daten bleiben |
| ✅ Neues Deployment in Coolify | Daten bleiben |
| ✅ Server neustarten | Daten bleiben |
| ✅ Container stoppen/starten | Daten bleiben |
| ✅ npm packages updaten | Daten bleiben |

### 🛡️ Zusätzliche Absicherung (Empfohlen)

Für 100% Sicherheit, **vor dem ersten Deployment der neuen Version**:

#### Option 1: Backup in Coolify erstellen
```bash
# SSH auf Coolify-Server
docker exec lernpfad cat /app/data/courses.json > ~/backup_courses.json
docker exec lernpfad cat /app/data/stats.json > ~/backup_stats.json
```

#### Option 2: Coolify Volume-Backup Feature nutzen
Falls Coolify eine Backup-Funktion für Volumes hat, diese vor dem Deployment aktivieren.

#### Option 3: Download über Browser
Vor dem Deployment die aktuelle Website öffnen und manuell die Kurse notieren (Screenshot).

---

### 🎯 TL;DR - Zusammenfassung für "ohne Sorgen deployen"

1. **Deine Docker-Konfiguration ist bereits korrekt** ✅
2. **Das Volume `lernpfad-data` speichert alle Daten persistent** ✅
3. **Bei Re-Deploy wird NUR der Container ersetzt, NICHT das Volume** ✅
4. **Alle Kurse, XP, Coins bleiben nach dem Deployment erhalten** ✅

**Du kannst die überarbeitete Website einfach deployen - deine Daten sind sicher!**

---

## 🛡️ 1. Datensicherheits-Protokoll

### 1.1 VOR JEGLICHER ARBEIT AUSFÜHREN

```bash
# 1. Backup-Verzeichnis erstellen
mkdir -p ~/lernpfad_backup_$(date +%Y%m%d_%H%M%S)

# 2. Komplettes Datenverzeichnis sichern
cp -r /Users/juliusderrichs/Desktop/Lernpfad/data ~/lernpfad_backup_$(date +%Y%m%d_%H%M%S)/

# 3. Backup verifizieren
ls -la ~/lernpfad_backup_$(date +%Y%m%d_%H%M%S)/data/
cat ~/lernpfad_backup_$(date +%Y%m%d_%H%M%S)/data/courses.json | head -50
cat ~/lernpfad_backup_$(date +%Y%m%d_%H%M%S)/data/stats.json
```

### 1.2 Git-basierte Absicherung

```bash
# Vor dem Refactoring: Aktuellen Stand taggen
git add .
git commit -m "PRE-REFACTOR: Stable production state"
git tag -a v1.0-stable -m "Letzte stabile Version vor Refactoring"
git push origin v1.0-stable
```

### 1.3 Schutz der Data-Dateien

**Datei: `.gitignore` - Folgende Zeilen NICHT entfernen:**
```
# Diese Zeilen MÜSSEN bestehen bleiben:
# data/courses.json   <- NICHT ignorieren, damit Änderungen trackbar sind
# data/stats.json     <- NICHT ignorieren
```

**NEU HINZUFÜGEN zu `.gitignore`:**
```gitignore
# Backup-Dateien
*.backup.json
data/*.bak
```

### 1.4 Automatisches Backup-Script erstellen

**Neue Datei: `scripts/backup-data.sh`**
```bash
#!/bin/bash
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp ./data/courses.json "$BACKUP_DIR/"
cp ./data/stats.json "$BACKUP_DIR/"
echo "✅ Backup erstellt: $BACKUP_DIR"
```

---

## 🌿 2. Projekt-Setup & Branching-Strategie

### 2.1 Branch-Struktur

```
main (Produktion - NIEMALS direkt ändern!)
├── develop (Integration)
│   ├── feature/backend-refactor
│   ├── feature/state-management
│   ├── feature/component-split
│   ├── feature/api-layer
│   └── feature/testing
```

### 2.2 Workflow für jeden Feature-Branch

```bash
# 1. Neuen Branch erstellen
git checkout develop
git pull origin develop
git checkout -b feature/<name>

# 2. Arbeit durchführen...

# 3. Vor Merge: Datenintegrität prüfen
npm run test:data-integrity  # Muss noch erstellt werden

# 4. Pull Request erstellen
git push origin feature/<name>
# PR gegen 'develop' erstellen
```

---

## ⚙️ Phase 1: Backend-Refactoring

### 1.1 Asynchrone I/O-Umstellung

**Datei: `server.js`**

| Zeile | Aktuell (Sync) | NEU (Async) |
|-------|----------------|-------------|
| 34-44 | `readFileSync` | `fs.promises.readFile` |
| 46-54 | `writeFileSync` | `fs.promises.writeFile` |

**Exakte Änderungen:**

```javascript
// VORHER (Zeile 34-44):
const readJSON = (filePath, defaultValue) => {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error(`Error reading ${filePath}:`, e);
    }
    return defaultValue;
};

// NACHHER:
const readJSON = async (filePath, defaultValue) => {
    try {
        const exists = await fs.promises.access(filePath).then(() => true).catch(() => false);
        if (exists) {
            const data = await fs.promises.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error(`Error reading ${filePath}:`, e);
    }
    return defaultValue;
};
```

```javascript
// VORHER (Zeile 46-54):
const writeJSON = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (e) {
        console.error(`Error writing ${filePath}:`, e);
        return false;
    }
};

// NACHHER:
import { writeFile } from 'write-file-atomic';

const writeJSON = async (filePath, data) => {
    try {
        await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (e) {
        console.error(`Error writing ${filePath}:`, e);
        return false;
    }
};
```

### 1.2 Alle Route-Handler auf Async umstellen

**Zeilen 59-62 (GET /api/courses):**
```javascript
// VORHER:
app.get('/api/courses', (req, res) => {
    const courses = readJSON(COURSES_FILE, null);
    res.json({ success: true, data: courses });
});

// NACHHER:
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await readJSON(COURSES_FILE, null);
        res.json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
```

**Gleiche Umstellung für:**
- Zeile 65-72: `POST /api/courses`
- Zeile 75-85: `DELETE /api/courses/:id`
- Zeile 88-98: `POST /api/courses/add`
- Zeile 103-106: `GET /api/stats`
- Zeile 109-116: `POST /api/stats`

### 1.3 NPM-Abhängigkeit hinzufügen

```bash
npm install write-file-atomic
```

### 1.4 Optionale Erweiterung: SQLite-Migration

**Neue Datei: `server/db.js`**
```javascript
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/lernpfad.db');

const db = new Database(DB_PATH);

// Tabellen erstellen (nur beim ersten Start)
db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS user_stats (
        id INTEGER PRIMARY KEY DEFAULT 1,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

export const getCourses = () => {
    const rows = db.prepare('SELECT data FROM courses').all();
    return rows.map(r => JSON.parse(r.data));
};

export const saveCourse = (course) => {
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO courses (id, data, updated_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(course.id, JSON.stringify(course));
};

export const deleteCourse = (id) => {
    db.prepare('DELETE FROM courses WHERE id = ?').run(id);
};

export const getStats = () => {
    const row = db.prepare('SELECT data FROM user_stats WHERE id = 1').get();
    return row ? JSON.parse(row.data) : null;
};

export const saveStats = (stats) => {
    db.prepare(`
        INSERT OR REPLACE INTO user_stats (id, data, updated_at) 
        VALUES (1, ?, CURRENT_TIMESTAMP)
    `).run(JSON.stringify(stats));
};

export default db;
```

**NPM-Abhängigkeit:**
```bash
npm install better-sqlite3
```

---

## 🧠 Phase 2: State Management

### 2.1 Zustand Store erstellen

**Neue Datei: `src/stores/useAppStore.ts`**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Course, UserStats, ViewState } from '../types';
import * as api from '../services/api';

interface AppState {
    // State
    courses: Course[];
    userStats: UserStats | null;
    currentView: ViewState;
    selectedCourse: Course | null;
    selectedLevelIndex: number | null;
    isLoading: boolean;
    error: string | null;
    
    // Actions
    loadInitialData: () => Promise<void>;
    setCourses: (courses: Course[]) => void;
    addCourse: (course: Course) => Promise<void>;
    deleteCourse: (courseId: string) => Promise<void>;
    updateCourseProgress: (courseId: string, progress: Partial<Course>) => void;
    
    setUserStats: (stats: UserStats) => void;
    updateUserProgress: (starsEarned: number) => Promise<void>;
    
    navigateTo: (view: ViewState) => void;
    selectCourse: (course: Course | null) => void;
    selectLevel: (index: number | null) => void;
    
    setError: (error: string | null) => void;
    clearError: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Initial State
            courses: [],
            userStats: null,
            currentView: 'DASHBOARD',
            selectedCourse: null,
            selectedLevelIndex: null,
            isLoading: false,
            error: null,
            
            // Actions
            loadInitialData: async () => {
                set({ isLoading: true, error: null });
                try {
                    const [courses, stats] = await Promise.all([
                        api.loadCourses(),
                        api.loadUserStats()
                    ]);
                    set({ courses, userStats: stats, isLoading: false });
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            },
            
            setCourses: (courses) => set({ courses }),
            
            addCourse: async (course) => {
                set({ isLoading: true });
                try {
                    const updatedCourses = await api.addCourse(course);
                    set({ courses: updatedCourses, isLoading: false });
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            },
            
            deleteCourse: async (courseId) => {
                set({ isLoading: true });
                try {
                    const updatedCourses = await api.deleteCourse(courseId);
                    set({ courses: updatedCourses, isLoading: false });
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            },
            
            updateCourseProgress: (courseId, progress) => {
                const { courses } = get();
                const updated = courses.map(c => 
                    c.id === courseId ? { ...c, ...progress } : c
                );
                set({ courses: updated });
                api.saveCourses(updated); // Fire and forget
            },
            
            setUserStats: (stats) => set({ userStats: stats }),
            
            updateUserProgress: async (starsEarned) => {
                try {
                    const updatedStats = await api.updateUserProgress(starsEarned);
                    set({ userStats: updatedStats });
                } catch (error) {
                    set({ error: (error as Error).message });
                }
            },
            
            navigateTo: (view) => set({ currentView: view }),
            selectCourse: (course) => set({ selectedCourse: course }),
            selectLevel: (index) => set({ selectedLevelIndex: index }),
            
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),
        }),
        {
            name: 'lernpfad-storage',
            partialize: (state) => ({
                // Nur UI-State persistieren, keine Daten
                currentView: state.currentView,
            }),
        }
    )
);
```

### 2.2 NPM-Abhängigkeit

```bash
npm install zustand
```

### 2.3 Custom Hooks für spezifische Bereiche

**Neue Datei: `src/hooks/useCourses.ts`**
```typescript
import { useAppStore } from '../stores/useAppStore';
import { Course, Level } from '../types';

export const useCourses = () => {
    const { 
        courses, 
        selectedCourse, 
        addCourse, 
        deleteCourse,
        updateCourseProgress,
        selectCourse 
    } = useAppStore();
    
    const getCourseById = (id: string): Course | undefined => 
        courses.find(c => c.id === id);
    
    const getAllLevels = (course: Course): Level[] => 
        course.units.flatMap(u => u.levels);
    
    const calculateProgress = (course: Course): number => {
        const levels = getAllLevels(course);
        const completed = levels.filter(l => l.stars > 0).length;
        return levels.length > 0 ? Math.round((completed / levels.length) * 100) : 0;
    };
    
    return {
        courses,
        selectedCourse,
        addCourse,
        deleteCourse,
        selectCourse,
        getCourseById,
        getAllLevels,
        calculateProgress,
        updateCourseProgress,
    };
};
```

**Neue Datei: `src/hooks/useUserStats.ts`**
```typescript
import { useAppStore } from '../stores/useAppStore';

export const useUserStats = () => {
    const { userStats, setUserStats, updateUserProgress } = useAppStore();
    
    const getLevel = (xp: number): number => {
        return Math.floor(xp / 100) + 1;
    };
    
    const getXpForNextLevel = (xp: number): number => {
        return 100 - (xp % 100);
    };
    
    return {
        stats: userStats,
        level: userStats ? getLevel(userStats.totalXp) : 1,
        xpToNextLevel: userStats ? getXpForNextLevel(userStats.totalXp) : 100,
        updateUserProgress,
        setUserStats,
    };
};
```

---

## 🧩 Phase 3: Frontend-Modularisierung

### 3.1 Neue Ordnerstruktur

```
src/
├── components/
│   ├── common/           # Wiederverwendbare UI-Komponenten
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StarRating.tsx
│   │   └── index.ts      # Re-exports
│   │
│   ├── dashboard/        # Dashboard-spezifisch
│   │   ├── Dashboard.tsx
│   │   ├── CourseCard.tsx
│   │   ├── StatsPanel.tsx
│   │   ├── StreakDisplay.tsx
│   │   └── index.ts
│   │
│   ├── course/           # Kurs-Ansicht
│   │   ├── CourseMap.tsx
│   │   ├── UnitCard.tsx
│   │   ├── LevelNode.tsx
│   │   └── index.ts
│   │
│   ├── level-player/     # Level-Player (aktuell LevelPlayer.tsx)
│   │   ├── LevelPlayer.tsx       # Container/Orchestrator
│   │   ├── TheoryRenderer.tsx    # type: THEORY
│   │   ├── QuizRenderer.tsx      # type: QUIZ
│   │   ├── FlashcardRenderer.tsx # type: FLASHCARDS
│   │   ├── PracticeRenderer.tsx  # type: PRACTICE
│   │   ├── SummaryRenderer.tsx   # type: SUMMARY
│   │   ├── CompletionScreen.tsx  # Sterne-Anzeige am Ende
│   │   └── index.ts
│   │
│   ├── shop/             # Shop-Bereich
│   │   ├── Shop.tsx
│   │   ├── ShopItem.tsx
│   │   ├── CategoryFilter.tsx
│   │   └── index.ts
│   │
│   └── ai-import/        # KI-Import Modal
│       ├── AiImportModal.tsx
│       ├── PromptDisplay.tsx
│       ├── JsonEditor.tsx
│       └── index.ts
│
├── hooks/
│   ├── useCourses.ts
│   ├── useUserStats.ts
│   ├── useNavigation.ts
│   └── index.ts
│
├── stores/
│   └── useAppStore.ts
│
├── services/
│   ├── api.ts            # HTTP-Calls
│   ├── courseValidator.ts # Zod-Schemas
│   └── index.ts
│
├── utils/
│   ├── sanitizeCourse.ts
│   ├── calculateProgress.ts
│   ├── dateUtils.ts
│   └── index.ts
│
├── types/
│   ├── index.ts          # Alle Types exportieren
│   ├── course.types.ts
│   ├── user.types.ts
│   └── shop.types.ts
│
├── constants/
│   ├── index.ts
│   ├── systemPrompt.ts
│   ├── shopItems.ts
│   ├── initialCourses.ts
│   └── colors.ts
│
├── App.tsx               # Stark vereinfacht
└── index.tsx
```

### 3.2 LevelPlayer.tsx aufteilen (476 → 5 Dateien)

**Schritt 1: Interface definieren**

**Neue Datei: `src/components/level-player/types.ts`**
```typescript
import { Level, LevelType } from '../../types';

export interface LevelRendererProps {
    level: Level;
    onComplete: (score: number) => void;
}

export interface QuizState {
    currentQuestion: number;
    score: number;
    showFeedback: boolean;
    selectedAnswer: number | null;
}

export interface FlashcardState {
    currentIndex: number;
    isFlipped: boolean;
    knownCount: number;
    queue: number[];
}
```

**Schritt 2: Factory Pattern implementieren**

**Neue Datei: `src/components/level-player/LevelPlayer.tsx`**
```typescript
import React from 'react';
import { Level, LevelType } from '../../types';
import { TheoryRenderer } from './TheoryRenderer';
import { QuizRenderer } from './QuizRenderer';
import { FlashcardRenderer } from './FlashcardRenderer';
import { PracticeRenderer } from './PracticeRenderer';
import { SummaryRenderer } from './SummaryRenderer';
import { LevelRendererProps } from './types';

interface LevelPlayerProps {
    level: Level;
    onClose: () => void;
    onComplete: (score: number) => void;
}

const RENDERER_MAP: Record<LevelType, React.FC<LevelRendererProps>> = {
    [LevelType.THEORY]: TheoryRenderer,
    [LevelType.QUIZ]: QuizRenderer,
    [LevelType.FLASHCARDS]: FlashcardRenderer,
    [LevelType.PRACTICE]: PracticeRenderer,
    [LevelType.SUMMARY]: SummaryRenderer,
};

export const LevelPlayer: React.FC<LevelPlayerProps> = ({ 
    level, 
    onClose, 
    onComplete 
}) => {
    const Renderer = RENDERER_MAP[level.type];
    
    if (!Renderer) {
        console.error(`Unknown level type: ${level.type}`);
        return null;
    }
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-bold text-lg">{level.title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        ✕
                    </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    <Renderer level={level} onComplete={onComplete} />
                </div>
            </div>
        </div>
    );
};
```

**Schritt 3: QuizRenderer extrahieren**

**Neue Datei: `src/components/level-player/QuizRenderer.tsx`**

Extrahiere Zeilen **56-175** aus der aktuellen `LevelPlayer.tsx` (den Quiz-spezifischen Code).

```typescript
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { LevelRendererProps, QuizState } from './types';
import { Button } from '../common/Button';

export const QuizRenderer: React.FC<LevelRendererProps> = ({ level, onComplete }) => {
    const questions = level.content.quizQuestions || [];
    
    const [state, setState] = useState<QuizState>({
        currentQuestion: 0,
        score: 0,
        showFeedback: false,
        selectedAnswer: null,
    });
    
    const currentQ = questions[state.currentQuestion];
    
    const handleAnswer = (index: number) => {
        if (state.showFeedback) return;
        
        const isCorrect = index === currentQ.answerIndex;
        setState(prev => ({
            ...prev,
            selectedAnswer: index,
            showFeedback: true,
            score: isCorrect ? prev.score + 1 : prev.score,
        }));
    };
    
    const nextQuestion = () => {
        if (state.currentQuestion < questions.length - 1) {
            setState(prev => ({
                ...prev,
                currentQuestion: prev.currentQuestion + 1,
                showFeedback: false,
                selectedAnswer: null,
            }));
        } else {
            // Quiz beendet
            const percentage = state.score / questions.length;
            const stars = percentage >= 0.9 ? 3 : percentage >= 0.7 ? 2 : 1;
            onComplete(stars);
        }
    };
    
    // ... Rest der UI-Logik
    return (
        <div className="quiz-container">
            {/* Progress */}
            <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">
                    Frage {state.currentQuestion + 1} von {questions.length}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-brand-purple h-2 rounded-full transition-all"
                        style={{ width: `${((state.currentQuestion + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </div>
            
            {/* Question */}
            <h3 className="text-lg font-semibold mb-4">{currentQ.question}</h3>
            
            {/* Options */}
            <div className="space-y-2">
                {currentQ.options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={state.showFeedback}
                        className={`w-full p-4 rounded-lg text-left transition-all ${
                            state.showFeedback
                                ? idx === currentQ.answerIndex
                                    ? 'bg-green-100 border-green-500'
                                    : idx === state.selectedAnswer
                                        ? 'bg-red-100 border-red-500'
                                        : 'bg-gray-100'
                                : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        <span className="font-medium">{option.text}</span>
                        {state.showFeedback && (
                            <p className="text-sm mt-2 text-gray-600">{option.explanation}</p>
                        )}
                    </button>
                ))}
            </div>
            
            {/* Next Button */}
            {state.showFeedback && (
                <Button onClick={nextQuestion} className="mt-4 w-full">
                    {state.currentQuestion < questions.length - 1 ? 'Weiter' : 'Abschließen'}
                </Button>
            )}
        </div>
    );
};
```

**Analog für die anderen Renderer:**
- `TheoryRenderer.tsx` - Zeilen für THEORY/SUMMARY
- `FlashcardRenderer.tsx` - Zeilen 176-285 (Flashcard-Logik)
- `PracticeRenderer.tsx` - Zeilen 286-380 (Practice-Logik)
- `SummaryRenderer.tsx` - Ähnlich wie Theory

### 3.3 App.tsx vereinfachen (426 → ~100 Zeilen)

**Vorher (App.tsx - 426 Zeilen):**
- State Management (20+ useState)
- API-Calls
- Navigation Logic
- Course Sanitization
- Modal Management
- UI Rendering

**Nachher (App.tsx - ~100 Zeilen):**
```typescript
import React, { useEffect } from 'react';
import { useAppStore } from './stores/useAppStore';
import { Dashboard } from './components/dashboard';
import { CourseMap } from './components/course';
import { LevelPlayer } from './components/level-player';
import { Shop } from './components/shop';
import { AiImportModal } from './components/ai-import';

const App: React.FC = () => {
    const { 
        currentView, 
        selectedCourse,
        selectedLevelIndex,
        isLoading,
        loadInitialData 
    } = useAppStore();
    
    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);
    
    if (isLoading) {
        return <LoadingScreen />;
    }
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {currentView === 'DASHBOARD' && <Dashboard />}
            {currentView === 'COURSE_MAP' && selectedCourse && <CourseMap />}
            {currentView === 'SHOP' && <Shop />}
            
            {selectedLevelIndex !== null && selectedCourse && (
                <LevelPlayer />
            )}
        </div>
    );
};

export default App;
```

---

## 🔌 Phase 4: Services & API-Layer

### 4.1 Zod-Schema für Validierung

**Neue Datei: `src/services/courseValidator.ts`**

```typescript
import { z } from 'zod';

const QuizOptionSchema = z.object({
    text: z.string().min(1),
    explanation: z.string().min(1),
});

const QuizQuestionSchema = z.object({
    question: z.string().min(1),
    options: z.array(QuizOptionSchema).length(4),
    answerIndex: z.number().int().min(0).max(3),
});

const FlashcardSchema = z.object({
    front: z.string().min(1),
    back: z.string().min(1),
});

const PracticeTaskSchema = z.object({
    question: z.string().min(1),
    hint: z.string().optional(),
    solution: z.string().min(1),
});

const LevelContentSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    markdownContent: z.string().optional(),
    quizQuestions: z.array(QuizQuestionSchema).optional(),
    flashcards: z.array(FlashcardSchema).optional(),
    practiceTasks: z.array(PracticeTaskSchema).optional(),
});

const LevelSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    type: z.enum(['THEORY', 'QUIZ', 'FLASHCARDS', 'PRACTICE', 'SUMMARY']),
    status: z.enum(['LOCKED', 'UNLOCKED', 'COMPLETED']),
    stars: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
    content: LevelContentSchema,
});

const BrandColorSchema = z.enum([
    'brand-purple', 'brand-blue', 'brand-sky', 'brand-teal',
    'brand-green', 'brand-orange', 'brand-red', 'brand-pink'
]);

const UnitSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    colorTheme: BrandColorSchema,
    levels: z.array(LevelSchema).min(1),
});

export const CourseSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    professor: z.string().optional(),
    icon: z.string().min(1),
    themeColor: BrandColorSchema,
    totalProgress: z.number().min(0).max(100),
    units: z.array(UnitSchema).min(1),
});

export type ValidatedCourse = z.infer<typeof CourseSchema>;

export const validateCourse = (data: unknown): { 
    success: boolean; 
    data?: ValidatedCourse; 
    errors?: z.ZodError 
} => {
    const result = CourseSchema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: result.error };
};
```

### 4.2 API-Service mit Error Handling

**Neue Datei: `src/services/api.ts`**

```typescript
import { Course, UserStats } from '../types';
import { validateCourse } from './courseValidator';

const API_URL = import.meta.env.DEV 
    ? `http://${window.location.hostname}:3001/api`
    : '/api';

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
    }
    const result = await response.json();
    if (!result.success) {
        throw new ApiError(500, result.message || 'Unknown error');
    }
    return result.data;
};

// ============ COURSES ============

export const loadCourses = async (): Promise<Course[]> => {
    const response = await fetch(`${API_URL}/courses`);
    return handleResponse<Course[]>(response);
};

export const saveCourses = async (courses: Course[]): Promise<void> => {
    const response = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courses),
    });
    await handleResponse(response);
};

export const addCourse = async (course: Course): Promise<Course[]> => {
    // Validierung VOR dem Senden
    const validation = validateCourse(course);
    if (!validation.success) {
        throw new Error(`Invalid course data: ${validation.errors?.message}`);
    }
    
    const response = await fetch(`${API_URL}/courses/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course),
    });
    return handleResponse<Course[]>(response);
};

export const deleteCourse = async (courseId: string): Promise<Course[]> => {
    const response = await fetch(`${API_URL}/courses/${courseId}`, {
        method: 'DELETE',
    });
    return handleResponse<Course[]>(response);
};

// ============ USER STATS ============

export const loadUserStats = async (): Promise<UserStats> => {
    const response = await fetch(`${API_URL}/stats`);
    return handleResponse<UserStats>(response);
};

export const saveUserStats = async (stats: UserStats): Promise<void> => {
    const response = await fetch(`${API_URL}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats),
    });
    await handleResponse(response);
};

export const updateUserProgress = async (starsEarned: number): Promise<UserStats> => {
    const stats = await loadUserStats();
    const today = new Date().toISOString().split('T')[0];
    
    // XP & Coins berechnen
    const xpGain = starsEarned === 3 ? 50 : starsEarned === 2 ? 25 : 10;
    stats.totalXp += xpGain;
    stats.coins += xpGain;
    
    // Streak berechnen
    if (stats.lastStudyDate !== today) {
        if (stats.lastStudyDate) {
            const lastDate = new Date(stats.lastStudyDate);
            const currentDate = new Date(today);
            const diffDays = Math.ceil(
                Math.abs(currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            
            if (diffDays === 1) {
                stats.currentStreak += 1;
                stats.coins += Math.min(stats.currentStreak * 5, 50); // Streak Bonus
            } else if (diffDays > 1) {
                stats.currentStreak = 1;
            }
        } else {
            stats.currentStreak = 1;
        }
        stats.lastStudyDate = today;
    }
    
    await saveUserStats(stats);
    return stats;
};
```

### 4.3 NPM-Abhängigkeit

```bash
npm install zod
```

---

## 🧪 Phase 5: Testing & Qualitätssicherung

### 5.1 Datenintegritäts-Test

**Neue Datei: `scripts/test-data-integrity.js`**

```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

const errors = [];

// Test 1: Dateien existieren
console.log('📁 Prüfe Datei-Existenz...');
if (!fs.existsSync(COURSES_FILE)) {
    errors.push('❌ courses.json existiert nicht!');
} else {
    console.log('✅ courses.json existiert');
}

if (!fs.existsSync(STATS_FILE)) {
    errors.push('❌ stats.json existiert nicht!');
} else {
    console.log('✅ stats.json existiert');
}

// Test 2: JSON valide
console.log('\n📋 Prüfe JSON-Validität...');
try {
    const courses = JSON.parse(fs.readFileSync(COURSES_FILE, 'utf-8'));
    console.log(`✅ courses.json valide (${courses.length} Kurse)`);
} catch (e) {
    errors.push(`❌ courses.json ungültiges JSON: ${e.message}`);
}

try {
    const stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
    console.log(`✅ stats.json valide (XP: ${stats.totalXp})`);
} catch (e) {
    errors.push(`❌ stats.json ungültiges JSON: ${e.message}`);
}

// Test 3: Struktur prüfen
console.log('\n🔍 Prüfe Datenstruktur...');
try {
    const courses = JSON.parse(fs.readFileSync(COURSES_FILE, 'utf-8'));
    
    for (const course of courses) {
        if (!course.id) errors.push(`❌ Kurs ohne ID: ${JSON.stringify(course).slice(0, 50)}`);
        if (!course.title) errors.push(`❌ Kurs ohne Titel: ${course.id}`);
        if (!course.units || !Array.isArray(course.units)) {
            errors.push(`❌ Kurs ohne Units-Array: ${course.id}`);
        }
        
        for (const unit of course.units || []) {
            for (const level of unit.levels || []) {
                if (!level.content) {
                    errors.push(`❌ Level ohne content: ${level.id} in ${course.id}`);
                }
            }
        }
    }
    
    if (errors.length === 0) {
        console.log('✅ Alle Kurse haben valide Struktur');
    }
} catch (e) {
    errors.push(`❌ Strukturprüfung fehlgeschlagen: ${e.message}`);
}

// Ergebnis
console.log('\n' + '='.repeat(50));
if (errors.length === 0) {
    console.log('🎉 Alle Tests bestanden! Datenintegrität OK.');
    process.exit(0);
} else {
    console.log(`⚠️ ${errors.length} Fehler gefunden:`);
    errors.forEach(e => console.log(`   ${e}`));
    process.exit(1);
}
```

### 5.2 Package.json Scripts hinzufügen

```json
{
  "scripts": {
    "test:data-integrity": "node scripts/test-data-integrity.js",
    "backup": "bash scripts/backup-data.sh",
    "predev": "npm run test:data-integrity",
    "prebuild": "npm run test:data-integrity"
  }
}
```

### 5.3 Unit Tests (Optional, aber empfohlen)

```bash
npm install -D vitest @testing-library/react
```

---

## ✅ Migrations-Checkliste

### Pre-Flight Checklist
- [ ] Backup erstellt (`npm run backup`)
- [ ] Git-Tag gesetzt (`v1.0-stable`)
- [ ] `develop` Branch erstellt
- [ ] Datenintegritäts-Test läuft (`npm run test:data-integrity`)

### Phase 1: Backend
- [ ] `write-file-atomic` installiert
- [ ] `server.js` auf async umgestellt
- [ ] Alle Route-Handler async
- [ ] Server läuft noch (`npm run dev:server`)
- [ ] API-Endpunkte getestet (curl/Postman)
- [ ] **DATENINTEGRITÄT PRÜFEN**

### Phase 2: State Management
- [ ] `zustand` installiert
- [ ] `useAppStore.ts` erstellt
- [ ] Custom Hooks erstellt
- [ ] App lädt noch Daten korrekt
- [ ] **DATENINTEGRITÄT PRÜFEN**

### Phase 3: Frontend
- [ ] Ordnerstruktur angelegt
- [ ] `LevelPlayer` aufgeteilt
- [ ] Alle Renderer funktionieren
- [ ] `App.tsx` vereinfacht
- [ ] Navigation funktioniert
- [ ] **DATENINTEGRITÄT PRÜFEN**

### Phase 4: Services
- [ ] `zod` installiert
- [ ] `courseValidator.ts` erstellt
- [ ] `api.ts` mit Error Handling
- [ ] AI-Import validiert Kurse
- [ ] **DATENINTEGRITÄT PRÜFEN**

### Phase 5: Final
- [ ] Alle Tests laufen
- [ ] Production Build erfolgreich
- [ ] Deployment getestet
- [ ] **FINALER DATENINTEGRITÄTS-CHECK**
- [ ] PR nach `main` erstellt
- [ ] Code Review

---

## 📂 Neue Ordnerstruktur (Final)

```
Lernpfad/
├── .git/
├── .gitignore
├── .nvmrc
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
│
├── backups/                    # NEU: Automatische Backups
│   └── 20260104_091900/
│       ├── courses.json
│       └── stats.json
│
├── data/                       # ⚠️ GESCHÜTZT - NICHT ÄNDERN
│   ├── courses.json            # Produktionsdaten
│   └── stats.json              # Benutzerdaten
│
├── scripts/                    # NEU: Utility-Scripts
│   ├── backup-data.sh
│   └── test-data-integrity.js
│
├── server/                     # NEU: Backend-Modul
│   ├── index.js                # Server-Einstiegspunkt
│   ├── db.js                   # (Optional: SQLite)
│   └── routes/
│       ├── courses.js
│       └── stats.js
│
├── src/                        # NEU: Frontend-Struktur
│   ├── App.tsx                 # Vereinfacht (~100 Zeilen)
│   ├── index.tsx
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── dashboard/
│   │   ├── course/
│   │   ├── level-player/
│   │   ├── shop/
│   │   └── ai-import/
│   │
│   ├── hooks/
│   │   ├── useCourses.ts
│   │   ├── useUserStats.ts
│   │   └── useNavigation.ts
│   │
│   ├── stores/
│   │   └── useAppStore.ts
│   │
│   ├── services/
│   │   ├── api.ts
│   │   └── courseValidator.ts
│   │
│   ├── utils/
│   │   ├── sanitizeCourse.ts
│   │   └── dateUtils.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   └── constants/
│       ├── systemPrompt.ts
│       ├── shopItems.ts
│       └── colors.ts
│
├── Dockerfile
├── docker-compose.yaml
├── README.md
├── PROJEKT_ANALYSE.md
└── REFACTORING_PLAN.md         # Diese Datei
```

---

## 🚨 WICHTIGE HINWEISE

### Was NICHT geändert werden darf:
1. **`data/courses.json`** - Enthält alle Kurs-Daten
2. **`data/stats.json`** - Enthält Benutzer-Fortschritt
3. Die **API-Endpunkte** (`/api/courses`, `/api/stats`) müssen kompatibel bleiben

### Red Flags während der Arbeit:
- 🔴 `data/` Ordner wird im Git-Diff angezeigt → STOPP
- 🔴 `courses.json` ist leer oder kleiner geworden → STOPP, Backup wiederherstellen
- 🔴 Server antwortet nicht auf `/api/health` → STOPP

### Bei Problemen:
```bash
# Backup wiederherstellen
cp ~/lernpfad_backup_*/data/* ./data/

# Oder von Git
git checkout v1.0-stable -- data/
```

---

**Erstellt am:** 2026-01-04  
**Autor:** AI Assistant  
**Version:** 1.0
