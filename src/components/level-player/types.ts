import { Level, Flashcard } from '../../types';

export interface LevelRendererProps {
    level: Level;
    onComplete: (score: number) => void;
    onClose: () => void;
}

export interface QuizState {
    currentQuestion: number;
    score: number;
    selectedAnswer: number | null;
    showResult: boolean;
}

export interface PlayableCard extends Flashcard {
    _id: string;
}

export interface FlashcardState {
    queue: PlayableCard[];
    isFlipped: boolean;
    completedCount: number;
    colors: string[];
    mistakeIds: Set<string>;
    initialTotal: number;
}
