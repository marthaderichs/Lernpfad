import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
        window.confirm = vi.fn().mockReturnValue(true);
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

    it('allows editing the course icon and title', () => {
        const mockUpdateCourseProgress = vi.fn();
        (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            selectedCourse: mockCourse,
            navigateTo: vi.fn(),
            selectLevel: vi.fn(),
            updateCourseProgress: mockUpdateCourseProgress
        });

        render(<CourseMap />);
        
        // Find an edit button (we need to implement this)
        const editButton = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editButton);
        
        // Should show an input for title and icon
        const titleInput = screen.getByDisplayValue('React Basics');
        fireEvent.change(titleInput, { target: { value: 'Advanced React' } });
        
        // Save changes (assuming a save button or auto-save)
        // Let's assume a "Save" or just closing the edit mode saves.
        // For simplicity, let's assume it calls updateCourseProgress.
        expect(mockUpdateCourseProgress).toHaveBeenCalled();
    });

    it('shows the translation mode when "Add/Edit Portuguese" is clicked', () => {
        render(<CourseMap />);
        
        // Open settings
        const editButton = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editButton);
        
        // Find translation button (to be implemented)
        const transButton = screen.getByRole('button', { name: /Portugiesisch hinzufügen/i });
        fireEvent.click(transButton);
        
        // Should show split view with two textareas (to be implemented)
        const textareas = screen.getAllByRole('textbox');
        expect(textareas.length).toBeGreaterThanOrEqual(2);
    });
});
