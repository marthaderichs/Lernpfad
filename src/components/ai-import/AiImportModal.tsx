import React, { useState } from 'react';
import { X, Sparkles, Languages } from 'lucide-react';
import { PromptDisplay } from './PromptDisplay';
import { JsonEditor } from './JsonEditor';
import { useAppStore } from '../../stores/useAppStore';
import { sanitizeCourse } from '../../utils/sanitizeCourse';
import { mergeTranslations } from '../../utils/courseUtils';

interface AiImportModalProps {
    onClose: () => void;
}

export const AiImportModal: React.FC<AiImportModalProps> = ({ onClose }) => {
    const [jsonInput, setJsonInput] = useState('');
    const [jsonInputPT, setJsonInputPT] = useState('');
    const [isBilingual, setIsBilingual] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addCourse } = useAppStore();

    const handleImport = async () => {
        try {
            setError(null);
            if (!jsonInput) throw new Error("Basis-JSON (DE) fehlt.");
            
            const parsed = JSON.parse(jsonInput);

            // Basic validation
            if (!parsed.title || !parsed.units) throw new Error("Format Ungültig: 'title' oder 'units' fehlen.");

            let course = sanitizeCourse(parsed);

            if (isBilingual && jsonInputPT) {
                const parsedPT = JSON.parse(jsonInputPT);
                // Merge PT translations into the course object
                course = mergeTranslations(course, parsedPT);
            }

            await addCourse(course);
            onClose();
        } catch (e: any) {
            console.error("Import failed:", e);
            setError(e.message || "Fehler beim Importieren oder Speichern.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-brand-purple/20 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl border-4 border-white animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4 text-gray-800 font-black text-3xl tracking-tight">
                        <div className="p-3 bg-brand-purple rounded-2xl shadow-lg shadow-purple-200 rotate-3">
                            <Sparkles size={32} className="text-white" />
                        </div>
                        <span>Neuer Kurs</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsBilingual(!isBilingual)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all border-2 ${isBilingual 
                                ? 'bg-brand-sky border-brand-sky text-white shadow-lg' 
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Languages size={20} />
                            {isBilingual ? 'Portugiesisch (PT) Aktiv' : 'Zweite Sprache hinzufügen'}
                        </button>
                        <button onClick={onClose} className="bg-gray-100 p-3 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                            <X size={28} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4">
                    <PromptDisplay />
                    
                    <div className={`grid gap-6 ${isBilingual ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                        <div>
                            {isBilingual && <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">Deutsch (DE)</label>}
                            <JsonEditor
                                value={jsonInput}
                                onChange={setJsonInput}
                                error={!isBilingual ? error : null}
                                hideButton={isBilingual}
                                onImport={handleImport}
                                onCancel={onClose}
                            />
                        </div>
                        {isBilingual && (
                            <div className="animate-in slide-in-from-right-10 duration-300">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">Portugiesisch (PT)</label>
                                <JsonEditor
                                    value={jsonInputPT}
                                    onChange={setJsonInputPT}
                                    error={error}
                                    onImport={handleImport}
                                    onCancel={onClose}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};