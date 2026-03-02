export interface Activity {
    id: string;
    title: string;
    dateMonth: string;
    dateDay: string;
    location: string;
    formatTag: string;
    url: string;
    isPinned: boolean;
    createdAt: number;
}

export interface CreateActivityInput {
    title: string;
    dateMonth: string;
    dateDay: string;
    location: string;
    formatTag: string;
    url: string;
}
