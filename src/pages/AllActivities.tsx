import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUp, Pin, Plus, Trash2, ExternalLink, Pencil, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useActivitiesData } from '../hooks/useActivitiesData';
import { useAuth } from '../contexts/AuthContext';
import type { Activity } from '../types/activity';
import { generateInvalidActivityUrl } from '../utils/activityUrl';

const DEFAULT_FORMAT_OPTIONS = ['线下/线上', '线上', '线下'];

const createActivityDraft = () => ({
    title: '',
    dateMonth: '',
    dateDay: '',
    location: '',
    formatTag: '线下/线上',
    url: ''
});

export const AllActivities: React.FC = () => {
    const { sortedActivities, addActivity, updateActivity, togglePinned, removeActivity } = useActivitiesData();
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';

    const [isAdding, setIsAdding] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [newActivity, setNewActivity] = useState(createActivityDraft);

    const resetFormState = () => {
        setNewActivity(createActivityDraft());
        setEditingActivity(null);
    };

    const handleSubmitActivity = () => {
        const title = newActivity.title.trim();
        const dateMonth = newActivity.dateMonth.trim();
        const dateDay = newActivity.dateDay.trim();
        const location = newActivity.location.trim();
        const formatTag = newActivity.formatTag.trim();
        const url = newActivity.url.trim() === '' ? generateInvalidActivityUrl() : newActivity.url.trim();

        if (!title || !dateMonth || !dateDay || !location || !formatTag) {
            return;
        }

        if (editingActivity) {
            updateActivity(editingActivity.id, {
                title,
                dateMonth,
                dateDay,
                location,
                formatTag,
                url
            });
        } else {
            addActivity({
                title,
                dateMonth,
                dateDay,
                location,
                formatTag,
                url
            });
        }

        resetFormState();
        setIsAdding(false);
    };

    const handleStartEdit = (activity: Activity) => {
        setEditingActivity(activity);
        setNewActivity({
            title: activity.title,
            dateMonth: activity.dateMonth,
            dateDay: activity.dateDay,
            location: activity.location,
            formatTag: activity.formatTag,
            url: activity.url
        });
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        resetFormState();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('确定要删除该活动吗？')) {
            removeActivity(id);
            if (editingActivity?.id === id) {
                resetFormState();
            }
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] font-sans text-[var(--color-text-primary)]">
            <header className="sticky top-0 z-50 glass-panel border-b border-border-subtle/50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <h1 className="text-lg font-bold tracking-tight text-gray-900">全部生态活动</h1>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => {
                            if (isAdding) {
                                setIsAdding(false);
                                resetFormState();
                                return;
                            }
                            setIsAdding(true);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold border transition-colors ${isAdding
                            ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                            : 'bg-blue-50 text-[var(--color-tech-blue)] border-blue-100 hover:bg-blue-100'
                            }`}
                    >
                        <Plus className="w-4 h-4" />
                        {isAdding ? '取消新增' : '新增活动'}
                    </button>
                )}
            </header>

            <main className="max-w-[1440px] mx-auto p-4 md:p-8 animate-in fade-in duration-500">
                <p className="text-gray-500 font-medium text-sm mb-6">
                    共 {sortedActivities.length} 场活动，排序规则：置顶优先，其次按最新创建时间。
                </p>

                {isAdmin && isAdding && (
                    <section className="mb-6 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/90 to-white p-4 md:p-5">
                        <h2 className="text-sm font-bold text-gray-900 mb-4">{editingActivity ? '修改活动' : '新增活动'}</h2>
                        <p className="text-xs text-gray-500 mb-4">
                            {editingActivity
                                ? '当前为编辑模式：保存后将原地更新该活动，不会改变置顶状态和创建时间。'
                                : '活动链接可暂时留空，保存时系统会自动生成占位无效链接，后续可再替换真实链接。'}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                                type="text"
                                placeholder="活动标题"
                                className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                value={newActivity.title}
                                onChange={e => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                            />
                            <input
                                type="text"
                                placeholder="月份 (如 12月)"
                                className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                value={newActivity.dateMonth}
                                onChange={e => setNewActivity(prev => ({ ...prev, dateMonth: e.target.value }))}
                            />
                            <input
                                type="text"
                                placeholder="日期 (如 10日)"
                                className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                value={newActivity.dateDay}
                                onChange={e => setNewActivity(prev => ({ ...prev, dateDay: e.target.value }))}
                            />
                            <input
                                type="text"
                                placeholder="活动地点 (如 北京 · 线上同步)"
                                className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                value={newActivity.location}
                                onChange={e => setNewActivity(prev => ({ ...prev, location: e.target.value }))}
                            />
                            <select
                                className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                value={newActivity.formatTag}
                                onChange={e => setNewActivity(prev => ({ ...prev, formatTag: e.target.value }))}
                            >
                                {DEFAULT_FORMAT_OPTIONS.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="活动链接 (如 https://...)"
                                className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                value={newActivity.url}
                                onChange={e => setNewActivity(prev => ({ ...prev, url: e.target.value }))}
                            />
                        </div>

                        <div className="mt-4 flex justify-end">
                            {editingActivity && (
                                <button
                                    onClick={handleCancelEdit}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors mr-2"
                                >
                                    取消
                                </button>
                            )}
                            <button
                                onClick={handleSubmitActivity}
                                disabled={!newActivity.title.trim() || !newActivity.dateMonth.trim() || !newActivity.dateDay.trim() || !newActivity.location.trim()}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white"
                            >
                                {editingActivity ? '保存修改' : '保存活动'}
                            </button>
                        </div>
                    </section>
                )}

                {sortedActivities.length === 0 ? (
                    <div className="w-full py-20 flex flex-col items-center justify-center bg-white/50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">暂无活动数据</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {sortedActivities.map(activity => (
                            <article key={activity.id} className="bg-white rounded-xl border border-gray-200/70 shadow-sm p-4 flex flex-col">
                                <div className="flex gap-4 items-start">
                                    <div className="flex flex-col items-center justify-center shrink-0 w-14 h-14 rounded-lg bg-blue-50 text-[var(--color-tech-blue)] border border-blue-100">
                                        <span className="text-[10px] font-bold uppercase">{activity.dateMonth}</span>
                                        <span className="text-lg font-black leading-tight">{activity.dateDay}</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            {activity.isPinned && (
                                                <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded-sm flex items-center border border-amber-200/60">
                                                    <Pin className="w-2.5 h-2.5 mr-0.5 fill-amber-700" /> 置顶
                                                </span>
                                            )}
                                            <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-sm border border-gray-200">
                                                {activity.formatTag}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900 leading-relaxed mb-2">{activity.title}</h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span className="line-clamp-1">{activity.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                                    <button
                                        onClick={() => window.open(activity.url, '_blank', 'noopener,noreferrer')}
                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-xs font-bold text-[var(--color-tech-blue)] bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                                    >
                                        活动详情 <ExternalLink className="w-3.5 h-3.5" />
                                    </button>

                                    {isAdmin && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleStartEdit(activity)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 hover:bg-blue-50 hover:text-[var(--color-tech-blue)] hover:border-blue-200 transition-colors"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                编辑
                                            </button>

                                            <button
                                                onClick={() => togglePinned(activity.id)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold border transition-colors ${activity.isPinned
                                                    ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                                                    : 'text-gray-700 bg-gray-100 border-gray-200 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <ArrowUp className="w-3.5 h-3.5" />
                                                {activity.isPinned ? '取消置顶' : '置顶'}
                                            </button>

                                            <button
                                                onClick={() => handleDelete(activity.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                删除
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
