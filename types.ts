/**
 * AI INTEGRATION GUIDE (DESIGN CONCEPT):
 * 
 * To add a new course to this platform via AI, the AI simply needs to generate
 * a JSON object that matches the `Course` interface below.
 */

export enum LevelType {
  THEORY = 'THEORY',         // Markdown reading
  QUIZ = 'QUIZ',             // Multiple choice (4 options) with detailed feedback
  FLASHCARDS = 'FLASHCARDS', // Front/Back cards with repetition logic
  PRACTICE = 'PRACTICE',     // Multi-step task with solution reveal
  SUMMARY = 'SUMMARY'        // Bullet points / Checklist
}

export enum LevelStatus {
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
  COMPLETED = 'COMPLETED'
}

export interface QuizOption {
  text: string;
  explanation: string; // Specific feedback for this option (Why it's right/wrong)
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[]; // Must be exactly 4 options
  answerIndex: number; // 0-3
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface PracticeTask {
  question: string; // Markdown supported
  hint?: string;
  solution: string; // Markdown supported
}

export interface LevelContent {
  // Common
  title: string;
  description: string; // Short preview text
  
  // Type: THEORY & SUMMARY
  markdownContent?: string; // Main text content
  
  // Type: QUIZ
  quizQuestions?: QuizQuestion[];
  
  // Type: FLASHCARDS
  flashcards?: Flashcard[];

  // Type: PRACTICE
  practiceTasks?: PracticeTask[];
}

export interface Level {
  id: string;
  title: string;
  type: LevelType;
  status: LevelStatus;
  stars: 0 | 1 | 2 | 3;
  content: LevelContent;
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  levels: Level[];
  colorTheme: string;
}

export interface Course {
  id: string;
  title: string;
  professor?: string;
  icon: string;
  totalProgress: number;
  themeColor: string;
  units: Unit[]; 
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: 'avatar' | 'theme' | 'powerup' | 'badge';
  unlocked?: boolean;
}

export interface UserStats {
  totalXp: number;
  coins: number; // Spendable currency (earned from XP)
  currentStreak: number;
  lastStudyDate: string | null; // ISO Date String "YYYY-MM-DD"
  purchasedItems: string[]; // IDs of purchased shop items
  activeAvatar: string; // Currently selected avatar emoji
  darkMode: boolean;
}

export type ViewState = 'DASHBOARD' | 'COURSE_MAP' | 'SHOP';