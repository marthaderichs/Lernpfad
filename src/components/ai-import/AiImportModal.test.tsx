import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AiImportModal } from './AiImportModal';
import { useAppStore } from '../../stores/useAppStore';

vi.mock('../../stores/useAppStore');

describe('AiImportModal Simplified & Editable Prompt', () => {
    const mockUpdateSystemPrompt = vi.fn();
    
    beforeEach(() => {
        vi.clearAllMocks();
        (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            userStats: {
                systemPrompt: 'Original Prompt'
            },
            updateSystemPrompt: mockUpdateSystemPrompt,
            addCourse: vi.fn()
        });
    });

    it('renders only the Copy button and prompt editor/display, no long instructions', () => {
        render(<AiImportModal onClose={() => {}} />);
        
        // Should have copy button
        expect(screen.getByRole('button', { name: /kopieren/i })).toBeInTheDocument();
        
        // Should NOT have the "Wie es funktioniert" long text anymore
        expect(screen.queryByText(/Dieser Prompt enthält das/i)).not.toBeInTheDocument();
    });

    it('allows editing the system prompt in a separate modal', () => {
        render(<AiImportModal onClose={() => {}} />);
        
        // Find Edit button by title
        const editButton = screen.getByTitle('Prompt bearbeiten');
        fireEvent.click(editButton);
        
        // Find textarea in modal (it will have the original value)
        const promptEditor = screen.getByDisplayValue('Original Prompt');
        fireEvent.change(promptEditor, { target: { value: 'Updated Prompt' } });
        
        // Save
        const saveButton = screen.getByRole('button', { name: /speichern/i });
        fireEvent.click(saveButton);
        
        // Verify save call
        expect(mockUpdateSystemPrompt).toHaveBeenCalledWith('Updated Prompt');
    });
});
