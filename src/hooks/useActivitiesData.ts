import { useEffect, useMemo, useState } from 'react';
import type { Activity, CreateActivityInput } from '../types/activity';
import { getSafeActivityUrl } from '../utils/activityUrl';

const ACTIVITY_STORAGE_KEY = 'xinghe_activities_data';
const DEPRECATED_ACTIVITY_IDS = new Set([
    'a1',
    'a2',
    'a3'
]);

const DEFAULT_ACTIVITIES: Activity[] = [];

const sortPinnedThenLatest = (a: Activity, b: Activity) => {
    if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
    }

    return b.createdAt - a.createdAt;
};

const loadActivitiesFromStorage = (): Activity[] => {
    const normalizeActivity = (activity: Activity): Activity => ({
        ...activity,
        url: getSafeActivityUrl(typeof activity.url === 'string' ? activity.url : '', activity.id)
    });

    const saved = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (saved !== null) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                return parsed
                    .map(normalizeActivity)
                    .filter((activity) => !DEPRECATED_ACTIVITY_IDS.has(activity.id));
            }
        } catch (error) {
            console.error('Failed to parse activities data', error);
        }
    }

    return DEFAULT_ACTIVITIES.map(normalizeActivity);
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
