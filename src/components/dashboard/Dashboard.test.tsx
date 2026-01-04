import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { useAppStore } from '../../stores/useAppStore';

// Mock the store
vi.mock('../../stores/useAppStore');

describe('Dashboard Header & Navigation', () => {
    const mockNavigateTo = vi.fn();
    const mockUserStats = {
        activeAvatar: '👨‍🎓',
        currentStreak: 5,
        totalXp: 1000,
        coins: 50,
        unlockedCourses: ['course1'],
        completedLevels: []
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            courses: [],
            userStats: mockUserStats,
            selectCourse: vi.fn(),
            deleteCourse: vi.fn(),
            navigateTo: mockNavigateTo
        });
    });

    it('renders the header with compact stats (Streak, XP, Coins)', () => {
        render(<Dashboard />);
        
        // These should exist
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText(/1[.,]000/)).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();
        
        // Check for specific "Header" structure elements we plan to implement
        // We want a compact header, so maybe check for a specific class or container
        // For now, let's just ensure the data is there.
    });

    it('does NOT render a standalone Shop button', () => {
        render(<Dashboard />);
        
        // We expect the explicit "Shop" button to be gone.
        // In the current code, it has text "Shop".
        // queryByText returns null if not found.
        const shopButton = screen.queryByRole('button', { name: /shop/i });
        expect(shopButton).not.toBeInTheDocument(); 
    });

    it('navigates to SHOP when clicking the Coins display', () => {
        render(<Dashboard />);
        
        // Find the element containing '50' (the coins value)
        const coinsValue = screen.getByText('50');
        // The click handler is on the parent container (HeaderStat)
        // We look for the cursor-pointer class which we added to clickable HeaderStats
        const card = coinsValue.closest('.cursor-pointer');
        
        expect(card).toBeInTheDocument();
        if (card) {
            fireEvent.click(card);
            expect(mockNavigateTo).toHaveBeenCalledWith('SHOP');
        }
    });
});
