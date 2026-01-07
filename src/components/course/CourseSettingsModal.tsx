import React, { useState } from 'react';
import { Course } from '../../types';
import { X, Settings, Languages, Trash2 } from 'lucide-react';

interface CourseSettingsModalProps {
    course: Course;
    onClose: () => void;
    onSave: (updates: Partial<Course>) => void;
    onDelete: () => void;
    onOpenTranslation: () => void;
}

export const CourseSettingsModal: React.FC<CourseSettingsModalProps> = ({
    course,
    onClose,
    onSave,
    onDelete,
    onOpenTranslation
}) => {
    const [title, setTitle] = useState(course.title);
    const [icon, setIcon] = useState(course.icon);
    const [themeColor, setThemeColor] = useState(course.themeColor);

    const handleSave = () => {
        onSave({
            title: title.trim(),
            icon,
            themeColor
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl border-4 border-white animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                        <Settings className="text-gray-400" /> Einstellungen
                    </h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Kurs Titel</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-brand-blue outline-none font-bold text-gray-700"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Icon</label>
                            <input
                                type="text"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-brand-blue outline-none text-2xl text-center"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Farbe</label>
                            <select
                                value={themeColor}
                                onChange={(e) => setThemeColor(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-brand-blue outline-none font-bold text-gray-700 appearance-none"
                            >
                                <option value="brand-blue">Blau</option>
                                <option value="brand-purple">Lila</option>
                                <option value="brand-green">Grün</option>
                                <option value="brand-orange">Orange</option>
                                <option value="brand-red">Rot</option>
                                <option value="brand-pink">Pink</option>
                                <option value="brand-burgundy">Bordeaux</option>
                                <option value="brand-yellow">Gelb</option>
                                <option value="brand-lime">Limette</option>
                                <option value="brand-fuchsia">Magenta</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
                        <button
                            onClick={onOpenTranslation}
                            className="w-full py-3 bg-brand-sky/10 text-brand-sky rounded-xl font-bold hover:bg-brand-sky hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Languages size={18} /> Portugiesisch hinzufügen
                        </button>
                        <button
                            onClick={handleSave}
                            className="w-full py-3 bg-brand-blue text-white rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                            Speichern & Fertig
                        </button>
                        <button
                            onClick={onDelete}
                            className="w-full py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} /> Kurs löschen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
