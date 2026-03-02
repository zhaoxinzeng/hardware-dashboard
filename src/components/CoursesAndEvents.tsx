import React, { useState, useEffect, useMemo } from 'react';
import { PlayCircle, MapPin, ExternalLink, ArrowRight, Pin, Trash2, Plus, X, Check, ChevronRight } from 'lucide-react';

export interface Course {
    id: string;
    title: string;
    url: string;
    duration: string;
    difficulty: string; // '入门' | '进阶' | '高阶'
    isPinned: boolean;
    createdAt: number;
}

const DEFAULT_COURSES: Course[] = [
    { id: 'c1', difficulty: '入门', title: '飞桨多硬件生态基础认知', duration: '2.5h', url: '#', isPinned: false, createdAt: Date.now() - 3000 },
    { id: 'c2', difficulty: '进阶', title: '昇腾 910B 算力底座深度调优', duration: '4h', url: '#', isPinned: false, createdAt: Date.now() - 2000 },
    { id: 'c3', difficulty: '高阶', title: '跨架构极速分布式训练实战', duration: '6h', url: '#', isPinned: false, createdAt: Date.now() - 1000 }
];

const events = [
    { id: 1, date: '12月 10日', title: 'WAVE SUMMIT 2025 深度学习开发者大会', location: '北京 · 线上同步', type: '线下/线上' },
    { id: 2, date: '12月 22日', title: '星河杯多硬件异构计算挑战赛启动', location: '线上直播', type: '线上' }
];

export const CoursesAndEvents: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'courses' | 'events'>('courses');

    // 初始化本地存储 state
    const [courses, setCourses] = useState<Course[]>(() => {
        const saved = localStorage.getItem('xinghe_courses_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) {
                console.error('Failed to parse courses data', e);
            }
        }
        return DEFAULT_COURSES;
    });

    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [isViewAllOpen, setIsViewAllOpen] = useState(false);
    const [newCourse, setNewCourse] = useState<Partial<Course>>({
        title: '', duration: '', difficulty: '入门', url: '#'
    });

    // 监听 courses 变动并持久化到 localStorage
    useEffect(() => {
        localStorage.setItem('xinghe_courses_data', JSON.stringify(courses));
    }, [courses]);

    // 计算派生状态：优先排置顶，然后按时间倒序
    const sortedCourses = useMemo(() => {
        return [...courses].sort((a, b) => {
            if (a.isPinned !== b.isPinned) {
                return a.isPinned ? -1 : 1;
            }
            return b.createdAt - a.createdAt;
        });
    }, [courses]);

    const handleAddCourse = () => {
        if (!newCourse.title || !newCourse.duration) return;
        const course: Course = {
            id: `course_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            title: newCourse.title.trim(),
            duration: newCourse.duration.trim(),
            difficulty: newCourse.difficulty || '入门',
            url: newCourse.url || '#',
            isPinned: false,
            createdAt: Date.now()
        };
        setCourses(prev => [course, ...prev]);
        setIsAddingCourse(false);
        setNewCourse({ title: '', duration: '', difficulty: '入门', url: '#' });
    };

    return (
        <div className="h-full glass-panel flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">星河多硬件课程与活动</h2>
                {activeTab === 'courses' && (
                    <button
                        onClick={() => setIsViewAllOpen(true)}
                        className="text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center px-3 py-1.5 rounded-full transition-colors border border-gray-200/50"
                    >
                        查看全部 ({sortedCourses.length}) <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                )}
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
                <div className={`absolute inset-0 transition-all duration-300 w-full overflow-y-auto custom-scrollbar pr-2 ${activeTab === 'courses' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
                    <div className="space-y-4 pb-4">
                        {sortedCourses.slice(0, 3).map(course => (
                            <div key={course.id} className="group relative overflow-hidden rounded-xl border border-gray-200/60 bg-gray-50/50 hover:bg-white p-4 hover:shadow-sm hover:border-blue-200 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${course.difficulty === '入门' ? 'bg-green-50 text-green-700 border-green-200' : course.difficulty === '进阶' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                            {course.difficulty}
                                        </span>
                                        {course.isPinned && (
                                            <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded-sm flex items-center border border-amber-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                                <Pin className="w-2.5 h-2.5 mr-0.5 fill-amber-700" /> 置顶
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" /> {course.duration}</span>
                                </div>
                                <h4 className="font-bold text-sm text-gray-900 group-hover:text-[var(--color-tech-blue)] transition-colors pr-14 leading-relaxed">{course.title}</h4>

                                <div className="absolute top-2.5 right-2 flex flex-col gap-1.5 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all z-10 pointer-events-auto">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCourses(prev => prev.map(c => c.id === course.id ? { ...c, isPinned: !c.isPinned } : c));
                                        }}
                                        className={`p-1.5 rounded bg-white shadow-sm border transition-colors ${course.isPinned ? 'text-amber-600 border-amber-200 hover:bg-amber-50' : 'text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800'}`}
                                        title={course.isPinned ? "取消置顶" : "置顶"}
                                    >
                                        <Pin className={`w-3.5 h-3.5 ${course.isPinned ? 'fill-amber-600' : ''}`} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCourses(prev => prev.filter(c => c.id !== course.id));
                                        }}
                                        className="p-1.5 rounded bg-white shadow-sm border border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                        title="删除课程"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(course.url, '_blank');
                                    }}
                                    className="absolute bottom-4 right-4 text-xs font-bold text-[var(--color-tech-blue)] bg-blue-50 px-2 py-1 rounded flex items-center gap-1 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all cursor-pointer z-0 border border-blue-100"
                                >
                                    去学习 <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Events Tab */}
                <div className={`absolute inset-0 transition-all duration-300 w-full ${activeTab === 'events' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-full pointer-events-none'}`}>
                    <div className="space-y-4">
                        {events.map(event => (
                            <div key={event.id} className="group flex gap-4 rounded-xl border border-gray-200/60 bg-gray-50/50 p-4 hover:shadow-sm hover:border-blue-200 transition-all cursor-pointer hover:bg-white">
                                <div className="flex flex-col items-center justify-center shrink-0 w-14 h-14 rounded-lg bg-blue-50 text-[var(--color-tech-blue)] border border-blue-100 group-hover:bg-[var(--color-tech-blue)] group-hover:text-white transition-colors">
                                    <span className="text-[10px] font-bold uppercase">{event.date.split(' ')[0]}</span>
                                    <span className="text-lg font-black leading-tight">{event.date.split(' ')[1]}</span>
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{event.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-gray-200/50 text-[10px]">{event.type}</span>
                                    </div>
                                </div>
                                <button className="self-center p-2 rounded-full hover:bg-blue-50 text-gray-400 hover:text-[var(--color-tech-blue)] transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* View All Modal */}
            {isViewAllOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="glass-panel w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/40 ring-1 ring-black/5 slide-in-from-bottom-4">
                        <div className="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center bg-white/40">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">全部相关课程</h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">共 {sortedCourses.length} 门课程 · 多硬件生态能力进阶</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsAddingCourse(!isAddingCourse)}
                                    className="text-xs font-bold text-[var(--color-tech-blue)] bg-blue-50/80 hover:bg-blue-100 flex items-center px-3 py-1.5 rounded-full transition-colors border border-blue-100"
                                >
                                    {isAddingCourse ? <X className="w-3.5 h-3.5 mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
                                    {isAddingCourse ? '退出' : '添加课程'}
                                </button>
                                <button
                                    onClick={() => setIsViewAllOpen(false)}
                                    className="p-1.5 rounded-full hover:bg-gray-200/80 text-gray-500 hover:text-gray-800 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/30">
                            <div className="space-y-4">
                                {isAddingCourse && (
                                    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/90 to-white/90 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 mb-6">
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                placeholder="课程名称 (例如: 昆仑芯 XPU 分布式训练)"
                                                className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                                value={newCourse.title}
                                                onChange={e => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="时长 (例如: 1.5h)"
                                                    className="w-1/3 px-3 py-2 text-sm text-gray-700 rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                                    value={newCourse.duration}
                                                    onChange={e => setNewCourse(prev => ({ ...prev, duration: e.target.value }))}
                                                />
                                                <select
                                                    className="w-1/3 px-3 py-2 text-sm font-semibold rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white text-gray-700"
                                                    value={newCourse.difficulty}
                                                    onChange={e => setNewCourse(prev => ({ ...prev, difficulty: e.target.value }))}
                                                >
                                                    <option value="入门">入门</option>
                                                    <option value="进阶">进阶</option>
                                                    <option value="高阶">高阶</option>
                                                </select>
                                                <button
                                                    onClick={handleAddCourse}
                                                    disabled={!newCourse.title || !newCourse.duration}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md flex items-center justify-center transition-colors shadow-sm"
                                                >
                                                    <Check className="w-4 h-4 mr-1" /> 保存
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {sortedCourses.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400 font-medium text-sm">
                                        暂无课程数据，请点击右上角添加
                                    </div>
                                ) : (
                                    sortedCourses.map(course => (
                                        <div key={`modal-${course.id}`} className="group relative overflow-hidden rounded-xl border border-gray-200/60 bg-white/60 hover:bg-white p-4 hover:shadow-md hover:border-blue-200 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${course.difficulty === '入门' ? 'bg-green-50 text-green-700 border-green-200' : course.difficulty === '进阶' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                                        {course.difficulty}
                                                    </span>
                                                    {course.isPinned && (
                                                        <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded-sm flex items-center border border-amber-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                                            <Pin className="w-2.5 h-2.5 mr-0.5 fill-amber-700" /> 置顶
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500 font-medium flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" /> {course.duration}</span>
                                            </div>
                                            <h4 className="font-bold text-sm text-gray-900 group-hover:text-[var(--color-tech-blue)] transition-colors pr-14 leading-relaxed">{course.title}</h4>

                                            <div className="absolute top-2.5 right-2 flex flex-col gap-1.5 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all z-10 pointer-events-auto">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCourses(prev => prev.map(c => c.id === course.id ? { ...c, isPinned: !c.isPinned } : c));
                                                    }}
                                                    className={`p-1.5 rounded bg-white shadow-sm border transition-colors ${course.isPinned ? 'text-amber-600 border-amber-200 hover:bg-amber-50' : 'text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800'}`}
                                                    title={course.isPinned ? "取消置顶" : "置顶"}
                                                >
                                                    <Pin className={`w-3.5 h-3.5 ${course.isPinned ? 'fill-amber-600' : ''}`} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCourses(prev => prev.filter(c => c.id !== course.id));
                                                    }}
                                                    className="p-1.5 rounded bg-white shadow-sm border border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                    title="删除课程"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(course.url, '_blank');
                                                }}
                                                className="absolute bottom-4 right-4 text-xs font-bold text-[var(--color-tech-blue)] bg-blue-50 px-2 py-1 rounded flex items-center gap-1 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all cursor-pointer z-0 border border-blue-100"
                                            >
                                                去学习 <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
