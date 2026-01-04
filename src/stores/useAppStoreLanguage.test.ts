import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from './useAppStore';

// Mock the API
vi.mock('../services/api', () => ({
    loadCourses: vi.fn(),
    loadUserStats: vi.fn(),
    saveCourses: vi.fn(),
    saveUserStats: vi.fn(),
    addCourse: vi.fn(),
    deleteCourse: vi.fn(),
}));

describe('Bilingual Support Store', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAppStore.setState({
            contentLanguage: 'DE'
        });
    });

    it('defaults to DE', () => {
        const state = useAppStore.getState();
        expect(state.contentLanguage).toBe('DE');
    });

    it('toggles language between DE and PT', () => {
        const { toggleContentLanguage } = useAppStore.getState();
        
        toggleContentLanguage();
        expect(useAppStore.getState().contentLanguage).toBe('PT');
        
        toggleContentLanguage();
        expect(useAppStore.getState().contentLanguage).toBe('DE');
    });
});
