import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Level, LevelType, Flashcard } from '../types';
import { Button } from './Button';
import { X, ChevronRight, Check, RotateCw, Lightbulb, ThumbsUp, ThumbsDown, HelpCircle, GraduationCap, PieChart, Target, RefreshCw, Zap } from 'lucide-react';

interface LevelPlayerProps {
   level: Level;
   onClose: () => void;
   onComplete: (score: number) => void; // score 0-3
}

// Internal type for tracking status
interface PlayableCard extends Flashcard {
   _id: string;
}

// Helper to shuffle cards initially
const shuffleArray = <T,>(array: T[]): T[] => {
   return [...array].sort(() => Math.random() - 0.5);
};

export const LevelPlayer: React.FC<LevelPlayerProps> = ({ level, onClose, onComplete }) => {
   const [step, setStep] = useState(0);
   const [showResult, setShowResult] = useState(false);

   // Quiz State
   const [quizScore, setQuizScore] = useState(0);
   const [selectedOption, setSelectedOption] = useState<number | null>(null);

   // Flashcard State
   const [cardQueue, setCardQueue] = useState<PlayableCard[]>([]);
   const [isFlipped, setIsFlipped] = useState(false);
   const [completedCards, setCompletedCards] = useState(0);
   const [cardColors, setCardColors] = useState<string[]>([]);
   const [mistakeIds, setMistakeIds] = useState<Set<string>>(new Set());
   const [initialTotalCards, setInitialTotalCards] = useState(0);

   // Practice State
   const [solutionVisible, setSolutionVisible] = useState(false);

   // Initialize Flashcards
   useEffect(() => {
      if (level.type === LevelType.FLASHCARDS && level.content.flashcards) {
         // Add IDs for tracking unique mistakes
         const preparedCards = level.content.flashcards.map((c, i) => ({ ...c, _id: `card_${i}` }));
         setCardQueue(shuffleArray(preparedCards));
         setInitialTotalCards(preparedCards.length);

         // Pre-generate colors for the session
         const colors = ['bg-brand-purple', 'bg-brand-blue', 'bg-brand-teal', 'bg-brand-orange', 'bg-brand-red', 'bg-brand-pink'];
         setCardColors(Array(20).fill(0).map(() => colors[Math.floor(Math.random() * colors.length)]));
      }
   }, [level]);

   // --- RENDERERS ---

   // 1. THEORY & SUMMARY
   if (level.type === LevelType.THEORY || level.type === LevelType.SUMMARY) {
      const content = level.content.markdownContent || "Kein Inhalt verfügbar.";

      return (
         <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${level.type === 'THEORY' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                     {level.type === 'THEORY' ? '📖' : '📑'}
                  </div>
                  <div>
                     <h2 className="font-black text-gray-800 text-lg leading-tight">{level.title}</h2>
                     <p className="text-xs text-gray-400 font-bold uppercase">{level.content.title}</p>
                  </div>
               </div>
               <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
                  <X size={24} className="text-gray-500" />
               </button>
            </div>

            {/* Markdown Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-3xl mx-auto w-full">
               <div className="markdown-content text-gray-700 text-lg leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                     {content}
                  </ReactMarkdown>
               </div>

               {/* Completion Animation Placeholder */}
               {level.type === 'SUMMARY' && (
                  <div className="mt-10 p-6 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center gap-4 animate-bounce-subtle">
                     <div className="text-4xl">🏆</div>
                     <div>
                        <h4 className="font-bold text-yellow-800">Kurs abgeschlossen!</h4>
                        <p className="text-sm text-yellow-700">Du hast alle Inhalte gemeistert.</p>
                     </div>
                  </div>
               )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/80 backdrop-blur">
               <div className="max-w-3xl mx-auto">
                  <Button variant="success" fullWidth onClick={() => onComplete(3)}>
                     Gelesen & Verstanden <Check size={20} className="ml-2 inline" />
                  </Button>
               </div>
            </div>
         </div>
      );
   }

   // 2. QUIZ
   if (level.type === LevelType.QUIZ) {
      const questions = level.content.quizQuestions || [];
      const currentQ = questions[step];

      const handleAnswer = (index: number) => {
         if (selectedOption !== null) return;
         setSelectedOption(index);
         if (index === currentQ.answerIndex) setQuizScore(prev => prev + 1);
      };

      const nextQuestion = () => {
         setSelectedOption(null);
         if (step < questions.length - 1) {
            setStep(step + 1);
         } else {
            setShowResult(true);
         }
      };

      if (showResult) {
         const percentage = (quizScore / questions.length) * 100;
         const stars = percentage === 100 ? 3 : percentage >= 50 ? 2 : 1;
         const passed = percentage >= 50;

         return (
            <div className="fixed inset-0 z-[60] bg-brand-purple flex items-center justify-center p-6 animate-in zoom-in-95">
               <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-white/20">
                  <div className="text-6xl mb-4 animate-bounce">{passed ? '🎉' : '😕'}</div>
                  <h2 className="text-3xl font-black text-gray-800 mb-2">{passed ? 'Gut gemacht!' : 'Versuchs nochmal'}</h2>
                  <p className="text-gray-500 font-bold mb-6">Ergebnis: {quizScore} / {questions.length} richtig</p>

                  <div className="flex justify-center gap-2 mb-8">
                     {[1, 2, 3].map(s => (
                        <div key={s} className={`text-5xl transition-all ${s <= stars && passed ? 'text-yellow-400 drop-shadow-md scale-110' : 'text-gray-200'}`}>★</div>
                     ))}
                  </div>

                  {passed ? (
                     <Button variant="success" fullWidth onClick={() => onComplete(stars)}>Weiter</Button>
                  ) : (
                     <div className="flex gap-2">
                        <Button variant="secondary" fullWidth onClick={onClose}>Ende</Button>
                        <Button variant="primary" fullWidth onClick={() => { setStep(0); setQuizScore(0); setShowResult(false); }}>Wiederholen</Button>
                     </div>
                  )}
               </div>
            </div>
         );
      }

      if (!currentQ) return <div onClick={onClose}>Error: Missing Data</div>;

      return (
         <div className="fixed inset-0 z-[60] bg-[#f0f9ff] flex flex-col h-full">
            <div className="px-6 py-8">
               <div className="flex justify-between items-center mb-4">
                  <button onClick={onClose}><X className="text-gray-400" /></button>
                  <span className="font-black text-brand-sky uppercase tracking-widest text-xs">Quiz • Frage {step + 1} / {questions.length}</span>
                  <div className="w-6" />
               </div>
               <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-sky transition-all duration-500 ease-out" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-20">
               <div className="max-w-2xl mx-auto w-full">
                  <h3 className="text-2xl md:text-3xl font-black text-gray-800 mb-8 leading-tight">{currentQ.question}</h3>

                  <div className="grid gap-4">
                     {currentQ.options.map((opt, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrect = idx === currentQ.answerIndex;
                        const showStatus = selectedOption !== null;

                        let styleClass = "bg-white border-gray-200 text-gray-600 hover:border-brand-sky hover:bg-sky-50"; // Default

                        if (showStatus) {
                           if (isCorrect) styleClass = "bg-green-100 border-green-500 text-green-800 ring-2 ring-green-200";
                           else if (isSelected && !isCorrect) styleClass = "bg-red-50 border-red-300 text-red-800 opacity-70";
                           else styleClass = "bg-gray-50 border-gray-100 text-gray-400 opacity-50";
                        }

                        return (
                           <div key={idx} className="flex flex-col">
                              <button
                                 onClick={() => handleAnswer(idx)}
                                 disabled={showStatus}
                                 className={`p-5 rounded-2xl border-b-4 text-left font-bold transition-all duration-200 active:scale-95 flex items-center gap-4 ${styleClass}`}
                              >
                                 <div className={`w-8 h-8 shrink-0 rounded-full border-2 flex items-center justify-center text-sm font-black ${showStatus && isCorrect ? 'border-green-600 bg-green-200 text-green-700' : 'border-current opacity-50'}`}>
                                    {String.fromCharCode(65 + idx)}
                                 </div>
                                 <span className="leading-snug">{opt.text}</span>
                              </button>

                              {/* Explanation for this specific option if selected or if it's the correct one while another was selected */}
                              {showStatus && (isSelected || (isCorrect && selectedOption !== null)) && (
                                 <div className={`mt-2 ml-4 p-3 rounded-lg text-sm border-l-4 animate-in slide-in-from-top-2 ${isCorrect ? 'border-green-500 bg-green-50 text-green-800' : 'border-red-400 bg-red-50 text-red-800'}`}>
                                    <div className="markdown-content [&_p]:mb-0 [&_p]:inline">
                                       <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                          {opt.explanation}
                                       </ReactMarkdown>
                                    </div>
                                 </div>
                              )}
                           </div>
                        );
                     })}
                  </div>

                  {selectedOption !== null && (
                     <div className="mt-8 mb-10 animate-in fade-in slide-in-from-bottom-4">
                        <Button variant="primary" fullWidth onClick={nextQuestion} className="shadow-xl py-4 text-lg">
                           {step < questions.length - 1 ? 'Nächste Frage' : 'Ergebnisse anzeigen'}
                        </Button>
                     </div>
                  )}
               </div>
            </div>
         </div>
      );
   }

   // 3. FLASHCARDS
   if (level.type === LevelType.FLASHCARDS) {
      if (cardQueue.length === 0 && completedCards > 0) {
         // STAT BOARD
         const total = initialTotalCards;
         const mistakes = mistakeIds.size;
         const correctFirstTry = total - mistakes;
         const accuracy = Math.round((correctFirstTry / total) * 100);

         // Calculate Stars: >80% = 3, >50% = 2, else 1
         const stars = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1;

         let emoji = "🤔";
         let title = "Guter Anfang!";
         if (accuracy === 100) { emoji = "🔥"; title = "Perfekt!"; }
         else if (accuracy >= 80) { emoji = "😎"; title = "Starke Leistung!"; }
         else if (accuracy >= 50) { emoji = "👍"; title = "Gut Gemacht!"; }

         // CSS Conic Gradient for the Donut Chart
         const gradient = `conic-gradient(var(--brand-green) ${accuracy}%, #f3f4f6 0)`;

         return (
            <div className="fixed inset-0 z-[60] bg-gray-50 flex items-center justify-center p-6 animate-in zoom-in-95">
               <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border-4 border-white relative overflow-hidden">

                  {/* Background Decor */}
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-sky/10 to-transparent pointer-events-none" />

                  <div className="relative z-10 text-center">
                     <div className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Zusammenfassung</div>

                     {/* Donut Chart */}
                     <div className="w-40 h-40 mx-auto mb-6 rounded-full flex items-center justify-center relative shadow-lg"
                        style={{ background: gradient, '--brand-green': '#75D06A' } as React.CSSProperties}>
                        <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center z-10">
                           <span className="text-4xl animate-bounce">{emoji}</span>
                           <span className="text-2xl font-black text-gray-800 mt-1">{accuracy}%</span>
                        </div>
                     </div>

                     <h2 className="text-3xl font-black text-gray-800 mb-2">{title}</h2>
                     <p className="text-gray-500 font-medium mb-8">Du hast {total} Karten gelernt.</p>

                     {/* Stats Grid */}
                     <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-green-50 border-2 border-green-100 p-4 rounded-2xl flex flex-col items-center">
                           <span className="text-2xl font-black text-green-600 mb-1">{correctFirstTry}</span>
                           <span className="text-xs font-bold text-green-800 uppercase flex items-center gap-1">
                              <Check size={12} /> Sofort Gewusst
                           </span>
                        </div>
                        <div className="bg-orange-50 border-2 border-orange-100 p-4 rounded-2xl flex flex-col items-center">
                           <span className="text-2xl font-black text-orange-500 mb-1">{mistakes}</span>
                           <span className="text-xs font-bold text-orange-800 uppercase flex items-center gap-1">
                              <RefreshCw size={12} /> Wiederholt
                           </span>
                        </div>
                     </div>

                     {/* XP Preview */}
                     <div className="bg-gray-50 rounded-xl p-3 mb-8 flex items-center justify-center gap-2 text-gray-400 font-bold text-sm">
                        <Zap size={16} className="text-yellow-400 fill-current" />
                        +{stars === 3 ? 50 : stars === 2 ? 25 : 10} XP verdient
                     </div>

                     <Button variant="primary" fullWidth onClick={() => onComplete(stars)} className="py-4 text-lg shadow-xl">
                        Weiter
                     </Button>
                  </div>
               </div>
            </div>
         );
      }

      if (cardQueue.length === 0) return null; // Should not happen during loading

      const currentCard = cardQueue[0];
      const currentColor = cardColors[completedCards % cardColors.length] || 'bg-brand-purple';

      const handleRating = (known: boolean) => {
         setIsFlipped(false);

         setTimeout(() => {
            if (known) {
               // Remove from queue
               setCompletedCards(p => p + 1);
               setCardQueue(prev => prev.slice(1));
            } else {
               // Mark as mistake (add ID to set)
               setMistakeIds(prev => new Set(prev).add(currentCard._id));

               // Move to end (or slightly mixed in)
               const newQueue = [...cardQueue.slice(1), currentCard];
               setCardQueue(newQueue);
            }
         }, 200); // Wait for animation
      };

      return (
         <div className="fixed inset-0 z-[60] bg-[#f0f9ff] flex flex-col items-center justify-center p-6 overflow-hidden">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center text-gray-500 font-bold uppercase tracking-widest text-sm z-10">
               <button onClick={onClose} className="hover:text-gray-800 transition-colors"><X /></button>
               <div className="flex flex-col items-center">
                  <span className="text-gray-400">Lernstapel</span>
                  <div className="flex gap-1 mt-1">
                     <span className="text-green-500">{completedCards} Fertig</span>
                     <span className="text-gray-300">|</span>
                     <span className="text-orange-500">{cardQueue.length} Offen</span>
                  </div>
               </div>
               <div className="w-6" />
            </div>

            {/* Card Container - Simple Flip without 3D */}
            <div
               className="w-full max-w-sm aspect-[3/4] relative cursor-pointer group mb-8"
               onClick={() => setIsFlipped(!isFlipped)}
            >
               {/* Front - visible when not flipped */}
               <div
                  className={`absolute inset-0 bg-white rounded-[2rem] shadow-xl flex flex-col items-center justify-center p-8 border-4 border-gray-100 transition-all duration-300 ${isFlipped ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
                     }`}
               >
                  <div className="absolute top-8 text-gray-200 font-black text-8xl select-none">?</div>
                  <h3 className="text-3xl font-black text-gray-800 text-center leading-tight select-none relative z-10">{currentCard.front}</h3>
                  <div className="absolute bottom-10 text-gray-400 font-bold text-xs flex items-center gap-2 animate-pulse uppercase tracking-widest">
                     <RotateCw size={14} /> Tippen zum Umdrehen
                  </div>
               </div>

               {/* Back - visible when flipped */}
               <div
                  className={`absolute inset-0 ${currentColor} rounded-[2rem] shadow-xl flex flex-col items-center justify-center p-8 border-4 border-white/30 text-white transition-all duration-300 ${isFlipped ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                     }`}
               >
                  <div className="absolute top-8 right-8 text-white/20"><Lightbulb size={40} /></div>
                  <p className="text-xl font-bold text-center leading-relaxed select-none">{currentCard.back}</p>
               </div>
            </div>

            {/* Controls - Only show when flipped */}
            <div className={`w-full max-w-sm flex gap-4 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
               <button
                  onClick={(e) => { e.stopPropagation(); handleRating(false); }}
                  className="flex-1 bg-red-500 hover:bg-red-400 text-white p-4 rounded-2xl font-bold border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center gap-1"
               >
                  <ThumbsDown size={24} />
                  <span className="text-xs uppercase">Noch nicht</span>
               </button>

               <button
                  onClick={(e) => { e.stopPropagation(); handleRating(true); }}
                  className="flex-1 bg-green-500 hover:bg-green-400 text-white p-4 rounded-2xl font-bold border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center gap-1"
               >
                  <ThumbsUp size={24} />
                  <span className="text-xs uppercase">Gewusst</span>
               </button>
            </div>
         </div>
      );
   }

   // 4. PRACTICE
   if (level.type === LevelType.PRACTICE) {
      const tasks = level.content.practiceTasks || [];
      const currentTask = tasks[step];

      const nextTask = () => {
         setSolutionVisible(false);
         if (step < tasks.length - 1) {
            setStep(step + 1);
         } else {
            onComplete(3);
         }
      };

      if (!currentTask) return null;

      return (
         <div className="fixed inset-0 z-[60] bg-gray-50 flex flex-col h-full">
            <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm">
               <div className="flex items-center gap-2 text-brand-orange font-black uppercase tracking-wider">
                  <div className="p-2 bg-orange-100 rounded-lg"><GraduationCap size={20} /></div>
                  <span>Training {step + 1}/{tasks.length}</span>
               </div>
               <button onClick={onClose}><X className="text-gray-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-3xl mx-auto w-full">
               {/* Question Card */}
               <div className="bg-white rounded-3xl p-8 shadow-sm border-b-4 border-gray-200 mb-8">
                  <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">Aufgabe</h3>
                  <div className="markdown-content text-xl md:text-2xl font-bold text-gray-800">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentTask.question}</ReactMarkdown>
                  </div>

                  {currentTask.hint && !solutionVisible && (
                     <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold flex gap-3 items-start border border-blue-100">
                        <HelpCircle size={18} className="shrink-0 mt-0.5" />
                        <div>
                           <span className="block font-black uppercase text-[10px] opacity-70 mb-1">Hinweis</span>
                           {currentTask.hint}
                        </div>
                     </div>
                  )}
               </div>

               {/* Solution Section */}
               {solutionVisible ? (
                  <div className="animate-in slide-in-from-bottom-10 fade-in duration-500">
                     <div className="bg-green-50 rounded-3xl p-8 border-2 border-green-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-green-800"><Check size={100} /></div>
                        <h3 className="text-green-700 font-bold text-xs uppercase tracking-widest mb-4 relative z-10">Lösungsweg</h3>
                        <div className="markdown-content text-gray-700 relative z-10">
                           <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentTask.solution}</ReactMarkdown>
                        </div>
                     </div>

                     <div className="mt-8 flex justify-end">
                        <Button variant="primary" onClick={nextTask} className="shadow-xl">
                           {step < tasks.length - 1 ? 'Nächste Aufgabe' : 'Training Beenden'} <ChevronRight className="ml-2 inline" />
                        </Button>
                     </div>
                  </div>
               ) : (
                  <div className="flex justify-center mt-10">
                     <Button variant="secondary" onClick={() => setSolutionVisible(true)} className="border-brand-orange text-brand-orange bg-orange-50 hover:bg-orange-100">
                        Lösung anzeigen
                     </Button>
                  </div>
               )}
            </div>
         </div>
      );
   }

   return null;
};