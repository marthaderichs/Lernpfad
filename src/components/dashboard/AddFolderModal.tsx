import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { X } from 'lucide-react';

export const AddFolderModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addFolder, currentFolderId } = useAppStore();
    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState('📁');
    const [color, setColor] = useState('brand-blue');

    const colors = [
        'brand-blue', 'brand-purple', 'brand-green', 'brand-orange',
        'brand-red', 'brand-pink', 'brand-teal', 'brand-yellow'
    ];

    const handleSave = () => {
        if (!title.trim()) return;

        addFolder({
            id: `f_${Date.now()}`,
            type: 'folder',
            title: title.trim(),
            icon,
            themeColor: color,
            parentFolderId: currentFolderId || null
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-wide">Neuer Ordner</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Name</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-lg font-bold border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-brand-sky focus:ring-4 focus:ring-brand-sky/20 outline-none transition-all placeholder-gray-300"
                            placeholder="z.B. Mathematik"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Icon (Emoji)</label>
                            <input
                                type="text"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                className="w-full text-center text-2xl font-bold border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-brand-sky outline-none transition-all"
                                maxLength={2}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Farbe</label>
                            <div className="grid grid-cols-4 gap-2">
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        className={`w-8 h-8 rounded-full bg-${c} ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-50 hover:opacity-100'} transition-all`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="font-bold text-gray-500 uppercase tracking-wide py-3 px-6 rounded-2xl hover:bg-gray-200 transition-colors"
                    >
                        Abbrechen
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!title.trim()}
                        className="font-extrabold text-white uppercase tracking-wide py-3 px-8 rounded-2xl bg-brand-green border-b-4 border-green-600 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200"
                    >
                        Erstellen
                    </button>
                </div>
            </div>
        </div>
    );
};
