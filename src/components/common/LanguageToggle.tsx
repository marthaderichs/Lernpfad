import React from 'react';
import { useAppStore } from '../../stores/useAppStore';

export const LanguageToggle: React.FC = () => {
    const { contentLanguage, toggleContentLanguage } = useAppStore();

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                toggleContentLanguage();
            }}
            className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl border-b-2 border-gray-200 hover:bg-gray-200 transition-all active:translate-y-0.5 active:border-b-0"
        >
            <div className={`px-2 py-0.5 rounded-xl font-black text-xs transition-all ${contentLanguage === 'DE' ? 'bg-white shadow-sm text-brand-sky' : 'text-gray-400'}`}>
                DE 🇩🇪
            </div>
            <div className={`px-2 py-0.5 rounded-xl font-black text-xs transition-all ${contentLanguage === 'PT' ? 'bg-white shadow-sm text-brand-sky' : 'text-gray-400'}`}>
                PT 🇵🇹
            </div>
        </button>
    );
};
