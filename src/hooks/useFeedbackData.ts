import { useEffect, useMemo, useState } from 'react';
import type { CreateFeedbackInput, FeedbackItem, FeedbackType } from '../types/feedback';

const FEEDBACK_STORAGE_KEY = 'xinghe_feedback_data';

const DEFAULT_FEEDBACKS: FeedbackItem[] = [
    {
        id: 'f1',
        model: '文心一言 4.0',
        hardware: 'NVIDIA GPU',
        type: 'ISSUE',
        description: '在燧原平台运行推理服务时，长文本截断会导致 OOM，希望增加可调截断参数。',
        createdAt: Date.now() - 1000 * 60 * 10
    },
    {
        id: 'f2',
        model: '飞桨 PaddlePaddle',
        hardware: '昇腾 NPU',
        type: 'IDEA',
        description: '建议在算力规划工具中加入多卡并行效率预测，方便做集群预算。',
        createdAt: Date.now() - 1000 * 60 * 60
    },
    {
        id: 'f3',
        model: '千帆大模型平台',
        hardware: '昆仑芯',
        type: 'KUDOS',
        description: '最近版本的推理稳定性有明显提升，冷启动速度表现很好。',
        createdAt: Date.now() - 1000 * 60 * 60 * 3
    }
];

const FEEDBACK_TYPES: FeedbackType[] = ['ISSUE', 'IDEA', 'KUDOS'];

const sanitizeFeedback = (raw: unknown): FeedbackItem | null => {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const item = raw as Partial<FeedbackItem>;
    if (
        typeof item.id !== 'string' ||
        typeof item.model !== 'string' ||
        typeof item.hardware !== 'string' ||
        typeof item.description !== 'string' ||
        typeof item.createdAt !== 'number'
    ) {
        return null;
    }

    const type = FEEDBACK_TYPES.includes(item.type as FeedbackType)
        ? (item.type as FeedbackType)
        : 'ISSUE';

    return {
        id: item.id,
        model: item.model,
        hardware: item.hardware,
        type,
        description: item.description,
        createdAt: item.createdAt
    };
};

const loadFeedbacksFromStorage = (): FeedbackItem[] => {
    const saved = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const items = parsed
                    .map(sanitizeFeedback)
                    .filter((item): item is FeedbackItem => item !== null);

                if (items.length > 0) {
                    return items;
                }
            }
        } catch (error) {
            console.error('Failed to parse feedback data', error);
        }
    }

    return DEFAULT_FEEDBACKS;
};

export const useFeedbackData = () => {
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(loadFeedbacksFromStorage);

    useEffect(() => {
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbacks));
    }, [feedbacks]);

    const sortedFeedbacks = useMemo(
        () => [...feedbacks].sort((a, b) => b.createdAt - a.createdAt),
        [feedbacks]
    );

    const latestThreeFeedbacks = useMemo(
        () => sortedFeedbacks.slice(0, 3),
        [sortedFeedbacks]
    );

    const addFeedback = (newFeedback: CreateFeedbackInput) => {
        const nextFeedback: FeedbackItem = {
            id: `feedback_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            model: newFeedback.model.trim(),
            hardware: newFeedback.hardware.trim(),
            type: newFeedback.type,
            description: newFeedback.description.trim(),
            createdAt: Date.now()
        };

        setFeedbacks(prev => [nextFeedback, ...prev]);
    };

    const updateFeedback = (
        id: string,
        updates: Partial<Omit<FeedbackItem, 'id' | 'createdAt'>>
    ) => {
        setFeedbacks(prev => prev.map(item => (
            item.id === id ? { ...item, ...updates } : item
        )));
    };

    const removeFeedback = (id: string) => {
        setFeedbacks(prev => prev.filter(item => item.id !== id));
    };

    return {
        feedbacks,
        sortedFeedbacks,
        latestThreeFeedbacks,
        addFeedback,
        updateFeedback,
        removeFeedback
    };
};

