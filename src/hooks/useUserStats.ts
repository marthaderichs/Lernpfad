import { useAppStore } from '../stores/useAppStore';

export const useUserStats = () => {
    const { userStats, setUserStats, updateUserProgress } = useAppStore();

    const getLevel = (xp: number): number => {
        return Math.floor(xp / 100) + 1;
    };

    const getXpForNextLevel = (xp: number): number => {
        return 100 - (xp % 100);
    };

    return {
        stats: userStats,
        level: userStats ? getLevel(userStats.totalXp) : 1,
        xpToNextLevel: userStats ? getXpForNextLevel(userStats.totalXp) : 100,
        updateUserProgress,
        setUserStats,
    };
};
