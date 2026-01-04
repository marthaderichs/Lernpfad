import { Course, LevelStatus, Level } from '../types';

export const handleLevelCompletion = (
    course: Course,
    levelId: string,
    stars: number
): { updatedCourse: Course } => {
    // Deep clone to safely mutate
    const newCourse = JSON.parse(JSON.stringify(course));
    let levelFound = false;

    for (let u = 0; u < newCourse.units.length; u++) {
        const unit = newCourse.units[u];
        for (let l = 0; l < unit.levels.length; l++) {
            const lvl = unit.levels[l];

            if (levelFound) {
                // Unlock next level
                if (lvl.status === LevelStatus.LOCKED) {
                    lvl.status = LevelStatus.UNLOCKED;
                }
                // We only unlock one next level
                levelFound = false;
                // Break inner and outer loop? logic in original was:
                // levelFound = false; break; (breaks inner)
                // then outer loop continues. But we only want to unlock the IMMEDIATE next level.
                // Correct logic: set flag, unlock current loop item, then stop searching.
                // We need to return.
                return { updatedCourse: recalculateProgress(newCourse) };
            }

            if (lvl.id === levelId) {
                lvl.status = LevelStatus.COMPLETED;
                lvl.stars = Math.max(lvl.stars, stars) as 0 | 1 | 2 | 3;
                levelFound = true; // Next iteration will solve unlocking
            }
        }
    }

    return { updatedCourse: recalculateProgress(newCourse) };
};

const recalculateProgress = (course: Course): Course => {
    let totalLevels = 0;
    let completed = 0;
    course.units.forEach((u: any) => {
        u.levels.forEach((l: any) => {
            totalLevels++;
            if (l.status === LevelStatus.COMPLETED) completed++;
        });
    });
    course.totalProgress = totalLevels > 0 ? Math.round((completed / totalLevels) * 100) : 0;
    return course;
};
