import React, { useState } from 'react';
import { Sparkles, Copy, Check, Edit3 } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export const PromptDisplay: React.FC = () => {
    const { userStats, updateSystemPrompt } = useAppStore();
    const [copied, setCopied] = useState(false);

    const prompt = userStats?.systemPrompt || '';

    const handleCopyPrompt = async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(prompt);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = prompt;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    return (
        <div className="mb-6 bg-blue-50/50 p-6 rounded-3xl border-2 border-blue-100">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                    <span className="w-8 h-8 rounded-full bg-brand-sky text-white flex items-center justify-center text-sm font-black shadow-md shadow-sky-200">1</span>
                    Prompt kopieren & anpassen
                </h3>
                <button
                    onClick={handleCopyPrompt}
                    className={`text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-sm ${copied
                        ? 'bg-green-500 text-white border-green-600'
                        : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-brand-sky hover:text-brand-sky hover:shadow-md'
                        }`}
                >
                    {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}
                    {copied ? 'Kopiert!' : 'Kopieren'}
                </button>
            </div>

            <div className="relative group overflow-hidden">
                <div className="absolute top-3 right-3 z-10 text-brand-sky opacity-50 pointer-events-none">
                    <Edit3 size={18} />
                </div>
                <textarea 
                    value={prompt}
                    onChange={(e) => updateSystemPrompt(e.target.value)}
                    className="w-full h-48 p-4 bg-gray-800 text-blue-100 font-mono text-[11px] rounded-2xl border-2 border-gray-700 focus:border-brand-sky outline-none transition-all shadow-inner custom-scrollbar resize-none"
                    placeholder="System Prompt hier bearbeiten..."
                />
            </div>
            
            <p className="mt-3 text-[11px] text-blue-400 font-bold flex items-center gap-1 uppercase tracking-wider">
                <Sparkles size={12} className="text-brand-sky" /> Automatisch gespeichert
            </p>
        </div>
    );
};