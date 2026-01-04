import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from './useAppStore';
import * as api from '../services/api';

// Mock the API
vi.mock('../services/api', () => ({
    loadCourses: vi.fn(),
    loadUserStats: vi.fn(),
    saveCourses: vi.fn(),
    saveUserStats: vi.fn(),
    addCourse: vi.fn(),
    deleteCourse: vi.fn(),
}));

describe('useAppStore Folder Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset Zustand store if possible, or just set initial state
        useAppStore.setState({
            courses: [],
            currentFolderId: null,
            selectedCourse: null,
        });
    });

    it('should have initial currentFolderId as null', () => {
        const state = useAppStore.getState();
        expect(state.currentFolderId).toBe(null);
    });

    it('should update currentFolderId when navigating', () => {
        const { navigateToFolder } = useAppStore.getState();
        navigateToFolder('folder-123');
        expect(useAppStore.getState().currentFolderId).toBe('folder-123');
    });

    it('should add a folder and call api.addCourse', async () => {
        const newFolder = {
            id: 'f1',
            type: 'folder' as const,
            title: 'New Folder',
            icon: '📁',
            themeColor: 'brand-blue',
            parentFolderId: null
        };

        (api.addCourse as any).mockResolvedValueOnce([newFolder]);

        // We'll need to implement this action
        const { addFolder } = useAppStore.getState();
        await addFolder(newFolder);

        expect(api.addCourse).toHaveBeenCalledWith(newFolder);
        expect(useAppStore.getState().courses).toContainEqual(newFolder);
    });
});
