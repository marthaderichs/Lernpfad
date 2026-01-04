import React, { useState } from 'react';
import { Level } from '../../types';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { LevelPreviewModal } from './LevelPreviewModal';
import { LevelNode } from './LevelNode';

export const CourseMap: React.FC = () => {
    const {
        selectedCourse: course,
        navigateTo,
        selectLevel
    } = useAppStore();

    const [previewLevel, setPreviewLevel] = useState<Level | null>(null);

    if (!course) return null;

    const handleBack = () => {
        navigateTo('DASHBOARD');
    };

    const handleSelectLevel = (level: Level) => {
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
                            <span>{course.icon}</span> {course.title}
                        </h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{course.units.length} Kapitel • {course.totalProgress}%</p>
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            {/* Map Content */}
            <div className="flex-1 overflow-y-auto pb-10 pt-10 z-10 custom-scrollbar">
                <div className="max-w-md mx-auto flex flex-col items-center relative min-h-[500px]">

                    {/* Central Spine */}
                    <div className="absolute top-0 bottom-0 w-4 bg-white border-x-4 border-gray-100 rounded-full left-1/2 -ml-2 z-0" />

                    {course.units.map((unit) => (
                        <div key={unit.id} className="w-full flex flex-col items-center mb-16 relative">

                            {/* Unit Header Badge */}
                            <div className={`
                z-10 mb-16 px-8 py-4 rounded-3xl shadow-xl text-white font-extrabold text-center uppercase tracking-wider text-lg transform hover:scale-105 transition-transform cursor-default select-none border-b-8 border-black/10 relative
                ${unit.colorTheme === 'brand-purple' ? 'bg-purple-500' :
                                    unit.colorTheme === 'brand-orange' ? 'bg-orange-400' :
                                        unit.colorTheme === 'brand-green' ? 'bg-green-500' :
                                            unit.colorTheme === 'brand-red' ? 'bg-red-400' : 'bg-blue-400'}
              `}>
                                <div className="absolute -bottom-3 left-1/2 -ml-2 w-4 h-4 bg-inherit rotate-45"></div>
                                {unit.title}
                                <div className="text-[10px] font-normal opacity-80 normal-case mt-1 tracking-normal">{unit.description}</div>
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
        </div>
    );
};
