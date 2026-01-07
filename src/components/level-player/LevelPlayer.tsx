import React from 'react';
import { LevelRendererProps } from './types';
import { LevelType, Level } from '../../types';
import { TheoryRenderer } from './TheoryRenderer';
import { SummaryRenderer } from './SummaryRenderer';
import { QuizRenderer } from './QuizRenderer';
import { FlashcardRenderer } from './FlashcardRenderer';
import { PracticeRenderer } from './PracticeRenderer';

interface LevelPlayerProps {
    level: Level;
    onClose: () => void;
    onComplete: (score: number) => void;
}

const RENDERER_MAP: Record<LevelType, React.FC<LevelRendererProps>> = {
    [LevelType.THEORY]: TheoryRenderer,
    [LevelType.QUIZ]: QuizRenderer,
    [LevelType.FLASHCARDS]: FlashcardRenderer,
    [LevelType.PRACTICE]: PracticeRenderer,
    [LevelType.SUMMARY]: SummaryRenderer,
};

export const LevelPlayer: React.FC<LevelPlayerProps> = ({ level, onClose, onComplete }) => {
    React.useEffect(() => {
        // Prevent background scrolling when the player is open
        document.body.style.overflow = 'hidden';
        console.log('🔒 Scroll locked');

        return () => {
            // Restore scrolling when player closes
            document.body.style.overflow = '';
            console.log('🔓 Scroll unlocked');
        };
    }, []);

    const Renderer = RENDERER_MAP[level.type];

    if (!Renderer) {
        console.error(`Unknown level type: ${level.type}`);
        return null;
    }

    // Renderers handle their own fixed positioning/modal state
    return <Renderer level={level} onClose={onClose} onComplete={onComplete} />;
};
