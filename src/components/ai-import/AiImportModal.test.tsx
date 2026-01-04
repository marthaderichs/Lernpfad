import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

    it('calls addCourse when "Kurs erstellen" is clicked with valid JSON', async () => {
        const mockAddCourse = vi.fn().mockResolvedValue(undefined);
        (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            userStats: { systemPrompt: '...' },
            addCourse: mockAddCourse
        });

        const onClose = vi.fn();
        render(<AiImportModal onClose={onClose} />);

        const jsonInput = JSON.stringify({ title: 'Test Course', units: [] });
        const textarea = screen.getByPlaceholderText(/Füge hier das generierte JSON ein/i);
        fireEvent.change(textarea, { target: { value: jsonInput } });

        const createButton = screen.getByRole('button', { name: /Kurs erstellen/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(mockAddCourse).toHaveBeenCalled();
            expect(onClose).toHaveBeenCalled();
        });
    });

    it('calls addCourse with merged translations when bilingual mode is active', async () => {
        const mockAddCourse = vi.fn().mockResolvedValue(undefined);
        (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            userStats: { systemPrompt: '...' },
            addCourse: mockAddCourse
        });

        const onClose = vi.fn();
        render(<AiImportModal onClose={onClose} />);

        // Toggle bilingual
        const toggleButton = screen.getByText(/Zweite Sprache hinzufügen/i);
        fireEvent.click(toggleButton);

        const deJson = JSON.stringify({ 
            title: 'German Title', 
            units: [{ title: 'Unit 1', description: 'Desc 1', levels: [{ title: 'L1', type: 'QUIZ', status: 'UNLOCKED', stars: 0, content: {} }] }] 
        });
        const ptJson = JSON.stringify({ 
            title: 'Portuguese Title', 
            units: [{ title: 'Unidade 1', description: 'Desc PT 1', levels: [{ content: { title: 'L1 PT' } }] }] 
        });

        const textareas = screen.getAllByPlaceholderText(/Füge hier das generierte JSON ein/i);
        fireEvent.change(textareas[0], { target: { value: deJson } });
        fireEvent.change(textareas[1], { target: { value: ptJson } });

        const createButton = screen.getByRole('button', { name: /Kurs erstellen/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(mockAddCourse).toHaveBeenCalledWith(expect.objectContaining({
                title: 'German Title',
                titlePT: 'Portuguese Title'
            }));
            expect(onClose).toHaveBeenCalled();
        });
    });
});
