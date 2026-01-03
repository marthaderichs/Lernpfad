import { Course, UserStats } from '../types';
import { INITIAL_COURSES } from '../constants';

const COURSE_STORAGE_KEY = 'lernpfad_courses_v1';
const STATS_STORAGE_KEY = 'lernpfad_stats_v1';

// --- COURSES ---

export const saveCourses = (courses: Course[]) => {
  try {
    localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(courses));
  } catch (e) {
    console.error("Failed to save courses", e);
  }
};

export const loadCourses = (): Course[] => {
  try {
    const data = localStorage.getItem(COURSE_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load courses", e);
  }
  return INITIAL_COURSES;
};

export const addCourse = (newCourse: Course) => {
  const current = loadCourses();
  const updated = [...current, newCourse];
  saveCourses(updated);
  return updated;
};

// --- USER STATS (XP & STREAK) ---

const INITIAL_STATS: UserStats = {
  totalXp: 0,
  currentStreak: 0,
  lastStudyDate: null
};

export const loadUserStats = (): UserStats => {
  try {
    const data = localStorage.getItem(STATS_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load stats", e);
  }
  return INITIAL_STATS;
};

export const saveUserStats = (stats: UserStats) => {
  localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
};

export const updateUserProgress = (starsEarned: number): UserStats => {
  const stats = loadUserStats();
  const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  
  // 1. Calculate XP
  // 1 Star = 10xp, 2 Stars = 25xp, 3 Stars = 50xp
  const xpGain = starsEarned === 3 ? 50 : starsEarned === 2 ? 25 : 10;
  stats.totalXp += xpGain;

  // 2. Calculate Streak
  if (stats.lastStudyDate !== today) {
    if (stats.lastStudyDate) {
      const lastDate = new Date(stats.lastStudyDate);
      const currentDate = new Date(today);
      
      // Calc difference in days
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
        // Consecutive day
        stats.currentStreak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        stats.currentStreak = 1;
      }
    } else {
      // First time ever
      stats.currentStreak = 1;
    }
    stats.lastStudyDate = today;
  }

  saveUserStats(stats);
  return stats;
};