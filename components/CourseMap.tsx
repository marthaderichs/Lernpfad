import React from 'react';
import { Course, Unit, Level, LevelStatus, LevelType } from '../types';
import { ArrowLeft, Lock, Play, CheckCircle, Book, Star, Check } from 'lucide-react';

interface CourseMapProps {
  course: Course;
  onBack: () => void;
  onSelectLevel: (level: Level) => void;
}

const LevelNode: React.FC<{ level: Level; color: string; onClick: () => void; index: number }> = ({ level, color, onClick, index }) => {
  const isLocked = level.status === LevelStatus.LOCKED;
  const isCompleted = level.status === LevelStatus.COMPLETED;
  
  // Logic: Only Quizzes and Flashcards get a Star rating (performance based).
  // Theory, Practice, and Summary are binary (Completed or Not).
  const isGradedActivity = level.type === LevelType.QUIZ || level.type === LevelType.FLASHCARDS;

  // Safe color fallback to prevent crashes if data is missing
  const themeColor = color || 'brand-blue';
  const colorName = themeColor.replace('brand-', '');
  
  const offset = index % 2 === 0 ? '-translate-x-14' : 'translate-x-14';

  return (
    <div className={`flex flex-col items-center justify-center mb-16 relative z-10 ${offset} transition-transform duration-500 group`}>
      <button
        onClick={onClick}
        disabled={isLocked}
        className={`
          w-24 h-24 rounded-full flex items-center justify-center 
          border-b-8 transition-all duration-300 transform
          ${isLocked 
            ? 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-80' 
            : `bg-${themeColor} border-${colorName}-600 hover:scale-110 active:scale-95 cursor-pointer shadow-lg hover:shadow-xl`
          }
        `}
        style={{ backgroundColor: !isLocked ? `var(--${themeColor})` : undefined }} 
      >
         <div className={`w-24 h-24 rounded-full flex items-center justify-center border-b-8 ${
           isLocked ? 'bg-gray-200 border-gray-300' : 
           themeColor === 'brand-purple' ? 'bg-purple-500 border-purple-700' :
           themeColor === 'brand-green' ? 'bg-green-500 border-green-700' :
           themeColor === 'brand-orange' ? 'bg-orange-400 border-orange-600' :
           themeColor === 'brand-blue' ? 'bg-indigo-500 border-indigo-700' :
           themeColor === 'brand-red' ? 'bg-red-500 border-red-700' :
           'bg-blue-400 border-blue-600'
         }`}>
            {isCompleted ? (
              <CheckCircle className="text-white w-10 h-10 drop-shadow-md" />
            ) : isLocked ? (
              <Lock className="text-gray-400 w-8 h-8" />
            ) : level.type === 'SUMMARY' || level.type === 'THEORY' ? (
              <Book className="text-white w-9 h-9 fill-current drop-shadow-md" />
            ) : (
              <Play className="text-white w-9 h-9 fill-current drop-shadow-md" />
            )}
         </div>
         
         {/* BADGES */}
         {!isLocked && (
            <>
              {/* Case 1: Graded Activity (Show Stars) */}
              {isGradedActivity && (
                <div className={`absolute -top-1 ${index % 2 === 0 ? '-left-1' : '-right-1'} flex items-center gap-0.5 bg-yellow-400 px-2 py-1.5 rounded-full shadow-md border-b-2 border-yellow-600 animate-bounce-subtle`}>
                    {[1, 2, 3].map((starIdx) => (
                      <Star 
                        key={starIdx} 
                        size={10} 
                        strokeWidth={3}
                        className={`${starIdx <= level.stars ? 'fill-white text-white' : 'text-yellow-600/40'} transition-all`} 
                      />
                    ))}
                </div>
              )}

              {/* Case 2: Non-Graded Activity (Show Checkmark ONLY if completed) */}
              {!isGradedActivity && isCompleted && (
                <div className={`absolute -top-1 ${index % 2 === 0 ? '-left-1' : '-right-1'} flex items-center gap-1 bg-green-500 text-white px-2 py-1.5 rounded-full shadow-md border-b-2 border-green-700 animate-bounce-subtle`}>
                    <Check size={12} strokeWidth={4} />
                    <span className="text-[10px] font-black uppercase">Fertig</span>
                </div>
              )}
            </>
         )}
      </button>
      
      {/* Always visible title */}
      <div className={`mt-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-xl border-2 border-gray-100 font-bold text-gray-500 text-xs shadow-sm whitespace-nowrap transition-transform group-hover:scale-105`}>
        {level.title}
      </div>
    </div>
  );
};

export const CourseMap: React.FC<CourseMapProps> = ({ course, onBack, onSelectLevel }) => {
  return (
    <div className="flex flex-col h-full bg-[#f0f9ff] relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white to-transparent opacity-80 z-0 pointer-events-none"></div>

      {/* Header */}
      <div className={`p-4 pt-6 sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm`}>
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors border-2 border-transparent hover:border-gray-200">
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
                  onClick={() => onSelectLevel(level)}
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
    </div>
  );
};