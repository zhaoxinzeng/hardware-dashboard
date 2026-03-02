export type CourseDifficulty = '入门' | '进阶' | '高阶';

export interface Course {
    id: string;
    title: string;
    description?: string;
    url: string;
    duration: string;
    difficulty: CourseDifficulty;
    isPinned: boolean;
    createdAt: number;
}

export interface CreateCourseInput {
    title: string;
    description?: string;
    url: string;
    duration: string;
    difficulty: CourseDifficulty;
}
