import React, { useState } from 'react';
import { LevelRendererProps } from './types';
import { Button, MarkdownWithLatex, LatexRenderer, LanguageToggle } from '../common';
import { X } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export const QuizRenderer: React.FC<LevelRendererProps> = ({ level, onClose, onComplete }) => {
    const { contentLanguage } = useAppStore();
    
    // Determine which content to use
    const isPT = contentLanguage === 'PT' && !!level.contentPT;
    const activeContent = isPT ? level.contentPT! : level.content;
    const questions = activeContent.quizQuestions || [];

    const [step, setStep] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const currentQ = questions[step];

    const handleAnswer = (index: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(index);
        if (index === currentQ.answerIndex) setQuizScore(prev => prev + 1);
    };

    const nextQuestion = () => {
        setSelectedOption(null);
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            setShowResult(true);
        }
    };

    if (showResult) {
        const percentage = (quizScore / questions.length) * 100;
        const stars = percentage === 100 ? 3 : percentage >= 50 ? 2 : 1;
        const passed = percentage >= 50;

        return (
            <div className="fixed inset-0 z-[60] bg-brand-purple flex items-center justify-center p-6 animate-in zoom-in-95">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-white/20">
                    <div className="text-6xl mb-4 animate-bounce">{passed ? '🎉' : '😕'}</div>
                    <h2 className="text-3xl font-black text-gray-800 mb-2">{passed ? (isPT ? 'Bem feito!' : 'Gut gemacht!') : (isPT ? 'Tente novamente' : 'Versuchs nochmal')}</h2>
                    <p className="text-gray-500 font-bold mb-6">{isPT ? 'Resultado' : 'Ergebnis'}: {quizScore} / {questions.length} {isPT ? 'correto' : 'richtig'}</p>

                    <div className="flex justify-center gap-2 mb-8">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`text-5xl transition-all ${s <= stars && passed ? 'text-yellow-400 drop-shadow-md scale-110' : 'text-gray-200'}`}>★</div>
                        ))}
                    </div>

                    {passed ? (
                        <Button variant="success" fullWidth onClick={() => onComplete(stars)}>{isPT ? 'Continuar' : 'Weiter'}</Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="secondary" fullWidth onClick={onClose}>{isPT ? 'Fim' : 'Ende'}</Button>
                            <Button variant="primary" fullWidth onClick={() => { setStep(0); setQuizScore(0); setShowResult(false); }}>{isPT ? 'Repetir' : 'Wiederholen'}</Button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!currentQ) return <div onClick={onClose}>Error: Missing Data</div>;

    return (
        <div className="fixed inset-0 z-[60] bg-[#f0f9ff] flex flex-col h-full">
            <div className="px-6 py-8">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={onClose}><X className="text-gray-400" /></button>
                    <div className="flex items-center gap-4">
                        {level.contentPT && <LanguageToggle />}
                        <span className="font-black text-brand-sky uppercase tracking-widest text-xs">Quiz • {isPT ? 'Pergunta' : 'Frage'} {step + 1} / {questions.length}</span>
                    </div>
                    <div className="w-6" />
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-sky transition-all duration-500 ease-out" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-20">
                <div className="max-w-2xl mx-auto w-full">
                    <h3 className="text-2xl md:text-3xl font-black text-gray-800 mb-8 leading-tight">
                        <LatexRenderer>{currentQ.question}</LatexRenderer>
                    </h3>

                    <div className="grid gap-4">
                        {currentQ.options.map((opt, idx) => {
                            const isSelected = selectedOption === idx;
                            const isCorrect = idx === currentQ.answerIndex;
                            const showStatus = selectedOption !== null;

                            let styleClass = "bg-white border-gray-200 text-gray-600 hover:border-brand-sky hover:bg-sky-50";

                            if (showStatus) {
                                if (isCorrect) styleClass = "bg-green-100 border-green-500 text-green-800 ring-2 ring-green-200";
                                else if (isSelected && !isCorrect) styleClass = "bg-red-50 border-red-300 text-red-800 opacity-70";
                                else styleClass = "bg-gray-50 border-gray-100 text-gray-400 opacity-50";
                            }

                            return (
                                <div key={idx} className="flex flex-col">
                                    <button
                                        onClick={() => handleAnswer(idx)}
                                        disabled={showStatus}
                                        className={`p-5 rounded-2xl border-b-4 text-left font-bold transition-all duration-200 active:scale-95 flex items-center gap-4 ${styleClass}`}
                                    >
                                        <div className={`w-8 h-8 shrink-0 rounded-full border-2 flex items-center justify-center text-sm font-black ${showStatus && isCorrect ? 'border-green-600 bg-green-200 text-green-700' : 'border-current opacity-50'}`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="leading-snug">
                                            <LatexRenderer>{opt.text}</LatexRenderer>
                                        </span>
                                    </button>

                                    {showStatus && (isSelected || (isCorrect && selectedOption !== null)) && (
                                        <div className={`mt-2 ml-4 p-3 rounded-lg text-sm border-l-4 animate-in slide-in-from-top-2 ${isCorrect ? 'border-green-500 bg-green-50 text-green-800' : 'border-red-400 bg-red-50 text-red-800'}`}>
                                            <div className="markdown-content [&_p]:mb-0 [&_p]:inline">
                                                <MarkdownWithLatex>
                                                    {opt.explanation}
                                                </MarkdownWithLatex>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {selectedOption !== null && (
                        <div className="mt-8 mb-10 animate-in fade-in slide-in-from-bottom-4">
                            <Button variant="primary" fullWidth onClick={nextQuestion} className="shadow-xl py-4 text-lg">
                                {step < questions.length - 1 ? 'Nächste Frage' : 'Ergebnisse anzeigen'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
