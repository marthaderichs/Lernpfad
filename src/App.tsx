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
        loadInitialData,
        selectLevel,
        updateCourseProgress,
        updateUserProgress
    } = useAppStore();

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900">
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
