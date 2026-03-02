import React, { useEffect, useState } from 'react';
import { ArrowLeft, MessageSquare, Send, ThumbsUp, AlertCircle, Lightbulb, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useFeedbackData } from '../hooks/useFeedbackData';
import type { FeedbackItem, FeedbackType } from '../types/feedback';

const MODEL_OPTIONS = ['文心一言 4.0', '飞桨 PaddlePaddle', '千帆大模型平台', '通义千问', '其他'];
const HARDWARE_OPTIONS = ['NVIDIA GPU', '昇腾 NPU', '昆仑芯', '燧原', '海光 DCU', '其他'];

const FEEDBACK_TYPE_META: Record<FeedbackType, {
    label: string;
    dotClassName: string;
    badgeClassName: string;
}> = {
    ISSUE: {
        label: 'Issue',
        dotClassName: 'bg-red-400',
        badgeClassName: 'bg-red-100 text-red-700'
    },
    IDEA: {
        label: 'Idea',
        dotClassName: 'bg-amber-400',
        badgeClassName: 'bg-amber-100 text-amber-700'
    },
    KUDOS: {
        label: 'Kudos',
        dotClassName: 'bg-emerald-400',
        badgeClassName: 'bg-emerald-100 text-emerald-700'
    }
};

const formatRelativeTime = (timestamp: number) => {
    const delta = Date.now() - timestamp;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (delta < minute) {
        return '刚刚';
    }

    if (delta < hour) {
        return `${Math.max(1, Math.floor(delta / minute))} 分钟前`;
    }

    if (delta < day) {
        return `${Math.floor(delta / hour)} 小时前`;
    }

    return `${Math.floor(delta / day)} 天前`;
};

const FeedbackTypeIcon: React.FC<{ type: FeedbackType }> = ({ type }) => {
    if (type === 'ISSUE') {
        return <AlertCircle className="w-3 h-3 inline mr-1 -mt-0.5" />;
    }

    if (type === 'IDEA') {
        return <Lightbulb className="w-3 h-3 inline mr-1 -mt-0.5" />;
    }

    return <ThumbsUp className="w-3 h-3 inline mr-1 -mt-0.5" />;
};

export const AllFeedback: React.FC = () => {
    const { sortedFeedbacks, addFeedback, updateFeedback, removeFeedback } = useFeedbackData();

    const [editingItem, setEditingItem] = useState<FeedbackItem | null>(null);
    const [model, setModel] = useState(MODEL_OPTIONS[0]);
    const [hardware, setHardware] = useState(HARDWARE_OPTIONS[0]);
    const [type, setType] = useState<FeedbackType>('ISSUE');
    const [description, setDescription] = useState('');

    const resetForm = () => {
        setModel(MODEL_OPTIONS[0]);
        setHardware(HARDWARE_OPTIONS[0]);
        setType('ISSUE');
        setDescription('');
        setEditingItem(null);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!description.trim()) {
            toast.error('请先填写反馈描述');
            return;
        }

        if (editingItem) {
            updateFeedback(editingItem.id, {
                model,
                hardware,
                type,
                description: description.trim()
            });
            toast.success('反馈已更新');
        } else {
            addFeedback({
                model,
                hardware,
                type,
                description: description.trim()
            });
            toast.success('反馈已提交');
        }

        resetForm();
    };

    const handleStartEdit = (item: FeedbackItem) => {
        setEditingItem(item);
        setModel(item.model);
        setHardware(item.hardware);
        setType(item.type);
        setDescription(item.description);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('确定要删除这条反馈吗？')) {
            removeFeedback(id);
            if (editingItem?.id === id) {
                resetForm();
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
                    <h1 className="text-lg font-bold tracking-tight text-gray-900">全部用户反馈与追踪</h1>
                </div>
            </header>

            <main className="max-w-[1440px] mx-auto p-4 md:p-8 animate-in fade-in duration-500">
                <div className="w-full glass-panel overflow-hidden">
                    <div className="p-6 border-b border-border-subtle/50">
                        <p className="text-sm text-gray-500 font-medium">共 {sortedFeedbacks.length} 条反馈记录，按最新时间排序。</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-subtle/50">
                        <div className="p-6 bg-gray-50/30">
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <h2 className="text-sm font-bold text-gray-900">{editingItem ? '编辑反馈' : '新增反馈'}</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">目标模型 / 框架</label>
                                        <select
                                            value={model}
                                            onChange={event => setModel(event.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-tech-blue)] focus:ring-1 focus:ring-[var(--color-tech-blue)] transition-all"
                                        >
                                            {MODEL_OPTIONS.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">运行硬件</label>
                                        <select
                                            value={hardware}
                                            onChange={event => setHardware(event.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-tech-blue)] focus:ring-1 focus:ring-[var(--color-tech-blue)] transition-all"
                                        >
                                            {HARDWARE_OPTIONS.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">反馈类型</label>
                                    <div className="flex gap-2">
                                        {(['ISSUE', 'IDEA', 'KUDOS'] as FeedbackType[]).map(option => {
                                            const isActive = type === option;
                                            return (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => setType(option)}
                                                    className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-colors ${isActive
                                                        ? 'bg-white text-[var(--color-tech-blue)] border-blue-200'
                                                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {FEEDBACK_TYPE_META[option].label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">详细描述</label>
                                    <textarea
                                        rows={4}
                                        value={description}
                                        onChange={event => setDescription(event.target.value)}
                                        placeholder="请详细描述您遇到的问题、改进建议或成功经验..."
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-tech-blue)] focus:ring-1 focus:ring-[var(--color-tech-blue)] transition-all resize-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                    {editingItem && (
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-4 py-2 rounded-lg text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                        >
                                            取消
                                        </button>
                                    )}
                                    <button type="submit" className="bg-[#1A1A1A] hover:bg-black text-white rounded-lg py-2.5 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                                        <Send className="w-4 h-4" /> {editingItem ? '保存修改' : '提交反馈'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 bg-white overflow-y-auto max-h-[620px]">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Feedback Timeline
                            </h3>

                            {sortedFeedbacks.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/40 py-10 text-center text-sm text-gray-400 font-medium">
                                    暂无反馈记录
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {sortedFeedbacks.map(item => {
                                        const meta = FEEDBACK_TYPE_META[item.type];
                                        return (
                                            <div key={item.id} className="group relative pl-4 pb-4 border-l-2 border-gray-100 last:pb-0">
                                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white ${meta.dotClassName}`} />

                                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 group-hover:border-gray-200 transition-colors">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${meta.badgeClassName}`}>
                                                            <FeedbackTypeIcon type={item.type} />
                                                            {meta.label}
                                                        </span>
                                                        <span className="text-xs text-gray-500 font-medium">{item.model} · {item.hardware}</span>
                                                        <span className="text-xs text-gray-400 ml-auto">{formatRelativeTime(item.createdAt)}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        {item.description}
                                                    </p>

                                                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleStartEdit(item)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-bold text-gray-600 bg-gray-100 border border-gray-200 hover:bg-blue-50 hover:text-[var(--color-tech-blue)] hover:border-blue-200 transition-colors"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" /> 编辑
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> 删除
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
