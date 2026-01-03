import React, { useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { CourseMap } from './components/CourseMap';
import { LevelPlayer } from './components/LevelPlayer';
import { loadCourses, addCourse, saveCourses, loadUserStats, updateUserProgress } from './services/storageService';
import { Course, Level, ViewState, LevelType, LevelStatus, UserStats } from './types';
import { Button } from './components/Button';
import { SYSTEM_PROMPT } from './constants';
import { X, Bot, Sparkles, Terminal, Copy, Check, FileJson } from 'lucide-react';

const App: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ totalXp: 0, currentStreak: 0, lastStudyDate: null });
  
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showLevelPreview, setShowLevelPreview] = useState<Level | null>(null);
  
  // New State for active player
  const [playingLevel, setPlayingLevel] = useState<Level | null>(null);
  
  // Import Modal State
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCourses(loadCourses());
    setUserStats(loadUserStats());
  }, []);

  const handleSelectCourse = (course: Course) => {
    setActiveCourse(course);
    setView('COURSE_MAP');
  };

  const handleBackToDashboard = () => {
    setActiveCourse(null);
    setView('DASHBOARD');
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(SYSTEM_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to fix common AI JSON structure mistakes automatically
  const sanitizeCourse = (input: any): Course => {
    const sanitizedUnits = input.units.map((unit: any) => ({
      ...unit,
      levels: unit.levels.map((lvl: any) => {
        // 1. Check if 'content' exists, if not create it from root props
        let content = lvl.content || {};
        
        // Move loose properties into content if missing
        if (!lvl.content) {
          if (lvl.markdownContent) content.markdownContent = lvl.markdownContent;
          if (lvl.quizQuestions) content.quizQuestions = lvl.quizQuestions;
          if (lvl.flashcards) content.flashcards = lvl.flashcards;
          if (lvl.practiceTasks) content.practiceTasks = lvl.practiceTasks;
          if (lvl.description) content.description = lvl.description;
          // Ensure title is present in content
          if (!content.title) content.title = lvl.title; 
          // Ensure description is present
          if (!content.description) content.description = "Lerneinheit";
        }

        // 2. Fix Quiz: Convert 'isCorrect' boolean to 'answerIndex'
        if (lvl.type === 'QUIZ' && content.quizQuestions) {
           content.quizQuestions = content.quizQuestions.map((q: any) => {
             // If answerIndex is missing but options have isCorrect
             if (typeof q.answerIndex === 'undefined' && q.options) {
               const correctIdx = q.options.findIndex((o: any) => o.isCorrect === true);
               return { ...q, answerIndex: correctIdx !== -1 ? correctIdx : 0 };
             }
             return q;
           });
        }

        return {
          ...lvl,
          content
        };
      })
    }));

    return {
      ...input,
      units: sanitizedUnits,
      id: input.id || `c_${Date.now()}`,
      totalProgress: 0
    };
  };

  const handleImportJson = () => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(jsonInput);
      
      // Basic validation
      if (!parsed.title || !parsed.units) throw new Error("Format Ungültig: 'title' oder 'units' fehlen.");
      
      // Run Sanitizer to fix structural issues (like missing content wrapper or isCorrect vs answerIndex)
      const newCourse = sanitizeCourse(parsed);

      const updated = addCourse(newCourse);
      setCourses(updated);
      setShowImportModal(false);
      setJsonInput('');
    } catch (e: any) {
      console.error(e);
      setJsonError(e.message || "Ungültiges JSON.");
    }
  };

  // Logic to Start a Level
  const handleStartLevel = () => {
    if (showLevelPreview) {
      setPlayingLevel(showLevelPreview);
      setShowLevelPreview(null);
    }
  };

  // Logic when a Level is completed
  const handleLevelComplete = (stars: number) => {
    if (!playingLevel || !activeCourse) return;

    // 1. Create Deep Copy of Courses to mutate
    const updatedCourses = [...courses];
    const courseIndex = updatedCourses.findIndex(c => c.id === activeCourse.id);
    if (courseIndex === -1) return;

    const course = updatedCourses[courseIndex];
    
    // 2. Find Unit and Level indices
    let levelFound = false;
    let nextLevelToUnlock: Level | null = null;
    let isFirstCompletion = false;

    for (let u = 0; u < course.units.length; u++) {
      const unit = course.units[u];
      for (let l = 0; l < unit.levels.length; l++) {
        const lvl = unit.levels[l];
        
        if (levelFound) {
           // This is the next level! Unlock it if needed
           if (lvl.status === LevelStatus.LOCKED) {
             lvl.status = LevelStatus.UNLOCKED;
           }
           nextLevelToUnlock = lvl; // Found the immediate next one, stop looking for next
           levelFound = false; // Stop flag
           break; 
        }

        if (lvl.id === playingLevel.id) {
           // Update Current Level
           if (lvl.status !== LevelStatus.COMPLETED) isFirstCompletion = true;
           lvl.status = LevelStatus.COMPLETED;
           lvl.stars = Math.max(lvl.stars, stars) as 0|1|2|3;
           levelFound = true; // Flag to unlock next iteration
        }
      }
      if (nextLevelToUnlock) break; // Break unit loop if we found next
    }

    // 3. Recalculate Total Progress
    let totalLevels = 0;
    let completedLevels = 0;
    course.units.forEach(u => {
      u.levels.forEach(l => {
        totalLevels++;
        if (l.status === LevelStatus.COMPLETED) completedLevels++;
      });
    });
    course.totalProgress = Math.round((completedLevels / totalLevels) * 100);

    // 4. Update Global User Stats (XP & Streak)
    // Only give XP if stars > 0.
    if (stars > 0) {
      const newStats = updateUserProgress(stars);
      setUserStats(newStats);
    }

    // 5. Save & Update State
    saveCourses(updatedCourses);
    setCourses(updatedCourses);
    setActiveCourse(course); // Update the map view immediately
    setPlayingLevel(null); // Close player
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff] flex flex-col font-sans text-gray-800">
      
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full shadow-xl bg-white min-h-screen border-x border-gray-100 relative">
        {view === 'DASHBOARD' && (
          <Dashboard 
            courses={courses} 
            userStats={userStats}
            onSelectCourse={handleSelectCourse}
            onAddCourse={() => setShowImportModal(true)}
          />
        )}

        {view === 'COURSE_MAP' && activeCourse && (
          <CourseMap 
            course={activeCourse} 
            onBack={handleBackToDashboard} 
            onSelectLevel={(level) => setShowLevelPreview(level)}
          />
        )}
      </div>

      {/* --- MODALS --- */}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-brand-purple/20 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl border-4 border-white animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3 text-brand-purple font-black text-2xl uppercase">
                <FileJson size={32} />
                <span>Kurs Importieren</span>
              </div>
              <button onClick={() => setShowImportModal(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="mb-8 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <Bot size={18} className="text-brand-sky"/> 
                    1. Prompt kopieren
                  </h3>
                  <button 
                    onClick={handleCopyPrompt}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                      copied 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-sky hover:text-brand-sky'
                    }`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Kopiert!' : 'Kopieren'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Sende diesen Text an eine KI, um den Kurs-Code zu generieren.
                </p>
                <div className="bg-gray-800 rounded-xl p-3 relative group">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900/90 pointer-events-none rounded-xl" />
                   <code className="text-gray-400 text-xs font-mono block whitespace-pre-wrap h-20 overflow-hidden group-hover:text-gray-200 transition-colors">
                     {SYSTEM_PROMPT}
                   </code>
                </div>
              </div>

              <div className="mb-2">
                <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-2">
                  <Terminal size={18} className="text-brand-orange"/> 
                  2. JSON Code einfügen
                </h3>
                <textarea 
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='Füge hier das generierte JSON ein...' 
                  className="w-full h-48 p-4 bg-gray-50 rounded-xl font-mono text-sm text-gray-700 border-2 border-gray-200 focus:border-brand-purple outline-none resize-none transition-all placeholder:text-gray-400" 
                />
                {jsonError && (
                  <div className="mt-2 text-red-500 text-sm font-bold bg-red-50 p-2 rounded-lg flex items-center gap-2">
                    <span className="text-lg">⚠️</span> {jsonError}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex gap-4">
               <Button variant="secondary" onClick={() => setShowImportModal(false)}>Abbrechen</Button>
               <Button variant="primary" fullWidth onClick={handleImportJson} className="!bg-brand-purple !border-purple-700 shadow-purple-200">
                  Kurs Hinzufügen
               </Button>
            </div>
          </div>
        </div>
      )}

      {/* Level Preview Modal */}
      {showLevelPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 zoom-in-95">
             <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl mb-4 border-4 border-white shadow-sm">
                  {showLevelPreview.type === 'THEORY' && '📖'}
                  {showLevelPreview.type === 'QUIZ' && '❓'}
                  {showLevelPreview.type === 'FLASHCARDS' && '🃏'}
                  {showLevelPreview.type === 'PRACTICE' && '🛠️'}
                  {showLevelPreview.type === 'SUMMARY' && '📑'}
                </div>
                
                <div className="text-xs font-black text-brand-sky uppercase tracking-widest mb-2 border border-brand-sky/30 bg-brand-sky/10 px-3 py-1 rounded-full">
                  {showLevelPreview.type}
                </div>
                
                <h2 className="text-2xl font-black text-gray-800 mb-2">{showLevelPreview.title}</h2>
                <p className="text-gray-500 font-medium mb-8 leading-relaxed max-w-xs">
                   {showLevelPreview.content.description}
                </p>
                
                <div className="w-full grid grid-cols-2 gap-4">
                   <Button variant="secondary" fullWidth onClick={() => setShowLevelPreview(null)}>Später</Button>
                   <Button variant="primary" fullWidth onClick={handleStartLevel}>Starten</Button>
                </div>
             </div>
           </div>
        </div>
      )}

      {/* ACTIVE LEVEL PLAYER */}
      {playingLevel && (
        <LevelPlayer 
          level={playingLevel} 
          onClose={() => setPlayingLevel(null)} 
          onComplete={handleLevelComplete}
        />
      )}

    </div>
  );
};

export default App;