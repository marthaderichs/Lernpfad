import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from './useAppStore';
import * as api from '../services/api';
import { Course } from '../types';

// Mock the API
vi.mock('../services/api', () => ({
    loadCourses: vi.fn(),
    loadUserStats: vi.fn(),
    saveCourses: vi.fn(),
    saveUserStats: vi.fn(),
    addCourse: vi.fn(),
    deleteCourse: vi.fn(),
}));

describe('useAppStore addCourse', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAppStore.setState({
            courses: [],
            error: null,
            isLoading: false,
        });
    });

    const mockCourse: Course = {
        id: 'c1',
        title: 'Mock Course',
        icon: '📚',
        totalProgress: 0,
        themeColor: 'brand-blue',
        units: [],
        type: 'course'
    };

    it('should add a course successfully', async () => {
        (api.addCourse as any).mockResolvedValueOnce([mockCourse]);

        const { addCourse } = useAppStore.getState();
        await addCourse(mockCourse);

        expect(api.addCourse).toHaveBeenCalledWith(mockCourse);
        expect(useAppStore.getState().courses).toContainEqual(mockCourse);
        expect(useAppStore.getState().error).toBe(null);
    });

    it('should handle API failure', async () => {
        const errorMessage = 'Network Error';
        (api.addCourse as any).mockRejectedValueOnce(new Error(errorMessage));

        const { addCourse } = useAppStore.getState();
        await expect(addCourse(mockCourse)).rejects.toThrow(errorMessage);

        expect(useAppStore.getState().error).toBe(errorMessage);
        expect(useAppStore.getState().isLoading).toBe(false);
    });
});
