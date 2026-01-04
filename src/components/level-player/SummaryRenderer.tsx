import React from 'react';
import { LevelRendererProps } from './types';
import { Button, MarkdownWithLatex } from '../common';
import { X, Check } from 'lucide-react';

export const SummaryRenderer: React.FC<LevelRendererProps> = ({ level, onClose, onComplete }) => {
    const content = level.content.markdownContent || "Zusammenfassung";

    return (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                        📑
                    </div>
                    <div>
                        <h2 className="font-black text-gray-800 text-lg leading-tight">{level.title}</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase">{level.content.title}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
                    <X size={24} className="text-gray-500" />
                </button>
            </div>

            {/* Markdown Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-3xl mx-auto w-full">
                <div className="markdown-content text-gray-700 text-lg leading-relaxed">
                    <MarkdownWithLatex>
                        {content}
                    </MarkdownWithLatex>
                </div>

                {/* Completion Animation */}
                <div className="mt-10 p-6 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center gap-4 animate-bounce-subtle">
                    <div className="text-4xl">🏆</div>
                    <div>
                        <h4 className="font-bold text-yellow-800">Kurs abgeschlossen!</h4>
                        <p className="text-sm text-yellow-700">Du hast alle Inhalte gemeistert.</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/80 backdrop-blur">
                <div className="max-w-3xl mx-auto">
                    <Button variant="success" fullWidth onClick={() => onComplete(3)}>
                        Abschließen <Check size={20} className="ml-2 inline" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
