import { CourseDifficulty, FeedbackType, NewsType, UserRole } from '@prisma/client';

export const COURSE_DIFFICULTY_TO_DB: Record<string, CourseDifficulty> = {
    入门: CourseDifficulty.BEGINNER,
    进阶: CourseDifficulty.INTERMEDIATE,
    高阶: CourseDifficulty.ADVANCED
};

export const COURSE_DIFFICULTY_FROM_DB: Record<CourseDifficulty, string> = {
    [CourseDifficulty.BEGINNER]: '入门',
    [CourseDifficulty.INTERMEDIATE]: '进阶',
    [CourseDifficulty.ADVANCED]: '高阶'
};

export const NEWS_TYPE_FROM_INPUT = (value: unknown): NewsType => {
    if (typeof value !== 'string') {
        return NewsType.MANUAL;
    }

    return value.toLowerCase() === 'auto' ? NewsType.AUTO : NewsType.MANUAL;
};

export const FEEDBACK_TYPE_FROM_INPUT = (value: unknown): FeedbackType => {
    if (value === FeedbackType.IDEA || value === FeedbackType.KUDOS || value === FeedbackType.ISSUE) {
        return value;
    }

    return FeedbackType.ISSUE;
};

export const USER_ROLE_FROM_INPUT = (value: unknown): UserRole => {
    if (value === UserRole.ADMIN || value === UserRole.USER) {
        return value;
    }

    if (typeof value === 'string' && value.toLowerCase() === 'admin') {
        return UserRole.ADMIN;
    }

    return UserRole.USER;
};
