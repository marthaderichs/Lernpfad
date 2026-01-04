import React, { useState } from 'react';
import { Course, Level, LevelStatus } from '../../types';
import { ArrowLeft, Settings, Trash2, X } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { LevelPreviewModal } from './LevelPreviewModal';
import { LevelNode } from './LevelNode';
import { LanguageToggle } from '../common';

export const CourseMap: React.FC = () => {
    const {
        selectedCourse: course,
        contentLanguage,
        navigateTo,
        selectLevel,
        updateCourseProgress,
        deleteCourse
    } = useAppStore();

    const [previewLevel, setPreviewLevel] = useState<Level | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    if (!course) return null;

    const isPT = contentLanguage === 'PT';
    
    // Check if course has any Portuguese content to show the toggle
    const hasPT = !!course.titlePT || course.units.some(u => 
        !!u.titlePT || u.levels.some(l => !!l.contentPT)
    );

    const handleBack = () => {
        navigateTo('DASHBOARD');
    };

    const handleUpdateCourse = (updates: Partial<Course>) => {
        updateCourseProgress(course.id, updates);
    };

    const handleDelete = () => {
        if (window.confirm(`Möchtest du den Kurs "${course.title}" wirklich löschen?`)) {
            deleteCourse(course.id);
            navigateTo('DASHBOARD');
        }
    };

    const handleSelectLevel = (level: Level) => {
        // Don't allow previewing locked levels
        if (level.status === LevelStatus.LOCKED) return;
        setPreviewLevel(level);
    };

    const handleStartLevel = () => {
        if (previewLevel) {
            let index = 0;
            let found = false;
            let targetIndex = -1;

            for (const unit of course.units) {
                for (const l of unit.levels) {
                    if (l.id === previewLevel.id) {
                        targetIndex = index;
                        found = true;
                        break;
                    }
                    index++;
                }
                if (found) break;
            }

            if (targetIndex !== -1) {
                selectLevel(targetIndex);
                setPreviewLevel(null);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#f0f9ff] relative overflow-hidden">

            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white to-transparent opacity-80 z-0 pointer-events-none"></div>

            {/* Header */}
            <div className={`p-4 pt-6 sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm`}>
                <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
                    <button onClick={handleBack} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors border-2 border-transparent hover:border-gray-200">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-xl font-black text-gray-800 uppercase tracking-wide flex items-center gap-2 justify-center">
                            <span>{course.icon}</span> {isPT && course.titlePT ? course.titlePT : course.title}
                        </h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{course.units.length} {isPT ? 'Capítulos' : 'Kapitel'} • {course.totalProgress}%</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasPT && <LanguageToggle />}
                        <button onClick={() => setShowSettings(true)} aria-label="Edit" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors border-2 border-transparent hover:border-gray-200">
                            <Settings className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Content */}
            <div className="flex-1 overflow-y-auto pb-10 pt-10 z-10 custom-scrollbar">
                <div className="max-w-md mx-auto flex flex-col items-center relative min-h-[500px]">

                    {/* Central Spine */}
                    <div className="absolute top-0 bottom-0 w-4 bg-white border-x-4 border-gray-100 rounded-full left-1/2 -ml-2 z-0">
                        {/* Progress Fill with Glow */}
                        <div
                            className="absolute top-0 left-0 right-0 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all duration-1000 ease-out"
                            style={{ height: `${course.totalProgress}%` }}
                        />
                    </div>

                    {course.units.map((unit) => (
                        <div key={unit.id} className="w-full flex flex-col items-center mb-16 relative">

                            {/* Unit Header Badge */}
                            <div className={`
                z-10 mb-16 px-8 py-4 rounded-3xl shadow-xl text-white font-extrabold text-center uppercase tracking-wider text-lg transform hover:scale-105 transition-transform cursor-default select-none border-b-8 border-black/10 relative
                ${unit.colorTheme === 'brand-purple' ? 'bg-brand-purple' :
                                    unit.colorTheme === 'brand-orange' ? 'bg-brand-orange' :
                                        unit.colorTheme === 'brand-green' ? 'bg-brand-green' :
                                            unit.colorTheme === 'brand-red' ? 'bg-brand-red' :
                                                unit.colorTheme === 'brand-pink' ? 'bg-brand-pink' :
                                                    unit.colorTheme === 'brand-teal' ? 'bg-brand-teal' :
                                                        unit.colorTheme === 'brand-sky' ? 'bg-brand-sky' :
                                                            unit.colorTheme === 'brand-burgundy' ? 'bg-brand-burgundy' :
                                                                unit.colorTheme === 'brand-yellow' ? 'bg-brand-yellow' :
                                                                    unit.colorTheme === 'brand-lime' ? 'bg-brand-lime' :
                                                                        unit.colorTheme === 'brand-fuchsia' ? 'bg-brand-fuchsia' :
                                                                            'bg-brand-blue'}
              `}>
                                <div className="absolute -bottom-3 left-1/2 -ml-2 w-4 h-4 bg-inherit rotate-45"></div>
                                {isPT && unit.titlePT ? unit.titlePT : unit.title}
                                <div className="text-[10px] font-normal opacity-80 normal-case mt-1 tracking-normal">
                                    {isPT && unit.descriptionPT ? unit.descriptionPT : unit.description}
                                </div>
                            </div>

                            {unit.levels.map((level, idx) => (
                                <LevelNode
                                    key={level.id}
                                    level={level}
                                    color={unit.colorTheme || 'brand-blue'}
                                    index={idx}
                                    onClick={() => handleSelectLevel(level)}
                                />
                            ))}
                        </div>
                    ))}

                    {/* Start Flag */}
                    <div className="relative z-10 mt-8 mb-20 animate-bounce">
                        <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center border-b-8 border-gray-900 shadow-2xl">
                            <span className="text-4xl">🏁</span>
                        </div>
                        <div className="text-center mt-4 font-black text-gray-300 uppercase tracking-widest text-sm">Ziel erreicht</div>
                    </div>

                </div>
            </div>

            {previewLevel && (
                <LevelPreviewModal
                    level={previewLevel}
                    onClose={() => setPreviewLevel(null)}
                    onStart={handleStartLevel}
                />
            )}

            {showSettings && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl border-4 border-white animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                                <Settings className="text-gray-400" /> Einstellungen
                            </h2>
                            <button onClick={() => setShowSettings(false)} className="p-2 bg-gray-100 rounded-full text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Kurs Titel</label>
                                <input
                                    type="text"
                                    value={course.title}
                                    onChange={(e) => handleUpdateCourse({ title: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-brand-blue outline-none font-bold text-gray-700"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Icon</label>
                                    <input
                                        type="text"
                                        value={course.icon}
                                        onChange={(e) => handleUpdateCourse({ icon: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-brand-blue outline-none text-2xl text-center"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Farbe</label>
                                    <select
                                        value={course.themeColor}
                                        onChange={(e) => handleUpdateCourse({ themeColor: e.target.value })}
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
                                    onClick={() => setShowSettings(false)}
                                    className="w-full py-3 bg-brand-blue text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    Fertig
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={18} /> Kurs löschen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
