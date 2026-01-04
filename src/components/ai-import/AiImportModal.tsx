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
            <div className="bg-white w-full max-w-3xl rounded-3xl p-8 shadow-2xl border-4 border-white animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3 text-brand-purple font-black text-2xl uppercase">
                        <div className="p-3 bg-brand-purple/10 rounded-xl">
                            <Sparkles size={28} className="text-brand-purple" />
                        </div>
                        <span>Kurs mit AI erstellen</span>
                    </div>
                    <button onClick={onClose} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
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
