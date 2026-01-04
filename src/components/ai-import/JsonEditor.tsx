import React from 'react';
import { Bot, X } from 'lucide-react';
import { Button } from '../common/Button';

interface JsonEditorProps {
    value: string;
    onChange: (val: string) => void;
    error: string | null;
    onImport: () => void;
    onCancel: () => void;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, error, onImport, onCancel }) => {
    return (
        <div className="mb-2">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg mb-3">
                <span className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center text-sm font-black shadow-md shadow-orange-200">2</span>
                Generierten Code einfügen
            </h3>

            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-4 text-sm text-orange-800 flex items-start gap-3">
                <div className="bg-white p-1 rounded-full"><Bot size={16} className="text-orange-500" /></div>
                <div>
                    <strong>Wichtig:</strong> Schreibe nach dem Einfügen des Prompts noch dein Thema dazu! <br />
                    <span className="italic opacity-80">Beispiel: "Erstelle einen Kurs über Quantenphysik" oder "Geschichte Roms".</span>
                </div>
            </div>

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder='Füge hier das JSON Ergebnis ein (beginnend mit { "id": ... })'
                className="w-full h-48 p-4 bg-gray-50 rounded-2xl font-mono text-sm text-gray-700 border-2 border-gray-200 focus:border-brand-purple focus:bg-white outline-none resize-none transition-all placeholder:text-gray-400 shadow-inner"
            />
            {error && (
                <div className="mt-3 text-red-600 text-sm font-bold bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2 animate-pulse">
                    <span className="text-xl">⚠️</span> {error}
                </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100 flex gap-4">
                <Button variant="secondary" onClick={onCancel}>Abbrechen</Button>
                <Button variant="primary" fullWidth onClick={onImport} className="!bg-brand-purple !border-purple-700 shadow-purple-200">
                    Kurs jetzt erstellen
                </Button>
            </div>
        </div>
    );
};
