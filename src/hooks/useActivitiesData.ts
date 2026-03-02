import { useEffect, useMemo, useState } from 'react';
import type { Activity, CreateActivityInput } from '../types/activity';
import { getSafeActivityUrl } from '../utils/activityUrl';

const ACTIVITY_STORAGE_KEY = 'xinghe_activities_data';

const DEFAULT_ACTIVITIES: Activity[] = [
    {
        id: 'a1',
        title: 'WAVE SUMMIT 2025 深度学习开发者大会',
        dateMonth: '12月',
        dateDay: '10日',
        location: '北京 · 线上同步',
        formatTag: '线下/线上',
        url: 'https://invalid.local/pending-activity-a1',
        isPinned: false,
        createdAt: Date.now() - 3000
    },
    {
        id: 'a2',
        title: '星河杯多硬件异构计算挑战赛启动',
        dateMonth: '12月',
        dateDay: '22日',
        location: '线上直播',
        formatTag: '线上',
        url: 'https://invalid.local/pending-activity-a2',
        isPinned: false,
        createdAt: Date.now() - 2000
    },
    {
        id: 'a3',
        title: '星河开发者硬件适配闭门工作坊',
        dateMonth: '01月',
        dateDay: '08日',
        location: '上海 · 线下',
        formatTag: '线下',
        url: 'https://invalid.local/pending-activity-a3',
        isPinned: false,
        createdAt: Date.now() - 1000
    }
];

const sortPinnedThenLatest = (a: Activity, b: Activity) => {
    if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
    }

    return b.createdAt - a.createdAt;
};

const loadActivitiesFromStorage = (): Activity[] => {
    const saved = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map((activity) => ({
                    ...activity,
                    url: getSafeActivityUrl(typeof activity.url === 'string' ? activity.url : '', activity.id)
                }));
            }
        } catch (error) {
            console.error('Failed to parse activities data', error);
        }
    }

    return DEFAULT_ACTIVITIES;
};

export const useActivitiesData = () => {
    const [activities, setActivities] = useState<Activity[]>(loadActivitiesFromStorage);

    useEffect(() => {
        localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
    }, [activities]);

    const sortedActivities = useMemo(
        () => [...activities].sort(sortPinnedThenLatest),
        [activities]
    );

    const featuredActivities = useMemo(
        () => sortedActivities.slice(0, 3),
        [sortedActivities]
    );

    const addActivity = (newActivity: CreateActivityInput) => {
        const nextActivity: Activity = {
            id: `activity_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            title: newActivity.title.trim(),
            dateMonth: newActivity.dateMonth.trim(),
            dateDay: newActivity.dateDay.trim(),
            location: newActivity.location.trim(),
            formatTag: newActivity.formatTag.trim(),
            url: getSafeActivityUrl(newActivity.url),
            isPinned: false,
            createdAt: Date.now()
        };

        setActivities(prev => [nextActivity, ...prev]);
    };

    const updateActivity = (
        id: string,
        updates: Partial<Omit<Activity, 'id' | 'isPinned' | 'createdAt'>>
    ) => {
        setActivities(prev => prev.map(activity => (
            activity.id === id ? { ...activity, ...updates } : activity
        )));
    };

    const togglePinned = (id: string) => {
        setActivities(prev => prev.map(activity => (
            activity.id === id ? { ...activity, isPinned: !activity.isPinned } : activity
        )));
    };

    const removeActivity = (id: string) => {
        setActivities(prev => prev.filter(activity => activity.id !== id));
    };

    return {
        activities,
        sortedActivities,
        featuredActivities,
        addActivity,
        updateActivity,
        togglePinned,
        removeActivity
    };
};

