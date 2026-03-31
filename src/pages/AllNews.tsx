import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trash2, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNewsData } from '../hooks/useNewsData';
import { useAuth } from '../contexts/AuthContext';
import { AddNewsDialog } from '../components/AddNewsDialog';
import type { NewsItem } from '../types/news';

export const AllNews: React.FC = () => {
    const { news, addNews, updateNews, removeNews } = useNewsData();
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';
    const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

    const handleDelete = (e: React.MouseEvent, id: string, isManual?: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm("确定要删除这条新闻吗？")) {
            removeNews(id, isManual);
            if (editingNews?.id === id) {
                setEditingNews(null);
            }
        }
    };

    const handleEdit = (e: React.MouseEvent, item: NewsItem) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingNews(item);
    };

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] font-sans text-[var(--color-text-primary)]">

            {/* Sub-page Header */}
            <header className="sticky top-0 z-50 glass-panel border-b border-border-subtle/50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <h1 className="text-lg font-bold tracking-tight text-gray-900">
                        全部硬件生态新闻
                    </h1>
                </div>

                {isAdmin && (
                    <AddNewsDialog
                        onAddNews={addNews}
                        onUpdateNews={(id, updates) => updateNews(id, updates, editingNews?.isManual)}
                        editingItem={editingNews}
                        onCancelEdit={() => setEditingNews(null)}
                    />
                )}
            </header>

            <main className="max-w-[1440px] mx-auto p-4 md:p-8 animate-in fade-in duration-500 fade-in-out slide-in-from-bottom-4">
                <div className="mb-8">
                    <p className="text-gray-500 font-medium text-sm">共收录 {news.length} 条新闻动态，按发布时间排序。</p>
                </div>

                {news.length === 0 ? (
                    <div className="w-full py-20 flex flex-col items-center justify-center bg-white/50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">暂无新闻数据</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {news.map((item) => {
                            const CardWrapper = item.link ? 'a' : 'div';
                            const cardProps = item.link ? { href: item.link, target: "_blank", rel: "noopener noreferrer" } : {};
                            return (
                                <CardWrapper key={item.id} {...cardProps} className="relative glass-panel group cursor-pointer flex flex-col items-start text-left p-0 bg-white shadow-sm border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all duration-300">
                                {isAdmin && (
                                    <div className="absolute top-3 right-3 flex items-center gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleEdit(e, item)}
                                            className="p-1.5 bg-white/80 hover:bg-blue-500 hover:text-white text-gray-500 rounded-full transition-colors backdrop-blur-sm"
                                            title="编辑新闻"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, item.id, item.isManual)}
                                            className="p-1.5 bg-white/80 hover:bg-red-500 hover:text-white text-gray-500 rounded-full transition-colors backdrop-blur-sm"
                                            title="删除新闻"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                <div className="w-full h-40 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent z-10 transition-opacity group-hover:opacity-0" />
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop';
                                            }}
                                        />
                                    </div>
                                    <div className="p-4 flex flex-col flex-1 w-full bg-white relative">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{item.date}</span>
                                            {item.isManual && (
                                                <span className="text-[9px] font-bold text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-sm flex items-center">
                                                    🔥 重大发新
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900 leading-tight mb-2 group-hover:text-[var(--color-tech-blue)] transition-colors line-clamp-2">
                                            {item.title}
                                        </h3>
                                        {item.summary && (
                                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mt-auto">
                                                {item.summary}
                                            </p>
                                        )}
                                    </div>
                                </CardWrapper>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};
