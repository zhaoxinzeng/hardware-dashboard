import { useEffect, useMemo, useState } from 'react';
import type { Course, CourseDifficulty, CreateCourseInput } from '../types/course';
import { getSafeCourseUrl } from '../utils/courseUrl';

const COURSE_STORAGE_KEY = 'xinghe_courses_data';

const DEFAULT_COURSES: Course[] = [
    {
        id: 'c1',
        title: '飞桨多硬件生态基础认知',
        description: '本课程主要介绍飞桨在大模型时代的硬件生态布局，以及基础的适配调优理念。',
        url: 'https://invalid.local/pending-course-c1',
        duration: '2.5h',
        difficulty: '入门',
        isPinned: false,
        createdAt: Date.now() - 3000
    },
    {
        id: 'c2',
        title: '昇腾 910B 算力底座深度调优',
        description: '深入讲解华为昇腾 910B 的架构特性与飞桨框架的深度适配调优技巧。',
        url: 'https://invalid.local/pending-course-c2',
        duration: '4h',
        difficulty: '进阶',
        isPinned: false,
        createdAt: Date.now() - 2000
    },
    {
        id: 'c3',
        title: '跨架构极速分布式训练实战',
        description: '实战演练多硬件异构集群下的分布式训练策略，涵盖昇腾、昆仑芯等多平台协同。',
        url: 'https://invalid.local/pending-course-c3',
        duration: '6h',
        difficulty: '高阶',
        isPinned: false,
        createdAt: Date.now() - 1000
    }
];

const DIFFICULTY_ORDER: CourseDifficulty[] = ['入门', '进阶', '高阶'];

const sortByCreatedAtDesc = (a: Course, b: Course) => b.createdAt - a.createdAt;

const sortPinnedThenLatest = (a: Course, b: Course) => {
    if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
    }

    return sortByCreatedAtDesc(a, b);
};

const loadCoursesFromStorage = (): Course[] => {
    const saved = localStorage.getItem(COURSE_STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map((course) => ({
                    ...course,
                    url: getSafeCourseUrl(typeof course.url === 'string' ? course.url : '', course.id)
                }));
            }
        } catch (error) {
            console.error('Failed to parse courses data', error);
        }
    }

    return DEFAULT_COURSES;
};

const buildHomepageCourses = (allCourses: Course[]): Course[] => {
    if (allCourses.length === 0) {
        return [];
    }

    const result: Course[] = [];
    const selectedIds = new Set<string>();
    const selectedDifficulties = new Set<CourseDifficulty>();

    const pinnedCourses = allCourses.filter(course => course.isPinned).sort(sortByCreatedAtDesc);

    for (const course of pinnedCourses) {
        if (result.length === 3) {
            break;
        }

        result.push(course);
        selectedIds.add(course.id);
        selectedDifficulties.add(course.difficulty);
    }

    for (const difficulty of DIFFICULTY_ORDER) {
        if (result.length === 3) {
            break;
        }

        if (selectedDifficulties.has(difficulty)) {
            continue;
        }

        const candidate = allCourses
            .filter(course => !selectedIds.has(course.id) && course.difficulty === difficulty)
            .sort(sortByCreatedAtDesc)[0];

        if (candidate) {
            result.push(candidate);
            selectedIds.add(candidate.id);
            selectedDifficulties.add(candidate.difficulty);
        }
    }

    if (result.length < 3) {
        const latestRemaining = allCourses
            .filter(course => !selectedIds.has(course.id))
            .sort(sortByCreatedAtDesc);

        for (const course of latestRemaining) {
            if (result.length === 3) {
                break;
            }

            result.push(course);
            selectedIds.add(course.id);
        }
    }

    return result.slice(0, 3);
};

export const useCoursesData = () => {
    const [courses, setCourses] = useState<Course[]>(loadCoursesFromStorage);

    useEffect(() => {
        localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(courses));
    }, [courses]);

    const sortedCourses = useMemo(() => [...courses].sort(sortPinnedThenLatest), [courses]);

    const featuredCourses = useMemo(() => buildHomepageCourses(courses), [courses]);

    const addCourse = (newCourse: CreateCourseInput) => {
        const nextCourse: Course = {
            id: `course_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            title: newCourse.title.trim(),
            description: newCourse.description?.trim() || '',
            duration: newCourse.duration.trim(),
            difficulty: newCourse.difficulty,
            url: getSafeCourseUrl(newCourse.url),
            isPinned: false,
            createdAt: Date.now()
        };

        setCourses(prev => [nextCourse, ...prev]);
    };

    const togglePinned = (id: string) => {
        setCourses(prev => prev.map(course => (
            course.id === id ? { ...course, isPinned: !course.isPinned } : course
        )));
    };

    const removeCourse = (id: string) => {
        setCourses(prev => prev.filter(course => course.id !== id));
    };

    const updateCourse = (id: string, updates: Partial<Omit<Course, 'id' | 'isPinned' | 'createdAt'>>) => {
        setCourses(prev => prev.map(course =>
            course.id === id ? { ...course, ...updates } : course
        ));
    };

    return {
        courses,
        sortedCourses,
        featuredCourses,
        addCourse,
        togglePinned,
        removeCourse,
        updateCourse
    };
};
