import { describe, it, expect } from 'vitest';
import { mergeTranslations, getCourseTranslationTemplate } from './courseUtils';
import { Course } from '../types';

describe('courseUtils', () => {
    const mockCourse: Course = {
        id: 'c1',
        title: 'German Title',
        icon: '📚',
        totalProgress: 0,
        themeColor: 'brand-blue',
        type: 'course',
        units: [
            {
                id: 'u1',
                title: 'Unit 1',
                description: 'Desc 1',
                colorTheme: 'brand-blue',
                levels: [
                    {
                        id: 'l1',
                        title: 'Level 1',
                        type: 'THEORY' as any,
                        status: 'UNLOCKED' as any,
                        stars: 0,
                        content: { title: 'L1 DE', description: 'D1 DE' }
                    }
                ]
            }
        ]
    };

    it('should merge translations correctly', () => {
        const translation = {
            title: 'Portuguese Title',
            units: [
                {
                    title: 'Unidade 1',
                    description: 'Desc PT 1',
                    levels: [
                        {
                            content: { title: 'L1 PT', description: 'D1 PT' }
                        }
                    ]
                }
            ]
        };

        const merged = mergeTranslations(mockCourse, translation);

        expect(merged.titlePT).toBe('Portuguese Title');
        expect(merged.units[0].titlePT).toBe('Unidade 1');
        expect(merged.units[0].levels[0].contentPT?.title).toBe('L1 PT');
    });

    it('should handle missing translation units gracefully', () => {
        const translation = { title: 'PT Title', units: [] };
        const merged = mergeTranslations(mockCourse, translation);
        expect(merged.titlePT).toBe('PT Title');
        expect(merged.units[0].titlePT).toBeUndefined();
    });

    it('should generate a clean translation template', () => {
        const templateStr = getCourseTranslationTemplate(mockCourse);
        const template = JSON.parse(templateStr);

        expect(template.title).toBe('German Title');
        expect(template.units[0].levels[0].content.title).toBe('L1 DE');
        expect(template.units[0].levels[0]).not.toHaveProperty('id');
        expect(template.units[0].levels[0]).not.toHaveProperty('status');
    });
});
