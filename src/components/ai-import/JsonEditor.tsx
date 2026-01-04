import React from 'react';
import { Button } from '../common/Button';

interface JsonEditorProps {
    value: string;
    onChange: (val: string) => void;
    error: string | null;
    onImport: () => void;
    onCancel: () => void;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, error, onImport }) => {
    return (
        <div className="flex flex-col h-full">
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder='Füge hier das generierte JSON ein...'
                className="w-full h-64 md:h-96 p-6 bg-gray-50 rounded-3xl font-mono text-xs md:text-sm text-gray-700 border-4 border-transparent focus:border-brand-purple focus:bg-white outline-none resize-none transition-all placeholder:text-gray-400 shadow-inner"
            />
            
            {error && (
                <div className="mt-4 text-red-600 text-sm font-bold bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-2 animate-pulse">
                    <span className="text-xl">⚠️</span> {error}
                </div>
            )}

            <div className="mt-6">
                <Button variant="primary" fullWidth onClick={onImport} className="!py-4 !text-lg !rounded-2xl !bg-brand-purple !border-purple-700 shadow-xl shadow-purple-200 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
                    Kurs erstellen
                </Button>
            </div>
        </div>
    );
};