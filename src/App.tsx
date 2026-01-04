import React, { useEffect } from 'react';
import { useAppStore } from './stores/useAppStore';
import { Dashboard } from './components/dashboard';
import { CourseMap } from './components/course';
import { Shop } from './components/shop';
import { LevelPlayer } from './components/level-player';
import { handleLevelCompletion } from './utils/levelLogic';

const App: React.FC = () => {
    const {
        currentView,
        selectedCourse,
        selectedLevelIndex,
        isLoading,
        error,
        clearError,
        loadInitialData,
        selectLevel,
        updateCourseProgress,
        updateUserProgress
    } = useAppStore();

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // Auto-dismiss error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => clearError(), 5000);
            return () => clearTimeout(timer);
        }
    }, [error, clearError]);

    const getActiveLevel = () => {
        if (!selectedCourse || selectedLevelIndex === null) return null;
        const allLevels = selectedCourse.units.flatMap(u => u.levels);
        return allLevels[selectedLevelIndex];
    };

    const activeLevel = getActiveLevel();

    const handleLevelComplete = async (score: number) => {
        if (!selectedCourse || !activeLevel) return;

        const { updatedCourse } = handleLevelCompletion(selectedCourse, activeLevel.id, score);

        updateCourseProgress(selectedCourse.id, updatedCourse);

        if (score > 0) {
            await updateUserProgress(score);
        }

        selectLevel(null);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">
                <div className="animate-spin text-4xl">⏳</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 relative">
            {error && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] w-full max-w-md px-4">
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg flex justify-between items-center animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2">
                            <span>⚠️</span>
                            <p className="font-bold text-sm">{error}</p>
                        </div>
                        <button onClick={clearError} className="text-red-500 hover:text-red-700 font-bold px-2">
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {(currentView === 'DASHBOARD' || (currentView === 'COURSE_MAP' && !selectedCourse)) && <Dashboard />}
            {currentView === 'COURSE_MAP' && selectedCourse && <CourseMap />}
            {currentView === 'SHOP' && <Shop />}

            {activeLevel && (
                <LevelPlayer
                    level={activeLevel}
                    onClose={() => selectLevel(null)}
                    onComplete={handleLevelComplete}
                />
            )}
        </div>
    );
};

export default App;
