import { useState, useEffect } from 'react';
import type { NewsItem } from '../types/news';

const MANUAL_STORAGE_KEY = 'manual_ecosystem_news';

export const useNewsData = () => {
    const [news, setNews] = useState<NewsItem[]>([]);

    useEffect(() => {
        const fetchAndMergeNews = async () => {
            let autoNews: NewsItem[] = [];
            try {
                const response = await fetch('/auto-news.json');
                if (response.ok) {
                    autoNews = await response.json();
                }
            } catch (error) {
                console.error("Failed to fetch auto-news", error);
            }

            let manualNews: NewsItem[] = [];
            const storedManualNews = localStorage.getItem(MANUAL_STORAGE_KEY);
            if (storedManualNews) {
                try {
                    manualNews = JSON.parse(storedManualNews);
                } catch (error) {
                    console.error("Failed to parse manual news from localStorage", error);
                }
            }

            const combinedNews = [...manualNews, ...autoNews];

            // Sort by date descending
            combinedNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setNews(combinedNews);
        };

        fetchAndMergeNews();
    }, []);

    const addNews = (newItem: Omit<NewsItem, 'id'>) => {
        const newEntry: NewsItem = {
            ...newItem,
            id: crypto.randomUUID(),
            isManual: true // Force flag for manual entries
        };

        // Retrieve existing manual news
        let manualNews: NewsItem[] = [];
        const storedManualNews = localStorage.getItem(MANUAL_STORAGE_KEY);
        if (storedManualNews) {
            try {
                manualNews = JSON.parse(storedManualNews);
            } catch {
                // ignore
            }
        }

        // Add to manual storage
        const updatedManualNews = [newEntry, ...manualNews];
        localStorage.setItem(MANUAL_STORAGE_KEY, JSON.stringify(updatedManualNews));

        // Update current state (adding to top of current view)
        setNews(prev => {
            const updated = [newEntry, ...prev];
            updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return updated;
        });
    };

    return { news, addNews };
};
