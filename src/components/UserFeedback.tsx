import React, { useState } from 'react';
import { MessageSquare, Send, ThumbsUp, AlertCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useFeedbackData } from '../hooks/useFeedbackData';
import type { FeedbackType } from '../types/feedback';

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

export const UserFeedback: React.FC = () => {
    const { feedbacks, latestThreeFeedbacks, addFeedback } = useFeedbackData();

    const [model, setModel] = useState('');
    const [hardware, setHardware] = useState('');
    const [type, setType] = useState<FeedbackType>('ISSUE');
    const [description, setDescription] = useState('');

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalizedModel = model.trim();
        const normalizedHardware = hardware.trim();
        const normalizedDescription = description.trim();

        if (!normalizedModel) {
            toast.error('请填写目标模型 / 框架');
            return;
        }

        if (!normalizedHardware) {
            toast.error('请填写运行硬件');
            return;
        }

        if (!normalizedDescription) {
            toast.error('请先填写反馈描述');
            return;
        }

        addFeedback({
            model: normalizedModel,
            hardware: normalizedHardware,
            type,
            description: normalizedDescription
        });

        setModel('');
        setHardware('');
        setDescription('');
        setType('ISSUE');
        toast.success('反馈已提交');
    };

    return (
        <div className="w-full glass-panel overflow-hidden">
            <div className="p-6 border-b border-border-subtle/50 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight">用户反馈与追踪</h2>
                <Link
                    to="/feedback"
                    className="text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center px-3 py-1.5 rounded-full transition-colors border border-gray-200/50"
                >
                    全部反馈 ({feedbacks.length}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-subtle/50">
                <div className="p-6 bg-gray-50/30">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">目标模型 / 框架</label>
                                <input
                                    type="text"
                                    value={model}
                                    onChange={event => setModel(event.target.value)}
                                    placeholder="例如：文心一言 4.0 / 飞桨"
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-tech-blue)] focus:ring-1 focus:ring-[var(--color-tech-blue)] transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">运行硬件</label>
                                <input
                                    type="text"
                                    value={hardware}
                                    onChange={event => setHardware(event.target.value)}
                                    placeholder="例如：NVIDIA H200 / 昇腾 910B"
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-tech-blue)] focus:ring-1 focus:ring-[var(--color-tech-blue)] transition-all"
                                />
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

                        <button type="submit" className="w-full bg-[#1A1A1A] hover:bg-black text-white rounded-lg py-2.5 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                            <Send className="w-4 h-4" /> 提交反馈
                        </button>
                    </form>
                </div>

                <div className="p-6 bg-white overflow-y-auto max-h-[420px]">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Recent Signals
                    </h3>

                    {latestThreeFeedbacks.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/40 py-10 text-center text-sm text-gray-400 font-medium">
                            暂无反馈记录
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {latestThreeFeedbacks.map(item => {
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
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
