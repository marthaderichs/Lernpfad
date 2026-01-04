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

    it('allows editing the system prompt and saves it', () => {
        render(<AiImportModal onClose={() => {}} />);
        
        // We expect a textarea for the prompt now
        const promptEditor = screen.getByPlaceholderText(/System Prompt hier bearbeiten/i);
        fireEvent.change(promptEditor, { target: { value: 'Updated Prompt' } });
        
        // It should call the store to save
        expect(mockUpdateSystemPrompt).toHaveBeenCalledWith('Updated Prompt');
    });
});
