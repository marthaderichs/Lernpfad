import { describe, it, expect, vi } from 'vitest';
import * as api from './api';
import { Folder, Course } from '../types';

global.fetch = vi.fn();

describe('Folder Data Structure', () => {
    it('can load a mix of courses and folders', async () => {
        const mockData = [
            {
                id: 'f1',
                type: 'folder',
                title: 'Math',
                icon: '📁',
                themeColor: 'brand-blue',
                parentFolderId: null
            },
            {
                id: 'c1',
                type: 'course',
                title: 'Algebra',
                icon: '🔢',
                themeColor: 'brand-green',
                totalProgress: 0,
                parentFolderId: 'f1',
                units: []
            }
        ];

        (fetch as any).mockResolvedValueOnce({
            json: async () => ({ success: true, data: mockData })
        });

        const items = await api.loadCourses();
        expect(items).toHaveLength(2);
        expect(items[0].type).toBe('folder');
        expect(items[1].type).toBe('course');
        expect((items[1] as Course).parentFolderId).toBe('f1');
    });

    it('can save folders', async () => {
        const mockFolders: any[] = [
            { id: 'f1', type: 'folder', title: 'Test' }
        ];

        await api.saveCourses(mockFolders);

        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/courses'), expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(mockFolders)
        }));
    });
});
