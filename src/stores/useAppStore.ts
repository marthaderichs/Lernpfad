import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Course, UserStats, ViewState, DashboardItem, Folder } from '../types';
import * as api from '../services/api';

interface AppState {
    // State
    courses: DashboardItem[];
    userStats: UserStats | null;
    currentView: ViewState;
    currentFolderId: string | null;
    selectedCourse: Course | null;
    selectedLevelIndex: number | null;
    isEditMode: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    loadInitialData: () => Promise<void>;
    toggleEditMode: () => void;
    setCourses: (courses: DashboardItem[]) => void;
    addCourse: (course: Course) => Promise<void>;
    addFolder: (folder: Folder) => Promise<void>;
    deleteCourse: (courseId: string) => Promise<void>;
    deleteFolder: (folderId: string) => Promise<void>;
    updateCourseProgress: (courseId: string, progress: Partial<Course>) => void;
    moveItem: (itemId: string, targetFolderId: string | null) => Promise<void>;
    reorderItems: (items: DashboardItem[]) => Promise<void>;

    setUserStats: (stats: UserStats) => void;
    updateUserProgress: (starsEarned: number) => Promise<void>;
    updateSystemPrompt: (prompt: string) => Promise<void>;

    navigateTo: (view: ViewState) => void;
    navigateToFolder: (folderId: string | null) => void;
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
            currentFolderId: null,
            selectedCourse: null,
            selectedLevelIndex: null,
            isEditMode: false,
            isLoading: false,
            error: null,

            // Actions
            toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),

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

            addFolder: async (folder) => {
                set({ isLoading: true });
                try {
                    const updatedCourses = await api.addCourse(folder);
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

            deleteFolder: async (folderId) => {
                set({ isLoading: true });
                try {
                    const updatedCourses = await api.deleteCourse(folderId);
                    set({ courses: updatedCourses, isLoading: false });
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            },

            updateCourseProgress: (courseId, progress) => {
                const { courses, selectedCourse } = get();
                const updated = courses.map(item =>
                    item.id === courseId && item.type === 'course'
                        ? { ...item, ...progress } as Course
                        : item
                );
                // Also update selectedCourse if it's the one being modified
                const updatedSelectedCourse = selectedCourse?.id === courseId
                    ? { ...selectedCourse, ...progress }
                    : selectedCourse;
                set({ courses: updated, selectedCourse: updatedSelectedCourse });
                api.saveCourses(updated); // Fire and forget
            },

            moveItem: async (itemId, targetFolderId) => {
                const { courses } = get();
                const updated = courses.map(item =>
                    item.id === itemId
                        ? { ...item, parentFolderId: targetFolderId }
                        : item
                );
                set({ courses: updated as DashboardItem[] });
                await api.saveCourses(updated as DashboardItem[]);
            },

            reorderItems: async (newOrderItems) => {
                 set({ courses: newOrderItems });
                 await api.saveCourses(newOrderItems);
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
            navigateToFolder: (folderId) => set({ currentFolderId: folderId }),
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
