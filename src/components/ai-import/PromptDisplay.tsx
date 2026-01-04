import React, { useState } from 'react';
import { Bot, Sparkles, Terminal, Copy, Check } from 'lucide-react';
import { SYSTEM_PROMPT } from '../../constants';

export const PromptDisplay: React.FC = () => {
    const [copied, setCopied] = useState(false);

    const handleCopyPrompt = async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(SYSTEM_PROMPT);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = SYSTEM_PROMPT;
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
            alert('Kopieren fehlgeschlagen. Bitte manuell kopieren.');
        }
    };

    return (
        <div className="mb-6 bg-blue-50/50 p-6 rounded-3xl border-2 border-blue-100">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                    <span className="w-8 h-8 rounded-full bg-brand-sky text-white flex items-center justify-center text-sm font-black shadow-md shadow-sky-200">1</span>
                    Prompt Kopieren
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm text-gray-600 leading-relaxed">
                    <p className="mb-2 font-bold text-gray-700">Wie es funktioniert:</p>
                    <p className="mb-4">Dieser Prompt enthält das <strong>Design-Konzept</strong> für unsere App. Er erklärt der KI, wie Lernkarten, Quizze und interaktive Level aufgebaut sein müssen.</p>
                    <p className="font-bold text-gray-700 mb-2">Benutze eine dieser KIs:</p>
                    <div className="flex gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 flex items-center gap-1"><Bot size={12} /> ChatGPT</span>
                        <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 flex items-center gap-1"><Sparkles size={12} /> Gemini</span>
                        <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 flex items-center gap-1"><Terminal size={12} /> Claude</span>
                    </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 relative group overflow-hidden border border-gray-700 shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90 pointer-events-none rounded-xl" />
                    <code className="text-gray-400 text-[10px] font-mono block whitespace-pre-wrap h-32 opacity-70">
                        {SYSTEM_PROMPT.substring(0, 400)}...
                    </code>
                </div>
            </div>
        </div>
    );
};
