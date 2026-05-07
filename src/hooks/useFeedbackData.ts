import { useEffect, useMemo, useState } from 'react';
import type { CreateFeedbackInput, FeedbackItem, FeedbackType } from '../types/feedback';

const FEEDBACK_STORAGE_KEY = 'xinghe_feedback_data';
const DEPRECATED_FEEDBACK_IDS = new Set([
    'f1',
    'f2',
    'f3'
]);

const DEFAULT_FEEDBACKS: FeedbackItem[] = [];

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
    if (saved !== null) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                return parsed
                    .map(sanitizeFeedback)
                    .filter((item): item is FeedbackItem => item !== null)
                    .filter((item) => !DEPRECATED_FEEDBACK_IDS.has(item.id));
            }
        } catch (error) {
            console.error('Failed to parse feedback data', error);
        }
    }

    return DEFAULT_FEEDBACKS
        .map(sanitizeFeedback)
        .filter((item): item is FeedbackItem => item !== null);
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
