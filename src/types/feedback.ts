export type FeedbackType = 'ISSUE' | 'IDEA' | 'KUDOS';

export interface FeedbackItem {
    id: string;
    model: string;
    hardware: string;
    type: FeedbackType;
    description: string;
    createdAt: number;
}

export interface CreateFeedbackInput {
    model: string;
    hardware: string;
    type: FeedbackType;
    description: string;
}
