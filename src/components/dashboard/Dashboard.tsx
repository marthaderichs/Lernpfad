import React, { useState } from 'react';
import { Course, UserStats } from '../../types';
import { useAppStore } from '../../stores/useAppStore';
import { Button } from '../common/Button';
import { AiImportModal } from '../ai-import';
import { Trophy, Flame, Coins, Plus, BookOpen, Trash2, ShoppingBag } from 'lucide-react';

const HeaderStat: React.FC<{ icon: React.ReactNode; value: string; label?: string; color: string; onClick?: () => void }> = ({ icon, value, color, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200/50 ${onClick ? 'cursor-pointer active:scale-95 transition-transform hover:bg-white/80' : ''}`}
    >
        <div className={`${color} p-1.5 rounded-lg text-white shadow-sm`}>
            {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 14 })}
        </div>
        <span className="font-black text-gray-700 text-sm">{value}</span>
    </div>
);

const CourseCard: React.FC<{
    course: Course;
    onClick: () => void;
    onDelete: () => void;
}> = ({ course, onClick, onDelete }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const themeColors: Record<string, string> = {
        'brand-purple': 'bg-purple-500 border-purple-700',
        'brand-blue': 'bg-indigo-500 border-indigo-700',
        'brand-orange': 'bg-orange-400 border-orange-600',
        'brand-green': 'bg-green-500 border-green-700',
        'brand-sky': 'bg-sky-400 border-sky-600',
        'brand-red': 'bg-red-400 border-red-600',
        'brand-pink': 'bg-[#FB96BB] border-[#d87a9e]',
    };

    const cssClass = themeColors[course.themeColor] || themeColors['brand-blue'];

    const handleDeleteClick = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onDelete();
        setShowDeleteConfirm(false);
    };

    const handleCancelDelete = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setShowDeleteConfirm(false);
    };

    return (
        <div
            onClick={onClick}
            className={`
        relative overflow-hidden cursor-pointer group h-full flex flex-col
        bg-white rounded-3xl border-b-4 border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md transition-all active:scale-95
      `}
        >
            <div className={`h-32 ${cssClass} flex items-center justify-center relative overflow-hidden`}>
                {/* Background Pattern */}
                <div className="absolute opacity-20 transform rotate-12 -right-6 -top-6 text-8xl transition-transform group-hover:scale-110 group-hover:rotate-6">
                    {course.icon}
                </div>
                <div className="text-6xl drop-shadow-md z-10 transition-transform group-hover:scale-110 duration-300">{course.icon}</div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-extrabold text-gray-800 text-xl leading-tight">{course.title}</h3>
                        {course.totalProgress === 100 && <span className="text-green-500">✅</span>}
                    </div>
                    <p className="text-gray-400 text-sm font-bold mb-6 flex items-center gap-2">
                        <BookOpen size={14} />
                        {course.units.length} Kapitel
                        <span className="text-gray-300">•</span>
                        {course.professor || 'AI Tutor'}
                    </p>
                </div>

                {/* Progress Bar */}
                <div>
                    <div className="w-full bg-gray-100 rounded-full h-4 mb-2 overflow-hidden border border-gray-100">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${course.themeColor === 'brand-purple' ? 'bg-purple-400' : course.themeColor === 'brand-green' ? 'bg-green-400' : 'bg-brand-blue'}`}
                            style={{ width: `${course.totalProgress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wide">
                        <span>Fortschritt</span>
                        <span className="text-gray-600">{course.totalProgress}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Dashboard: React.FC = () => {
    const {
        courses,
        userStats,
        selectCourse,
        deleteCourse,
        navigateTo
    } = useAppStore();

    const [showImportModal, setShowImportModal] = useState(false);

    if (!userStats) return null;

    const handleSelectCourse = (course: Course) => {
        selectCourse(course);
        navigateTo('COURSE_MAP');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Top Bar - Compact iOS Style (Responsive) */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-2 md:py-4 md:px-8 transition-all">
                <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-green rounded-xl flex items-center justify-center text-xl md:text-2xl shadow-sm border border-green-200 transition-all">
                            {userStats.activeAvatar}
                        </div>
                    </div>

                    <div className="flex gap-2 items-center">
                        <HeaderStat
                            icon={<Flame className="fill-current" />}
                            value={`${userStats.currentStreak}`}
                            color="bg-orange-400"
                        />
                        <HeaderStat
                            icon={<Trophy className="fill-current" />}
                            value={userStats.totalXp.toLocaleString()}
                            color="bg-yellow-400"
                        />
                        <HeaderStat
                            icon={<Coins className="fill-current" />}
                            value={userStats.coins.toLocaleString()}
                            color="bg-brand-purple"
                            onClick={() => navigateTo('SHOP')}
                        />
                    </div>
                </div>
            </div>

            {/* Course List */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-6xl mx-auto w-full">
                    <div className="flex justify-between items-end mb-6 gap-4 flex-wrap">
                        <h3 className="text-2xl font-black text-gray-700">Meine Vorlesungen</h3>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="hidden md:flex items-center gap-2 bg-brand-sky/10 text-brand-sky px-4 py-2 rounded-xl font-bold hover:bg-brand-sky hover:text-white transition-colors"
                            >
                                <Plus size={20} />
                                Neuer Kurs
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                        {courses.map(course => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                onClick={() => handleSelectCourse(course)}
                                onDelete={() => deleteCourse(course.id)}
                            />
                        ))}

                        {/* Add Course Card Placeholder */}
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="border-4 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-8 hover:bg-white hover:border-brand-sky hover:shadow-lg transition-all group h-full min-h-[320px] bg-gray-50/50"
                        >
                            <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center mb-6 group-hover:border-brand-sky group-hover:scale-110 transition-all shadow-sm">
                                <Plus size={32} strokeWidth={4} className="text-gray-300 group-hover:text-brand-sky" />
                            </div>
                            <span className="font-extrabold text-gray-400 group-hover:text-brand-sky uppercase text-lg tracking-wide">Kurs Hinzufügen</span>
                            <span className="text-xs font-bold text-gray-300 mt-2 uppercase">(Import via JSON)</span>
                        </button>
                    </div>
                </div>
            </div>

            {showImportModal && <AiImportModal onClose={() => setShowImportModal(false)} />}
        </div>
    );
};
