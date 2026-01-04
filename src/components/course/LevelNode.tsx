import React from 'react';
import { Level, LevelStatus, LevelType } from '../../types';
import { Lock, Play, CheckCircle, Book, Star, Check } from 'lucide-react';

interface LevelNodeProps {
    level: Level;
    color: string;
    onClick: () => void;
    index: number;
}

export const LevelNode: React.FC<LevelNodeProps> = ({ level, color, onClick, index }) => {
    const isLocked = level.status === LevelStatus.LOCKED;
    const isCompleted = level.status === LevelStatus.COMPLETED;

    // Logic: Only Quizzes and Flashcards get a Star rating (performance based).
    // Theory, Practice, and Summary are binary (Completed or Not).
    const isGradedActivity = level.type === LevelType.QUIZ || level.type === LevelType.FLASHCARDS;

    // Safe color fallback to prevent crashes if data is missing
    const themeColor = color || 'brand-blue';
    const colorName = themeColor.replace('brand-', '');

    const offset = index % 2 === 0 ? '-translate-x-14' : 'translate-x-14';

    return (
        <div className={`flex flex-col items-center justify-center mb-16 relative z-10 ${offset} transition-transform duration-500 group`}>
            <button
                onClick={onClick}
                disabled={isLocked}
                className={`
          w-24 h-24 rounded-full flex items-center justify-center 
          border-b-8 transition-all duration-300 transform
          ${isLocked
                        ? 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-80'
                        : `bg-${themeColor} border-${colorName}-600 hover:scale-110 active:scale-95 cursor-pointer shadow-lg hover:shadow-xl`
                    }
        `}
                style={{ backgroundColor: !isLocked ? `var(--${themeColor})` : undefined }}
            >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center border-b-8 ${isLocked ? 'bg-gray-200 border-gray-300' :
                    themeColor === 'brand-purple' ? 'bg-brand-purple border-purple-700' :
                        themeColor === 'brand-green' ? 'bg-brand-green border-green-700' :
                            themeColor === 'brand-orange' ? 'bg-brand-orange border-orange-600' :
                                themeColor === 'brand-blue' ? 'bg-brand-blue border-indigo-700' :
                                    themeColor === 'brand-sky' ? 'bg-brand-sky border-sky-700' :
                                        themeColor === 'brand-teal' ? 'bg-brand-teal border-teal-700' :
                                            themeColor === 'brand-red' ? 'bg-brand-red border-red-700' :
                                                themeColor === 'brand-pink' ? 'bg-brand-pink border-[#d87a9e]' :
                                                    'bg-brand-blue border-blue-600'
                    }`}>
                    {isCompleted ? (
                        <CheckCircle className="text-white w-10 h-10 drop-shadow-md" />
                    ) : isLocked ? (
                        <Lock className="text-gray-400 w-8 h-8" />
                    ) : level.type === 'SUMMARY' || level.type === 'THEORY' ? (
                        <Book className="text-white w-9 h-9 fill-current drop-shadow-md" />
                    ) : (
                        <Play className="text-white w-9 h-9 fill-current drop-shadow-md" />
                    )}
                </div>

                {/* BADGES */}
                {!isLocked && (
                    <>
                        {/* Case 1: Graded Activity (Show Stars) */}
                        {isGradedActivity && (
                            <div className={`absolute -top-1 ${index % 2 === 0 ? '-left-1' : '-right-1'} flex items-center gap-0.5 bg-yellow-400 px-2 py-1.5 rounded-full shadow-md border-b-2 border-yellow-600 animate-bounce-subtle`}>
                                {[1, 2, 3].map((starIdx) => (
                                    <Star
                                        key={starIdx}
                                        size={10}
                                        strokeWidth={3}
                                        className={`${starIdx <= level.stars ? 'fill-white text-white' : 'text-yellow-600/40'} transition-all`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Case 2: Non-Graded Activity (Show Checkmark ONLY if completed) */}
                        {!isGradedActivity && isCompleted && (
                            <div className={`absolute -top-1 ${index % 2 === 0 ? '-left-1' : '-right-1'} flex items-center gap-1 bg-green-500 text-white px-2 py-1.5 rounded-full shadow-md border-b-2 border-green-700 animate-bounce-subtle`}>
                                <Check size={12} strokeWidth={4} />
                                <span className="text-[10px] font-black uppercase">Fertig</span>
                            </div>
                        )}
                    </>
                )}
            </button>

            {/* Always visible title */}
            <div className={`mt-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-xl border-2 border-gray-100 font-bold text-gray-500 text-xs shadow-sm whitespace-nowrap transition-transform group-hover:scale-105`}>
                {level.title}
            </div>
        </div>
    );
};
