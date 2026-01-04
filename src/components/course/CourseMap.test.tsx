import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CourseMap } from './CourseMap';
import { useAppStore } from '../../stores/useAppStore';

vi.mock('../../stores/useAppStore');

describe('CourseMap Progress Visualization', () => {
    const mockCourse = {
        id: 'course1',
        title: 'React Basics',
        icon: '⚛️',
        themeColor: 'brand-blue',
        totalProgress: 40,
        units: [
            {
                id: 'u1',
                title: 'Unit 1',
                colorTheme: 'brand-blue',
                levels: [{ id: 'l1', title: 'L1', status: 'completed' }, { id: 'l2', title: 'L2', status: 'locked' }]
            }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            selectedCourse: mockCourse,
            navigateTo: vi.fn(),
            selectLevel: vi.fn()
        });
    });

    it('renders a green progress fill on the path when progress > 0', () => {
        render(<CourseMap />);
        
        // We expect an element with bg-green-500 representing the filled path.
        // Since it's not implemented yet, this should fail.
        // We can look for it by a test ID or class.
        const progressFill = document.querySelector('.bg-green-500.rounded-full');
        expect(progressFill).toBeInTheDocument();
        
        // Check if it has a height related to progress
        // expect(progressFill).toHaveStyle({ height: '40%' }); // JSDOM might not calculate this perfectly if it's dynamic
    });

    it('has a glow effect on the progress path', () => {
        render(<CourseMap />);
        const progressFill = document.querySelector('.bg-green-500');
        expect(progressFill).toHaveClass('shadow-[0_0_15px_rgba(34,197,94,0.5)]'); // Example glow class
    });
});
