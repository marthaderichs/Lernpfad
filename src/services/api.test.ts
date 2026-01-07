import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from './api';

// We need to mock fetch because api.ts uses it
global.fetch = vi.fn();

describe('Streak Logic', () => {
    const INITIAL_STATS = {
        totalXp: 0,
        coins: 0,
        currentStreak: 0,
        lastStudyDate: null,
        purchasedItems: [],
        activeAvatar: '🦸',
        darkMode: false
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    it('starts a streak on the first day', async () => {
        const today = '2026-01-04';
        vi.setSystemTime(new Date(today));
        
        // Mock loadUserStats to return initial stats
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, data: INITIAL_STATS })
        });
        
        // Mock saveUserStats
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true })
        });

        const updatedStats = await api.updateUserProgress(3);
        
        expect(updatedStats.currentStreak).toBe(1);
        expect(updatedStats.lastStudyDate).toBe(today);
    });

    it('increments streak on the next consecutive day', async () => {
        const yesterday = '2026-01-03';
        const today = '2026-01-04';
        
        const statsWithYesterday = {
            ...INITIAL_STATS,
            currentStreak: 1,
            lastStudyDate: yesterday
        };

        vi.setSystemTime(new Date(today));
        
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, data: statsWithYesterday })
        });
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true })
        });

        const updatedStats = await api.updateUserProgress(3);
        
        expect(updatedStats.currentStreak).toBe(2);
        expect(updatedStats.lastStudyDate).toBe(today);
    });

    it('resets streak if a day is skipped', async () => {
        const dayBeforeYesterday = '2026-01-02';
        const today = '2026-01-04';
        
        const statsWithOldDate = {
            ...INITIAL_STATS,
            currentStreak: 5,
            lastStudyDate: dayBeforeYesterday
        };

        vi.setSystemTime(new Date(today));
        
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, data: statsWithOldDate })
        });
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true })
        });

        const updatedStats = await api.updateUserProgress(3);
        
        expect(updatedStats.currentStreak).toBe(1);
        expect(updatedStats.lastStudyDate).toBe(today);
    });

    it('resets streak during loadUserStats if a day was missed', async () => {
        const dayBeforeYesterday = '2026-01-02';
        const today = '2026-01-04';
        
        const statsWithOldDate = {
            ...INITIAL_STATS,
            currentStreak: 5,
            lastStudyDate: dayBeforeYesterday
        };

        vi.setSystemTime(new Date(today));
        
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, data: statsWithOldDate })
        });

        const loadedStats = await api.loadUserStats();
        
        // It should have reset the streak because yesterday (Jan 3) was missed
        expect(loadedStats.currentStreak).toBe(0);
    });
});
