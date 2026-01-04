import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { PromptDisplay } from './PromptDisplay';
import { JsonEditor } from './JsonEditor';
import { useAppStore } from '../../stores/useAppStore';
import { sanitizeCourse } from '../../utils/sanitizeCourse';

interface AiImportModalProps {
    onClose: () => void;
}

export const AiImportModal: React.FC<AiImportModalProps> = ({ onClose }) => {
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { addCourse } = useAppStore();

    const handleImport = async () => {
        try {
            setError(null);
            const parsed = JSON.parse(jsonInput);

            // Basic validation
            if (!parsed.title || !parsed.units) throw new Error("Format Ungültig: 'title' oder 'units' fehlen.");

            const course = sanitizeCourse(parsed);
            await addCourse(course);
            onClose();
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Ungültiges JSON.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-brand-purple/20 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl border-4 border-white animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4 text-gray-800 font-black text-3xl tracking-tight">
                        <div className="p-3 bg-brand-purple rounded-2xl shadow-lg shadow-purple-200 rotate-3">
                            <Sparkles size={32} className="text-white" />
                        </div>
                        <span>Neuer Kurs</span>
                    </div>
                    <button onClick={onClose} className="bg-gray-100 p-3 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <X size={28} strokeWidth={3} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4">
                    <PromptDisplay />
                    <JsonEditor
                        value={jsonInput}
                        onChange={setJsonInput}
                        error={error}
                        onImport={handleImport}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>
    );
};