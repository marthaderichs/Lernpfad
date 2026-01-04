import { useAppStore } from '../stores/useAppStore';
import { Course, Level } from '../../types';

export const useCourses = () => {
    const {
        courses,
        selectedCourse,
        addCourse,
        deleteCourse,
        updateCourseProgress,
        selectCourse
    } = useAppStore();

    const getCourseById = (id: string): Course | undefined =>
        courses.find(c => c.id === id);

    const getAllLevels = (course: Course): Level[] =>
        course.units.flatMap(u => u.levels);

    const calculateProgress = (course: Course): number => {
        const levels = getAllLevels(course);
        const completed = levels.filter(l => l.stars > 0).length;
        return levels.length > 0 ? Math.round((completed / levels.length) * 100) : 0;
    };

    return {
        courses,
        selectedCourse,
        addCourse,
        deleteCourse,
        selectCourse,
        getCourseById,
        getAllLevels,
        calculateProgress,
        updateCourseProgress,
    };
};
