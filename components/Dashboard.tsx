import React, { useState } from 'react';
import { Course, UserStats } from '../types';
import { Button } from './Button';
import { Trophy, Flame, Coins, Plus, BookOpen, Trash2, ShoppingBag, X } from 'lucide-react';

interface DashboardProps {
  courses: Course[];
  userStats: UserStats;
  onSelectCourse: (course: Course) => void;
  onAddCourse: () => void;
  onDeleteCourse: (courseId: string) => void;
  onOpenShop: () => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; value: string; label: string; color: string; onClick?: () => void }> = ({ icon, value, label, color, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-[140px] transition-transform hover:-translate-y-1 ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
  >
    <div className={`${color} p-3 rounded-xl text-white shadow-md`}>
      {icon}
    </div>
    <div>
      <div className="font-black text-gray-800 text-lg">{value}</div>
      <div className="text-xs text-gray-400 font-bold uppercase tracking-wide">{label}</div>
    </div>
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
      {/* Delete Button - Always visible on mobile, hover on desktop */}
      <button
        onClick={handleDeleteClick}
        onTouchEnd={handleDeleteClick}
        className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-xl 
          opacity-100 md:opacity-0 md:group-hover:opacity-100 
          transition-opacity hover:bg-red-50 hover:text-red-500 text-gray-400 shadow-md border border-gray-100"
      >
        <Trash2 size={18} />
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 rounded-3xl"
          onClick={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <div className="text-4xl mb-4">🗑️</div>
          <h3 className="font-black text-gray-800 text-center mb-2">Kurs löschen?</h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            "{course.title}" wird unwiderruflich gelöscht.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={handleCancelDelete}
              onTouchEnd={handleCancelDelete}
              className="flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleConfirmDelete}
              onTouchEnd={handleConfirmDelete}
              className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Löschen
            </button>
          </div>
        </div>
      )}

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

export const Dashboard: React.FC<DashboardProps> = ({ courses, userStats, onSelectCourse, onAddCourse, onDeleteCourse, onOpenShop }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="bg-white px-8 py-8 shadow-sm border-b border-gray-100 z-20">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-brand-green rounded-2xl flex items-center justify-center text-3xl border-b-4 border-green-600 text-white font-bold shadow-lg shadow-green-200">
                {userStats.activeAvatar}
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-800 tracking-tight">Willkommen zurück!</h2>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Bereit für die nächste Lektion?</p>
              </div>
            </div>

            <div className="flex gap-4 w-full md:w-auto flex-wrap">
              <StatCard
                icon={<Flame size={20} className="fill-current" />}
                value={`${userStats.currentStreak} Tage`}
                label="Serie"
                color="bg-orange-400"
              />
              <StatCard
                icon={<Trophy size={20} className="fill-current" />}
                value={userStats.totalXp.toLocaleString()}
                label="Gesamt XP"
                color="bg-yellow-400"
              />
              <StatCard
                icon={<Coins size={20} className="fill-current" />}
                value={userStats.coins.toLocaleString()}
                label="Coins"
                color="bg-brand-purple"
                onClick={onOpenShop}
              />
            </div>
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
                onClick={onOpenShop}
                className="flex items-center gap-2 bg-gradient-to-r from-brand-purple to-brand-blue text-white px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105"
              >
                <ShoppingBag size={20} />
                Shop
              </button>
              <button
                onClick={onAddCourse}
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
                onClick={() => onSelectCourse(course)}
                onDelete={() => onDeleteCourse(course.id)}
              />
            ))}

            {/* Add Course Card Placeholder */}
            <button
              onClick={onAddCourse}
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
    </div>
  );
};