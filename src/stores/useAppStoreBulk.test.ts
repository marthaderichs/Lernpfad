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

describe('useAppStore Bulk Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAppStore.setState({
            courses: [
                { id: 'c1', type: 'course', title: 'C1', parentFolderId: null } as any,
                { id: 'c2', type: 'course', title: 'C2', parentFolderId: null } as any,
                { id: 'f1', type: 'folder', title: 'F1', parentFolderId: null } as any,
            ],
            isEditMode: true,
            selectedItemIds: [],
        });
    });

    it('toggles selection correctly', () => {
        const { toggleItemSelection } = useAppStore.getState();
        
        toggleItemSelection('c1');
        expect(useAppStore.getState().selectedItemIds).toEqual(['c1']);
        
        toggleItemSelection('c2');
        expect(useAppStore.getState().selectedItemIds).toEqual(['c1', 'c2']);
        
        toggleItemSelection('c1');
        expect(useAppStore.getState().selectedItemIds).toEqual(['c2']);
    });

    it('clears selection when toggling edit mode', () => {
        useAppStore.setState({ selectedItemIds: ['c1'] });
        const { toggleEditMode } = useAppStore.getState();
        
        toggleEditMode();
        expect(useAppStore.getState().selectedItemIds).toEqual([]);
        expect(useAppStore.getState().isEditMode).toBe(false);
    });

    it('moves multiple items to a folder', async () => {
        const { moveItems } = useAppStore.getState();
        
        await moveItems(['c1', 'c2'], 'f1');
        
        const courses = useAppStore.getState().courses;
        const c1 = courses.find(c => c.id === 'c1');
        const c2 = courses.find(c => c.id === 'c2');
        
        expect(c1?.parentFolderId).toBe('f1');
        expect(c2?.parentFolderId).toBe('f1');
        expect(useAppStore.getState().selectedItemIds).toEqual([]);
        expect(api.saveCourses).toHaveBeenCalled();
    });
});
