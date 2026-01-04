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
    updateSystemPrompt: (prompt: string) => Promise<void>;

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

            updateSystemPrompt: async (prompt) => {
                const { userStats } = get();
                if (!userStats) return;
                const updated = { ...userStats, systemPrompt: prompt };
                set({ userStats: updated });
                await api.saveUserStats(updated);
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
                // Nur UI-State persistieren, keine Daten die vom Server kommen sollten?
                // Actually persisting currentView is good for refresh.
                // Persisting userStats/courses might be good for offline fallback/speed, 
                // but we fetch on load.
                currentView: state.currentView,
            }),
        }
    )
);
