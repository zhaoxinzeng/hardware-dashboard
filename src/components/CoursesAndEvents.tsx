import React, { useState } from 'react';
import { PlayCircle, Calendar, MapPin, ExternalLink } from 'lucide-react';

const courses = [
    { id: 1, type: '入门', title: '飞桨多硬件生态基础认知', duration: '2.5h' },
    { id: 2, type: '进阶', title: '昇腾 910B 算力底座深度调优', duration: '4h' },
    { id: 3, type: '高阶', title: '跨架构极速分布式训练实战', duration: '6h' }
];

const events = [
    { id: 1, date: '12月 10日', title: 'WAVE SUMMIT 2025 深度学习开发者大会', location: '北京 · 线上同步', type: '线下/线上' },
    { id: 2, date: '12月 22日', title: '星河杯多硬件异构计算挑战赛启动', location: '线上直播', type: '线上' }
];

export const CoursesAndEvents: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'courses' | 'events'>('courses');

    return (
        <div className="h-full glass-panel flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">星河多硬件课程与活动</h2>
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

            <div className="flex-1 relative overflow-hidden">
                {/* Courses Tab */}
                <div className={`absolute inset-0 transition-all duration-300 w-full ${activeTab === 'courses' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
                    <div className="space-y-4">
                        {courses.map(course => (
                            <div key={course.id} className="group relative overflow-hidden rounded-xl border border-gray-200/60 bg-gray-50/50 p-4 hover:shadow-sm hover:border-blue-200 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${course.type === '入门' ? 'bg-green-100 text-green-700' : course.type === '进阶' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                        {course.type}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1"><PlayCircle className="w-3 h-3" /> {course.duration}</span>
                                </div>
                                <h4 className="font-bold text-gray-900 group-hover:text-[var(--color-tech-blue)] transition-colors pr-20">{course.title}</h4>
                                <button className="absolute bottom-4 right-4 text-sm font-bold text-[var(--color-tech-blue)] flex items-center gap-1 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                    开始学习 <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Events Tab */}
                <div className={`absolute inset-0 transition-all duration-300 w-full ${activeTab === 'events' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-full pointer-events-none'}`}>
                    <div className="space-y-4">
                        {events.map(event => (
                            <div key={event.id} className="group flex gap-4 rounded-xl border border-gray-200/60 bg-gray-50/50 p-4 hover:shadow-sm hover:border-blue-200 transition-all">
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
                                <button className="self-center p-2 rounded-full hover:bg-[var(--color-tech-blue-light)] text-gray-400 hover:text-[var(--color-tech-blue)] transition-colors">
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

// Re-importing ArrowRight locally inside the file to avoid missing deps if needed, though usually standard practice to bubble to top
import { ArrowRight } from 'lucide-react';
