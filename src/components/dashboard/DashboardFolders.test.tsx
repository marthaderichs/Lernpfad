import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { useAppStore } from '../../stores/useAppStore';
import { DashboardItem } from '../../types';

// Mock the store
vi.mock('../../stores/useAppStore');

describe('Dashboard Folder Functionality', () => {
    const mockNavigateToFolder = vi.fn();
    const mockNavigateTo = vi.fn();
    const mockUserStats = {
        activeAvatar: '👨‍🎓',
        currentStreak: 5,
        totalXp: 1000,
        coins: 50
    };

    const mockCourses: DashboardItem[] = [
        {
            id: 'f1',
            type: 'folder',
            title: 'Mathematics',
            icon: '📁',
            themeColor: 'brand-blue',
            parentFolderId: null
        },
        {
            id: 'c1',
            type: 'course',
            title: 'Algebra',
            icon: '🔢',
            themeColor: 'brand-green',
            totalProgress: 40,
            parentFolderId: 'f1',
            units: []
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders top-level folders and courses', () => {
        (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            courses: mockCourses,
            userStats: mockUserStats,
            currentFolderId: null,
            isEditMode: false,
            selectedItemIds: [],
            selectCourse: vi.fn(),
            deleteCourse: vi.fn(),
            deleteFolder: vi.fn(),
            navigateTo: mockNavigateTo,
            navigateToFolder: mockNavigateToFolder
        });

        render(<Dashboard />);
        
        expect(screen.getByText('Mathematics')).toBeInTheDocument();
        expect(screen.queryByText('Algebra')).not.toBeInTheDocument(); // Algebra is inside Mathematics
    });

    it('navigates into a folder when clicked', () => {
        (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            courses: mockCourses,
            userStats: mockUserStats,
            currentFolderId: null,
            isEditMode: false,
            selectedItemIds: [],
            selectCourse: vi.fn(),
            deleteCourse: vi.fn(),
            deleteFolder: vi.fn(),
            navigateTo: mockNavigateTo,
            navigateToFolder: mockNavigateToFolder
        });

        render(<Dashboard />);
        
        const folderCard = screen.getByText('Mathematics');
        fireEvent.click(folderCard);
        
        expect(mockNavigateToFolder).toHaveBeenCalledWith('f1');
    });

    it('renders contents of the current folder', () => {
        (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            courses: mockCourses,
            userStats: mockUserStats,
            currentFolderId: 'f1',
            isEditMode: false,
            selectedItemIds: [],
            selectCourse: vi.fn(),
            deleteCourse: vi.fn(),
            deleteFolder: vi.fn(),
            navigateTo: mockNavigateTo,
            navigateToFolder: mockNavigateToFolder
        });

        render(<Dashboard />);
        
        expect(screen.getByText('Algebra')).toBeInTheDocument();
        expect(screen.getByText('Zurück')).toBeInTheDocument();
    });
});
