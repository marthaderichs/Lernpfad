import React, { useState, useEffect } from 'react';
import { LevelRendererProps, PlayableCard } from './types';
import { Button, LatexRenderer } from '../common';
import { X, Check, RefreshCw, Zap, RotateCw, Lightbulb, ThumbsUp, ThumbsDown } from 'lucide-react';
import { LevelType } from '../../types';

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

export const FlashcardRenderer: React.FC<LevelRendererProps> = ({ level, onClose, onComplete }) => {
    const [cardQueue, setCardQueue] = useState<PlayableCard[]>([]);
    const [isFlipped, setIsFlipped] = useState(false);
    const [completedCards, setCompletedCards] = useState(0);
    const [cardColors, setCardColors] = useState<string[]>([]);
    const [mistakeIds, setMistakeIds] = useState<Set<string>>(new Set());
    const [initialTotalCards, setInitialTotalCards] = useState(0);

    useEffect(() => {
        if (level.type === LevelType.FLASHCARDS && level.content.flashcards) {
            const preparedCards = level.content.flashcards.map((c, i) => ({ ...c, _id: `card_${i}` }));
            setCardQueue(shuffleArray(preparedCards));
            setInitialTotalCards(preparedCards.length);

            const colors = ['bg-brand-purple', 'bg-brand-blue', 'bg-brand-teal', 'bg-brand-orange', 'bg-brand-red', 'bg-brand-pink'];
            setCardColors(Array(20).fill(0).map(() => colors[Math.floor(Math.random() * colors.length)]));
        }
    }, [level]);

    if (cardQueue.length === 0 && completedCards > 0) {
        // STAT BOARD
        const total = initialTotalCards;
        const mistakes = mistakeIds.size;
        const correctFirstTry = total - mistakes;
        const accuracy = Math.round((correctFirstTry / total) * 100);

        const stars = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1;

        let emoji = "🤔";
        let title = "Guter Anfang!";
        if (accuracy === 100) { emoji = "🔥"; title = "Perfekt!"; }
        else if (accuracy >= 80) { emoji = "😎"; title = "Starke Leistung!"; }
        else if (accuracy >= 50) { emoji = "👍"; title = "Gut Gemacht!"; }

        const gradient = `conic-gradient(var(--brand-green) ${accuracy}%, #f3f4f6 0)`;

        return (
            <div className="fixed inset-0 z-[60] bg-gray-50 flex items-center justify-center p-6 animate-in zoom-in-95">
                <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border-4 border-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-sky/10 to-transparent pointer-events-none" />

                    <div className="relative z-10 text-center">
                        <div className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Zusammenfassung</div>

                        <div className="w-40 h-40 mx-auto mb-6 rounded-full flex items-center justify-center relative shadow-lg"
                            style={{ background: gradient, '--brand-green': '#75D06A' } as React.CSSProperties}>
                            <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center z-10">
                                <span className="text-4xl animate-bounce">{emoji}</span>
                                <span className="text-2xl font-black text-gray-800 mt-1">{accuracy}%</span>
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-gray-800 mb-2">{title}</h2>
                        <p className="text-gray-500 font-medium mb-8">Du hast {total} Karten gelernt.</p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-green-50 border-2 border-green-100 p-4 rounded-2xl flex flex-col items-center">
                                <span className="text-2xl font-black text-green-600 mb-1">{correctFirstTry}</span>
                                <span className="text-xs font-bold text-green-800 uppercase flex items-center gap-1">
                                    <Check size={12} /> Sofort Gewusst
                                </span>
                            </div>
                            <div className="bg-orange-50 border-2 border-orange-100 p-4 rounded-2xl flex flex-col items-center">
                                <span className="text-2xl font-black text-orange-500 mb-1">{mistakes}</span>
                                <span className="text-xs font-bold text-orange-800 uppercase flex items-center gap-1">
                                    <RefreshCw size={12} /> Wiederholt
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 mb-8 flex items-center justify-center gap-2 text-gray-400 font-bold text-sm">
                            <Zap size={16} className="text-yellow-400 fill-current" />
                            +{stars === 3 ? 50 : stars === 2 ? 25 : 10} XP verdient
                        </div>

                        <Button variant="primary" fullWidth onClick={() => onComplete(stars)} className="py-4 text-lg shadow-xl">
                            Weiter
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (cardQueue.length === 0) return null;

    const currentCard = cardQueue[0];
    const currentColor = cardColors[completedCards % cardColors.length] || 'bg-brand-purple';

    const handleRating = (known: boolean) => {
        setIsFlipped(false);

        setTimeout(() => {
            if (known) {
                setCompletedCards(p => p + 1);
                setCardQueue(prev => prev.slice(1));
            } else {
                setMistakeIds(prev => new Set(prev).add(currentCard._id));
                const newQueue = [...cardQueue.slice(1), currentCard];
                setCardQueue(newQueue);
            }
        }, 200);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-[#f0f9ff] flex flex-col items-center justify-center p-6 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center text-gray-500 font-bold uppercase tracking-widest text-sm z-10">
                <button onClick={onClose} className="hover:text-gray-800 transition-colors"><X /></button>
                <div className="flex flex-col items-center">
                    <span className="text-gray-400">Lernstapel</span>
                    <div className="flex gap-1 mt-1">
                        <span className="text-green-500">{completedCards} Fertig</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-orange-500">{cardQueue.length} Offen</span>
                    </div>
                </div>
                <div className="w-6" />
            </div>

            <div
                className="w-full max-w-sm aspect-[3/4] relative cursor-pointer group mb-8"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div
                    className={`absolute inset-0 bg-white rounded-[2rem] shadow-xl flex flex-col items-center justify-center p-8 border-4 border-gray-100 transition-all duration-300 ${isFlipped ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
                        }`}
                >
                    <div className="absolute top-8 text-gray-200 font-black text-8xl select-none">?</div>
                    <h3 className="text-3xl font-black text-gray-800 text-center leading-tight select-none relative z-10">
                        <LatexRenderer>{currentCard.front}</LatexRenderer>
                    </h3>
                    <div className="absolute bottom-10 text-gray-400 font-bold text-xs flex items-center gap-2 animate-pulse uppercase tracking-widest">
                        <RotateCw size={14} /> Tippen zum Umdrehen
                    </div>
                </div>

                <div
                    className={`absolute inset-0 ${currentColor} rounded-[2rem] shadow-xl flex flex-col items-center justify-center p-8 border-4 border-white/30 text-white transition-all duration-300 ${isFlipped ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                        }`}
                >
                    <div className="absolute top-8 right-8 text-white/20"><Lightbulb size={40} /></div>
                    <div className="text-xl font-bold text-center leading-relaxed select-none">
                        <LatexRenderer>{currentCard.back}</LatexRenderer>
                    </div>
                </div>
            </div>

            <div className={`w-full max-w-sm flex gap-4 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <button
                    onClick={(e) => { e.stopPropagation(); handleRating(false); }}
                    className="flex-1 bg-red-500 hover:bg-red-400 text-white p-4 rounded-2xl font-bold border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center gap-1"
                >
                    <ThumbsDown size={24} />
                    <span className="text-xs uppercase">Noch nicht</span>
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); handleRating(true); }}
                    className="flex-1 bg-green-500 hover:bg-green-400 text-white p-4 rounded-2xl font-bold border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center gap-1"
                >
                    <ThumbsUp size={24} />
                    <span className="text-xs uppercase">Gewusst</span>
                </button>
            </div>
        </div>
    );
};
