import React, { useState } from 'react';
import { MapPin, ExternalLink, Tag } from 'lucide-react';

type Course = {
    id: string;
    title: string;
    imageUrl: string;
    summary: string;
    keywords: string[];
    link: string;
};

const courses: Course[] = [
    {
        id: 'c36448',
        title: '软硬协同技术实践分享课',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop',
        summary: '面向硬件工程师与 AI 融合从业者，聚焦飞桨在硬件性能优化、边缘端部署与软硬协同开发的实战案例，覆盖方案设计、原型验证到落地适配全流程。',
        keywords: ['软硬协同', '硬件优化', '边缘部署', '协同开发', '案例'],
        link: 'https://aistudio.baidu.com/course/introduce/36448'
    },
    {
        id: 'c29272',
        title: '瑞芯微RK3588、RK3568等AI硬件NPU部署，直达产业落地',
        imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop',
        summary: '面向瑞芯微 RK3588/RK3568 等 AI 硬件的 NPU 部署路径，结合产业落地实践，讲解从开发到部署的关键环节与最佳实践。',
        keywords: ['瑞芯微', 'RK3588', 'RK3568', 'NPU', '产业落地'],
        link: 'https://aistudio.baidu.com/course/introduce/29272'
    },
    {
        id: 'c29213',
        title: 'Arm虚拟硬件平台的飞桨模型部署实战',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop',
        summary: '详解飞桨模型在 Arm 虚拟硬件上的部署全流程，以 PP-OCR/PP-Picodet 为示例，涵盖训练调优、Cortex‑M55 前后处理适配与 TVM 编译。',
        keywords: ['Arm', '虚拟硬件', 'PP-OCR', 'PP-Picodet', 'TVM', 'Cortex-M55'],
        link: 'https://aistudio.baidu.com/course/introduce/29213'
    }
];

const events = [
    { id: 1, date: '12月 10日', title: 'WAVE SUMMIT 2025 深度学习开发者大会', location: '北京 · 线上同步', type: '线下/线上' },
    { id: 2, date: '12月 22日', title: '星河杯多硬件异构计算挑战赛启动', location: '线上直播', type: '线上' }
];

export const CoursesAndEvents: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'courses' | 'events'>('courses');
    const [courseItems, setCourseItems] = useState<Course[]>(courses);
    const [syncing, setSyncing] = useState(false);
    const syncCourses = async () => {
        try {
            setSyncing(true);
            const res = await fetch('/api/aistudio/courses');
            const json = await res.json();
            if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
                setCourseItems(json.data);
            }
        } catch {
            // ignore
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="h-full glass-panel flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">星河多硬件课程与活动</h2>
                <button
                    onClick={syncCourses}
                    className="px-3 py-1.5 text-sm font-bold rounded-md transition-all bg-white border border-gray-200 hover:border-blue-300 hover:text-[var(--color-tech-blue)] disabled:opacity-60"
                    disabled={syncing}
                >
                    {syncing ? '同步中…' : '同步课程'}
                </button>
            </div>

            <div className="flex gap-1 p-1 bg-gray-100/80 rounded-lg mb-6 self-start">
                <button
                    onClick={() => setActiveTab('courses')}
                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === 'courses' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    相关课程
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === 'events' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    生态活动
                </button>
            </div>

            <div className="flex-1 relative overflow-hidden min-h-[700px]">
                {/* Courses Tab */}
                <div className={`absolute inset-0 transition-all duration-300 w-full ${activeTab === 'courses' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
                    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1">
                        {courseItems.map(course => {
                            return (
                                <a
                                    key={course.id}
                                    href={course.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="snap-start shrink-0 w-[320px] group relative overflow-hidden rounded-xl border border-gray-200/60 bg-white hover:border-blue-200 hover:shadow-sm transition-all"
                                >
                                    <div className="w-full h-36 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent z-10 transition-opacity group-hover:opacity-40" />
                                        <img
                                            src={course.imageUrl}
                                            alt={course.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop';
                                            }}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-gray-900 group-hover:text-[var(--color-tech-blue)] transition-colors">
                                            {course.title}
                                        </h4>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                            {course.summary}
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {course.keywords.map((kw) => (
                                                <span key={kw} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200 text-[11px]">
                                                    <Tag className="w-3 h-3" /> {kw}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="mt-3 text-[var(--color-tech-blue)] text-xs font-semibold flex items-center gap-1">
                                            去学习 <ExternalLink className="w-3 h-3" />
                                        </div>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </div>

                {/* Events Tab */}
                <div className={`absolute inset-0 transition-all duration-300 w-full ${activeTab === 'events' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-full pointer-events-none'}`}>
                    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1">
                        {events.map(event => (
                            <div key={event.id} className="snap-start shrink-0 w-[420px] group flex gap-4 rounded-xl border border-gray-200/60 bg-gray-50/50 p-4 hover:shadow-sm hover:border-blue-200 transition-all">
                                <div className="flex flex-col items-center justify-center shrink-0 w-14 h-14 rounded-lg bg-blue-50 text-[var(--color-tech-blue)] border border-blue-100">
                                    <span className="text-xs font-bold uppercase">{event.date.split(' ')[0]}</span>
                                    <span className="text-lg font-black leading-tight">{event.date.split(' ')[1]}</span>
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <h4 className="font-bold text-gray-900 text-sm mb-1">{event.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-gray-200/50">{event.type}</span>
                                    </div>
                                </div>
                                <button className="self-center p-2 rounded-full hover:bg-[var(--color-tech-blue-light)] text-gray-400 hover:text-[var(--color-tech-blue)] transition-colors" aria-label="打开活动链接">
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
