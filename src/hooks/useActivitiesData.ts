import { useEffect, useMemo, useState } from 'react';
import type { Activity, CreateActivityInput } from '../types/activity';
import { getSafeActivityUrl } from '../utils/activityUrl';

const ACTIVITY_STORAGE_KEY = 'xinghe_activities_data';
const DELETED_DEFAULT_ACTIVITY_IDS_KEY = 'xinghe_deleted_default_activity_ids';
const DEPRECATED_ACTIVITY_IDS = new Set([
    'a1',
    'a2',
    'a3'
]);

const DEFAULT_ACTIVITIES: Activity[] = [
    {
        id: 'activity_deepin_paddle_meetup_chengdu_20260418',
        title: 'deepin x 百度飞桨（PaddlePaddle）Meetup 成都站',
        dateMonth: '04月',
        dateDay: '18日',
        location: '成都市锦江区 · 成都IFS二号办公楼43楼 水调歌头会议室',
        formatTag: '线下',
        url: 'https://mp.weixin.qq.com/s/vXsjyekPmhXlpf3wonNmVg',
        isPinned: true,
        createdAt: new Date('2026-04-18T14:00:00+08:00').getTime()
    },
    {
        id: 'activity_phytium_openkylin_meetup_changsha_20260517',
        title: '文心合作伙伴赛道 × 飞腾 & openKylin Meetup 长沙站',
        dateMonth: '05月',
        dateDay: '17日',
        location: '湖南省长沙市开福区芙蓉中路一段303号CFC富兴时代T3栋28楼',
        formatTag: '线下',
        url: 'https://mp.weixin.qq.com/s/M4UcS5gXbC2JcxASIlLEWw',
        isPinned: true,
        createdAt: new Date('2026-05-17T13:30:00+08:00').getTime()
    }
];

const DEFAULT_ACTIVITY_IDS = new Set(DEFAULT_ACTIVITIES.map((activity) => activity.id));
const DEFAULT_ACTIVITY_BY_ID = new Map(DEFAULT_ACTIVITIES.map((activity) => [activity.id, activity]));

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

    const readDeletedDefaultActivityIds = (): Set<string> => {
        try {
            const parsed = JSON.parse(localStorage.getItem(DELETED_DEFAULT_ACTIVITY_IDS_KEY) || '[]');
            return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []);
        } catch (error) {
            console.error('Failed to parse deleted default activity ids', error);
            return new Set();
        }
    };

    const saved = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (saved !== null) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                const deletedDefaultIds = readDeletedDefaultActivityIds();
                const savedActivities = parsed
                    .map(normalizeActivity)
                    .filter((activity) => !DEPRECATED_ACTIVITY_IDS.has(activity.id))
                    .filter((activity) => !(DEFAULT_ACTIVITY_IDS.has(activity.id) && deletedDefaultIds.has(activity.id)))
                    .map((activity) => {
                        const defaultActivity = DEFAULT_ACTIVITY_BY_ID.get(activity.id);
                        return defaultActivity ? normalizeActivity({ ...activity, ...defaultActivity }) : activity;
                    });
                const savedIds = new Set(savedActivities.map((activity) => activity.id));
                const missingDefaultActivities = DEFAULT_ACTIVITIES
                    .filter((activity) => !savedIds.has(activity.id) && !deletedDefaultIds.has(activity.id))
                    .map(normalizeActivity);

                return [...missingDefaultActivities, ...savedActivities];
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
        if (DEFAULT_ACTIVITY_IDS.has(id)) {
            try {
                const parsed = JSON.parse(localStorage.getItem(DELETED_DEFAULT_ACTIVITY_IDS_KEY) || '[]');
                const deletedIds = new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []);
                deletedIds.add(id);
                localStorage.setItem(DELETED_DEFAULT_ACTIVITY_IDS_KEY, JSON.stringify([...deletedIds]));
            } catch (error) {
                console.error('Failed to save deleted default activity id', error);
            }
        }

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
