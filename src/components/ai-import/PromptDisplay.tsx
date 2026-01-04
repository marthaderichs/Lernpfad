import React, { useState } from 'react';
import { Settings, Copy, Check, Edit3, X, Save } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export const PromptDisplay: React.FC = () => {
    const { userStats, updateSystemPrompt } = useAppStore();
    const [copied, setCopied] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [tempPrompt, setTempPrompt] = useState('');

    const handleCopy = async () => {
        const text = userStats?.systemPrompt || '';
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = text;
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
            console.error(err);
        }
    };

    const handleOpenEdit = () => {
        setTempPrompt(userStats?.systemPrompt || '');
        setShowEditModal(true);
    };

    const handleSave = () => {
        updateSystemPrompt(tempPrompt);
        setShowEditModal(false);
    };

    return (
        <div className="mb-8">
            {/* Minimalist Buttons Row */}
            <div className="flex items-stretch gap-4">
                 <button
                    onClick={handleCopy}
                    className={`flex-1 py-5 rounded-2xl font-black text-lg md:text-xl flex items-center justify-center gap-3 transition-all shadow-sm border-b-4 active:scale-95 active:border-b-0 active:translate-y-1 ${
                        copied 
                        ? 'bg-green-500 border-green-700 text-white' 
                        : 'bg-brand-blue border-blue-700 text-white hover:bg-blue-600'
                    }`}
                >
                    {copied ? <Check size={28} strokeWidth={4} /> : <Copy size={28} strokeWidth={3} />}
                    {copied ? 'KOPIERT!' : 'PROMPT KOPIEREN'}
                </button>

                <button
                    onClick={handleOpenEdit}
                    className="w-20 rounded-2xl bg-gray-100 border-b-4 border-gray-300 text-gray-400 flex items-center justify-center hover:bg-gray-200 hover:text-gray-600 hover:border-gray-400 transition-all active:scale-95 active:border-b-0 active:translate-y-1"
                    title="Prompt bearbeiten"
                >
                    <Settings size={32} />
                </button>
            </div>

            {/* Edit Modal (Overlay) */}
            {showEditModal && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden border-4 border-white">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                <Edit3 size={28} className="text-brand-purple"/>
                                System Prompt Konfiguration
                            </h3>
                            <button onClick={() => setShowEditModal(false)} className="p-3 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
                                <X size={28} />
                            </button>
                        </div>
                        
                        <div className="flex-1 p-0 relative">
                            <textarea 
                                value={tempPrompt}
                                onChange={(e) => setTempPrompt(e.target.value)}
                                className="w-full h-full p-8 font-mono text-sm leading-relaxed bg-[#1e1e1e] text-[#d4d4d4] resize-none outline-none focus:ring-inset focus:ring-0 selection:bg-brand-purple selection:text-white"
                                spellCheck={false}
                            />
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">
                                Änderungen werden global gespeichert
                            </span>
                            <div className="flex gap-3 w-full md:w-auto">
                                <button onClick={() => setShowEditModal(false)} className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                                    Abbrechen
                                </button>
                                <button onClick={handleSave} className="flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-white bg-brand-purple hover:bg-purple-600 shadow-lg shadow-purple-200 flex items-center justify-center gap-2 transition-transform active:scale-95">
                                    <Save size={20} />
                                    Speichern
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
