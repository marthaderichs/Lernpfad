import React, { useState } from 'react';
import { LevelRendererProps } from './types';
import { Button, MarkdownWithLatex, LatexRenderer } from '../common';
import { X, GraduationCap, HelpCircle, Check, ChevronRight } from 'lucide-react';

export const PracticeRenderer: React.FC<LevelRendererProps> = ({ level, onClose, onComplete }) => {
    const tasks = level.content.practiceTasks || [];
    const [step, setStep] = useState(0);
    const [solutionVisible, setSolutionVisible] = useState(false);

    const currentTask = tasks[step];

    const nextTask = () => {
        setSolutionVisible(false);
        if (step < tasks.length - 1) {
            setStep(step + 1);
        } else {
            onComplete(3);
        }
    };

    if (!currentTask) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-gray-50 flex flex-col h-full">
            <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2 text-brand-orange font-black uppercase tracking-wider">
                    <div className="p-2 bg-orange-100 rounded-lg"><GraduationCap size={20} /></div>
                    <span>Training {step + 1}/{tasks.length}</span>
                </div>
                <button onClick={onClose}><X className="text-gray-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-3xl mx-auto w-full">
                {/* Question Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border-b-4 border-gray-200 mb-8">
                    <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">Aufgabe</h3>
                    <div className="markdown-content text-xl md:text-2xl font-bold text-gray-800">
                        <MarkdownWithLatex>{currentTask.question}</MarkdownWithLatex>
                    </div>

                    {currentTask.hint && !solutionVisible && (
                        <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold flex gap-3 items-start border border-blue-100">
                            <HelpCircle size={18} className="shrink-0 mt-0.5" />
                            <div>
                                <span className="block font-black uppercase text-[10px] opacity-70 mb-1">Hinweis</span>
                                <LatexRenderer>{currentTask.hint}</LatexRenderer>
                            </div>
                        </div>
                    )}
                </div>

                {/* Solution Section */}
                {solutionVisible ? (
                    <div className="animate-in slide-in-from-bottom-10 fade-in duration-500">
                        <div className="bg-green-50 rounded-3xl p-8 border-2 border-green-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-green-800"><Check size={100} /></div>
                            <h3 className="text-green-700 font-bold text-xs uppercase tracking-widest mb-4 relative z-10">Lösungsweg</h3>
                            <div className="markdown-content text-gray-700 relative z-10">
                                <MarkdownWithLatex>{currentTask.solution}</MarkdownWithLatex>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button variant="primary" onClick={nextTask} className="shadow-xl">
                                {step < tasks.length - 1 ? 'Nächste Aufgabe' : 'Training Beenden'} <ChevronRight className="ml-2 inline" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center mt-10">
                        <Button variant="secondary" onClick={() => setSolutionVisible(true)} className="border-brand-orange text-brand-orange bg-orange-50 hover:bg-orange-100">
                            Lösung anzeigen
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
