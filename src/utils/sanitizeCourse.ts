import { Course, LevelStatus } from '../types';

export const sanitizeCourse = (input: any): Course => {
    let isFirstLevel = true; // Track if we're at the very first level

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

            // 3. Set status: ONLY the very first level is UNLOCKED, all others LOCKED
            const status = isFirstLevel ? LevelStatus.UNLOCKED : LevelStatus.LOCKED;
            isFirstLevel = false; // After first level, all others are locked

            return {
                ...lvl,
                content,
                status,
                stars: 0 // Reset stars for new imports
            };
        })
    }));

    return {
        ...input,
        units: sanitizedUnits,
        // Always generate unique ID to prevent duplicate issues
        id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        totalProgress: 0,
        type: 'course',
        parentFolderId: input.parentFolderId || null
    };
};
