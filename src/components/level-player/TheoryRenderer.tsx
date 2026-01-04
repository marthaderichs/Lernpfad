import React from 'react';
import { LevelRendererProps } from './types';
import { Button, MarkdownWithLatex } from '../common';
import { X, Check } from 'lucide-react';

export const TheoryRenderer: React.FC<LevelRendererProps> = ({ level, onClose, onComplete }) => {
    const content = level.content.markdownContent || "Kein Inhalt verfügbar.";

    return (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        📖
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
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/80 backdrop-blur">
                <div className="max-w-3xl mx-auto">
                    <Button variant="success" fullWidth onClick={() => onComplete(3)}>
                        Gelesen & Verstanden <Check size={20} className="ml-2 inline" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
