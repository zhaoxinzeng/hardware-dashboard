import React from 'react';
import { ArrowRight } from 'lucide-react';

interface NewsItem {
    id: string;
    date: string;
    title: string;
    imageUrl: string;
}

const newsData: NewsItem[] = [
    {
        id: '1',
        date: 'Oct 24, 2025',
        title: 'NVIDIA H200 适配最新进展与性能基准发布',
        imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: '2',
        date: 'Nov 02, 2025',
        title: '昇腾 910B 算力集群全面支持文心大模型 4.0',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: '3',
        date: 'Nov 15, 2025',
        title: '昆仑芯二代联合飞桨实现超大规模分布式训练',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop'
    }
];

export const PartnerNews: React.FC = () => {
    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">硬件伙伴新闻</h2>
                <button className="text-[var(--color-tech-blue)] text-sm font-medium hover:underline flex items-center gap-1 transition-all">
                    查看全部
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsData.map((news) => (
                    <div key={news.id} className="glass-panel group cursor-pointer overflow-hidden flex flex-col items-start text-left p-0 bg-white">
                        <div className="w-full h-48 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 transition-opacity group-hover:opacity-0" />
                            <img
                                src={news.imageUrl}
                                alt={news.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        <div className="p-5 flex flex-col flex-1 w-full relative">
                            <span className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">{news.date}</span>
                            <h3 className="text-lg font-bold text-[var(--color-text-primary)] leading-tight mb-4 group-hover:text-[var(--color-tech-blue)] transition-colors line-clamp-2">
                                {news.title}
                            </h3>

                            <div className="mt-auto flex items-center text-sm font-semibold text-[var(--color-text-secondary)] group-hover:text-[var(--color-tech-blue)] transition-colors">
                                Read More
                                <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
