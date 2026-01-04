import { Course } from '../types';

export const mergeTranslations = (course: Course, translation: any): Course => {
    // Deep merge logic
    const result = { ...course };
    
    if (translation.title) {
        result.titlePT = translation.title;
    }

    if (course.units && translation.units) {
        result.units = course.units.map((unit: any, uIdx: number) => {
            const transUnit = translation.units[uIdx];
            if (!transUnit) return unit;

            return {
                ...unit,
                titlePT: transUnit.title,
                descriptionPT: transUnit.description,
                levels: unit.levels.map((lvl: any, lIdx: number) => {
                    const transLvl = transUnit.levels?.[lIdx];
                    if (!transLvl) return lvl;

                    return {
                        ...lvl,
                        contentPT: transLvl.content || transLvl // Use transLvl if content is missing
                    };
                })
            };
        });
    }
    return result;
};

/**
 * Strips technical/progress fields to create a clean template for translation
 */
export const getCourseTranslationTemplate = (course: Course): string => {
    const template = {
        title: course.title,
        units: course.units.map(u => ({
            title: u.title,
            description: u.description,
            levels: u.levels.map(l => ({
                title: l.title,
                content: l.content
            }))
        }))
    };
    return JSON.stringify(template, null, 2);
};
