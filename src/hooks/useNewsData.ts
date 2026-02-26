import { useState, useEffect } from 'react';
import type { NewsItem } from '../types/news';

const LOCAL_STORAGE_KEY = 'dashboard_news_data';

const initialMockNews: NewsItem[] = [
    {
        id: '1',
        date: 'Oct 24, 2025',
        title: 'NVIDIA H200 适配最新进展与性能基准发布',
        imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop',
        summary: 'NVIDIA 最新一代 H200 GPU 在多项大模型推理基准测试中展现出卓越性能，现已全面开放生态适配网络。'
    },
    {
        id: '2',
        date: 'Nov 02, 2025',
        title: '昇腾 910B 算力集群全面支持文心大模型 4.0',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
        summary: '基于昇腾 AI 基础软硬件平台，文心一言 4.0 完成深度适配，推理效率与稳定性达到业界领先水平。'
    },
    {
        id: '3',
        date: 'Nov 15, 2025',
        title: '昆仑芯二代联合飞桨实现超大规模分布式训练',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop',
        summary: '昆仑芯科技宣布其第二代云端通用 AI 计算处理器与飞桨框架深度融合，突破万卡集群分布式训练瓶颈。'
    }
];

export const useNewsData = () => {
    const [news, setNews] = useState<NewsItem[]>([]);

    // Initialize data from localStorage or use mock initial data
    useEffect(() => {
        const storedNews = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedNews) {
            try {
                setNews(JSON.parse(storedNews));
            } catch (error) {
                console.error("Failed to parse news from localStorage", error);
                setNews(initialMockNews);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialMockNews));
            }
        } else {
            setNews(initialMockNews);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialMockNews));
        }
    }, []);

    const addNews = (newItem: Omit<NewsItem, 'id'>) => {
        const newEntry: NewsItem = {
            ...newItem,
            id: crypto.randomUUID(),
        };

        // Add to top of the list
        const updatedNews = [newEntry, ...news];
        setNews(updatedNews);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedNews));
    };

    return { news, addNews };
};
