import React from 'react';
import { Level } from '../../types';
import { Button } from '../common/Button';

interface LevelPreviewModalProps {
    level: Level;
    onClose: () => void;
    onStart: () => void;
}

export const LevelPreviewModal: React.FC<LevelPreviewModalProps> = ({ level, onClose, onStart }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 zoom-in-95">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl mb-4 border-4 border-white shadow-sm">
                        {level.type === 'THEORY' && '📖'}
                        {level.type === 'QUIZ' && '❓'}
                        {level.type === 'FLASHCARDS' && '🃏'}
                        {level.type === 'PRACTICE' && '🛠️'}
                        {level.type === 'SUMMARY' && '📑'}
                    </div>

                    <div className="text-xs font-black text-brand-sky uppercase tracking-widest mb-2 border border-brand-sky/30 bg-brand-sky/10 px-3 py-1 rounded-full">
                        {level.type}
                    </div>

                    <h2 className="text-2xl font-black text-gray-800 mb-2">{level.title}</h2>
                    <p className="text-gray-500 font-medium mb-8 leading-relaxed max-w-xs">
                        {level.content.description}
                    </p>

                    <div className="w-full grid grid-cols-2 gap-4">
                        <Button variant="secondary" fullWidth onClick={onClose}>Später</Button>
                        <Button variant="primary" fullWidth onClick={onStart}>Starten</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
