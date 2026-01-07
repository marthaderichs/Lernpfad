import { Course, UserStats, ShopItem, DashboardItem, Folder } from '../types';
import { INITIAL_COURSES, SHOP_ITEMS, SYSTEM_PROMPT } from '../constants';

// Backend API URL
// In production: API is on same origin (served by Express)
// In development: Vite runs on 3000, Express on 3001
const currentPort = window.location.port;
// Vite dev ports: 5173 (default), 3000, 3002, etc.
// In production, port is empty or 80/443
const isDev = currentPort !== '' && currentPort !== '80' && currentPort !== '443' && currentPort !== '3001';
const API_URL = isDev
    ? `http://${window.location.hostname}:3001/api`
    : '/api';

// ============ COURSES & FOLDERS ============

export const loadCourses = async (): Promise<DashboardItem[]> => {
    try {
        const response = await fetch(`${API_URL}/courses`);
        const result = await response.json();

        if (result.success && result.data) {
            return result.data;
        }
    } catch (e) {
        console.error("Failed to load items from server:", e);
    }

    // First time or server error: save initial courses
    await saveCourses(INITIAL_COURSES);
    return INITIAL_COURSES;
};

export const saveCourses = async (items: DashboardItem[]): Promise<void> => {
    const response = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items)
    });
    
    if (!response.ok) {
        throw new Error(`Speichern fehlgeschlagen: ${response.statusText}`);
    }
    
    const result = await response.json();
    if (!result.success) {
        throw new Error(result.message || 'Speichern fehlgeschlagen');
    }
};

export const addCourse = async (newItem: DashboardItem): Promise<DashboardItem[]> => {
    const response = await fetch(`${API_URL}/courses/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
    });

    if (!response.ok) {
        throw new Error(`Failed to add item: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.success) {
        return result.data;
    } else {
        throw new Error(result.message || "Failed to add item");
    }
};

export const deleteCourse = async (itemId: string): Promise<DashboardItem[]> => {
    const response = await fetch(`${API_URL}/courses/${itemId}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        throw new Error(`Failed to delete item: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.success) {
        return result.data;
    } else {
        throw new Error(result.message || "Failed to delete item");
    }
};

export const moveItems = async (itemIds: string[], targetFolderId: string | null): Promise<DashboardItem[]> => {
    const response = await fetch(`${API_URL}/courses/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds, targetFolderId })
    });

    if (!response.ok) {
        throw new Error(`Failed to move items: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.success) {
        return result.data;
    } else {
        throw new Error(result.message || "Failed to move items");
    }
};

// ============ USER STATS ============

const INITIAL_STATS: UserStats = {
    totalXp: 0,
    coins: 0,
    currentStreak: 0,
    lastStudyDate: null,
    purchasedItems: [],
    activeAvatar: '🦸',
    darkMode: false,
    systemPrompt: SYSTEM_PROMPT
};

export const loadUserStats = async (): Promise<UserStats> => {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const result = await response.json();

        if (result.success && result.data) {
            const stats = { ...INITIAL_STATS, ...result.data };

            // Validate Streak on load
            if (stats.lastStudyDate) {
                const today = new Date().toISOString().split('T')[0];
                const lastDate = new Date(stats.lastStudyDate);
                const currentDate = new Date(today);
                const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 1) {
                    // Missed more than a day, reset streak
                    stats.currentStreak = 0;
                    // We don't save yet, just return the corrected object
                }
            }

            return stats;
        }
    } catch (e) {
        console.error("Failed to load stats from server:", e);
    }

    // First time: save initial stats
    await saveUserStats(INITIAL_STATS);
    return INITIAL_STATS;
};

export const saveUserStats = async (stats: UserStats): Promise<void> => {
    const response = await fetch(`${API_URL}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats)
    });
    
    if (!response.ok) {
        throw new Error(`Stats speichern fehlgeschlagen: ${response.statusText}`);
    }
    
    const result = await response.json();
    if (!result.success) {
        throw new Error(result.message || 'Stats speichern fehlgeschlagen');
    }
};

export const updateUserProgress = async (starsEarned: number): Promise<UserStats> => {
    const stats = await loadUserStats();
    const today = new Date().toISOString().split('T')[0];

    // Calculate XP & Coins
    const xpGain = starsEarned === 3 ? 50 : starsEarned === 2 ? 25 : 10;
    stats.totalXp += xpGain;
    stats.coins += xpGain;

    // Calculate Streak
    if (stats.lastStudyDate !== today) {
        if (stats.lastStudyDate) {
            const lastDate = new Date(stats.lastStudyDate);
            const currentDate = new Date(today);
            const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                stats.currentStreak += 1;
                const streakBonus = Math.min(stats.currentStreak * 5, 50);
                stats.coins += streakBonus;
            } else if (diffDays > 1) {
                stats.currentStreak = 1;
            }
        } else {
            stats.currentStreak = 1;
        }
        stats.lastStudyDate = today;
    }

    await saveUserStats(stats);
    return stats;
};

// ============ SHOP ============

export const purchaseItem = async (itemId: string): Promise<{ success: boolean; stats: UserStats; message: string }> => {
    const stats = await loadUserStats();
    const item = SHOP_ITEMS.find(i => i.id === itemId);

    if (!item) {
        return { success: false, stats, message: 'Item nicht gefunden!' };
    }

    if (stats.purchasedItems.includes(itemId)) {
        return { success: false, stats, message: 'Du besitzt dieses Item bereits!' };
    }

    if (stats.coins < item.price) {
        return { success: false, stats, message: `Nicht genug Coins! Du brauchst ${item.price - stats.coins} mehr.` };
    }

    stats.coins -= item.price;
    stats.purchasedItems.push(itemId);

    if (item.category === 'avatar') {
        stats.activeAvatar = item.icon;
    }
    if (item.id === 'dark_mode') {
        stats.darkMode = true;
    }

    await saveUserStats(stats);
    return { success: true, stats, message: `${item.name} gekauft!` };
};

export const setActiveAvatar = async (emoji: string): Promise<UserStats> => {
    const stats = await loadUserStats();
    stats.activeAvatar = emoji;
    await saveUserStats(stats);
    return stats;
};

export const toggleDarkMode = async (): Promise<UserStats> => {
    const stats = await loadUserStats();
    stats.darkMode = !stats.darkMode;
    await saveUserStats(stats);
    return stats;
};
